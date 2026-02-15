import { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, Battery, Thermometer, Wifi, Bell, Clock } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

const ActivityFeed = ({ limit = 10, onViewDetail }) => {
  const { hives } = useLiveData();
  const { lang } = useLanguage();

  const activities = useMemo(() => {
    const acts = [];

    hives.forEach(hive => {
      // Critical alerts
      if (hive.status === 'critical') {
        acts.push({
          id: `crit-${hive.id}`,
          hiveId: hive.id,
          type: 'critical',
          icon: AlertTriangle,
          iconColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          message: lang === 'tr'
            ? `Kovan #${hive.id}: ${hive.alertType || 'Kritik durum algilandi'}`
            : `Hive #${hive.id}: ${hive.alertType || 'Critical status detected'}`,
          time: hive.lastUpdate,
          priority: 1,
        });
      }

      // Warning alerts
      if (hive.status === 'warning') {
        acts.push({
          id: `warn-${hive.id}`,
          hiveId: hive.id,
          type: 'warning',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          message: lang === 'tr'
            ? `Kovan #${hive.id}: ${hive.alertType || 'Uyari durumu'}`
            : `Hive #${hive.id}: ${hive.alertType || 'Warning status'}`,
          time: hive.lastUpdate,
          priority: 2,
        });
      }

      // Low battery
      if (hive.battery < 20) {
        acts.push({
          id: `bat-${hive.id}`,
          hiveId: hive.id,
          type: 'battery',
          icon: Battery,
          iconColor: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          message: lang === 'tr'
            ? `Kovan #${hive.id}: Dusuk pil (%${hive.battery})`
            : `Hive #${hive.id}: Low battery (${hive.battery}%)`,
          time: hive.lastUpdate,
          priority: 3,
        });
      }

      // High temperature
      if (hive.temp > 37) {
        acts.push({
          id: `temp-${hive.id}`,
          hiveId: hive.id,
          type: 'temperature',
          icon: Thermometer,
          iconColor: 'text-red-300',
          bgColor: 'bg-red-500/10',
          message: lang === 'tr'
            ? `Kovan #${hive.id}: Yuksek sicaklik (${hive.temp}°C)`
            : `Hive #${hive.id}: High temperature (${hive.temp}°C)`,
          time: hive.lastUpdate,
          priority: 3,
        });
      }

      // Stable hive activity
      if (hive.status === 'stable') {
        acts.push({
          id: `stable-${hive.id}`,
          hiveId: hive.id,
          type: 'info',
          icon: CheckCircle,
          iconColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          message: lang === 'tr'
            ? `Kovan #${hive.id}: ${hive.lastActivity || 'Tum sistemler normal'}`
            : `Hive #${hive.id}: ${hive.lastActivity || 'All systems normal'}`,
          time: hive.lastUpdate,
          priority: 5,
        });
      }
    });

    return acts.sort((a, b) => a.priority - b.priority).slice(0, limit);
  }, [hives, lang, limit]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase">
            {lang === 'tr' ? 'Son Aktiviteler' : 'Recent Activity'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">{lang === 'tr' ? 'Canli' : 'Live'}</span>
        </div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto custom-scroll">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group"
              onClick={() => onViewDetail && onViewDetail(act.hiveId)}
            >
              <div className={`p-1.5 rounded-lg ${act.bgColor} flex-shrink-0 mt-0.5`}>
                <Icon className={`w-3.5 h-3.5 ${act.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                  {act.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-500">{act.time}</span>
                </div>
              </div>
              <span className="text-gray-600 text-xs group-hover:text-amber-400 transition-colors mt-1">→</span>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-gray-700 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {lang === 'tr' ? 'Henuz aktivite yok' : 'No activity yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
