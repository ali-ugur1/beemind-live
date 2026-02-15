import { useMemo } from 'react';
import { User, Mail, Phone, MapPin, Shield, Calendar, Hexagon } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

const SETTINGS_KEY = 'beemind_settings';

const defaultProfile = {
  fullName: 'Ahmet Yılmaz',
  email: 'ahmet@beemind.com',
  phone: '+90 555 123 4567',
  location: 'Konya, Türkiye'
};

const ProfileView = () => {
  const { hives } = useLiveData();
  const { t } = useLanguage();

  // Settings'den kaydedilmiş profil bilgilerini oku (useMemo ile React-uyumlu)
  const profile = useMemo(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || defaultProfile.fullName,
          email: parsed.email || defaultProfile.email,
          phone: parsed.phone || defaultProfile.phone,
          location: parsed.location || defaultProfile.location
        };
      }
    } catch (e) {
      // fallback to defaults
    }
    return { ...defaultProfile };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t.profile.title}</h1>
        <p className="text-gray-500">{t.profile.subtitle}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-amber-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-12 h-12 text-amber-400" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-100 mb-1">{profile.fullName}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                {t.profile.admin}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                {t.profile.proPlan}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{t.profile.membership}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats — dinamik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <Hexagon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-100 mb-1">{hives.length}</p>
          <p className="text-sm text-gray-500">{t.profile.totalHives}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-100 mb-1">%98</p>
          <p className="text-sm text-gray-500">{t.profile.uptime}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-100 mb-1">13</p>
          <p className="text-sm text-gray-500">{t.profile.activeMonths}</p>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-100">{t.profile.accountSecurity}</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-100">{t.profile.twoFactor}</p>
              <p className="text-sm text-gray-500">{t.profile.twoFactorDesc}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
              {t.profile.active}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-100">{t.profile.lastLogin}</p>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString()}, {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {t.profile.lastLoginDesc}
              </p>
            </div>
            <span className="text-xs text-gray-500">{profile.location}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: t.profile.profileTip }} />
      </div>
    </div>
  );
};

export default ProfileView;
