import { useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Hexagon,
  Info,
} from "lucide-react";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

const SETTINGS_KEY = "hexora_settings";

const ProfileView = () => {
  const { hives } = useLiveData();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const profile = useMemo(() => {
    const base = {
      fullName: user?.fullName || (lang === "tr" ? "Kullanıcı" : "User"),
      email: user?.email || "—",
      phone: user?.phone || "—",
      location: user?.location || "Konya, Türkiye",
    };
    try {
      const saved =
        typeof window !== "undefined"
          ? window.localStorage.getItem(SETTINGS_KEY)
          : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName || base.fullName,
          email: parsed.email || base.email,
          phone: parsed.phone || base.phone,
          location: parsed.location || base.location,
        };
      }
    } catch (err) {
      console.warn("[ProfileView] settings parse failed:", err);
    }
    return base;
  }, [user, lang]);

  const initials = useMemo(() => {
    const name = profile.fullName?.trim();
    if (!name) return "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [profile.fullName]);

  const activeMonths = useMemo(() => {
    if (!user?.createdAt) return 0;
    const created = new Date(user.createdAt);
    if (isNaN(created.getTime())) return 0;
    const now = new Date();
    let months =
      (now.getFullYear() - created.getFullYear()) * 12 +
      (now.getMonth() - created.getMonth());
    if (now.getDate() < created.getDate()) months -= 1;
    return Math.max(1, months); // Yeni üye için en az 1 ay göster
  }, [user]);

  const stableRatio = useMemo(() => {
    if (!hives?.length) return null;
    const stable = hives.filter((h) => h.status === "stable").length;
    return Math.round((stable / hives.length) * 100);
  }, [hives]);

  const formattedUptime = useMemo(() => {
    if (stableRatio === null) return "—";
    return lang === "tr" ? `%${stableRatio}` : `${stableRatio}%`;
  }, [stableRatio, lang]);

  const locale = lang === "tr" ? "tr-TR" : "en-US";

  const membershipDate = useMemo(() => {
    if (!user?.createdAt) return lang === "tr" ? "Bilinmiyor" : "Unknown";
    const d = new Date(user.createdAt);
    if (isNaN(d.getTime())) return lang === "tr" ? "Bilinmiyor" : "Unknown";
    return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }, [user, lang, locale]);

  const lastLoginText = useMemo(() => {
    const now = new Date();
    const date = now.toLocaleDateString(locale);
    const time = now.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date}, ${time} · ${t.profile.lastLoginDesc}`;
  }, [locale, t.profile.lastLoginDesc]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          {t.profile.title}
        </h1>
        <p className="text-gray-500">{t.profile.subtitle}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 bg-amber-500/20 border-2 border-amber-500/50 rounded-full flex items-center justify-center flex-shrink-0 relative"
            aria-label={profile.fullName}
          >
            {initials ? (
              <span className="text-2xl font-bold text-amber-400 tracking-wide">
                {initials}
              </span>
            ) : (
              <User className="w-12 h-12 text-amber-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <h2 className="text-2xl font-bold text-gray-100 mb-1 break-words">
              {profile.fullName}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                {t.profile.admin}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full">
                {t.profile.proPlan}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400 min-w-0">
                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate" title={profile.email}>
                  {profile.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 min-w-0">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate" title={profile.phone}>
                  {profile.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 min-w-0">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate" title={profile.location}>
                  {profile.location}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 min-w-0">
                <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">
                  {t.profile.membershipSince} {membershipDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <Hexagon className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-100 mb-1">
            {hives?.length ?? 0}
          </p>
          <p className="text-sm text-gray-500">{t.profile.totalHives}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-100 mb-1">
            {formattedUptime}
          </p>
          <p className="text-sm text-gray-500">{t.profile.uptime}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-gray-100 mb-1">
            {activeMonths}
          </p>
          <p className="text-sm text-gray-500">{t.profile.activeMonths}</p>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-100">
            {t.profile.accountSecurity}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg gap-4">
            <div className="min-w-0">
              <p className="font-medium text-gray-100">{t.profile.twoFactor}</p>
              <p className="text-sm text-gray-500">{t.profile.twoFactorDesc}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex-shrink-0">
              {t.profile.active}
            </span>
          </div>
          <div className="flex items-start justify-between p-4 bg-gray-800 rounded-lg gap-4 flex-col sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="font-medium text-gray-100">{t.profile.lastLogin}</p>
              <p className="text-sm text-gray-500">{lastLoginText}</p>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {profile.location}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-400">{t.profile.profileTip}</p>
      </div>
    </div>
  );
};

export default ProfileView;
