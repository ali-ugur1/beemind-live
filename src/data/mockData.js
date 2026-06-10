// Varsayılan tek kovan - gerçek kullanıcı kovanı
// Kullanıcı yeni kovan ekledikçe localStorage'a kaydedilir
export const DEFAULT_HIVE = {
  id: "hive-001",
  name: "Kovan 1",
  status: "stable",
  alertType: null,
  temp: 0,
  humidity: 0,
  pressure: 0,
  vibration: 0,
  battery: 100,
  weight: 0,
  sound: 0,
  soundDb: null,
  lastUpdate: "",
  lastActivity: "",
  priority: 3,
  lat: 37.8746,
  lng: 32.4932,
  location: "Konya Merkez",
  deviceSerial: "",
  hasData: false,
};

// --- Sabitler ---

const STATUS_COLORS = {
  critical: {
    border: "border-red-600",
    bg: "bg-red-600/10",
    text: "text-red-500",
    badge: "bg-red-600",
  },
  warning: {
    border: "border-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    badge: "bg-amber-500",
  },
  stable: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    badge: "bg-emerald-500",
  },
};

const STATUS_FALLBACK_COLOR = {
  border: "border-gray-600",
  bg: "bg-gray-600/10",
  text: "text-gray-500",
  badge: "bg-gray-600",
};

const STATUS_LABELS = {
  critical: { tr: "KRİTİK", en: "CRITICAL" },
  warning: { tr: "UYARI", en: "WARNING" },
  stable: { tr: "STABİL", en: "STABLE" },
};

const STATUS_LABEL_FALLBACK = { tr: "BİLİNMİYOR", en: "UNKNOWN" };

const NOTIFICATION_ICONS = {
  critical: "🔴",
  warning: "⚠️",
  info: "ℹ️",
};

const NOTIFICATION_ICON_FALLBACK = "📢";

// --- Utility fonksiyonları ---

/**
 * Verilen duruma (status) karşılık gelen Tailwind renk sınıflarını döner.
 * @param {string} status - 'critical' | 'warning' | 'stable'
 * @returns {{ border: string, bg: string, text: string, badge: string }}
 */
export const getStatusColor = (status) =>
  STATUS_COLORS[status] ?? STATUS_FALLBACK_COLOR;

/**
 * Verilen duruma ve dile karşılık gelen etiket metnini döner.
 * @param {string} status - 'critical' | 'warning' | 'stable'
 * @param {string} [lang='tr'] - 'tr' | 'en'
 * @returns {string}
 */
export const getStatusText = (status, lang) => {
  const locale = lang && lang !== "tr" ? "en" : "tr";
  return (STATUS_LABELS[status] ?? STATUS_LABEL_FALLBACK)[locale];
};

/**
 * Verilen bildirim tipine karşılık gelen emoji simgesini döner.
 * @param {string} type - 'critical' | 'warning' | 'info'
 * @returns {string}
 */
export const getNotificationIcon = (type) =>
  NOTIFICATION_ICONS[type] ?? NOTIFICATION_ICON_FALLBACK;
