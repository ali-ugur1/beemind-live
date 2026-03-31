import React, { useState } from 'react';
import { Eye, Sparkles, Trash2, Pencil } from 'lucide-react';
import { getStatusColor, getStatusText } from '../data/mockData';
import EmptyState from './EmptyState';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

const HiveList = ({ hives, selectedHives, onSelectHive, onSelectAll, onViewDetail, onAIAnalysis, onEditHive }) => {
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, hiveId: null });
  const toast = useToast();
  const { deleteHive } = useLiveData();
  const { lang } = useLanguage();
  const allSelected = hives.length > 0 && selectedHives.length === hives.length;

  const handleDelete = (hiveId) => {
    setDeleteConfirm({ isOpen: true, hiveId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.hiveId) {
      deleteHive(deleteConfirm.hiveId);
      toast.success(lang === 'tr' ? `Kovan #${deleteConfirm.hiveId} silindi` : `Hive #${deleteConfirm.hiveId} deleted`);
    }
  };

  if (hives.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <EmptyState
          type="noResults"
          title={lang === 'tr' ? 'Kovan Bulunamadı' : 'No Hives Found'}
          description={lang === 'tr' ? 'Arama kriterlerinize uygun kovan bulunamadı. Filtreleri değiştirmeyi deneyin.' : 'No hives match your search criteria. Try changing the filters.'}
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              aria-label={lang === 'tr' ? 'Tümünü seç' : 'Select all'}
            />
          </div>
          <div className="col-span-1">{lang === 'tr' ? 'Durum' : 'Status'}</div>
          <div className="col-span-1">ID</div>
          <div className="col-span-5">{lang === 'tr' ? 'Sorun / Durum' : 'Issue / Status'}</div>
          <div className="col-span-1">{lang === 'tr' ? 'Pil' : 'Battery'}</div>
          <div className="col-span-3 text-right">{lang === 'tr' ? 'Aksiyon' : 'Action'}</div>
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
              onEdit={onEditHive}
              lang={lang}
            />
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {/* Select All */}
        <div className="flex items-center gap-3 px-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
          />
          <span className="text-xs text-gray-500 uppercase">{lang === 'tr' ? 'Tümünü Seç' : 'Select All'}</span>
        </div>

        {hives.map(hive => (
          <MobileHiveCard
            key={hive.id}
            hive={hive}
            isSelected={selectedHives.includes(hive.id)}
            onSelect={onSelectHive}
            onView={onViewDetail}
            onDelete={handleDelete}
            onAI={onAIAnalysis}
            onEdit={onEditHive}
            lang={lang}
          />
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, hiveId: null })}
        onConfirm={confirmDelete}
        title={lang === 'tr' ? 'Kovanı Sil' : 'Delete Hive'}
        message={lang === 'tr' ? `Kovan #${deleteConfirm.hiveId}'i silmek istediğinize emin misiniz? Bu işlem geri alınamaz.` : `Are you sure you want to delete Hive #${deleteConfirm.hiveId}? This action cannot be undone.`}
        confirmText={lang === 'tr' ? 'Sil' : 'Delete'}
        type="danger"
      />
    </>
  );
};

