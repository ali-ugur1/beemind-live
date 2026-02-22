import { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertTriangle, Wrench, CheckCircle, Plus, X, Droplets, Bug, Package } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const EVENTS_KEY = 'beemind_calendar_events';

const EVENT_TYPES = {
  medication: { icon: Droplets, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  inspection: { icon: CheckCircle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  harvest: { icon: Package, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  feeding: { icon: Bug, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  maintenance: { icon: Wrench, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  alarm: { icon: AlertTriangle, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  warning: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  other: { icon: Calendar, color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
};

const CalendarView = ({ hives = [] }) => {
  const liveData = useLiveData();
  const allHives = hives.length > 0 ? hives : (liveData?.hives || []);
  const { t, lang } = useLanguage();
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Load events from localStorage
  const [userEvents, setUserEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(EVENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Save events to localStorage
  useEffect(() => {
    try { localStorage.setItem(EVENTS_KEY, JSON.stringify(userEvents)); } catch {}
  }, [userEvents]);

  // Generate auto events from hive statuses
  const autoEvents = useMemo(() => {
    const events = [];
    const now = new Date();
    allHives.forEach(hive => {
      if (hive.status === 'critical') {
        events.push({
          id: `auto-alarm-${hive.id}`,
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
          type: 'alarm',
          hiveId: hive.id,
          title: hive.alertType || (lang === 'tr' ? 'Kritik Alarm' : 'Critical Alarm'),
          description: '',
          auto: true,
        });
      }
      if (hive.status === 'warning') {
        events.push({
          id: `auto-warning-${hive.id}`,
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
          type: 'warning',
          hiveId: hive.id,
          title: hive.alertType || (lang === 'tr' ? 'Uyari' : 'Warning'),
          description: '',
          auto: true,
        });
      }
    });
    return events;
  }, [allHives, lang]);

  const allEvents = useMemo(() => [...autoEvents, ...userEvents], [autoEvents, userEvents]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDay(new Date().getDate()); };

  const getEventsForDay = (day) => {
    return allEvents.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setUserEvents(prev => [...prev, newEvent]);
    toast.success(lang === 'tr' ? 'Etkinlik eklendi' : 'Event added');
    setShowAddModal(false);
  };

  const updateEvent = (eventData) => {
    setUserEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
    toast.success(lang === 'tr' ? 'Etkinlik guncellendi' : 'Event updated');
    setEditingEvent(null);
  };

  const deleteEvent = (eventId) => {
    setUserEvents(prev => prev.filter(e => e.id !== eventId));
    toast.info(lang === 'tr' ? 'Etkinlik silindi' : 'Event deleted');
  };

  const typeLabels = {
    medication: lang === 'tr' ? 'Ilaclama' : 'Medication',
    inspection: lang === 'tr' ? 'Kontrol' : 'Inspection',
    harvest: lang === 'tr' ? 'Hasat' : 'Harvest',
    feeding: lang === 'tr' ? 'Besleme' : 'Feeding',
    maintenance: lang === 'tr' ? 'Bakim' : 'Maintenance',
    alarm: lang === 'tr' ? 'Alarm' : 'Alarm',
    warning: lang === 'tr' ? 'Uyari' : 'Warning',
    other: lang === 'tr' ? 'Diger' : 'Other',
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
            onClick={() => { setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {lang === 'tr' ? 'Etkinlik Ekle' : 'Add Event'}
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
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <h3 className="text-xl font-bold text-gray-100">
              {t.calendar.months[month]} {year}
            </h3>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {t.calendar.days.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start transition-all relative ${
                    isSelected
                      ? 'bg-amber-500/20 border-2 border-amber-500'
                      : isToday
                        ? 'bg-amber-500/10 border border-amber-500/50'
                        : 'hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-amber-400' : 'text-gray-300'}`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            ev.type === 'alarm' ? 'bg-red-500' :
                            ev.type === 'warning' ? 'bg-amber-500' :
                            ev.type === 'maintenance' ? 'bg-cyan-500' :
                            ev.type === 'harvest' ? 'bg-emerald-500' :
                            ev.type === 'medication' ? 'bg-purple-500' :
                            ev.type === 'feeding' ? 'bg-amber-400' :
                            ev.type === 'inspection' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[8px] text-gray-500">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800">
            {Object.entries(typeLabels).slice(0, 6).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${
                  type === 'alarm' ? 'bg-red-500' :
                  type === 'warning' ? 'bg-amber-500' :
                  type === 'maintenance' ? 'bg-cyan-500' :
                  type === 'harvest' ? 'bg-emerald-500' :
                  type === 'medication' ? 'bg-purple-500' :
                  type === 'feeding' ? 'bg-amber-400' :
                  type === 'inspection' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Event Details Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-400 uppercase">
              {selectedDay ? `${selectedDay} ${t.calendar.months[month]}` : t.calendar.events}
            </h4>
            {selectedDay && (
              <button
                onClick={() => { setShowAddModal(true); }}
                className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                title={lang === 'tr' ? 'Etkinlik Ekle' : 'Add Event'}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {!selectedDay && (
            <p className="text-gray-600 text-sm">{lang === 'tr' ? 'Bir gun secin...' : 'Select a day...'}</p>
          )}

          {selectedDay && selectedEvents.length === 0 && (
            <p className="text-gray-600 text-sm">{t.calendar.noEvents}</p>
          )}

          <div className="space-y-3">
            {selectedEvents.map(ev => {
              const typeInfo = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
              const Icon = typeInfo.icon;
              return (
                <div key={ev.id} className={`${typeInfo.color} border rounded-lg p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-100">{ev.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {lang === 'tr' ? 'Kovan' : 'Hive'} #{ev.hiveId} &middot; {typeLabels[ev.type] || ev.type}
                        </p>
                        {ev.description && (
                          <p className="text-xs text-gray-400 mt-1">{ev.description}</p>
                        )}
                        {ev.time && (
                          <p className="text-xs text-gray-500 mt-1">🕐 {ev.time}</p>
                        )}
                      </div>
                    </div>
                    {!ev.auto && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="text-xs text-gray-500 hover:text-amber-400 transition-colors p-1"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="text-xs text-gray-500 hover:text-red-400 transition-colors p-1"
                        >
                          🗑
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

      {/* Add/Edit Event Modal */}
      {(showAddModal || editingEvent) && (
        <EventModal
          event={editingEvent}
          hives={allHives}
          selectedDay={selectedDay}
          currentMonth={month}
          currentYear={year}
          lang={lang}
          typeLabels={typeLabels}
          onSave={editingEvent ? updateEvent : addEvent}
          onClose={() => { setShowAddModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
};

// Event Add/Edit Modal
const EventModal = ({ event, hives, selectedDay, currentMonth, currentYear, lang, typeLabels, onSave, onClose }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [type, setType] = useState(event?.type || 'inspection');
  const [hiveId, setHiveId] = useState(event?.hiveId || (hives[0]?.id || ''));
  const [description, setDescription] = useState(event?.description || '');
  const [time, setTime] = useState(event?.time || '');
  const [date, setDate] = useState(() => {
    if (event?.date) {
      const d = new Date(event.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    if (selectedDay) {
      return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(lang === 'tr' ? 'Etkinlik adi gerekli' : 'Event title required');
      return;
    }
    const eventData = {
      ...(event?.id ? { id: event.id } : {}),
      title: title.trim(),
      type,
      hiveId,
      description: description.trim(),
      time,
      date: new Date(date).toISOString(),
    };
    onSave(eventData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-100">
            {event ? (lang === 'tr' ? 'Etkinlik Duzenle' : 'Edit Event') : (lang === 'tr' ? 'Etkinlik Ekle' : 'Add Event')}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">{lang === 'tr' ? 'Etkinlik Adi' : 'Event Title'}</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder={lang === 'tr' ? 'Orn: Ilkbahar kontrolu' : 'e.g. Spring inspection'}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{lang === 'tr' ? 'Tarih' : 'Date'}</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{lang === 'tr' ? 'Saat' : 'Time'}</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">{lang === 'tr' ? 'Etkinlik Turu' : 'Event Type'}</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
            >
              {['medication', 'inspection', 'harvest', 'feeding', 'maintenance', 'other'].map(t => (
                <option key={t} value={t}>{typeLabels[t]}</option>
              ))}
            </select>
          </div>

          {/* Hive */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">{lang === 'tr' ? 'Kovan' : 'Hive'}</label>
            <select
              value={hiveId}
              onChange={e => setHiveId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:border-amber-500/50 focus:outline-none"
            >
              {hives.map(h => (
                <option key={h.id} value={h.id}>{lang === 'tr' ? 'Kovan' : 'Hive'} #{h.id}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">{lang === 'tr' ? 'Aciklama' : 'Description'}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={lang === 'tr' ? 'Opsiyonel notlar...' : 'Optional notes...'}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium"
            >
              {lang === 'tr' ? 'Iptal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-semibold"
            >
              {event ? (lang === 'tr' ? 'Guncelle' : 'Update') : (lang === 'tr' ? 'Ekle' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarView;
