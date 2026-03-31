const API_URL = import.meta.env.VITE_API_URL || '';

// Token'ı localStorage'dan al
function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('hexora_jwt');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

// Genel fetch wrapper — 401 durumunda logout tetikle
async function authFetch(url, options = {}) {
  const headers = { ...getAuthHeaders(), ...options.headers };
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Token expired veya geçersiz — auth expired event gönder
    try {
      localStorage.removeItem('hexora_jwt');
      localStorage.removeItem('hexora_user');
      window.dispatchEvent(new CustomEvent('hexora:auth-expired'));
    } catch {}
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API hatası (${res.status})`);
  }

  return res.json();
}

export const api = {
  async getHivesSummary() {
    return authFetch(`${API_URL}/api/hives/summary`);
  },

  async getSensorData() {
    return authFetch(`${API_URL}/api/sensor-data`);
  },

  async getHiveChart(hiveId) {
    return authFetch(`${API_URL}/api/hives/${hiveId}/chart`);
  },

  async getGatewayStatus() {
    return authFetch(`${API_URL}/api/gateway/status`);
  },

  async getWeather() {
    return authFetch(`${API_URL}/api/weather`);
  },

  // Hive CRUD
  async getHives() {
    return authFetch(`${API_URL}/api/hives`);
  },

  async createHive(data) {
    return authFetch(`${API_URL}/api/hives`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateHive(id, data) {
    return authFetch(`${API_URL}/api/hives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteHive(id) {
    return authFetch(`${API_URL}/api/hives/${id}`, {
      method: 'DELETE',
    });
  },

  // Backup & Restore
  async getBackup() {
    return authFetch(`${API_URL}/api/backup`);
  },

  async restoreBackup(data) {
    return authFetch(`${API_URL}/api/restore`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resetData(target = 'sensor') {
    return authFetch(`${API_URL}/api/data/reset?target=${target}`, {
      method: 'DELETE',
    });
  },

  // Profile & Password
  async updateProfile(data) {
    return authFetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async changePassword(currentPassword, newPassword) {
    return authFetch(`${API_URL}/api/auth/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Hive Photo Upload
  async uploadHivePhoto(hiveId, file) {
    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('hexora_jwt');
    const res = await fetch(`${API_URL}/api/hives/${hiveId}/photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (res.status === 401) {
      try { localStorage.removeItem('hexora_jwt'); localStorage.removeItem('hexora_user'); window.dispatchEvent(new CustomEvent('hexora:auth-expired')); } catch {}
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed (${res.status})`);
    }
    return res.json();
  },

  // Health check (auth gerektirmez)
  async getHealth() {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error('API hatası');
    return res.json();
  },
};

export function apiToHiveFormat(apiHive) {
  const lang = _getLang();
  const isTr = lang === 'tr';
  let status = 'stable';
  let alertType = null;
  let priority = 3;

  const temp = apiHive.temp ?? apiHive.temperature ?? null;
  const humidity = apiHive.humidity ?? null;
  const vibration = apiHive.vibration ?? 0;
  const soundDb = apiHive.sound_db ?? null;

  // Sadece veri varsa alarm hesapla
  if (temp !== null) {
    if (temp > 38 || temp < 10 || vibration > 2000) {
      status = 'critical';
      priority = 1;
      if (temp > 38) alertType = (isTr ? 'Yüksek Sıcaklık (' : 'High Temperature (') + temp.toFixed(1) + '°C)';
      else if (temp < 10) alertType = (isTr ? 'Düşük Sıcaklık (' : 'Low Temperature (') + temp.toFixed(1) + '°C)';
      else alertType = isTr ? 'Yüksek Titreşim Alarmı' : 'High Vibration Alert';
    } else if (temp > 36 || (humidity !== null && (humidity > 80 || humidity < 30)) || vibration > 1000) {
      status = 'warning';
      priority = 2;
      alertType = isTr ? 'Dikkat Gerektiriyor' : 'Attention Required';
    }
  }

  const lastUpdate = apiHive.lastUpdate || apiHive.created_at;
  const timeDiff = lastUpdate ? getTimeDiff(new Date(lastUpdate), isTr) : (isTr ? 'Bilinmiyor' : 'Unknown');

  return {
    id: apiHive.id || apiHive.hive_id,
    name: apiHive.name || apiHive.id || 'Kovan',
    location: apiHive.location || '',
    lat: apiHive.lat || null,
    lng: apiHive.lng || null,
    adapterType: apiHive.adapterType || 'standard',
    deviceSerial: apiHive.deviceSerial || '',
    status,
    alertType,
    temp: temp ?? 0,
    humidity: humidity ?? 0,
    pressure: apiHive.pressure ?? 0,
    vibration: vibration,
    battery: apiHive.battery ?? 100,
    weight: apiHive.weight ?? 0,
    sound: soundDb !== null ? Math.max(0, 100 + soundDb) : (vibration ? Math.min(100, vibration / 40) : 40),
    soundDb: soundDb,
    lastUpdate: timeDiff,
    lastActivity: alertType || (isTr ? 'Tüm Sistemler Normal' : 'All Systems Normal'),
    priority,
    hasData: apiHive.hasData !== undefined ? apiHive.hasData : (temp !== null),
  };
}

function _getLang() {
  try { return localStorage.getItem('hexora_language') || 'tr'; } catch { return 'tr'; }
}

function getTimeDiff(date, isTr = true) {
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return isTr ? 'Az önce' : 'Just now';
  if (diffMin < 60) return isTr ? `${diffMin} dakika önce` : `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return isTr ? `${diffHour} saat önce` : `${diffHour} hours ago`;
  const diffDay = Math.floor(diffHour / 24);
  return isTr ? `${diffDay} gün önce` : `${diffDay} days ago`;
}
