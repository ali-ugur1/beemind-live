import { ExternalLink, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const Footer = ({ onTabChange }) => {
  const { lang } = useLanguage();
  const toast = useToast();
  const year = new Date().getFullYear();
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleLink = (tab) => {
    if (onTabChange) onTabChange(tab);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.warning(lang === 'tr' ? 'Lutfen tum alanlari doldurun' : 'Please fill in all fields');
      return;
    }
    // Open mailto
    const subject = encodeURIComponent(contactForm.subject || 'BeeMind Destek');
    const body = encodeURIComponent(`${lang === 'tr' ? 'Gonderen' : 'From'}: ${contactForm.name} (${contactForm.email})\n\n${contactForm.message}`);
    window.open(`mailto:aliugurpamuk@gmail.com?subject=${subject}&body=${body}`, '_self');
    toast.success(lang === 'tr' ? 'Mail istemcisi aciliyor...' : 'Opening mail client...');
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setShowContactForm(false);
  };

  return (
    <footer className="mt-auto border-t border-gray-800 bg-gray-950/50 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {lang === 'tr' ? 'Hizli Erisim' : 'Quick Access'}
            </h4>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>
                <button onClick={() => handleLink('dashboard')} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  {lang === 'tr' ? 'Dashboard' : 'Dashboard'}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('reports')} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  {lang === 'tr' ? 'Raporlar' : 'Reports'}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('help')} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  {lang === 'tr' ? 'Yardim' : 'Help'}
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('about')} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                  {lang === 'tr' ? 'Hakkinda' : 'About'}
                </button>
              </li>
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {lang === 'tr' ? 'Teknik Bilgi' : 'Technical Info'}
            </h4>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>ESP32 + DHT22 + HX711</li>
              <li>React 18 + Vite + TailwindCSS</li>
              <li>Node.js + PostgreSQL</li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {lang === 'tr' ? 'Destek' : 'Support'}
            </h4>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mb-2"
            >
              <Mail className="w-3 h-3" />
              {lang === 'tr' ? 'Bize Ulasin' : 'Contact Us'}
            </button>
            <p className="text-xs text-gray-600">aliugurpamuk@gmail.com</p>
          </div>
        </div>

        {/* Contact Form */}
        {showContactForm && (
          <div className="border border-gray-800 rounded-lg p-4 mb-6 bg-gray-900/50">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">
              {lang === 'tr' ? 'Daha fazla yardima ihtiyaciniz mi?' : 'Need more help?'}
            </h4>
            <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={lang === 'tr' ? 'Adiniz' : 'Your name'}
                value={contactForm.name}
                onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none"
              />
              <input
                type="email"
                placeholder={lang === 'tr' ? 'E-posta' : 'Email'}
                value={contactForm.email}
                onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none"
              />
              <input
                type="text"
                placeholder={lang === 'tr' ? 'Konu' : 'Subject'}
                value={contactForm.subject}
                onChange={e => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none md:col-span-2"
              />
              <textarea
                placeholder={lang === 'tr' ? 'Mesajiniz...' : 'Your message...'}
                value={contactForm.message}
                onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none resize-none md:col-span-2"
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {lang === 'tr' ? 'Gonder' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}

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
