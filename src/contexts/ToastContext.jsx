import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    // slice(-3): yeni toast ile birlikte max 4 gösterilir
    setToasts((prev) => [...prev.slice(-3), { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur ?? 5000),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/* ─── Container ─────────────────────────────── */
const ToastContainer = ({ toasts, onRemove }) => (
  <div
    aria-live="polite"
    className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
  >
    <AnimatePresence mode="sync">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => onRemove(t.id)} />
      ))}
    </AnimatePresence>
  </div>
);

/* ─── Single Toast ───────────────────────────── */
const CONFIG = {
  success: {
    icon: CheckCircle,
    accent: "#10b981",
    glow: "rgba(16,185,129,0.25)",
    label: "Success",
  },
  error: {
    icon: XCircle,
    accent: "#ef4444",
    glow: "rgba(239,68,68,0.25)",
    label: "Error",
  },
  warning: {
    icon: AlertTriangle,
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    label: "Warning",
  },
  info: {
    icon: Info,
    accent: "#3b82f6",
    glow: "rgba(59,130,246,0.25)",
    label: "Info",
  },
};

const Toast = ({ message, type, duration, onClose }) => {
  const { icon: Icon, accent, glow } = CONFIG[type] ?? CONFIG.info;
  const [progress, setProgress] = useState(100);

  const rafRef = useRef(null);
  const startRef = useRef(null);
  const remainingRef = useRef(duration);
  const pausedRef = useRef(false);

  const stableOnClose = useCallback(onClose, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!duration || duration <= 0) return;

    const tick = (timestamp) => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (startRef.current === null) startRef.current = timestamp;

      const elapsed = timestamp - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / remainingRef.current) * 100);
      setProgress(pct);

      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        stableOnClose();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, stableOnClose]);

  const pause = () => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    // Kalan süreyi şu anki ilerlemeye göre hesapla
    remainingRef.current = (progress / 100) * duration;
    startRef.current = null; // resume'da sıfırlanacak
  };

  const resume = () => {
    pausedRef.current = false;
    startRef.current = null; // tick'in ilk frame'de sıfırlaması için
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.88, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      style={{
        pointerEvents: "all",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.45), 0 0 24px ${glow}`,
      }}
      className="relative min-w-[320px] max-w-[420px] overflow-hidden rounded-xl
                 bg-gray-900/90 backdrop-blur-md border border-white/[0.07]"
    >
      {/* Colored left bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: accent }}
      />

      {/* Body */}
      <div className="flex items-start gap-3 pl-4 pr-3 py-3.5">
        <div
          className="mt-0.5 flex-shrink-0 p-1.5 rounded-lg"
          style={{ background: `${accent}22` }}
        >
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <p className="flex-1 text-sm font-medium text-gray-100 leading-snug pr-1">
          {message}
        </p>
        <button
          onClick={stableOnClose}
          className="flex-shrink-0 p-1 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/10 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar — Framer Motion yerine doğrudan style */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div
            className="h-full rounded-full"
            style={{ background: accent, width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};
