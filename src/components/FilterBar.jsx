import { Search, SlidersHorizontal } from 'lucide-react';

const FilterBar = ({ filter, setFilter, searchQuery, setSearchQuery, sortBy, setSortBy }) => {
  const filterButtons = [
    { id: 'all', label: 'Tümü', color: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'critical', label: 'Kritik', color: 'bg-red-600 hover:bg-red-700' },
    { id: 'warning', label: 'Uyarı', color: 'bg-amber-500 hover:bg-amber-600' },
    { id: 'stable', label: 'Stabil', color: 'bg-emerald-600 hover:bg-emerald-700' }
  ];

  const sortOptions = [
    { value: 'priority', label: 'En Kritik En Üstte' },
    { value: 'id', label: 'Kovan ID' },
    { value: 'temp', label: 'Sıcaklık (Yüksek → Düşük)' },
    { value: 'battery', label: 'Pil (Düşük → Yüksek)' }
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Sol: Arama */}
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="🔍 Kovan Ara (ID)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Orta: Filtre Butonları */}
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

        {/* Sağ: Sıralama */}
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
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
