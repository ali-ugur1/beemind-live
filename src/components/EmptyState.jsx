import { useMemo } from "react";
import { motion } from "framer-motion";
import { Inbox, Search, AlertTriangle, FileX } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const EMPTY_STATE_CONFIGS = {
  tr: {
    noData:     { icon: Inbox,         defaultTitle: "Veri Bulunamadı",    defaultDescription: "Henüz gösterilecek veri yok." },
    noResults:  { icon: Search,        defaultTitle: "Sonuç Bulunamadı",   defaultDescription: "Arama kriterlerinize uygun sonuç bulunamadı." },
    error:      { icon: AlertTriangle, defaultTitle: "Bir Hata Oluştu",    defaultDescription: "Veriler yüklenirken bir sorun oluştu." },
    noFile:     { icon: FileX,         defaultTitle: "Dosya Bulunamadı",   defaultDescription: "İstediğiniz dosya mevcut değil." },
  },
  en: {
    noData:     { icon: Inbox,         defaultTitle: "No Data Found",      defaultDescription: "No data to display yet." },
    noResults:  { icon: Search,        defaultTitle: "No Results Found",   defaultDescription: "No results match your search criteria." },
    error:      { icon: AlertTriangle, defaultTitle: "An Error Occurred",  defaultDescription: "A problem occurred while loading data." },
    noFile:     { icon: FileX,         defaultTitle: "File Not Found",     defaultDescription: "The requested file does not exist." },
  },
};

const EmptyState = ({ type = "noData", title, description, action, actionText }) => {
  const { lang } = useLanguage();

  const config = useMemo(() => {
    const locale = lang === "tr" ? "tr" : "en";
    return EMPTY_STATE_CONFIGS[locale][type] ?? EMPTY_STATE_CONFIGS[locale].noData;
  }, [lang, type]);

  const Icon = config.icon;
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Icon with glow ring */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative mb-6"
      >
        {/* Outer blur glow */}
        <div
          className={`absolute -inset-4 rounded-3xl blur-xl opacity-25 ${
            isError ? "bg-red-500" : "bg-gray-500"
          }`}
        />
        {/* Icon box */}
        <div
          className={`relative w-20 h-20 rounded-2xl flex items-center justify-center ring-1 ${
            isError
              ? "bg-red-950/40 ring-red-500/25"
              : "bg-gray-800/70 ring-gray-700/50"
          }`}
        >
          <Icon
            aria-hidden="true"
            className={`w-9 h-9 ${isError ? "text-red-400" : "text-gray-400"}`}
          />
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="text-lg font-semibold text-gray-100 mb-2 text-center"
      >
        {title || config.defaultTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.25 }}
        className="text-sm text-gray-500 text-center max-w-sm mb-8 leading-relaxed"
      >
        {description || config.defaultDescription}
      </motion.p>

      {action && actionText && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.25 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={action}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-semibold text-sm rounded-xl shadow-glow-amber-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          {actionText}
        </motion.button>
      )}
    </div>
  );
};

export default EmptyState;
