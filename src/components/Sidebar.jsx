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
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
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
        <button
          type="button"
          onClick={() => handleMenuClick(item.id)}
          aria-current={isActive ? "page" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
            isActive
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
              : "text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent"
          }`}
        >
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="font-medium text-sm">{item.label}</span>
        </button>
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
          className="fixed top-4 left-4 z-[60] p-2 bg-black border border-gray-800 rounded-lg text-amber-400 hover:bg-gray-900 transition-colors lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="beemora-sidebar"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Overlay (Mobile) */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="beemora-sidebar"
        aria-label="Main navigation"
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "relative"
        } w-64 bg-black border-r border-gray-800 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-900 rounded-lg p-1">
              <img
                src="/beemora-logo.svg"
                alt="BeeMora Logo"
                className="w-full h-full object-contain"
                style={{
                  filter: "drop-shadow(0 0 8px rgba(79, 70, 229, 0.5))",
                }}
              />
            </div>
            <h1 className="text-xl font-bold text-violet-400">BeeMora</h1>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto" aria-label="Sidebar menu">
          <ul className="space-y-1">{menuItems.map(renderMenuItem)}</ul>

          <div className="border-t border-gray-800 my-3" role="separator" />

          <ul className="space-y-1">{bottomMenuItems.map(renderMenuItem)}</ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="w-4 h-4" aria-hidden="true" />
            <span>{t.sidebar.package}: PRO</span>
          </div>
          <div className="text-xs text-gray-600">
            {hives.length} / {HIVE_LIMIT} {t.sidebar.hiveCount}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
            <User className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate" title={userName}>
              {userName}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
