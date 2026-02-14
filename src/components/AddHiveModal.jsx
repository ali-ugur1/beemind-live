import { useState } from 'react';
import { X, Plus, Hexagon } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useLiveData } from '../contexts/LiveDataContext';

const AddHiveModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { addHive } = useLiveData();
  const [form, setForm] = useState({
    id: '',
    location: 'Konya, Selçuklu'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.id.trim()) {
      toast.error('Kovan ID boş olamaz');
      return;
    }

    addHive({
      id: form.id.trim(),
      status: 'stable',
      alertType: null,
      temp: 34.5,
      humidity: 55,
      pressure: 1013,
      vibration: 0.1,
      battery: 100,
      weight: 20.0,
      sound: 35,
      lastUpdate: 'Az önce',
      lastActivity: 'Yeni eklendi',
      priority: 3
    });

    toast.success(`Kovan #${form.id} başarıyla eklendi`);
    setForm({ id: '', location: 'Konya, Selçuklu' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-100">Yeni Kovan Ekle</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Kovan ID *
            </label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm(prev => ({ ...prev, id: e.target.value }))}
              placeholder="Örn: 25"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Konum
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">
              💡 Yeni kovan varsayılan sensör değerleri ile oluşturulur. Sensör verileri ESP32 bağlantısı sonrası otomatik güncellenir.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHiveModal;
