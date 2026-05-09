# 🐝 BeeMora Live - IoT Kovan İzleme Sistemi

**Gerçek zamanlı sensör verisi ile akıllı kovan takibi**

---

## 📡 Sistem Mimarisi

```
IoT Sensörler → WiFi → Node.js Backend → React Web Panel
```

## 🚀 Kurulum

### 1. Backend
```bash
C:\beemora-start.bat
```

### 2. Web Panel
```bash
cd beemora-live
npm install
npm run dev
```

## 📊 Özellikler

- ✅ Gerçek zamanlı sensör izleme
- ✅ Otomatik durum tespiti (stable / warning / critical)
- ✅ Canlı bildirimler (sensör eşik değerleri)
- ✅ Dashboard + Kovan detay + Harita + Raporlar
- ✅ AI analiz paneli
- ✅ Bağlantı durumu göstergesi

## 🔮 Planlanan Geliştirmeler

- [ ] Arı sesi frekans analizi (FFT)
- [ ] CO2 izleme entegrasyonu
- [ ] Hırsızlık/devrilme tespiti
- [ ] 4G gateway desteği

## 📁 Proje Yapısı

```
beemora-live/
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

**BeeMora — IoT Arıcılık İzleme Sistemi 🐝**
