/**
 * Gerçek hava durumu servisi — Open-Meteo API (ücretsiz, API key gerektirmez)
 * 
 * 1. Konum adından koordinat bulur (geocoding)
 * 2. Koordinatlardan hava durumunu çeker
 */

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO hava durumu kodları → Türkçe / İngilizce açıklama + emoji
const WMO_CODES = {
  0: { tr: 'Açık', en: 'Clear', icon: '☀️' },
  1: { tr: 'Az Bulutlu', en: 'Mainly Clear', icon: '🌤️' },
  2: { tr: 'Parçalı Bulutlu', en: 'Partly Cloudy', icon: '⛅' },
  3: { tr: 'Bulutlu', en: 'Overcast', icon: '☁️' },
  45: { tr: 'Sisli', en: 'Foggy', icon: '🌫️' },
  48: { tr: 'Kırağılı Sis', en: 'Rime Fog', icon: '🌫️' },
  51: { tr: 'Hafif Çisenti', en: 'Light Drizzle', icon: '🌦️' },
  53: { tr: 'Çisenti', en: 'Drizzle', icon: '🌦️' },
  55: { tr: 'Yoğun Çisenti', en: 'Dense Drizzle', icon: '🌧️' },
  61: { tr: 'Hafif Yağmur', en: 'Light Rain', icon: '🌧️' },
  63: { tr: 'Yağmur', en: 'Rain', icon: '🌧️' },
  65: { tr: 'Şiddetli Yağmur', en: 'Heavy Rain', icon: '🌧️' },
  71: { tr: 'Hafif Kar', en: 'Light Snow', icon: '🌨️' },
  73: { tr: 'Kar', en: 'Snow', icon: '🌨️' },
  75: { tr: 'Yoğun Kar', en: 'Heavy Snow', icon: '❄️' },
  80: { tr: 'Sağanak', en: 'Showers', icon: '🌧️' },
  81: { tr: 'Sağanak', en: 'Showers', icon: '🌧️' },
  82: { tr: 'Şiddetli Sağanak', en: 'Violent Showers', icon: '⛈️' },
  95: { tr: 'Gök Gürültülü Fırtına', en: 'Thunderstorm', icon: '⛈️' },
  96: { tr: 'Dolu ile Fırtına', en: 'Thunderstorm with Hail', icon: '⛈️' },
  99: { tr: 'Şiddetli Dolu Fırtınası', en: 'Severe Thunderstorm', icon: '⛈️' },
};

function getWeatherDescription(code, lang = 'tr') {
  const info = WMO_CODES[code] || WMO_CODES[0];
  return { condition: info[lang] || info.tr, icon: info.icon };
}

// Gün adları
const DAY_NAMES = {
  tr: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

/**
 * Konum adından koordinat bul
 */
async function geocode(locationName) {
  // Önce cache kontrol
  const cacheKey = `beemind_geocode_${locationName}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 7 * 24 * 3600 * 1000) return parsed; // 1 hafta cache
    }
  } catch {}

  const res = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(locationName)}&count=1&language=tr`);
  if (!res.ok) throw new Error('Geocode hatası');
  const data = await res.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error('Konum bulunamadı: ' + locationName);
  }

  const result = {
    lat: data.results[0].latitude,
    lon: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country || '',
    admin: data.results[0].admin1 || '',
    ts: Date.now()
  };

  try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
  return result;
}

/**
 * Hava durumu verisini çek
 * @param {string} locationName - Konum adı (örn: "Konya", "İstanbul", "Konya, Selçuklu")
 * @param {string} lang - Dil kodu ("tr" veya "en")
 * @returns {Promise<Object>} Hava durumu verisi
 */
export async function fetchWeather(locationName, lang = 'tr') {
  // Hava durumu cache (15 dakika)
  const cacheKey = `beemind_weather_${locationName}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed._ts < 15 * 60 * 1000) return parsed;
    }
  } catch {}

  const geo = await geocode(locationName);

  const params = new URLSearchParams({
    latitude: geo.lat,
    longitude: geo.lon,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '4',
  });

  const res = await fetch(`${WEATHER_URL}?${params}`);
  if (!res.ok) throw new Error('Weather API hatası');
  const data = await res.json();

  const current = data.current;
  const { condition, icon } = getWeatherDescription(current.weather_code, lang);

  // Günlük tahminler (bugünden sonraki 3 gün)
  const forecast = [];
  if (data.daily) {
    for (let i = 1; i < Math.min(4, data.daily.time.length); i++) {
      const dayDate = new Date(data.daily.time[i]);
      const dayInfo = getWeatherDescription(data.daily.weather_code[i], lang);
      forecast.push({
        day: DAY_NAMES[lang]?.[dayDate.getDay()] || DAY_NAMES.tr[dayDate.getDay()],
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        temp: Math.round(data.daily.temperature_2m_max[i]),
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
    _ts: Date.now(),
    _source: 'open-meteo',
  };

  try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
  return result;
}
