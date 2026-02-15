import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ArrowLeft, CheckCircle, Sparkles, Crown, Thermometer, Droplet, Wind, Gauge, BarChart3, StickyNote, Pencil, Plus, Trash2, Send, Image, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { getStatusColor, getStatusText } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

const NOTES_KEY = (id) => `beemind_notes_${id}`;
const SENSOR_CACHE_KEY = (id) => `beemind_sensor_cache_${id}`;

// Son 24 saat sensör verisini simüle et
const generate24hData = (hive) => {
  const data = [];
  const baseTemp = hive.temp;
  const baseHumidity = hive.humidity;
  const baseSound = hive.sound;
  const baseBattery = hive.battery;

  for (let i = 23; i >= 0; i--) {
    const hour = new Date();
    hour.setHours(hour.getHours() - i);
    data.push({
      time: hour.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      temp: +(baseTemp + (Math.random() - 0.5) * 4).toFixed(1),
      humidity: +(baseHumidity + (Math.random() - 0.5) * 10).toFixed(0),
      sound: +(baseSound + (Math.random() - 0.5) * 15).toFixed(0),
      battery: Math.max(0, Math.min(100, +(baseBattery - i * 0.1 + Math.random() * 0.5).toFixed(0))),
    });
  }
  return data;
};

