import { FileText, Bell, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const FloatingActionBar = ({ count, onReport, onNotification, onClose }) => {
  const { lang } = useLanguage();

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      role="toolbar"
      aria-label={lang === "tr" ? "Seçim araç çubuğu" : "Selection toolbar"}
    >
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-2xl shadow-2xl ring-1 ring-black/10 backdrop-blur-sm px-5 py-3 flex items-center gap-4 sm:gap-6">
        {/* Count */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none" aria-hidden="true">
            ⚡
          </span>
          <span className="font-bold text-base sm:text-lg whitespace-nowrap">
            {count} {lang === "tr" ? "Seçili" : "Selected"}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-black/20" aria-hidden="true" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReport}
            aria-label={lang === "tr" ? "Raporla" : "Report"}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/10 hover:bg-black/25 active:bg-black/35 rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {lang === "tr" ? "Raporla" : "Report"}
            </span>
          </button>

          <button
            type="button"
            onClick={onNotification}
            aria-label={lang === "tr" ? "Bildirim" : "Notify"}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/10 hover:bg-black/25 active:bg-black/35 rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {lang === "tr" ? "Bildirim" : "Notify"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-black/20" aria-hidden="true" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === "tr" ? "Kapat" : "Close"}
          className="p-2 hover:bg-black/25 active:bg-black/35 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionBar;
