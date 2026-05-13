import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  Battery,
  BatteryCharging,
  Cloud,
  Droplets,
  Wind,
  Sun,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Zap,
  FileText,
  Wrench,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useLiveData } from "../contexts/LiveDataContext";
import SystemHealthWidget from "./SystemHealthWidget";
import ActivityFeed from "./ActivityFeed";
import SeasonalTips from "./SeasonalTips";

const OverviewDashboard = ({ stats, hives, onViewDetail, onNavigate }) => {
  const toast = useToast();
  const { t } = useLanguage();
  const {
    gateway: apiGateway,
    weather: apiWeather,
    apiConnected,
    refreshData,
  } = useLiveData();
  const [quickLoading, setQuickLoading] = useState(null);

  const handleQuickAction = useCallback(
    async (action) => {
      if (action === "scan") {
        setQuickLoading("scan");
        try {
          await refreshData();
          toast.success(t.overview.scanSuccess);
        } catch {
          toast.error(t.overview?.scanError || "Tarama başarısız");
        } finally {
          setQuickLoading(null);
        }
        return;
      }

      if (action === "report") {
        if (onNavigate) onNavigate("reports");
        else toast.info(t.overview.reportSuccess);
        return;
      }

      if (action === "maintenance") {
        if (onNavigate) onNavigate("calendar");
        else toast.info(t.overview.maintenanceInfo);
      }
    },
    [refreshData, toast, t, onNavigate],
  );

  // Gateway bilgisi — API'den gelir, yoksa hives verisinden türetilir
  const gateway = useMemo(() => {
    if (apiGateway && apiGateway.status !== "offline") {
      return {
        ...apiGateway,
        connectedHives: apiGateway.connectedHives ?? hives.length,
        lastSync: apiGateway.lastSync
          ? getTimeSince(apiGateway.lastSync, t)
          : "—",
      };
    }
    return {
      id: "GW-001",
      batteryLevel: 78,
      isCharging: false,
      signalStrength: apiConnected ? 92 : 0,
      status: apiConnected ? "online" : "offline",
      lastSync: apiConnected ? t.overview.justNow : "—",
      connectedHives: hives.length,
    };
  }, [apiGateway, apiConnected, hives.length, t]);

  // Hava durumu — API'den gelir, yoksa fallback
  const weather = useMemo(() => {
    if (apiWeather) {
      const condition = apiWeather.condition || apiWeather.description || "—";
      return {
        location: apiWeather.location || t.weather.unknownLocation,
        temp: apiWeather.temp ?? apiWeather.temperature ?? "—",
        condition,
        humidity: apiWeather.humidity ?? "—",
        windSpeed: apiWeather.windSpeed ?? apiWeather.wind ?? "—",
        icon: apiWeather.icon || getWeatherIcon(condition),
        forecast: Array.isArray(apiWeather.forecast) ? apiWeather.forecast : [],
        feelsLike: apiWeather.feelsLike,
        _source: apiWeather._source,
      };
    }
    // Fallback: sensör ortalamasından türet
    const hasHives = hives.length > 0;
    const avgTemp = hasHives
      ? Number(
          (hives.reduce((s, h) => s + (h.temp ?? 0), 0) / hives.length).toFixed(
            0,
          ),
        )
      : "—";
    const avgHum = hasHives
      ? Number(
          (
            hives.reduce((s, h) => s + (h.humidity ?? 0), 0) / hives.length
          ).toFixed(0),
        )
      : "—";
    return {
      location: "Konya, Selçuklu",
      temp: avgTemp,
      condition: t.weather.sensorData,
      humidity: avgHum,
      windSpeed: "—",
      icon: Sun,
      forecast: [],
    };
  }, [apiWeather, hives, t]);

  // Kritik uyarılar — memoize edildi
  const criticalAlerts = useMemo(
    () =>
      hives
        .filter((h) => h.status === "critical")
        .map((h) => ({
          id: h.id,
          name: h.name || h.id,
          message: h.alertType,
          time: h.lastUpdate,
        })),
    [hives],
  );

  // Trend analizi
  const trends = useMemo(() => {
    const count = hives.length;
    if (count === 0) {
      return {
        temperature: { value: "—", trend: "stable", change: "0°C" },
        humidity: { value: "—", trend: "stable", change: "0%" },
        battery: {
          value: 0,
          trend: "stable",
          change: `0 ${t.overview.hivesUnit}`,
        },
      };
    }
    const avgTemp = (
      hives.reduce((sum, h) => sum + (h.temp ?? 0), 0) / count
    ).toFixed(1);
    const avgHumidity = (
      hives.reduce((sum, h) => sum + (h.humidity ?? 0), 0) / count
    ).toFixed(0);
    const lowBattery = hives.filter((h) => (h.battery ?? 100) < 30).length;

    return {
      temperature: { value: avgTemp, trend: "up", change: "+0.5°C" },
      humidity: { value: avgHumidity, trend: "stable", change: "0%" },
      battery: {
        value: lowBattery,
        trend: lowBattery > 0 ? "down" : "stable",
        change: `${lowBattery} ${t.overview.hivesUnit}`,
      },
    };
  }, [hives, t]);

  // Weather icon: gerçek veriden emoji gelir, fallback'te React component gelir
  const weatherIconIsEmoji = typeof weather.icon === "string";
  const WeatherIcon = weatherIconIsEmoji ? null : weather.icon;

  const batteryBarColor =
    gateway.batteryLevel > 50
      ? "bg-emerald-500"
      : gateway.batteryLevel > 20
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="space-y-6">
      {/* Maya Sezonsal İpuçları */}
      <SeasonalTips />

      {/* Üst Kısım: Gateway + Hava Durumu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gateway Card */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center p-2">
                <img
                  src="/beemora-logo.svg"
                  alt="Gateway"
                  className="w-full h-full object-contain"
                  style={{
                    filter:
                      "brightness(1.2) drop-shadow(0 0 4px rgba(245, 158, 11, 0.5))",
                  }}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase">
                  Gateway
                </h3>
                <p className="text-2xl font-bold text-gray-100">{gateway.id}</p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                gateway.status === "online"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}
              role="status"
            >
              {gateway.status === "online"
                ? t.gateway.online
                : t.gateway.offline}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pil Durumu */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {gateway.isCharging ? (
                  <BatteryCharging
                    className="w-5 h-5 text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Battery
                    className="w-5 h-5 text-amber-400"
                    aria-hidden="true"
                  />
                )}
                <span className="text-xs text-gray-500">
                  {t.gateway.battery}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-100 tabular-nums">
                {gateway.batteryLevel}%
              </p>
              <div
                className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={gateway.batteryLevel}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`h-full transition-all duration-500 ${batteryBarColor}`}
                  style={{
                    width: `${Math.max(0, Math.min(100, gateway.batteryLevel))}%`,
                  }}
                />
              </div>
            </div>

            {/* Sinyal Gücü */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-5 h-5 text-blue-400" aria-hidden="true" />
                <span className="text-xs text-gray-500">
                  {t.gateway.signal}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-100 tabular-nums">
                {gateway.signalStrength}%
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {gateway.connectedHives} {t.gateway.hivesConnected}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            {t.gateway.lastSync}: {gateway.lastSync}
          </p>
        </div>

        {/* Hava Durumu Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl shrink-0">
                {weatherIconIsEmoji ? (
                  <span aria-hidden="true">{weather.icon}</span>
                ) : (
                  WeatherIcon && (
                    <WeatherIcon
                      className="w-6 h-6 text-blue-400"
                      aria-hidden="true"
                    />
                  )
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4 text-gray-500 shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-semibold text-gray-400 truncate">
                    {weather.location}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {weather.condition}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-4xl font-bold text-gray-100 tabular-nums">
                {weather.temp}°C
              </p>
              {weather.feelsLike !== undefined &&
                weather.feelsLike !== null && (
                  <p className="text-xs text-gray-500">
                    {t.weather.feelsLike}: {weather.feelsLike}°C
                  </p>
                )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
              <Droplets
                className="w-5 h-5 text-cyan-400 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {t.weather?.humidity || "Nem"}
                </p>
                <p className="text-lg font-semibold text-gray-100 tabular-nums">
                  {weather.humidity}%
                </p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
              <Wind
                className="w-5 h-5 text-gray-400 shrink-0"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">
                  {t.weather?.wind || "Rüzgar"}
                </p>
                <p className="text-lg font-semibold text-gray-100 tabular-nums">
                  {weather.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>

          {/* 3 Günlük Tahmin */}
          {weather.forecast.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-800 pt-4">
              {weather.forecast.map((day, i) => (
                <div key={day.day ?? i} className="text-center">
                  <p className="text-xs text-gray-500 mb-2">{day.day}</p>
                  <span className="text-xl block mb-1" aria-hidden="true">
                    {day.icon || "☀️"}
                  </span>
                  <p className="text-sm font-semibold text-gray-300 tabular-nums">
                    {day.temp}°C
                  </p>
                  {day.condition && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      {day.condition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {weather._source && (
            <p className="text-[10px] text-gray-600 mt-3 text-right">
              Open-Meteo
            </p>
          )}
        </div>
      </div>

      {/* İstatistik Kartları */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <StatCard
          title={t.stats.totalHives}
          value={stats.total}
          icon="🐝"
          color="amber"
        />
        <StatCard
          title={t.stats.critical}
          value={stats.critical}
          icon="🔴"
          color="red"
          pulse={stats.critical > 0}
        />
        <StatCard
          title={t.stats.warning}
          value={stats.warning}
          icon="⚠️"
          color="yellow"
        />
        <StatCard
          title={t.stats.stable}
          value={Math.max(0, stats.total - stats.critical - stats.warning)}
          icon="✅"
          color="green"
        />
      </motion.div>

      {/* Trend Analizi */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <TrendCard
          title={t.overview.avgTemp}
          value={`${trends.temperature.value}°C`}
          trend={trends.temperature.trend}
          change={trends.temperature.change}
          icon={Sun}
        />
        <TrendCard
          title={t.overview.avgHumidity}
          value={`${trends.humidity.value}%`}
          trend={trends.humidity.trend}
          change={trends.humidity.change}
          icon={Droplets}
        />
        <TrendCard
          title={t.overview.lowBattery}
          value={trends.battery.value}
          trend={trends.battery.trend}
          change={trends.battery.change}
          icon={Battery}
        />
      </motion.div>

      {/* Kritik Uyarılar */}
      {criticalAlerts.length > 0 && (
        <div
          className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-6"
          role="alert"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle
              className="w-6 h-6 text-red-500"
              aria-hidden="true"
            />
            <h3 className="text-lg font-semibold text-red-500">
              {t.overview.criticalAlerts}
            </h3>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                className="w-full text-left bg-gray-900/50 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/60"
                onClick={() => onViewDetail && onViewDetail(alert.id)}
                aria-label={`${alert.name}: ${alert.message}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    🔴
                  </span>
                  <div>
                    <p className="font-semibold text-gray-100">{alert.name}</p>
                    <p className="text-sm text-gray-400">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{alert.time}</span>
                  <span className="text-amber-400 text-sm" aria-hidden="true">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı Eylemler */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
          ⚡ {t.overview.quickActionsTitle}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleQuickAction("scan")}
            disabled={quickLoading === "scan"}
            className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500/60"
            aria-busy={quickLoading === "scan"}
          >
            <Zap
              className={`w-5 h-5 text-amber-400 ${quickLoading === "scan" ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-gray-200">
              {quickLoading === "scan"
                ? t.quickActions.scanning
                : t.quickActions.scanAll}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleQuickAction("report")}
            disabled={quickLoading === "report"}
            className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            aria-busy={quickLoading === "report"}
          >
            <FileText
              className={`w-5 h-5 text-blue-400 ${quickLoading === "report" ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-gray-200">
              {quickLoading === "report"
                ? t.quickActions.reportCreating
                : t.quickActions.urgentReport}
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleQuickAction("maintenance")}
            disabled={quickLoading === "maintenance"}
            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            aria-busy={quickLoading === "maintenance"}
          >
            <Wrench
              className={`w-5 h-5 text-emerald-400 ${quickLoading === "maintenance" ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-gray-200">
              {quickLoading === "maintenance"
                ? t.overview.planning
                : t.quickActions.planMaintenance}
            </span>
          </motion.button>
        </div>
      </div>

      {/* System Health + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SystemHealthWidget />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed limit={8} onViewDetail={onViewDetail} />
        </div>
      </div>
    </div>
  );
};

// Animated counter hook — SSR-safe, cleanup fixed
function useCountUp(target, duration = 800) {
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [val, setVal] = useState(safeTarget);
  const rafRef = useRef(null);
  const prevTargetRef = useRef(safeTarget);

  useEffect(() => {
    if (typeof window === "undefined" || typeof performance === "undefined") {
      setVal(safeTarget);
      return undefined;
    }

    // Önceki animasyonu iptal et
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const from = prevTargetRef.current;
    const to = safeTarget;

    if (from === to) {
      setVal(to);
      return undefined;
    }

    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * p);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        prevTargetRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [safeTarget, duration]);

  return val;
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, pulse }) => {
  const colors = {
    amber: "from-amber-500/20 to-orange-500/20 border-amber-500/50",
    red: "from-red-500/20 to-rose-500/20 border-red-500/50",
    yellow: "from-yellow-500/20 to-amber-500/20 border-yellow-500/50",
    green: "from-emerald-500/20 to-green-500/20 border-emerald-500/50",
  };
  const count = useCountUp(value ?? 0);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.94 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 280, damping: 24 },
        },
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`bg-gradient-to-br ${colors[color] || colors.amber} border rounded-lg p-6`}
    >
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
        {title}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-4xl font-bold text-gray-100 tabular-nums">{count}</p>
        <motion.span
          className="text-3xl"
          aria-hidden="true"
          animate={pulse && value > 0 ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{
            repeat: pulse && value > 0 ? Infinity : 0,
            duration: 1.8,
            repeatDelay: 0.5,
          }}
        >
          {icon}
        </motion.span>
      </div>
    </motion.div>
  );
};

// Trend Card Component
const TrendCard = ({ title, value, trend, change, icon: Icon }) => {
  const trendIcons = {
    up: { icon: TrendingUp, color: "text-emerald-400" },
    down: { icon: TrendingDown, color: "text-red-400" },
    stable: { icon: Minus, color: "text-gray-400" },
  };

  const { icon: TrendIcon, color: trendColor } =
    trendIcons[trend] || trendIcons.stable;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 260, damping: 22 },
        },
      }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="bg-gray-900 border border-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-gray-400" aria-hidden="true" />
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" aria-hidden="true" />
          <span className="text-xs font-semibold">{change}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-100 tabular-nums">{value}</p>
    </motion.div>
  );
};

export default OverviewDashboard;

// Yardımcı fonksiyonlar
function getTimeSince(isoStr, t) {
  try {
    const ts = new Date(isoStr).getTime();
    if (Number.isNaN(ts)) return "—";
    const diff = Date.now() - ts;
    if (diff < 0) return t.overview.justNow;
    const min = Math.floor(diff / 60000);
    if (min < 1) return t.overview.justNow;
    if (min < 60) return `${min} ${t.overview.minutesAgo}`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} ${t.overview.hoursAgo}`;
    const day = Math.floor(hr / 24);
    return `${day} ${t.overview.daysAgo || "gün önce"}`;
  } catch {
    return "—";
  }
}

function getWeatherIcon(condition) {
  if (!condition || typeof condition !== "string") return Sun;
  const c = condition.toLowerCase();
  if (c.includes("cloud") || c.includes("bulut")) return Cloud;
  if (c.includes("rain") || c.includes("yağmur")) return Droplets;
  if (c.includes("wind") || c.includes("rüzgar")) return Wind;
  return Sun;
}
