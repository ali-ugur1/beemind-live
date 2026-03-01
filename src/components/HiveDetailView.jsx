import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, CheckCircle, Sparkles, Crown, Thermometer, Droplet, Wind, Gauge, BarChart3, StickyNote, Plus, Trash2, Send, Image, X, Calendar, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { getStatusColor, getStatusText } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

const NOTES_KEY = (id) => `beemind_notes_${id}`;
const SENSOR_CACHE_KEY = (id) => `beemind_sensor_cache_${id}`;
const CALENDAR_EVENTS_KEY = 'beemind_calendar_events';

// Son 24 saat sensor verisini simule et
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

const EVENT_TYPES = {
  inspection: { color: 'bg-blue-500', label_tr: 'Kontrol', label_en: 'Inspection' },
  medication: { color: 'bg-red-500', label_tr: 'Ilac', label_en: 'Medication' },
  harvest: { color: 'bg-amber-500', label_tr: 'Hasat', label_en: 'Harvest' },
  feeding: { color: 'bg-emerald-500', label_tr: 'Besleme', label_en: 'Feeding' },
  maintenance: { color: 'bg-purple-500', label_tr: 'Bakim', label_en: 'Maintenance' },
  other: { color: 'bg-gray-500', label_tr: 'Diger', label_en: 'Other' },
};

