import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getNotificationIcon } from '../data/mockData';

const NotificationDropdown = ({ notifications, isOpen, onClose, onMarkAsRead }) => {
  const dropdownRef = useRef(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 animate-slide-down"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="font-semibold text-gray-100">Bildirimler</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {unreadCount} okunmamış bildirim
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>🔔 Henüz bildirim yok</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-800 transition-colors cursor-pointer ${
                  !notif.read ? 'bg-amber-500/5' : ''
                }`}
                onClick={() => onMarkAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <span className="text-2xl flex-shrink-0">
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
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      )}
                    </div>
                    <p className={`text-sm ${!notif.read ? 'text-gray-100 font-medium' : 'text-gray-400'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-700 text-center">
          <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
            Tümünü Gör
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
