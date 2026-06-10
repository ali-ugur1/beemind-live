import { useState, useEffect, useCallback } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../services/api";

const INITIAL_FORM = { location: "", note: "" };

const EditHiveModal = ({ hive, isOpen, onClose, onSave }) => {
  const toast = useToast();
  const { t, lang } = useLanguage();
  const dialogRef = useFocusTrap(isOpen);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Load saved data when modal opens for a hive
  useEffect(() => {
    if (!hive) {
      setFormData(INITIAL_FORM);
      return;
    }
    try {
      const raw = localStorage.getItem(`beemora_hive_${hive.id}`);
      const saved = raw ? JSON.parse(raw) : {};
      setFormData({
        location: saved.location || "",
        note: saved.note || "",
      });
    } catch {
      setFormData(INITIAL_FORM);
    }
  }, [hive]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, saving, onClose]);

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = async () => {
    if (saving || !hive) return;
    setSaving(true);

    let serverOk = true;
    try {
      await api.updateHive(hive.id, formData);
    } catch (err) {
      serverOk = false;
      toast.error(
        lang === "tr"
          ? `Sunucu hatası: ${err?.message || "Bilinmeyen hata"}`
          : `Server error: ${err?.message || "Unknown error"}`,
      );
    }

    // Always persist locally so UI stays consistent even if server failed
    try {
      localStorage.setItem(`beemora_hive_${hive.id}`, JSON.stringify(formData));
    } catch {
      // Storage might be full or disabled — silently ignore
    }

    setSaving(false);

    if (serverOk) {
      toast.success(`${hive.name || hive.id} ${t.editHive.success}`);
    }

    onSave && onSave(hive.id, formData);
    onClose();
  };

  const handleBackdropClick = () => {
    if (!saving) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && hive && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-hive-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={dialogRef}
            className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3
                id="edit-hive-title"
                className="text-lg font-bold text-gray-100"
              >
                {t.common.edit} — {hive.name || `${t.common.hive} #${hive.id}`}
              </h3>
              <button
                onClick={onClose}
                disabled={saving}
                aria-label={t.common.cancel}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="hive-location"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  {t.editHive.location}
                </label>
                <input
                  id="hive-location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange("location")}
                  placeholder={t.editHive.locationPlaceholder}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="hive-note"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  {t.editHive.note}
                </label>
                <textarea
                  id="hive-note"
                  rows={3}
                  value={formData.note}
                  onChange={handleChange("note")}
                  placeholder={t.editHive.notePlaceholder}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none disabled:opacity-60"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-60"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving
                  ? lang === "tr"
                    ? "Kaydediliyor..."
                    : "Saving..."
                  : t.common.save}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditHiveModal;
