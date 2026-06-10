import { useEffect, useRef, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Hexagon, AlertTriangle, Activity } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    if (target === from) return;

    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};

const StatCard = memo(({ title, value, icon: Icon, iconColor, accentGradient, glowClass, pulse }) => {
  const count = useCountUp(value ?? 0);
  const isAlerted = pulse && value > 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
      className={[
        "relative bg-gray-900 border rounded-2xl p-5 sm:p-6 overflow-hidden group",
        "transition-[border-color,box-shadow] duration-250",
        isAlerted
          ? `border-red-500/25 ${glowClass}`
          : "border-gray-800 hover:border-gray-700 hover:shadow-card-hover",
      ].join(" ")}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-6 right-6 h-px ${accentGradient}`} />

      {/* Subtle inner gradient */}
      <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Critical overlay */}
      {isAlerted && (
        <div className="absolute inset-0 bg-red-500/[0.04] pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between mb-5">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.08em] leading-none pt-0.5">
          {title}
        </p>
        <motion.div
          className={[
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            isAlerted
              ? "bg-red-500/10 ring-1 ring-red-500/20"
              : "bg-gray-800 ring-1 ring-white/5 group-hover:ring-white/10",
          ].join(" ")}
          animate={isAlerted ? { scale: [1, 1.15, 1] } : {}}
          transition={isAlerted ? { repeat: Infinity, duration: 2, repeatDelay: 1 } : {}}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />
        </motion.div>
      </div>

      <p className="relative text-[2.25rem] font-bold text-gray-50 tabular-nums tracking-tight leading-none">
        {count}
      </p>
    </motion.div>
  );
});

StatCard.displayName = "StatCard";

const StatsCards = ({ stats }) => {
  const { t } = useLanguage();

  const cards = useMemo(
    () => [
      {
        title: t.stats.totalHives,
        value: stats.total,
        icon: Hexagon,
        iconColor: "text-amber-400",
        accentGradient: "bg-gradient-to-r from-transparent via-amber-500/50 to-transparent",
        glowClass: "",
      },
      {
        title: t.stats.needsAttention,
        value: stats.needsAttention,
        icon: AlertTriangle,
        iconColor: "text-red-400",
        accentGradient: "bg-gradient-to-r from-transparent via-red-500/50 to-transparent",
        glowClass: "shadow-glow-red",
        pulse: true,
      },
      {
        title: t.stats.activeSystem,
        value: stats.active,
        icon: Activity,
        iconColor: "text-emerald-400",
        accentGradient: "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent",
        glowClass: "",
      },
    ],
    [t, stats],
  );

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </motion.div>
  );
};

export default StatsCards;
