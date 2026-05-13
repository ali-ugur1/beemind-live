import { useEffect, useRef } from "react";
import { X, Keyboard } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const ShortcutHelpModal = ({ onClose }) => {
  const { lang } = useLanguage();
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const prev = document.activeElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = original;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [onClose]);

  const tr = [
    { key: "D", desc: "Gösterge Paneli" },
    { key: "L", desc: "Kovan Listesi" },
    { key: "H", desc: "Harita" },
    { key: "R", desc: "Raporlar" },
    { key: "K", desc: "Karşılaştır" },
    { key: "T", desc: "Takvim" },
    { key: "P", desc: "Profil" },
    { key: "S", desc: "Ayarlar" },
    { key: "Esc", desc: "Kovan detayından geri dön" },
    { key: "?", desc: "Bu yardım ekranını aç/kapat" },
  ];

  const en = [
    { key: "D", desc: "Dashboard" },
    { key: "L", desc: "Hive List" },
    { key: "H", desc: "Map" },
    { key: "R", desc: "Reports" },
    { key: "K", desc: "Compare" },
    { key: "T", desc: "Calendar" },
    { key: "P", desc: "Profile" },
    { key: "S", desc: "Settings" },
    { key: "Esc", desc: "Go back from hive detail" },
    { key: "?", desc: "Toggle this help screen" },
  ];

  const shortcuts = lang === "tr" ? tr : en;
  const title = lang === "tr" ? "Klavye Kısayolları" : "Keyboard Shortcuts";
  const note =
    lang === "tr"
      ? "Kısayollar metin kutusu veya modal açıkken çalışmaz."
      : "Shortcuts are disabled while a text input or modal is focused.";

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden focus:outline-none animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts grid */}
        <div className="px-6 py-4 space-y-2">
          {shortcuts.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <kbd className="min-w-[2.2rem] text-center px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-xs font-mono text-amber-300 font-semibold">
                {key}
              </kbd>
              <span className="flex-1 text-sm text-gray-400">{desc}</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5">
          <p className="text-[11px] text-gray-600 leading-relaxed">{note}</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;
