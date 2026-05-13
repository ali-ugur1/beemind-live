import { useState } from "react";
import { Bot, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getCurrentTip } from "../data/seasonalTips";

const DISMISS_KEY = "beemora_seasonal_tip_dismissed";

const colorMap = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-300",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-300",
  },
};

const SeasonalTips = () => {
  const { lang } = useLanguage();
  const tip = getCurrentTip(lang);
  const colors = colorMap[tip.color] ?? colorMap.amber;

  const [dismissed, setDismissed] = useState(() => {
    try {
      const saved = localStorage.getItem(DISMISS_KEY);
      if (!saved) return false;
      const { month, year } = JSON.parse(saved);
      const now = new Date();
      return month === now.getMonth() && year === now.getFullYear();
    } catch {
      return false;
    }
  });

  const [tipIndex, setTipIndex] = useState(0);

  const handleDismiss = () => {
    try {
      const now = new Date();
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify({ month: now.getMonth(), year: now.getFullYear() }),
      );
    } catch {
      // pass
    }
    setDismissed(true);
  };

  if (dismissed) return null;

  const total = tip.tips.length;
  const currentTipText = tip.tips[tipIndex];

  return (
    <div
      className={`relative rounded-2xl border ${colors.bg} ${colors.border} p-5 mb-6`}
    >
      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 p-1 text-gray-600 hover:text-gray-400 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-200">Maya</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors.badge}`}
          >
            {tip.icon} {tip.season}
          </span>
        </div>
      </div>

      {/* Tip text */}
      <p className="text-sm text-gray-300 leading-relaxed pr-6">
        {currentTipText}
      </p>

      {/* Navigation (if multiple tips) */}
      {total > 1 && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setTipIndex((i) => Math.max(0, i - 1))}
            disabled={tipIndex === 0}
            className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-gray-600">
            {tipIndex + 1}/{total}
          </span>
          <button
            onClick={() => setTipIndex((i) => Math.min(total - 1, i + 1))}
            disabled={tipIndex === total - 1}
            className="p-1 text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SeasonalTips;
