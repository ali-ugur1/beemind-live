import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Plus,
  X,
  Droplets,
  Bug,
  Package,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";

const EVENTS_KEY = "beemora_calendar_events";

const EVENT_TYPES = {
  medication: {
    icon: Droplets,
    dot: "bg-purple-500",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  inspection: {
    icon: CheckCircle,
    dot: "bg-blue-500",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  harvest: {
    icon: Package,
    dot: "bg-emerald-500",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  feeding: {
    icon: Bug,
    dot: "bg-amber-400",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  maintenance: {
    icon: Wrench,
    dot: "bg-cyan-500",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  alarm: {
    icon: AlertTriangle,
    dot: "bg-red-500",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
  },
  warning: {
    icon: AlertTriangle,
    dot: "bg-amber-500",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  other: {
    icon: Calendar,
    dot: "bg-gray-500",
    color: "text-gray-400 bg-gray-500/10 border-gray-500/30",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────
// Local-date helpers (timezone-safe). We store dates as "YYYY-MM-DD" strings
// to avoid ISO/UTC shifts on date-only events.
const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const parseDateKey = (key) => {
  // Accepts either "YYYY-MM-DD" or a full ISO string (legacy). Always returns local Date.
  if (!key) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(key);
  return isNaN(d.getTime()) ? null : d;
};

const sameYMD = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Load/save helpers with SSR + quota safety
const loadEvents = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(EVENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveEvents = (events) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    /* quota or private-mode — silently ignore */
  }
};

// ── Main Component ───────────────────────────────────────────────────────
const CalendarView = ({ hives = [] }) => {
  const liveData = useLiveData();
  const allHives = hives.length > 0 ? hives : liveData?.hives || [];
  const { t, lang } = useLanguage();
  const toast = useToast();
  const isTr = lang === "tr";

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userEvents, setUserEvents] = useState(loadEvents);

  useEffect(() => {
    saveEvents(userEvents);
  }, [userEvents]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = useMemo(() => new Date(), []);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first: JS Sunday=0 → 6, Monday=1 → 0 …
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  // Clamp selectedDay when month changes (e.g. selected 31 → February)
  useEffect(() => {
    if (selectedDay && selectedDay > daysInMonth) setSelectedDay(null);
  }, [daysInMonth, selectedDay]);

  // ── Auto-generated events ─────────────────────────────────────────────
  const autoEvents = useMemo(() => {
    const events = [];
    const todayKey = toDateKey(today);

    // Alarm/warning events for hives (today)
    allHives.forEach((hive) => {
      if (hive.status === "critical") {
        events.push({
          id: `auto-alarm-${hive.id}`,
          date: todayKey,
          type: "alarm",
          hiveId: hive.id,
          title: hive.alertType || (isTr ? "Kritik Alarm" : "Critical Alarm"),
          description: "",
          auto: true,
        });
      } else if (hive.status === "warning") {
        events.push({
          id: `auto-warning-${hive.id}`,
          date: todayKey,
          type: "warning",
          hiveId: hive.id,
          title: hive.alertType || (isTr ? "Uyarı" : "Warning"),
          description: "",
          auto: true,
        });
      }
    });

    // Weekly inspections — every Monday of the *currently viewed* month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d.getDay() === 1) {
        events.push({
          id: `maint-inspect-${year}-${month}-${day}`,
          date: toDateKey(d),
          type: "inspection",
          title: isTr ? "Haftalık Kovan Kontrolü" : "Weekly Hive Inspection",
          description: isTr
            ? "Tüm kovanları kontrol edin: ana arı, yavru, besin, hastalık belirtileri"
            : "Check all hives: queen, brood, food, disease signs",
          auto: true,
        });
      }
    }

    // Seasonal reminders (anchored to the viewed year so they appear when scrolling years)
    const seasonal = [
      {
        m: 1,
        d: 15,
        type: "inspection",
        tr: "İlkbahar İlk Kontrol",
        en: "First Spring Check",
        trDesc: "Ana arı kontrolü, besin durumu, koloni gücü",
        enDesc: "Queen check, food status, colony strength",
      },
      {
        m: 2,
        d: 1,
        type: "feeding",
        tr: "İlkbahar Beslemesi",
        en: "Spring Feeding",
        trDesc: "Şekerli su veya kek ile besleme",
        enDesc: "Feed with sugar syrup or patty",
      },
      {
        m: 2,
        d: 15,
        type: "medication",
        tr: "Varroa İlkbahar Tedavisi",
        en: "Spring Varroa Treatment",
        trDesc: "Oksalik asit veya timol uygulama zamanı",
        enDesc: "Time for oxalic acid or thymol application",
      },
      {
        m: 4,
        d: 1,
        type: "inspection",
        tr: "Ana Arı Kontrolü",
        en: "Queen Bee Check",
        trDesc: "Ana arı performansı ve yumurtlama kontrolü",
        enDesc: "Queen performance and laying check",
      },
      {
        m: 6,
        d: 15,
        type: "harvest",
        tr: "Bal Hasadı Dönemi",
        en: "Honey Harvest Season",
        trDesc: "Ana hasat dönemi — petekleri kontrol edin",
        enDesc: "Main harvest period — check frames",
      },
      {
        m: 8,
        d: 1,
        type: "medication",
        tr: "Varroa Sonbahar Tedavisi",
        en: "Fall Varroa Treatment",
        trDesc: "Hasat sonrası varroa tedavisi",
        enDesc: "Post-harvest varroa treatment",
      },
      {
        m: 9,
        d: 1,
        type: "feeding",
        tr: "Sonbahar Beslemesi",
        en: "Fall Feeding",
        trDesc: "Kış öncesi besin depolaması için besleme",
        enDesc: "Feeding for winter food storage",
      },
      {
        m: 10,
        d: 1,
        type: "maintenance",
        tr: "Kış Hazırlık",
        en: "Winter Preparation",
        trDesc: "Kovanları yalıtın, giriş daraltma, fare koruma",
        enDesc: "Insulate hives, reduce entrance, mouse guard",
      },
    ];
    seasonal.forEach((s) => {
      events.push({
        id: `maint-${s.type}-${year}-${s.m}-${s.d}`,
        date: toDateKey(new Date(year, s.m, s.d)),
        type: s.type,
        title: isTr ? s.tr : s.en,
        description: isTr ? s.trDesc : s.enDesc,
        auto: true,
      });
    });

    return events;
  }, [allHives, isTr, year, month, daysInMonth, today]);

  const allEvents = useMemo(
    () => [...autoEvents, ...userEvents],
    [autoEvents, userEvents],
  );

  // Pre-index events by date-key for O(1) lookup per cell render
  const eventsByDay = useMemo(() => {
    const map = new Map();
    allEvents.forEach((ev) => {
      const d = parseDateKey(ev.date);
      if (!d) return;
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const key = d.getDate();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    });
    return map;
  }, [allEvents, year, month]);

  const getEventsForDay = useCallback(
    (day) => eventsByDay.get(day) || [],
    [eventsByDay],
  );
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  const addEvent = (data) => {
    setUserEvents((prev) => [
      ...prev,
      {
        ...data,
        id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    ]);
    toast.success(isTr ? "Etkinlik eklendi" : "Event added");
    setShowAddModal(false);
  };

  const updateEvent = (data) => {
    setUserEvents((prev) => prev.map((e) => (e.id === data.id ? data : e)));
    toast.success(isTr ? "Etkinlik güncellendi" : "Event updated");
    setEditingEvent(null);
  };

  const deleteEvent = (eventId) => {
    setUserEvents((prev) => prev.filter((e) => e.id !== eventId));
    toast.info(isTr ? "Etkinlik silindi" : "Event deleted");
  };

  const typeLabels = {
    medication: isTr ? "İlaçlama" : "Medication",
    inspection: isTr ? "Kontrol" : "Inspection",
    harvest: isTr ? "Hasat" : "Harvest",
    feeding: isTr ? "Besleme" : "Feeding",
    maintenance: isTr ? "Bakım" : "Maintenance",
    alarm: isTr ? "Alarm" : "Alarm",
    warning: isTr ? "Uyarı" : "Warning",
    other: isTr ? "Diğer" : "Other",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-amber-400" />
            {t.calendar.title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t.calendar.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isTr ? "Etkinlik Ekle" : "Add Event"}
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors"
          >
            {t.calendar.today}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              aria-label={isTr ? "Önceki ay" : "Previous month"}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-xl font-bold text-gray-100">
              {t.calendar.months[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              aria-label={isTr ? "Sonraki ay" : "Next month"}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {t.calendar.days.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = sameYMD(new Date(year, month, day), today);
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDay(day === selectedDay ? null : day)
                  }
                  aria-label={`${day} ${t.calendar.months[month]} ${year}${dayEvents.length ? ` — ${dayEvents.length} ${isTr ? "etkinlik" : "events"}` : ""}`}
                  aria-pressed={isSelected}
                  className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all relative ${
                    isSelected
                      ? "bg-amber-500/20 border-2 border-amber-500"
                      : isToday
                        ? "bg-amber-500/10 border border-amber-500/50"
                        : "hover:bg-gray-800 border border-transparent"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${isToday ? "text-amber-400" : "text-gray-300"}`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${(EVENT_TYPES[ev.type] || EVENT_TYPES.other).dot}`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-gray-500">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend — show all types */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-800">
            {Object.entries(typeLabels).map(([type, label]) => (
              <div
                key={type}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <div
                  className={`w-2 h-2 rounded-full ${(EVENT_TYPES[type] || EVENT_TYPES.other).dot}`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase">
              {selectedDay
                ? `${selectedDay} ${t.calendar.months[month]}`
                : t.calendar.events}
            </h4>
            {selectedDay && (
              <button
                onClick={() => setShowAddModal(true)}
                className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                title={isTr ? "Etkinlik Ekle" : "Add Event"}
                aria-label={isTr ? "Etkinlik Ekle" : "Add Event"}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {!selectedDay && (
            <p className="text-gray-600 text-sm">
              {isTr ? "Bir gün seçin…" : "Select a day…"}
            </p>
          )}

          {selectedDay && selectedEvents.length === 0 && (
            <p className="text-gray-600 text-sm">{t.calendar.noEvents}</p>
          )}

          <div className="space-y-3">
            {selectedEvents.map((ev) => {
              const typeInfo = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
              const Icon = typeInfo.icon;
              const hive = allHives.find(
                (h) => String(h.id) === String(ev.hiveId),
              );
              return (
                <div
                  key={ev.id}
                  className={`${typeInfo.color} border rounded-lg p-4`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-100">
                          {ev.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ev.hiveId
                            ? `${hive?.name || `${isTr ? "Kovan" : "Hive"} #${ev.hiveId}`}`
                            : isTr
                              ? "Tüm Kovanlar"
                              : "All Hives"}
                          {" · "}
                          {typeLabels[ev.type] || ev.type}
                        </p>
                        {ev.description && (
                          <p className="text-xs text-gray-400 mt-1">
                            {ev.description}
                          </p>
                        )}
                        {ev.time && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ev.time}
                          </p>
                        )}
                      </div>
                    </div>
                    {!ev.auto && (
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="text-gray-500 hover:text-amber-400 transition-colors p-1"
                          aria-label={isTr ? "Düzenle" : "Edit"}
                          title={isTr ? "Düzenle" : "Edit"}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          aria-label={isTr ? "Sil" : "Delete"}
                          title={isTr ? "Sil" : "Delete"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {(showAddModal || editingEvent) && (
        <EventModal
          event={editingEvent}
          hives={allHives}
          selectedDay={selectedDay}
          currentMonth={month}
          currentYear={year}
          isTr={isTr}
          typeLabels={typeLabels}
          onSave={editingEvent ? updateEvent : addEvent}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

// ── Event Add/Edit Modal ────────────────────────────────────────────────
const EventModal = ({
  event,
  hives,
  selectedDay,
  currentMonth,
  currentYear,
  isTr,
  typeLabels,
  onSave,
  onClose,
}) => {
  const initialDate = useMemo(() => {
    if (event?.date) {
      const d = parseDateKey(event.date);
      if (d) return toDateKey(d);
    }
    if (selectedDay)
      return toDateKey(new Date(currentYear, currentMonth, selectedDay));
    return toDateKey(new Date());
  }, [event, selectedDay, currentMonth, currentYear]);

  const [title, setTitle] = useState(event?.title || "");
  const [type, setType] = useState(event?.type || "inspection");
  const [hiveId, setHiveId] = useState(event?.hiveId ?? hives[0]?.id ?? "");
  const [description, setDescription] = useState(event?.description || "");
  const [time, setTime] = useState(event?.time || "");
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState("");

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(isTr ? "Etkinlik adı gerekli" : "Event title required");
      return;
    }
    onSave({
      ...(event?.id ? { id: event.id } : {}),
      title: title.trim(),
      type,
      hiveId,
      description: description.trim(),
      time,
      date, // stored as "YYYY-MM-DD" → timezone-safe
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-100">
            {event
              ? isTr
                ? "Etkinlik Düzenle"
                : "Edit Event"
              : isTr
                ? "Etkinlik Ekle"
                : "Add Event"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label={isTr ? "Kapat" : "Close"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {isTr ? "Etkinlik Adı" : "Event Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder={
                isTr ? "Örn: İlkbahar kontrolü" : "e.g. Spring inspection"
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none"
              autoFocus
              maxLength={120}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {isTr ? "Tarih" : "Date"}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {isTr ? "Saat" : "Time"}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {isTr ? "Etkinlik Türü" : "Event Type"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
            >
              {[
                "medication",
                "inspection",
                "harvest",
                "feeding",
                "maintenance",
                "other",
              ].map((k) => (
                <option key={k} value={k}>
                  {typeLabels[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {isTr ? "Kovan" : "Hive"}
            </label>
            <select
              value={hiveId}
              onChange={(e) => setHiveId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
            >
              <option value="">{isTr ? "Tüm Kovanlar" : "All Hives"}</option>
              {hives.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name || `${isTr ? "Kovan" : "Hive"} #${h.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {isTr ? "Açıklama" : "Description"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isTr ? "Opsiyonel notlar…" : "Optional notes…"}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium"
            >
              {isTr ? "İptal" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-semibold"
            >
              {event ? (isTr ? "Güncelle" : "Update") : isTr ? "Ekle" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarView;
