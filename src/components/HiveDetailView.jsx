import { useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Crown,
  Thermometer,
  Droplet,
  Wind,
  Gauge,
  BarChart3,
  StickyNote,
  Plus,
  Minus,
  Trash2,
  Send,
  Image,
  X,
  Calendar,
  Clock,
  Weight,
  Activity,
  BatteryFull,
  Camera,
  ClipboardList,
  Package,
  SlidersHorizontal,
  Save,
  Share2,
  Heart,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { getStatusColor, getStatusText } from "../data/mockData";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { api } from "../services/api";
import {
  hiveHealthScore,
  healthScoreColor,
  healthScoreBg,
  healthScoreLabel,
  healthScoreEmoji,
} from "../utils/hiveHealthScore";

const NOTES_KEY = (id) => `beemora_notes_${id}`;
const HIVE_PHOTO_KEY = (id) => `beemora_hive_photo_${id}`;
const SENSOR_CACHE_KEY = (id) => `beemora_sensor_cache_${id}`;
const CALENDAR_EVENTS_KEY = "beemora_calendar_events";
const INSPECTIONS_KEY = (id) => `beemora_inspections_${id}`;
const HARVEST_KEY = (id) => `beemora_harvest_${id}`;
const THRESHOLDS_KEY = (id) => `beemora_thresholds_${id}`;

const DEFAULT_THRESHOLDS = { tempMin: 32, tempMax: 38, humMin: 40, humMax: 80, batteryMin: 20 };

const TREATMENT_TYPES_TR = ["Yok", "Oksalik asit", "Amitraz", "Formic asit", "Apivar", "Diğer"];
const TREATMENT_TYPES_EN = ["None", "Oxalic acid", "Amitraz", "Formic acid", "Apivar", "Other"];

const HARVEST_QUALITY_TR = ["Çok iyi", "İyi", "Ortalama", "Düşük"];
const HARVEST_QUALITY_EN = ["Excellent", "Good", "Average", "Poor"];

const chartColors = (isDark) => ({
  tooltip: {
    background: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e0ddd5"}`,
    borderRadius: "8px",
  },
  label: { color: isDark ? "#9ca3af" : "#666666" },
  axis: isDark ? "#6b7280" : "#999999",
  grid: isDark ? "#374151" : "#e0ddd5",
});

// Son 24 saat sensor verisini simule et
const generate24hData = (hive) => {
  const data = [];
  const baseTemp = hive.temp ?? 34;
  const baseHumidity = hive.humidity ?? 55;
  const baseSound = hive.sound ?? 45;
  const baseBattery = hive.battery ?? 85;
  const baseWeight = hive.weight ?? 32;

  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    data.push({
      time: hour.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temp: +(baseTemp + (Math.random() - 0.5) * 4).toFixed(1),
      humidity: +(baseHumidity + (Math.random() - 0.5) * 10).toFixed(0),
      sound: +(baseSound + (Math.random() - 0.5) * 15).toFixed(0),
      battery: Math.max(
        0,
        Math.min(
          100,
          +(baseBattery - i * 0.1 + Math.random() * 0.5).toFixed(0),
        ),
      ),
      weight: +(baseWeight + (Math.random() - 0.5) * 0.8).toFixed(2),
    });
  }
  return data;
};

const EVENT_TYPES = {
  inspection: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/20 text-blue-300",
    label_tr: "Kontrol",
    label_en: "Inspection",
  },
  medication: {
    dot: "bg-red-500",
    badge: "bg-red-500/20 text-red-300",
    label_tr: "İlaç",
    label_en: "Medication",
  },
  harvest: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/20 text-amber-300",
    label_tr: "Hasat",
    label_en: "Harvest",
  },
  feeding: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-300",
    label_tr: "Besleme",
    label_en: "Feeding",
  },
  maintenance: {
    dot: "bg-purple-500",
    badge: "bg-purple-500/20 text-purple-300",
    label_tr: "Bakım",
    label_en: "Maintenance",
  },
  other: {
    dot: "bg-gray-500",
    badge: "bg-gray-500/20 text-gray-300",
    label_tr: "Diğer",
    label_en: "Other",
  },
};

