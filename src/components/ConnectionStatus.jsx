import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

const ConnectionStatus = () => {
  const { apiConnected, lastApiUpdate, refreshData } = useLiveData();
  const { lang } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl text-sm font-medium ${
        apiConnected 
          ? 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-400' 
          : 'bg-red-900/90 border border-red-500/50 text-red-400'
      }`}>
        {apiConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Canlı' : 'Live'}</span>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            {lastApiUpdate && (
              <span className="text-xs text-emerald-500/70 ml-1">
                {lastApiUpdate.toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Bağlantı Yok' : 'No Connection'}</span>
            <button onClick={refreshData} className="ml-1 hover:text-red-300">
              <RefreshCw className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
