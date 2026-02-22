/*
 * BeeMind Backend — Express.js API Sunucusu
 * ESP32'den gelen sensör verilerini alır, JSON dosyasına kaydeder
 * Port: 3001
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'sensor-data.json');

// JSON body parser
app.use(express.json());

// CORS — lokal geliştirme için
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// ── Veri dizinini oluştur ────────────────────────────────────────────────
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]');
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

// ══════════════════════════════════════════════════════════════════════════
//  API ROUTES
// ══════════════════════════════════════════════════════════════════════════

// POST /api/sensor-data — ESP32'den veri al
app.post('/api/sensor-data', (req, res) => {
  try {
    // data dizinini garanti et
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const entry = {
      ...req.body,
      received_at: new Date().toISOString(),
      ip: req.ip
    };

    console.log(`[${entry.received_at}] Veri alindi:`, JSON.stringify(entry));

    const data = readData();
    data.push(entry);
    writeData(data);

    res.status(200).json({ status: 'ok', count: data.length });
  } catch (err) {
    console.error('[HATA] POST /api/sensor-data:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/sensor-data — tum verileri getir
app.get('/api/sensor-data', (req, res) => {
  const data = readData();

  // Opsiyonel: ?limit=100&offset=0
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

// GET /api/sensor-data/latest — son veriyi getir
app.get('/api/sensor-data/latest', (req, res) => {
  const data = readData();
  if (data.length === 0) {
    return res.json({ status: 'empty', data: null });
  }
  res.json({ status: 'ok', data: data[data.length - 1] });
});

// GET /api/sensor-data/stats — ozet istatistikler
app.get('/api/sensor-data/stats', (req, res) => {
  const data = readData();
  if (data.length === 0) {
    return res.json({ status: 'empty' });
  }

  // Son 24 saat filtresi
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
//  HIVE ROUTES — Frontend Dashboard için
// ══════════════════════════════════════════════════════════════════════════

// GET /api/hives/summary — Dashboard'un ana veri kaynağı (10sn polling)
app.get('/api/hives/summary', (req, res) => {
  const data = readData();

  if (data.length === 0) {
    return res.json({ hives: [] });
  }

  // Son kaydı al → hive formatına dönüştür
  const latest = data[data.length - 1];

  const hive = {
    id: 'hive-001',
    temperature: latest.temperature ?? null,
    humidity: latest.humidity ?? null,
    pressure: latest.pressure ?? null,
    co2: latest.co2 ?? null,
    tvoc: latest.tvoc ?? null,
    vibration: latest.vibration ?? null,
    sound_db: latest.sound_db ?? null,
    battery: 100,        // ESP32'de pil ölçümü yok, sabit
    weight: null,        // Tartı sensörü yok
    lastUpdate: latest.received_at
  };

  res.json({ hives: [hive] });
});

// GET /api/hives/:id/chart — Grafik verisi (zaman serisi)
app.get('/api/hives/:id/chart', (req, res) => {
  const data = readData();
  const limit = parseInt(req.query.limit) || 48; // Son 48 kayıt (varsayılan)

  // Son N kaydı al
  const recent = data.slice(-limit);

  if (recent.length === 0) {
    return res.json({ labels: [], temperature: [], humidity: [], pressure: [], co2: [], sound_db: [] });
  }

  const labels = recent.map(d => {
    const date = new Date(d.received_at);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  });

  res.json({
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

// ── Sunucuyu başlat ─────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  BeeMind API Sunucusu`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://0.0.0.0:${PORT} (LAN)`);
  console.log(`========================================\n`);
});
