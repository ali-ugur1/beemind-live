import { useLanguage } from "../contexts/LanguageContext";

const sizeMap = {
  sm: { outer: "w-5 h-5",  inner: "w-2.5 h-2.5", border: "border-2" },
  md: { outer: "w-9 h-9",  inner: "w-4 h-4",     border: "border-2" },
  lg: { outer: "w-14 h-14", inner: "w-7 h-7",    border: "border-[3px]" },
  xl: { outer: "w-20 h-20", inner: "w-10 h-10",  border: "border-4" },
};

const LoadingSpinner = ({ size = "md", fullScreen = false }) => {
  const { t } = useLanguage();
  const s = sizeMap[size] ?? sizeMap.md;

  const spinner = (
    <div
      className="relative flex items-center justify-center"
      role="status"
      aria-label={t.common.loading}
    >
      {/* Outer ring */}
      <div
        className={`${s.outer} ${s.border} rounded-full border-gray-800 border-t-amber-500 animate-spin`}
      />
      {/* Inner counter-rotating ring */}
      <div
        className={`absolute ${s.inner} ${s.border} rounded-full border-gray-700/60 border-b-amber-400/50 animate-spin-reverse`}
      />
      <span className="sr-only">{t.common.loading}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center gap-5"
        role="alert"
        aria-busy="true"
        aria-live="polite"
      >
        {spinner}
        <p className="text-gray-400 text-sm font-medium tracking-wide">{t.common.loading}</p>
      </div>
    );
  }

  return <div className="flex items-center justify-center">{spinner}</div>;
};

export default LoadingSpinner;
