import { useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCheck, BellOff } from "lucide-react";
import { getNotificationIcon } from "../data/mockData";
import { useLanguage } from "../contexts/LanguageContext";

const NotificationDropdown = ({
  notifications = [],
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const dropdownRef = useRef(null);
  const { t } = useLanguage();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  // Dışarı tıklayınca + Escape ile kapat
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleItemClick = useCallback(
    (notif) => {
      if (!notif.read && onMarkAsRead) {
        onMarkAsRead(notif.id);
      }
      if (onNotificationClick) {
        onNotificationClick(notif);
      }
    },
    [onMarkAsRead, onNotificationClick],
  );

  const handleItemKeyDown = useCallback(
    (event, notif) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleItemClick(notif);
      }
    },
    [handleItemClick],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          role="dialog"
          aria-label={t.notifications.title}
          className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div>
              <h3 className="font-semibold text-gray-100">
                {t.notifications.title}
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {unreadCount} {t.notifications.unread}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                <BellOff className="w-8 h-8 text-gray-600" />
                <p>{t.notifications.noNotifications}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-800">
                {notifications.map((notif) => (
                  <li key={notif.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleItemClick(notif)}
                      onKeyDown={(e) => handleItemKeyDown(e, notif)}
                      className={`p-4 transition-colors cursor-pointer focus:outline-none focus:bg-gray-800/60 hover:bg-gray-800/60 ${
                        !notif.read ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <span
                          className="text-2xl flex-shrink-0 leading-none"
                          aria-hidden="true"
                        >
                          {getNotificationIcon(notif.type)}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {notif.hiveId && (
                              <span className="text-xs font-mono text-amber-400">
                                #{notif.hiveId}
                              </span>
                            )}
                            {!notif.read && (
                              <span
                                className="w-2 h-2 bg-amber-400 rounded-full"
                                aria-label="unread"
                              />
                            )}
                          </div>
                          <p
                            className={`text-sm break-words ${
                              !notif.read
                                ? "text-gray-100 font-medium"
                                : "text-gray-400"
                            }`}
                          >
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center justify-center gap-2 w-full text-sm text-amber-400 hover:text-amber-300 transition-colors py-1 focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded"
              >
                <CheckCheck className="w-4 h-4" />
                {t.notifications.markAllRead}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
