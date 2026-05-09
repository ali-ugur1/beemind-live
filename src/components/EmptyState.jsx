import { useMemo } from "react";
import { Inbox, Search, AlertTriangle, FileX } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const EMPTY_STATE_CONFIGS = {
  tr: {
    noData: {
      icon: Inbox,
      defaultTitle: "Veri Bulunamadı",
      defaultDescription: "Henüz gösterilecek veri yok.",
    },
    noResults: {
      icon: Search,
      defaultTitle: "Sonuç Bulunamadı",
      defaultDescription: "Arama kriterlerinize uygun sonuç bulunamadı.",
    },
    error: {
      icon: AlertTriangle,
      defaultTitle: "Bir Hata Oluştu",
      defaultDescription: "Veriler yüklenirken bir sorun oluştu.",
    },
    noFile: {
      icon: FileX,
      defaultTitle: "Dosya Bulunamadı",
      defaultDescription: "İstediğiniz dosya mevcut değil.",
    },
  },
  en: {
    noData: {
      icon: Inbox,
      defaultTitle: "No Data Found",
      defaultDescription: "No data to display yet.",
    },
    noResults: {
      icon: Search,
      defaultTitle: "No Results Found",
      defaultDescription: "No results match your search criteria.",
    },
    error: {
      icon: AlertTriangle,
      defaultTitle: "An Error Occurred",
      defaultDescription: "A problem occurred while loading data.",
    },
    noFile: {
      icon: FileX,
      defaultTitle: "File Not Found",
      defaultDescription: "The requested file does not exist.",
    },
  },
};

const EmptyState = ({
  type = "noData",
  title,
  description,
  action,
  actionText,
}) => {
  const { lang } = useLanguage();

  const config = useMemo(() => {
    const locale = lang === "tr" ? "tr" : "en";
    const localeConfigs = EMPTY_STATE_CONFIGS[locale];
    return localeConfigs[type] || localeConfigs.noData;
  }, [lang, type]);

  const Icon = config.icon;
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ring-1 ${
          isError
            ? "bg-red-950/40 ring-red-900/50"
            : "bg-gray-800 ring-gray-700/50"
        }`}
      >
        <Icon
          aria-hidden="true"
          className={`w-12 h-12 ${isError ? "text-red-500" : "text-gray-500"}`}
        />
      </div>

      <h3 className="text-xl font-semibold text-gray-200 mb-2 text-center">
        {title || config.defaultTitle}
      </h3>

      <p className="text-gray-500 text-center max-w-md mb-6 leading-relaxed">
        {description || config.defaultDescription}
      </p>

      {action && actionText && (
        <button
          type="button"
          onClick={action}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
