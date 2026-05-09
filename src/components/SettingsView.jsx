import { useState } from "react";
import {
  User,
  Bell,
  Save,
  Mail,
  Phone,
  MapPin,
  Sun,
  Moon,
  Globe,
  BellRing,
  Palette,
  Download,
  Upload,
  Trash2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

const SETTINGS_KEY = "beemora_settings";
const JWT_KEY = "beemora_jwt";

// --- Küçük yardımcılar ---------------------------------------------------

const getToken = () => {
  try {
    return localStorage.getItem(JWT_KEY);
  } catch {
    return null;
  }
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const loadInitialSettings = (user) => {
  const base = {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "Konya, Türkiye",
    emailNotifications: true,
    smsNotifications: false,
    criticalAlertsOnly: false,
    weeklyReport: true,
  };
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        return { ...base, ...parsed };
      }
    }
  } catch {
    // bozuk kayıt — sessizce yok say
  }
  return base;
};

// --- Ana bileşen ---------------------------------------------------------

const SettingsView = ({ pushNotifications }) => {
  const toast = useToast();
  const { theme, toggleTheme, accent, changeAccent, accentColors } = useTheme();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const isTr = lang === "tr";

  const [settings, setSettings] = useState(() => loadInitialSettings(user));
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event("beemora-settings-updated"));

      try {
        await api.updateProfile({
          fullName: settings.fullName,
          phone: settings.phone,
          location: settings.location,
        });
      } catch (profileErr) {
        // Yerel kayıt başarılı ama backend hata verdi — kullanıcıya bildir
        toast.error(
          profileErr?.message ||
            (isTr
              ? "Profil sunucuya kaydedilemedi"
              : "Failed to sync profile to server"),
        );
        setSaveLoading(false);
        return;
      }

      setSaved(true);
      toast.success(t.settings.saved);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error(isTr ? "Ayarlar kaydedilemedi" : "Failed to save settings");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.newPass) {
      toast.error(
        isTr
          ? "Mevcut ve yeni şifre gerekli"
          : "Current and new password required",
      );
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error(
        isTr
          ? "Yeni şifre en az 6 karakter olmalı"
          : "New password must be at least 6 characters",
      );
      return;
    }
    if (passwordForm.newPass === passwordForm.current) {
      toast.error(
        isTr
          ? "Yeni şifre eskisiyle aynı olamaz"
          : "New password must differ from current",
      );
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error(
        isTr ? "Yeni şifreler eşleşmiyor" : "New passwords do not match",
      );
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword(passwordForm.current, passwordForm.newPass);
      toast.success(isTr ? "Şifre değiştirildi" : "Password changed");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(
        err?.message ||
          (isTr ? "Şifre değiştirilemedi" : "Failed to change password"),
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleBackupDownload = async () => {
    try {
      const res = await fetch("/api/backup", { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beemora-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(isTr ? "Yedek indirildi" : "Backup downloaded");
    } catch {
      toast.error(isTr ? "Yedekleme başarısız" : "Backup failed");
    }
  };

  const handleRestoreUpload = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        toast.error(isTr ? "Geçersiz JSON dosyası" : "Invalid JSON file");
        return;
      }

      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json().catch(() => ({}));
        const sc = result.sensorCount ?? "?";
        const hc = result.hiveCount ?? "?";
        toast.success(
          isTr
            ? `Geri yüklendi: ${sc} sensör, ${hc} kovan`
            : `Restored: ${sc} sensors, ${hc} hives`,
        );
      } else {
        toast.error(isTr ? "Geri yükleme başarısız" : "Restore failed");
      }
    } catch {
      toast.error(isTr ? "Yedek yüklenemedi" : "Failed to restore backup");
    } finally {
      input.value = "";
    }
  };

  const handleResetConfirm = async () => {
    setResetLoading(true);
    try {
      const res = await fetch("/api/data/reset?target=sensor", {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast.success(
          isTr ? "Sensör verileri sıfırlandı" : "Sensor data reset",
        );
      } else {
        toast.error(isTr ? "Sıfırlama başarısız" : "Reset failed");
      }
    } catch {
      toast.error(isTr ? "Sıfırlama başarısız" : "Reset failed");
    } finally {
      setResetLoading(false);
      setConfirmResetOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          {t.settings.title}
        </h1>
        <p className="text-gray-500">{t.settings.subtitle}</p>
      </div>

      {/* Profil Bilgileri */}
      <SectionCard
        icon={<User className="w-6 h-6 text-amber-400" />}
        title={t.settings.profileInfo}
      >
        <div className="space-y-4">
          <FormField label={t.settings.fullName}>
            <input
              type="text"
              value={settings.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </FormField>

          <FormField
            label={t.settings.email}
            icon={<Mail className="w-4 h-4" />}
          >
            <input
              type="email"
              value={settings.email}
              readOnly
              disabled
              title={
                isTr ? "E-posta değiştirilemez" : "Email cannot be changed"
              }
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </FormField>

          <FormField
            label={t.settings.phone}
            icon={<Phone className="w-4 h-4" />}
          >
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </FormField>

          <FormField
            label={t.settings.location}
            icon={<MapPin className="w-4 h-4" />}
          >
            <input
              type="text"
              value={settings.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </FormField>
        </div>
      </SectionCard>

      {/* Bildirim Tercihleri */}
      <SectionCard
        icon={<Bell className="w-6 h-6 text-amber-400" />}
        title={t.settings.notificationPrefs}
      >
        <div className="space-y-4">
          <ToggleItem
            label={t.settings.emailNotifs}
            description={t.settings.emailNotifsDesc}
            checked={settings.emailNotifications}
            onChange={() => handleToggle("emailNotifications")}
          />
          <ToggleItem
            label={t.settings.smsNotifs}
            description={t.settings.smsNotifsDesc}
            checked={settings.smsNotifications}
            onChange={() => handleToggle("smsNotifications")}
          />
          <ToggleItem
            label={t.settings.criticalOnly}
            description={t.settings.criticalOnlyDesc}
            checked={settings.criticalAlertsOnly}
            onChange={() => handleToggle("criticalAlertsOnly")}
          />
          <ToggleItem
            label={t.settings.weeklyReport}
            description={t.settings.weeklyReportDesc}
            checked={settings.weeklyReport}
            onChange={() => handleToggle("weeklyReport")}
          />
        </div>
      </SectionCard>

      {/* Tema */}
      <SectionCard
        icon={
          theme === "dark" ? (
            <Moon className="w-6 h-6 text-amber-400" />
          ) : (
            <Sun className="w-6 h-6 text-amber-400" />
          )
        }
        title={t.settings.theme}
      >
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-gray-100">{t.settings.darkLight}</p>
            <p className="text-sm text-gray-500 mt-1">
              {theme === "dark"
                ? t.settings.darkActive
                : t.settings.lightActive}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isTr ? "Tema değiştir" : "Toggle theme"}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              theme === "light" ? "bg-amber-500" : "bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center ${
                theme === "light" ? "translate-x-8" : "translate-x-1"
              }`}
            >
              {theme === "light" ? (
                <Sun className="w-3 h-3 text-amber-500" />
              ) : (
                <Moon className="w-3 h-3 text-gray-600" />
              )}
            </span>
          </button>
        </div>
      </SectionCard>

      {/* Renk Paleti */}
      <SectionCard
        icon={<Palette className="w-6 h-6 text-amber-400" />}
        title={isTr ? "Renk Paleti" : "Color Palette"}
      >
        <p className="text-sm text-gray-500 mb-4">
          {isTr
            ? "Arayüz vurgu rengini seçin"
            : "Choose interface accent color"}
        </p>
        <div className="flex gap-3 flex-wrap">
          {accentColors &&
            Object.entries(accentColors).map(([key, color]) => {
              const active = accent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeAccent(key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                    active
                      ? "border-white/60 scale-105 shadow-lg"
                      : "border-transparent bg-gray-800 hover:border-gray-600"
                  }`}
                  style={{
                    backgroundColor: active ? color.primary : undefined,
                    color: active ? "#000" : color.primary,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color.primary }}
                  />
                  {color.name}
                </button>
              );
            })}
        </div>
      </SectionCard>

      {/* Dil */}
      <SectionCard
        icon={<Globe className="w-6 h-6 text-amber-400" />}
        title={t.settings.language}
      >
        <div className="flex gap-3 flex-wrap">
          <LanguageButton lang="tr" label="🇹🇷 Türkçe" />
          <LanguageButton lang="en" label="🇬🇧 English" />
        </div>
      </SectionCard>

      {/* Push Bildirim */}
      <SectionCard
        icon={<BellRing className="w-6 h-6 text-amber-400" />}
        title={isTr ? "Push Bildirim" : "Push Notifications"}
      >
        <PushNotificationToggle pushNotifications={pushNotifications} />
      </SectionCard>

      {/* Veri Yönetimi */}
      <SectionCard
        icon={<Download className="w-6 h-6 text-amber-400" />}
        title={isTr ? "Veri Yönetimi" : "Data Management"}
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBackupDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            {isTr ? "Yedek İndir" : "Download Backup"}
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors font-medium cursor-pointer">
            <Upload className="w-4 h-4" />
            {isTr ? "Yedekten Geri Yükle" : "Restore from Backup"}
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleRestoreUpload}
            />
          </label>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            {isTr ? "Verileri Sıfırla" : "Reset Data"}
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-3">
          {isTr
            ? "Yedek dosyası sensör verileri ve kovan bilgilerini içerir."
            : "Backup file contains sensor data and hive information."}
        </p>

        {confirmResetOpen && (
          <ResetConfirmModal
            loading={resetLoading}
            onCancel={() => setConfirmResetOpen(false)}
            onConfirm={handleResetConfirm}
            isTr={isTr}
          />
        )}
      </SectionCard>

      {/* Şifre Değiştirme */}
      <SectionCard
        icon={<Lock className="w-6 h-6 text-amber-400" />}
        title={isTr ? "Şifre Değiştir" : "Change Password"}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordChange();
          }}
        >
          <FormField label={isTr ? "Mevcut Şifre" : "Current Password"}>
            <input
              type="password"
              autoComplete="current-password"
              value={passwordForm.current}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, current: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </FormField>

          <FormField label={isTr ? "Yeni Şifre" : "New Password"}>
            <input
              type="password"
              autoComplete="new-password"
              value={passwordForm.newPass}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPass: e.target.value }))
              }
              placeholder={isTr ? "En az 6 karakter" : "At least 6 characters"}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </FormField>

          <FormField
            label={isTr ? "Yeni Şifre (Tekrar)" : "Confirm New Password"}
          >
            <input
              type="password"
              autoComplete="new-password"
              value={passwordForm.confirm}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </FormField>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            {passwordLoading
              ? isTr
                ? "Değiştiriliyor..."
                : "Changing..."
              : isTr
                ? "Şifreyi Değiştir"
                : "Change Password"}
          </button>
        </form>
      </SectionCard>

      {/* Kaydet */}
      <div className="flex items-center justify-end gap-4 pb-4">
        {saved && (
          <span className="text-emerald-400 text-sm font-medium">
            {t.settings.saved}
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveLoading}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saveLoading
            ? isTr
              ? "Kaydediliyor..."
              : "Saving..."
            : t.settings.save}
        </button>
      </div>
    </div>
  );
};