const HiveDetailView = ({ hive, onBack }) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('general');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Sensör verilerini cache'le (ESP32 bağlı değilse son bilinen değerler gösterilir)
  const sensorData = useMemo(() => {
    const isConnected = hive.temp !== 0 || hive.humidity !== 0 || hive.sound !== 0;
    if (isConnected) {
      // Yeni veri geldi — cache güncelle
      const cache = { temp: hive.temp, humidity: hive.humidity, sound: hive.sound, battery: hive.battery, weight: hive.weight };
      try { localStorage.setItem(SENSOR_CACHE_KEY(hive.id), JSON.stringify(cache)); } catch {}
      return { ...cache, cached: false };
    }
    // Bağlantı yok — cache'den oku
    try {
      const cached = JSON.parse(localStorage.getItem(SENSOR_CACHE_KEY(hive.id)));
      if (cached) return { ...cached, cached: true };
    } catch {}
    return { temp: hive.temp, humidity: hive.humidity, sound: hive.sound, battery: hive.battery, weight: hive.weight, cached: false };
  }, [hive.id, hive.temp, hive.humidity, hive.sound, hive.battery, hive.weight]);

  // Grafik verisini API'den al, yoksa simülasyon kullan
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const data = await api.getHiveChart(hive.id);
        if (!cancelled && data && Array.isArray(data.data) && data.data.length > 0) {
          setChartData(data.data.map(d => ({
            time: d.time || new Date(d.timestamp || d.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            temp: d.temp ?? d.temperature ?? 0,
            humidity: d.humidity ?? 0,
            sound: d.sound ?? d.vibration ?? 0,
            battery: d.battery ?? 100,
          })));
          setChartLoading(false);
          return;
        }
      } catch {
        // API fail — fallback
      }
      if (!cancelled) {
        setChartData(generate24hData(hive));
        setChartLoading(false);
      }
    };
    fetchChartData();
    return () => { cancelled = true; };
  }, [hive.id]);

  // Notları yükle
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTES_KEY(hive.id)) || '[]');
      setNotes(saved);
    } catch { setNotes([]); }
  }, [hive.id]);

  // Saat
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addNote = () => {
    if (!newNote.trim() && !photoPreview) return;
    const note = {
      id: Date.now(),
      text: newNote.trim(),
      photo: photoPreview || null,
      date: new Date().toLocaleString('tr-TR'),
    };
    const updated = [note, ...notes];
    setNotes(updated);
    try { localStorage.setItem(NOTES_KEY(hive.id), JSON.stringify(updated)); } catch {}
    setNewNote('');
    setPhotoPreview(null);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Fotoğraf 2MB\'dan küçük olmalı');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = ''; // aynı dosyayı tekrar seçebilmek için
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    try { localStorage.setItem(NOTES_KEY(hive.id), JSON.stringify(updated)); } catch {}
  };

  const formatDateTime = (date) =>
    new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);

  // Heatmap verisi — useMemo ile sabitlendi (re-render'da değişmez)
  const heatmapData = useMemo(() => Array.from({ length: 10 }, (_, i) => {
    // Kovan verisinden belirleyici değer üret (rand değil)
    const seed = ((parseInt(hive.id, 36) || 1) * (i + 1) * 137) % 100;
    const value = 25 + seed * 0.6;
    const status = seed < 30 ? 'low' : seed < 70 ? 'normal' : 'high';
    return { id: i + 1, value, status };
  }), [hive.id]);

  const getBarColor = (status) => {
    switch (status) {
      case 'low': return 'bg-yellow-500';
      case 'normal': return 'bg-orange-500';
      case 'high': return 'bg-red-600';
      default: return 'bg-orange-500';
    }
  };

  const swarmData = [
    { time: '00:00', risk: 15 }, { time: '04:00', risk: 12 },
    { time: '08:00', risk: 18 }, { time: '12:00', risk: 10 },
    { time: '16:00', risk: 20 }, { time: '20:00', risk: 14 },
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
      icon: '⚠️', color: 'text-amber-400',
      text: `Nem seviyesi %${sensorData.humidity}'e ${sensorData.humidity > 60 ? 'yükseldi' : 'düştü'}. Havalandırmayı kontrol edin.`
    },
    {
      icon: '🍯', color: 'text-gray-300',
      text: `Ağırlık: ${sensorData.weight}kg - Bal üretimi aktif`
    }
  ];

  const tabs = [
    { id: 'general', label: t.detail.general, icon: CheckCircle },
    { id: 'charts', label: t.detail.charts, icon: BarChart3 },
    { id: 'notes', label: `${t.detail.notes} (${notes.length})`, icon: StickyNote },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri Dön
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-400">Kovan #{hive.id}</p>
          <p className="text-sm text-gray-300 font-mono">{formatDateTime(currentTime)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <>
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
                <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-amber-400 font-semibold text-sm">YAPAY ZEKA ÖNERİLERİ</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`${s.color} text-lg flex-shrink-0`}>{s.icon}</span>
                        <span className="text-gray-300 leading-relaxed">{s.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex-shrink-0 w-full lg:w-64 h-24">
                <svg viewBox="0 0 200 60" className="w-full h-full">
                  <path d="M0,30 Q20,20 40,35 T80,25 T120,40 T160,20 T200,30" fill="none"
                    stroke={hive.status === 'critical' ? '#ef4444' : hive.status === 'warning' ? '#f59e0b' : '#10b981'} strokeWidth="2" />
                  <path d="M0,30 Q20,20 40,35 T80,25 T120,40 T160,20 T200,30 V60 H0 Z"
                    fill={`url(#gradient-${hive.id})`} opacity="0.3" />
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
            <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Çerçeve Yoğunluk Haritası</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded-sm" /><span className="text-gray-400">Düşük</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-sm" /><span className="text-gray-400">Normal</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-sm" /><span className="text-gray-400">Yüksek</span></div>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 h-56">
                {heatmapData.map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-3 flex-1 group">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">%{Math.round(item.value)}</div>
                    <div className={`w-full ${getBarColor(item.status)} rounded-t-md transition-all group-hover:scale-105`} style={{ height: `${item.value * 2}px` }} />
                    <span className="text-xs text-gray-500">#{item.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Oğul Riski</h3>
                <span className="text-emerald-400 font-bold text-sm">DÜŞÜK</span>
              </div>
              <div className="h-24 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={swarmData}>
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
            <SensorCard icon={Thermometer} title="SICAKLIK" value={`${sensorData.temp}°C`}
              status={sensorData.cached ? 'Önceki Veri' : sensorData.temp > 37 ? 'Yüksek' : 'İyi Durumda'}
              color={sensorData.cached ? 'text-gray-500' : sensorData.temp > 37 ? 'text-amber-400' : 'text-emerald-400'}
              cached={sensorData.cached} />
            <SensorCard icon={Droplet} title="NEM" value={`${sensorData.humidity}%`}
              status={sensorData.cached ? 'Önceki Veri' : 'İyi Durumda'}
              color={sensorData.cached ? 'text-gray-500' : 'text-emerald-400'}
              cached={sensorData.cached} />
            <SensorCard icon={Wind} title="SES SEVİYESİ" value={`${sensorData.sound}dB`}
              status={sensorData.cached ? 'Önceki Veri' : sensorData.sound > 70 ? 'Yüksek' : 'Normal'}
              color={sensorData.cached ? 'text-gray-500' : sensorData.sound > 70 ? 'text-red-400' : 'text-emerald-400'}
              cached={sensorData.cached} />
            <SensorCard icon={Gauge} title="PİL" value={`${sensorData.battery}%`}
              status={sensorData.cached ? 'Önceki Veri' : sensorData.battery < 20 ? 'Düşük' : 'İyi'}
              color={sensorData.cached ? 'text-gray-500' : sensorData.battery < 20 ? 'text-red-400' : 'text-emerald-400'}
              cached={sensorData.cached} />
          </div>
          {sensorData.cached && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-400">⚠️ ESP32 bağlantısı yok — son bilinen değerler gösteriliyor</p>
            </div>
          )}
        </>
      )}

      {/* Charts Tab — Son 24 Saat */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Son 24 Saat — Sıcaklık</h3>
            <p className="text-xs text-gray-600 mb-4">Kovan iç sıcaklığı (°C)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#ef4444' }} />
                  <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} fill="url(#tempGrad)" name="Sıcaklık (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Son 24 Saat — Nem</h3>
              <p className="text-xs text-gray-600 mb-4">Kovan iç nem oranı (%)</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }} />
                    <Area type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} fill="url(#humGrad)" name="Nem (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Son 24 Saat — Ses Seviyesi</h3>
              <p className="text-xs text-gray-600 mb-4">Kovan ses ölçümü (dB)</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="soundGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#9ca3af' }} />
                    <Area type="monotone" dataKey="sound" stroke="#a855f7" strokeWidth={2} fill="url(#soundGrad)" name="Ses (dB)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">Son 24 Saat — Pil</h3>
            <p className="text-xs text-gray-600 mb-4">Pil seviyesi (%)</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="batGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }} />
                  <Area type="monotone" dataKey="battery" stroke="#10b981" strokeWidth={2} fill="url(#batGrad)" name="Pil (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Not Ekleme */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                  placeholder="Bu kovan hakkında not ekleyin..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm"
                />
                {/* Fotoğraf önizleme */}
                {photoPreview && (
                  <div className="relative inline-block">
                    <img src={photoPreview} alt="" className="max-h-32 rounded-lg border border-gray-700" />
                    <button
                      onClick={() => setPhotoPreview(null)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 self-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-amber-400 rounded-lg transition-colors"
                  title="Fotoğraf ekle"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={addNote}
                  disabled={!newNote.trim() && !photoPreview}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Not Listesi */}
          {notes.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <StickyNote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Henüz not eklenmedi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 group hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {note.text && (
                        <p className="text-gray-200 text-sm whitespace-pre-wrap">{note.text}</p>
                      )}
                      {note.photo && (
                        <img
                          src={note.photo}
                          alt="Not fotoğrafı"
                          className="mt-2 max-h-48 rounded-lg border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(note.photo, '_blank')}
                        />
                      )}
                      <p className="text-xs text-gray-600 mt-2">{note.date}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SensorCard = ({ icon: Icon, title, value, status, color, cached }) => (
  <div className={`bg-gray-900 border rounded-lg p-6 text-center hover:border-gray-600 transition-colors group ${
    cached ? 'border-amber-500/30 border-dashed' : 'border-gray-700'
  }`}>
    <div className="flex justify-center mb-4 text-gray-400 group-hover:text-gray-300">
      <Icon className="w-8 h-8" strokeWidth={1.5} />
    </div>
    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">{title}</h3>
    <p className={`text-4xl font-light mb-4 tabular-nums ${cached ? 'text-gray-400' : 'text-gray-100'}`}>{value}</p>
    <p className={`text-sm font-medium ${color}`}>{status}</p>
  </div>
);

export default HiveDetailView;
