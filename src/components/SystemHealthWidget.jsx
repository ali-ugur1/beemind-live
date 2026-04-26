import { useMemo } from "react";
import {
  Activity,
  Server,
  Wifi,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

function formatSince(date, isTr) {
  if (!date) return isTr ? "Bilinmiyor" : "Unknown";
  const ms = Date.now() - date.getTime();
  if (ms < 0) return isTr ? "Az önce" : "Just now";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return isTr ? "Az önce" : "Just now";
  if (mins < 60) return isTr ? `${mins} dk önce` : `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return isTr ? `${hrs} saat önce` : `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return isTr ? `${days} gün önce` : `${days}d ago`;
}

function isStorageAvailable() {
  try {
    const k = "__hc_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const SystemHealthWidget = () => {
  const { hives, apiConnected, gateway, lastApiUpdate } = useLiveData();
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isTr = lang === "tr";
  const isDark = theme === "dark";

  const health = useMemo(() => {
    const total = hives.length;
    const critical = hives.filter((h) => h.status === "critical").length;
    const warning = hives.filter((h) => h.status === "warning").length;
    const stable = Math.max(0, total - critical - warning);
    const lowBat = hives.filter(
      (h) => typeof h.battery === "number" && h.battery < 20,
    ).length;

    // Ağırlıklı skor: stable=100, warning=60, critical=10, düşük batarya başına -3 (max -15)
    let score = 0;
    if (total > 0) {
      const base = (stable * 100 + warning * 60 + critical * 10) / total;
      const batteryPenalty = Math.min(15, lowBat * 3);
      score = Math.round(base - batteryPenalty);
    }
    const clampedScore = Math.max(0, Math.min(100, score));

    let status = "good";
    let statusText = isTr ? "Sistem Sağlıklı" : "System Healthy";
    let statusColor = "text-emerald-400";
    let statusBg = isDark
      ? "bg-emerald-500/10 border-emerald-500/30"
      : "bg-emerald-50 border-emerald-200";

    if (total === 0) {
      status = "idle";
      statusText = isTr ? "Veri Yok" : "No Data";
      statusColor = "text-gray-400";
      statusBg = isDark
        ? "bg-gray-500/10 border-gray-500/30"
        : "bg-gray-50 border-gray-200";
    } else if (clampedScore < 50) {
      status = "critical";
      statusText = isTr ? "Kritik Durum" : "Critical Status";
      statusColor = "text-red-400";
      statusBg = isDark
        ? "bg-red-500/10 border-red-500/30"
        : "bg-red-50 border-red-200";
    } else if (clampedScore < 75) {
      status = "warning";
      statusText = isTr ? "Dikkat Gerekli" : "Attention Needed";
      statusColor = "text-amber-400";
      statusBg = isDark
        ? "bg-amber-500/10 border-amber-500/30"
        : "bg-amber-50 border-amber-200";
    }

    return {
      score: clampedScore,
      status,
      statusText,
      statusColor,
      statusBg,
      total,
      critical,
      warning,
      stable,
      lowBat,
    };
  }, [hives, isTr, isDark]);

  const services = useMemo(
    () => [
      {
        name: "ESP32 Gateway",
        status: gateway?.status === "online" ? "online" : "offline",
        icon: Server,
      },
      {
        name: isTr ? "API Sunucusu" : "API Server",
        status: apiConnected ? "online" : "offline",
        icon: Cpu,
      },
      {
        name: isTr ? "Sensör Ağı" : "Sensor Network",
        // Hiç kovan yoksa offline, kritik varsa warning, aksi halde online
        status:
          health.total === 0
            ? "offline"
            : health.critical > 0
              ? "warning"
              : "online",
        icon: Wifi,
      },
      {
        name: isTr ? "Veri Depolama" : "Data Storage",
        status: isStorageAvailable() ? "online" : "offline",
        icon: HardDrive,
      },
    ],
    [gateway, apiConnected, health.total, health.critical, isTr],
  );

  const getServiceIcon = (status) => {
    if (status === "online")
      return (
        <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
      );
    if (status === "warning")
      return (
        <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
      );
    return <XCircle className="w-4 h-4 text-red-400" aria-hidden="true" />;
  };

  const getServiceLabel = (status) => {
    if (status === "online") return isTr ? "Aktif" : "Online";
    if (status === "warning") return isTr ? "Uyarı" : "Warning";
    return isTr ? "Çevrimdışı" : "Offline";
  };

  const getServiceTextColor = (status) => {
    if (status === "online") return "text-emerald-400";
    if (status === "warning") return "text-amber-400";
    return "text-red-400";
  };

  const ringColor =
    health.status === "idle"
      ? "#6b7280"
      : health.score >= 75
        ? "#10b981"
        : health.score >= 50
          ? "#f59e0b"
          : "#ef4444";

  const trackColor = isDark ? "#374151" : "#e5e7eb";
  const rowBg = isDark ? "bg-gray-900/50" : "bg-gray-100/70";
  const rowText = isDark ? "text-gray-300" : "text-gray-700";
  const subText = isDark ? "text-gray-500" : "text-gray-600";
  const headingText = isDark ? "text-gray-400" : "text-gray-600";
  const dividerColor = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <div
      className={`border rounded-lg p-6 ${health.statusBg}`}
      role="region"
      aria-label={isTr ? "Sistem sağlığı" : "System health"}
    >
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-amber-400" aria-hidden="true" />
        <h3 className={`text-sm font-semibold uppercase ${headingText}`}>
          {isTr ? "Sistem Sağlığı" : "System Health"}
        </h3>
      </div>

      {/* Health Score Circle */}
      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 36 36"
            role="img"
            aria-label={`${isTr ? "Sağlık skoru" : "Health score"}: ${health.score}/100`}
          >
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={trackColor}
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={ringColor}
              strokeWidth="3"
              strokeDasharray={`${health.score}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${health.statusColor}`}>
              {health.score}
            </span>
          </div>
        </div>
        <div>
          <p className={`text-lg font-bold ${health.statusColor}`}>
            {health.statusText}
          </p>
          <p className={`text-xs mt-1 ${subText}`}>
            {health.total} {isTr ? "kovan aktif" : "hives active"}
            {" · "}
            {health.critical} {isTr ? "kritik" : "critical"}
            {health.lowBat > 0 && (
              <>
                {" · "}
                {health.lowBat} {isTr ? "düşük pil" : "low battery"}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Services Status */}
      <ul
        className="space-y-2"
        aria-label={isTr ? "Servis durumları" : "Service statuses"}
      >
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <li
              key={svc.name}
              className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${rowBg}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${subText}`} aria-hidden="true" />
                <span className={`text-xs ${rowText}`}>{svc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {getServiceIcon(svc.status)}
                <span
                  className={`text-xs font-medium ${getServiceTextColor(svc.status)}`}
                >
                  {getServiceLabel(svc.status)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Last sync */}
      <div
        className={`mt-4 pt-4 border-t ${dividerColor} flex items-center justify-between`}
      >
        <div className={`flex items-center gap-2 text-xs ${subText}`}>
          <Clock className="w-3 h-3" aria-hidden="true" />
          <span>
            {isTr ? "Son güncelleme:" : "Last update:"}{" "}
            {formatSince(lastApiUpdate, isTr)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${apiConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
            aria-hidden="true"
          />
          <span className={`text-xs ${subText}`}>
            {apiConnected
              ? isTr
                ? "Canlı"
                : "Live"
              : isTr
                ? "Çevrimdışı"
                : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthWidget;
