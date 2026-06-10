import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const TYPE_CONFIG = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    btnBg: "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400",
  },
  danger: {
    icon: AlertCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    ring: "ring-red-500/20",
    btnBg: "bg-red-500 hover:bg-red-600 focus-visible:ring-red-400",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
    btnBg: "bg-blue-500 hover:bg-blue-600 focus-visible:ring-blue-400",
  },
};

// Focus trap için seçilebilir elemanlar
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "warning", // 'warning' | 'danger' | 'info'
  isLoading = false,
}) => {
  const { lang } = useLanguage();
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  // isLoading'i ref'te tutuyoruz ki event handler'lar stale closure yakalamasın
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const _title = title || (lang === "tr" ? "Emin misiniz?" : "Are you sure?");
  const _confirmText = confirmText || (lang === "tr" ? "Onayla" : "Confirm");
  const _cancelText = cancelText || (lang === "tr" ? "İptal" : "Cancel");

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.warning;
  const Icon = config.icon;

  // Loading sırasında güvenli kapatma — submit esnasında iptal edilmesin
  const safeClose = useCallback(() => {
    if (isLoadingRef.current) return;
    onClose();
  }, [onClose]);

  // ESC + focus trap + body scroll kilidi + focus yönetimi
  useEffect(() => {
    if (!isOpen) return;

    // Açılmadan önceki odaklı elemanı sakla
    previouslyFocusedRef.current = document.activeElement;

    // Body scroll'u kilitle (iOS dahil)
    const scrollY = window.scrollY;
    const originalStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Onay butonuna odaklan
    const focusTimer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 0);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        safeClose();
        return;
      }

      // Focus trap (Tab / Shift+Tab)
      if (e.key === "Tab" && dialogRef.current) {
        const focusables =
          dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !dialogRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);

      // Body stillerini geri yükle ve scroll pozisyonunu koru
      document.body.style.overflow = originalStyles.overflow;
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.width = originalStyles.width;
      window.scrollTo(0, scrollY);

      // Odağı güvenli şekilde geri ver
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === "function" && document.contains(prev)) {
        prev.focus();
      }
    };
  }, [isOpen, safeClose]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) safeClose();
    },
    [safeClose],
  );

  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      // Hata durumunda dialog açık kalsın; hatayı yutma
      console.error("ConfirmDialog onConfirm error:", err);
    }
  }, [onConfirm, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        ref={dialogRef}
        className="bg-gray-900 border border-gray-800/80 rounded-2xl max-w-md w-full shadow-popover overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.iconBg} ring-1 ${config.ring}`}
            >
              <Icon
                className={`w-5 h-5 ${config.iconColor}`}
                aria-hidden="true"
              />
            </div>
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-gray-100"
            >
              {_title}
            </h3>
          </div>
          <button
            type="button"
            onClick={safeClose}
            disabled={isLoading}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="p-1 hover:bg-gray-800 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p
            id="confirm-dialog-message"
            className="text-gray-300 leading-relaxed whitespace-pre-line"
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50">
          <motion.button
            type="button"
            onClick={safeClose}
            disabled={isLoading}
            whileTap={isLoading ? {} : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {_cancelText}
          </motion.button>
          <motion.button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
            whileTap={isLoading ? {} : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`px-4 py-2 ${config.btnBg} text-white rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2`}
          >
            {isLoading && (
              <span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {_confirmText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
