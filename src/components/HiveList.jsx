import React, { useState } from 'react';
import { Eye, Sparkles, Trash2 } from 'lucide-react';
import { getStatusColor, getStatusText } from '../data/mockData';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

const HiveList = ({ hives, selectedHives, onSelectHive, onSelectAll, onViewDetail, onAIAnalysis }) => {
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, hiveId: null });
  const toast = useToast();
  const allSelected = hives.length > 0 && selectedHives.length === hives.length;

  const handleDelete = (hiveId) => {
    setDeleteConfirm({ isOpen: true, hiveId });
  };

  const confirmDelete = () => {
    // Burada API çağrısı yapılabilir
    console.log('Kovan siliniyor:', deleteConfirm.hiveId);
    toast.success(`Kovan #${deleteConfirm.hiveId} silindi`);
  };

  if (hives.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <EmptyState
          type="noResults"
          title="Kovan Bulunamadı"
          description="Arama kriterlerinize uygun kovan bulunamadı. Filtreleri değiştirmeyi deneyin."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              aria-label="Tümünü seç"
            />
          </div>
          <div className="col-span-1">Durum</div>
          <div className="col-span-1">ID</div>
          <div className="col-span-5">Sorun / Durum</div>
          <div className="col-span-1">Pil</div>
          <div className="col-span-3 text-right">Aksiyon</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-800">
          {hives.map(hive => (
            <HiveRow
              key={hive.id}
              hive={hive}
              isSelected={selectedHives.includes(hive.id)}
              onSelect={onSelectHive}
              onView={onViewDetail}
              onDelete={handleDelete}
              onAI={onAIAnalysis}
            />
          ))}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, hiveId: null })}
        onConfirm={confirmDelete}
        title="Kovanı Sil"
        message={`Kovan #${deleteConfirm.hiveId}'i silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        type="danger"
      />
    </>
  );
};

// Memoize edilen satır komponenti - Gereksiz re-render önlenir
const HiveRow = React.memo(({ hive, isSelected, onSelect, onView, onDelete, onAI }) => {
  const colors = getStatusColor(hive.status);
  const isCritical = hive.status === 'critical';
  const isStable = hive.status === 'stable';

  return (
    <div
      className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-800 transition-colors ${
        isCritical ? 'animate-pulse' : ''
      } ${
        isSelected ? 'bg-amber-500/10' : ''
      }`}
    >
      {/* Checkbox */}
      <div className="col-span-1 flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(hive.id)}
          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
          aria-label={`Kovan #${hive.id} seç`}
        />
      </div>

      {/* Status Badge */}
      <div className="col-span-1 flex items-center">
        <span 
          className={`w-3 h-3 rounded-full ${colors.badge}`}
          title={getStatusText(hive.status)}
        />
      </div>

      {/* Kovan ID */}
      <div className="col-span-1 flex items-center">
        <span className="font-mono text-lg font-semibold text-amber-400">
          #{hive.id}
        </span>
      </div>

      {/* Alert / Status - SADELEŞTİRİLMİŞ */}
      <div className="col-span-5 flex items-center">
        {isStable ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-emerald-500 font-medium">Stabil</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg">{isCritical ? '🔴' : '⚠️'}</span>
            <span className={`font-medium ${colors.text}`}>
              {hive.alertType}
            </span>
          </div>
        )}
      </div>

      {/* Battery */}
      <div className="col-span-1 flex items-center">
        <span className={`text-sm font-medium ${hive.battery < 20 ? 'text-red-400' : 'text-gray-400'}`}>
          {hive.battery}%
        </span>
      </div>

      {/* Action Buttons */}
      <div className="col-span-3 flex items-center justify-end gap-2">
        <button
          onClick={() => onView(hive.id)}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            isCritical
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : hive.status === 'warning'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
          aria-label={`Kovan #${hive.id} detayını görüntüle`}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          İNCELE
        </button>

        <button 
          onClick={() => onAI(hive.id)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg font-medium text-sm transition-all"
          aria-label={`Kovan #${hive.id} AI analizi`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          AI
        </button>
      </div>
    </div>
  );
});

HiveRow.displayName = 'HiveRow';

export default React.memo(HiveList);
