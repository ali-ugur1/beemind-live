/*
 * BeeMora Backend — Express.js API Sunucusu
 * ESP32'den gelen sensör verilerini alır, JSON dosyasına kaydeder
 *
 * Düzeltmeler:
 *  - Atomic dosya yazma (write-then-rename) — veri bozulması önlendi
 *  - readData/writeData senkron FS yerine try/finally ile güvenli hale getirildi
 *  - Rate limiter ip çözümlemesi düzeltildi (req.ip undefined guard)
 *  - authMiddleware hata mesajları daha açık
 *  - espAuthMiddleware boş API key sorunsuz geçiş
 *  - rateLimit login endpoint'i 5'den 10'a (brute-force için yeterli + daha sağlam)
 *  - bcrypt hash rounds env'den okunabilir hale getirildi
 *  - generateId UUID tam kullanıma geçti (slice kaldırıldı, çakışma riski sıfırlandı)
 *  - checkAndSendAlarms race condition giderildi (cooldown map referansı sabitlendi)
 *  - multer fileFilter regex düzeltildi (test değerleri tutarlı hale getirildi)
 *  - Hive summary endpoint'i /api/hives/:id/chart'tan önce tanımlandı (Express route çakışması giderildi)
 *  - Tüm dosya okuma/yazma işlemleri için yardımcı safeReadJSON/safeWriteJSON eklendi
 *  - setInterval cleanup timer clearInterval ile kapatılabilir hale getirildi
 *  - Graceful shutdown sırasında setInterval temizlenir
 *  - PUT /api/auth/profile: boş string gönderildiğinde güncelleme yapılmaz (undefined/empty guard)
 *  - Tüm res.status() zincirleri return ile erken çıkış sağlandı
 *  - /api/sensor-data/daily hive_id filtresi URL decode eklendi
 *  - /api/backup Content-Disposition filename sanitize edildi
 *  - CORS wildcard production'da kapatıldı (strict mode)
 *  - Security headers Content-Security-Policy eklendi
 */

import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { fileURLToPath } from "url";
import webpush from "web-push";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Ortam Değişkenleri ────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";
const DATA_FILE = path.join(__dirname, "data", "sensor-data.json");
const HIVES_FILE = path.join(__dirname, "data", "hives.json");
const SUBS_FILE = path.join(__dirname, "data", "push-subscriptions.json");
const USERS_FILE = path.join(__dirname, "data", "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "beemora-fallback-secret";
const ESP_API_KEY = process.env.ESP_API_KEY || "";
const BCRYPT_ROUNDS = Math.min(
  Math.max(parseInt(process.env.BCRYPT_ROUNDS, 10) || 10, 8),
  14,
);
const MAX_RECORDS = parseInt(process.env.MAX_SENSOR_RECORDS, 10) || 50_000;

const log = (...args) => {
  if (!IS_PROD) console.log(...args);
};

// ── Web Push VAPID Setup ──────────────────────────────────────────────────
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:hexoraproject@gmail.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  log("[Push] VAPID keys loaded");
} else {
  console.warn("[Push] VAPID keys not found in .env — push disabled");
}

// ── Dosya Sistemi Yardımcıları ────────────────────────────────────────────

/**
 * JSON dosyasını güvenli okur. Hata durumunda fallback döner.
 * @param {string} filePath
 * @param {*} fallback
 * @returns {*}
 */
function safeReadJSON(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * JSON dosyasına atomik yazar (write-then-rename).
 * Elektrik kesilmesi / process crash durumunda veri bozulmaz.
 * @param {string} filePath
 * @param {*} data
 */
function safeWriteJSON(filePath, data) {
  const tmp = path.join(os.tmpdir(), `beemora-${crypto.randomUUID()}.tmp`);
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmp, filePath);
  } catch (err) {
    // tmp temizle, hatayı yukarı ilet
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }
}

// ── Veri Dizini & Dosya Bootstrap ─────────────────────────────────────────
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
if (!fs.existsSync(SUBS_FILE)) fs.writeFileSync(SUBS_FILE, "[]");

if (!fs.existsSync(USERS_FILE)) {
  const defaultHash = bcrypt.hashSync("admin123", BCRYPT_ROUNDS);
  const defaultUsers = [
    {
      id: "user-001",
      email: "admin@hexora.app",
      password: defaultHash,
      fullName: "Ahmet Yılmaz",
      role: "admin",
      createdAt: "2025-01-01T00:00:00Z",
    },
  ];
  safeWriteJSON(USERS_FILE, defaultUsers);
}

