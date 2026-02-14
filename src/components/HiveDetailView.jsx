import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Sparkles, Crown, Thermometer, Droplet, Wind, Gauge } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { getStatusColor, getStatusText } from '../data/mockData';

const HiveDetailView = ({ hive, onBack }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return new Intl.DateTimeFormat('tr-TR', options).format(date);
  };

  // Heatmap için örnek veri
  const heatmapData = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    value: 25 + Math.random() * 60,
    status: i < 3 ? 'low' : i < 7 ? 'normal' : 'high'
  }));

  const getBarColor = (status) => {
    switch (status) {
      case 'low': return 'bg-yellow-500';
      case 'normal': return 'bg-orange-500';
      case 'high': return 'bg-red-600';
      default: return 'bg-orange-500';
    }
  };

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

  const colors = getStatusColor(hive.status);
  const statusText = getStatusText(hive.status);

  const aiSuggestions = [
    {
      icon: hive.status === 'critical' ? '🔴' : hive.status === 'warning' ? '⚠️' : '✓',
      color: colors.text,
      text: hive.alertType || 'Müdahale gerekmiyor. Haftalık rutin kontrolü Cumartesi yapabilirsiniz.'
    },
    {
      icon: '⚠️',
      color: 'text-amber-400',
      text: `Nem seviyesi %${hive.humidity}'e ${hive.humidity > 60 ? 'yükseldi' : 'düştü'}. Havalandırmayı kontrol edin.`
    },
    {
      icon: '🍯',
      color: 'text-gray-300',
      text: `Ağırlık: ${hive.weight}kg - Bal üretimi aktif`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri Dön
        </button>
        
        <div className="text-right">
          <p className="text-xs text-gray-400">Kovan #{hive.id}</p>
          <p className="text-sm text-gray-300 font-mono">
            {formatDateTime(currentTime)}
          </p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`bg-gray-900 border-2 ${colors.border} rounded-lg p-6 shadow-lg ${
        hive.status === 'critical' ? 'animate-pulse' : ''
      }`}>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <CheckCircle className={`w-14 h-14 ${colors.text}`} strokeWidth={2} />
          </div>

          <div className="flex-1">
            <h2 className={`text-3xl font-bold ${colors.text} mb-2`}>
              DURUM: {statusText}
            </h2>
            <p className="text-gray-400 mb-6">
              {hive.alertType || 'Kovan stabil. Arılar çalışıyor, sorun yok.'}
            </p>

            {/* AI Önerileri */}
            <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-amber-400 font-semibold text-sm">
                  YAPAY ZEKA ÖNERİLERİ
                </h3>
              </div>

              <ul className="space-y-3 text-sm">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`${suggestion.color} text-lg flex-shrink-0`}>
                      {suggestion.icon}
                    </span>
                    <span className="text-gray-300 leading-relaxed">
                      {suggestion.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mini Grafik */}
          <div className="flex-shrink-0 w-full lg:w-64 h-24">
            <svg viewBox="0 0 200 60" className="w-full h-full">
              <path
                d="M0,30 Q20,20 40,35 T80,25 T120,40 T160,20 T200,30"
                fill="none"
                stroke={hive.status === 'critical' ? '#ef4444' : hive.status === 'warning' ? '#f59e0b' : '#10b981'}
                strokeWidth="2"
              />
              <path
                d="M0,30 Q20,20 40,35 T80,25 T120,40 T160,20 T200,30 V60 H0 Z"
                fill={`url(#gradient-${hive.id})`}
                opacity="0.3"
              />
              <defs>
                <linearGradient id={`gradient-${hive.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={hive.status === 'critical' ? '#ef4444' : hive.status === 'warning' ? '#f59e0b' : '#10b981'} />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">
              Çerçeve Yoğunluk Haritası
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-sm" />
                <span className="text-gray-400">Düşük</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-sm" />
                <span className="text-gray-400">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-sm" />
                <span className="text-gray-400">Yüksek</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-56">
            {heatmapData.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-3 flex-1 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                  %{Math.round(item.value)}
                </div>
                <div
                  className={`w-full ${getBarColor(item.status)} rounded-t-md transition-all group-hover:scale-105`}
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
                <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} domain={[0, 30]} />
                <Line type="monotone" dataKey="risk" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm text-gray-400 mb-2">ANA ARI (QUEEN)</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-emerald-400 font-bold text-sm">GÖRÜLDÜ</p>
                  <span className="text-gray-500 text-xs">- Çerçeve #5</span>
                </div>
                <p className="text-xs text-gray-500">Durum: Sağlıklı | 13:45</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SensorCard
          icon={Thermometer}
          title="SICAKLIK"
          value={`${hive.temp}°C`}
          status={hive.temp > 37 ? 'Yüksek' : 'İyi Durumda'}
          color={hive.temp > 37 ? 'text-amber-400' : 'text-emerald-400'}
        />
        <SensorCard
          icon={Droplet}
          title="NEM"
          value={`${hive.humidity}%`}
          status="İyi Durumda"
          color="text-emerald-400"
        />
        <SensorCard
          icon={Wind}
          title="SES SEVİYESİ"
          value={`${hive.sound}dB`}
          status={hive.sound > 70 ? 'Yüksek' : 'Normal'}
          color={hive.sound > 70 ? 'text-red-400' : 'text-emerald-400'}
        />
        <SensorCard
          icon={Gauge}
          title="PİL"
          value={`${hive.battery}%`}
          status={hive.battery < 20 ? 'Düşük' : 'İyi'}
          color={hive.battery < 20 ? 'text-red-400' : 'text-emerald-400'}
        />
      </div>
    </div>
  );
};

const SensorCard = ({ icon: Icon, title, value, status, color }) => (
  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors group">
    <div className="flex justify-center mb-4 text-gray-400 group-hover:text-gray-300">
      <Icon className="w-8 h-8" strokeWidth={1.5} />
    </div>
    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">{title}</h3>
    <p className="text-4xl font-light text-gray-100 mb-4 tabular-nums">{value}</p>
    <p className={`text-sm font-medium ${color}`}>{status}</p>
  </div>
);

export default HiveDetailView;
