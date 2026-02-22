import { Bell, Settings, User, Clock, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ activeTab, notifications, onMarkAsRead, onMarkAllAsRead, onNotificationClick, onSettingsClick, onProfileClick }) => {
  const { t, lang, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(t.header.justNow);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = now.getSeconds();
      if (seconds < 10) {
        setLastUpdate(t.header.justNow);
      } else if (seconds < 30) {
        setLastUpdate(`${seconds} ${t.header.secondsAgo}`);
      } else {
        setLastUpdate(t.header.minuteAgo);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [t]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getBreadcrumb = () => t.breadcrumb[activeTab] || t.breadcrumb.dashboard;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      {/* Breadcrumb */}
      <div>
        <p className="text-sm text-gray-500">{getBreadcrumb()}</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Last Update */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 mr-2">
          <Clock className="w-4 h-4" />
          <span>{t.header.lastUpdate}: {lastUpdate}</span>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => changeLanguage(lang === 'tr' ? 'en' : 'tr')}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
          aria-label={lang === 'tr' ? 'Switch to English' : 'Turkceye gec'}
          title={lang === 'tr' ? 'English' : 'Turkce'}
        >
          <Globe className="w-4 h-4" />
          <span className="text-xs font-semibold">{lang === 'tr' ? 'EN' : 'TR'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors relative"
            aria-label={t.notifications.title}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown
            notifications={notifications}
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onNotificationClick={(notif) => { onNotificationClick(notif); setIsNotificationOpen(false); }}
          />
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t.sidebar.profile}
          >
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <span className="hidden md:inline text-sm text-gray-300 font-medium">{user?.displayName || 'Admin'}</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-semibold text-gray-200">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role === 'admin' ? (lang === 'tr' ? 'Yonetici' : 'Administrator') : user?.role}</p>
              </div>
              <button
                onClick={() => { onProfileClick(); setIsUserMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" />
                {t.sidebar.profile}
              </button>
              <button
                onClick={() => { onSettingsClick(); setIsUserMenuOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t.sidebar.settings}
              </button>
              <div className="border-t border-gray-800">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {lang === 'tr' ? 'Cikis Yap' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
