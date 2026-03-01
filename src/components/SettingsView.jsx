import { useState, useEffect } from 'react';
import { User, Bell, Save, Mail, Phone, MapPin, Sun, Moon, Globe, BellRing } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SETTINGS_KEY = 'beemind_settings';

const defaultSettings = {
  fullName: 'Ahmet Yılmaz',
  email: 'ahmet@beemind.com',
  phone: '+90 555 123 4567',
  location: 'Konya, Türkiye',
  emailNotifications: true,
  smsNotifications: false,
  criticalAlertsOnly: false,
  weeklyReport: true
};

const SettingsView = () => {
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      // localStorage parse hatası
    }
    return defaultSettings;
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      // Sidebar ve diğer componentlere bildir
      window.dispatchEvent(new Event('beemind-settings-updated'));
      setSaved(true);
      toast.success('Ayarlar başarıyla kaydedildi');
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast.error('Ayarlar kaydedilemedi');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Ayarlar</h1>
        <p className="text-gray-500">Profil bilgilerinizi ve bildirim tercihlerinizi yönetin</p>
      </div>

      {/* Profil Bilgileri */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">Profil Bilgileri</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              value={settings.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-posta
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefon
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Konum
            </label>
            <input
              type="text"
              value={settings.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bildirim Tercihleri */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">Bildirim Tercihleri</h2>
        </div>

        <div className="space-y-4">
          <ToggleItem
            label="E-posta Bildirimleri"
            description="Önemli güncellemeleri e-posta ile al"
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />

          <ToggleItem
            label="SMS Bildirimleri"
            description="Kritik uyarıları SMS ile al"
            checked={settings.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
          />

          <ToggleItem
            label="Sadece Kritik Alarmlar"
            description="Yalnızca acil durumlar için bildirim gönder"
            checked={settings.criticalAlertsOnly}
            onChange={() => handleToggle('criticalAlertsOnly')}
          />

          <ToggleItem
            label="Haftalık Rapor"
            description="Her Pazartesi özet rapor gönder"
            checked={settings.weeklyReport}
            onChange={() => handleToggle('weeklyReport')}
          />
        </div>
      </div>

      {/* Tema Ayarı */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 light:bg-white light:border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          {theme === 'dark' ? <Moon className="w-6 h-6 text-amber-400" /> : <Sun className="w-6 h-6 text-amber-400" />}
          <h2 className="text-xl font-semibold text-gray-100 light:text-gray-900">Tema</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg light:bg-gray-100">
          <div className="flex-1">
            <p className="font-medium text-gray-100 light:text-gray-900">Karanlık / Aydınlık Mod</p>
            <p className="text-sm text-gray-500 mt-1">
              {theme === 'dark' ? 'Şu an karanlık mod aktif' : 'Şu an aydınlık mod aktif'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'light' ? 'bg-amber-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center ${theme === 'light' ? 'translate-x-8' : 'translate-x-1'}`}>
              {theme === 'light' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-gray-600" />}
            </div>
          </button>
        </div>
      </div>

      {/* Dil Ayarı */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">Dil / Language</h2>
        </div>
        <div className="flex gap-3">
          <LanguageButton lang="tr" label="🇹🇷 Türkçe" />
          <LanguageButton lang="en" label="🇬🇧 English" />
        </div>
      </div>

      {/* Push Bildirim */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BellRing className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">Push Bildirim</h2>
        </div>
        <PushNotificationToggle />
      </div>

      {/* Kaydet Butonu */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-emerald-400 text-sm font-medium animate-fade-in">
            ✓ Ayarlar kaydedildi
          </span>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          Kaydet
        </button>
      </div>
    </div>
  );
};

// Toggle Switch Component
const ToggleItem = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-100">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative w-14 h-7 rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-gray-700'
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// Language Button
const LanguageButton = ({ lang, label }) => {
  const { lang: currentLang, changeLanguage } = useLanguage();
  const isActive = currentLang === lang;
  return (
    <button
      onClick={() => changeLanguage(lang)}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${
        isActive
          ? 'bg-amber-500 text-black'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
};

// Push Notification Toggle
const PushNotificationToggle = () => {
  const [permission, setPermission] = useState(() => {
    if ('Notification' in window) return Notification.permission;
    return 'unsupported';
  });

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      new Notification('BeeMind 🐝', { body: 'Push bildirimleri aktif edildi!' });
    }
  };

  if (permission === 'unsupported') {
    return <p className="text-sm text-gray-500">Tarayıcınız push bildirimleri desteklemiyor.</p>;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-gray-100">Tarayıcı Bildirimleri</p>
        <p className="text-sm text-gray-500 mt-1">
          {permission === 'granted' ? '✅ Bildirimler aktif' :
           permission === 'denied' ? '❌ Bildirimler engellendi (tarayıcı ayarlarından açın)' :
           'Kritik alarmlar için tarayıcı bildirimi alın'}
        </p>
      </div>
      {permission !== 'granted' && permission !== 'denied' && (
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
        >
          İzin Ver
        </button>
      )}
    </div>
  );
};

export default SettingsView;

