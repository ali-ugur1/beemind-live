import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Hexagon, AlertTriangle, Activity } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

/* Animated counter hook */
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
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
};

const pulseAnimation = {
  animate: { scale: [1, 1.2, 1] },
  transition: { repeat: Infinity, duration: 2, repeatDelay: 1 },
};

const StatCard = ({ title, value, icon: Icon, color, pulse }) => {
  const count = useCountUp(value ?? 0);
  const isAlerted = pulse && value > 0;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
      className={[
        "bg-gray-900 border border-gray-800 rounded-lg p-6",
        "hover:border-gray-700 transition-colors",
        isAlerted ? "ring-1 ring-red-500/30" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider">
          {title}
        </h3>
        <motion.div {...(isAlerted ? pulseAnimation : {})}>
          <Icon className={`w-6 h-6 ${color}`} />
        </motion.div>
      </div>
      <motion.p
        key={value}
        className="text-4xl font-light text-gray-100 tabular-nums"
      >
        {count}
      </motion.p>
    </motion.div>
  );
};

const StatsCards = ({ stats }) => {
  const { t } = useLanguage();

  const cards = useMemo(
    () => [
      {
        title: t.stats.totalHives,
        value: stats.total,
        icon: Hexagon,
        color: "text-gray-400",
      },
      {
        title: t.stats.needsAttention,
        value: stats.needsAttention,
        icon: AlertTriangle,
        color: "text-red-400",
        pulse: true,
      },
      {
        title: t.stats.activeSystem,
        value: stats.active,
        icon: Activity,
        color: "text-emerald-400",
      },
    ],
    [t, stats],
  );

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
