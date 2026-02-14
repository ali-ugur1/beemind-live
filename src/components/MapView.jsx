import { useState, useMemo, useCallback } from 'react';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { getStatusColor } from '../data/mockData';

const MapView = ({ hives, onViewDetail }) => {
  const [mapType, setMapType] = useState('roadmap');
  const [selectedHive, setSelectedHive] = useState(null);
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState({ lat: 37.8746, lng: 32.4932 });

  const baseLocation = { lat: 37.8746, lng: 32.4932 };

  // Her kovana rastgele ama yakın koordinatlar
  const hiveLocations = useMemo(() => {
    return hives.map((hive, index) => ({
      ...hive,
      lat: baseLocation.lat + (Math.sin(index * 1.7) * 0.004),
      lng: baseLocation.lng + (Math.cos(index * 2.3) * 0.004)
    }));
  }, [hives]);

  // Durum bazlı istatistikler
  const stats = useMemo(() => ({
    critical: hiveLocations.filter(h => h.status === 'critical').length,
    warning: hiveLocations.filter(h => h.status === 'warning').length,
    stable: hiveLocations.filter(h => h.status === 'stable').length
  }), [hiveLocations]);

  // Map embed URL — her map tipi farklı layer
  const getMapUrl = useCallback(() => {
    const bbox = getBbox(center.lat, center.lng, zoom);
    switch (mapType) {
      case 'satellite':
        // ESRI World Imagery
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=cyclemap&marker=${center.lat},${center.lng}`;
      case 'hybrid':
        // Topographic
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=hot&marker=${center.lat},${center.lng}`;
      default:
        // Standard
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;
    }
  }, [center, zoom, mapType]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 19));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 5));
  const handleNavigate = () => setCenter({ lat: baseLocation.lat, lng: baseLocation.lng });

  const handleViewDetail = () => {
    if (selectedHive && onViewDetail) {
      onViewDetail(selectedHive.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">Kovan Haritası</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>Konya, Selçuklu - {hiveLocations.length} kovan</span>
          </div>
        </div>

        {/* Map Type Selector */}
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mapType === 'roadmap' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Harita
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mapType === 'satellite' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-1" />
            Uydu
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mapType === 'hybrid' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Hibrit
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Kritik Kovanlar</p>
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
          </div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Uyarı Durumda</p>
            <p className="text-2xl font-bold text-amber-400">{stats.warning}</p>
          </div>
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Stabil Kovanlar</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.stable}</p>
          </div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        {/* OpenStreetMap Embed */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={getMapUrl()}
          title="Kovan Haritası"
        ></iframe>

        {/* Overlay: Kovan Marker'ları */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            {hiveLocations.map((hive) => {
              const x = ((hive.lng - center.lng + 0.005) / 0.01) * 100;
              const y = ((center.lat - hive.lat + 0.005) / 0.01) * 100;
              const colors = getStatusColor(hive.status);
              const clampedX = Math.max(5, Math.min(95, x));
              const clampedY = Math.max(5, Math.min(95, y));

              return (
                <div
                  key={hive.id}
                  className="absolute pointer-events-auto cursor-pointer group"
                  style={{ left: `${clampedX}%`, top: `${clampedY}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={() => setSelectedHive(hive)}
                >
                  <div className={`w-4 h-4 rounded-full ${colors.badge} border-2 border-white/50 shadow-lg ${
                    hive.status === 'critical' ? 'animate-pulse' : ''
                  }`} />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    #{hive.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            title="Yakınlaştır"
          >
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            title="Uzaklaştır"
          >
            <ZoomOut className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={handleNavigate}
            className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            title="Merkeze Dön"
          >
            <Navigation className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Selected Hive Info */}
        {selectedHive && (
          <div className="absolute top-4 left-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl max-w-xs pointer-events-auto">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-lg font-bold text-amber-400">Kovan #{selectedHive.id}</h4>
                <p className={`text-sm font-semibold ${getStatusColor(selectedHive.status).text}`}>
                  {selectedHive.status === 'critical' ? 'KRİTİK' : selectedHive.status === 'warning' ? 'UYARI' : 'STABİL'}
                </p>
              </div>
              <button
                onClick={() => setSelectedHive(null)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <span className="text-gray-400">✕</span>
              </button>
            </div>
            {selectedHive.alertType && (
              <p className="text-sm text-gray-400 mb-2">{selectedHive.alertType}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Sıcaklık:</span>
                <p className="text-gray-300 font-semibold">{selectedHive.temp}°C</p>
              </div>
              <div>
                <span className="text-gray-500">Nem:</span>
                <p className="text-gray-300 font-semibold">{selectedHive.humidity}%</p>
              </div>
              <div>
                <span className="text-gray-500">Pil:</span>
                <p className="text-gray-300 font-semibold">{selectedHive.battery}%</p>
              </div>
              <div>
                <span className="text-gray-500">Ses:</span>
                <p className="text-gray-300 font-semibold">{selectedHive.sound}dB</p>
              </div>
            </div>
            <button
              onClick={handleViewDetail}
              className="w-full mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              Detayları Gör
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">Gösterim</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Kritik Durum</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Uyarı Durumu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Stabil</span>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-400">
          💡 <strong>Not:</strong> Harita görünümünde kovanlarınızın konumlarını görebilir ve durumlarını takip edebilirsiniz.
          Kovan işaretçilerine tıklayarak detayları görüntüleyebilirsiniz.
        </p>
      </div>
    </div>
  );
};

// Zoom seviyesine göre bbox hesaplama
function getBbox(lat, lng, zoom) {
  const scale = 360 / Math.pow(2, zoom);
  const lonMin = lng - scale / 2;
  const lonMax = lng + scale / 2;
  const latMin = lat - scale / 4;
  const latMax = lat + scale / 4;
  return `${lonMin},${latMin},${lonMax},${latMax}`;
}

export default MapView;
