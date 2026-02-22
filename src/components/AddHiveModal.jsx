import { useState } from 'react';
import { X, Plus, Hexagon, Cpu, Wifi, MapPin } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useLiveData } from '../contexts/LiveDataContext';
import { useLanguage } from '../contexts/LanguageContext';

const AddHiveModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { addHive, hives } = useLiveData();
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    deviceSerial: '',
    location: 'Konya, Selcuklu',
    lat: '37.8746',
    lng: '32.4932'
  });
  const [serialError, setSerialError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSerialError('');

    if (!form.name.trim()) {
      toast.error(t.addHive.nameEmpty);
      return;
    }

    if (!form.deviceSerial.trim()) {
      toast.error(t.addHive.serialEmpty);
      return;
    }

    // Duplicate seri numarasi kontrolu
    if (hives.some(h => h.deviceSerial === form.deviceSerial.trim())) {
      setSerialError(t.addHive.serialDuplicate);
      toast.error(t.addHive.serialDuplicate);
      return;
    }

    // Duplicate isim kontrolu
    if (hives.some(h => h.name === form.name.trim())) {
      toast.error(t.addHive.nameDuplicate);
      return;
    }

    // Koordinat dogrulama
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error(lang === 'tr' ? 'Gecersiz koordinat degerleri' : 'Invalid coordinate values');
      return;
    }

    // Yeni kovan ID'si olustur
    const maxId = hives.reduce((max, h) => {
      const num = parseInt(h.id, 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const newId = String(maxId + 1).padStart(2, '0');

    addHive({
      id: newId,
      name: form.name.trim(),
      deviceSerial: form.deviceSerial.trim(),
      location: form.location.trim(),
      lat,
      lng,
      status: 'stable',
      alertType: null,
      temp: 0,
      humidity: 0,
      battery: 100,
      weight: 0,
      sound: 0,
      lastUpdate: lang === 'tr' ? 'Az once' : 'Just now',
      lastActivity: lang === 'tr' ? 'Cihaz baglantisi bekleniyor' : 'Waiting for device connection',
      priority: 3
    });

    toast.success(`${form.name} ${t.addHive.success}`);
    setForm({ name: '', deviceSerial: '', location: 'Konya, Selcuklu', lat: '37.8746', lng: '32.4932' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-100">{t.addHive.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Kovan Adi */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {t.addHive.hiveName} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t.addHive.hiveNamePlaceholder}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Cihaz Seri Numarasi */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              {t.addHive.deviceSerial} *
            </label>
            <input
              type="text"
              value={form.deviceSerial}
              onChange={(e) => {
                setSerialError('');
                setForm(prev => ({ ...prev, deviceSerial: e.target.value }));
              }}
              placeholder={t.addHive.deviceSerialPlaceholder}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none transition-colors font-mono text-sm ${
                serialError ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-amber-500'
              }`}
            />
            {serialError && (
              <p className="text-xs text-red-400 mt-1">{serialError}</p>
            )}
            <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              {t.addHive.serialHint}
            </p>
          </div>

          {/* Konum */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {t.addHive.location}
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder={lang === 'tr' ? 'Ornek: Konya, Selcuklu' : 'e.g. Konya, Selcuklu'}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Koordinatlar */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {lang === 'tr' ? 'GPS Koordinatlari' : 'GPS Coordinates'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {lang === 'tr' ? 'Enlem (Lat)' : 'Latitude'}
                </label>
                <input
                  type="text"
                  value={form.lat}
                  onChange={(e) => setForm(prev => ({ ...prev, lat: e.target.value }))}
                  placeholder="37.8746"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {lang === 'tr' ? 'Boylam (Lng)' : 'Longitude'}
                </label>
                <input
                  type="text"
                  value={form.lng}
                  onChange={(e) => setForm(prev => ({ ...prev, lng: e.target.value }))}
                  placeholder="32.4932"
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              {lang === 'tr'
                ? 'Google Maps\'ten kovan konumunuzun koordinatlarini alabilirsiniz'
                : 'You can get coordinates from Google Maps for your hive location'}
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-gray-400">
              {t.addHive.tip}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t.addHive.add}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHiveModal;
