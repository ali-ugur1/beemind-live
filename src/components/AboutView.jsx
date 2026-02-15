import { Cpu, Wifi, BarChart3, Shield, Code, Award, Zap, Globe, Database } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutView = () => {
  const { lang } = useLanguage();

  const techStack = [
    { name: 'React 18', category: 'Frontend', icon: Code, color: 'text-cyan-400' },
    { name: 'Vite', category: 'Build Tool', icon: Zap, color: 'text-purple-400' },
    { name: 'TailwindCSS', category: 'Styling', icon: Code, color: 'text-blue-400' },
    { name: 'Recharts', category: 'Visualization', icon: BarChart3, color: 'text-amber-400' },
    { name: 'ESP32', category: 'IoT Hardware', icon: Cpu, color: 'text-emerald-400' },
    { name: 'Node.js', category: 'Backend', icon: Database, color: 'text-green-400' },
  ];

  const features = [
    { icon: Wifi, title: lang === 'tr' ? 'IoT Sensor Agi' : 'IoT Sensor Network', desc: lang === 'tr' ? 'ESP32 tabanli kablosuz sensor agiyla gercek zamanli veri toplama' : 'Real-time data collection with ESP32-based wireless sensor network' },
    { icon: BarChart3, title: lang === 'tr' ? 'Veri Analizi' : 'Data Analytics', desc: lang === 'tr' ? 'Sicaklik, nem, ses, titresim ve agirlik verilerinin gorsellestirmesi' : 'Visualization of temperature, humidity, sound, vibration and weight data' },
    { icon: Shield, title: lang === 'tr' ? 'Akilli Alarm Sistemi' : 'Smart Alarm System', desc: lang === 'tr' ? 'Ogul tespiti, devrilme alarmi ve anomali algilama' : 'Swarm detection, tipping alarm and anomaly detection' },
    { icon: Zap, title: lang === 'tr' ? 'Yapay Zeka' : 'Artificial Intelligence', desc: lang === 'tr' ? 'ML destekli oneriler, trend tahmini ve erken uyari' : 'ML-powered recommendations, trend prediction and early warning' },
    { icon: Globe, title: lang === 'tr' ? 'Hava Durumu' : 'Weather Integration', desc: lang === 'tr' ? 'Open-Meteo API ile gercek zamanli meteoroloji verisi' : 'Real-time meteorological data with Open-Meteo API' },
    { icon: Database, title: lang === 'tr' ? 'Rapor & Export' : 'Report & Export', desc: lang === 'tr' ? 'CSV, Excel, JSON ve PDF formatlarinda rapor olusturma' : 'Report generation in CSV, Excel, JSON and PDF formats' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 rounded-2xl mb-4">
          <img
            src="/logo.png"
            alt="BeeMind Logo"
            className="w-14 h-14 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Bee<span className="text-amber-400">Mind</span>
        </h1>
        <p className="text-lg text-gray-400 mb-3">
          {lang === 'tr'
            ? 'AI Destekli IoT Ariclik Yonetim Sistemi'
            : 'AI-Powered IoT Beekeeping Management System'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full">v2.0</span>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">PRO</span>
          <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full">TUBITAK 2204-A</span>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-8">
        <h2 className="text-xl font-bold text-gray-100 mb-4">
          {lang === 'tr' ? 'Proje Hakkinda' : 'About the Project'}
        </h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          {lang === 'tr'
            ? 'BeeMind, modern ariclik uygulamalarini IoT ve yapay zeka teknolojileriyle birlestiren yenilikci bir kovan yonetim sistemidir. ESP32 tabanli sensorler araciligiyla kovanlarinizdan gercek zamanli veri toplar, yapay zeka algoritmalariyla analiz eder ve aricilik surelerinizi optimize etmenize yardimci olur.'
            : 'BeeMind is an innovative hive management system that combines modern beekeeping practices with IoT and artificial intelligence technologies. It collects real-time data from your hives through ESP32-based sensors, analyzes it with AI algorithms, and helps optimize your beekeeping processes.'}
        </p>
        <p className="text-gray-400 text-sm">
          {lang === 'tr'
            ? 'Bu proje TUBITAK 2204-A Lise Ogrencileri Arastirma Projeleri Yarismasi kapsaminda gelistirilmistir.'
            : 'This project was developed as part of TUBITAK 2204-A High School Students Research Projects Competition.'}
        </p>
      </div>

      {/* Features */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {lang === 'tr' ? 'Temel Ozellikler' : 'Key Features'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="p-2 bg-amber-500/10 rounded-lg flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200 mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {lang === 'tr' ? 'Teknoloji Yigini' : 'Tech Stack'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {techStack.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <Icon className={`w-5 h-5 ${tech.color}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-200">{tech.name}</p>
                  <p className="text-xs text-gray-500">{tech.category}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          {lang === 'tr' ? 'Sistem Mimarisi' : 'System Architecture'}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {[
            { label: 'ESP32', sublabel: lang === 'tr' ? 'Sensor' : 'Sensor', color: 'border-emerald-500/50 bg-emerald-500/10' },
            { label: 'Gateway', sublabel: 'WiFi/LoRa', color: 'border-blue-500/50 bg-blue-500/10' },
            { label: 'API', sublabel: 'Node.js', color: 'border-purple-500/50 bg-purple-500/10' },
            { label: 'Dashboard', sublabel: 'React', color: 'border-amber-500/50 bg-amber-500/10' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`border-2 ${item.color} rounded-lg p-4 text-center min-w-[100px]`}>
                <p className="text-sm font-bold text-gray-200">{item.label}</p>
                <p className="text-xs text-gray-500">{item.sublabel}</p>
              </div>
              {i < 3 && <span className="text-gray-600 text-xl hidden md:block">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '27+', label: lang === 'tr' ? 'React Bilesenler' : 'React Components' },
          { value: '19', label: lang === 'tr' ? 'Ornek Kovan' : 'Sample Hives' },
          { value: '6', label: lang === 'tr' ? 'Sensor Tipi' : 'Sensor Types' },
          { value: '2', label: lang === 'tr' ? 'Dil Destegi' : 'Languages' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-400 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* License */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <Award className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-100 mb-2">TUBITAK 2204-A</h3>
        <p className="text-sm text-gray-400">
          {lang === 'tr'
            ? 'Lise Ogrencileri Arastirma Projeleri Yarismasi 2024-2025'
            : 'High School Students Research Projects Competition 2024-2025'}
        </p>
      </div>
    </div>
  );
};

export default AboutView;
