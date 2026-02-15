import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api, apiToHiveFormat } from '../services/api';
import { fetchWeather } from '../services/weather';
import { HIVES_DATA } from '../data/mockData';

const LiveDataContext = createContext();

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error('useLiveData must be used within LiveDataProvider');
  }
  return context;
};

const HIVES_STORAGE_KEY = 'beemind_hives';

// localStorage'dan eklenen kovanları al
const getStoredHives = () => {
  try {
    const stored = localStorage.getItem(HIVES_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
};

// Mock + localStorage kovanlarını birleştir
const getLocalHives = () => {
  const stored = getStoredHives();
  if (stored) return stored;
  return HIVES_DATA;
};

// Gateway varsayılan veri
const DEFAULT_GATEWAY = {
  id: 'GW-001',
  batteryLevel: 0,
  isCharging: false,
  signalStrength: 0,
  status: 'offline',
  lastSync: null,
  connectedHives: 0
};

// Hava durumu varsayılan veri
const DEFAULT_WEATHER = null;

export const LiveDataProvider = ({ children }) => {
  const [hives, setHives] = useState(() => getLocalHives());
  const [apiConnected, setApiConnected] = useState(false);
  const [lastApiUpdate, setLastApiUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gateway, setGateway] = useState(DEFAULT_GATEWAY);
  const [weather, setWeather] = useState(DEFAULT_WEATHER);
  const apiIntervalRef = useRef(null);

  const fetchLiveData = useCallback(async () => {
    try {
      const data = await api.getHivesSummary();
      
      if (data.hives && data.hives.length > 0) {
        const formattedHives = data.hives.map(apiToHiveFormat);
        setHives(formattedHives);
        setApiConnected(true);
        setLastApiUpdate(new Date());
        setError(null);
      }
      setLoading(false);
    } catch (err) {
      console.warn('API bağlantı hatası:', err.message);
      setApiConnected(false);
      // API yok — local veriler zaten yüklü, hata mesajı gösterme
      setLoading(false);
    }
  }, []);

  // Gateway ve hava durumu verilerini al
  const fetchAuxData = useCallback(async () => {
    // Gateway
    try {
      const gwData = await api.getGatewayStatus();
      if (gwData) {
        setGateway({
          id: gwData.id || 'GW-001',
          batteryLevel: gwData.batteryLevel ?? gwData.battery ?? 0,
          isCharging: !!gwData.isCharging,
          signalStrength: gwData.signalStrength ?? gwData.signal ?? 0,
          status: gwData.status || 'online',
          lastSync: gwData.lastSync || new Date().toISOString(),
          connectedHives: gwData.connectedHives ?? 0
        });
      }
    } catch {
      // Gateway verisi yoksa default kalır
    }

    // Hava durumu — gerçek internet verisinden çek
    try {
      // Kullanıcının ayarlardan konumunu al
      let locationName = 'Konya';
      try {
        const saved = localStorage.getItem('beemind_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.location) {
            // "Konya, Türkiye" -> "Konya" (ilk kısım yeterli)
            locationName = parsed.location.split(',')[0].trim() || 'Konya';
          }
        }
      } catch {}

      const lang = localStorage.getItem('beemind_language') || 'tr';
      const weatherData = await fetchWeather(locationName, lang);
      if (weatherData) {
        setWeather(weatherData);
      }
    } catch (err) {
      console.warn('Hava durumu alınamadı:', err.message);
      // Backend API'den dene
      try {
        const weatherData = await api.getWeather();
        if (weatherData) setWeather(weatherData);
      } catch {
        // Hava durumu verisi yok
      }
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    fetchAuxData();
    apiIntervalRef.current = setInterval(() => {
      fetchLiveData();
    }, 10000);

    // Hava durumu daha seyrek güncelle (15 dakika)
    const weatherInterval = setInterval(() => {
      fetchAuxData();
    }, 15 * 60 * 1000);
    
    return () => {
      if (apiIntervalRef.current) clearInterval(apiIntervalRef.current);
      clearInterval(weatherInterval);
    };
  }, [fetchLiveData, fetchAuxData]);

  const deleteHive = useCallback((hiveId) => {
    setHives(prev => prev.filter(h => h.id !== hiveId));
  }, []);

  const addHive = useCallback((newHive) => {
    setHives(prev => [...prev, newHive]);
  }, []);

  // Bildirimler otomatik olarak kovan durumlarından üretilir
  const notifications = useMemo(() => {
    const notifs = [];
    let id = 1;

    hives.forEach(hive => {
      if (hive.status === 'critical') {
        notifs.push({
          id: id++,
          type: 'critical',
          hiveId: hive.id,
          message: hive.alertType || 'Kritik durum algılandı',
          time: hive.lastUpdate,
          read: false
        });
      } else if (hive.status === 'warning') {
        notifs.push({
          id: id++,
          type: 'warning',
          hiveId: hive.id,
          message: hive.alertType || 'Uyarı durumu',
          time: hive.lastUpdate,
          read: false
        });
      }
    });

    // Düşük pil bildirimi
    hives.filter(h => h.battery < 20).forEach(hive => {
      if (!notifs.find(n => n.hiveId === hive.id && n.message.includes('Pil'))) {
        notifs.push({
          id: id++,
          type: 'warning',
          hiveId: hive.id,
          message: `Düşük Pil Seviyesi (%${hive.battery})`,
          time: hive.lastUpdate,
          read: true
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
    refreshData: fetchLiveData,
    deleteHive,
    addHive,
    gateway,
    weather,
    notifications
  };

  return (
    <LiveDataContext.Provider value={value}>
      {children}
    </LiveDataContext.Provider>
  );
};
