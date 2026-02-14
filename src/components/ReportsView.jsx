import { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp, FileText } from 'lucide-react';

const ReportsView = ({ hives }) => {
  const [dateRange, setDateRange] = useState('7days'); // '7days', '30days', '90days'

  // Zaman serisi verisi (mock)
  const timeSeriesData = useMemo(() => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
      avgTemp: 34 + Math.random() * 2,
      avgHumidity: 55 + Math.random() * 10,
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5) + 2,
      stable: 19 - Math.floor(Math.random() * 3)
    }));
  }, [dateRange]);

  // Durum dağılımı
  const statusDistribution = useMemo(() => {
    const critical = hives.filter(h => h.status === 'critical').length;
    const warning = hives.filter(h => h.status === 'warning').length;
    const stable = hives.filter(h => h.status === 'stable').length;

    return [
      { name: 'Kritik', value: critical, color: '#ef4444' },
      { name: 'Uyarı', value: warning, color: '#f59e0b' },
      { name: 'Stabil', value: stable, color: '#10b981' }
    ];
  }, [hives]);

  // Pil durumu dağılımı
  const batteryDistribution = useMemo(() => {
    return [
      { range: '0-20%', count: hives.filter(h => h.battery <= 20).length },
      { range: '21-50%', count: hives.filter(h => h.battery > 20 && h.battery <= 50).length },
      { range: '51-80%', count: hives.filter(h => h.battery > 50 && h.battery <= 80).length },
      { range: '81-100%', count: hives.filter(h => h.battery > 80).length }
    ];
  }, [hives]);

  // İstatistikler
  const stats = useMemo(() => {
    const temps = hives.map(h => h.temp);
    const humidities = hives.map(h => h.humidity);
    const batteries = hives.map(h => h.battery);

    return {
      avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      maxTemp: Math.max(...temps).toFixed(1),
      minTemp: Math.min(...temps).toFixed(1),
      avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(0),
      avgBattery: (batteries.reduce((a, b) => a + b, 0) / batteries.length).toFixed(0),
      lowBattery: batteries.filter(b => b < 20).length
    };
  }, [hives]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">Raporlar & Analiz</h2>
          <p className="text-sm text-gray-500">Kovan performansı ve istatistikler</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500"
          >
            <option value="7days">Son 7 Gün</option>
            <option value="30days">Son 30 Gün</option>
            <option value="90days">Son 90 Gün</option>
          </select>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            PDF İndir
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Ort. Sıcaklık" value={`${stats.avgTemp}°C`} icon="🌡️" />
        <KPICard title="Max Sıcaklık" value={`${stats.maxTemp}°C`} icon="🔥" />
        <KPICard title="Min Sıcaklık" value={`${stats.minTemp}°C`} icon="❄️" />
        <KPICard title="Ort. Nem" value={`${stats.avgHumidity}%`} icon="💧" />
        <KPICard title="Ort. Pil" value={`${stats.avgBattery}%`} icon="🔋" />
        <KPICard title="Düşük Pil" value={stats.lowBattery} icon="⚠️" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sıcaklık & Nem Trendi */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Sıcaklık & Nem Trendi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avgTemp" stroke="#f59e0b" strokeWidth={2} name="Sıcaklık (°C)" />
              <Line type="monotone" dataKey="avgHumidity" stroke="#3b82f6" strokeWidth={2} name="Nem (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Dağılımı (Pie Chart) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Durum Dağılımı</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Değişim Trendi (Stacked Bar) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Günlük Durum Değişimi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Kritik" />
              <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Uyarı" />
              <Bar dataKey="stable" stackId="a" fill="#10b981" name="Stabil" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pil Durumu Dağılımı */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">Pil Durumu Dağılımı</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={batteryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#f59e0b" name="Kovan Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Özet Rapor */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-100">Özet Rapor</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Önemli Bulgular</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Ortalama sıcaklık ideal aralıkta ({stats.avgTemp}°C)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>Nem seviyeleri stabil ({stats.avgHumidity}%)</span>
              </li>
              {stats.lowBattery > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>{stats.lowBattery} kovanda pil değişimi gerekli</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-400">ℹ️</span>
                <span>Genel koloni sağlığı iyi durumda</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Öneriler</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span>→</span>
                <span>Haftalık rutin kontrole devam edin</span>
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                <span>Düşük pilli kovanların bataryalarını değiştirin</span>
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                <span>Kritik durumdaki kovanları öncelikli izleyin</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, icon }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-xs text-gray-500 mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-100">{value}</p>
  </div>
);

export default ReportsView;
