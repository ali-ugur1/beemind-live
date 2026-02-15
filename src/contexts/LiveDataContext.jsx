import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, apiToHiveFormat } from '../services/api';

const LiveDataContext = createContext();

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error('useLiveData must be used within LiveDataProvider');
  }
  return context;
};

// Başlangıç verisi (API'den veri gelene kadar gösterilecek)
const INITIAL_HIVE = {
  id: 'hive-001',
  status: 'stable',
  alertType: null,
  temp: 0,
  humidity: 0,
  pressure: 0,
  vibration: 0,
  battery: 100,
  weight: 0,
  sound: 0,
  lastUpdate: 'Bekleniyor...',
  lastActivity: 'API bekleniyor',
  priority: 3
};

export const LiveDataProvider = ({ children }) => {
  const [hives, setHives] = useState([INITIAL_HIVE]);
  const [apiConnected, setApiConnected] = useState(false);
  const [lastApiUpdate, setLastApiUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      console.warn('API baglanti hatasi:', err.message);
      setApiConnected(false);
      setError('Backend baglantisi kurulamadi. beemind-start.bat calistirildi mi?');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    apiIntervalRef.current = setInterval(fetchLiveData, 10000);
    
    return () => {
      if (apiIntervalRef.current) {
        clearInterval(apiIntervalRef.current);
      }
    };
  }, [fetchLiveData]);

  const deleteHive = useCallback((hiveId) => {
    setHives(prev => prev.filter(h => h.id !== hiveId));
  }, []);

  const addHive = useCallback((newHive) => {
    setHives(prev => [...prev, newHive]);
  }, []);

  const value = {
    hives,
    apiConnected,
    lastApiUpdate,
    loading,
    error,
    refreshData: fetchLiveData,
    deleteHive,
    addHive
  };

  return (
    <LiveDataContext.Provider value={value}>
      {children}
    </LiveDataContext.Provider>
  );
};
