import {
  Home,
  List,
  Map,
  FileText,
  Settings,
  Package,
  User,
  X,
  Menu,
  GitCompareArrows,
  Calendar,
  Bell,
  HelpCircle,
  Info,
  Bot,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";

const STORAGE_KEY = "beemora_settings";
const DEFAULT_USER_NAME = "Admin User";
const MOBILE_BREAKPOINT = 1024;
const HIVE_LIMIT = 50;

const readUserName = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_USER_NAME;
    const parsed = JSON.parse(saved);
    return parsed?.fullName || DEFAULT_USER_NAME;
  } catch (err) {
    console.warn("[Sidebar] Failed to read user settings:", err);
    return DEFAULT_USER_NAME;
  }
};

const Sidebar = ({ activeTab, onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
  );
  const [userName, setUserName] = useState(readUserName);

  const { hives } = useLiveData();
  const { t } = useLanguage();

  // Kullanıcı adı senkronizasyonu (storage + custom event)
  useEffect(() => {
    const handleStorage = () => setUserName(readUserName());
    window.addEventListener("storage", handleStorage);
    window.addEventListener("beemora-settings-updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("beemora-settings-updated", handleStorage);
    };
  }, []);

  // Ekran boyutu takibi
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobil menü açıkken body scroll'u engelle
  useEffect(() => {
    if (!isMobile) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : original;
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobile, isOpen]);

  // Escape tuşu ile menüyü kapat
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const menuItems = useMemo(
    () => [
      { id: "dashboard", label: t.sidebar.overview, icon: Home },
      { id: "list", label: t.sidebar.hiveList, icon: List },
      { id: "map", label: t.sidebar.map, icon: Map },
      { id: "compare", label: t.sidebar.compare, icon: GitCompareArrows },
      { id: "calendar", label: t.sidebar.calendar, icon: Calendar },
      { id: "reports", label: t.sidebar.reports, icon: FileText },
      {
        id: "notificationHistory",
        label: t.sidebar.notificationHistory,
        icon: Bell,
      },
      { id: "assistant", label: t.sidebar.assistant, icon: Bot },
    ],
    [t],
  );

  const bottomMenuItems = useMemo(
    () => [
      { id: "profile", label: t.sidebar.profile, icon: User },
      { id: "settings", label: t.sidebar.settings, icon: Settings },
      { id: "help", label: t.sidebar.help, icon: HelpCircle },
      { id: "about", label: t.sidebar.about, icon: Info },
    ],
    [t],
  );

  const handleMenuClick = useCallback(
    (tabId) => {
      onTabChange(tabId);
      if (isMobile) setIsOpen(false);
    },
    [isMobile, onTabChange],
  );

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <li key={item.id}>
        <motion.button
          type="button"
          onClick={() => handleMenuClick(item.id)}
          aria-current={isActive ? "page" : undefined}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg ${
            isActive ? "text-amber-400" : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-pill"
              className="absolute inset-0 rounded-lg bg-amber-500/12 border border-amber-500/35"
              style={{ boxShadow: "0 0 12px rgba(245,158,11,0.15)" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          {!isActive && (
            <motion.span
              className="absolute inset-0 rounded-lg bg-transparent hover:bg-gray-800/60"
              transition={{ duration: 0.15 }}
            />
          )}
          <Icon className="relative w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="relative font-medium text-sm">{item.label}</span>
        </motion.button>
      </li>
    );
  };

  return (
    <>
      {/* Hamburger Button (Mobile) */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed top-3 left-3 z-[60] p-2.5 bg-black/90 backdrop-blur-sm border border-gray-700 rounded-xl text-amber-400 hover:bg-gray-900 transition-colors lg:hidden shadow-lg shadow-black/30"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="beemora-sidebar"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {/* Overlay (Mobile) — Framer Motion fade */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            key="sidebar-overlay"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop static, mobile spring drawer */}
      <motion.aside
        id="beemora-sidebar"
        aria-label="Main navigation"
        className={`${
          isMobile ? "fixed top-0 left-0 h-full z-50" : "relative"
        } w-64 bg-black border-r border-gray-800 flex flex-col`}
        animate={isMobile ? { x: isOpen ? 0 : "-100%" } : { x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-gray-900 rounded-xl p-1 ring-1 ring-amber-500/20">
              {/* Radial amber glow behind logo */}
              <div className="absolute inset-0 rounded-xl bg-gradient-radial from-amber-500/20 via-amber-500/5 to-transparent" />
              <img
                src="/beemora-logo.svg"
                alt="BeeMora Logo"
                className="relative w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.55))" }}
              />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-amber-400 tracking-tight leading-none">BeeMora</h1>
              <p className="text-[10px] text-gray-600 mt-0.5 font-medium tracking-wide">IOT DASHBOARD</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto" aria-label="Sidebar menu">
          <ul className="space-y-1">{menuItems.map(renderMenuItem)}</ul>

          <div className="border-t border-gray-800 my-3" role="separator" />

          <ul className="space-y-1">{bottomMenuItems.map(renderMenuItem)}</ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800/60">
          <button
            type="button"
            onClick={() => handleMenuClick("profile")}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-800/60 transition-colors group"
          >
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/35 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-amber-400">
                {userName.charAt(0).toUpperCase()}
              </span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-gray-950" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-200 truncate" title={userName}>
                {userName}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                <span className="text-amber-500/80 font-medium">PRO</span>
                {" · "}{hives.length}/{HIVE_LIMIT} {t.sidebar.hiveCount}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
