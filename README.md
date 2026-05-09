# 🐝 Hexora Live - ESP32 IoT Kovan İzleme Sistemi

**Gerçek zamanlı sensör verisi ile akıllı kovan takibi**

---

## 📡 Sistem Mimarisi

```
ESP32 + Sensörler → WiFi → Node.js Backend → PostgreSQL → React Web Panel
```

## 🔧 Donanım

| Bileşen | Açıklama |
|---------|----------|
| **ESP32** | Ana mikrodenetleyici |
| **DHT22** | Sıcaklık & Nem sensörü |
| **BMP280** | Barometrik basınç sensörü |
| **Piezo** | Titreşim algılama |
| **INMP441** | Dijital mikrofon - arı sesi analizi *(yakında)* |
| **SD Kart Modülü** | Yedek veri kaydı *(yakında)* |
| **SIM7600E-H** | 4G bağlantı *(yakında)* |

## 🚀 Kurulum

### 1. Backend
```bash
# PostgreSQL başlat + Backend çalıştır
C:\hexora-start.bat
```

### 2. Web Panel
```bash
cd hexora-live
npm install
npm run dev
```

### 3. ESP32
Arduino IDE ile `arduino/hexora_esp32.ino` dosyasını yükle.

## 🌐 WiFi Yapılandırması

ESP32 otomatik olarak sırayla şu ağlara bağlanmayı dener:

| # | SSID | Açıklama | Backend IP |
|---|------|----------|------------|
| 1 | AUgur | Telefon hotspot | 172.20.10.3:3000 |
| 2 | UGUR_HOME | Ev WiFi | 192.168.1.100:3000 |
| 3 | TTNET_ZyXEL_HFHY | Ev WiFi | 192.168.1.100:3000 |

## 📊 Özellikler

- ✅ Gerçek zamanlı sensör izleme (5 dk aralık, deep sleep)
- ✅ Çoklu WiFi desteği (otomatik geçiş)
- ✅ Otomatik durum tespiti (stable / warning / critical)
- ✅ Canlı bildirimler (sensör eşik değerleri)
- ✅ Dashboard + Kovan detay + Harita + Raporlar
- ✅ AI analiz paneli
- ✅ Bağlantı durumu göstergesi

## 🔮 Planlanan Geliştirmeler

- [ ] INMP441 ile arı sesi frekans analizi (FFT)
- [ ] CCS811 CO2 sensörü entegrasyonu
- [ ] MPU6050 ivme sensörü (hırsızlık/devrilme tespiti)
- [ ] SIM7600 4G gateway (ESP-NOW ile çoklu kovan)
- [ ] SD kart yedek veri kaydı
- [ ] Güneş paneli + 18650 pil sistemi

## 📁 Proje Yapısı

```
hexora-live/
├── arduino/
│   └── hexora_esp32.ino     # ESP32 firmware
├── src/
│   ├── components/           # React bileşenleri
│   ├── contexts/
│   │   └── LiveDataContext.jsx  # Canlı veri yönetimi
│   ├── data/
│   │   └── helpers.js        # Utility fonksiyonları
│   └── services/
│       └── api.js            # Backend API servisi
└── public/
```

---

**TÜBİTAK 2242 - Hexora IoT Arıcılık İzleme Sistemi 🐝**
