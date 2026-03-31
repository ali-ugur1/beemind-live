import { useState, useMemo, useEffect, useRef } from 'react';
import { MapPin, Layers, Thermometer, Droplets, Battery, Volume2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  critical: { fill: '#ef4444', border: '#fca5a5', text: 'text-red-400' },
  warning:  { fill: '#f59e0b', border: '#fcd34d', text: 'text-amber-400' },
  stable:   { fill: '#10b981', border: '#6ee7b7', text: 'text-emerald-400' },
};

function createHiveIcon(status) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.stable;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${c.fill}" stroke="${c.border}" stroke-width="1.5"/>
    <circle cx="14" cy="13" r="6" fill="white" fill-opacity="0.9"/>
    <text x="14" y="16.5" text-anchor="middle" font-size="10" font-weight="bold" fill="${c.fill}">🐝</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'leaflet-hive-icon',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const TILE_LAYERS = {
  roadmap: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '&copy; Esri' },
  hybrid: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '&copy; OpenTopoMap' },
};

const MapView = ({ hives, onViewDetail }) => {
  const { lang } = useLanguage();
  const [mapType, setMapType] = useState('roadmap');
  const [selectedHive, setSelectedHive] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileRef = useRef(null);
  const markersRef = useRef([]);

  const center = useMemo(() => {
    const valid = hives.filter(h => h.lat && h.lng);
    if (valid.length === 0) return [37.8746, 32.4932];
    return [
      valid.reduce((s, h) => s + h.lat, 0) / valid.length,
      valid.reduce((s, h) => s + h.lng, 0) / valid.length,
    ];
  }, [hives]);

  const stats = useMemo(() => ({
    critical: hives.filter(h => h.status === 'critical').length,
    warning: hives.filter(h => h.status === 'warning').length,
    stable: hives.filter(h => h.status === 'stable').length
  }), [hives]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    const tile = TILE_LAYERS.roadmap;
    tileRef.current = L.tileLayer(tile.url, { attribution: tile.attr, maxZoom: 19 }).addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // Update center when hives change
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  // Update tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    const tile = TILE_LAYERS[mapType] || TILE_LAYERS.roadmap;
    tileRef.current = L.tileLayer(tile.url, { attribution: tile.attr, maxZoom: 19 }).addTo(map);
  }, [mapType]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    hives.forEach(hive => {
      if (!hive.lat || !hive.lng) return;
      const marker = L.marker([hive.lat, hive.lng], { icon: createHiveIcon(hive.status) });
      const isTr = lang === 'tr';
      const statusLabel = hive.status === 'critical' ? (isTr ? 'KRİTİK' : 'CRITICAL') : hive.status === 'warning' ? (isTr ? 'UYARI' : 'WARNING') : (isTr ? 'STABİL' : 'STABLE');
      const popupHtml = `
        <div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;font-size:14px;color:#f59e0b;margin-bottom:4px">${hive.name || hive.id}</div>
          <div style="font-size:11px;font-weight:600;color:${STATUS_COLORS[hive.status]?.fill};margin-bottom:6px">${statusLabel}</div>
          ${hive.location ? `<div style="font-size:11px;color:#888;margin-bottom:6px">📍 ${hive.location}</div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
            <div>🌡️ ${hive.temp}°C</div>
            <div>💧 ${hive.humidity}%</div>
            <div>🔋 ${hive.battery}%</div>
            <div>🔊 ${hive.sound}dB</div>
          </div>
          ${hive.weight > 0 ? `<div style="font-size:11px;margin-top:4px;border-top:1px solid #eee;padding-top:4px">⚖️ ${hive.weight} kg</div>` : ''}
        </div>
      `;
      marker.bindPopup(popupHtml, { className: 'hexora-popup' });
      marker.on('click', () => setSelectedHive(hive));
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds if multiple hives
    const valid = hives.filter(h => h.lat && h.lng);
    if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map(h => [h.lat, h.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [hives, lang]);

  const texts = {
    tr: {
      title: 'Kovan Haritasi', hiveCount: 'kovan', map: 'Harita', satellite: 'Uydu', hybrid: 'Topo',
      critical: 'Kritik Kovanlar', warning: 'Uyari Durumda', stable: 'Stabil Kovanlar',
      legend: 'Gosterim', criticalStatus: 'Kritik Durum', warningStatus: 'Uyari Durumu', stableStatus: 'Stabil',
      mapNote: 'Harita gorunumunde kovanlarinizin konumlarini gorebilir ve durumlarini takip edebilirsiniz. Kovan isaretcilerine tiklayarak detaylari goruntuleyin.',
      viewDetail: 'Detaylari Gor',
    },
    en: {
      title: 'Hive Map', hiveCount: 'hives', map: 'Map', satellite: 'Satellite', hybrid: 'Topo',
      critical: 'Critical Hives', warning: 'Warning Status', stable: 'Stable Hives',
      legend: 'Legend', criticalStatus: 'Critical', warningStatus: 'Warning', stableStatus: 'Stable',
      mapNote: 'View your hive locations on the map and track their status. Click on hive markers to view details.',
      viewDetail: 'View Details',
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
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {['roadmap', 'satellite', 'hybrid'].map(type => (
            <button key={type} onClick={() => setMapType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mapType === type ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-gray-200'}`}>
              {type === 'roadmap' ? t.map : type === 'satellite' ? (<><Layers className="w-4 h-4 inline mr-1" />{t.satellite}</>) : t.hybrid}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
          <div><p className="text-sm text-gray-400">{t.critical}</p><p className="text-2xl font-bold text-red-400">{stats.critical}</p></div>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center justify-between">
          <div><p className="text-sm text-gray-400">{t.warning}</p><p className="text-2xl font-bold text-amber-400">{stats.warning}</p></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 flex items-center justify-between">
          <div><p className="text-sm text-gray-400">{t.stable}</p><p className="text-2xl font-bold text-emerald-400">{stats.stable}</p></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Selected hive sidebar */}
        {selectedHive && (
          <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-5 shadow-2xl max-w-xs z-[1000]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-amber-400">{selectedHive.name || selectedHive.id}</h4>
                <p className={`text-sm font-semibold ${STATUS_COLORS[selectedHive.status]?.text}`}>
                  {selectedHive.status === 'critical' ? 'KRITIK' : selectedHive.status === 'warning' ? 'UYARI' : 'STABIL'}
                </p>
              </div>
              <button onClick={() => setSelectedHive(null)} className="p-1 hover:bg-gray-800 rounded transition-colors">
                <span className="text-gray-400 text-lg">×</span>
              </button>
            </div>
            {selectedHive.location && (
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedHive.location}</p>
            )}
            {selectedHive.alertType && (
              <p className="text-sm text-red-400 mb-3 bg-red-500/10 rounded-lg px-3 py-1.5">{selectedHive.alertType}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2"><Thermometer className="w-3.5 h-3.5 text-red-400" /><div><span className="text-gray-500">Sıc.</span><p className="text-gray-200 font-semibold">{selectedHive.temp}°C</p></div></div>
              <div className="flex items-center gap-2"><Droplets className="w-3.5 h-3.5 text-cyan-400" /><div><span className="text-gray-500">Nem</span><p className="text-gray-200 font-semibold">{selectedHive.humidity}%</p></div></div>
              <div className="flex items-center gap-2"><Battery className="w-3.5 h-3.5 text-emerald-400" /><div><span className="text-gray-500">Pil</span><p className="text-gray-200 font-semibold">{selectedHive.battery}%</p></div></div>
              <div className="flex items-center gap-2"><Volume2 className="w-3.5 h-3.5 text-purple-400" /><div><span className="text-gray-500">Ses</span><p className="text-gray-200 font-semibold">{selectedHive.sound}dB</p></div></div>
            </div>
            {selectedHive.weight > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-800 text-xs"><span className="text-gray-500">Ağırlık: </span><span className="text-gray-200 font-semibold">{selectedHive.weight} kg</span></div>
            )}
            <button onClick={() => onViewDetail?.(selectedHive.id)}
              className="w-full mt-4 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm">
              {t.viewDetail}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">{t.legend}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full" /><span className="text-sm text-gray-400">{t.criticalStatus}</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded-full" /><span className="text-sm text-gray-400">{t.warningStatus}</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-full" /><span className="text-sm text-gray-400">{t.stableStatus}</span></div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-400">{t.mapNote}</p>
      </div>
    </div>
  );
};

export default MapView;
