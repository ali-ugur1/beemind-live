import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
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

// Focus trap için seçilebilir elemanlar (disabled & aria-hidden hariç)
const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
]
  .map((s) => `${s}:not([aria-hidden="true"])`)
  .join(",");

// offsetParent, position:fixed elemanlarda null döner — getClientRects daha güvenilir
const isVisible = (el) => {
  if (!el) return false;
  if (el.hasAttribute("hidden")) return false;
  return el.getClientRects().length > 0;
};

// Nested modal için global scroll-lock sayacı ve state
let scrollLockCount = 0;
let savedScrollY = 0;
let savedBodyStyles = null;

const lockBodyScroll = () => {
  scrollLockCount += 1;
  if (scrollLockCount > 1) return; // zaten kilitli

  savedScrollY = window.scrollY;
  savedBodyStyles = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
  };
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width = "100%";
};

const unlockBodyScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount > 0) return; // hâlâ başka modal açık

  if (savedBodyStyles) {
    document.body.style.overflow = savedBodyStyles.overflow;
    document.body.style.position = savedBodyStyles.position;
    document.body.style.top = savedBodyStyles.top;
    document.body.style.width = savedBodyStyles.width;
    savedBodyStyles = null;
  }
  window.scrollTo(0, savedScrollY);
};

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
  const mouseDownOnBackdropRef = useRef(false);
  const isMountedRef = useRef(true);

  // Stale closure'ları önlemek için ref'ler
  const isLoadingRef = useRef(isLoading);
  const onCloseRef = useRef(onClose);
  const onConfirmRef = useRef(onConfirm);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    onCloseRef.current = onClose;
    onConfirmRef.current = onConfirm;
  }, [onClose, onConfirm]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const _title = title || (lang === "tr" ? "Emin misiniz?" : "Are you sure?");
  const _confirmText = confirmText || (lang === "tr" ? "Onayla" : "Confirm");
  const _cancelText = cancelText || (lang === "tr" ? "İptal" : "Cancel");

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.warning;
  const Icon = config.icon;

  // Loading sırasında kapatılmasın
  const safeClose = useCallback(() => {
    if (isLoadingRef.current) return;
    onCloseRef.current?.();
  }, []);

  // ESC + focus trap + scroll lock + focus yönetimi
  useEffect(() => {
    if (!isOpen) return;

    const dialogEl = dialogRef.current;

    // Açılmadan önceki odaklı elemanı sakla
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    lockBodyScroll();

    // Onay butonuna odaklan — DOM commit sonrası
    const rafId = requestAnimationFrame(() => {
      confirmBtnRef.current?.focus();
    });

    const handleKeyDown = (e) => {
      // Nested modal desteği: event sadece en üstteki dialog tarafından işlensin
      // (listener dialog DOM'una bağlı olduğu için zaten nested'da dıştaki tetiklenmez)
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        safeClose();
        return;
      }

      if (e.key !== "Tab" || !dialogEl) return;

      const focusables = Array.from(
        dialogEl.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter(isVisible);

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const insideDialog = dialogEl.contains(active);

      if (e.shiftKey) {
        if (!insideDialog || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!insideDialog || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Listener'ı document yerine backdrop'a bağlamak daha doğru ama
    // backdrop focus almaz — document'ta capture kullanıyoruz ki
    // alttaki diğer listener'lardan önce tetiklensin.
    // Nested modal'da üstteki dialog DOM'da sonra render olduğu için
    // capture sırası doğal olarak dıştan içe; bunu düzeltmek için
    // event path'i kontrol ediyoruz: sadece bu dialog'a ait olay işlenir.
    const scopedHandler = (e) => {
      if (!dialogEl) return;
      // Eğer odak bu dialog'un içindeyse VEYA bu dialog en üstteki aktif modal ise işle
      // Basit yaklaşım: aktif eleman dialog içindeyse işle; değilse (nested üstteki modal varsa) atla
      if (
        dialogEl.contains(document.activeElement) ||
        document.activeElement === document.body
      ) {
        handleKeyDown(e);
      }
    };

    document.addEventListener("keydown", scopedHandler, true);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", scopedHandler, true);
      unlockBodyScroll();

      // Odağı güvenli şekilde geri ver
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === "function" && document.contains(prev)) {
        // Scroll pozisyonu zıplamasın
        prev.focus({ preventScroll: true });
      }
      previouslyFocusedRef.current = null;
    };
  }, [isOpen, safeClose]);

  // Backdrop click — mousedown + mouseup aynı yerde (backdrop) olursa kapat
  // (dialog içinde başlayıp backdrop'ta biten seçimlerde yanlışlıkla kapanmayı önler)
  const handleBackdropMouseDown = useCallback((e) => {
    // Sadece backdrop'a tıklandıysa işaretle
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  }, []);

  const handleBackdropMouseUp = useCallback(
    (e) => {
      if (mouseDownOnBackdropRef.current && e.target === e.currentTarget) {
        safeClose();
      }
      mouseDownOnBackdropRef.current = false;
    },
    [safeClose],
  );

  const handleConfirm = useCallback(async () => {
    try {
      await onConfirmRef.current?.();
      // Unmount olduysa kapatma deneme
      if (isMountedRef.current) {
        onCloseRef.current?.();
      }
    } catch (err) {
      // Hata durumunda dialog açık kalsın; hatayı yutma
      console.error("ConnectionStatus confirm error:", err);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={message ? "confirm-dialog-message" : undefined}
        className="bg-gray-900 border border-gray-800/80 rounded-2xl max-w-md w-full shadow-popover animate-scale-in overflow-hidden my-auto max-h-[calc(100vh-2rem)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl ${config.iconBg} ring-1 ${config.ring} shrink-0`}
            >
              <Icon
                className={`w-5 h-5 ${config.iconColor}`}
                aria-hidden="true"
              />
            </div>
            <h3
              id="confirm-dialog-title"
              className="text-lg font-semibold text-gray-100 truncate"
            >
              {_title}
            </h3>
          </div>
          <button
            type="button"
            onClick={safeClose}
            disabled={isLoading}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="p-1 hover:bg-gray-800 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <p
            id="confirm-dialog-message"
            className="text-gray-300 leading-relaxed whitespace-pre-line break-words"
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50 shrink-0">
          <button
            type="button"
            onClick={safeClose}
            disabled={isLoading}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {_cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
            className={`px-4 py-2.5 ${config.btnBg} text-white rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2`}
          >
            {isLoading && (
              <span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {_confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