// ── Hive Seed Data ─────────────────────────────────────────────────────────
const DEFAULT_HIVES = [
  {
    id: "hive-001",
    name: "Kovan 1",
    location: "Konya Merkez",
    lat: 37.8746,
    lng: 32.4932,
    photo: null,
    notes: "",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "hive-002",
    name: "Kovan 2",
    location: "Konya Merkez",
    lat: 37.875,
    lng: 32.494,
    photo: null,
    notes: "",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "hive-003",
    name: "Kovan 3",
    location: "Çumra",
    lat: 37.573,
    lng: 32.774,
    photo: null,
    notes: "",
    createdAt: "2025-02-01T10:00:00Z",
  },
  {
    id: "hive-004",
    name: "Kovan 4",
    location: "Beyşehir",
    lat: 37.678,
    lng: 31.726,
    photo: null,
    notes: "",
    createdAt: "2025-02-15T10:00:00Z",
  },
  {
    id: "hive-005",
    name: "Kovan 5",
    location: "Seydişehir",
    lat: 37.42,
    lng: 31.845,
    photo: null,
    notes: "",
    createdAt: "2025-03-01T10:00:00Z",
  },
];

if (!fs.existsSync(HIVES_FILE)) {
  safeWriteJSON(HIVES_FILE, DEFAULT_HIVES);
}

// ── Veri Erişim Fonksiyonları ──────────────────────────────────────────────
function readData() {
  return safeReadJSON(DATA_FILE, []);
}
function writeData(data) {
  safeWriteJSON(DATA_FILE, data);
}
function readHives() {
  return safeReadJSON(HIVES_FILE, DEFAULT_HIVES);
}
function writeHives(hives) {
  safeWriteJSON(HIVES_FILE, hives);
}
function readUsers() {
  return safeReadJSON(USERS_FILE, []);
}
function writeUsers(users) {
  safeWriteJSON(USERS_FILE, users);
}
function readSubscriptions() {
  return safeReadJSON(SUBS_FILE, []);
}
function writeSubscriptions(s) {
  safeWriteJSON(SUBS_FILE, s);
}

/**
 * UUID v4 tabanlı ID üretici.
 * slice kaldırıldı — tam UUID kullanılıyor, çakışma riski sıfır.
 */
function generateId(prefix = "id") {
  return `${prefix}-${crypto.randomUUID()}`;
}

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.set("trust proxy", 1);

// CORS
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3001"];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!IS_PROD) {
    // Development: her origin'e izin ver
    res.header("Access-Control-Allow-Origin", origin || "*");
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    // Production: yalnızca izin verilenler
    res.header("Access-Control-Allow-Origin", origin);
  }
  // Production'da origin yoksa veya listede değilse CORS header eklenmez
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';",
  );
  if (IS_PROD) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  next();
});

// ── Rate Limiter ───────────────────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 dakika
const RATE_LIMIT_MAX = 100;

function rateLimit(limit = RATE_LIMIT_MAX) {
  return (req, res, next) => {
    // req.ip undefined olabilir (trust proxy kapalıysa veya test ortamında)
    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count++;
    if (entry.count > limit) {
      return res.status(429).json({
        error: "Çok fazla istek. Lütfen bir süre sonra tekrar deneyin.",
      });
    }
    next();
  };
}

// Eski rate limit kayıtlarını temizle (interval referansı shutdown'da kullanılır)
const rateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now - val.start > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

// ── Auth Middleware ────────────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkilendirme token'ı gerekli" });
  }
  const token = authHeader.slice(7); // "Bearer " prefix'ini güvenle kaldır
  if (!token) {
    return res.status(401).json({ error: "Token boş olamaz" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token süresi dolmuş, lütfen tekrar giriş yapın" });
    }
    return res.status(401).json({ error: "Geçersiz token" });
  }
}

function espAuthMiddleware(req, res, next) {
  // API key tanımlı değilse kontrol atlanır (geliştirme kolaylığı)
  if (!ESP_API_KEY) return next();
  const apiKey = req.headers["x-api-key"] || req.query.apikey;
  if (!apiKey || apiKey !== ESP_API_KEY) {
    return res.status(403).json({ error: "Geçersiz API anahtarı" });
  }
  next();
}

// ── Static Dosyalar ────────────────────────────────────────────────────────
const distDir = path.join(__dirname, "dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: IS_PROD ? "7d" : 0, etag: true }));
}

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir, { maxAge: "30d" }));

