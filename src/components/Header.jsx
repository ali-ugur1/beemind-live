import { Bell, Settings, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useLanguage } from '../contexts/LanguageContext';

const Header = ({ activeTab, notifications, onMarkAsRead, onMarkAllAsRead, onNotificationClick, onSettingsClick, onProfileClick }) => {
  const { t } = useLanguage();
  const [lastUpdate, setLastUpdate] = useState(t.header.justNow);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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

  const getBreadcrumb = () => {
    return t.breadcrumb[activeTab] || t.breadcrumb.dashboard;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      {/* Breadcrumb */}
      <div>
        <p className="text-sm text-gray-500">{getBreadcrumb()}</p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{t.header.lastUpdate}: {lastUpdate}</span>
        </div>

        <div className="flex items-center gap-2">
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

            {/* Notification Dropdown */}
            <NotificationDropdown
              notifications={notifications}
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onNotificationClick={(notif) => { onNotificationClick(notif); setIsNotificationOpen(false); }}
            />
          </div>

          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t.sidebar.settings}
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={onProfileClick}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label={t.sidebar.profile}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