const HiveDetailView = ({ hive, onBack }) => {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const toast = useToast();
  const cc = chartColors(theme === "dark");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("general");
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const profilePhotoRef = useRef(null);
  const [hivePhoto, setHivePhoto] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Inspection log state
  const [inspections, setInspections] = useState([]);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspectionForm, setInspectionForm] = useState(() => ({
    date: new Date().toISOString().split("T")[0],
    queenSeen: false,
    frames: "",
    varroaCount: "",
    treatmentType: lang === "tr" ? TREATMENT_TYPES_TR[0] : TREATMENT_TYPES_EN[0],
    notes: "",
  }));

  // Harvest tracker state
  const [harvests, setHarvests] = useState([]);
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [harvestForm, setHarvestForm] = useState(() => ({
    date: new Date().toISOString().split("T")[0],
    amountKg: "",
    quality: lang === "tr" ? HARVEST_QUALITY_TR[0] : HARVEST_QUALITY_EN[0],
    notes: "",
  }));

  // Custom thresholds state
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [thresholdsSaved, setThresholdsSaved] = useState(false);

  // Stable string id (hive.id sayi olabilir)
  const hiveIdStr = String(hive.id);

  // Kovan profil fotoğrafı yükle
  useEffect(() => {
    if (hive.photo) {
      setHivePhoto(hive.photo);
      return;
    }
    try {
      const saved = localStorage.getItem(HIVE_PHOTO_KEY(hive.id));
      setHivePhoto(saved || null);
    } catch {
      setHivePhoto(null);
    }
  }, [hive.id, hive.photo]);

  const handleHivePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        lang === "tr"
          ? "Dosya çok büyük (maks. 5 MB)"
          : "File too large (max 5 MB)",
      );
      return;
    }
    setPhotoUploading(true);
    try {
      const result = await api.uploadHivePhoto(hive.id, file);
      setHivePhoto(result.photo);
      toast.success(lang === "tr" ? "Fotoğraf yüklendi" : "Photo uploaded");
    } catch {
      // Fallback: localStorage base64
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        setHivePhoto(base64);
        try {
          localStorage.setItem(HIVE_PHOTO_KEY(hive.id), base64);
        } catch {}
        toast.info(
          lang === "tr"
            ? "Fotoğraf yerel olarak kaydedildi"
            : "Photo saved locally",
        );
      };
      reader.onerror = () => {
        toast.error(
          lang === "tr" ? "Fotoğraf okunamadı" : "Could not read photo",
        );
      };
      reader.readAsDataURL(file);
    } finally {
      setPhotoUploading(false);
    }
  };

  const removeHivePhoto = () => {
    setHivePhoto(null);
    try {
      localStorage.removeItem(HIVE_PHOTO_KEY(hive.id));
    } catch {}
  };

  // Etkinlikler
  const [hiveEvents, setHiveEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "inspection",
    description: "",
  });

  // Sensor verilerini cache'le
  const sensorData = useMemo(() => {
    const isConnected =
      hive.hasData || hive.temp != null || hive.humidity != null;
    if (isConnected) {
      const cache = {
        temp: hive.temp,
        humidity: hive.humidity,
        sound: hive.sound,
        battery: hive.battery,
        weight: hive.weight,
      };
      try {
        localStorage.setItem(SENSOR_CACHE_KEY(hive.id), JSON.stringify(cache));
      } catch {}
      return { ...cache, cached: false };
    }
    try {
      const raw = localStorage.getItem(SENSOR_CACHE_KEY(hive.id));
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached) return { ...cached, cached: true };
      }
    } catch {}
    return {
      temp: hive.temp,
      humidity: hive.humidity,
      sound: hive.sound,
      battery: hive.battery,
      weight: hive.weight,
      cached: false,
    };
  }, [
    hive.id,
    hive.hasData,
    hive.temp,
    hive.humidity,
    hive.sound,
    hive.battery,
    hive.weight,
  ]);

  // Grafik verisi
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartSimulated, setChartSimulated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const data = await api.getHiveChart(hive.id);
        if (
          !cancelled &&
          data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setChartData(
            data.data.map((d) => ({
              time:
                d.time ||
                new Date(d.timestamp || d.created_at).toLocaleTimeString(
                  "tr-TR",
                  { hour: "2-digit", minute: "2-digit" },
                ),
              temp: d.temp ?? d.temperature ?? 0,
              humidity: d.humidity ?? 0,
              sound: d.sound ?? d.vibration ?? 0,
              battery: d.battery ?? 100,
              weight: d.weight ?? 0,
            })),
          );
          setChartSimulated(false);
          setChartLoading(false);
          return;
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[HiveDetailView] chart fetch failed, falling back to simulated data",
            err,
          );
        }
      }
      if (!cancelled) {
        setChartData(generate24hData(hive));
        setChartSimulated(true);
        setChartLoading(false);
      }
    };
    fetchChartData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hive.id]);

  // Notlari yukle
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(NOTES_KEY(hive.id)) || "[]",
      );
      setNotes(Array.isArray(saved) ? saved : []);
    } catch {
      setNotes([]);
    }
  }, [hive.id]);

  // Takvim etkinliklerini yukle
  useEffect(() => {
    try {
      const allEvents = JSON.parse(
        localStorage.getItem(CALENDAR_EVENTS_KEY) || "[]",
      );
      const filtered = (Array.isArray(allEvents) ? allEvents : [])
        .filter((e) => String(e.hiveId) === hiveIdStr)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setHiveEvents(filtered);
    } catch {
      setHiveEvents([]);
    }
  }, [hive.id, hiveIdStr]);

  // Muayene günlüğünü yükle
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(INSPECTIONS_KEY(hive.id)) || "[]");
      setInspections(Array.isArray(saved) ? saved : []);
    } catch { setInspections([]); }
  }, [hive.id]);

  // Hasat verilerini yükle
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HARVEST_KEY(hive.id)) || "[]");
      setHarvests(Array.isArray(saved) ? saved : []);
    } catch { setHarvests([]); }
  }, [hive.id]);

  // Özel eşikleri yükle
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(THRESHOLDS_KEY(hive.id)) || "null");
      if (saved) setThresholds({ ...DEFAULT_THRESHOLDS, ...saved });
    } catch {}
  }, [hive.id]);

  // Saat
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addNote = () => {
    if (!newNote.trim() && !photoPreview) return;
    const note = {
      id: Date.now(),
      text: newNote.trim(),
      photo: photoPreview || null,
      date: new Date().toLocaleString(lang === "tr" ? "tr-TR" : "en-US"),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(NOTES_KEY(hive.id), JSON.stringify(updated));
    } catch {}
    setNewNote("");
    setPhotoPreview(null);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        lang === "tr"
          ? "Fotoğraf 2 MB'dan küçük olmalı"
          : "Photo must be less than 2 MB",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.onerror = () => {
      toast.error(
        lang === "tr" ? "Fotoğraf okunamadı" : "Could not read photo",
      );
    };
    reader.readAsDataURL(file);
  };

  const deleteNote = (id) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    try {
      localStorage.setItem(NOTES_KEY(hive.id), JSON.stringify(updated));
    } catch {}
  };

  // Etkinlik ekle
  const addEvent = () => {
    if (!eventForm.title.trim()) return;
    const newEvent = {
      id: Date.now(),
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time,
      type: eventForm.type,
      description: eventForm.description.trim(),
      hiveId: hive.id,
      hiveName: hive.name || `Kovan #${hive.id}`,
    };

    try {
      const allEvents = JSON.parse(
        localStorage.getItem(CALENDAR_EVENTS_KEY) || "[]",
      );
      const arr = Array.isArray(allEvents) ? allEvents : [];
      arr.push(newEvent);
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(arr));
    } catch {}

    setHiveEvents((prev) => [newEvent, ...prev]);
    setEventForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      type: "inspection",
      description: "",
    });
    setShowEventForm(false);
  };

  const deleteEvent = (eventId) => {
    try {
      const allEvents = JSON.parse(
        localStorage.getItem(CALENDAR_EVENTS_KEY) || "[]",
      );
      const arr = Array.isArray(allEvents) ? allEvents : [];
      const updated = arr.filter((e) => e.id !== eventId);
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(updated));
    } catch {}
    setHiveEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Muayene günlüğü helpers
  const addInspection = () => {
    const entry = { id: Date.now(), ...inspectionForm };
    const updated = [entry, ...inspections];
    setInspections(updated);
    try { localStorage.setItem(INSPECTIONS_KEY(hive.id), JSON.stringify(updated)); } catch {}
    setShowInspectionForm(false);
    setInspectionForm({
      date: new Date().toISOString().split("T")[0],
      queenSeen: false, frames: "", varroaCount: "",
      treatmentType: lang === "tr" ? TREATMENT_TYPES_TR[0] : TREATMENT_TYPES_EN[0],
      notes: "",
    });
  };

  const deleteInspection = (id) => {
    const updated = inspections.filter((i) => i.id !== id);
    setInspections(updated);
    try { localStorage.setItem(INSPECTIONS_KEY(hive.id), JSON.stringify(updated)); } catch {}
  };

  // Hasat helpers
  const addHarvest = () => {
    if (!harvestForm.amountKg) return;
    const entry = { id: Date.now(), ...harvestForm };
    const updated = [entry, ...harvests];
    setHarvests(updated);
    try { localStorage.setItem(HARVEST_KEY(hive.id), JSON.stringify(updated)); } catch {}
    setShowHarvestForm(false);
    setHarvestForm({
      date: new Date().toISOString().split("T")[0],
      amountKg: "",
      quality: lang === "tr" ? HARVEST_QUALITY_TR[0] : HARVEST_QUALITY_EN[0],
      notes: "",
    });
  };

  const deleteHarvest = (id) => {
    const updated = harvests.filter((h) => h.id !== id);
    setHarvests(updated);
    try { localStorage.setItem(HARVEST_KEY(hive.id), JSON.stringify(updated)); } catch {}
  };

  const totalHarvestKg = harvests.reduce((sum, h) => sum + (parseFloat(h.amountKg) || 0), 0);

  // Eşik helpers
  const saveThresholds = () => {
    try { localStorage.setItem(THRESHOLDS_KEY(hive.id), JSON.stringify(thresholds)); } catch {}
    setThresholdsSaved(true);
    setTimeout(() => setThresholdsSaved(false), 2000);
  };

  const formatDateTime = (date) =>
    new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);

  // Heatmap verisi — id sayi/string fark etmez
  const heatmapData = useMemo(() => {
    const idHash =
      hiveIdStr.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) || 1;
    return Array.from({ length: 10 }, (_, i) => {
      const seed = (idHash * (i + 1) * 137) % 100;
      const value = 25 + seed * 0.6;
      const status = seed < 30 ? "low" : seed < 70 ? "normal" : "high";
      return { id: i + 1, value, status };
    });
  }, [hiveIdStr]);

  const getBarColor = (status) => {
    switch (status) {
      case "low":
        return "bg-yellow-500";
      case "normal":
        return "bg-orange-500";
      case "high":
        return "bg-red-600";
      default:
        return "bg-orange-500";
    }
  };

  const swarmData = [
    { time: "00:00", risk: 15 },
    { time: "04:00", risk: 12 },
    { time: "08:00", risk: 18 },
    { time: "12:00", risk: 10 },
    { time: "16:00", risk: 20 },
    { time: "20:00", risk: 14 },
    { time: "23:59", risk: 16 },
  ];

  const colors = getStatusColor(hive.status);
  const statusText = getStatusText(hive.status, lang);
  const healthScore = hiveHealthScore(hive);

  const shareViaWhatsApp = () => {
    const statusEmoji = hive.status === "critical" ? "🔴" : hive.status === "warning" ? "🟡" : "🟢";
    const name = hive.name || `#${hive.id}`;
    const lines = [
      `🐝 *BeeMora* — ${name}`,
      `${statusEmoji} ${lang === "tr" ? "Durum" : "Status"}: ${statusText}`,
      `🌡️ ${lang === "tr" ? "Sıcaklık" : "Temp"}: ${hive.temp ?? "—"}°C`,
      `💧 ${lang === "tr" ? "Nem" : "Humidity"}: ${hive.humidity ?? "—"}%`,
      `🔋 ${lang === "tr" ? "Pil" : "Battery"}: ${hive.battery ?? "—"}%`,
      `❤️ ${lang === "tr" ? "Sağlık Skoru" : "Health Score"}: ${healthScore}/10 — ${healthScoreLabel(healthScore, lang)}`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const aiSuggestions = [
    {
      icon:
        hive.status === "critical"
          ? "!"
          : hive.status === "warning"
            ? "!"
            : "+",
      color: colors.text,
      text:
        hive.alertType ||
        (lang === "tr"
          ? "Mudahale gerekmiyor. Haftalik rutin kontrolu Cumartesi yapabilirsiniz."
          : "No intervention needed. You can do the weekly routine check on Saturday."),
    },
    {
      icon: "!",
      color: "text-amber-400",
      text:
        lang === "tr"
          ? `Nem seviyesi %${sensorData.humidity ?? 0}'e ${(sensorData.humidity ?? 0) > 60 ? "yukseldi" : "dustu"}. Havalandirmayi kontrol edin.`
          : `Humidity level ${(sensorData.humidity ?? 0) > 60 ? "rose" : "dropped"} to ${sensorData.humidity ?? 0}%. Check ventilation.`,
    },
    {
      icon: "*",
      color: "text-gray-300",
      text:
        lang === "tr"
          ? `Agirlik: ${sensorData.weight ?? 0}kg - Bal uretimi aktif`
          : `Weight: ${sensorData.weight ?? 0}kg - Honey production active`,
    },
  ];

  const tabs = [
    { id: "general", label: t.detail.general, icon: CheckCircle },
    { id: "charts", label: t.detail.charts, icon: BarChart3 },
    {
      id: "notes",
      label: `${t.detail.notes} (${notes.length})`,
      icon: StickyNote,
    },
    {
      id: "events",
      label: `${lang === "tr" ? "Etkinlikler" : "Events"} (${hiveEvents.length})`,
      icon: Calendar,
    },
    {
      id: "inspection",
      label: `${lang === "tr" ? "Muayene" : "Inspections"} (${inspections.length})`,
      icon: ClipboardList,
    },
    {
      id: "harvest",
      label: `${lang === "tr" ? "Hasat" : "Harvest"} (${harvests.length})`,
      icon: Package,
    },
    {
      id: "thresholds",
      label: lang === "tr" ? "Eşikler" : "Thresholds",
      icon: SlidersHorizontal,
    },
  ];

  const txt = {
    tr: {
      back: "Geri Don",
      hive: "Kovan",
      status: "DURUM",
      aiTitle: "YAPAY ZEKA ONERILERI",
      frameHeatmap: "Cerceve Yogunluk Haritasi",
      low: "Dusuk",
      normal: "Normal",
      high: "Yuksek",
      swarmRisk: "Ogul Riski",
      queen: "ANA ARI (QUEEN)",
      seen: "GORULDU",
      healthy: "Saglikli",
      temp: "SICAKLIK",
      humidity: "NEM",
      sound: "SES SEVIYESI",
      battery: "PIL",
      weight: "AGIRLIK",
      vibration: "TITRESIM",
      pressure: "BASINC",
      camera: "KAMERA",
      cameraLive: "Canli",
      goodCondition: "Iyi Durumda",
      cachedWarning: "Cihaz baglantisi yok — son bilinen degerler gosteriliyor",
      last24h: "Son 24 Saat",
      tempChart: "Sicaklik",
      humChart: "Nem",
      soundChart: "Ses Seviyesi",
      batChart: "Pil",
      weightChart: "Agirlik",
      tempUnit: "Kovan ic sicakligi (C)",
      humUnit: "Kovan ic nem orani (%)",
      soundUnit: "Kovan ses olcumu (dB)",
      batUnit: "Pil seviyesi (%)",
      weightUnit: "Kovan agirligi (kg)",
      addNote: "Not ekleyin...",
      noNotes: "Henuz not eklenmedi",
      addPhoto: "Fotograf ekle",
      noEvents: "Bu kovana ait etkinlik yok",
      addEvent: "Etkinlik Ekle",
      eventTitle: "Baslik",
      eventDate: "Tarih",
      eventTime: "Saat",
      eventType: "Tur",
      eventDesc: "Aciklama",
      previousData: "Onceki Veri",
      stableStatus: "Kovan stabil. Arilar calisiyor.",
      loadingChart: "Grafik yukleniyor...",
      simulatedWarn:
        "Gecmis veri bulunamadi — grafik simule edilmis ornek veri gosteriyor.",
    },
    en: {
      back: "Go Back",
      hive: "Hive",
      status: "STATUS",
      aiTitle: "AI SUGGESTIONS",
      frameHeatmap: "Frame Density Map",
      low: "Low",
      normal: "Normal",
      high: "High",
      swarmRisk: "Swarm Risk",
      queen: "QUEEN BEE",
      seen: "SPOTTED",
      healthy: "Healthy",
      temp: "TEMPERATURE",
      humidity: "HUMIDITY",
      sound: "SOUND LEVEL",
      battery: "BATTERY",
      weight: "WEIGHT",
      vibration: "VIBRATION",
      pressure: "PRESSURE",
      camera: "CAMERA",
      cameraLive: "Live",
      goodCondition: "Good Condition",
      cachedWarning: "Device not connected — showing last known values",
      last24h: "Last 24 Hours",
      tempChart: "Temperature",
      humChart: "Humidity",
      soundChart: "Sound Level",
      batChart: "Battery",
      weightChart: "Weight",
      tempUnit: "Hive internal temperature (C)",
      humUnit: "Hive internal humidity (%)",
      soundUnit: "Hive sound measurement (dB)",
      batUnit: "Battery level (%)",
      weightUnit: "Hive weight (kg)",
      addNote: "Add a note about this hive...",
      noNotes: "No notes yet",
      addPhoto: "Add photo",
      noEvents: "No events for this hive",
      addEvent: "Add Event",
      eventTitle: "Title",
      eventDate: "Date",
      eventTime: "Time",
      eventType: "Type",
      eventDesc: "Description",
      previousData: "Previous Data",
      stableStatus: "Hive is stable. Bees are active.",
      loadingChart: "Loading chart...",
      simulatedWarn:
        "No historical data found — chart is showing simulated sample data.",
    },
  };
  const tx = txt[lang] || txt.tr;

  const strokeForStatus =
    hive.status === "critical"
      ? "#ef4444"
      : hive.status === "warning"
        ? "#f59e0b"
        : "#10b981";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            aria-label={tx.back}
          >
            <ArrowLeft className="w-5 h-5" />
            {tx.back}
          </button>
          <button
            onClick={shareViaWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
            title={lang === "tr" ? "WhatsApp ile paylaş" : "Share via WhatsApp"}
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* Kovan Profil Fotoğrafı */}
          <div className="relative group">
            <input
              type="file"
              ref={profilePhotoRef}
              accept="image/*"
              className="hidden"
              onChange={handleHivePhotoUpload}
            />
            {hivePhoto ? (
              <div className="relative">
                <img
                  src={hivePhoto}
                  alt={hive.name || `${tx.hive} #${hive.id}`}
                  className={`w-14 h-14 rounded-lg object-cover border-2 border-gray-700 group-hover:border-amber-500 transition-colors cursor-pointer ${photoUploading ? "opacity-50" : ""}`}
                  onClick={() =>
                    !photoUploading && profilePhotoRef.current?.click()
                  }
                />
                <button
                  onClick={removeHivePhoto}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={
                    lang === "tr" ? "Fotoğrafı kaldır" : "Remove photo"
                  }
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => profilePhotoRef.current?.click()}
                disabled={photoUploading}
                className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-700 hover:border-amber-500 flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label={lang === "tr" ? "Fotoğraf yükle" : "Upload photo"}
              >
                <Image className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">
              {hive.name || `${tx.hive} #${hive.id}`}
            </p>
            <p className="text-sm text-gray-300 font-mono">
              {formatDateTime(currentTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap ${
                isActive
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <>
          {/* Health Score Card */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${healthScoreBg(healthScore)}`}>
            <div className="text-4xl" aria-hidden="true">{healthScoreEmoji(healthScore)}</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                {lang === "tr" ? "Sağlık Skoru" : "Health Score"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${healthScoreColor(healthScore)}`}>{healthScore}</span>
                <span className="text-gray-500 text-sm">/ 10</span>
                <span className={`text-sm font-semibold ${healthScoreColor(healthScore)}`}>
                  — {healthScoreLabel(healthScore, lang)}
                </span>
              </div>
            </div>
            <Heart className={`w-6 h-6 ${healthScoreColor(healthScore)}`} aria-hidden="true" />
          </div>

          {/* Status Card */}
          <div
            className={`bg-gray-900 border-2 ${colors.border} rounded-lg p-6 shadow-lg ${
              hive.status === "critical" ? "animate-pulse" : ""
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-shrink-0">
                <CheckCircle
                  className={`w-14 h-14 ${colors.text}`}
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h2 className={`text-3xl font-bold ${colors.text} mb-2`}>
                  {tx.status}: {statusText}
                </h2>
                <p className="text-gray-400 mb-6">
                  {hive.alertType || tx.stableStatus}
                </p>
                <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-amber-400 font-semibold text-sm">
                      {tx.aiTitle}
                    </h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`${s.color} text-lg flex-shrink-0 font-bold`}
                        >
                          {s.icon}
                        </span>
                        <span className="text-gray-300 leading-relaxed">
                          {s.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex-shrink-0 w-full lg:w-64 h-24">
                <svg
                  viewBox="0 0 200 60"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id={`gradient-${hiveIdStr}`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={strokeForStatus} />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,30 Q20,20 40,35 T80,25 T120,40 T160,20 T200,30"
                    fill="none"
                    stroke={strokeForStatus}
                    strokeWidth="2"
                  />
                  <path
                    d="M0,30 Q20,20 40,35 T80,25 T120,40 T160,20 T200,30 V60 H0 Z"
                    fill={`url(#gradient-${hiveIdStr})`}
                    opacity="0.3"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">
                  {tx.frameHeatmap}
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
                    <span className="text-gray-400">{tx.low}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-sm" />
                    <span className="text-gray-400">{tx.normal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-sm" />
                    <span className="text-gray-400">{tx.high}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 h-56">
                {heatmapData.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center gap-3 flex-1 group"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                      %{Math.round(item.value)}
                    </div>
                    <div
                      className={`w-full ${getBarColor(item.status)} rounded-t-md transition-all group-hover:scale-105`}
                      style={{ height: `${item.value * 2}px` }}
                    />
                    <span className="text-xs text-gray-500">#{item.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">
                  {tx.swarmRisk}
                </h3>
                <span className="text-emerald-400 font-bold text-sm">
                  {tx.low.toUpperCase()}
                </span>
              </div>
              <div className="h-24 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={swarmData}>
                    <XAxis
                      dataKey="time"
                      stroke="#4b5563"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      stroke="#4b5563"
                      tick={{ fontSize: 10 }}
                      domain={[0, 30]}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#22d3ee"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-start gap-3">
                  <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">{tx.queen}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-emerald-400 font-bold text-sm">
                        {tx.seen}
                      </p>
                      <span className="text-gray-500 text-xs">- #5</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {tx.healthy} | 13:45
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Cards — adaptör tipine göre */}
          {(() => {
            const adapter = hive.adapterType || "standard";
            const isBasic = adapter === "basic";
            const isPro = adapter === "pro";
            const cards = [];

            cards.push(
              <SensorCard
                key="temp"
                icon={Thermometer}
                title={tx.temp}
                value={`${sensorData.temp ?? 0}°C`}
                status={
                  sensorData.cached
                    ? tx.previousData
                    : (sensorData.temp ?? 0) > 37
                      ? tx.high
                      : tx.goodCondition
                }
                color={
                  sensorData.cached
                    ? "text-gray-500"
                    : (sensorData.temp ?? 0) > 37
                      ? "text-amber-400"
                      : "text-emerald-400"
                }
                cached={sensorData.cached}
              />,
            );
            cards.push(
              <SensorCard
                key="hum"
                icon={Droplet}
                title={tx.humidity}
                value={`${sensorData.humidity ?? 0}%`}
                status={sensorData.cached ? tx.previousData : tx.goodCondition}
                color={sensorData.cached ? "text-gray-500" : "text-emerald-400"}
                cached={sensorData.cached}
              />,
            );
            cards.push(
              <SensorCard
                key="weight"
                icon={Weight}
                title={tx.weight}
                value={`${sensorData.weight ?? 0}kg`}
                status={sensorData.cached ? tx.previousData : tx.goodCondition}
                color={sensorData.cached ? "text-gray-500" : "text-emerald-400"}
                cached={sensorData.cached}
              />,
            );
            cards.push(
              <SensorCard
                key="bat"
                icon={BatteryFull}
                title={tx.battery}
                value={`${sensorData.battery ?? 0}%`}
                status={
                  sensorData.cached
                    ? tx.previousData
                    : (sensorData.battery ?? 0) < 20
                      ? tx.low
                      : tx.goodCondition
                }
                color={
                  sensorData.cached
                    ? "text-gray-500"
                    : (sensorData.battery ?? 0) < 20
                      ? "text-red-400"
                      : "text-emerald-400"
                }
                cached={sensorData.cached}
              />,
            );

            if (!isBasic) {
              cards.push(
                <SensorCard
                  key="sound"
                  icon={Wind}
                  title={tx.sound}
                  value={`${sensorData.sound ?? 0}dB`}
                  status={
                    sensorData.cached
                      ? tx.previousData
                      : (sensorData.sound ?? 0) > 70
                        ? tx.high
                        : tx.normal
                  }
                  color={
                    sensorData.cached
                      ? "text-gray-500"
                      : (sensorData.sound ?? 0) > 70
                        ? "text-red-400"
                        : "text-emerald-400"
                  }
                  cached={sensorData.cached}
                />,
              );
              cards.push(
                <SensorCard
                  key="press"
                  icon={Gauge}
                  title={tx.pressure}
                  value={`${hive.pressure ?? 0}hPa`}
                  status={sensorData.cached ? tx.previousData : tx.normal}
                  color={
                    sensorData.cached ? "text-gray-500" : "text-emerald-400"
                  }
                  cached={sensorData.cached}
                />,
              );
              cards.push(
                <SensorCard
                  key="vib"
                  icon={Activity}
                  title={tx.vibration}
                  value={`${hive.vibration ?? 0}Hz`}
                  status={sensorData.cached ? tx.previousData : tx.normal}
                  color={
                    sensorData.cached ? "text-gray-500" : "text-emerald-400"
                  }
                  cached={sensorData.cached}
                />,
              );
            }
            if (isPro) {
              cards.push(
                <div
                  key="cam"
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center text-center"
                >
                  <Camera className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    {tx.camera}
                  </p>
                  <p className="text-lg font-bold text-purple-400 mt-1">
                    {tx.cameraLive}
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    {tx.goodCondition}
                  </p>
                </div>,
              );
            }

            return (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards}
              </div>
            );
          })()}

          {sensorData.cached && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-400">{tx.cachedWarning}</p>
            </div>
          )}
        </>
      )}

      {/* Charts Tab */}
      {activeTab === "charts" &&
        (() => {
          const adapter = hive.adapterType || "standard";
          const isBasic = adapter === "basic";

          const ChartBlock = ({
            title,
            subtitle,
            dataKey,
            color,
            gradientId,
            domain,
            nameLabel,
          }) => (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">
                {tx.last24h} — {title}
              </h3>
              <p className="text-xs text-gray-600 mb-4">{subtitle}</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={cc.grid} />
                    <XAxis
                      dataKey="time"
                      stroke={cc.axis}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      stroke={cc.axis}
                      tick={{ fontSize: 10 }}
                      domain={domain || ["auto", "auto"]}
                    />
                    <Tooltip contentStyle={cc.tooltip} labelStyle={cc.label} />
                    <Area
                      type="monotone"
                      dataKey={dataKey}
                      stroke={color}
                      strokeWidth={2}
                      fill={`url(#${gradientId})`}
                      name={nameLabel}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );

          if (chartLoading) {
            return (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-500 text-sm">{tx.loadingChart}</p>
              </div>
            );
          }

          return (
            <div className="space-y-6">
              {chartSimulated && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                  <span>⚠️</span>
                  <span>{tx.simulatedWarn}</span>
                </div>
              )}
              <ChartBlock
                title={tx.tempChart}
                subtitle={tx.tempUnit}
                dataKey="temp"
                color="#ef4444"
                gradientId="tempGrad"
                nameLabel={`${tx.tempChart} (°C)`}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartBlock
                  title={tx.humChart}
                  subtitle={tx.humUnit}
                  dataKey="humidity"
                  color="#06b6d4"
                  gradientId="humGrad"
                  nameLabel={`${tx.humChart} (%)`}
                />
                <ChartBlock
                  title={tx.weightChart}
                  subtitle={tx.weightUnit}
                  dataKey="weight"
                  color="#f59e0b"
                  gradientId="weightGrad"
                  nameLabel={`${tx.weightChart} (kg)`}
                />
              </div>
              <ChartBlock
                title={tx.batChart}
                subtitle={tx.batUnit}
                dataKey="battery"
                color="#10b981"
                gradientId="batGrad"
                domain={[0, 100]}
                nameLabel={`${tx.batChart} (%)`}
              />
              {!isBasic && (
                <ChartBlock
                  title={tx.soundChart}
                  subtitle={tx.soundUnit}
                  dataKey="sound"
                  color="#a855f7"
                  gradientId="soundGrad"
                  nameLabel={`${tx.soundChart} (dB)`}
                />
              )}
            </div>
          );
        })()}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addNote();
                    }
                  }}
                  placeholder={tx.addNote}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm"
                />
                {photoPreview && (
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt=""
                      className="max-h-32 rounded-lg border border-gray-700"
                    />
                    <button
                      onClick={() => setPhotoPreview(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      aria-label={
                        lang === "tr" ? "Fotoğrafı kaldır" : "Remove photo"
                      }
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 self-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-amber-400 rounded-lg transition-colors"
                  title={tx.addPhoto}
                  aria-label={tx.addPhoto}
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={addNote}
                  disabled={!newNote.trim() && !photoPreview}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
                  aria-label={lang === "tr" ? "Notu gönder" : "Send note"}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {notes.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <StickyNote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">{tx.noNotes}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 group hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {note.text && (
                        <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">
                          {note.text}
                        </p>
                      )}
                      {note.photo && (
                        <img
                          src={note.photo}
                          alt=""
                          className="mt-2 max-h-48 rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(note.photo, "_blank")}
                        />
                      )}
                      <p className="text-xs text-gray-600 mt-2">{note.date}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={lang === "tr" ? "Notu sil" : "Delete note"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {tx.addEvent}
            </button>
          </div>

          {showEventForm && (
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {tx.eventTitle} *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder={
                      lang === "tr"
                        ? "Ornek: Haftalik kontrol"
                        : "e.g. Weekly inspection"
                    }
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {tx.eventType}
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) =>
                      setEventForm((p) => ({ ...p, type: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(EVENT_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {lang === "tr" ? val.label_tr : val.label_en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {tx.eventDate}
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm((p) => ({ ...p, date: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    {tx.eventTime}
                  </label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) =>
                      setEventForm((p) => ({ ...p, time: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  {tx.eventDesc}
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) =>
                    setEventForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={addEvent}
                  disabled={!eventForm.title.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-sm"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          )}

          {hiveEvents.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">{tx.noEvents}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hiveEvents.map((event) => {
                const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.other;
                return (
                  <div
                    key={event.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 group hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${typeInfo.dot} mt-1.5 flex-shrink-0`}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-200 font-medium text-sm break-words">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.date}
                            </span>
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${typeInfo.badge}`}
                            >
                              {lang === "tr"
                                ? typeInfo.label_tr
                                : typeInfo.label_en}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-gray-400 text-xs mt-2 break-words">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={
                          lang === "tr" ? "Etkinliği sil" : "Delete event"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Inspection Log Tab ─────────────────────────────────────────── */}
      {activeTab === "inspection" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-200">
              {lang === "tr" ? "Muayene Günlüğü" : "Inspection Log"}
            </h3>
            <button
              onClick={() => setShowInspectionForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              {lang === "tr" ? "Muayene Ekle" : "Add Inspection"}
            </button>
          </div>

          {showInspectionForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  📅 {lang === "tr" ? "Tarih" : "Date"}
                </label>
                <input type="date" value={inspectionForm.date}
                  onChange={(e) => setInspectionForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500" />
              </div>

              {/* Queen seen — big visual toggle */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">
                  👑 {lang === "tr" ? "Kraliçe görüldü mü?" : "Was the queen spotted?"}
                </p>
                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => setInspectionForm((p) => ({ ...p, queenSeen: true }))}
                    className={`flex-1 py-4 rounded-xl text-2xl font-bold border-2 transition-all ${inspectionForm.queenSeen ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500"}`}
                  >
                    ✅ {lang === "tr" ? "Evet" : "Yes"}
                  </button>
                  <button type="button"
                    onClick={() => setInspectionForm((p) => ({ ...p, queenSeen: false }))}
                    className={`flex-1 py-4 rounded-xl text-2xl font-bold border-2 transition-all ${!inspectionForm.queenSeen ? "bg-red-500/20 border-red-500 text-red-300" : "bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500"}`}
                  >
                    ❌ {lang === "tr" ? "Hayır" : "No"}
                  </button>
                </div>
              </div>

              {/* Frame count — slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-300">
                    🗂️ {lang === "tr" ? "Çerçeve Sayısı" : "Frame Count"}
                  </p>
                  <span className="text-xl font-bold text-amber-400 tabular-nums">
                    {inspectionForm.frames || 0}
                  </span>
                </div>
                <input type="range" min="0" max="20"
                  value={inspectionForm.frames || 0}
                  onChange={(e) => setInspectionForm((p) => ({ ...p, frames: e.target.value }))}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0</span><span>10</span><span>20</span>
                </div>
              </div>

              {/* Varroa count — number stepper */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">
                  🦠 {lang === "tr" ? "Varroa Sayısı (100 arıda)" : "Varroa Count (per 100 bees)"}
                </p>
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => setInspectionForm((p) => ({ ...p, varroaCount: String(Math.max(0, (parseInt(p.varroaCount) || 0) - 1)) }))}
                    className="w-12 h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xl font-bold text-gray-300 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className={`flex-1 text-center text-3xl font-bold tabular-nums rounded-xl py-3 ${
                    (parseInt(inspectionForm.varroaCount) || 0) >= 3 ? "text-red-400 bg-red-500/10" :
                    (parseInt(inspectionForm.varroaCount) || 0) >= 1 ? "text-amber-400 bg-amber-500/10" :
                    "text-emerald-400 bg-emerald-500/10"
                  }`}>
                    {inspectionForm.varroaCount || 0}
                  </div>
                  <button type="button"
                    onClick={() => setInspectionForm((p) => ({ ...p, varroaCount: String((parseInt(p.varroaCount) || 0) + 1) }))}
                    className="w-12 h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xl font-bold text-gray-300 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {(parseInt(inspectionForm.varroaCount) || 0) >= 3
                    ? (lang === "tr" ? "⚠️ Yüksek — tedavi gerekebilir" : "⚠️ High — treatment may be needed")
                    : (parseInt(inspectionForm.varroaCount) || 0) >= 1
                    ? (lang === "tr" ? "🟡 Orta düzey" : "🟡 Moderate")
                    : (lang === "tr" ? "✅ Normal" : "✅ Normal")}
                </p>
              </div>

              {/* Treatment — card selection */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">
                  💊 {lang === "tr" ? "Tedavi" : "Treatment"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(lang === "tr" ? TREATMENT_TYPES_TR : TREATMENT_TYPES_EN).map((type) => (
                    <button key={type} type="button"
                      onClick={() => setInspectionForm((p) => ({ ...p, treatmentType: type }))}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all text-center ${
                        inspectionForm.treatmentType === type
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  📝 {lang === "tr" ? "Notlar (isteğe bağlı)" : "Notes (optional)"}
                </label>
                <textarea rows={2} value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={lang === "tr" ? "Gözlemlerinizi yazın..." : "Write your observations..."}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none" />
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowInspectionForm(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">{t.common.cancel}</button>
                <button onClick={addInspection}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm">{t.common.save}</button>
              </div>
            </div>
          )}

          {inspections.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">{lang === "tr" ? "Henüz muayene kaydı yok" : "No inspection records yet"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspections.map((ins) => {
                const varroa = parseFloat(ins.varroaCount);
                const varroaColor = isNaN(varroa) ? "text-gray-500" : varroa >= 3 ? "text-red-400" : varroa >= 1 ? "text-amber-400" : "text-emerald-400";
                return (
                  <div key={ins.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 group hover:border-gray-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-sm font-medium text-gray-200">{ins.date}</span>
                          {ins.queenSeen && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">{lang === "tr" ? "👑 Kraliçe görüldü" : "👑 Queen spotted"}</span>
                          )}
                          {ins.treatmentType && ins.treatmentType !== TREATMENT_TYPES_TR[0] && ins.treatmentType !== TREATMENT_TYPES_EN[0] && (
                            <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full">💊 {ins.treatmentType}</span>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                          {ins.frames && <span>{lang === "tr" ? "Çerçeve" : "Frames"}: <strong className="text-gray-200">{ins.frames}</strong></span>}
                          {ins.varroaCount !== "" && (
                            <span>{lang === "tr" ? "Varroa" : "Varroa"}: <strong className={varroaColor}>{ins.varroaCount}</strong></span>
                          )}
                        </div>
                        {ins.notes && <p className="text-xs text-gray-400 mt-2 break-words">{ins.notes}</p>}
                      </div>
                      <button onClick={() => deleteInspection(ins.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={lang === "tr" ? "Kaydı sil" : "Delete record"}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Harvest Tracker Tab ────────────────────────────────────────── */}
      {activeTab === "harvest" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-200">{lang === "tr" ? "Bal Hasadı Takibi" : "Honey Harvest Tracker"}</h3>
              {harvests.length > 0 && (
                <p className="text-xs text-amber-400 mt-0.5">
                  {lang === "tr" ? `Toplam: ${totalHarvestKg.toFixed(1)} kg` : `Total: ${totalHarvestKg.toFixed(1)} kg`}
                </p>
              )}
            </div>
            <button onClick={() => setShowHarvestForm((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" />
              {lang === "tr" ? "Hasat Ekle" : "Add Harvest"}
            </button>
          </div>

          {showHarvestForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{lang === "tr" ? "Tarih" : "Date"}</label>
                  <input type="date" value={harvestForm.date}
                    onChange={(e) => setHarvestForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{lang === "tr" ? "Miktar (kg)" : "Amount (kg)"}</label>
                  <input type="number" min="0" step="0.1" value={harvestForm.amountKg}
                    onChange={(e) => setHarvestForm((p) => ({ ...p, amountKg: e.target.value }))}
                    placeholder={lang === "tr" ? "Örn: 12.5" : "e.g. 12.5"}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{lang === "tr" ? "Kalite" : "Quality"}</label>
                  <select value={harvestForm.quality}
                    onChange={(e) => setHarvestForm((p) => ({ ...p, quality: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500">
                    {(lang === "tr" ? HARVEST_QUALITY_TR : HARVEST_QUALITY_EN).map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{lang === "tr" ? "Notlar" : "Notes"}</label>
                <textarea rows={2} value={harvestForm.notes}
                  onChange={(e) => setHarvestForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowHarvestForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">{t.common.cancel}</button>
                <button onClick={addHarvest} disabled={!harvestForm.amountKg}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-sm">{t.common.save}</button>
              </div>
            </div>
          )}

          {harvests.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">{lang === "tr" ? "Henüz hasat kaydı yok" : "No harvest records yet"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {harvests.map((h) => (
                <div key={h.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 group hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="text-sm font-medium text-gray-200">{h.date}</span>
                        <span className="text-base font-bold text-amber-400">🍯 {h.amountKg} kg</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">{h.quality}</span>
                      </div>
                      {h.notes && <p className="text-xs text-gray-400 mt-1 break-words">{h.notes}</p>}
                    </div>
                    <button onClick={() => deleteHarvest(h.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={lang === "tr" ? "Kaydı sil" : "Delete record"}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Custom Thresholds Tab ──────────────────────────────────────── */}
      {activeTab === "thresholds" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-200 mb-1">
              {lang === "tr" ? "Özel Uyarı Eşikleri" : "Custom Alert Thresholds"}
            </h3>
            <p className="text-xs text-gray-500">
              {lang === "tr"
                ? "Bu kovan için kişiselleştirilmiş alarm sınırları belirleyin."
                : "Set personalised alarm limits for this hive."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: lang === "tr" ? "Min. Sıcaklık (°C)" : "Min. Temp (°C)", key: "tempMin", min: 10, max: 40 },
              { label: lang === "tr" ? "Maks. Sıcaklık (°C)" : "Max. Temp (°C)", key: "tempMax", min: 10, max: 50 },
              { label: lang === "tr" ? "Min. Nem (%)" : "Min. Humidity (%)", key: "humMin", min: 0, max: 100 },
              { label: lang === "tr" ? "Maks. Nem (%)" : "Max. Humidity (%)", key: "humMax", min: 0, max: 100 },
              { label: lang === "tr" ? "Min. Pil (%)" : "Min. Battery (%)", key: "batteryMin", min: 0, max: 50 },
            ].map(({ label, key, min, max }) => (
              <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <label className="block text-xs text-gray-400 mb-3">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={min} max={max}
                    value={thresholds[key]}
                    onChange={(e) => setThresholds((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-sm font-semibold text-amber-400 w-12 text-right tabular-nums">
                    {thresholds[key]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={saveThresholds}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              {lang === "tr" ? "Kaydet" : "Save"}
            </button>
            {thresholdsSaved && (
              <span className="text-sm text-emerald-400">
                ✓ {lang === "tr" ? "Kaydedildi" : "Saved"}
              </span>
            )}
            <button onClick={() => { setThresholds(DEFAULT_THRESHOLDS); setThresholdsSaved(false); }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-sm transition-colors">
              {lang === "tr" ? "Varsayılana Dön" : "Reset to Default"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SensorCard = ({ icon: Icon, title, value, status, color, cached }) => (
  <div
    className={`bg-gray-900 border rounded-lg p-6 text-center hover:border-gray-600 transition-colors group ${
      cached ? "border-amber-500/30 border-dashed" : "border-gray-700"
    }`}
  >
    <div className="flex justify-center mb-4 text-gray-400 group-hover:text-gray-300">
      <Icon className="w-8 h-8" strokeWidth={1.5} />
    </div>
    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">
      {title}
    </h3>
    <p
      className={`text-4xl font-light mb-4 tabular-nums ${cached ? "text-gray-400" : "text-gray-100"}`}
    >
      {value}
    </p>
    <p className={`text-sm font-medium ${color}`}>{status}</p>
  </div>
);

export default HiveDetailView;