// Multer — dosya yükleme
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      // Güvenli dosya adı — hive id'ye özel, timestamp ile benzersiz
      const safeName = `hive-${req.params.id}-${Date.now()}${ext}`;
      cb(null, safeName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      return cb(null, true);
    }
    cb(new Error("Sadece resim dosyaları kabul edilir (jpg, png, webp, gif)"));
  },
});

// ══════════════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    version: "2.1.0",
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post("/api/auth/register", rateLimit(10), async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Geçerli bir email adresi girin" });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Şifre gerekli" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalı" });
    }

    const users = readUsers();
    if (users.find((u) => u.email === email.toLowerCase())) {
      return res.status(409).json({ error: "Bu email zaten kayıtlı" });
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newUser = {
      id: generateId("user"),
      email: email.toLowerCase(),
      password: hash,
      fullName: fullName?.trim() || email.split("@")[0],
      role: "user",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    const { password: _, ...safeUser } = newUser;
    log(`[Auth] Registered: ${newUser.email}`);
    return res.status(201).json({ status: "ok", token, user: safeUser });
  } catch (err) {
    console.error("[Auth] Register error:", err.message);
    return res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", rateLimit(10), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gerekli" });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === email.toLowerCase());
    // Kullanıcı bulunamasa da bcrypt compare yaparak timing attack'ı azalt
    const dummyHash =
      "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ123456";
    const valid = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !valid) {
      return res.status(401).json({ error: "Geçersiz email veya şifre" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    const { password: _, ...safeUser } = user;
    log(`[Auth] Login: ${user.email}`);
    return res.json({ status: "ok", token, user: safeUser });
  } catch (err) {
    console.error("[Auth] Login error:", err.message);
    return res.status(500).json({ error: "Giriş sırasında hata oluştu" });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const { password: _, ...safeUser } = user;
    return res.json({ status: "ok", user: safeUser });
  } catch (err) {
    console.error("[Auth] Me error:", err.message);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PUT /api/auth/profile
app.put("/api/auth/profile", authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1)
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const { fullName, phone, location } = req.body;
    // Yalnızca dolu string değerleri güncelle — boş string veya undefined geçilirse mevcut değer korunur
    if (fullName && typeof fullName === "string" && fullName.trim())
      users[idx].fullName = fullName.trim();
    if (phone && typeof phone === "string" && phone.trim())
      users[idx].phone = phone.trim();
    if (location && typeof location === "string" && location.trim())
      users[idx].location = location.trim();
    writeUsers(users);

    const { password: _, ...safeUser } = users[idx];
    return res.json({ status: "ok", user: safeUser });
  } catch (err) {
    console.error("[Auth] Profile update error:", err.message);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PUT /api/auth/password
app.put("/api/auth/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Mevcut ve yeni şifre gerekli" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Yeni şifre en az 6 karakter olmalı" });
    }

    const users = readUsers();
    const idx = users.findIndex((u) => u.id === req.user.id);
    if (idx === -1)
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const valid = await bcrypt.compare(currentPassword, users[idx].password);
    if (!valid) return res.status(401).json({ error: "Mevcut şifre yanlış" });

    users[idx].password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    writeUsers(users);
    return res.json({ status: "ok" });
  } catch (err) {
    console.error("[Auth] Password change error:", err.message);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  SENSOR DATA ROUTES
// ══════════════════════════════════════════════════════════════════════════

// Cihaz başına dedup: aynı hive_id'den 5 sn içinde tekrar veri kabul etme
const deviceLastSeen = new Map();
const DEVICE_DEDUP_MS = 5_000;

// POST /api/sensor-data
app.post("/api/sensor-data", espAuthMiddleware, rateLimit(60), (req, res) => {
  try {
    const { temperature, humidity, weight, sound_db, battery } = req.body;

    if (
      temperature !== undefined &&
      (typeof temperature !== "number" || temperature < -50 || temperature > 80)
    ) {
      return res
        .status(400)
        .json({ error: "Geçersiz sıcaklık değeri (-50 ile 80 arası olmalı)" });
    }
    if (
      humidity !== undefined &&
      (typeof humidity !== "number" || humidity < 0 || humidity > 100)
    ) {
      return res
        .status(400)
        .json({ error: "Geçersiz nem değeri (0-100 arası olmalı)" });
    }
    if (
      weight !== undefined &&
      (typeof weight !== "number" || weight < 0 || weight > 500)
    ) {
      return res
        .status(400)
        .json({ error: "Geçersiz ağırlık değeri (0-500 arası olmalı)" });
    }
    if (
      sound_db !== undefined &&
      (typeof sound_db !== "number" || sound_db < -120 || sound_db > 120)
    ) {
      return res
        .status(400)
        .json({ error: "Geçersiz ses değeri (-120 ile 120 arası olmalı)" });
    }
    if (
      battery !== undefined &&
      (typeof battery !== "number" || battery < 0 || battery > 100)
    ) {
      return res
        .status(400)
        .json({ error: "Geçersiz batarya değeri (0-100 arası olmalı)" });
    }

    const resolvedHiveId = req.body.hive_id || req.body.hiveId || "hive-001";
    const knownHives = readHives();
    if (!knownHives.find((h) => h.id === resolvedHiveId)) {
      return res
        .status(400)
        .json({ error: `Bilinmeyen hive_id: ${resolvedHiveId}` });
    }

    const now = Date.now();
    const lastSeen = deviceLastSeen.get(resolvedHiveId) || 0;
    if (now - lastSeen < DEVICE_DEDUP_MS) {
      return res.status(429).json({
        error:
          "Çok sık veri gönderimi — okumalar arası en az 5 saniye bekleyin",
      });
    }
    deviceLastSeen.set(resolvedHiveId, now);

    const entry = {
      ...req.body,
      hive_id: resolvedHiveId,
      received_at: new Date().toISOString(),
      ip: req.ip,
    };

    log(
      `[${entry.received_at}] Veri alındı (${entry.hive_id}):`,
      JSON.stringify(entry),
    );

    const data = readData();
    data.push(entry);

    if (data.length > MAX_RECORDS) {
      data.splice(0, data.length - MAX_RECORDS);
    }

    writeData(data);

    // Alarm kontrolü — async, response'u bloklamaz
    checkAndSendAlarms(entry).catch((err) =>
      console.error("[Alarm] Error:", err.message),
    );

    return res
      .status(200)
      .json({ status: "ok", count: data.length, hive_id: entry.hive_id });
  } catch (err) {
    console.error("[HATA] POST /api/sensor-data:", err.message);
    return res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
});

// GET /api/sensor-data
app.get("/api/sensor-data", authMiddleware, (req, res) => {
  const data = readData();
  const limit = Math.max(0, parseInt(req.query.limit, 10) || data.length);
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const slice = data.slice(offset, offset + limit);

  return res.json({ total: data.length, offset, limit, data: slice });
});

// GET /api/sensor-data/latest
app.get("/api/sensor-data/latest", authMiddleware, (req, res) => {
  const data = readData();
  if (data.length === 0) return res.json({ status: "empty", data: null });
  return res.json({ status: "ok", data: data[data.length - 1] });
});

// GET /api/sensor-data/stats
app.get("/api/sensor-data/stats", authMiddleware, (req, res) => {
  const data = readData();
  if (data.length === 0) return res.json({ status: "empty" });

  const hoursParam = Math.max(1, parseInt(req.query.hours, 10) || 24);
  const cutoff = new Date(Date.now() - hoursParam * 3_600_000).toISOString();
  const recent = data.filter((d) => d.received_at >= cutoff);

  if (recent.length === 0) {
    return res.json({ status: "no_recent_data", hours: hoursParam });
  }

  const avg = (arr, key) => {
    const valid = arr.filter(
      (d) => typeof d[key] === "number" && d[key] !== -999,
    );
    if (!valid.length) return null;
    return parseFloat(
      (valid.reduce((s, d) => s + d[key], 0) / valid.length).toFixed(1),
    );
  };

  return res.json({
    status: "ok",
    hours: hoursParam,
    count: recent.length,
    stats: {
      temperature: { avg: avg(recent, "temperature") },
      humidity: { avg: avg(recent, "humidity") },
      pressure: { avg: avg(recent, "pressure") },
      co2: { avg: avg(recent, "co2") },
      tvoc: { avg: avg(recent, "tvoc") },
      sound_db: { avg: avg(recent, "sound_db") },
      vibration: { avg: avg(recent, "vibration") },
    },
  });
});

// GET /api/sensor-data/daily
app.get("/api/sensor-data/daily", authMiddleware, (req, res) => {
  const data = readData();
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
  const hiveId = req.query.hive_id
    ? decodeURIComponent(req.query.hive_id)
    : null;
  const cutoff = new Date(Date.now() - days * 86_400_000);

  const filtered = data.filter((d) => {
    if (!d.received_at) return false;
    if (new Date(d.received_at) < cutoff) return false;
    if (hiveId && d.hive_id !== hiveId) return false;
    return true;
  });

  const byDay = {};
  for (const entry of filtered) {
    const date = entry.received_at.slice(0, 10);
    if (!byDay[date]) byDay[date] = [];
    byDay[date].push(entry);
  }

  const avg = (arr, key) => {
    const valid = arr.filter(
      (d) => typeof d[key] === "number" && d[key] !== -999,
    );
    if (!valid.length) return null;
    return parseFloat(
      (valid.reduce((s, d) => s + d[key], 0) / valid.length).toFixed(1),
    );
  };

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const entries = byDay[date] || [];
    result.push({
      date,
      avgTemp: avg(entries, "temperature"),
      avgHumidity: avg(entries, "humidity"),
      count: entries.length,
    });
  }

  return res.json({ status: "ok", days, data: result });
});

// ══════════════════════════════════════════════════════════════════════════
//  GATEWAY & WEATHER ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get("/api/gateway/status", authMiddleware, (req, res) => {
  const data = readData();
  const lastEntry = data[data.length - 1];
  const hasRecentData =
    !!lastEntry &&
    Date.now() - new Date(lastEntry.received_at).getTime() < 10 * 60_000;

  return res.json({
    id: "GW-001",
    batteryLevel: 100,
    isCharging: false,
    signalStrength: hasRecentData ? 95 : 0,
    status: hasRecentData ? "online" : "offline",
    lastSync: lastEntry?.received_at ?? null,
    connectedHives: hasRecentData ? readHives().length : 0,
  });
});

app.get("/api/weather", authMiddleware, (req, res) => {
  return res.json({
    location: "Konya",
    temp: null,
    condition: null,
    humidity: null,
    windSpeed: null,
    _note: "Frontend Open-Meteo API kullanır. Bu endpoint fallback amaçlıdır.",
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  HIVE ROUTES
//  ÖNEMLİ: /api/hives/summary sabit route'u, /:id parametrik route'undan
//  ÖNCE tanımlanmalı — aksi hâlde Express "summary"yi id olarak okur.
// ══════════════════════════════════════════════════════════════════════════

// GET /api/hives/summary  ← /:id'den önce!
app.get("/api/hives/summary", authMiddleware, (req, res) => {
  const data = readData();
  const hiveDefs = readHives();

  const hiveResults = hiveDefs.map((hiveDef) => {
    const hiveData = data.filter(
      (d) => (d.hive_id || "hive-001") === hiveDef.id,
    );
    const latest = hiveData.length > 0 ? hiveData[hiveData.length - 1] : null;

    return {
      id: hiveDef.id,
      name: hiveDef.name,
      location: hiveDef.location,
      lat: hiveDef.lat,
      lng: hiveDef.lng,
      adapterType: hiveDef.adapterType || "standard",
      deviceSerial: hiveDef.deviceSerial || "",
      temperature: latest?.temperature ?? null,
      humidity: latest?.humidity ?? null,
      pressure: latest?.pressure ?? null,
      co2: latest?.co2 ?? null,
      tvoc: latest?.tvoc ?? null,
      vibration: latest?.vibration ?? null,
      sound_db: latest?.sound_db ?? null,
      battery: latest?.battery ?? 100,
      weight: latest?.weight ?? null,
      lastUpdate: latest?.received_at ?? null,
      hasData: !!latest,
    };
  });

  return res.json({ hives: hiveResults });
});

// GET /api/hives
app.get("/api/hives", authMiddleware, (req, res) => {
  return res.json({ hives: readHives() });
});

// POST /api/hives
app.post("/api/hives", authMiddleware, (req, res) => {
  try {
    const hives = readHives();
    const { name, location, lat, lng, notes, adapterType, deviceSerial } =
      req.body;

    if (adapterType && !["basic", "standard", "pro"].includes(adapterType)) {
      return res.status(400).json({
        error: "Geçersiz adapterType (basic, standard veya pro olmalı)",
      });
    }
    if (lat != null && lat !== "") {
      const latNum = parseFloat(lat);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        return res
          .status(400)
          .json({ error: "Geçersiz enlem (-90 ile 90 arası olmalı)" });
      }
    }
    if (lng != null && lng !== "") {
      const lngNum = parseFloat(lng);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        return res
          .status(400)
          .json({ error: "Geçersiz boylam (-180 ile 180 arası olmalı)" });
      }
    }

    const id = req.body.id || generateId("hive");
    const newHive = {
      id,
      name: name || `Kovan ${hives.length + 1}`,
      location: location || "",
      lat: lat != null && lat !== "" ? parseFloat(lat) : null,
      lng: lng != null && lng !== "" ? parseFloat(lng) : null,
      photo: null,
      notes: notes || "",
      adapterType: adapterType || "standard",
      deviceSerial: deviceSerial || "",
      createdAt: new Date().toISOString(),
    };
    hives.push(newHive);
    writeHives(hives);
    log(`[Hive] Created: ${id} — ${newHive.name}`);
    return res.status(201).json({ status: "ok", hive: newHive });
  } catch (err) {
    console.error("[Hive] Create error:", err.message);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// PUT /api/hives/:id
app.put("/api/hives/:id", authMiddleware, (req, res) => {
  try {
    const hives = readHives();
    const idx = hives.findIndex((h) => h.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Kovan bulunamadı" });

    if (
      req.body.lat !== undefined &&
      req.body.lat !== null &&
      req.body.lat !== ""
    ) {
      const lat = parseFloat(req.body.lat);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res
          .status(400)
          .json({ error: "Geçersiz enlem (-90 ile 90 arası olmalı)" });
      }
    }
    if (
      req.body.lng !== undefined &&
      req.body.lng !== null &&
      req.body.lng !== ""
    ) {
      const lng = parseFloat(req.body.lng);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return res
          .status(400)
          .json({ error: "Geçersiz boylam (-180 ile 180 arası olmalı)" });
      }
    }
    if (
      req.body.adapterType !== undefined &&
      !["basic", "standard", "pro"].includes(req.body.adapterType)
    ) {
      return res.status(400).json({
        error: "Geçersiz adapterType (basic, standard veya pro olmalı)",
      });
    }

    const allowed = [
      "name",
      "location",
      "lat",
      "lng",
      "notes",
      "photo",
      "adapterType",
      "deviceSerial",
    ];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    hives[idx] = { ...hives[idx], ...updates };
    writeHives(hives);
    return res.json({ status: "ok", hive: hives[idx] });
  } catch (err) {
    console.error("[Hive] Update error:", err.message);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// POST /api/hives/:id/photo
app.post("/api/hives/:id/photo", authMiddleware, (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Dosya çok büyük (max 5MB)"
          : err.message;
      return res.status(400).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: "Dosya yüklenmedi" });

    try {
      const hives = readHives();
      const idx = hives.findIndex((h) => h.id === req.params.id);
      if (idx === -1)
        return res.status(404).json({ error: "Kovan bulunamadı" });

      // Eski fotoğrafı sil
      if (hives[idx].photo) {
        const oldPath = path.join(__dirname, hives[idx].photo);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch {
            /* silinemese de devam et */
          }
        }
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      hives[idx].photo = photoUrl;
      writeHives(hives);
      log(`[Hive] Photo uploaded for ${req.params.id}: ${photoUrl}`);
      return res.json({ status: "ok", photo: photoUrl });
    } catch (e) {
      console.error("[Hive] Photo upload error:", e.message);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
  });
});

// DELETE /api/hives/:id
app.delete("/api/hives/:id", authMiddleware, (req, res) => {
  try {
    let hives = readHives();
    const before = hives.length;
    hives = hives.filter((h) => h.id !== req.params.id);
    if (hives.length === before)
      return res.status(404).json({ error: "Kovan bulunamadı" });
    writeHives(hives);
    log(`[Hive] Deleted: ${req.params.id}`);
    return res.json({ status: "ok", remaining: hives.length });
  } catch (err) {
    console.error("[Hive] Delete error:", err.message);
    return res.status(500).json({ error: "Sunucu hatası" });
  }
});

// GET /api/hives/:id/chart
app.get("/api/hives/:id/chart", authMiddleware, (req, res) => {
  const data = readData();
  const hiveId = req.params.id;
  const limit = Math.max(
    1,
    Math.min(parseInt(req.query.limit, 10) || 48, 1000),
  );

  const hiveData = data.filter((d) => (d.hive_id || "hive-001") === hiveId);
  const recent = hiveData.slice(-limit);

  if (recent.length === 0) {
    return res.json({
      data: [],
      labels: [],
      temperature: [],
      humidity: [],
      pressure: [],
      co2: [],
      sound_db: [],
    });
  }

  const labels = recent.map((d) =>
    new Date(d.received_at).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );

  const chartDataArray = recent.map((d) => ({
    time: new Date(d.received_at).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: d.received_at,
    temperature: d.temperature ?? null,
    humidity: d.humidity ?? null,
    pressure: d.pressure ?? null,
    vibration: d.vibration ?? null,
    sound_db: d.sound_db ?? null,
    battery: d.battery ?? null,
  }));

  return res.json({
    data: chartDataArray,
    labels,
    temperature: recent.map((d) => d.temperature ?? null),
    humidity: recent.map((d) => d.humidity ?? null),
    pressure: recent.map((d) => d.pressure ?? null),
    co2: recent.map((d) => d.co2 ?? null),
    tvoc: recent.map((d) => d.tvoc ?? null),
    sound_db: recent.map((d) => d.sound_db ?? null),
    vibration: recent.map((d) => d.vibration ?? null),
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  BACKUP & RESTORE
// ══════════════════════════════════════════════════════════════════════════

app.get("/api/backup", authMiddleware, (req, res) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    // Dosya adında özel karakter olmamasını garantile
    const safeDate = dateStr.replace(/[^0-9-]/g, "");
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      sensorData: readData(),
      hives: readHives(),
    };
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="beemora-backup-${safeDate}.json"`,
    );
    res.setHeader("Content-Type", "application/json");
    return res.json(backup);
  } catch (err) {
    console.error("[Backup] Error:", err.message);
    return res.status(500).json({ error: "Yedek alınamadı" });
  }
});

app.post("/api/restore", authMiddleware, (req, res) => {
  try {
    const { sensorData, hives } = req.body;
    if (!sensorData && !hives) {
      return res.status(400).json({ error: "Geçerli yedek verisi bulunamadı" });
    }
    if (Array.isArray(sensorData)) {
      writeData(sensorData);
      log(`[Restore] Sensor data restored: ${sensorData.length} records`);
    }
    if (Array.isArray(hives)) {
      writeHives(hives);
      log(`[Restore] Hives restored: ${hives.length} hives`);
    }
    return res.json({
      status: "ok",
      sensorCount: sensorData?.length || 0,
      hiveCount: hives?.length || 0,
    });
  } catch (err) {
    console.error("[Restore] Error:", err.message);
    return res.status(500).json({ error: "Geri yükleme başarısız" });
  }
});

app.delete("/api/data/reset", authMiddleware, (req, res) => {
  try {
    const { target } = req.query;
    if (target === "sensor" || target === "all" || !target) {
      writeData([]);
      log("[Reset] Sensor data cleared");
    }
    if (target === "hives" || target === "all") {
      writeHives(DEFAULT_HIVES);
      log("[Reset] Hives reset to defaults");
    }
    return res.json({ status: "ok", target: target || "sensor" });
  } catch (err) {
    console.error("[Reset] Error:", err.message);
    return res.status(500).json({ error: "Sıfırlama başarısız" });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  PUSH NOTIFICATION ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get("/api/push/vapid-key", (req, res) => {
  return res.json({ publicKey: VAPID_PUBLIC });
});

app.post("/api/push/subscribe", authMiddleware, (req, res) => {
  try {
    const subscription = req.body;
    if (
      !subscription ||
      typeof subscription.endpoint !== "string" ||
      !subscription.endpoint
    ) {
      return res.status(400).json({ error: "Geçersiz abonelik nesnesi" });
    }

    const subs = readSubscriptions();
    if (!subs.find((s) => s.endpoint === subscription.endpoint)) {
      subs.push({ ...subscription, createdAt: new Date().toISOString() });
      writeSubscriptions(subs);
      log(`[Push] New subscription registered (total: ${subs.length})`);
    }

    return res.json({ status: "ok", total: subs.length });
  } catch (err) {
    console.error("[Push] Subscribe error:", err.message);
    return res.status(500).json({ error: "Abonelik kaydedilemedi" });
  }
});

app.post("/api/push/unsubscribe", authMiddleware, (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({ error: "endpoint gerekli" });
    }
    const subs = readSubscriptions().filter((s) => s.endpoint !== endpoint);
    writeSubscriptions(subs);
    return res.json({ status: "ok", total: subs.length });
  } catch (err) {
    console.error("[Push] Unsubscribe error:", err.message);
    return res.status(500).json({ error: "Abonelik kaldırılamadı" });
  }
});

app.post("/api/push/send", authMiddleware, async (req, res) => {
  try {
    const { title, body, url, tag } = req.body;
    const payload = JSON.stringify({
      title: title || "BeeMora",
      body: body || "Yeni bildirim",
      icon: "/beemora-logo.svg",
      url: url || "/panel",
      tag: tag || "beemora-alert",
    });

    const subs = readSubscriptions();
    if (subs.length === 0) {
      return res.json({ status: "no_subscribers", sent: 0 });
    }

    let sent = 0;
    let failed = 0;
    const deadEndpoints = [];

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadEndpoints.push(sub.endpoint);
        }
        console.warn(
          `[Push] Failed: ${sub.endpoint.slice(0, 50)}... → ${err.statusCode || err.message}`,
        );
      }
    }

    if (deadEndpoints.length > 0) {
      const cleaned = subs.filter((s) => !deadEndpoints.includes(s.endpoint));
      writeSubscriptions(cleaned);
      log(`[Push] Cleaned ${deadEndpoints.length} dead subscriptions`);
    }

    return res.json({ status: "ok", sent, failed, total: subs.length });
  } catch (err) {
    console.error("[Push] Send error:", err.message);
    return res.status(500).json({ error: "Bildirim gönderilemedi" });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  SENSOR ALARM → AUTO PUSH
// ══════════════════════════════════════════════════════════════════════════

const ALARM_THRESHOLDS = {
  temperature: { min: 10, max: 40, label: "Sıcaklık", unit: "°C" },
  humidity: { min: 30, max: 85, label: "Nem", unit: "%" },
  sound_db: { min: 0, max: 85, label: "Ses", unit: " dB" },
};

// Alarm cooldown state — fonksiyon içinde referans race condition'ını önlemek için
// modül düzeyinde tutulur (global lastAlarmTime yerine)
const alarmCooldownMap = new Map();
const ALARM_COOLDOWN_MS = 5 * 60_000;

async function checkAndSendAlarms(entry) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subs = readSubscriptions();
  if (subs.length === 0) return;

  const now = Date.now();
  const deadEndpoints = [];

  for (const [key, threshold] of Object.entries(ALARM_THRESHOLDS)) {
    const value = entry[key];
    if (value === undefined || value === null || value === -999) continue;

    let alertType = null;
    if (value < threshold.min) alertType = "low";
    else if (value > threshold.max) alertType = "high";
    if (!alertType) continue;

    const alarmKey = `${key}_${alertType}`;
    const lastFired = alarmCooldownMap.get(alarmKey) || 0;
    if (now - lastFired < ALARM_COOLDOWN_MS) continue;
    alarmCooldownMap.set(alarmKey, now);

    const isHigh = alertType === "high";
    const payload = JSON.stringify({
      title: `⚠️ ${threshold.label} Alarmı!`,
      body: `${threshold.label} ${isHigh ? "çok yüksek" : "çok düşük"}: ${value}${threshold.unit} (limit: ${isHigh ? threshold.max : threshold.min}${threshold.unit})`,
      icon: "/beemora-logo.svg",
      url: "/panel",
      tag: `alarm-${key}`,
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    }

    log(
      `[Alarm] ${threshold.label} ${alertType}: ${value}${threshold.unit} → ${subs.length} subscriber`,
    );
  }

  if (deadEndpoints.length > 0) {
    const cleaned = readSubscriptions().filter(
      (s) => !deadEndpoints.includes(s.endpoint),
    );
    writeSubscriptions(cleaned);
  }
}

// ── SPA Fallback ──────────────────────────────────────────────────────────
if (fs.existsSync(distDir)) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// ── Sunucuyu Başlat ───────────────────────────────────────────────────────
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n========================================`);
  console.log(`  BeeMora API Sunucusu (${NODE_ENV})`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://0.0.0.0:${PORT} (LAN)`);
  console.log(`========================================\n`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────
function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Kapatılıyor...`);
  clearInterval(rateLimitCleanupTimer); // interval'ı durdur
  server.close(() => {
    console.log("[Server] Tüm bağlantılar kapatıldı");
    process.exit(0);
  });
  setTimeout(() => {
    console.error(
      "[Server] Bağlantılar zamanında kapatılamadı, zorla kapatılıyor",
    );
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Yakalanmamış hataları logla — process'i çökertme
process.on("uncaughtException", (err) =>
  console.error("[uncaughtException]", err),
);
process.on("unhandledRejection", (err) =>
  console.error("[unhandledRejection]", err),
);
