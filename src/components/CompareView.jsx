import { useState, useMemo } from 'react';
import { GitCompareArrows, Plus, X, Thermometer, Droplets, Battery, Volume2, Weight } from 'lucide-react';
import { useLiveData } from '../contexts/LiveDataContext';
import { getStatusColor, getStatusText } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';

const CompareView = () => {
  const { hives } = useLiveData();
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const selectedHives = useMemo(() =>
    selectedIds.map(id => hives.find(h => h.id === id)).filter(Boolean),
    [selectedIds, hives]
  );

  const toggleHive = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const metrics = [
    { key: 'temp', label: t.detail.temperature, icon: Thermometer, unit: '°C', color: 'text-red-400' },
    { key: 'humidity', label: t.detail.humidity, icon: Droplets, unit: '%', color: 'text-cyan-400' },
    { key: 'battery', label: t.detail.battery, icon: Battery, unit: '%', color: 'text-emerald-400' },
    { key: 'sound', label: t.detail.soundLevel, icon: Volume2, unit: 'dB', color: 'text-purple-400' },
    { key: 'weight', label: 'AĞIRLIK', icon: Weight, unit: 'kg', color: 'text-amber-400' },
  ];

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
        <div className="flex gap-3">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.compare.select}
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" /> {t.compare.clear}
            </button>
          )}
        </div>
      </div>

      {/* Kovan Picker */}
      {showPicker && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-3">{t.compare.selectHive} (max 3)</p>
          <div className="flex flex-wrap gap-2">
            {hives.map(hive => {
              const colors = getStatusColor(hive.status);
              const isSelected = selectedIds.includes(hive.id);
              return (
                <button
                  key={hive.id}
                  onClick={() => toggleHive(hive.id)}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                    isSelected
                      ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ring-amber-500`
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  #{hive.id} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Seçili Kovanlar Yok */}
      {selectedHives.length < 2 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
          <GitCompareArrows className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{t.compare.noSelection}</p>
        </div>
      )}

      {/* Karşılaştırma Tablosu */}
      {selectedHives.length >= 2 && (
        <div className="space-y-4">
          {/* Kovan Başlıkları */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${selectedHives.length}, 1fr)` }}>
            <div></div>
            {selectedHives.map(hive => {
              const colors = getStatusColor(hive.status);
              return (
                <div key={hive.id} className={`${colors.bg} ${colors.border} border rounded-lg p-4 text-center`}>
                  <p className="text-xl font-bold text-gray-100">#{hive.id}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${colors.badge} text-white`}>
                    {getStatusText(hive.status)}
                  </span>
                  {hive.alertType && (
                    <p className="text-xs text-gray-400 mt-2">{hive.alertType}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Metrik Satırları */}
          {metrics.map(metric => {
            const Icon = metric.icon;
            const values = selectedHives.map(h => h[metric.key] || 0);
            const maxVal = Math.max(...values);
            const minVal = Math.min(...values);

            return (
              <div
                key={metric.key}
                className="grid gap-4 bg-gray-900 border border-gray-800 rounded-lg p-4 items-center"
                style={{ gridTemplateColumns: `200px repeat(${selectedHives.length}, 1fr)` }}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <span className="text-sm font-semibold text-gray-300">{metric.label}</span>
                </div>
                {selectedHives.map(hive => {
                  const val = hive[metric.key] || 0;
                  const isMax = val === maxVal && maxVal !== minVal;
                  const isMin = val === minVal && maxVal !== minVal;
                  return (
                    <div key={hive.id} className="text-center">
                      <p className={`text-2xl font-bold ${isMax ? 'text-red-400' : isMin ? 'text-emerald-400' : 'text-gray-100'}`}>
                        {typeof val === 'number' ? val.toFixed(1) : val}
                        <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                      </p>
                      {/* Bar */}
                      <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isMax ? 'bg-red-500' : isMin ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${maxVal > 0 ? (val / maxVal) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompareView;
