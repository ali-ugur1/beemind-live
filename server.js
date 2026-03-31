/*
 * Hexora Backend — Express.js API Sunucusu
 * ESP32'den gelen sensör verilerini alır, JSON dosyasına kaydeder
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import webpush from 'web-push';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DATA_FILE = path.join(__dirname, 'data', 'sensor-data.json');
const HIVES_FILE = path.join(__dirname, 'data', 'hives.json');
const SUBS_FILE = path.join(__dirname, 'data', 'push-subscriptions.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'hexora-fallback-secret';
const ESP_API_KEY = process.env.ESP_API_KEY || '';

// ── Web Push VAPID Setup ──────────────────────────────────────────────
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hexoraproject@gmail.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  console.log('[Push] VAPID keys loaded');
} else {
  console.warn('[Push] VAPID keys not found in .env — push disabled');
}

// ── Middleware ─────────────────────────────────────────────────────────

// JSON body parser
app.use(express.json({ limit: '10mb' }));

// Trust proxy (Nginx arkasında gerekli)
app.set('trust proxy', 1);

// CORS
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3001'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (NODE_ENV === 'development' || !origin || ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

function rateLimit(limit = RATE_LIMIT_MAX) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count++;
    if (entry.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now - val.start > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// Auth middleware — JWT token doğrulama
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token gerekli' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş' });
    }
    return res.status(401).json({ error: 'Geçersiz token' });
  }
}

// ESP32 API Key middleware
function espAuthMiddleware(req, res, next) {
  if (!ESP_API_KEY) return next();
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (apiKey !== ESP_API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  next();
}

// ── Production: Build edilmiş frontend'i sun ─────────────────────────────
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, {
    maxAge: NODE_ENV === 'production' ? '7d' : 0,
    etag: true,
  }));
}

// ── Uploads dizini ───────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir, { maxAge: '30d' }));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `hive-${req.params.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase().replace('.', ''))) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, png, webp, gif) are allowed'));
    }
  },
});

// ── Veri dizinini oluştur ────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
}
if (!fs.existsSync(SUBS_FILE)) {
  fs.writeFileSync(SUBS_FILE, '[]');
}

// Default admin user (password: admin123)
if (!fs.existsSync(USERS_FILE)) {
  const defaultHash = bcrypt.hashSync('admin123', 10);
  const defaultUsers = [
    { id: 'user-001', email: 'admin@hexora.app', password: defaultHash, fullName: 'Ahmet Yılmaz', role: 'admin', createdAt: '2025-01-01T00:00:00Z' },
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); } catch { return []; }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Default hives — seed data
const DEFAULT_HIVES = [
  { id: 'hive-001', name: 'Kovan 1', location: 'Konya Merkez', lat: 37.8746, lng: 32.4932, photo: null, notes: '', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'hive-002', name: 'Kovan 2', location: 'Konya Merkez', lat: 37.8750, lng: 32.4940, photo: null, notes: '', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'hive-003', name: 'Kovan 3', location: 'Çumra', lat: 37.5730, lng: 32.7740, photo: null, notes: '', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'hive-004', name: 'Kovan 4', location: 'Beyşehir', lat: 37.6780, lng: 31.7260, photo: null, notes: '', createdAt: '2025-02-15T10:00:00Z' },
  { id: 'hive-005', name: 'Kovan 5', location: 'Seydişehir', lat: 37.4200, lng: 31.8450, photo: null, notes: '', createdAt: '2025-03-01T10:00:00Z' },
];

if (!fs.existsSync(HIVES_FILE)) {
  fs.writeFileSync(HIVES_FILE, JSON.stringify(DEFAULT_HIVES, null, 2));
}

// ── Yardımcı: veri oku/yaz ──────────────────────────────────────────────
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function readHives() {
  try {
    return JSON.parse(fs.readFileSync(HIVES_FILE, 'utf-8'));
  } catch {
    return DEFAULT_HIVES;
  }
}

function writeHives(hives) {
  fs.writeFileSync(HIVES_FILE, JSON.stringify(hives, null, 2));
}

// UUID-safe ID üretici (çakışma olmaz)
function generateId(prefix = 'id') {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

// ══════════════════════════════════════════════════════════════════════════
//  HEALTH CHECK (PM2 / Nginx monitoring)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    version: '2.0.0',
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', rateLimit(10), async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });
    if (password.length < 6) return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });

    const users = readUsers();
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Bu email zaten kayıtlı' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: generateId('user'),
      email,
      password: hash,
      fullName: fullName || email.split('@')[0],
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = newUser;
    console.log(`[Auth] Registered: ${email}`);
    res.status(201).json({ status: 'ok', token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', rateLimit(20), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email ve şifre gerekli' });

    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Geçersiz email veya şifre' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Geçersiz email veya şifre' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    console.log(`[Auth] Login: ${email}`);
    res.json({ status: 'ok', token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const { password: _, ...safeUser } = user;
    res.json({ status: 'ok', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const { fullName, phone, location } = req.body;
    if (fullName) users[idx].fullName = fullName;
    if (phone) users[idx].phone = phone;
    if (location) users[idx].location = location;
    writeUsers(users);

    const { password: _, ...safeUser } = users[idx];
    res.json({ status: 'ok', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/password — Şifre değiştir
app.put('/api/auth/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Mevcut ve yeni şifre gerekli' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı' });

    const users = readUsers();
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    const valid = await bcrypt.compare(currentPassword, users[idx].password);
    if (!valid) return res.status(401).json({ error: 'Mevcut şifre yanlış' });

    users[idx].password = await bcrypt.hash(newPassword, 10);
    writeUsers(users);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  API ROUTES — SENSOR DATA
// ══════════════════════════════════════════════════════════════════════════

// POST /api/sensor-data — ESP32'den veri al (API key korumalı)
app.post('/api/sensor-data', espAuthMiddleware, rateLimit(60), (req, res) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Veri doğrulama
    const { temperature, humidity, weight, sound_db, battery } = req.body;
    if (temperature !== undefined && (typeof temperature !== 'number' || temperature < -50 || temperature > 80)) {
      return res.status(400).json({ error: 'Invalid temperature value' });
    }
    if (humidity !== undefined && (typeof humidity !== 'number' || humidity < 0 || humidity > 100)) {
      return res.status(400).json({ error: 'Invalid humidity value' });
    }
    if (weight !== undefined && (typeof weight !== 'number' || weight < 0 || weight > 500)) {
      return res.status(400).json({ error: 'Invalid weight value' });
    }
    if (sound_db !== undefined && (typeof sound_db !== 'number' || sound_db < -120 || sound_db > 120)) {
      return res.status(400).json({ error: 'Invalid sound_db value' });
    }
    if (battery !== undefined && (typeof battery !== 'number' || battery < 0 || battery > 100)) {
      return res.status(400).json({ error: 'Invalid battery value' });
    }

    const entry = {
      ...req.body,
      hive_id: req.body.hive_id || 'hive-001',
      received_at: new Date().toISOString(),
      ip: req.ip
    };

    console.log(`[${entry.received_at}] Veri alindi (${entry.hive_id}):`, JSON.stringify(entry));

    const data = readData();
    data.push(entry);

    // Veri boyutu kontrolü — son 50000 kayıt tut
    const MAX_RECORDS = parseInt(process.env.MAX_SENSOR_RECORDS) || 50000;
    if (data.length > MAX_RECORDS) {
      data.splice(0, data.length - MAX_RECORDS);
    }

    writeData(data);

    checkAndSendAlarms(entry).catch(err => console.error('[Alarm] Error:', err.message));

    res.status(200).json({ status: 'ok', count: data.length, hive_id: entry.hive_id });
  } catch (err) {
    console.error('[HATA] POST /api/sensor-data:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/sensor-data — tum verileri getir (auth gerekli)
app.get('/api/sensor-data', authMiddleware, (req, res) => {
  const data = readData();

  const limit = parseInt(req.query.limit) || data.length;
  const offset = parseInt(req.query.offset) || 0;
  const slice = data.slice(offset, offset + limit);

  res.json({
    total: data.length,
    offset,
    limit,
    data: slice
  });
});

// GET /api/sensor-data/latest
app.get('/api/sensor-data/latest', authMiddleware, (req, res) => {
  const data = readData();
  if (data.length === 0) {
    return res.json({ status: 'empty', data: null });
  }
  res.json({ status: 'ok', data: data[data.length - 1] });
});

// GET /api/sensor-data/stats
app.get('/api/sensor-data/stats', authMiddleware, (req, res) => {
  const data = readData();
  if (data.length === 0) {
    return res.json({ status: 'empty' });
  }

  const hoursParam = parseInt(req.query.hours) || 24;
  const cutoff = new Date(Date.now() - hoursParam * 60 * 60 * 1000).toISOString();
  const recent = data.filter(d => d.received_at >= cutoff);

  if (recent.length === 0) {
    return res.json({ status: 'no_recent_data', hours: hoursParam });
  }

  const avg = (arr, key) => {
    const valid = arr.filter(d => d[key] !== undefined && d[key] !== -999);
    if (valid.length === 0) return null;
    return valid.reduce((sum, d) => sum + d[key], 0) / valid.length;
  };

  res.json({
    status: 'ok',
    hours: hoursParam,
    count: recent.length,
    stats: {
      temperature: { avg: avg(recent, 'temperature')?.toFixed(1) },
      humidity:    { avg: avg(recent, 'humidity')?.toFixed(1) },
      pressure:    { avg: avg(recent, 'pressure')?.toFixed(1) },
      co2:         { avg: avg(recent, 'co2')?.toFixed(0) },
      tvoc:        { avg: avg(recent, 'tvoc')?.toFixed(0) },
      sound_db:    { avg: avg(recent, 'sound_db')?.toFixed(1) },
      vibration:   { avg: avg(recent, 'vibration')?.toFixed(0) }
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  GATEWAY & WEATHER ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/gateway/status', authMiddleware, (req, res) => {
  const data = readData();
  const hasRecentData = data.length > 0 &&
    (Date.now() - new Date(data[data.length - 1].received_at).getTime()) < 10 * 60 * 1000;

  res.json({
    id: 'GW-001',
    batteryLevel: 100,
    isCharging: false,
    signalStrength: hasRecentData ? 95 : 0,
    status: hasRecentData ? 'online' : 'offline',
    lastSync: data.length > 0 ? data[data.length - 1].received_at : null,
    connectedHives: hasRecentData ? readHives().length : 0
  });
});

app.get('/api/weather', authMiddleware, (req, res) => {
  res.json({
    location: 'Konya',
    temp: null,
    condition: null,
    humidity: null,
    windSpeed: null,
    _note: 'Frontend Open-Meteo API kullanir. Bu endpoint fallback amaçlıdır.'
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  HIVE CRUD ROUTES (auth korumalı)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/hives', authMiddleware, (req, res) => {
  const hives = readHives();
  res.json({ hives });
});

app.post('/api/hives', authMiddleware, (req, res) => {
  try {
    const hives = readHives();
    const { name, location, lat, lng, notes, adapterType, deviceSerial } = req.body;
    const id = req.body.id || generateId('hive');
    const newHive = {
      id,
      name: name || `Kovan ${hives.length + 1}`,
      location: location || '',
      lat: lat || null,
      lng: lng || null,
      photo: null,
      notes: notes || '',
      adapterType: adapterType || 'standard',
      deviceSerial: deviceSerial || '',
      createdAt: new Date().toISOString(),
    };
    hives.push(newHive);
    writeHives(hives);
    console.log(`[Hive] Created: ${id} — ${newHive.name}`);
    res.status(201).json({ status: 'ok', hive: newHive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hives/:id', authMiddleware, (req, res) => {
  try {
    const hives = readHives();
    const idx = hives.findIndex(h => h.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Hive not found' });
    const allowed = ['name', 'location', 'lat', 'lng', 'notes', 'photo', 'adapterType', 'deviceSerial'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    hives[idx] = { ...hives[idx], ...updates };
    writeHives(hives);
    res.json({ status: 'ok', hive: hives[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hives/:id/photo — Kovan fotoğrafı yükle
app.post('/api/hives/:id/photo', authMiddleware, (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message;
      return res.status(400).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
      const hives = readHives();
      const idx = hives.findIndex(h => h.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Hive not found' });

      // Delete old photo file if exists
      if (hives[idx].photo) {
        const oldPath = path.join(__dirname, hives[idx].photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      hives[idx].photo = photoUrl;
      writeHives(hives);
      console.log(`[Hive] Photo uploaded for ${req.params.id}: ${photoUrl}`);
      res.json({ status: 'ok', photo: photoUrl });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

app.delete('/api/hives/:id', authMiddleware, (req, res) => {
  try {
    let hives = readHives();
    const before = hives.length;
    hives = hives.filter(h => h.id !== req.params.id);
    if (hives.length === before) return res.status(404).json({ error: 'Hive not found' });
    writeHives(hives);
    console.log(`[Hive] Deleted: ${req.params.id}`);
    res.json({ status: 'ok', remaining: hives.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  HIVE DATA ROUTES — Frontend Dashboard
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/hives/summary', authMiddleware, (req, res) => {
  const data = readData();
  const hiveDefs = readHives();

  const hiveResults = hiveDefs.map(hiveDef => {
    const hiveData = data.filter(d => (d.hive_id || 'hive-001') === hiveDef.id);
    const latest = hiveData.length > 0 ? hiveData[hiveData.length - 1] : null;

    return {
      id: hiveDef.id,
      name: hiveDef.name,
      location: hiveDef.location,
      lat: hiveDef.lat,
      lng: hiveDef.lng,
      adapterType: hiveDef.adapterType || 'standard',
      deviceSerial: hiveDef.deviceSerial || '',
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

  res.json({ hives: hiveResults });
});

app.get('/api/hives/:id/chart', authMiddleware, (req, res) => {
  const data = readData();
  const hiveId = req.params.id;
  const limit = parseInt(req.query.limit) || 48;

  const hiveData = data.filter(d => (d.hive_id || 'hive-001') === hiveId);
  const recent = hiveData.slice(-limit);

  if (recent.length === 0) {
    return res.json({ data: [], labels: [], temperature: [], humidity: [], pressure: [], co2: [], sound_db: [] });
  }

  const labels = recent.map(d => {
    const date = new Date(d.received_at);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  });

  const chartDataArray = recent.map(d => ({
    time: new Date(d.received_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    timestamp: d.received_at,
    temperature: d.temperature ?? null,
    humidity: d.humidity ?? null,
    pressure: d.pressure ?? null,
    vibration: d.vibration ?? null,
    sound_db: d.sound_db ?? null,
    battery: d.battery ?? null
  }));

  res.json({
    data: chartDataArray,
    labels,
    temperature: recent.map(d => d.temperature ?? null),
    humidity: recent.map(d => d.humidity ?? null),
    pressure: recent.map(d => d.pressure ?? null),
    co2: recent.map(d => d.co2 ?? null),
    tvoc: recent.map(d => d.tvoc ?? null),
    sound_db: recent.map(d => d.sound_db ?? null),
    vibration: recent.map(d => d.vibration ?? null)
  });
});

// ══════════════════════════════════════════════════════════════════════════
//  BACKUP & RESTORE (auth korumalı)
// ══════════════════════════════════════════════════════════════════════════

app.get('/api/backup', authMiddleware, (req, res) => {
  try {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      sensorData: readData(),
      hives: readHives(),
    };
    res.setHeader('Content-Disposition', `attachment; filename=hexora-backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restore', authMiddleware, (req, res) => {
  try {
    const { sensorData, hives } = req.body;
    if (!sensorData && !hives) {
      return res.status(400).json({ error: 'Geçerli yedek verisi bulunamadı' });
    }
    if (sensorData && Array.isArray(sensorData)) {
      writeData(sensorData);
      console.log(`[Restore] Sensor data restored: ${sensorData.length} records`);
    }
    if (hives && Array.isArray(hives)) {
      writeHives(hives);
      console.log(`[Restore] Hives restored: ${hives.length} hives`);
    }
    res.json({ status: 'ok', sensorCount: sensorData?.length || 0, hiveCount: hives?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/data/reset', authMiddleware, (req, res) => {
  try {
    const { target } = req.query;
    if (target === 'sensor' || target === 'all') {
      writeData([]);
      console.log('[Reset] Sensor data cleared');
    }
    if (target === 'hives' || target === 'all') {
      writeHives(DEFAULT_HIVES);
      console.log('[Reset] Hives reset to defaults');
    }
    if (!target) {
      writeData([]);
      console.log('[Reset] Sensor data cleared (default)');
    }
    res.json({ status: 'ok', target: target || 'sensor' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  PUSH NOTIFICATION ROUTES
// ══════════════════════════════════════════════════════════════════════════

function readSubscriptions() {
  try {
    return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeSubscriptions(subs) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

app.get('/api/push/vapid-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

app.post('/api/push/subscribe', authMiddleware, (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    const subs = readSubscriptions();
    const exists = subs.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      subs.push({ ...subscription, createdAt: new Date().toISOString() });
      writeSubscriptions(subs);
      console.log(`[Push] New subscription registered (total: ${subs.length})`);
    }

    res.json({ status: 'ok', total: subs.length });
  } catch (err) {
    console.error('[Push] Subscribe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/push/unsubscribe', authMiddleware, (req, res) => {
  try {
    const { endpoint } = req.body;
    let subs = readSubscriptions();
    subs = subs.filter(s => s.endpoint !== endpoint);
    writeSubscriptions(subs);
    res.json({ status: 'ok', total: subs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/push/send', authMiddleware, async (req, res) => {
  try {
    const { title, body, url, tag } = req.body;
    const payload = JSON.stringify({
      title: title || 'Hexora',
      body: body || 'Yeni bildirim',
      icon: '/hexora-logo.svg',
      url: url || '/panel',
      tag: tag || 'hexora-alert',
    });

    const subs = readSubscriptions();
    if (subs.length === 0) {
      return res.json({ status: 'no_subscribers', sent: 0 });
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
        console.warn(`[Push] Failed to send to ${sub.endpoint.slice(0, 50)}...: ${err.statusCode || err.message}`);
      }
    }

    if (deadEndpoints.length > 0) {
      const cleaned = subs.filter(s => !deadEndpoints.includes(s.endpoint));
      writeSubscriptions(cleaned);
      console.log(`[Push] Cleaned ${deadEndpoints.length} dead subscriptions`);
    }

    res.json({ status: 'ok', sent, failed, total: subs.length });
  } catch (err) {
    console.error('[Push] Send error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  SENSOR ALARM → AUTO PUSH
// ══════════════════════════════════════════════════════════════════════════

const ALARM_THRESHOLDS = {
  temperature: { min: 10, max: 40, label: 'Sıcaklık' },
  humidity:    { min: 30, max: 85, label: 'Nem' },
  sound_db:    { min: 0,  max: 85, label: 'Ses Seviyesi' },
};

let lastAlarmTime = {};

async function checkAndSendAlarms(entry) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subs = readSubscriptions();
  if (subs.length === 0) return;

  const now = Date.now();
  const COOLDOWN = 5 * 60 * 1000;

  for (const [key, threshold] of Object.entries(ALARM_THRESHOLDS)) {
    const value = entry[key];
    if (value === undefined || value === null || value === -999) continue;

    let alertType = null;
    if (value < threshold.min) alertType = 'low';
    else if (value > threshold.max) alertType = 'high';

    if (!alertType) continue;

    const alarmKey = `${key}_${alertType}`;
    if (lastAlarmTime[alarmKey] && (now - lastAlarmTime[alarmKey]) < COOLDOWN) continue;

    lastAlarmTime[alarmKey] = now;

    const isHigh = alertType === 'high';
    const payload = JSON.stringify({
      title: `⚠️ ${threshold.label} Alarmı!`,
      body: `${threshold.label} ${isHigh ? 'çok yüksek' : 'çok düşük'}: ${value}${key === 'temperature' ? '°C' : key === 'humidity' ? '%' : ' dB'} (${isHigh ? 'max' : 'min'}: ${isHigh ? threshold.max : threshold.min})`,
      icon: '/hexora-logo.svg',
      url: '/panel',
      tag: `alarm-${key}`,
    });

    const deadEndpoints = [];
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    }

    if (deadEndpoints.length > 0) {
      const cleaned = subs.filter(s => !deadEndpoints.includes(s.endpoint));
      writeSubscriptions(cleaned);
    }

    console.log(`[Alarm] ${threshold.label} ${alertType}: ${value} → pushed to ${subs.length} subscribers`);
  }
}

// ── SPA Fallback ─────────────────────────────────────────────────────────
if (fs.existsSync(distDir)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// ── Sunucuyu başlat ─────────────────────────────────────────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  Hexora API Sunucusu (${NODE_ENV})`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://0.0.0.0:${PORT} (LAN)`);
  console.log(`========================================\n`);
});

// ── Graceful Shutdown (PM2 uyumlu) ──────────────────────────────────────
function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] Closed all connections');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[Server] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
