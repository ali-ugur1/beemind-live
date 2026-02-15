import { Hexagon, Github, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { lang } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-800 bg-gray-950/50 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-amber-500/20 rounded flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="BeeMind"
                  className="w-4 h-4 object-contain"
                  style={{ filter: 'brightness(1.2)' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <span className="text-sm font-bold text-amber-400">BeeMind</span>
              <span className="text-xs text-gray-600">v2.0</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {lang === 'tr'
                ? 'AI destekli IoT ariclik yonetim sistemi. ESP32 tabanli sensor agiyla kovanlarinizi akilli sekilde izleyin.'
                : 'AI-powered IoT beekeeping management system. Monitor your hives smartly with ESP32-based sensor network.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {lang === 'tr' ? 'Hizli Erisim' : 'Quick Access'}
            </h4>
            <ul className="space-y-1 text-xs text-gray-500">
              <li className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-default">
                <ExternalLink className="w-3 h-3" />
                {lang === 'tr' ? 'Dokumantasyon' : 'Documentation'}
              </li>
              <li className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-default">
                <ExternalLink className="w-3 h-3" />
                {lang === 'tr' ? 'API Referansi' : 'API Reference'}
              </li>
              <li className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-default">
                <ExternalLink className="w-3 h-3" />
                {lang === 'tr' ? 'Destek' : 'Support'}
              </li>
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {lang === 'tr' ? 'Proje Bilgisi' : 'Project Info'}
            </h4>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>TUBITAK 2204-A</li>
              <li>{lang === 'tr' ? 'Ariclik & IoT & Yapay Zeka' : 'Beekeeping & IoT & AI'}</li>
              <li>ESP32 + React + Node.js</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            &copy; {year} BeeMind. {lang === 'tr' ? 'Tum haklari saklidir.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {lang === 'tr' ? 'Sistem Aktif' : 'System Active'}
            </span>
            <span>React 18 + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
