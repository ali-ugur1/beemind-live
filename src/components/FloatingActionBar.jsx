import { motion } from "framer-motion";
import { FileText, Bell, X, Zap } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const FloatingActionBar = ({ count, onReport, onNotification, onClose }) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-50"
      style={{ x: "-50%" }}
      role="toolbar"
      aria-label={lang === "tr" ? "Seçim araç çubuğu" : "Selection toolbar"}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-2xl shadow-2xl ring-1 ring-black/10 px-5 py-3 flex items-center gap-4 sm:gap-6">
        {/* Count */}
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="font-bold text-base sm:text-lg whitespace-nowrap">
            {count} {lang === "tr" ? "Seçili" : "Selected"}
          </span>
        </div>

        <div className="w-px h-8 bg-black/20" aria-hidden="true" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={onReport}
            aria-label={lang === "tr" ? "Raporla" : "Report"}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {lang === "tr" ? "Raporla" : "Report"}
            </span>
          </motion.button>

          <motion.button
            type="button"
            onClick={onNotification}
            aria-label={lang === "tr" ? "Bildirim" : "Notify"}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/10 hover:bg-black/20 rounded-lg font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {lang === "tr" ? "Bildirim" : "Notify"}
            </span>
          </motion.button>
        </div>

        <div className="w-px h-8 bg-black/20" aria-hidden="true" />

        <motion.button
          type="button"
          onClick={onClose}
          aria-label={lang === "tr" ? "Kapat" : "Close"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="p-2 hover:bg-black/20 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FloatingActionBar;
