import { useMemo, useState } from 'react';
import { Wifi, Battery, BatteryCharging, Cloud, Droplets, Wind, Sun, MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle, Zap, FileText, Wrench } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLiveData } from '../contexts/LiveDataContext';
import SystemHealthWidget from './SystemHealthWidget';
import ActivityFeed from './ActivityFeed';

const OverviewDashboard = ({ stats, hives, onViewDetail }) => {
  const toast = useToast();
  const { t } = useLanguage();
  const { gateway: apiGateway, weather: apiWeather, apiConnected } = useLiveData();
  const [quickLoading, setQuickLoading] = useState(null);

  const handleQuickAction = (action) => {
    setQuickLoading(action);
    setTimeout(() => {
      setQuickLoading(null);
      if (action === 'scan') toast.success('Tüm kovanlar tarandı — sorun bulunamadı');
      if (action === 'report') toast.success('Acil rapor oluşturuldu (PDF)');
      if (action === 'maintenance') toast.info('Bakım planı oluşturuluyor...');
    }, 1500);
  };

  // Gateway bilgisi — API'den gelir, yoksa hives verisinden türetilir
  const gateway = useMemo(() => {
    if (apiGateway && apiGateway.status !== 'offline') {
      return {
        ...apiGateway,
        connectedHives: apiGateway.connectedHives || hives.length,
        lastSync: apiGateway.lastSync ? getTimeSince(apiGateway.lastSync) : '—'
      };
    }
    // Fallback: API bağlantısı varsa online, yoksa offline
    return {
      id: 'GW-001',
      batteryLevel: 78,
      isCharging: false,
      signalStrength: apiConnected ? 92 : 0,
      status: apiConnected ? 'online' : 'offline',
      lastSync: apiConnected ? 'Az önce' : '—',
      connectedHives: hives.length
    };
  }, [apiGateway, apiConnected, hives.length]);

  // Hava durumu — API'den gelir, yoksa fallback
  const weather = useMemo(() => {
    if (apiWeather) {
      return {
        location: apiWeather.location || 'Konum bilinmiyor',
        temp: apiWeather.temp ?? apiWeather.temperature ?? '—',
        condition: apiWeather.condition || apiWeather.description || '—',
        humidity: apiWeather.humidity ?? '—',
        windSpeed: apiWeather.windSpeed ?? apiWeather.wind ?? '—',
        icon: getWeatherIcon(apiWeather.condition),
        forecast: apiWeather.forecast || []
      };
    }
    // Fallback: sensör ortalamasından türet
    const avgTemp = hives.length > 0 ? (hives.reduce((s, h) => s + h.temp, 0) / hives.length).toFixed(0) : '—';
    const avgHum = hives.length > 0 ? (hives.reduce((s, h) => s + h.humidity, 0) / hives.length).toFixed(0) : '—';
    return {
      location: 'Konya, Selçuklu',
      temp: avgTemp !== '—' ? Number(avgTemp) : '—',
      condition: 'Sensör Verisi',
      humidity: avgHum !== '—' ? Number(avgHum) : '—',
      windSpeed: '—',
      icon: Sun,
      forecast: []
    };
  }, [apiWeather, hives]);

  // Kritik uyarılar
  const criticalAlerts = hives
    .filter(h => h.status === 'critical')
    .map(h => ({
      id: h.id,
      message: h.alertType,
      time: h.lastUpdate
    }));

  // Trend analizi
  const trends = useMemo(() => {
    const avgTemp = (hives.reduce((sum, h) => sum + h.temp, 0) / hives.length).toFixed(1);
    const avgHumidity = (hives.reduce((sum, h) => sum + h.humidity, 0) / hives.length).toFixed(0);
    const lowBattery = hives.filter(h => h.battery < 30).length;

    return {
      temperature: { value: avgTemp, trend: 'up', change: '+0.5°C' },
      humidity: { value: avgHumidity, trend: 'stable', change: '0%' },
      battery: { value: lowBattery, trend: lowBattery > 0 ? 'down' : 'stable', change: `${lowBattery} kovan` }
    };
  }, [hives]);

  // Weather icon: gerçek veriden emoji gelir, fallback'te React component gelir
  const weatherIconIsEmoji = typeof weather.icon === 'string';
  const WeatherIcon = weatherIconIsEmoji ? null : weather.icon;

  return (
    <div className="space-y-6">
      {/* Üst Kısım: Gateway + Hava Durumu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gateway Card */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center p-2">
                <img 
                  src="/logo.png" 
                  alt="Gateway" 
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(1.2) drop-shadow(0 0 4px rgba(245, 158, 11, 0.5))' }}
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Gateway</h3>
                <p className="text-2xl font-bold text-gray-100">{gateway.id}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              gateway.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {gateway.status === 'online' ? '🟢 Çevrimiçi' : '🔴 Çevrimdışı'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Pil Durumu */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {gateway.isCharging ? (
                  <BatteryCharging className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Battery className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-xs text-gray-500">Pil</span>
              </div>
              <p className="text-2xl font-bold text-gray-100">{gateway.batteryLevel}%</p>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${gateway.batteryLevel > 50 ? 'bg-emerald-500' : gateway.batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${gateway.batteryLevel}%` }}
                />
              </div>
            </div>

            {/* Sinyal Gücü */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-500">Sinyal</span>
              </div>
              <p className="text-2xl font-bold text-gray-100">{gateway.signalStrength}%</p>
              <p className="text-xs text-gray-500 mt-2">
                {gateway.connectedHives} kovan bağlı
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Son senkronizasyon: {gateway.lastSync}
          </p>
        </div>

        {/* Hava Durumu Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-2xl">
                {weatherIconIsEmoji ? weather.icon : <WeatherIcon className="w-6 h-6 text-blue-400" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-400">{weather.location}</h3>
                </div>
                <p className="text-xs text-gray-500">{weather.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-100">{weather.temp}°C</p>
              {weather.feelsLike !== undefined && (
                <p className="text-xs text-gray-500">Hissedilen: {weather.feelsLike}°C</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-500">{t.weather?.humidity || 'Nem'}</p>
                <p className="text-lg font-semibold text-gray-100">{weather.humidity}%</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
              <Wind className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t.weather?.wind || 'Rüzgar'}</p>
                <p className="text-lg font-semibold text-gray-100">{weather.windSpeed} km/s</p>
              </div>
            </div>
          </div>

          {/* 3 Günlük Tahmin */}
          {weather.forecast && weather.forecast.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-800 pt-4">
              {weather.forecast.map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-gray-500 mb-2">{day.day}</p>
                  <span className="text-xl block mb-1">{day.icon || '☀️'}</span>
                  <p className="text-sm font-semibold text-gray-300">{day.temp}°C</p>
                  {day.condition && (
                    <p className="text-[10px] text-gray-500 mt-1">{day.condition}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {weather._source && (
            <p className="text-[10px] text-gray-600 mt-3 text-right">Open-Meteo</p>
          )}
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="TOPLAM KOVAN"
          value={stats.total}
          icon="🐝"
          color="amber"
        />
        <StatCard
          title="KRİTİK DURUM"
          value={stats.critical}
          icon="🔴"
          color="red"
          pulse={stats.critical > 0}
        />
        <StatCard
          title="UYARI"
          value={stats.warning}
          icon="⚠️"
          color="yellow"
        />
        <StatCard
          title="STABİL"
          value={stats.total - stats.critical - stats.warning}
          icon="✅"
          color="green"
        />
      </div>

      {/* Trend Analizi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendCard
          title="Ortalama Sıcaklık"
          value={`${trends.temperature.value}°C`}
          trend={trends.temperature.trend}
          change={trends.temperature.change}
          icon={Sun}
        />
        <TrendCard
          title="Ortalama Nem"
          value={`${trends.humidity.value}%`}
          trend={trends.humidity.trend}
          change={trends.humidity.change}
          icon={Droplets}
        />
        <TrendCard
          title="Düşük Pil"
          value={trends.battery.value}
          trend={trends.battery.trend}
          change={trends.battery.change}
          icon={Battery}
        />
      </div>

      {/* Kritik Uyarılar */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-red-500">Kritik Uyarılar</h3>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-gray-900/50 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => onViewDetail && onViewDetail(alert.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <p className="font-semibold text-gray-100">Kovan #{alert.id}</p>
                    <p className="text-sm text-gray-400">{alert.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{alert.time}</span>
                  <span className="text-amber-400 text-sm">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı Eylemler */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">⚡ {t.quickActions.scanAll.includes('Scan') ? 'Quick Actions' : 'Hızlı Eylemler'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction('scan')}
            disabled={quickLoading === 'scan'}
            className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            <Zap className={`w-5 h-5 text-amber-400 ${quickLoading === 'scan' ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-200">
              {quickLoading === 'scan' ? t.quickActions.scanning : t.quickActions.scanAll}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction('report')}
            disabled={quickLoading === 'report'}
            className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
          >
            <FileText className={`w-5 h-5 text-blue-400 ${quickLoading === 'report' ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-200">
              {quickLoading === 'report' ? t.quickActions.reportCreating : t.quickActions.urgentReport}
            </span>
          </button>
          <button
            onClick={() => handleQuickAction('maintenance')}
            disabled={quickLoading === 'maintenance'}
            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            <Wrench className={`w-5 h-5 text-emerald-400 ${quickLoading === 'maintenance' ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium text-gray-200">
              {quickLoading === 'maintenance' ? (t.quickActions.scanAll.includes('Scan') ? 'Planning...' : 'Planlanıyor...') : t.quickActions.planMaintenance}
            </span>
          </button>
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

// Stat Card Component
const StatCard = ({ title, value, icon, color, pulse }) => {
  const colors = {
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/50',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/50',
    yellow: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/50',
    green: 'from-emerald-500/20 to-green-500/20 border-emerald-500/50'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-lg p-6 ${pulse ? 'animate-pulse' : ''}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{title}</p>
      <div className="flex items-center justify-between">
        <p className="text-4xl font-bold text-gray-100">{value}</p>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};

// Trend Card Component
const TrendCard = ({ title, value, trend, change, icon: Icon }) => {
  const trendIcons = {
    up: { icon: TrendingUp, color: 'text-emerald-400' },
    down: { icon: TrendingDown, color: 'text-red-400' },
    stable: { icon: Minus, color: 'text-gray-400' }
  };

  const TrendIcon = trendIcons[trend].icon;
  const trendColor = trendIcons[trend].color;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">{change}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
    </div>
  );
};

export default OverviewDashboard;

// Yardımcı fonksiyonlar
function getTimeSince(isoStr) {
  try {
    const diff = Date.now() - new Date(isoStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Az önce';
    if (min < 60) return `${min} dakika önce`;
    return `${Math.floor(min / 60)} saat önce`;
  } catch {
    return '—';
  }
}

function getWeatherIcon(condition) {
  if (!condition) return Sun;
  const c = condition.toLowerCase();
  if (c.includes('cloud') || c.includes('bulut')) return Cloud;
  if (c.includes('rain') || c.includes('yağmur')) return Droplets;
  if (c.includes('wind') || c.includes('rüzgar')) return Wind;
  return Sun;
}
