import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

const EditHiveModal = ({ hive, isOpen, onClose, onSave }) => {
  const toast = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    location: '',
    note: '',
  });

  useEffect(() => {
    if (hive) {
      // localStorage'dan kayıtlı bilgileri oku
      try {
        const saved = JSON.parse(localStorage.getItem(`beemind_hive_${hive.id}`) || '{}');
        setFormData({
          location: saved.location || '',
          note: saved.note || '',
        });
      } catch {
        setFormData({ location: '', note: '' });
      }
    }
  }, [hive]);

  const handleSave = () => {
    try {
      localStorage.setItem(`beemind_hive_${hive.id}`, JSON.stringify(formData));
    } catch {}
    toast.success(`${t.common.hive} #${hive.id} ${t.editHive.success}`);
    onSave && onSave(hive.id, formData);
    onClose();
  };

  if (!isOpen || !hive) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h3 className="text-lg font-bold text-gray-100">
            {t.common.edit} — Kovan #{hive.id}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Konum</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Örn: Bahçe Arkalı, Alan-B"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Not</label>
            <textarea
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Bu kovan hakkında notunuz..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {t.common.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHiveModal;
