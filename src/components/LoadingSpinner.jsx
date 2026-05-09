import { useLanguage } from "../contexts/LanguageContext";

const sizes = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const LoadingSpinner = ({ size = "md", fullScreen = false }) => {
  const { t } = useLanguage();
  const sizeClass = sizes[size] ?? sizes.md;

  const spinner = (
    <div
      className={`${sizeClass} border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin`}
      role="status"
      aria-label={t.common.loading}
    >
      <span className="sr-only">{t.common.loading}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center"
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        {spinner}
        <p className="text-gray-400 text-sm mt-4">{t.common.loading}</p>
      </div>
    );
  }

  return <div className="flex items-center justify-center">{spinner}</div>;
};

export default LoadingSpinner;
