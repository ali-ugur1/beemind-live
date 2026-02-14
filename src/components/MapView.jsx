import { useState, useMemo } from 'react';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { getStatusColor } from '../data/mockData';

const MapView = ({ hives }) => {
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap', 'satellite', 'hybrid'
  const [selectedHive, setSelectedHive] = useState(null);

  // Mock GPS koordinatları (Konya, Selçuklu bölgesi)
  const baseLocation = {
    lat: 37.8746,
    lng: 32.4932
  };

  // Her kovana rastgele ama yakın koordinatlar
  const hiveLocations = useMemo(() => {
    return hives.map((hive, index) => ({
      ...hive,
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.01
    }));
  }, [hives]);

  // Durum bazlı istatistikler
  const stats = useMemo(() => {
    return {
      critical: hiveLocations.filter(h => h.status === 'critical').length,
      warning: hiveLocations.filter(h => h.status === 'warning').length,
      stable: hiveLocations.filter(h => h.status === 'stable').length
    };
  }, [hiveLocations]);

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
        {/* Google Maps Embed (İframe) */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${baseLocation.lat},${baseLocation.lng}&zoom=15&maptype=${mapType}`}
          title="Kovan Haritası"
        ></iframe>

        {/* Overlay: Kovan Marker'ları (SVG) */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            {hiveLocations.map((hive, index) => {
              // Basit koordinat dönüşümü (gerçekte Google Maps API kullanılacak)
              const x = ((hive.lng - baseLocation.lng + 0.005) / 0.01) * 100 + '%';
              const y = ((baseLocation.lat - hive.lat + 0.005) / 0.01) * 100 + '%';
              const colors = getStatusColor(hive.status);

              return (
                <g key={hive.id} transform={`translate(${x}, ${y})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="8"
                    className={`${colors.badge} cursor-pointer pointer-events-auto ${
                      hive.status === 'critical' ? 'animate-pulse' : ''
                    }`}
                    onClick={() => setSelectedHive(hive)}
                  />
                  <text
                    x="0"
                    y="20"
                    textAnchor="middle"
                    className="text-xs font-bold fill-white pointer-events-none"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                  >
                    #{hive.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
          <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </button>
          <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
            <ZoomOut className="w-5 h-5 text-gray-800" />
          </button>
          <button className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
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
            <button className="w-full mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
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
          Gerçek GPS entegrasyonu için Google Maps API key gereklidir.
        </p>
      </div>
    </div>
  );
};

export default MapView;