// Desktop Row
const HiveRow = React.memo(({ hive, isSelected, onSelect, onView, onDelete, onAI, onEdit, lang }) => {
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
      <div className="col-span-1 flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(hive.id)}
          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
          aria-label={lang === 'tr' ? `Kovan #${hive.id} seç` : `Select Hive #${hive.id}`}
        />
      </div>
      <div className="col-span-1 flex items-center">
        <span className={`w-3 h-3 rounded-full ${colors.badge}`} title={getStatusText(hive.status, lang)} />
      </div>
      <div className="col-span-1 flex items-center">
        <div>
          <span className="font-mono text-lg font-semibold text-amber-400">{hive.name || hive.id}</span>
          {hive.location && <p className="text-xs text-gray-600 truncate">{hive.location}</p>}
        </div>
      </div>
      <div className="col-span-5 flex items-center">
        {isStable ? (
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-emerald-500 font-medium">{lang === 'tr' ? 'Stabil' : 'Stable'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-lg">{isCritical ? '🔴' : '⚠️'}</span>
            <span className={`font-medium ${colors.text}`}>{hive.alertType}</span>
          </div>
        )}
      </div>
      <div className="col-span-1 flex items-center">
        <span className={`text-sm font-medium ${hive.battery < 20 ? 'text-red-400' : 'text-gray-400'}`}>
          {hive.battery}%
        </span>
      </div>
      <div className="col-span-3 flex items-center justify-end gap-2">
        <button onClick={() => onView(hive.id)} className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${isCritical ? 'bg-red-600 hover:bg-red-700 text-white' : hive.status === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`} aria-label={lang === 'tr' ? `Kovan #${hive.id} detayını görüntüle` : `View Hive #${hive.id} details`}>
          <Eye className="w-4 h-4 inline mr-1" />{lang === 'tr' ? 'İNCELE' : 'VIEW'}
        </button>
        <button onClick={() => onAI(hive.id)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg font-medium text-sm transition-all" aria-label={lang === 'tr' ? `Kovan #${hive.id} AI analizi` : `AI analysis for Hive #${hive.id}`}>
          <Sparkles className="w-4 h-4 inline mr-1" />AI
        </button>
        {onEdit && <button onClick={() => onEdit(hive)} className="px-2 py-2 bg-gray-800 hover:bg-blue-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all" aria-label={lang === 'tr' ? `Kovan #${hive.id} düzenle` : `Edit Hive #${hive.id}`}>
          <Pencil className="w-4 h-4" />
        </button>}
        <button onClick={() => onDelete(hive.id)} className="px-2 py-2 bg-gray-800 hover:bg-red-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all" aria-label={lang === 'tr' ? `Kovan #${hive.id} sil` : `Delete Hive #${hive.id}`}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

// Mobile Card
const MobileHiveCard = React.memo(({ hive, isSelected, onSelect, onView, onDelete, onAI, onEdit, lang }) => {
  const colors = getStatusColor(hive.status);
  const isCritical = hive.status === 'critical';
  const isStable = hive.status === 'stable';

  return (
    <div className={`bg-gray-900 border rounded-lg p-4 ${isSelected ? 'border-amber-500/50 bg-amber-500/5' : 'border-gray-800'} ${isCritical ? 'animate-pulse' : ''}`}>
      {/* Top row: checkbox + ID + status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(hive.id)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
          />
          <span className="font-mono text-lg font-bold text-amber-400">{hive.name || hive.id}</span>
          <span className={`w-3 h-3 rounded-full ${colors.badge}`} />
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isCritical ? 'bg-red-500/20 text-red-400' 
          : hive.status === 'warning' ? 'bg-amber-500/20 text-amber-400' 
          : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          {getStatusText(hive.status, lang)}
        </span>
      </div>

      {/* Alert message */}
      <div className="mb-3">
        {isStable ? (
          <p className="text-sm text-emerald-400">✅ {lang === 'tr' ? 'Stabil durumda' : 'Stable'}</p>
        ) : (
          <p className={`text-sm font-medium ${colors.text}`}>
            {isCritical ? '🔴' : '⚠️'} {hive.alertType}
          </p>
        )}
      </div>

      {/* Stats row — adaptör tipine göre */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-center">
        <div className="bg-gray-800 rounded p-2">
          <p className="text-xs text-gray-500">{lang === 'tr' ? 'Sıcaklık' : 'Temp'}</p>
          <p className="text-sm font-semibold text-gray-200">{hive.temp}°C</p>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <p className="text-xs text-gray-500">{lang === 'tr' ? 'Nem' : 'Hum'}</p>
          <p className="text-sm font-semibold text-gray-200">{hive.humidity}%</p>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <p className="text-xs text-gray-500">{lang === 'tr' ? 'Ağırlık' : 'Weight'}</p>
          <p className="text-sm font-semibold text-gray-200">{hive.weight ?? 0}kg</p>
        </div>
        <div className="bg-gray-800 rounded p-2">
          <p className="text-xs text-gray-500">{lang === 'tr' ? 'Pil' : 'Bat'}</p>
          <p className={`text-sm font-semibold ${hive.battery < 20 ? 'text-red-400' : 'text-gray-200'}`}>{hive.battery}%</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button onClick={() => onView(hive.id)} className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all text-center ${isCritical ? 'bg-red-600 hover:bg-red-700 text-white' : hive.status === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
          <Eye className="w-4 h-4 inline mr-1" />{lang === 'tr' ? 'İNCELE' : 'VIEW'}
        </button>
        <button onClick={() => onAI(hive.id)} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg font-medium text-sm transition-all">
          <Sparkles className="w-4 h-4" />
        </button>
        {onEdit && <button onClick={() => onEdit(hive)} className="px-3 py-2 bg-gray-800 hover:bg-blue-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all">
          <Pencil className="w-4 h-4" />
        </button>}
        <button onClick={() => onDelete(hive.id)} className="px-3 py-2 bg-gray-800 hover:bg-red-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

HiveRow.displayName = 'HiveRow';
MobileHiveCard.displayName = 'MobileHiveCard';

export default React.memo(HiveList);
