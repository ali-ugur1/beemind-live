import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Sparkles, Trash2, Pencil } from "lucide-react";
import { getStatusColor, getStatusText } from "../data/mockData";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "../contexts/ToastContext";
import { useLiveData } from "../contexts/LiveDataContext";
import { useLanguage } from "../contexts/LanguageContext";

const LOW_BATTERY_THRESHOLD = 20;
const MAX_STAGGER_DELAY = 0.4; // büyük listelerde son kart 400ms'den geç gelmesin

const HiveList = ({
  hives,
  selectedHives,
  onSelectHive,
  onSelectAll,
  onViewDetail,
  onAIAnalysis,
  onEditHive,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    hive: null,
  });
  const toast = useToast();
  const { deleteHive } = useLiveData();
  const { lang } = useLanguage();

  const isTR = lang === "tr";
  const allSelected = hives.length > 0 && selectedHives.length === hives.length;

  const handleDelete = useCallback((hive) => {
    setDeleteConfirm({ isOpen: true, hive });
  }, []);

  const closeConfirm = useCallback(() => {
    setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const confirmDelete = useCallback(() => {
    const hive = deleteConfirm.hive;
    if (!hive) return;
    deleteHive(hive.id);
    const label = hive.name || `#${hive.id}`;
    toast.success(isTR ? `Kovan ${label} silindi` : `Hive ${label} deleted`);
  }, [deleteConfirm.hive, deleteHive, toast, isTR]);

  if (hives.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <EmptyState
          type="noResults"
          title={isTR ? "Kovan Bulunamadı" : "No Hives Found"}
          description={
            isTR
              ? "Arama kriterlerinize uygun kovan bulunamadı. Filtreleri değiştirmeyi deneyin."
              : "No hives match your search criteria. Try changing the filters."
          }
        />
      </div>
    );
  }

  const confirmLabel = deleteConfirm.hive
    ? deleteConfirm.hive.name || `#${deleteConfirm.hive.id}`
    : "";

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Header: 1 + 1 + 2 + 4 + 1 + 3 = 12 */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-800 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              aria-label={isTR ? "Tümünü seç" : "Select all"}
            />
          </div>
          <div className="col-span-1">{isTR ? "Durum" : "Status"}</div>
          <div className="col-span-2">ID</div>
          <div className="col-span-4">
            {isTR ? "Sorun / Durum" : "Issue / Status"}
          </div>
          <div className="col-span-1">{isTR ? "Pil" : "Battery"}</div>
          <div className="col-span-3 text-right">
            {isTR ? "Aksiyon" : "Action"}
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          <AnimatePresence initial={false}>
            {hives.map((hive, i) => (
              <HiveRow
                key={hive.id}
                hive={hive}
                index={i}
                isSelected={selectedHives.includes(hive.id)}
                onSelect={onSelectHive}
                onView={onViewDetail}
                onDelete={handleDelete}
                onAI={onAIAnalysis}
                onEdit={onEditHive}
                isTR={isTR}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-3 px-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            aria-label={isTR ? "Tümünü seç" : "Select all"}
          />
          <span className="text-xs text-gray-500 uppercase">
            {isTR ? "Tümünü Seç" : "Select All"}
          </span>
        </div>

        <AnimatePresence initial={false}>
          {hives.map((hive, i) => (
            <MobileHiveCard
              key={hive.id}
              hive={hive}
              index={i}
              isSelected={selectedHives.includes(hive.id)}
              onSelect={onSelectHive}
              onView={onViewDetail}
              onDelete={handleDelete}
              onAI={onAIAnalysis}
              onEdit={onEditHive}
              isTR={isTR}
            />
          ))}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        title={isTR ? "Kovanı Sil" : "Delete Hive"}
        message={
          isTR
            ? `Kovan ${confirmLabel}'i silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : `Are you sure you want to delete Hive ${confirmLabel}? This action cannot be undone.`
        }
        confirmText={isTR ? "Sil" : "Delete"}
        type="danger"
      />
    </>
  );
};

/* ---------- Desktop Row ---------- */

const HiveRow = React.memo(
  ({
    hive,
    index,
    isSelected,
    onSelect,
    onView,
    onDelete,
    onAI,
    onEdit,
    isTR,
  }) => {
    const colors = getStatusColor(hive.status);
    const isCritical = hive.status === "critical";
    const isWarning = hive.status === "warning";
    const isStable = hive.status === "stable";
    const lowBattery = hive.battery < LOW_BATTERY_THRESHOLD;
    const statusLabel = getStatusText(hive.status, isTR ? "tr" : "en");

    const delay = Math.min(index * 0.03, MAX_STAGGER_DELAY);

    const viewBtnClass = isCritical
      ? "bg-red-600 hover:bg-red-700 text-white"
      : isWarning
        ? "bg-amber-500 hover:bg-amber-600 text-white"
        : "bg-gray-700 hover:bg-gray-600 text-gray-300";

    return (
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12, transition: { duration: 0.18 } }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay }}
        layout
        className={`grid grid-cols-12 gap-4 px-6 py-5 transition-colors ${
          isSelected
            ? "bg-amber-500/10 hover:bg-amber-500/15"
            : "hover:bg-gray-800/60"
        } ${isCritical ? "ring-1 ring-inset ring-red-500/30" : ""}`}
      >
        <div className="col-span-1 flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(hive.id)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            aria-label={
              isTR ? `Kovan #${hive.id} seç` : `Select Hive #${hive.id}`
            }
          />
        </div>

        <div className="col-span-1 flex items-center">
          <span
            role="img"
            aria-label={statusLabel}
            title={statusLabel}
            className={`w-3 h-3 rounded-full ${colors.badge} ${isCritical ? "animate-pulse" : ""}`}
          />
        </div>

        <div className="col-span-2 flex items-center min-w-0">
          <div className="min-w-0">
            <span className="font-mono text-base font-semibold text-amber-400 block truncate">
              {hive.name || `#${hive.id}`}
            </span>
            {hive.name && (
              <span className="text-xs text-gray-600 font-mono">
                #{hive.id}
              </span>
            )}
            {hive.location && (
              <p className="text-xs text-gray-600 truncate">{hive.location}</p>
            )}
          </div>
        </div>

        <div className="col-span-4 flex items-center min-w-0">
          {isStable ? (
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-lg">
                ✅
              </span>
              <span className="text-emerald-500 font-medium">
                {isTR ? "Stabil" : "Stable"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className="text-lg shrink-0">
                {isCritical ? "🔴" : "⚠️"}
              </span>
              <span className={`font-medium truncate ${colors.text}`}>
                {hive.alertType}
              </span>
            </div>
          )}
        </div>

        <div className="col-span-1 flex items-center">
          <span
            className={`text-sm font-medium ${lowBattery ? "text-red-400" : "text-gray-400"}`}
          >
            {hive.battery}%
          </span>
        </div>

        <div className="col-span-3 flex items-center justify-end gap-2">
          <button
            onClick={() => onView(hive.id)}
            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${viewBtnClass}`}
            aria-label={
              isTR
                ? `Kovan #${hive.id} detayını görüntüle`
                : `View Hive #${hive.id} details`
            }
          >
            <Eye className="w-4 h-4 inline mr-1" />
            {isTR ? "İNCELE" : "VIEW"}
          </button>
          <button
            onClick={() => onAI(hive.id)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg font-medium text-sm transition-all"
            aria-label={
              isTR
                ? `Kovan #${hive.id} AI analizi`
                : `AI analysis for Hive #${hive.id}`
            }
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            AI
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(hive)}
              className="px-2 py-2 bg-gray-800 hover:bg-blue-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all"
              aria-label={
                isTR ? `Kovan #${hive.id} düzenle` : `Edit Hive #${hive.id}`
              }
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(hive)}
            className="px-2 py-2 bg-gray-800 hover:bg-red-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all"
            aria-label={
              isTR ? `Kovan #${hive.id} sil` : `Delete Hive #${hive.id}`
            }
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  },
);
HiveRow.displayName = "HiveRow";

/* ---------- Mobile Card ---------- */

const MobileHiveCard = React.memo(
  ({
    hive,
    index,
    isSelected,
    onSelect,
    onView,
    onDelete,
    onAI,
    onEdit,
    isTR,
  }) => {
    const colors = getStatusColor(hive.status);
    const isCritical = hive.status === "critical";
    const isWarning = hive.status === "warning";
    const isStable = hive.status === "stable";
    const lowBattery = hive.battery < LOW_BATTERY_THRESHOLD;
    const statusLabel = getStatusText(hive.status, isTR ? "tr" : "en");

    const delay = Math.min(index * 0.04, MAX_STAGGER_DELAY);

    const statusBadgeClass = isCritical
      ? "bg-red-500/20 text-red-400"
      : isWarning
        ? "bg-amber-500/20 text-amber-400"
        : "bg-emerald-500/20 text-emerald-400";

    const viewBtnClass = isCritical
      ? "bg-red-600 hover:bg-red-700 text-white"
      : isWarning
        ? "bg-amber-500 hover:bg-amber-600 text-white"
        : "bg-gray-700 hover:bg-gray-600 text-gray-300";

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
        transition={{ delay, type: "spring", stiffness: 280, damping: 26 }}
        layout
        className={`bg-gray-900 border rounded-lg p-4 ${
          isSelected ? "border-amber-500/50 bg-amber-500/5" : "border-gray-800"
        } ${isCritical ? "ring-1 ring-inset ring-red-500/30" : ""}`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(hive.id)}
              className="w-4 h-4 shrink-0 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              aria-label={
                isTR ? `Kovan #${hive.id} seç` : `Select Hive #${hive.id}`
              }
            />
            <span
              className={`w-3 h-3 shrink-0 rounded-full ${colors.badge} ${
                isCritical ? "animate-pulse" : ""
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <span className="font-mono text-lg font-bold text-amber-400 block truncate">
                {hive.name || `#${hive.id}`}
              </span>
              {hive.name && (
                <span className="text-[10px] text-gray-600 font-mono">
                  #{hive.id}
                </span>
              )}
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusBadgeClass}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Alert */}
        <div className="mb-3">
          {isStable ? (
            <p className="text-sm text-emerald-400">
              <span aria-hidden="true">✅</span>{" "}
              {isTR ? "Stabil durumda" : "Stable"}
            </p>
          ) : (
            <p className={`text-sm font-medium ${colors.text}`}>
              <span aria-hidden="true">{isCritical ? "🔴" : "⚠️"}</span>{" "}
              {hive.alertType}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-center">
          <Stat label={isTR ? "Sıcaklık" : "Temp"} value={`${hive.temp}°C`} />
          <Stat label={isTR ? "Nem" : "Hum"} value={`${hive.humidity}%`} />
          <Stat
            label={isTR ? "Ağırlık" : "Weight"}
            value={`${hive.weight ?? 0}kg`}
          />
          <Stat
            label={isTR ? "Pil" : "Bat"}
            value={`${hive.battery}%`}
            valueClass={lowBattery ? "text-red-400" : "text-gray-200"}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(hive.id)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all text-center ${viewBtnClass}`}
            aria-label={
              isTR
                ? `Kovan #${hive.id} detayını görüntüle`
                : `View Hive #${hive.id} details`
            }
          >
            <Eye className="w-4 h-4 inline mr-1" />
            {isTR ? "İNCELE" : "VIEW"}
          </button>
          <button
            onClick={() => onAI(hive.id)}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg font-medium text-sm transition-all"
            aria-label={
              isTR
                ? `Kovan #${hive.id} AI analizi`
                : `AI analysis for Hive #${hive.id}`
            }
          >
            <Sparkles className="w-4 h-4" />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(hive)}
              className="px-3 py-2 bg-gray-800 hover:bg-blue-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all"
              aria-label={
                isTR ? `Kovan #${hive.id} düzenle` : `Edit Hive #${hive.id}`
              }
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(hive)}
            className="px-3 py-2 bg-gray-800 hover:bg-red-600 text-gray-500 hover:text-white rounded-lg text-sm transition-all"
            aria-label={
              isTR ? `Kovan #${hive.id} sil` : `Delete Hive #${hive.id}`
            }
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  },
);
MobileHiveCard.displayName = "MobileHiveCard";

/* ---------- Stat helper ---------- */

const Stat = React.memo(({ label, value, valueClass = "text-gray-200" }) => (
  <div className="bg-gray-800 rounded p-2">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
  </div>
));
Stat.displayName = "Stat";

export default React.memo(HiveList);
