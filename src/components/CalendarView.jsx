import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertTriangle, Wrench, CheckCircle } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

// Mock takvim etkinlikleri (gerçekte API'den gelir)
const generateMockEvents = (hives) => {
  const events = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Son 30 gün içinden rastgele etkinlikler oluştur
  hives.forEach(hive => {
    if (hive.status === 'critical') {
      events.push({
        id: `alarm-${hive.id}-1`,
        date: new Date(year, month, Math.max(1, now.getDate() - Math.floor(Math.random() * 5))),
        type: 'alarm',
        hiveId: hive.id,
        title: hive.alertType || 'Kritik Alarm',
        icon: AlertTriangle,
        color: 'text-red-400 bg-red-500/10 border-red-500/30',
      });
    }
    if (hive.status === 'warning') {
      events.push({
        id: `warning-${hive.id}-1`,
        date: new Date(year, month, Math.max(1, now.getDate() - Math.floor(Math.random() * 10))),
        type: 'warning',
        hiveId: hive.id,
        title: hive.alertType || 'Uyarı',
        icon: AlertTriangle,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      });
    }
  });

  // Bakım etkinlikleri
  [3, 10, 17, 24].forEach((day, i) => {
    if (day <= new Date(year, month + 1, 0).getDate()) {
      events.push({
        id: `maintenance-${i}`,
        date: new Date(year, month, day),
        type: 'maintenance',
        hiveId: hives[i % hives.length]?.id || '01',
        title: `Kovan #${hives[i % hives.length]?.id || '01'} Bakım`,
        icon: Wrench,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      });
    }
  });

  // Hasat etkinlikleri
  [7, 21].forEach((day, i) => {
    if (day <= new Date(year, month + 1, 0).getDate()) {
      events.push({
        id: `harvest-${i}`,
        date: new Date(year, month, day),
        type: 'harvest',
        hiveId: hives[i % hives.length]?.id || '01',
        title: `Hasat Tamamlandı`,
        icon: CheckCircle,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      });
    }
  });

  return events;
};

const CalendarView = () => {
  const { hives } = useLiveData();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const events = useMemo(() => generateMockEvents(hives), [hives]);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Pazartesi = 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day) =>
    events.filter(e => e.date.getDate() === day && e.date.getMonth() === month && e.date.getFullYear() === year);

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

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
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
        >
          {t.calendar.today}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Takvim Grid */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-6">
          {/* Ay Navigasyonu */}
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

          {/* Gün Başlıkları */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {t.calendar.days.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7 gap-1">
            {/* Boş hücreler */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Günler */}
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
                            ev.type === 'maintenance' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lejant */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full" /> Alarm
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-amber-500 rounded-full" /> Uyarı
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full" /> Bakım
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Hasat
            </div>
          </div>
        </div>

        {/* Etkinlik Detayları */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            {selectedDay ? `${selectedDay} ${t.calendar.months[month]} — ${t.calendar.events}` : t.calendar.events}
          </h4>

          {!selectedDay && (
            <p className="text-gray-600 text-sm">Bir gün seçin...</p>
          )}

          {selectedDay && selectedEvents.length === 0 && (
            <p className="text-gray-600 text-sm">{t.calendar.noEvents}</p>
          )}

          {selectedEvents.map(ev => {
            const Icon = ev.icon;
            return (
              <div key={ev.id} className={`${ev.color} border rounded-lg p-4 mb-3`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-100">{ev.title}</p>
                    <p className="text-xs text-gray-500">Kovan #{ev.hiveId}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
