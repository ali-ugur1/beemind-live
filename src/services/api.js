const API_URL = '';

export const api = {
  async getHivesSummary() {
    const res = await fetch(`${API_URL}/api/hives/summary`);
    if (!res.ok) throw new Error('API hatasi');
    return res.json();
  },

  async getSensorData() {
    const res = await fetch(`${API_URL}/api/sensor-data`);
    if (!res.ok) throw new Error('API hatasi');
    return res.json();
  },

  async getHiveChart(hiveId) {
    const res = await fetch(`${API_URL}/api/hives/${hiveId}/chart`);
    if (!res.ok) throw new Error('API hatasi');
    return res.json();
  }
};

export function apiToHiveFormat(apiHive) {
  let status = 'stable';
  let alertType = null;
  let priority = 3;

  const temp = apiHive.temp || apiHive.temperature;
  const humidity = apiHive.humidity;
  const vibration = apiHive.vibration;

  if (temp > 38 || temp < 10 || vibration > 2000) {
    status = 'critical';
    priority = 1;
    if (temp > 38) alertType = 'Yuksek Sicaklik (' + temp.toFixed(1) + ' C)';
    else if (temp < 10) alertType = 'Dusuk Sicaklik (' + temp.toFixed(1) + ' C)';
    else alertType = 'Yuksek Titresim Alarmi';
  } else if (temp > 36 || humidity > 80 || humidity < 30 || vibration > 1000) {
    status = 'warning';
    priority = 2;
    alertType = 'Dikkat Gerektiriyor';
  }

  const lastUpdate = apiHive.lastUpdate || apiHive.created_at;
  const timeDiff = lastUpdate ? getTimeDiff(new Date(lastUpdate)) : 'Bilinmiyor';

  return {
    id: apiHive.id || apiHive.hive_id,
    status,
    alertType,
    temp: temp || 0,
    humidity: humidity || 0,
    pressure: apiHive.pressure || 0,
    vibration: vibration || 0,
    battery: apiHive.battery || 100,
    weight: apiHive.weight || 0,
    sound: vibration ? Math.min(100, vibration / 40) : 40,
    lastUpdate: timeDiff,
    lastActivity: alertType || 'Tum Sistemler Normal',
    priority
  };
}

function getTimeDiff(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Az once';
  if (diffMin < 60) return diffMin + ' dakika once';
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return diffHour + ' saat once';
  return Math.floor(diffHour / 24) + ' gun once';
}
