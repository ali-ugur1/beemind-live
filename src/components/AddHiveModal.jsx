import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Hexagon, Cpu, Wifi, MapPin } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../services/api";

const INITIAL_FORM = {
  name: "",
  deviceSerial: "",
  location: "Konya, Selcuklu",
  lat: "37.8746",
  lng: "32.4932",
  adapterType: "standard",
};

const AddHiveModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { addHive, hives } = useLiveData();
  const { t, lang } = useLanguage();
  const [form, setForm] = useState(INITIAL_FORM);
  const [serialError, setSerialError] = useState("");
  const [latError, setLatError] = useState("");
  const [lngError, setLngError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const adapterOptions = useMemo(
    () => [
      {
        value: "basic",
        label: t.addHive.adapterBasic,
        desc: t.addHive.adapterBasicDesc,
        active:
          "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/50",
        activeText: "text-emerald-400",
      },
      {
        value: "standard",
        label: t.addHive.adapterStandard,
        desc: t.addHive.adapterStandardDesc,
        active: "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50",
        activeText: "text-amber-400",
      },
      {
        value: "pro",
        label: t.addHive.adapterPro,
        desc: t.addHive.adapterProDesc,
        active: "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50",
        activeText: "text-purple-400",
      },
    ],
    [t],
  );

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSerialError("");
    setLatError("");
    setLngError("");
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    // Animasyon bittikten sonra resetle
    setTimeout(resetForm, 250);
  };

  const parseCoord = (raw) => {
    // Virgül → nokta (TR locale desteği), boşlukları temizle
    const normalized = String(raw).trim().replace(",", ".");
    if (normalized === "") return NaN;
    return parseFloat(normalized);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSerialError("");
    setLatError("");
    setLngError("");

    const name = form.name.trim();
    const deviceSerial = form.deviceSerial.trim();
    const location = form.location.trim();

    if (!name) {
      toast.error(t.addHive.nameEmpty);
      return;
    }

    if (!deviceSerial) {
      toast.error(t.addHive.serialEmpty);
      return;
    }

    // Duplicate seri numarası kontrolü (case-insensitive + trim)
    const serialLower = deviceSerial.toLowerCase();
    if (
      hives.some(
        (h) => (h.deviceSerial || "").trim().toLowerCase() === serialLower,
      )
    ) {
      setSerialError(t.addHive.serialDuplicate);
      toast.error(t.addHive.serialDuplicate);
      return;
    }

    // Duplicate isim kontrolü
    const nameLower = name.toLowerCase();
    if (hives.some((h) => (h.name || "").trim().toLowerCase() === nameLower)) {
      toast.error(t.addHive.nameDuplicate);
      return;
    }

    // Koordinat doğrulama — alan bazlı hata mesajları
    const lat = parseCoord(form.lat);
    const lng = parseCoord(form.lng);
    const invalidLat = isNaN(lat) || lat < -90 || lat > 90;
    const invalidLng = isNaN(lng) || lng < -180 || lng > 180;

    if (invalidLat || invalidLng) {
      if (invalidLat) {
        setLatError(
          lang === "tr"
            ? "Enlem -90 ile 90 arasında olmalı"
            : "Latitude must be between -90 and 90",
        );
      }
      if (invalidLng) {
        setLngError(
          lang === "tr"
            ? "Boylam -180 ile 180 arasında olmalı"
            : "Longitude must be between -180 and 180",
        );
      }
      toast.error(
        lang === "tr"
          ? "Geçersiz koordinat değerleri"
          : "Invalid coordinate values",
      );
      return;
    }

    // Yeni kovan ID'si oluştur (hive-001 formatını destekle)
    const maxId = hives.reduce((max, h) => {
      const match = String(h.id || "").match(/(\d+)$/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const newId = `hive-${String(maxId + 1).padStart(3, "0")}`;

    const isBasic = form.adapterType === "basic";
    const newHiveData = {
      id: newId,
      name,
      deviceSerial,
      location,
      lat,
      lng,
      adapterType: form.adapterType,
      status: "stable",
      alertType: null,
      temp: 0,
      humidity: 0,
      weight: 0,
      battery: 100,
      sound: isBasic ? undefined : 0,
      pressure: isBasic ? undefined : 0,
      vibration: isBasic ? undefined : 0,
      lastUpdate: lang === "tr" ? "Az önce" : "Just now",
      lastActivity:
        lang === "tr"
          ? "Cihaz bağlantısı bekleniyor"
          : "Waiting for device connection",
      priority: 3,
      hasData: false,
    };

    setSubmitting(true);

    // Backend'e kaydet (başarısız olursa sadece local'de kalır)
    let backendOk = false;
    try {
      await api.createHive({
        id: newId,
        name,
        location,
        lat,
        lng,
        deviceSerial,
        adapterType: form.adapterType,
      });
      backendOk = true;
    } catch (err) {
      console.warn(
        "Backend hive create failed, local only:",
        err?.message || err,
      );
    }

    addHive(newHiveData);

    if (backendOk) {
      toast.success(`${name} ${t.addHive.success}`);
    } else {
      toast.info(
        lang === "tr"
          ? `${name} eklendi (çevrimdışı mod)`
          : `${name} added (offline mode)`,
      );
    }

    setSubmitting(false);
    onClose();
    setTimeout(resetForm, 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Hexagon className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-100">
                  {t.addHive.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Kovan Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t.addHive.hiveName} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t.addHive.hiveNamePlaceholder}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  autoFocus
                  maxLength={60}
                  disabled={submitting}
                />
              </div>

              {/* Cihaz Seri Numarası */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <Cpu className="w-4 h-4" />
                  {t.addHive.deviceSerial} *
                </label>
                <input
                  type="text"
                  value={form.deviceSerial}
                  onChange={(e) => {
                    setSerialError("");
                    setForm((prev) => ({
                      ...prev,
                      deviceSerial: e.target.value,
                    }));
                  }}
                  placeholder={t.addHive.deviceSerialPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={submitting}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors font-mono text-sm ${
                    serialError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-amber-500"
                  }`}
                />
                {serialError && (
                  <p className="text-xs text-red-400 mt-1">{serialError}</p>
                )}
                <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  {t.addHive.serialHint}
                </p>
              </div>

              {/* Adaptör Tipi */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t.addHive.adapterType} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {adapterOptions.map((opt) => {
                    const isActive = form.adapterType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            adapterType: opt.value,
                          }))
                        }
                        disabled={submitting}
                        aria-pressed={isActive}
                        className={`p-3 rounded-lg border text-center transition-all disabled:opacity-60 ${
                          isActive
                            ? opt.active
                            : "border-gray-700 bg-gray-800 hover:border-gray-600"
                        }`}
                      >
                        <p
                          className={`text-sm font-bold ${isActive ? opt.activeText : "text-gray-300"}`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Konum */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t.addHive.location}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder={
                    lang === "tr"
                      ? "Ornek: Konya, Selcuklu"
                      : "e.g. Konya, Selcuklu"
                  }
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Koordinatlar */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  {lang === "tr" ? "GPS Koordinatlari" : "GPS Coordinates"}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {lang === "tr" ? "Enlem (Lat)" : "Latitude"}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.lat}
                      onChange={(e) => {
                        setLatError("");
                        setForm((prev) => ({ ...prev, lat: e.target.value }));
                      }}
                      placeholder="37.8746"
                      disabled={submitting}
                      className={`w-full px-3 py-2.5 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors font-mono text-sm ${
                        latError
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                    />
                    {latError && (
                      <p className="text-xs text-red-400 mt-1">{latError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {lang === "tr" ? "Boylam (Lng)" : "Longitude"}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.lng}
                      onChange={(e) => {
                        setLngError("");
                        setForm((prev) => ({ ...prev, lng: e.target.value }));
                      }}
                      placeholder="32.4932"
                      disabled={submitting}
                      className={`w-full px-3 py-2.5 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors font-mono text-sm ${
                        lngError
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-700 focus:border-amber-500"
                      }`}
                    />
                    {lngError && (
                      <p className="text-xs text-red-400 mt-1">{lngError}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                  {lang === "tr"
                    ? "Google Maps'ten kovan konumunuzun koordinatlarini alabilirsiniz"
                    : "You can get coordinates from Google Maps for your hive location"}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-gray-400">{t.addHive.tip}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {t.addHive.add}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddHiveModal;
