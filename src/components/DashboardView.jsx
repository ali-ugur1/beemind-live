import { CheckCircle, Sparkles, Thermometer, Droplet, Wind, Gauge } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const DashboardView = ({ stats, hives }) => {
  // İlk kovandan örnek veri al
  const selectedHive = hives.find(h => h.id === '01') || hives[0];

  // Heatmap için kovan yoğunluk verisi
  const heatmapData = hives.slice(0, 10).map((hive, index) => ({
    id: hive.id,
    value: 25 + (index * 8),
    status: hive.status === 'critical' ? 'high' : hive.status === 'warning' ? 'normal' : 'low'
  }));

  // Grafik için örnek veri
  const chartData = [
    { time: '00:00', risk: 15 },
    { time: '04:00', risk: 12 },
    { time: '08:00', risk: 18 },
    { time: '12:00', risk: 10 },
    { time: '16:00', risk: 20 },
    { time: '20:00', risk: 14 },
    { time: '23:59', risk: 16 }
  ];

  const getBarColor = (status) => {
    switch (status) {
      case 'low': return 'bg-yellow-500';
      case 'normal': return 'bg-orange-500';
      case 'high': return 'bg-red-600';
      default: return 'bg-orange-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gray-900 border-2 border-emerald-500 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <CheckCircle className="w-14 h-14 text-emerald-500" strokeWidth={2} />
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-emerald-500 mb-2">
              DURUM: NORMAL
            </h2>
            <p className="text-gray-400 mb-6">
              {stats.active} kovan aktif. {stats.critical} kritik, {stats.warning} uyarı durumda.
            </p>

            <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-amber-400 font-semibold text-sm">
                  YAPAY ZEKA ÖNERİLERİ
                </h3>
              </div>
              
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-gray-300">
                    {stats.needsAttention === 0 
                      ? 'Tüm kovanlar stabil durumda.'
                      : `${stats.needsAttention} kovan dikkat gerektiriyor.`}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400">⚠️</span>
                  <span className="text-gray-300">
                    Haftalık rutin kontrolü Cumartesi yapabilirsiniz.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span>🍯</span>
                  <span className="text-gray-300">
                    Bal üretimi tahmini: {(stats.total * 2.5).toFixed(1)}kg/hafta
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">
              Kovan Yoğunluk Haritası
            </h3>
            <span className="text-emerald-400 font-bold">Ort: %52</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-56">
            {heatmapData.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-3 flex-1">
                <div
                  className={`w-full ${getBarColor(item.status)} rounded-t-md transition-all`}
                  style={{ height: `${item.value * 2}px` }}
                />
                <span className="text-xs text-gray-500">#{item.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Swarm Risk */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">
              Oğul Riski
            </h3>
            <span className="text-emerald-400 font-bold text-sm">DÜŞÜK</span>
          </div>

          <div className="h-24 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 10 }} />
                <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="risk" stroke="#22d3ee" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm text-gray-400 mb-2">ANA ARI (QUEEN)</h4>
            <p className="text-emerald-400 font-bold text-sm">✓ GÖRÜLDÜ - Çerçeve #5</p>
            <p className="text-xs text-gray-500 mt-1">Durum: Sağlıklı | 13:45</p>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SensorCard
          icon={Thermometer}
          title="SICAKLIK"
          value={`${selectedHive.temp}°C`}
          status="İyi Durumda"
          color="text-emerald-400"
        />
        <SensorCard
          icon={Droplet}
          title="NEM"
          value={`${selectedHive.humidity}%`}
          status="İyi Durumda"
          color="text-emerald-400"
        />
        <SensorCard
          icon={Wind}
          title="SES SEVİYESİ"
          value={`${selectedHive.sound}dB`}
          status="Normal"
          color="text-emerald-400"
        />
        <SensorCard
          icon={Gauge}
          title="PİL"
          value={`${selectedHive.battery}%`}
          status={selectedHive.battery < 20 ? 'Düşük' : 'İyi'}
          color={selectedHive.battery < 20 ? 'text-red-400' : 'text-emerald-400'}
        />
      </div>
    </div>
  );
};

const SensorCard = ({ icon: Icon, title, value, status, color }) => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
    <div className="flex justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">{title}</h3>
    <p className="text-4xl font-light text-gray-100 mb-4">{value}</p>
    <p className={`text-sm font-medium ${color}`}>{status}</p>
  </div>
);

export default DashboardView;
