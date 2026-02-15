import { useMemo } from 'react';
import { Activity, Server, Wifi, WifiOff, Cpu, HardDrive, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

const SystemHealthWidget = () => {
  const { hives, apiConnected, gateway } = useLiveData();
  const { lang } = useLanguage();

  const health = useMemo(() => {
    const total = hives.length;
    const critical = hives.filter(h => h.status === 'critical').length;
    const warning = hives.filter(h => h.status === 'warning').length;
    const stable = total - critical - warning;
    const lowBat = hives.filter(h => h.battery < 20).length;

    // Overall health score (0-100)
    const score = total > 0
      ? Math.round(((stable * 100 + warning * 60 + critical * 10) / total) - (lowBat * 5))
      : 0;

    const clampedScore = Math.max(0, Math.min(100, score));

    let status = 'good';
    let statusText = lang === 'tr' ? 'Sistem Saglkli' : 'System Healthy';
    let statusColor = 'text-emerald-400';
    let statusBg = 'bg-emerald-500/10 border-emerald-500/30';

    if (clampedScore < 50) {
      status = 'critical';
      statusText = lang === 'tr' ? 'Kritik Durum' : 'Critical Status';
      statusColor = 'text-red-400';
      statusBg = 'bg-red-500/10 border-red-500/30';
    } else if (clampedScore < 75) {
      status = 'warning';
      statusText = lang === 'tr' ? 'Dikkat Gerekli' : 'Attention Needed';
      statusColor = 'text-amber-400';
      statusBg = 'bg-amber-500/10 border-amber-500/30';
    }

    return { score: clampedScore, status, statusText, statusColor, statusBg, total, critical, warning, stable, lowBat };
  }, [hives, lang]);

  const services = [
    {
      name: lang === 'tr' ? 'ESP32 Gateway' : 'ESP32 Gateway',
      status: gateway?.status === 'online' ? 'online' : 'offline',
      icon: Server,
    },
    {
      name: lang === 'tr' ? 'API Sunucusu' : 'API Server',
      status: apiConnected ? 'online' : 'offline',
      icon: Cpu,
    },
    {
      name: lang === 'tr' ? 'Sensor Agi' : 'Sensor Network',
      status: health.total > 0 ? 'online' : 'offline',
      icon: Wifi,
    },
    {
      name: lang === 'tr' ? 'Veri Depolama' : 'Data Storage',
      status: 'online', // localStorage always available
      icon: HardDrive,
    },
  ];

  const getServiceIcon = (status) => {
    if (status === 'online') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className={`border rounded-lg p-6 ${health.statusBg}`}>
      <div className="flex items-center gap-3 mb-4">
        <Activity className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase">
          {lang === 'tr' ? 'Sistem Sagligi' : 'System Health'}
        </h3>
      </div>

      {/* Health Score Circle */}
      <div className="flex items-center gap-6 mb-5">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="#374151" strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={health.score >= 75 ? '#10b981' : health.score >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeDasharray={`${health.score}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${health.statusColor}`}>{health.score}</span>
          </div>
        </div>
        <div>
          <p className={`text-lg font-bold ${health.statusColor}`}>{health.statusText}</p>
          <p className="text-xs text-gray-500 mt-1">
            {health.total} {lang === 'tr' ? 'kovan aktif' : 'hives active'} | {health.critical} {lang === 'tr' ? 'kritik' : 'critical'}
          </p>
        </div>
      </div>

      {/* Services Status */}
      <div className="space-y-2">
        {services.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-300">{svc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {getServiceIcon(svc.status)}
                <span className={`text-xs font-medium ${svc.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {svc.status === 'online'
                    ? (lang === 'tr' ? 'Aktif' : 'Online')
                    : (lang === 'tr' ? 'Cevrmdisi' : 'Offline')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Uptime */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Uptime: 99.8%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">{lang === 'tr' ? 'Canli' : 'Live'}</span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthWidget;
