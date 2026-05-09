import { useState, useMemo, useCallback } from "react";
import { Bell, Search, X } from "lucide-react";
import { getNotificationIcon } from "../data/mockData";
import { useLanguage } from "../contexts/LanguageContext";

const NotificationHistoryView = ({ notifications = [], onViewDetail }) => {
  const { t, lang } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Tip bazında sayım (filtre butonlarında badge için)
  const counts = useMemo(() => {
    const c = { all: notifications.length, critical: 0, warning: 0, info: 0 };
    for (const n of notifications) {
      if (c[n.type] !== undefined) c[n.type] += 1;
    }
    return c;
  }, [notifications]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notifications.filter((n) => {
      if (filter !== "all" && n.type !== filter) return false;
      if (!q) return true;
      const msg = n.message?.toLowerCase() || "";
      const hive = n.hiveId ? String(n.hiveId).toLowerCase() : "";
      return msg.includes(q) || hive.includes(q);
    });
  }, [notifications, filter, searchQuery]);

  const handleItemClick = useCallback(
    (notif) => {
      if (notif.hiveId && onViewDetail) onViewDetail(notif.hiveId);
    },
    [onViewDetail],
  );

  const handleKeyDown = useCallback(
    (e, notif) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleItemClick(notif);
      }
    },
    [handleItemClick],
  );

  const filters = [
    { id: "all", label: t.notifications.filterAll },
    {
      id: "critical",
      label: t.notifications.filterCritical,
      color: "bg-red-600",
    },
    {
      id: "warning",
      label: t.notifications.filterWarning,
      color: "bg-amber-500",
    },
    { id: "info", label: t.notifications.filterInfo, color: "bg-blue-500" },
  ];

  const searchPlaceholder =
    lang === "tr" ? "Bildirim ara..." : "Search notifications...";
  const clearLabel = lang === "tr" ? "Aramayı temizle" : "Clear search";
  const shownLabel =
    lang === "tr" ? "bildirim gösteriliyor" : "notifications shown";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <Bell className="w-7 h-7 text-amber-400" aria-hidden="true" />
          {t.notifications.history}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {t.notifications.allNotifications}
        </p>
      </div>

      {/* Filtre Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Arama */}
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={clearLabel}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-200 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtre Butonları */}
          <div
            role="tablist"
            aria-label={
              lang === "tr" ? "Bildirim filtreleri" : "Notification filters"
            }
            className="flex gap-2 flex-wrap"
          >
            {filters.map((f) => {
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-1.5 ${
                    isActive
                      ? `${f.color || "bg-amber-500"} text-white shadow-sm`
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                  }`}
                >
                  <span>{f.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-black/20" : "bg-gray-900 text-gray-500"
                    }`}
                  >
                    {counts[f.id] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bildirim Listesi */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell
              className="w-12 h-12 text-gray-700 mx-auto mb-3"
              aria-hidden="true"
            />
            <p className="text-gray-500">{t.notifications.noHistory}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800" role="list">
            {filtered.map((notif) => {
              const clickable = Boolean(notif.hiveId && onViewDetail);
              return (
                <li
                  key={notif.id}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={clickable ? () => handleItemClick(notif) : undefined}
                  onKeyDown={
                    clickable ? (e) => handleKeyDown(e, notif) : undefined
                  }
                  className={`p-4 flex items-center gap-4 transition-colors ${
                    clickable
                      ? "hover:bg-gray-800 cursor-pointer focus:outline-none focus:bg-gray-800 focus:ring-1 focus:ring-inset focus:ring-amber-500"
                      : ""
                  } ${!notif.read ? "bg-amber-500/5" : ""}`}
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">
                    {getNotificationIcon(notif.type)}
                  </span>
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
                          aria-label={lang === "tr" ? "Okunmadı" : "Unread"}
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
                  </div>
                  <time className="text-xs text-gray-600 whitespace-nowrap flex-shrink-0">
                    {notif.time}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Sonuç Sayısı */}
      <div className="text-center text-xs text-gray-600" aria-live="polite">
        {filtered.length} / {notifications.length} {shownLabel}
      </div>
    </div>
  );
};

export default NotificationHistoryView;
