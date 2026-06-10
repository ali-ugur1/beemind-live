import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Layers,
  Thermometer,
  Droplets,
  Battery,
  Volume2,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STATUS_COLORS = {
  critical: { fill: "#ef4444", border: "#fca5a5", text: "text-red-400" },
  warning: { fill: "#f59e0b", border: "#fcd34d", text: "text-amber-400" },
  stable: { fill: "#10b981", border: "#6ee7b7", text: "text-emerald-400" },
};

const TILE_LAYERS = {
  roadmap: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "&copy; Esri",
    maxZoom: 19,
  },
  hybrid: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: "&copy; OpenTopoMap",
    maxZoom: 17,
  },
};

const DEFAULT_CENTER = [37.8746, 32.4932];

// HTML escape for popup content (marker popups are HTML strings)
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// Pin icon — uses a honeycomb shape inside instead of emoji (emojis don't render reliably inside SVG text)
function createHiveIcon(status) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.stable;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${c.fill}" stroke="${c.border}" stroke-width="1.5"/>
    <circle cx="14" cy="13" r="6.5" fill="white" fill-opacity="0.95"/>
    <path d="M14 8.5l3.5 2v4L14 16.5l-3.5-2v-4z" fill="${c.fill}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "leaflet-hive-icon",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const MapView = ({ hives, onViewDetail }) => {
  const { lang } = useLanguage();
  const [mapType, setMapType] = useState("roadmap");
  const [selectedHive, setSelectedHive] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileRef = useRef(null);
  const markersRef = useRef(new Map()); // hive.id -> marker
  const didFitRef = useRef(false); // only auto-fit once so user pan/zoom is preserved

  const texts = {
    tr: {
      title: "Kovan Haritası",
      hiveCount: "kovan",
      map: "Harita",
      satellite: "Uydu",
      hybrid: "Topo",
      critical: "Kritik Kovanlar",
      warning: "Uyarı Durumda",
      stable: "Stabil Kovanlar",
      legend: "Gösterim",
      criticalStatus: "Kritik Durum",
      warningStatus: "Uyarı Durumu",
      stableStatus: "Stabil",
      mapNote:
        "Harita görünümünde kovanlarınızın konumlarını görebilir ve durumlarını takip edebilirsiniz. Kovan işaretçilerine tıklayarak detayları görüntüleyin.",
      viewDetail: "Detayları Gör",
      critLabel: "KRİTİK",
      warnLabel: "UYARI",
      stableLabel: "STABİL",
      temp: "Sıc.",
      humidity: "Nem",
      battery: "Pil",
      sound: "Ses",
      weight: "Ağırlık",
      defaultLocation: "Konya, Selçuklu",
    },
    en: {
      title: "Hive Map",
      hiveCount: "hives",
      map: "Map",
      satellite: "Satellite",
      hybrid: "Topo",
      critical: "Critical Hives",
      warning: "Warning Status",
      stable: "Stable Hives",
      legend: "Legend",
      criticalStatus: "Critical",
      warningStatus: "Warning",
      stableStatus: "Stable",
      mapNote:
        "View your hive locations on the map and track their status. Click on hive markers to view details.",
      viewDetail: "View Details",
      critLabel: "CRITICAL",
      warnLabel: "WARNING",
      stableLabel: "STABLE",
      temp: "Temp",
      humidity: "Hum.",
      battery: "Batt.",
      sound: "Sound",
      weight: "Weight",
      defaultLocation: "Konya, Selcuklu",
    },
  };
  const t = texts[lang] || texts.tr;

  const validHives = useMemo(
    () =>
      hives.filter((h) => Number.isFinite(h?.lat) && Number.isFinite(h?.lng)),
    [hives],
  );

  const initialCenter = useMemo(() => {
    if (validHives.length === 0) return DEFAULT_CENTER;
    const lat = validHives.reduce((s, h) => s + h.lat, 0) / validHives.length;
    const lng = validHives.reduce((s, h) => s + h.lng, 0) / validHives.length;
    return [lat, lng];
  }, [validHives]);

  const stats = useMemo(
    () => ({
      critical: hives.filter((h) => h.status === "critical").length,
      warning: hives.filter((h) => h.status === "warning").length,
      stable: hives.filter((h) => h.status === "stable").length,
    }),
    [hives],
  );

  // --- Initialize map once ---
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    const tile = TILE_LAYERS.roadmap;
    tileRef.current = L.tileLayer(tile.url, {
      attribution: tile.attr,
      maxZoom: tile.maxZoom,
    }).addTo(map);

    // Close sidebar when user clicks the map background
    map.on("click", () => setSelectedHive(null));

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileRef.current = null;
      markersRef.current.clear();
      didFitRef.current = false;
    };
    // Intentionally empty dep array: we only initialize once. initialCenter is used
    // as a seed; subsequent fitBounds handles positioning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Swap tile layer when mapType changes ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileRef.current) {
      map.removeLayer(tileRef.current);
      tileRef.current = null;
    }
    const tile = TILE_LAYERS[mapType] || TILE_LAYERS.roadmap;
    tileRef.current = L.tileLayer(tile.url, {
      attribution: tile.attr,
      maxZoom: tile.maxZoom,
    }).addTo(map);
  }, [mapType]);

  // --- Sync markers incrementally (add/update/remove) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const existing = markersRef.current;
    const nextIds = new Set();

    validHives.forEach((hive) => {
      const id = hive.id;
      nextIds.add(id);

      const statusLabel =
        hive.status === "critical"
          ? t.critLabel
          : hive.status === "warning"
            ? t.warnLabel
            : t.stableLabel;

      const popupHtml = `
        <div style="font-family:system-ui,-apple-system,sans-serif;min-width:180px">
          <div style="font-weight:700;font-size:14px;color:#f59e0b;margin-bottom:4px">${esc(hive.name || hive.id)}</div>
          <div style="font-size:11px;font-weight:600;color:${STATUS_COLORS[hive.status]?.fill || "#10b981"};margin-bottom:6px">${esc(statusLabel)}</div>
          ${hive.location ? `<div style="font-size:11px;color:#888;margin-bottom:6px">📍 ${esc(hive.location)}</div>` : ""}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
            <div>🌡️ ${esc(hive.temp)}°C</div>
            <div>💧 ${esc(hive.humidity)}%</div>
            <div>🔋 ${esc(hive.battery)}%</div>
            <div>🔊 ${esc(hive.sound)}dB</div>
          </div>
          ${hive.weight > 0 ? `<div style="font-size:11px;margin-top:4px;border-top:1px solid #eee;padding-top:4px">⚖️ ${esc(hive.weight)} kg</div>` : ""}
        </div>
      `;

      let marker = existing.get(id);
      if (marker) {
        // Update existing marker in place
        marker.setLatLng([hive.lat, hive.lng]);
        marker.setIcon(createHiveIcon(hive.status));
        marker.setPopupContent(popupHtml);
        // Rebind click so it captures latest hive reference
        marker.off("click");
        marker.on("click", () => setSelectedHive(hive));
      } else {
        marker = L.marker([hive.lat, hive.lng], {
          icon: createHiveIcon(hive.status),
        });
        marker.bindPopup(popupHtml, { className: "beemora-popup" });
        marker.on("click", () => setSelectedHive(hive));
        marker.addTo(map);
        existing.set(id, marker);
      }
    });

    // Remove markers whose hives no longer exist
    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        map.removeLayer(marker);
        existing.delete(id);
      }
    }

    // Auto-fit bounds only once on first render with data — don't fight user pan/zoom
    if (!didFitRef.current && validHives.length > 0) {
      if (validHives.length === 1) {
        map.setView([validHives[0].lat, validHives[0].lng], 14);
      } else {
        const bounds = L.latLngBounds(validHives.map((h) => [h.lat, h.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
      didFitRef.current = true;
    }
  }, [validHives, lang, t.critLabel, t.warnLabel, t.stableLabel]);

  // Keep selectedHive data fresh if the underlying hives list updates
  useEffect(() => {
    if (!selectedHive) return;
    const fresh = hives.find((h) => h.id === selectedHive.id);
    if (fresh && fresh !== selectedHive) setSelectedHive(fresh);
    else if (!fresh) setSelectedHive(null);
  }, [hives, selectedHive]);

  const handleRecenter = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || validHives.length === 0) return;
    if (validHives.length === 1) {
      map.setView([validHives[0].lat, validHives[0].lng], 14);
    } else {
      const bounds = L.latLngBounds(validHives.map((h) => [h.lat, h.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [validHives]);

  const selectedStatusLabel = selectedHive
    ? selectedHive.status === "critical"
      ? t.critLabel
      : selectedHive.status === "warning"
        ? t.warnLabel
        : t.stableLabel
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">{t.title}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>
              {hives[0]?.location || t.defaultLocation} — {hives.length}{" "}
              {t.hiveCount}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {["roadmap", "satellite", "hybrid"].map((type) => (
            <button
              key={type}
              onClick={() => setMapType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mapType === type
                  ? "bg-amber-500 text-black"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {type === "roadmap" ? (
                t.map
              ) : type === "satellite" ? (
                <>
                  <Layers className="w-4 h-4 inline mr-1" />
                  {t.satellite}
                </>
              ) : (
                t.hybrid
              )}
            </button>
          ))}
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
            <p className="text-2xl font-bold text-emerald-400">
              {stats.stable}
            </p>
          </div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* Leaflet Map */}
      <div
        className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
        style={{ height: "600px" }}
      >
        <div ref={mapRef} className="w-full h-full z-0" />

        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          className="absolute top-4 right-4 z-[1000] bg-gray-900/90 backdrop-blur border border-gray-700 hover:border-amber-500 text-gray-200 hover:text-amber-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg"
          title={t.viewDetail}
        >
          <MapPin className="w-4 h-4 inline mr-1" />
          {lang === "tr" ? "Merkeze Al" : "Recenter"}
        </button>

        {/* Selected hive sidebar */}
        {selectedHive && (
          <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-5 shadow-2xl max-w-xs z-[1000]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-amber-400">
                  {selectedHive.name || selectedHive.id}
                </h4>
                <p
                  className={`text-sm font-semibold ${STATUS_COLORS[selectedHive.status]?.text || "text-emerald-400"}`}
                >
                  {selectedStatusLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedHive(null)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
                aria-label="close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {selectedHive.location && (
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedHive.location}
              </p>
            )}

            {selectedHive.alertType && (
              <p className="text-sm text-red-400 mb-3 bg-red-500/10 rounded-lg px-3 py-1.5">
                {selectedHive.alertType}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <div>
                  <span className="text-gray-500">{t.temp}</span>
                  <p className="text-gray-200 font-semibold">
                    {selectedHive.temp}°C
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <div>
                  <span className="text-gray-500">{t.humidity}</span>
                  <p className="text-gray-200 font-semibold">
                    {selectedHive.humidity}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <div>
                  <span className="text-gray-500">{t.battery}</span>
                  <p className="text-gray-200 font-semibold">
                    {selectedHive.battery}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <div>
                  <span className="text-gray-500">{t.sound}</span>
                  <p className="text-gray-200 font-semibold">
                    {selectedHive.sound}dB
                  </p>
                </div>
              </div>
            </div>

            {selectedHive.weight > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-800 text-xs">
                <span className="text-gray-500">{t.weight}: </span>
                <span className="text-gray-200 font-semibold">
                  {selectedHive.weight} kg
                </span>
              </div>
            )}

            <button
              onClick={() => onViewDetail?.(selectedHive.id)}
              className="w-full mt-4 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
            >
              {t.viewDetail}
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          {t.legend}
        </h4>
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

export default MapView;
