import { useState, useCallback, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const FilterBar = ({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  advancedFilters,
  setAdvancedFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t, lang } = useLanguage();

  const filterButtons = useMemo(
    () => [
      {
        id: "all",
        label: t.filter.all,
        color: "bg-amber-500 hover:bg-amber-600",
      },
      {
        id: "critical",
        label: t.filter.critical,
        color: "bg-red-600 hover:bg-red-700",
      },
      {
        id: "warning",
        label: t.filter.warning,
        color: "bg-amber-500 hover:bg-amber-600",
      },
      {
        id: "stable",
        label: t.filter.stable,
        color: "bg-emerald-600 hover:bg-emerald-700",
      },
    ],
    [t],
  );

  const sortOptions = useMemo(
    () => [
      { value: "priority", label: t.filter.sortPriority },
      { value: "id", label: t.filter.sortId },
      { value: "temp", label: t.filter.sortTemp },
      { value: "battery", label: t.filter.sortBattery },
    ],
    [t],
  );

  // Check if any advanced filter is active
  const hasActiveFilters = useMemo(() => {
    if (!advancedFilters) return false;
    return Boolean(
      advancedFilters.tempMin ||
      advancedFilters.tempMax ||
      advancedFilters.batteryMin ||
      advancedFilters.batteryMax,
    );
  }, [advancedFilters]);

  const handleAdvancedFilterChange = useCallback(
    (key, value) => {
      setAdvancedFilters?.((prev) => ({ ...prev, [key]: value }));
    },
    [setAdvancedFilters],
  );

  const handleClearFilters = useCallback(() => {
    setAdvancedFilters?.({
      tempMin: "",
      tempMax: "",
      batteryMin: "",
      batteryMax: "",
    });
  }, [setAdvancedFilters]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced((prev) => !prev);
  }, []);

  const inputBaseClass =
    "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={t.filter.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            aria-label={t.filter.searchPlaceholder}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label={lang === "tr" ? "Aramayı temizle" : "Clear search"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div
          className="flex flex-wrap gap-2 sm:gap-3"
          role="group"
          aria-label={lang === "tr" ? "Durum filtreleri" : "Status filters"}
        >
          {filterButtons.map((btn) => {
            const isActive = filter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                aria-pressed={isActive}
                className={`px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                  isActive
                    ? `${btn.color} text-white shadow-lg`
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Sort + Advanced */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal
            className="w-5 h-5 text-gray-500 shrink-0"
            aria-hidden="true"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-colors cursor-pointer"
            aria-label={lang === "tr" ? "Sıralama" : "Sort by"}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleAdvanced}
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters-panel"
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
              showAdvanced || hasActiveFilters
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 border border-transparent"
            }`}
          >
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {lang === "tr" ? "Filtre" : "Filter"}
            {hasActiveFilters && (
              <span
                className="ml-1 w-2 h-2 bg-amber-400 rounded-full"
                aria-label={
                  lang === "tr" ? "Aktif filtre var" : "Active filters"
                }
              />
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && setAdvancedFilters && (
        <div
          id="advanced-filters-panel"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800"
        >
          <div>
            <label
              htmlFor="temp-min"
              className="block text-xs font-medium text-gray-500 mb-2"
            >
              🌡️ {t.filter.tempRange} (°C)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="temp-min"
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={advancedFilters?.tempMin ?? ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("tempMin", e.target.value)
                }
                className={inputBaseClass}
                aria-label={`${t.filter.tempRange} Min`}
              />
              <span className="text-gray-600" aria-hidden="true">
                —
              </span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={advancedFilters?.tempMax ?? ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("tempMax", e.target.value)
                }
                className={inputBaseClass}
                aria-label={`${t.filter.tempRange} Max`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="battery-min"
              className="block text-xs font-medium text-gray-500 mb-2"
            >
              🔋 {t.filter.batteryRange} (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="battery-min"
                type="number"
                inputMode="numeric"
                min="0"
                max="100"
                placeholder="Min"
                value={advancedFilters?.batteryMin ?? ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("batteryMin", e.target.value)
                }
                className={inputBaseClass}
                aria-label={`${t.filter.batteryRange} Min`}
              />
              <span className="text-gray-600" aria-hidden="true">
                —
              </span>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="100"
                placeholder="Max"
                value={advancedFilters?.batteryMax ?? ""}
                onChange={(e) =>
                  handleAdvancedFilterChange("batteryMax", e.target.value)
                }
                className={inputBaseClass}
                aria-label={`${t.filter.batteryRange} Max`}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="sm:col-span-2 justify-self-start flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded px-1"
            >
              <X className="w-3 h-3" />
              {lang === "tr" ? "Filtreleri Temizle" : "Clear Filters"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
