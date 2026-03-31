import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Lock, User, Eye, EyeOff, AlertCircle, Wifi, Shield, BarChart3, Zap,
  Sun, Moon, Globe, Thermometer, Droplets, Activity, MapPin, Bell,
  CheckCircle, TrendingUp, Cpu, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
   ═══════════════════════════════════════════════════════════════════ */
const useCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

/* ═══════════════════════════════════════════════════════════════════
   MOCK DASHBOARD PREVIEW (Left Panel)
   ═══════════════════════════════════════════════════════════════════ */
const DashboardPreview = ({ isTr, currentTime }) => {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  const mockHives = [
    { id: '01', status: 'stable', temp: 34.5, hum: 55, bat: 92 },
    { id: '02', status: 'warning', temp: 37.8, hum: 72, bat: 45 },
    { id: '03', status: 'stable', temp: 33.1, hum: 48, bat: 88 },
    { id: '04', status: 'critical', temp: 39.2, hum: 80, bat: 12 },
  ];

  const statusColor = (s) => s === 'critical' ? 'bg-red-500' : s === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
  const statusText = (s) => s === 'critical' ? (isTr ? 'KRİTİK' : 'CRITICAL') : s === 'warning' ? (isTr ? 'UYARI' : 'WARNING') : (isTr ? 'STABİL' : 'STABLE');

  return (
    <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm shadow-2xl w-full max-w-md">
      {/* Mini header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>
        <span className="text-[10px] font-mono text-gray-500">
          hexora.app/panel
        </span>
        <span className="text-[10px] font-mono text-amber-400/60">
          {currentTime.toLocaleTimeString(isTr ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: isTr ? 'Kovan' : 'Hives', val: '4', icon: '🐝', color: 'text-amber-400' },
          { label: isTr ? 'Stabil' : 'Stable', val: '2', icon: '✅', color: 'text-emerald-400' },
          { label: isTr ? 'Uyarı' : 'Warning', val: '1', icon: '⚠️', color: 'text-amber-400' },
          { label: isTr ? 'Kritik' : 'Critical', val: '1', icon: '🔴', color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-800/60 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-500">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Mini hive table */}
      <div className="space-y-1.5">
        {mockHives.map((h) => (
          <div key={h.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/40 border border-gray-800 ${h.status === 'critical' && pulse ? 'border-red-500/50' : ''} transition-colors`}>
            <span className={`w-2 h-2 rounded-full ${statusColor(h.status)} ${h.status === 'critical' ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-mono text-amber-400 w-6">#{h.id}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${h.status === 'critical' ? 'bg-red-500/20 text-red-400' : h.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {statusText(h.status)}
            </span>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-500">
              <span>{h.temp}°C</span>
              <span>{h.hum}%</span>
              <span className={h.bat < 20 ? 'text-red-400' : ''}>{h.bat}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini chart placeholder */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-end gap-1 h-10">
          {[40, 55, 45, 60, 50, 70, 65, 75, 60, 80, 70, 85].map((h, i) => (
            <div key={i} className="flex-1 bg-gradient-to-t from-amber-500/40 to-amber-500/10 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="text-[9px] text-gray-600 mt-1 text-center">{isTr ? 'Son 12 saat — Sıcaklık Trendi' : 'Last 12h — Temperature Trend'}</p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL
   ═══════════════════════════════════════════════════════════════════ */
const Testimonials = ({ isTr }) => {
  return (
    <div className="bg-gray-900/60 border border-gray-800 border-dashed rounded-xl p-4 mt-6 text-center">
      <p className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider mb-1">{isTr ? 'Kullanıcı Yorumları' : 'User Reviews'}</p>
      <p className="text-sm text-gray-500">{isTr ? 'Yakında — Beta sürecimiz devam ediyor' : 'Coming Soon — Our beta is ongoing'}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN LOGIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
const LoginPage = () => {
  const { login, register } = useAuth();
  const { t, lang, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const hiveCount = useCounter(0, 2000);
  const adapterCount = useCounter(3, 1800);
  const uptimeCount = useCounter(99, 1500);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hexora_remember');
      if (saved) {
        const { username: u } = JSON.parse(saved);
        if (u) { setUsername(u); setRememberMe(true); }
      }
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(lang === 'tr' ? 'Email ve şifre gerekli' : 'Email and password required');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError(lang === 'tr' ? 'Şifre en az 6 karakter olmalı' : 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError(lang === 'tr' ? 'Şifreler eşleşmiyor' : 'Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'register') {
      const result = await register(username, password, fullName || undefined);
      if (!result.success) {
        const errMsg = result.error === 'network_error'
          ? (lang === 'tr' ? 'Sunucuya bağlanılamadı' : 'Cannot connect to server')
          : (result.error || (lang === 'tr' ? 'Kayıt başarısız' : 'Registration failed'));
        setError(errMsg);
      }
    } else {
      const result = await login(username, password);
      if (!result.success) {
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);
        const errMsg = result.error === 'network_error'
          ? (lang === 'tr' ? 'Sunucuya bağlanılamadı' : 'Cannot connect to server')
          : (lang === 'tr' ? `Email veya şifre hatalı (${attempts}/5)` : `Invalid email or password (${attempts}/5)`);
        setError(errMsg);
        if (attempts >= 3) setShowDemo(true);
      } else {
        if (rememberMe) {
          try { localStorage.setItem('hexora_remember', JSON.stringify({ username })); } catch {}
        } else {
          try { localStorage.removeItem('hexora_remember'); } catch {}
        }
      }
    }
    setIsLoading(false);
  };

  const fillDemo = () => {
    setUsername('admin@hexora.app');
    setPassword('admin123');
    setError('');
  };

  const isTr = lang === 'tr';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden">
      {/* Background honeycomb pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 800 600">
          {[...Array(30)].map((_, i) => (
            <polygon
              key={i}
              points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              transform={`translate(${(i % 6) * 140 + (Math.floor(i / 6) % 2) * 70}, ${Math.floor(i / 6) * 130}) scale(1.3)`}
            />
          ))}
        </svg>
      </div>

      {/* Animated glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/8 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-amber-600/5 rounded-full blur-[100px]" />
      <div className="absolute top-2/3 left-1/6 w-48 h-48 bg-orange-500/5 rounded-full blur-[80px]" />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 py-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <img src="/hexora-logo.svg" alt="" className="w-5 h-5 object-contain" style={{ filter: 'brightness(1.2)' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <span className="text-sm font-bold text-gray-300">Hex<span className="text-violet-400">ora</span></span>
          <span className="hidden sm:inline text-[10px] text-gray-600 ml-2 border border-gray-800 px-2 py-0.5 rounded-full">v2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => changeLanguage(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">

        {/* Left Panel — Feature showcase */}
        <div className="hidden lg:flex lg:w-[55%] flex-col justify-center px-12 xl:px-16">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-amber-400">{isTr ? 'Sistem Aktif — Tüm Sensörler Çalışıyor' : 'System Active — All Sensors Online'}</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-gray-100 leading-tight mb-4">
              {isTr ? 'Kovanlarınızı' : 'Monitor Your'}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {isTr ? 'Akıllıca İzleyin' : 'Hives Smartly'}
              </span>
            </h1>

            <p className="text-gray-400 text-base xl:text-lg leading-relaxed mb-6">
              {isTr
                ? 'IoT sensörler ve yapay zeka ile kovanlarınızı 7/24 izleyin. Erken uyarı sistemiyle koloni kayıplarını önleyin.'
                : 'Monitor your hives 24/7 with IoT sensors and AI. Prevent colony losses with our early warning system.'}
            </p>

            {/* Animated counters */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { val: `${hiveCount}`, label: isTr ? 'Aktif Kovan' : 'Active Hives', color: 'text-amber-400' },
                { val: `${adapterCount}`, label: isTr ? 'Adaptör Tipi' : 'Adapter Types', color: 'text-blue-400' },
                { val: `${uptimeCount}.8%`, label: 'Uptime', color: 'text-emerald-400' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Dashboard Preview */}
            <DashboardPreview isTr={isTr} currentTime={currentTime} />

            {/* Testimonials */}
            <Testimonials isTr={isTr} />
          </div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-6">
          <div className="w-full max-w-md">

            {/* Mobile: feature strip (visible only on mobile) */}
            <div className="lg:hidden mb-6">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { val: '500+', label: isTr ? 'Kovan' : 'Hives', color: 'text-amber-400' },
                  { val: '28', label: isTr ? 'İl' : 'Cities', color: 'text-blue-400' },
                  { val: '99.8%', label: 'Uptime', color: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-lg p-2 text-center">
                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { icon: Wifi, text: isTr ? '7/24 İzleme' : '24/7 Monitoring', color: 'text-blue-400' },
                  { icon: Shield, text: isTr ? '%85 Az Kayıp' : '85% Less Loss', color: 'text-emerald-400' },
                  { icon: BarChart3, text: isTr ? 'AI Analiz' : 'AI Analysis', color: 'text-purple-400' },
                  { icon: Bell, text: isTr ? 'Anlık Uyarı' : 'Instant Alert', color: 'text-amber-400' },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/60 border border-gray-800 rounded-lg flex-shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${f.color}`} />
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{f.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logo & Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl mb-4 shadow-lg shadow-blue-500/10">
                <img
                  src="/hexora-logo.svg"
                  alt="Hexora"
                  className="w-12 h-12 object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(30, 58, 95, 0.5))' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-4xl">⬡</span>'; }}
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-100 mb-1">Hexora</h1>
              <p className="text-gray-500 text-sm">
                {isTr ? 'Akıllı Kovan İzleme Sistemi' : 'Smart Hive Monitoring System'}
              </p>
            </div>

            {/* Login/Register Form */}
            <form onSubmit={handleSubmit} className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl shadow-black/20">
              {/* Tab switcher */}
              <div className="flex bg-gray-800/60 rounded-lg p-1 mb-6">
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'login' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-gray-200'}`}>
                  {isTr ? 'Giriş Yap' : 'Sign In'}
                </button>
                <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'register' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-gray-200'}`}>
                  {isTr ? 'Kayıt Ol' : 'Sign Up'}
                </button>
              </div>

              <h2 className="text-xl font-semibold text-gray-100 mb-1 text-center">
                {mode === 'register'
                  ? (isTr ? 'Yeni Hesap Oluştur' : 'Create New Account')
                  : (isTr ? 'Kontrol Paneline Giriş' : 'Sign In to Dashboard')}
              </h2>
              <p className="text-xs text-gray-500 text-center mb-6">
                {mode === 'register'
                  ? (isTr ? 'Kovanlarınızı izlemeye hemen başlayın' : 'Start monitoring your hives right away')
                  : (isTr ? 'Kovanlarınızı yönetmek için hesabınıza giriş yapın' : 'Sign in to your account to manage your hives')}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name (register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                      {isTr ? 'Ad Soyad' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setError(''); }}
                        placeholder={isTr ? 'Adınızı girin' : 'Enter your name'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                    {isTr ? 'Email' : 'Email'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder={isTr ? 'Email adresinizi girin' : 'Enter your email'}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                    {isTr ? 'Şifre' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder={isTr ? 'Şifrenizi girin' : 'Enter your password'}
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                      {isTr ? 'Şifre (Tekrar)' : 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                        placeholder={isTr ? 'Şifrenizi tekrar girin' : 'Confirm your password'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                {/* Remember me & Forgot password (login only) */}
                {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      {isTr ? 'Beni hatırla' : 'Remember me'}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors"
                    onClick={() => alert(isTr ? 'Yöneticinizle iletişime geçin: hexoraproject@gmail.com' : 'Contact your administrator: hexoraproject@gmail.com')}
                  >
                    {isTr ? 'Şifremi unuttum' : 'Forgot password?'}
                  </button>
                </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || loginAttempts >= 5}
                className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-amber-500/50 disabled:to-orange-500/50 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>{mode === 'register' ? (isTr ? 'Kayıt yapılıyor...' : 'Creating account...') : (isTr ? 'Giriş yapılıyor...' : 'Signing in...')}</span>
                  </>
                ) : (mode === 'login' && loginAttempts >= 5) ? (
                  <span>{isTr ? 'Çok fazla deneme — lütfen bekleyin' : 'Too many attempts — please wait'}</span>
                ) : (
                  <>
                    <span>{mode === 'register' ? (isTr ? 'Hesap Oluştur' : 'Create Account') : (isTr ? 'Giriş Yap' : 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo credentials hint */}
              {mode === 'login' && showDemo && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-400/80 mb-2 font-medium">
                    {isTr ? 'Demo hesabı ile giriş yapabilirsiniz:' : 'You can sign in with the demo account:'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-500">{isTr ? 'Kullanıcı:' : 'User:'}</span> <code className="text-amber-300 bg-gray-800 px-1.5 py-0.5 rounded">admin</code>
                      <span className="mx-2 text-gray-600">|</span>
                      <span className="text-gray-500">{isTr ? 'Şifre:' : 'Pass:'}</span> <code className="text-amber-300 bg-gray-800 px-1.5 py-0.5 rounded">admin123</code>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemo}
                      className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 transition-colors font-medium"
                    >
                      {isTr ? 'Doldur' : 'Fill'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Feature highlights (desktop) */}
            <div className="hidden lg:grid grid-cols-2 gap-2 mt-4">
              {[
                { icon: Wifi, text: isTr ? '7/24 Gerçek Zamanlı' : '24/7 Real-Time', color: 'text-blue-400' },
                { icon: Shield, text: isTr ? '%85 Az Kayıp' : '85% Less Loss', color: 'text-emerald-400' },
                { icon: Cpu, text: isTr ? 'AI Destekli' : 'AI Powered', color: 'text-purple-400' },
                { icon: Bell, text: isTr ? 'Anlık Bildirim' : 'Instant Alerts', color: 'text-amber-400' },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-900/40 border border-gray-800/50 rounded-lg">
                    <Icon className={`w-3.5 h-3.5 ${f.color}`} />
                    <span className="text-[11px] text-gray-500">{f.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Security info */}
            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[10px]">256-bit SSL</span>
              </div>
              <div className="w-1 h-1 bg-gray-700 rounded-full" />
              <div className="flex items-center gap-1.5 text-gray-600">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px]">{isTr ? 'Güvenli Bağlantı' : 'Secure Connection'}</span>
              </div>
              <div className="w-1 h-1 bg-gray-700 rounded-full" />
              <div className="flex items-center gap-1.5 text-gray-600">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-[10px]">KVKK</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-gray-600 text-xs">
                &copy; {new Date().getFullYear()} Hexora Technologies
              </p>
              <p className="text-gray-700 text-[10px] mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {isTr ? 'Konya, Türkiye • 2025\'ten beri' : 'Konya, Turkey • Since 2025'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
