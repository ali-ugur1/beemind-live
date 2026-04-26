import { useState, useMemo } from "react";
import {
  GitCompareArrows,
  Plus,
  X,
  Thermometer,
  Droplets,
  Battery,
  Volume2,
  Weight,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useLiveData } from "../contexts/LiveDataContext";
import { getStatusColor, getStatusText } from "../data/mockData";
import { useLanguage } from "../contexts/LanguageContext";

const MAX_COMPARE = 3;

const CompareView = () => {
  const { hives } = useLiveData();
  const { t, lang } = useLanguage();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const selectedHives = useMemo(
    () =>
      selectedIds.map((id) => hives.find((h) => h.id === id)).filter(Boolean),
    [selectedIds, hives],
  );

  const toggleHive = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const metrics = useMemo(
    () => [
      {
        key: "temp",
        label: t.detail.temperature,
        icon: Thermometer,
        unit: "°C",
        color: "text-red-400",
        barColor: "bg-red-500/60",
      },
      {
        key: "humidity",
        label: t.detail.humidity,
        icon: Droplets,
        unit: "%",
        color: "text-cyan-400",
        barColor: "bg-cyan-500/60",
      },
      {
        key: "battery",
        label: t.detail.battery,
        icon: Battery,
        unit: "%",
        color: "text-emerald-400",
        barColor: "bg-emerald-500/60",
      },
      {
        key: "sound",
        label: t.detail.soundLevel,
        icon: Volume2,
        unit: "dB",
        color: "text-purple-400",
        barColor: "bg-purple-500/60",
      },
      {
        key: "weight",
        label: lang === "tr" ? "AĞIRLIK" : "WEIGHT",
        icon: Weight,
        unit: "kg",
        color: "text-amber-400",
        barColor: "bg-amber-500/60",
      },
    ],
    [t, lang],
  );

  // Responsive grid: mobilde tek sütun label + kovanlar yan yana, desktop'ta 200px + kovanlar
  const gridStyle = {
    gridTemplateColumns: `minmax(120px, 180px) repeat(${selectedHives.length}, minmax(0, 1fr))`,
  };

  const formatValue = (val) => {
    if (typeof val !== "number" || Number.isNaN(val)) return "—";
    return val.toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <GitCompareArrows className="w-7 h-7 text-amber-400" />
            {t.compare.title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t.compare.subtitle}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowPicker((prev) => !prev)}
            aria-expanded={showPicker}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <Plus
              className={`w-4 h-4 transition-transform ${showPicker ? "rotate-45" : ""}`}
            />
            {t.compare.select}
            {selectedIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">
                {selectedIds.length}/{MAX_COMPARE}
              </span>
            )}
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              <X className="w-4 h-4" /> {t.compare.clear}
            </button>
          )}
        </div>
      </div>

      {/* Kovan Picker */}
      {showPicker && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">{t.compare.selectHive}</p>
            <span className="text-xs text-gray-500">
              {selectedIds.length}/{MAX_COMPARE}
            </span>
          </div>
          {hives.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">—</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hives.map((hive) => {
                const colors = getStatusColor(hive.status);
                const isSelected = selectedIds.includes(hive.id);
                const isDisabled =
                  !isSelected && selectedIds.length >= MAX_COMPARE;
                return (
                  <button
                    key={hive.id}
                    onClick={() => toggleHive(hive.id)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium flex items-center gap-2 ${
                      isSelected
                        ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ring-amber-500 ring-offset-1 ring-offset-gray-900`
                        : isDisabled
                          ? "bg-gray-800/50 border-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <span>{hive.name || hive.id}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Seçili Kovan Yok / Tek Kovan Seçili */}
      {selectedHives.length < 2 && (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-lg p-12 text-center">
          <GitCompareArrows className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{t.compare.noSelection}</p>
          {selectedHives.length === 1 && (
            <p className="text-gray-600 text-sm mt-2">
              {selectedHives[0].name || selectedHives[0].id}{" "}
              {lang === "tr"
                ? "seçildi — en az bir tane daha seçin"
                : "selected — pick at least one more"}
            </p>
          )}
        </div>
      )}

      {/* Karşılaştırma Tablosu */}
      {selectedHives.length >= 2 && (
        <div className="space-y-3 overflow-x-auto">
          <div className="min-w-[500px] space-y-3">
            {/* Kovan Başlıkları */}
            <div className="grid gap-3" style={gridStyle}>
              <div /> {/* Boş köşe */}
              {selectedHives.map((hive) => {
                const colors = getStatusColor(hive.status);
                return (
                  <div
                    key={hive.id}
                    className={`${colors.bg} ${colors.border} border rounded-lg p-4 text-center relative group`}
                  >
                    <button
                      onClick={() => toggleHive(hive.id)}
                      aria-label={lang === "tr" ? "Kaldır" : "Remove"}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-black/30 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5 text-gray-300" />
                    </button>
                    <p className="text-lg md:text-xl font-bold text-gray-100 truncate pr-5">
                      {hive.name || hive.id}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded ${colors.badge} text-white`}
                    >
                      {getStatusText(hive.status, lang)}
                    </span>
                    {hive.alertType && (
                      <p className="text-xs text-gray-400 mt-2 truncate">
                        {hive.alertType}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Metrik Satırları */}
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const values = selectedHives.map((h) =>
                typeof h[metric.key] === "number" ? h[metric.key] : 0,
              );
              const maxVal = Math.max(...values);
              const minVal = Math.min(...values);
              const allEqual = maxVal === minVal;
              const range = maxVal - minVal;

              return (
                <div
                  key={metric.key}
                  className="grid gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4 items-center hover:border-gray-700 transition-colors"
                  style={gridStyle}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 ${metric.color} shrink-0`} />
                    <span className="text-sm font-semibold text-gray-300 truncate">
                      {metric.label}
                    </span>
                  </div>
                  {selectedHives.map((hive) => {
                    const raw = hive[metric.key];
                    const val = typeof raw === "number" ? raw : 0;
                    const isMax = !allEqual && val === maxVal;
                    const isMin = !allEqual && val === minVal;

                    // Bar: relative position within min-max range
                    const barWidth = allEqual
                      ? 100
                      : range > 0
                        ? ((val - minVal) / range) * 100
                        : 0;

                    return (
                      <div key={hive.id} className="text-center min-w-0">
                        <div className="flex items-baseline justify-center gap-1">
                          {isMax && (
                            <TrendingUp
                              className="w-3.5 h-3.5 text-red-400"
                              aria-hidden
                            />
                          )}
                          {isMin && (
                            <TrendingDown
                              className="w-3.5 h-3.5 text-emerald-400"
                              aria-hidden
                            />
                          )}
                          {allEqual && selectedHives.length > 1 && (
                            <Minus
                              className="w-3.5 h-3.5 text-gray-500"
                              aria-hidden
                            />
                          )}
                          <p
                            className={`text-xl md:text-2xl font-bold tabular-nums ${
                              isMax
                                ? "text-red-400"
                                : isMin
                                  ? "text-emerald-400"
                                  : "text-gray-100"
                            }`}
                          >
                            {formatValue(raw)}
                            <span className="text-xs md:text-sm text-gray-500 ml-1 font-normal">
                              {metric.unit}
                            </span>
                          </p>
                        </div>
                        {/* Bar */}
                        <div
                          className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={val}
                          aria-valuemin={minVal}
                          aria-valuemax={maxVal}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${
                              isMax
                                ? "bg-red-500"
                                : isMin
                                  ? "bg-emerald-500"
                                  : metric.barColor
                            }`}
                            style={{ width: `${Math.max(barWidth, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                {lang === "tr" ? "En yüksek" : "Highest"}
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                {lang === "tr" ? "En düşük" : "Lowest"}
              </span>
              <span className="flex items-center gap-1.5">
                <Minus className="w-3.5 h-3.5 text-gray-500" />
                {lang === "tr" ? "Eşit" : "Equal"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareView;
