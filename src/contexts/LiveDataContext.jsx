import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { api, apiToHiveFormat } from "../services/api";
import { fetchWeather } from "../services/weather";
import { DEFAULT_HIVE } from "../data/mockData";

const LiveDataContext = createContext();

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context)
    throw new Error("useLiveData must be used within LiveDataProvider");
  return context;
};

const HIVES_STORAGE_KEY = "beemora_hives";
const SETTINGS_STORAGE_KEY = "beemora_settings";
const LANG_STORAGE_KEY = "beemora_language";
const POLL_INTERVAL_MS = 30_000; // 30 sn
const WEATHER_INTERVAL_MS = 15 * 60_000; // 15 dk
const STALE_THRESHOLD_MS = 2 * 60_000; // 2 dk
const MAX_BACKOFF_MS = 60_000; // max 60 sn

const getLocalHives = () => {
  try {
    const stored = localStorage.getItem(HIVES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const initial = [DEFAULT_HIVE];
  try {
    localStorage.setItem(HIVES_STORAGE_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
};

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

const DEFAULT_GATEWAY = {
  id: "GW-001",
  batteryLevel: 0,
  isCharging: false,
  signalStrength: 0,
  status: "offline",
  lastSync: null,
  connectedHives: 0,
};

// Üstel geri çekilme: 5s → 10s → 20s → 40s → max 60s
const backoffMs = (attempt) =>
  Math.min(5000 * 2 ** Math.max(0, attempt - 1), MAX_BACKOFF_MS);

export const LiveDataProvider = ({ children }) => {
  const [hives, setHives] = useState(() => getLocalHives());
  const [apiConnected, setApiConnected] = useState(false);
  const [lastApiUpdate, setLastApiUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gateway, setGateway] = useState(DEFAULT_GATEWAY);
  const [weather, setWeather] = useState(null);

  const pollRef = useRef(null);
  const weatherRef = useRef(null);
  const retryRef = useRef(null);
  const abortRef = useRef(null);
  const failCountRef = useRef(0);
  const mountedRef = useRef(true);
  const isFetchingRef = useRef(false); // eşzamanlı tekrar çağrıyı engelle

  // localStorage'a hives değişimini kaydet
  useEffect(() => {
    safeSetItem(HIVES_STORAGE_KEY, JSON.stringify(hives));
  }, [hives]);

  // unmount işaretçisi + tüm timer/abort temizliği
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(pollRef.current);
      clearInterval(weatherRef.current);
      clearTimeout(retryRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // ── Veri çekme (AbortController + reentrancy guard) ────────────────────
  const fetchLiveData = useCallback(async () => {
    if (!mountedRef.current) return;
    if (isFetchingRef.current) return; // önceki istek bitmeden tetikleme

    // bekleyen retry varsa iptal et (gereksiz tekrar çağrı olmasın)
    clearTimeout(retryRef.current);
    retryRef.current = null;

    // önceki uçuşan isteği iptal et
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    isFetchingRef.current = true;
    try {
      const data = await api.getHivesSummary(controller.signal);
      if (!mountedRef.current || controller.signal.aborted) return;

      if (data?.hives && data.hives.length > 0) {
        setHives(data.hives.map(apiToHiveFormat));
        setApiConnected(true);
        setLastApiUpdate(new Date());
        setError(null);
        failCountRef.current = 0;
      }
      setLoading(false);
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) return;
      if (err?.name === "AbortError") return;

      failCountRef.current += 1;
      setApiConnected(false);
      setError(err?.message || "Unknown error");
      setLoading(false);

      // Üstel geri çekilme ile yeniden dene
      const delay = backoffMs(failCountRef.current);
      clearTimeout(retryRef.current);
      retryRef.current = setTimeout(() => {
        retryRef.current = null;
        if (mountedRef.current) fetchLiveData();
      }, delay);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // ── Yardımcı veri (gateway + hava durumu) ──────────────────────────────
  const fetchAuxData = useCallback(async () => {
    // Gateway
    try {
      const gwData = await api.getGatewayStatus();
      if (mountedRef.current && gwData) {
        setGateway({
          id: gwData.id || "GW-001",
          batteryLevel: gwData.batteryLevel ?? gwData.battery ?? 0,
          isCharging: !!gwData.isCharging,
          signalStrength: gwData.signalStrength ?? gwData.signal ?? 0,
          status: gwData.status || "online",
          lastSync: gwData.lastSync || new Date().toISOString(),
          connectedHives: gwData.connectedHives ?? 0,
        });
      }
    } catch {}

    // Hava durumu
    let locationName = "Konya";
    const saved = safeGetItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.location) {
          const first = String(parsed.location).split(",")[0].trim();
          if (first) locationName = first;
        }
      } catch {}
    }
    const lang = safeGetItem(LANG_STORAGE_KEY) || "tr";

    try {
      const weatherData = await fetchWeather(locationName, lang);
      if (mountedRef.current && weatherData) {
        setWeather(weatherData);
        return;
      }
    } catch {}

    try {
      const fallback = await api.getWeather();
      if (mountedRef.current && fallback) setWeather(fallback);
    } catch {}
  }, []);

  // ── Polling + sekme görünürlük yönetimi ────────────────────────────────
  useEffect(() => {
    const startPolling = () => {
      if (pollRef.current) return;
      fetchLiveData();
      pollRef.current = setInterval(fetchLiveData, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      clearInterval(pollRef.current);
      pollRef.current = null;
      clearTimeout(retryRef.current);
      retryRef.current = null;
      if (abortRef.current) abortRef.current.abort();
    };

    const startWeather = () => {
      if (weatherRef.current) return;
      fetchAuxData();
      weatherRef.current = setInterval(fetchAuxData, WEATHER_INTERVAL_MS);
    };

    const stopWeather = () => {
      clearInterval(weatherRef.current);
      weatherRef.current = null;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        startPolling();
        startWeather();
      } else {
        stopPolling();
        stopWeather();
      }
    };

    // İlk başlatma
    startPolling();
    startWeather();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stopPolling();
      stopWeather();
    };
  }, [fetchLiveData, fetchAuxData]);

  // ── Veri bayatlık kontrolü ──────────────────────────────────────────────
  const isDataStale = useMemo(() => {
    if (!lastApiUpdate) return false;
    return Date.now() - lastApiUpdate.getTime() > STALE_THRESHOLD_MS;
  }, [lastApiUpdate]);

  // ── CRUD ────────────────────────────────────────────────────────────────
  const deleteHive = useCallback(async (hiveId) => {
    let snapshot;
    setHives((prev) => {
      snapshot = prev;
      return prev.filter((h) => h.id !== hiveId);
    });
    try {
      await api.deleteHive(hiveId);
    } catch (err) {
      console.warn("Backend hive delete failed:", err?.message);
      if (mountedRef.current && snapshot) setHives(snapshot); // rollback
    }
  }, []);

  const addHive = useCallback((h) => setHives((p) => [...p, h]), []);
  const updateHive = useCallback(
    (id, data) =>
      setHives((p) => p.map((h) => (h.id === id ? { ...h, ...data } : h))),
    [],
  );

  // ── Bildirimler ─────────────────────────────────────────────────────────
  const notifications = useMemo(() => {
    const lang = safeGetItem(LANG_STORAGE_KEY) || "tr";
    const isTr = lang === "tr";
    const notifs = [];
    let id = 1;

    // Status bazlı uyarılar
    hives.forEach((hive) => {
      if (hive.status === "critical") {
        notifs.push({
          id: id++,
          type: "critical",
          hiveId: hive.id,
          message:
            hive.alertType ||
            (isTr ? "Kritik durum algılandı" : "Critical status detected"),
          time: hive.lastUpdate,
          read: false,
        });
      } else if (hive.status === "warning") {
        notifs.push({
          id: id++,
          type: "warning",
          hiveId: hive.id,
          message: hive.alertType || (isTr ? "Uyarı durumu" : "Warning status"),
          time: hive.lastUpdate,
          read: false,
        });
      }
    });

    // Düşük pil — kovan başına en fazla bir tane
    const seenBatteryHives = new Set();
    hives.forEach((hive) => {
      if (
        typeof hive.battery === "number" &&
        hive.battery < 20 &&
        !seenBatteryHives.has(hive.id)
      ) {
        seenBatteryHives.add(hive.id);
        const msg = isTr
          ? `Düşük Pil Seviyesi (%${hive.battery})`
          : `Low Battery (${hive.battery}%)`;
        notifs.push({
          id: id++,
          type: "warning",
          hiveId: hive.id,
          message: msg,
          time: hive.lastUpdate,
          read: true,
          kind: "battery",
        });
      }
    });

    return notifs;
  }, [hives]);

  const value = {
    hives,
    apiConnected,
    lastApiUpdate,
    loading,
    error,
    isDataStale,
    refreshData: fetchLiveData,
    deleteHive,
    addHive,
    updateHive,
    gateway,
    weather,
    notifications,
  };

  return (
    <LiveDataContext.Provider value={value}>
      {children}
    </LiveDataContext.Provider>
  );
};
