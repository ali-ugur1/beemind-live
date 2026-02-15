import { useState, useEffect } from 'react';
import { Hexagon, ArrowRight, Wifi, Shield, BarChart3, Zap, Globe, Bell } from 'lucide-react';

const WelcomeScreen = ({ onEnter }) => {
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step < 3) {
      const t = setTimeout(() => setStep(s => s + 1), 600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const features = [
    { icon: Wifi, title: 'Canli IoT Veri', desc: 'ESP32 sensorlerinden anlk veri akisi' },
    { icon: Shield, title: 'Akilli Alarm', desc: 'Ogul, devrilme, sicaklik uyarilari' },
    { icon: BarChart3, title: 'Detayli Analiz', desc: 'Grafik, rapor ve trend takibi' },
    { icon: Zap, title: 'Yapay Zeka', desc: 'ML destekli oneriler ve tahminler' },
    { icon: Globe, title: 'Hava Durumu', desc: 'Gercek zamanli meteoroloji verisi' },
    { icon: Bell, title: 'Bildirimler', desc: 'Push, SMS ve e-posta bildirimleri' },
  ];

  return (
    <div className={`fixed inset-0 z-[100] bg-gray-950 flex flex-col items-center justify-center transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* Hexagon Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="hex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="#f59e0b" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#hex)" />
        </svg>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <div className={`mb-8 transition-all duration-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30 rounded-2xl mb-6 shadow-lg shadow-amber-500/10">
            <img
              src="/logo.png"
              alt="BeeMind Logo"
              className="w-16 h-16 object-contain"
              style={{ filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.5))' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<svg class="w-12 h-12 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
              }}
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
            Bee<span className="text-amber-400">Mind</span>
          </h1>
          <p className="text-lg text-gray-400 font-medium">AI-Powered IoT Hive Management System</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full">v2.0</span>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">PRO</span>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full">TUBITAK</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 mb-10 transition-all duration-700 delay-300 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-left hover:border-amber-500/30 transition-colors group">
                <Icon className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-gray-200">{f.title}</p>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Enter Button */}
        <div className={`transition-all duration-700 delay-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105"
          >
            Panele Gir
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-gray-600 mt-4">ESC veya Enter ile de girebilirsiniz</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 text-xs text-gray-600">
        <span>BeeMind v2.0</span>
        <span>|</span>
        <span>TUBITAK 2204-A</span>
        <span>|</span>
        <span>2024-2025</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;