// --- Alt bileşenler ------------------------------------------------------

const SectionCard = ({ icon, title, children }) => (
  <section className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <header className="flex items-center gap-3 mb-6">
      {icon}
      <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
    </header>
    {children}
  </section>
);

const FormField = ({ label, icon, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
      {icon}
      {label}
    </label>
    {children}
  </div>
);

const ToggleItem = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
    <div className="flex-1 pr-4">
      <p className="font-medium text-gray-100">{label}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-amber-500" : "bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? "translate-x-8" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const LanguageButton = ({ lang, label }) => {
  const { lang: currentLang, changeLanguage } = useLanguage();
  const isActive = currentLang === lang;
  return (
    <button
      type="button"
      onClick={() => changeLanguage(lang)}
      className={`px-6 py-3 rounded-lg font-medium transition-all ${
        isActive
          ? "bg-amber-500 text-black"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
};

const ResetConfirmModal = ({ loading, onCancel, onConfirm, isTr }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
      aria-hidden="true"
    />
    <div
      role="dialog"
      aria-modal="true"
      className="relative bg-gray-900 border border-red-500/40 rounded-xl p-6 max-w-sm w-full shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-100">
          {isTr ? "Verileri Sıfırla" : "Reset Data"}
        </h3>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        {isTr
          ? "Tüm sensör verileri kalıcı olarak silinecek. Bu işlem geri alınamaz."
          : "All sensor data will be permanently deleted. This action cannot be undone."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isTr ? "İptal" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? "..." : isTr ? "Sil" : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const PushNotificationToggle = ({ pushNotifications }) => {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isTr = lang === "tr";

  const supported =
    typeof window !== "undefined" &&
    typeof Notification !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  const perm = pushNotifications?.permission || "default";
  const subscribed = pushNotifications?.isSubscribed || false;

  const showWelcomeNotification = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const opts = {
        body: isTr
          ? "Push bildirimleri aktif! Sensör alarmları telefonunuza gelecek."
          : "Push notifications enabled! Sensor alerts will come to your device.",
        icon: "/hexora-logo.svg",
      };
      if (reg && "showNotification" in reg) {
        await reg.showNotification("BeeMora ⬡", opts);
      } else {
        new Notification("BeeMora ⬡", opts);
      }
    } catch {
      // Bildirim gösterilemezse sessiz geç — abonelik zaten açıldı
    }
  };

  const handleToggle = async () => {
    if (!pushNotifications || loading) return;
    setLoading(true);
    try {
      if (subscribed) {
        await pushNotifications.unsubscribe();
      } else {
        const ok = await pushNotifications.subscribe();
        if (ok) await showWelcomeNotification();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <p className="text-sm text-gray-500">
        {isTr
          ? "Tarayıcınız push bildirimleri desteklemiyor."
          : "Your browser does not support push notifications."}
      </p>
    );
  }

  const statusText =
    perm === "denied"
      ? isTr
        ? "❌ Bildirimler engellendi — tarayıcı ayarlarından açın"
        : "❌ Notifications blocked — enable in browser settings"
      : subscribed
        ? isTr
          ? "✅ Aktif — sıcaklık, nem ve ses alarmları gelecek"
          : "✅ Active — temperature, humidity and sound alerts enabled"
        : isTr
          ? "Kovan sensörleri eşik aştığında anında bildirim alın"
          : "Get instant alerts when hive sensors exceed thresholds";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex-1 pr-4">
          <p className="font-medium text-gray-100">
            {isTr ? "Sensör Alarm Bildirimleri" : "Sensor Alert Notifications"}
          </p>
          <p className="text-sm text-gray-500 mt-1">{statusText}</p>
        </div>
        {perm !== "denied" && (
          <button
            type="button"
            role="switch"
            aria-checked={subscribed}
            onClick={handleToggle}
            disabled={loading}
            className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
              subscribed ? "bg-amber-500" : "bg-gray-700"
            } ${loading ? "opacity-50 cursor-wait" : ""}`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                subscribed ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        )}
      </div>

      {subscribed && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isTr ? "Sıcaklık" : "Temperature", range: "10°C – 40°C" },
            { label: isTr ? "Nem" : "Humidity", range: "30% – 85%" },
            { label: isTr ? "Ses" : "Sound", range: "0 – 85 dB" },
          ].map((a) => (
            <div
              key={a.label}
              className="bg-gray-800/50 border border-gray-700/40 rounded-lg p-3 text-center"
            >
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
