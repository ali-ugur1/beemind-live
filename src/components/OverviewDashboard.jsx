import { useMemo } from 'react';
import { Wifi, Battery, BatteryCharging, Cloud, Droplets, Wind, Sun, MapPin, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

const OverviewDashboard = ({ stats, hives, onViewDetail }) => {
  // Gateway bilgisi (Mock data - gerçekte API'den gelecek)
  const gateway = {
    id: 'GW-001',
    batteryLevel: 78,
    isCharging: false,
    signalStrength: 92,
    status: 'online',
    lastSync: '2 dakika önce',
    connectedHives: 19
  };

  // Hava durumu (Mock data - gerçekte Weather API'den gelecek)
  const weather = {
    location: 'Konya, Selçuklu',
    temp: 24,
    condition: 'Açık',
    humidity: 45,
    windSpeed: 12,
    icon: Sun,
    forecast: [
      { day: 'Yarın', temp: 26, icon: Sun },
      { day: 'Pzt', temp: 23, icon: Cloud },
      { day: 'Salı', temp: 25, icon: Sun }
    ]
  };

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

  const WeatherIcon = weather.icon;

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
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <WeatherIcon className="w-6 h-6 text-blue-400" />
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-500">Nem</p>
                <p className="text-lg font-semibold text-gray-100">{weather.humidity}%</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-3">
              <Wind className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Rüzgar</p>
                <p className="text-lg font-semibold text-gray-100">{weather.windSpeed} km/s</p>
              </div>
            </div>
          </div>

          {/* 3 Günlük Tahmin */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            {weather.forecast.map((day, i) => {
              const DayIcon = day.icon;
              return (
                <div key={i} className="text-center">
                  <p className="text-xs text-gray-500 mb-2">{day.day}</p>
                  <DayIcon className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-gray-300">{day.temp}°C</p>
                </div>
              );
            })}
          </div>
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
