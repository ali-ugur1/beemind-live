/**
 * Gerçek hava durumu servisi — Open-Meteo API (ücretsiz, API key gerektirmez)
 *
 * 1. Konum adından koordinat bulur (geocoding)
 * 2. Koordinatlardan hava durumunu çeker
 */

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// WMO hava durumu kodları → Türkçe / İngilizce açıklama + emoji
const WMO_CODES = {
  0: { tr: "Açık", en: "Clear", icon: "☀️" },
  1: { tr: "Az Bulutlu", en: "Mainly Clear", icon: "🌤️" },
  2: { tr: "Parçalı Bulutlu", en: "Partly Cloudy", icon: "⛅" },
  3: { tr: "Bulutlu", en: "Overcast", icon: "☁️" },
  45: { tr: "Sisli", en: "Foggy", icon: "🌫️" },
  48: { tr: "Kırağılı Sis", en: "Rime Fog", icon: "🌫️" },
  51: { tr: "Hafif Çisenti", en: "Light Drizzle", icon: "🌦️" },
  53: { tr: "Çisenti", en: "Drizzle", icon: "🌦️" },
  55: { tr: "Yoğun Çisenti", en: "Dense Drizzle", icon: "🌧️" },
  61: { tr: "Hafif Yağmur", en: "Light Rain", icon: "🌧️" },
  63: { tr: "Yağmur", en: "Rain", icon: "🌧️" },
  65: { tr: "Şiddetli Yağmur", en: "Heavy Rain", icon: "🌧️" },
  71: { tr: "Hafif Kar", en: "Light Snow", icon: "🌨️" },
  73: { tr: "Kar", en: "Snow", icon: "🌨️" },
  75: { tr: "Yoğun Kar", en: "Heavy Snow", icon: "❄️" },
  80: { tr: "Sağanak", en: "Showers", icon: "🌧️" },
  81: { tr: "Sağanak", en: "Showers", icon: "🌧️" },
  82: { tr: "Şiddetli Sağanak", en: "Violent Showers", icon: "⛈️" },
  95: { tr: "Gök Gürültülü Fırtına", en: "Thunderstorm", icon: "⛈️" },
  96: { tr: "Dolu ile Fırtına", en: "Thunderstorm with Hail", icon: "⛈️" },
  99: { tr: "Şiddetli Dolu Fırtınası", en: "Severe Thunderstorm", icon: "⛈️" },
};

const DAY_NAMES = {
  tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

// Bellek içi cache (localStorage yerine — artifact/SSR uyumlu)
const _cache = new Map();

function _cacheGet(key, maxAgeMs) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > maxAgeMs) {
    _cache.delete(key);
    return null;
  }
  return entry.data;
}

function _cacheSet(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

function getWeatherDescription(code, lang = "tr") {
  const info = WMO_CODES[code] ?? WMO_CODES[0];
  return {
    condition: info[lang] ?? info.tr,
    icon: info.icon,
  };
}

/**
 * Konum adından koordinat bul
 * @param {string} locationName
 * @returns {Promise<{ lat: number, lon: number, name: string, country: string, admin: string }>}
 */
async function geocode(locationName) {
  const cacheKey = `geocode_${locationName}`;
  const cached = _cacheGet(cacheKey, 7 * 24 * 60 * 60 * 1000); // 1 hafta
  if (cached) return cached;

  const url = `${GEOCODE_URL}?name=${encodeURIComponent(locationName)}&count=1&language=tr`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Geocode isteği başarısız: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(`Konum bulunamadı: "${locationName}"`);
  }

  const r = data.results[0];
  const result = {
    lat: r.latitude,
    lon: r.longitude,
    name: r.name ?? locationName,
    country: r.country ?? "",
    admin: r.admin1 ?? "",
  };

  _cacheSet(cacheKey, result);
  return result;
}

/**
 * Hava durumu verisini çek
 * @param {string} locationName - Konum adı (örn: "Konya", "İstanbul")
 * @param {'tr'|'en'} lang - Dil kodu
 * @returns {Promise<Object>} Hava durumu verisi
 */
export async function fetchWeather(locationName, lang = "tr") {
  if (!locationName || typeof locationName !== "string") {
    throw new Error("Geçersiz konum adı");
  }

  const normalizedLang = lang === "en" ? "en" : "tr";
  const cacheKey = `weather_${locationName}_${normalizedLang}`;
  const cached = _cacheGet(cacheKey, 15 * 60 * 1000); // 15 dakika
  if (cached) return cached;

  const geo = await geocode(locationName);

  const params = new URLSearchParams({
    latitude: geo.lat,
    longitude: geo.lon,
    current:
      "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "4",
  });

  const res = await fetch(`${WEATHER_URL}?${params}`);

  if (!res.ok) {
    throw new Error(`Hava durumu isteği başarısız: HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!data.current) {
    throw new Error("Hava durumu verisi eksik veya bozuk");
  }

  const current = data.current;
  const { condition, icon } = getWeatherDescription(
    current.weather_code,
    normalizedLang,
  );
  const dayNames = DAY_NAMES[normalizedLang];

  // Bugünden sonraki en fazla 3 günlük tahmin
  const forecast = [];
  const daily = data.daily;

  if (daily?.time) {
    const limit = Math.min(4, daily.time.length);
    for (let i = 1; i < limit; i++) {
      const dayOfWeek = new Date(daily.time[i]).getDay();
      const dayInfo = getWeatherDescription(
        daily.weather_code[i],
        normalizedLang,
      );
      forecast.push({
        day: dayNames[dayOfWeek],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        temp: Math.round(daily.temperature_2m_max[i]),
        condition: dayInfo.condition,
        icon: dayInfo.icon,
      });
    }
  }

  const result = {
    location: geo.admin ? `${geo.name}, ${geo.admin}` : geo.name,
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    condition,
    icon,
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    forecast,
    _source: "open-meteo",
  };

  _cacheSet(cacheKey, result);
  return result;
}
