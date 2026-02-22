import { useState, useMemo, useCallback } from 'react';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Thermometer, Droplets, Battery, Volume2 } from 'lucide-react';
import { getStatusColor } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';

const MapView = ({ hives, onViewDetail }) => {
  const { lang } = useLanguage();
  const [mapType, setMapType] = useState('roadmap');
  const [selectedHive, setSelectedHive] = useState(null);
  const [zoom, setZoom] = useState(13);

  // Kovan koordinatlarindan merkez hesapla
  const center = useMemo(() => {
    const validHives = hives.filter(h => h.lat && h.lng);
    if (validHives.length === 0) return { lat: 37.8746, lng: 32.4932 };
    const avgLat = validHives.reduce((s, h) => s + h.lat, 0) / validHives.length;
    const avgLng = validHives.reduce((s, h) => s + h.lng, 0) / validHives.length;
    return { lat: avgLat, lng: avgLng };
  }, [hives]);

  // Durum bazli istatistikler
  const stats = useMemo(() => ({
    critical: hives.filter(h => h.status === 'critical').length,
    warning: hives.filter(h => h.status === 'warning').length,
    stable: hives.filter(h => h.status === 'stable').length
  }), [hives]);

  // Map embed URL
  const getMapUrl = useCallback(() => {
    const bbox = getBbox(center.lat, center.lng, zoom);
    switch (mapType) {
      case 'satellite':
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=cyclemap&marker=${center.lat},${center.lng}`;
      case 'hybrid':
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=hot&marker=${center.lat},${center.lng}`;
      default:
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;
    }
  }, [center, zoom, mapType]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 19));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 5));
  const handleNavigate = () => setZoom(13);

  const handleViewDetail = () => {
    if (selectedHive && onViewDetail) {
      onViewDetail(selectedHive.id);
    }
  };

  const texts = {
    tr: {
      title: 'Kovan Haritasi',
      hiveCount: 'kovan',
      map: 'Harita',
      satellite: 'Uydu',
      hybrid: 'Hibrit',
      critical: 'Kritik Kovanlar',
      warning: 'Uyari Durumda',
      stable: 'Stabil Kovanlar',
      hive: 'Kovan',
      temp: 'Sicaklik',
      humidity: 'Nem',
      battery: 'Pil',
      sound: 'Ses',
      weight: 'Agirlik',
      viewDetail: 'Detaylari Gor',
      legend: 'Gosterim',
      criticalStatus: 'Kritik Durum',
      warningStatus: 'Uyari Durumu',
      stableStatus: 'Stabil',
      mapNote: 'Harita gorunumunde kovanlarinizin konumlarini gorebilir ve durumlarini takip edebilirsiniz. Kovan isaretcilerine tiklayarak detaylari goruntuleyin.',
      statusCritical: 'KRITIK',
      statusWarning: 'UYARI',
      statusStable: 'STABIL',
      location: 'Konum',
      zoomIn: 'Yakinlastir',
      zoomOut: 'Uzaklastir',
      centerMap: 'Merkeze Don',
    },
    en: {
      title: 'Hive Map',
      hiveCount: 'hives',
      map: 'Map',
      satellite: 'Satellite',
      hybrid: 'Hybrid',
      critical: 'Critical Hives',
      warning: 'Warning Status',
      stable: 'Stable Hives',
      hive: 'Hive',
      temp: 'Temperature',
      humidity: 'Humidity',
      battery: 'Battery',
      sound: 'Sound',
      weight: 'Weight',
      viewDetail: 'View Details',
      legend: 'Legend',
      criticalStatus: 'Critical',
      warningStatus: 'Warning',
      stableStatus: 'Stable',
      mapNote: 'View your hive locations on the map and track their status. Click on hive markers to view details.',
      statusCritical: 'CRITICAL',
      statusWarning: 'WARNING',
      statusStable: 'STABLE',
      location: 'Location',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      centerMap: 'Center Map',
    }
  };

  const t = texts[lang] || texts.tr;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">{t.title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{hives[0]?.location || 'Konya, Selcuklu'} - {hives.length} {t.hiveCount}</span>
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
            {t.map}
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mapType === 'satellite' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-1" />
            {t.satellite}
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mapType === 'hybrid' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t.hybrid}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{t.critical}</p>
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
          </div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{t.warning}</p>
            <p className="text-2xl font-bold text-amber-400">{stats.warning}</p>
          </div>
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{t.stable}</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.stable}</p>
          </div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
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
          title={t.title}
        />

        {/* Overlay: Kovan Marker'lari — gercek lat/lng kullan */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            {hives.map((hive) => {
              if (!hive.lat || !hive.lng) return null;
              // Kovanlarin pozisyonlarini merkeze gore hesapla
              const scale = 360 / Math.pow(2, zoom);
              const x = ((hive.lng - center.lng) / scale + 0.5) * 100;
              const y = ((center.lat - hive.lat) / (scale / 2) + 0.5) * 100;
              const colors = getStatusColor(hive.status);
              const clampedX = Math.max(3, Math.min(97, x));
              const clampedY = Math.max(3, Math.min(97, y));

              return (
                <div
                  key={hive.id}
                  className="absolute pointer-events-auto cursor-pointer group"
                  style={{ left: `${clampedX}%`, top: `${clampedY}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={() => setSelectedHive(hive)}
                >
                  <div className={`w-5 h-5 rounded-full ${colors.badge} border-2 border-white/60 shadow-lg ${
                    hive.status === 'critical' ? 'animate-pulse' : ''
                  }`} />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                    {hive.name || `#${hive.id}`}
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
            title={t.zoomIn}
          >
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            title={t.zoomOut}
          >
            <ZoomOut className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={handleNavigate}
            className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
            title={t.centerMap}
          >
            <Navigation className="w-5 h-5 text-gray-800" />
          </button>
        </div>

        {/* Selected Hive Info Popup */}
        {selectedHive && (
          <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-5 shadow-2xl max-w-xs pointer-events-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-amber-400">{selectedHive.name || `${t.hive} #${selectedHive.id}`}</h4>
                <p className={`text-sm font-semibold ${getStatusColor(selectedHive.status).text}`}>
                  {selectedHive.status === 'critical' ? t.statusCritical : selectedHive.status === 'warning' ? t.statusWarning : t.statusStable}
                </p>
              </div>
              <button
                onClick={() => setSelectedHive(null)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <span className="text-gray-400 text-lg">×</span>
              </button>
            </div>

            {selectedHive.location && (
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedHive.location}
              </p>
            )}

            {selectedHive.alertType && (
              <p className="text-sm text-red-400 mb-3 bg-red-500/10 rounded-lg px-3 py-1.5">{selectedHive.alertType}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <div>
                  <span className="text-gray-500">{t.temp}</span>
                  <p className="text-gray-200 font-semibold">{selectedHive.temp}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <span className="text-gray-500">{t.humidity}</span>
                  <p className="text-gray-200 font-semibold">{selectedHive.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <span className="text-gray-500">{t.battery}</span>
                  <p className="text-gray-200 font-semibold">{selectedHive.battery}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <div>
                  <span className="text-gray-500">{t.sound}</span>
                  <p className="text-gray-200 font-semibold">{selectedHive.sound}dB</p>
                </div>
              </div>
            </div>

            {selectedHive.weight > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-800 text-xs">
                <span className="text-gray-500">{t.weight}: </span>
                <span className="text-gray-200 font-semibold">{selectedHive.weight} kg</span>
              </div>
            )}

            <button
              onClick={handleViewDetail}
              className="w-full mt-4 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
            >
              {t.viewDetail}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">{t.legend}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full" />
            <span className="text-sm text-gray-400">{t.criticalStatus}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full" />
            <span className="text-sm text-gray-400">{t.warningStatus}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full" />
            <span className="text-sm text-gray-400">{t.stableStatus}</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-400">{t.mapNote}</p>
      </div>
    </div>
  );
};

// Zoom seviyesine gore bbox hesaplama
function getBbox(lat, lng, zoom) {
  const scale = 360 / Math.pow(2, zoom);
  const lonMin = lng - scale / 2;
  const lonMax = lng + scale / 2;
  const latMin = lat - scale / 4;
  const latMax = lat + scale / 4;
  return `${lonMin},${latMin},${lonMax},${latMax}`;
}

export default MapView;
