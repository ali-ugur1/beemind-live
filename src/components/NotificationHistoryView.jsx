import { useState, useMemo } from 'react';
import { Bell, Filter, Search, AlertTriangle, Info } from 'lucide-react';
import { getNotificationIcon } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';

const NotificationHistoryView = ({ notifications, onViewDetail }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = [...notifications];
    if (filter !== 'all') result = result.filter(n => n.type === filter);
    if (searchQuery.trim()) {
      result = result.filter(n =>
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.hiveId && n.hiveId.includes(searchQuery))
      );
    }
    return result;
  }, [notifications, filter, searchQuery]);

  const filters = [
    { id: 'all', label: t.notifications.filterAll },
    { id: 'critical', label: t.notifications.filterCritical, color: 'bg-red-600' },
    { id: 'warning', label: t.notifications.filterWarning, color: 'bg-amber-500' },
    { id: 'info', label: t.notifications.filterInfo, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <Bell className="w-7 h-7 text-amber-400" />
          {t.notifications.history}
        </h2>
        <p className="text-gray-500 text-sm mt-1">{t.notifications.allNotifications}</p>
      </div>

      {/* Filtre Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Arama */}
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Bildirim ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
            />
          </div>

          {/* Filtre Butonları */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f.id
                    ? `${f.color || 'bg-amber-500'} text-white`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bildirim Listesi */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">{t.notifications.noHistory}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map(notif => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-4 ${
                  !notif.read ? 'bg-amber-500/5' : ''
                }`}
                onClick={() => notif.hiveId && onViewDetail && onViewDetail(notif.hiveId)}
              >
                <span className="text-2xl flex-shrink-0">{getNotificationIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {notif.hiveId && (
                      <span className="text-xs font-mono text-amber-400">#{notif.hiveId}</span>
                    )}
                    {!notif.read && <span className="w-2 h-2 bg-amber-400 rounded-full" />}
                  </div>
                  <p className={`text-sm ${!notif.read ? 'text-gray-100 font-medium' : 'text-gray-400'}`}>
                    {notif.message}
                  </p>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">{notif.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sonuç Sayısı */}
      <div className="text-center text-xs text-gray-600">
        {filtered.length} / {notifications.length} bildirim gösteriliyor
      </div>
    </div>
  );
};

export default NotificationHistoryView;
