import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Settings,
  User,
  Clock,
  LogOut,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const Header = ({
  activeTab,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onSettingsClick,
  onProfileClick,
}) => {
  const { t, lang, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Gerçek bir referans noktası tutuyoruz; "son güncelleme" buna göre hesaplanacak
  const [lastUpdateAt, setLastUpdateAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Her saniye "now" güncellenir — formatlanmış metin useMemo ile türetilir,
  // böylece dil değişince anında doğru metin gösterilir.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const lastUpdate = useMemo(() => {
    const diffSec = Math.max(0, Math.floor((now - lastUpdateAt) / 1000));
    if (diffSec < 10) return t.header.justNow;
    if (diffSec < 60) return `${diffSec} ${t.header.secondsAgo}`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 2) return t.header.minuteAgo;
    // Çoğul/tekil ayrımı için t.header.minutesAgo varsa onu kullan, yoksa geri düş
    const minutesAgoLabel = t.header.minutesAgo || t.header.minuteAgo;
    return `${diffMin} ${minutesAgoLabel}`;
  }, [now, lastUpdateAt, t]);

  // Bildirim listesi değişince "son güncelleme" anını tazele
  useEffect(() => {
    setLastUpdateAt(Date.now());
  }, [notifications]);

  // Dropdown dışı tıklama — hem user menu hem notification için
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape ile açık menüyü kapat
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const getBreadcrumb = useCallback(
    () => t.breadcrumb[activeTab] || t.breadcrumb.dashboard,
    [t, activeTab],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const displayName = user?.fullName || user?.displayName || "Admin";
  const roleLabel =
    user?.role === "admin"
      ? lang === "tr"
        ? "Yönetici"
        : "Administrator"
      : user?.role || "";

  // Bir menü açılınca diğerini kapat — iki dropdown aynı anda açık kalmasın
  const handleToggleNotifications = () => {
    setIsNotificationOpen((v) => {
      const next = !v;
      if (next) setIsUserMenuOpen(false);
      return next;
    });
  };

  const handleToggleUserMenu = () => {
    setIsUserMenuOpen((v) => {
      const next = !v;
      if (next) setIsNotificationOpen(false);
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-20 -mx-3 sm:-mx-4 md:-mx-8 px-3 sm:px-4 md:px-8 pt-3 pb-2.5 mb-6 sm:mb-8 bg-gray-950/85 backdrop-blur-md border-b border-gray-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Breadcrumb */}
      <div className="min-w-0 pl-10 lg:pl-0">
        <p className="text-sm font-medium text-gray-400 truncate">{getBreadcrumb()}</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap ml-auto">
        {/* Last Update */}
        <div
          className="hidden md:flex items-center gap-2 text-sm text-gray-500 mr-2"
          aria-live="polite"
        >
          <Clock className="w-4 h-4" />
          <span>
            {t.header.lastUpdate}: {lastUpdate}
          </span>
        </div>

        {/* Language Toggle */}
        <motion.button
          type="button"
          onClick={() => changeLanguage(lang === "tr" ? "en" : "tr")}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="min-w-[44px] min-h-[44px] px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          aria-label={lang === "tr" ? "Switch to English" : "Türkçeye geç"}
          title={lang === "tr" ? "English" : "Türkçe"}
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-semibold">
            {lang === "tr" ? "EN" : "TR"}
          </span>
        </motion.button>

        {/* Theme Toggle */}
        <motion.button
          type="button"
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="min-w-[44px] min-h-[44px] p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Notification Button */}
        <div className="relative" ref={notificationRef}>
          <motion.button
            type="button"
            onClick={handleToggleNotifications}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="min-w-[44px] min-h-[44px] p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors relative focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label={t.notifications.title}
            aria-haspopup="true"
            aria-expanded={isNotificationOpen}
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  aria-label={`${unreadCount} ${t.notifications.unread || "unread"}`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <NotificationDropdown
            notifications={notifications}
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onNotificationClick={(notif) => {
              onNotificationClick?.(notif);
              setIsNotificationOpen(false);
            }}
          />
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <motion.button
            type="button"
            onClick={handleToggleUserMenu}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="flex items-center gap-2 min-h-[44px] px-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            aria-label={t.sidebar.profile}
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <span className="hidden md:inline text-sm text-gray-300 font-medium max-w-[160px] truncate">
              {displayName}
            </span>
          </motion.button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                role="menu"
                className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-semibold text-gray-200 truncate">
                    {displayName}
                  </p>
                  {roleLabel && (
                    <p className="text-xs text-gray-500 truncate">
                      {roleLabel}
                    </p>
                  )}
                </div>
                <motion.button
                  type="button"
                  role="menuitem"
                  onClick={() => { onProfileClick?.(); setIsUserMenuOpen(false); }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t.sidebar.profile}
                </motion.button>
                <motion.button
                  type="button"
                  role="menuitem"
                  onClick={() => { onSettingsClick?.(); setIsUserMenuOpen(false); }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {t.sidebar.settings}
                </motion.button>
                <div className="border-t border-gray-800">
                  <motion.button
                    type="button"
                    role="menuitem"
                    onClick={() => { setIsUserMenuOpen(false); logout?.(); }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === "tr" ? "Çıkış Yap" : "Sign Out"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
