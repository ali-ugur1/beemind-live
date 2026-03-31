import { useState, useEffect } from 'react';
import { User, Bell, Save, Mail, Phone, MapPin, Sun, Moon, Globe, BellRing, Palette, Download, Upload, Trash2, Lock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const SETTINGS_KEY = 'hexora_settings';

const SettingsView = ({ pushNotifications }) => {
  const toast = useToast();
  const { theme, toggleTheme, accent, changeAccent, accentColors } = useTheme();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [settings, setSettings] = useState(() => {
    const base = {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || 'Konya, Türkiye',
      emailNotifications: true,
      smsNotifications: false,
      criticalAlertsOnly: false,
      weeklyReport: true
    };
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...base, ...JSON.parse(saved) };
      }
    } catch (e) {
      // localStorage parse hatası
    }
    return base;
  });

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('hexora-settings-updated'));
      // Profil bilgilerini backend'e de kaydet
      try {
        await api.updateProfile({ fullName: settings.fullName, phone: settings.phone, location: settings.location });
      } catch {}
      setSaved(true);
      toast.success(t.settings.saved);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast.error(lang === 'tr' ? 'Ayarlar kaydedilemedi' : 'Failed to save settings');
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.newPass) {
      toast.error(lang === 'tr' ? 'Mevcut ve yeni şifre gerekli' : 'Current and new password required');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error(lang === 'tr' ? 'Yeni şifre en az 6 karakter olmalı' : 'New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error(lang === 'tr' ? 'Yeni şifreler eşleşmiyor' : 'New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.changePassword(passwordForm.current, passwordForm.newPass);
      toast.success(lang === 'tr' ? 'Şifre değiştirildi' : 'Password changed');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || (lang === 'tr' ? 'Şifre değiştirilemedi' : 'Failed to change password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t.settings.title}</h1>
        <p className="text-gray-500">{t.settings.subtitle}</p>
      </div>

      {/* Profil Bilgileri */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">{t.settings.profileInfo}</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {t.settings.fullName}
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
              {t.settings.email}
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
              {t.settings.phone}
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
              {t.settings.location}
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
          <h2 className="text-xl font-semibold text-gray-100">{t.settings.notificationPrefs}</h2>
        </div>

        <div className="space-y-4">
          <ToggleItem
            label={t.settings.emailNotifs}
            description={t.settings.emailNotifsDesc}
            checked={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />

          <ToggleItem
            label={t.settings.smsNotifs}
            description={t.settings.smsNotifsDesc}
            checked={settings.smsNotifications}
            onChange={() => handleToggle('smsNotifications')}
          />

          <ToggleItem
            label={t.settings.criticalOnly}
            description={t.settings.criticalOnlyDesc}
            checked={settings.criticalAlertsOnly}
            onChange={() => handleToggle('criticalAlertsOnly')}
          />

          <ToggleItem
            label={t.settings.weeklyReport}
            description={t.settings.weeklyReportDesc}
            checked={settings.weeklyReport}
            onChange={() => handleToggle('weeklyReport')}
          />
        </div>
      </div>

      {/* Tema Ayarı */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 light:bg-white light:border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          {theme === 'dark' ? <Moon className="w-6 h-6 text-amber-400" /> : <Sun className="w-6 h-6 text-amber-400" />}
          <h2 className="text-xl font-semibold text-gray-100 light:text-gray-900">{t.settings.theme}</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg light:bg-gray-100">
          <div className="flex-1">
            <p className="font-medium text-gray-100 light:text-gray-900">{t.settings.darkLight}</p>
            <p className="text-sm text-gray-500 mt-1">
              {theme === 'dark' ? t.settings.darkActive : t.settings.lightActive}
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

      {/* Renk Paleti */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">{lang === 'tr' ? 'Renk Paleti' : 'Color Palette'}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{lang === 'tr' ? 'Arayüz vurgu rengini seçin' : 'Choose interface accent color'}</p>
        <div className="flex gap-3 flex-wrap">
          {accentColors && Object.entries(accentColors).map(([key, color]) => (
            <button
              key={key}
              onClick={() => changeAccent(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                accent === key
                  ? 'border-white/60 scale-105 shadow-lg'
                  : 'border-transparent hover:border-gray-600'
              }`}
              style={{ backgroundColor: accent === key ? color.primary : 'rgb(31,41,55)', color: accent === key ? '#000' : color.primary }}
            >
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.primary }} />
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dil Ayarı */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">{t.settings.language}</h2>
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
          <h2 className="text-xl font-semibold text-gray-100">{lang === 'tr' ? 'Push Bildirim' : 'Push Notifications'}</h2>
        </div>
        <PushNotificationToggle pushNotifications={pushNotifications} />
      </div>

      {/* Veri Yedekleme & Sıfırlama */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">{lang === 'tr' ? 'Veri Yönetimi' : 'Data Management'}</h2>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/backup');
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `hexora-backup-${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(lang === 'tr' ? 'Yedek indirildi' : 'Backup downloaded');
                } catch { toast.error(lang === 'tr' ? 'Yedekleme başarısız' : 'Backup failed'); }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              {lang === 'tr' ? 'Yedek İndir' : 'Download Backup'}
            </button>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors font-medium cursor-pointer">
              <Upload className="w-4 h-4" />
              {lang === 'tr' ? 'Yedekten Geri Yükle' : 'Restore from Backup'}
              <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const text = await file.text();
                  const data = JSON.parse(text);
                  const res = await fetch('/api/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) {
                    const result = await res.json();
                    toast.success(lang === 'tr' ? `Geri yüklendi: ${result.sensorCount} sensör, ${result.hiveCount} kovan` : `Restored: ${result.sensorCount} sensors, ${result.hiveCount} hives`);
                  } else {
                    toast.error(lang === 'tr' ? 'Geri yükleme başarısız' : 'Restore failed');
                  }
                } catch { toast.error(lang === 'tr' ? 'Geçersiz yedek dosyası' : 'Invalid backup file'); }
                e.target.value = '';
              }} />
            </label>
            <button
              onClick={async () => {
                if (!window.confirm(lang === 'tr' ? 'Tüm sensör verilerini silmek istediğinize emin misiniz?' : 'Are you sure you want to delete all sensor data?')) return;
                try {
                  const res = await fetch('/api/data/reset?target=sensor', { method: 'DELETE' });
                  if (res.ok) toast.success(lang === 'tr' ? 'Sensör verileri sıfırlandı' : 'Sensor data reset');
                  else toast.error(lang === 'tr' ? 'Sıfırlama başarısız' : 'Reset failed');
                } catch { toast.error(lang === 'tr' ? 'Sıfırlama başarısız' : 'Reset failed'); }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {lang === 'tr' ? 'Verileri Sıfırla' : 'Reset Data'}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">{lang === 'tr' ? 'Yedek dosyası sensör verileri ve kovan bilgilerini içerir.' : 'Backup file contains sensor data and hive information.'}</p>
        </div>
      </div>

      {/* Şifre Değiştirme */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-semibold text-gray-100">{lang === 'tr' ? 'Şifre Değiştir' : 'Change Password'}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{lang === 'tr' ? 'Mevcut Şifre' : 'Current Password'}</label>
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{lang === 'tr' ? 'Yeni Şifre' : 'New Password'}</label>
            <input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors" placeholder={lang === 'tr' ? 'En az 6 karakter' : 'At least 6 characters'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{lang === 'tr' ? 'Yeni Şifre (Tekrar)' : 'Confirm New Password'}</label>
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          <button onClick={handlePasswordChange} disabled={passwordLoading} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium disabled:opacity-50">
            <Lock className="w-4 h-4" />
            {passwordLoading ? (lang === 'tr' ? 'Değiştiriliyor...' : 'Changing...') : (lang === 'tr' ? 'Şifreyi Değiştir' : 'Change Password')}
          </button>
        </div>
      </div>

      {/* Kaydet Butonu */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-emerald-400 text-sm font-medium animate-fade-in">
            {t.settings.saved}
          </span>
        )}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          {t.settings.save}
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

// Push Notification Toggle (SW Push + Browser Notification)
const PushNotificationToggle = ({ pushNotifications }) => {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isTr = lang === 'tr';

  const supported = typeof Notification !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  const perm = pushNotifications?.permission || 'default';
  const subscribed = pushNotifications?.isSubscribed || false;

  const handleToggle = async () => {
    if (!pushNotifications) return;
    setLoading(true);
    try {
      if (subscribed) {
        await pushNotifications.unsubscribe();
      } else {
        const ok = await pushNotifications.subscribe();
        if (ok) {
          new Notification('Hexora ⬡', {
            body: isTr ? 'Push bildirimleri aktif! Sensör alarmları telefonunuza gelecek.' : 'Push notifications enabled! Sensor alerts will come to your device.',
            icon: '/hexora-logo.svg',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return <p className="text-sm text-gray-500">{isTr ? 'Tarayıcınız push bildirimleri desteklemiyor.' : 'Your browser does not support push notifications.'}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex-1">
          <p className="font-medium text-gray-100">{isTr ? 'Sensör Alarm Bildirimleri' : 'Sensor Alert Notifications'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {perm === 'denied'
              ? (isTr ? '❌ Bildirimler engellendi — tarayıcı ayarlarından açın' : '❌ Notifications blocked — enable in browser settings')
              : subscribed
              ? (isTr ? '✅ Aktif — sıcaklık, nem ve ses alarmları gelecek' : '✅ Active — temperature, humidity and sound alerts enabled')
              : (isTr ? 'Kovan sensörleri eşik aştığında anında bildirim alın' : 'Get instant alerts when hive sensors exceed thresholds')}
          </p>
        </div>
        {perm !== 'denied' && (
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative w-14 h-7 rounded-full transition-colors ${subscribed ? 'bg-amber-500' : 'bg-gray-700'} ${loading ? 'opacity-50' : ''}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${subscribed ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        )}
      </div>
      {subscribed && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isTr ? 'Sıcaklık' : 'Temperature', range: '10°C – 40°C' },
            { label: isTr ? 'Nem' : 'Humidity', range: '30% – 85%' },
            { label: isTr ? 'Ses' : 'Sound', range: '0 – 85 dB' },
          ].map((a, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/40 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-gray-300">{a.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{a.range}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsView;

