import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FilterBar = ({ filter, setFilter, searchQuery, setSearchQuery, sortBy, setSortBy, advancedFilters, setAdvancedFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useLanguage();

  const filterButtons = [
    { id: 'all', label: t.filter.all, color: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'critical', label: t.filter.critical, color: 'bg-red-600 hover:bg-red-700' },
    { id: 'warning', label: t.filter.warning, color: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'stable', label: t.filter.stable, color: 'bg-emerald-600 hover:bg-emerald-700' }
  ];

  const sortOptions = [
    { value: 'priority', label: t.filter.sortPriority },
    { value: 'id', label: t.filter.sortId },
    { value: 'temp', label: t.filter.sortTemp },
    { value: 'battery', label: t.filter.sortBattery }
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={t.filter.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          {filterButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === btn.id
                  ? `${btn.color} text-white`
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Sort + Advanced */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              showAdvanced ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {t.filter.all === 'All' ? 'Filter' : 'Filtre'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && setAdvancedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">🌡️ {t.filter.tempRange} (°C)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={advancedFilters?.tempMin || ''}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, tempMin: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-gray-600">—</span>
              <input
                type="number"
                placeholder="Max"
                value={advancedFilters?.tempMax || ''}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, tempMax: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">🔋 {t.filter.batteryRange} (%)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={advancedFilters?.batteryMin || ''}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, batteryMin: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
              <span className="text-gray-600">—</span>
              <input
                type="number"
                placeholder="Max"
                value={advancedFilters?.batteryMax || ''}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, batteryMax: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          {(advancedFilters?.tempMin || advancedFilters?.tempMax || advancedFilters?.batteryMin || advancedFilters?.batteryMax) && (
            <button
              onClick={() => setAdvancedFilters({ tempMin: '', tempMax: '', batteryMin: '', batteryMax: '' })}
              className="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
            >
              {t.filter.all === 'All' ? 'Clear Filters' : 'Filtreleri Temizle'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
