import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Battery,
  Thermometer,
  Clock,
} from "lucide-react";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";

// Thresholds kept as constants to avoid magic numbers and to make tuning easy
const LOW_BATTERY_THRESHOLD = 20;
const HIGH_TEMP_THRESHOLD = 37;

// Priority levels — lower number = higher priority in the feed
const PRIORITY = {
  CRITICAL: 1,
  WARNING: 2,
  SENSOR: 3,
  INFO: 5,
};

const ActivityFeed = ({ limit = 10, onViewDetail }) => {
  const { hives } = useLiveData();
  const { lang } = useLanguage();
  const isTr = lang === "tr";

  const activities = useMemo(() => {
    const acts = [];

    // Small helper to keep the message building consistent and reduce repetition
    const t = (tr, en) => (isTr ? tr : en);
    const hivePrefix = (id) => (isTr ? `Kovan #${id}` : `Hive #${id}`);

    hives.forEach((hive) => {
      const { id, status, battery, temp, alertType, lastActivity, lastUpdate } =
        hive;

      // Critical alerts
      if (status === "critical") {
        acts.push({
          id: `crit-${id}`,
          hiveId: id,
          type: "critical",
          icon: AlertTriangle,
          iconColor: "text-red-400",
          bgColor: "bg-red-500/10",
          message: `${hivePrefix(id)}: ${
            alertType || t("Kritik durum algılandı", "Critical status detected")
          }`,
          time: lastUpdate,
          priority: PRIORITY.CRITICAL,
        });
      }

      // Warning alerts
      if (status === "warning") {
        acts.push({
          id: `warn-${id}`,
          hiveId: id,
          type: "warning",
          icon: AlertTriangle,
          iconColor: "text-amber-400",
          bgColor: "bg-amber-500/10",
          message: `${hivePrefix(id)}: ${
            alertType || t("Uyarı durumu", "Warning status")
          }`,
          time: lastUpdate,
          priority: PRIORITY.WARNING,
        });
      }

      // Low battery — guard against undefined/null
      if (typeof battery === "number" && battery < LOW_BATTERY_THRESHOLD) {
        acts.push({
          id: `bat-${id}`,
          hiveId: id,
          type: "battery",
          icon: Battery,
          iconColor: "text-orange-400",
          bgColor: "bg-orange-500/10",
          message: `${hivePrefix(id)}: ${t(
            `Düşük pil (%${battery})`,
            `Low battery (${battery}%)`,
          )}`,
          time: lastUpdate,
          priority: PRIORITY.SENSOR,
        });
      }

      // High temperature — guard against undefined/null
      if (typeof temp === "number" && temp > HIGH_TEMP_THRESHOLD) {
        acts.push({
          id: `temp-${id}`,
          hiveId: id,
          type: "temperature",
          icon: Thermometer,
          iconColor: "text-red-300",
          bgColor: "bg-red-500/10",
          message: `${hivePrefix(id)}: ${t(
            `Yüksek sıcaklık (${temp}°C)`,
            `High temperature (${temp}°C)`,
          )}`,
          time: lastUpdate,
          priority: PRIORITY.SENSOR,
        });
      }

      // Stable hive activity (informational)
      if (status === "stable") {
        acts.push({
          id: `stable-${id}`,
          hiveId: id,
          type: "info",
          icon: CheckCircle,
          iconColor: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          message: `${hivePrefix(id)}: ${
            lastActivity || t("Tüm sistemler normal", "All systems normal")
          }`,
          time: lastUpdate,
          priority: PRIORITY.INFO,
        });
      }
    });

    return acts
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))
      .slice(0, limit);
  }, [hives, isTr, limit]);

  const hasActivities = activities.length > 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-300">
            {isTr ? "Son Aktiviteler" : "Recent Activity"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5" aria-live="polite">
          <span
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
            aria-hidden="true"
          />
          <span className="text-xs text-gray-500">
            {isTr ? "Canlı" : "Live"}
          </span>
        </div>
      </div>

      {hasActivities ? (
        <ul
          className="space-y-1 max-h-96 overflow-y-auto custom-scroll"
          role="list"
        >
          {activities.map((act) => {
            const Icon = act.icon;
            const isInteractive = Boolean(onViewDetail);

            const content = (
              <>
                <div
                  className={`p-1.5 rounded-lg ${act.bgColor} flex-shrink-0 mt-0.5`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${act.iconColor}`}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                    {act.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock
                      className="w-3 h-3 text-gray-600"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-gray-500">{act.time}</span>
                  </div>
                </div>
                {isInteractive && (
                  <span
                    className="text-gray-600 text-xs group-hover:text-amber-400 transition-colors mt-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                )}
              </>
            );

            return (
              <li key={act.id}>
                {isInteractive ? (
                  <button
                    type="button"
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 focus:bg-gray-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors cursor-pointer group text-left"
                    onClick={() => onViewDetail(act.hiveId)}
                    aria-label={act.message}
                  >
                    {content}
                  </button>
                ) : (
                  <div
                    className="w-full flex items-start gap-3 p-3 rounded-lg group text-left"
                    aria-label={act.message}
                  >
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-8">
          <Activity
            className="w-8 h-8 text-gray-700 mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-500">
            {isTr ? "Henüz aktivite yok" : "No activity yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