const HiveDetailView = ({ hive, onBack }) => {
  const { t, lang } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('general');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Etkinlikler — calendar'daki bu kovana ait etkinlikler
  const [hiveEvents, setHiveEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'inspection',
    description: ''
  });

  // Sensor verilerini cache'le
  const sensorData = useMemo(() => {
    const isConnected = hive.temp !== 0 || hive.humidity !== 0 || hive.sound !== 0;
    if (isConnected) {
      const cache = { temp: hive.temp, humidity: hive.humidity, sound: hive.sound, battery: hive.battery, weight: hive.weight };
      try { localStorage.setItem(SENSOR_CACHE_KEY(hive.id), JSON.stringify(cache)); } catch {}
      return { ...cache, cached: false };
    }
    try {
      const cached = JSON.parse(localStorage.getItem(SENSOR_CACHE_KEY(hive.id)));
      if (cached) return { ...cached, cached: true };
    } catch {}
    return { temp: hive.temp, humidity: hive.humidity, sound: hive.sound, battery: hive.battery, weight: hive.weight, cached: false };
  }, [hive.id, hive.temp, hive.humidity, hive.sound, hive.battery, hive.weight]);

  // Grafik verisi
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
      } catch {}
      if (!cancelled) {
        setChartData(generate24hData(hive));
        setChartLoading(false);
      }
    };
    fetchChartData();
    return () => { cancelled = true; };
  }, [hive.id]);

  // Notlari yukle
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(NOTES_KEY(hive.id)) || '[]');
      setNotes(saved);
    } catch { setNotes([]); }
  }, [hive.id]);

  // Takvim etkinliklerini yukle (bu kovana ait olanlar)
  useEffect(() => {
    try {
      const allEvents = JSON.parse(localStorage.getItem(CALENDAR_EVENTS_KEY) || '[]');
      const filtered = allEvents.filter(e => e.hiveId === hive.id);
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHiveEvents(filtered);
    } catch { setHiveEvents([]); }
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
      date: new Date().toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US'),
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
      alert(lang === 'tr' ? 'Fotograf 2MB\'dan kucuk olmali' : 'Photo must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    try { localStorage.setItem(NOTES_KEY(hive.id), JSON.stringify(updated)); } catch {}
  };

  // Etkinlik ekle — takvime de yaz
  const addEvent = () => {
    if (!eventForm.title.trim()) return;
    const newEvent = {
      id: Date.now(),
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time,
      type: eventForm.type,
      description: eventForm.description.trim(),
      hiveId: hive.id,
      hiveName: hive.name || `Kovan #${hive.id}`,
    };

    // localStorage'daki tum etkinliklere ekle
    try {
      const allEvents = JSON.parse(localStorage.getItem(CALENDAR_EVENTS_KEY) || '[]');
      allEvents.push(newEvent);
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(allEvents));
    } catch {}

    setHiveEvents(prev => [newEvent, ...prev]);
    setEventForm({ title: '', date: new Date().toISOString().split('T')[0], time: '09:00', type: 'inspection', description: '' });
    setShowEventForm(false);
  };

  const deleteEvent = (eventId) => {
    try {
      const allEvents = JSON.parse(localStorage.getItem(CALENDAR_EVENTS_KEY) || '[]');
      const updated = allEvents.filter(e => e.id !== eventId);
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(updated));
    } catch {}
    setHiveEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const formatDateTime = (date) =>
    new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(date);

  // Heatmap verisi
  const heatmapData = useMemo(() => Array.from({ length: 10 }, (_, i) => {
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
      icon: hive.status === 'critical' ? '!' : hive.status === 'warning' ? '!' : '+',
      color: colors.text,
      text: hive.alertType || (lang === 'tr' ? 'Mudahale gerekmiyor. Haftalik rutin kontrolu Cumartesi yapabilirsiniz.' : 'No intervention needed. You can do the weekly routine check on Saturday.')
    },
    {
      icon: '!', color: 'text-amber-400',
      text: lang === 'tr'
        ? `Nem seviyesi %${sensorData.humidity}'e ${sensorData.humidity > 60 ? 'yukseldi' : 'dustu'}. Havalandirmayi kontrol edin.`
        : `Humidity level ${sensorData.humidity > 60 ? 'rose' : 'dropped'} to ${sensorData.humidity}%. Check ventilation.`
    },
    {
      icon: '*', color: 'text-gray-300',
      text: lang === 'tr'
        ? `Agirlik: ${sensorData.weight}kg - Bal uretimi aktif`
        : `Weight: ${sensorData.weight}kg - Honey production active`
    }
  ];

  const tabs = [
    { id: 'general', label: t.detail.general, icon: CheckCircle },
    { id: 'charts', label: t.detail.charts, icon: BarChart3 },
    { id: 'notes', label: `${t.detail.notes} (${notes.length})`, icon: StickyNote },
    { id: 'events', label: `${lang === 'tr' ? 'Etkinlikler' : 'Events'} (${hiveEvents.length})`, icon: Calendar },
  ];

  const txt = {
    tr: {
      back: 'Geri Don',
      hive: 'Kovan',
      status: 'DURUM',
      aiTitle: 'YAPAY ZEKA ONERILERI',
      frameHeatmap: 'Cerceve Yogunluk Haritasi',
      low: 'Dusuk', normal: 'Normal', high: 'Yuksek',
      swarmRisk: 'Ogul Riski',
      queen: 'ANA ARI (QUEEN)',
      seen: 'GORULDU',
      healthy: 'Saglikli',
      temp: 'SICAKLIK', humidity: 'NEM', sound: 'SES SEVIYESI', battery: 'PIL',
      goodCondition: 'Iyi Durumda',
      cachedWarning: 'ESP32 baglantisi yok — son bilinen degerler gosteriliyor',
      last24h: 'Son 24 Saat',
      tempChart: 'Sicaklik', humChart: 'Nem', soundChart: 'Ses Seviyesi', batChart: 'Pil',
      tempUnit: 'Kovan ic sicakligi (C)', humUnit: 'Kovan ic nem orani (%)',
      soundUnit: 'Kovan ses olcumu (dB)', batUnit: 'Pil seviyesi (%)',
      addNote: 'Not ekleyin...',
      noNotes: 'Henuz not eklenmedi',
      addPhoto: 'Fotograf ekle',
      noEvents: 'Bu kovana ait etkinlik yok',
      addEvent: 'Etkinlik Ekle',
      eventTitle: 'Baslik',
      eventDate: 'Tarih',
      eventTime: 'Saat',
      eventType: 'Tur',
      eventDesc: 'Aciklama',
      previousData: 'Onceki Veri',
      stableStatus: 'Kovan stabil. Arilar calisiyor.',
    },
    en: {
      back: 'Go Back',
      hive: 'Hive',
      status: 'STATUS',
      aiTitle: 'AI SUGGESTIONS',
      frameHeatmap: 'Frame Density Map',
      low: 'Low', normal: 'Normal', high: 'High',
      swarmRisk: 'Swarm Risk',
      queen: 'QUEEN BEE',
      seen: 'SPOTTED',
      healthy: 'Healthy',
      temp: 'TEMPERATURE', humidity: 'HUMIDITY', sound: 'SOUND LEVEL', battery: 'BATTERY',
      goodCondition: 'Good Condition',
      cachedWarning: 'ESP32 not connected — showing last known values',
      last24h: 'Last 24 Hours',
      tempChart: 'Temperature', humChart: 'Humidity', soundChart: 'Sound Level', batChart: 'Battery',
      tempUnit: 'Hive internal temperature (C)', humUnit: 'Hive internal humidity (%)',
      soundUnit: 'Hive sound measurement (dB)', batUnit: 'Battery level (%)',
      addNote: 'Add a note about this hive...',
      noNotes: 'No notes yet',
      addPhoto: 'Add photo',
      noEvents: 'No events for this hive',
      addEvent: 'Add Event',
      eventTitle: 'Title',
      eventDate: 'Date',
      eventTime: 'Time',
      eventType: 'Type',
      eventDesc: 'Description',
      previousData: 'Previous Data',
      stableStatus: 'Hive is stable. Bees are active.',
    }
  };
  const tx = txt[lang] || txt.tr;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {tx.back}
        </button>
        <div className="text-right">
          <p className="text-xs text-gray-400">{tx.hive} #{hive.id}</p>
          <p className="text-sm text-gray-300 font-mono">{formatDateTime(currentTime)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap ${
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
                  {tx.status}: {statusText}
                </h2>
                <p className="text-gray-400 mb-6">
                  {hive.alertType || tx.stableStatus}
                </p>
                <div className="bg-amber-900/20 border border-amber-600/50 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-amber-400 font-semibold text-sm">{tx.aiTitle}</h3>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`${s.color} text-lg flex-shrink-0 font-bold`}>{s.icon}</span>
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
                <h3 className="text-sm font-semibold text-gray-400 uppercase">{tx.frameHeatmap}</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded-sm" /><span className="text-gray-400">{tx.low}</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-sm" /><span className="text-gray-400">{tx.normal}</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-sm" /><span className="text-gray-400">{tx.high}</span></div>
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
                <h3 className="text-sm font-semibold text-gray-400 uppercase">{tx.swarmRisk}</h3>
                <span className="text-emerald-400 font-bold text-sm">{tx.low.toUpperCase()}</span>
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
                    <h4 className="text-sm text-gray-400 mb-2">{tx.queen}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-emerald-400 font-bold text-sm">{tx.seen}</p>
                      <span className="text-gray-500 text-xs">- #5</span>
                    </div>
                    <p className="text-xs text-gray-500">{tx.healthy} | 13:45</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SensorCard icon={Thermometer} title={tx.temp} value={`${sensorData.temp}°C`}
              status={sensorData.cached ? tx.previousData : sensorData.temp > 37 ? tx.high : tx.goodCondition}
              color={sensorData.cached ? 'text-gray-500' : sensorData.temp > 37 ? 'text-amber-400' : 'text-emerald-400'}
              cached={sensorData.cached} />
            <SensorCard icon={Droplet} title={tx.humidity} value={`${sensorData.humidity}%`}
              status={sensorData.cached ? tx.previousData : tx.goodCondition}
              color={sensorData.cached ? 'text-gray-500' : 'text-emerald-400'}
              cached={sensorData.cached} />
            <SensorCard icon={Wind} title={tx.sound} value={`${sensorData.sound}dB`}
              status={sensorData.cached ? tx.previousData : sensorData.sound > 70 ? tx.high : tx.normal}
              color={sensorData.cached ? 'text-gray-500' : sensorData.sound > 70 ? 'text-red-400' : 'text-emerald-400'}
              cached={sensorData.cached} />
            <SensorCard icon={Gauge} title={tx.battery} value={`${sensorData.battery}%`}
              status={sensorData.cached ? tx.previousData : sensorData.battery < 20 ? tx.low : tx.goodCondition}
              color={sensorData.cached ? 'text-gray-500' : sensorData.battery < 20 ? 'text-red-400' : 'text-emerald-400'}
              cached={sensorData.cached} />
          </div>
          {sensorData.cached && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-400">{tx.cachedWarning}</p>
            </div>
          )}
        </>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">{tx.last24h} — {tx.tempChart}</h3>
            <p className="text-xs text-gray-600 mb-4">{tx.tempUnit}</p>
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
                  <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} fill="url(#tempGrad)" name={`${tx.tempChart} (°C)`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">{tx.last24h} — {tx.humChart}</h3>
              <p className="text-xs text-gray-600 mb-4">{tx.humUnit}</p>
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
                    <Area type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} fill="url(#humGrad)" name={`${tx.humChart} (%)`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">{tx.last24h} — {tx.soundChart}</h3>
              <p className="text-xs text-gray-600 mb-4">{tx.soundUnit}</p>
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
                    <Area type="monotone" dataKey="sound" stroke="#a855f7" strokeWidth={2} fill="url(#soundGrad)" name={`${tx.soundChart} (dB)`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-1">{tx.last24h} — {tx.batChart}</h3>
            <p className="text-xs text-gray-600 mb-4">{tx.batUnit}</p>
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
                  <Area type="monotone" dataKey="battery" stroke="#10b981" strokeWidth={2} fill="url(#batGrad)" name={`${tx.batChart} (%)`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                  placeholder={tx.addNote}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none text-sm"
                />
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
                  title={tx.addPhoto}
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

          {notes.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <StickyNote className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">{tx.noNotes}</p>
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
                          alt=""
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

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Event form toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {tx.addEvent}
            </button>
          </div>

          {/* Event Form */}
          {showEventForm && (
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{tx.eventTitle} *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                    placeholder={lang === 'tr' ? 'Ornek: Haftalik kontrol' : 'e.g. Weekly inspection'}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{tx.eventType}</label>
                  <select
                    value={eventForm.type}
                    onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  >
                    {Object.entries(EVENT_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{lang === 'tr' ? val.label_tr : val.label_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{tx.eventDate}</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{tx.eventTime}</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={e => setEventForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{tx.eventDesc}</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowEventForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={addEvent}
                  disabled={!eventForm.title.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-black font-semibold rounded-lg text-sm"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          )}

          {/* Event List */}
          {hiveEvents.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">{tx.noEvents}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hiveEvents.map(event => {
                const typeInfo = EVENT_TYPES[event.type] || EVENT_TYPES.other;
                return (
                  <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 group hover:border-gray-700 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${typeInfo.color} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1">
                          <h4 className="text-gray-200 font-medium text-sm">{event.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {event.date}
                            </span>
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs ${typeInfo.color}/20 text-gray-300`}>
                              {lang === 'tr' ? typeInfo.label_tr : typeInfo.label_en}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-gray-400 text-xs mt-2">{event.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
