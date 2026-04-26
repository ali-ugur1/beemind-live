const API_URL = import.meta.env.VITE_API_URL || "";

// ─── Yardımcı ───────────────────────────────────────────────────────────────

function _getLang() {
  try {
    return localStorage.getItem("hexora_language") || "tr";
  } catch {
    return "tr";
  }
}

function _getToken() {
  try {
    return localStorage.getItem("hexora_jwt") || null;
  } catch {
    return null;
  }
}

function _clearSession() {
  try {
    localStorage.removeItem("hexora_jwt");
    localStorage.removeItem("hexora_user");
    window.dispatchEvent(new CustomEvent("hexora:auth-expired"));
  } catch {
    /* intentional */
  }
}

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = _getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function getTimeDiff(date, isTr = true) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return isTr ? "Az önce" : "Just now";
  if (diffMin < 60)
    return isTr ? `${diffMin} dakika önce` : `${diffMin} min ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24)
    return isTr ? `${diffHour} saat önce` : `${diffHour} hours ago`;
  const diffDay = Math.floor(diffHour / 24);
  return isTr ? `${diffDay} gün önce` : `${diffDay} days ago`;
}

// ─── Temel fetch wrapper ─────────────────────────────────────────────────────

async function authFetch(url, options = {}) {
  const headers = { ...getAuthHeaders(), ...options.headers };
  let res;

  try {
    res = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    throw new Error(
      _getLang() === "tr"
        ? "Ağ bağlantısı kurulamadı."
        : "Network connection failed.",
    );
  }

  if (res.status === 401) {
    _clearSession();
    throw new Error(
      _getLang() === "tr" ? "Oturum süresi doldu." : "Session expired.",
    );
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const isTr = _getLang() === "tr";
    const msg = isTr
      ? `Çok fazla istek. ${retryAfter ? `${retryAfter} saniye sonra` : "Lütfen bir süre sonra"} tekrar deneyin.`
      : `Too many requests. Please try again${retryAfter ? ` in ${retryAfter} seconds` : " later"}.`;
    throw new Error(msg);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `API hatası (${res.status})`);
  }

  return res.json();
}

/** Dosya yükleme için ayrı wrapper (multipart/form-data) */
async function uploadFetch(url, formData) {
  const token = _getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let res;

  try {
    res = await fetch(url, { method: "POST", headers, body: formData });
  } catch {
    throw new Error(
      _getLang() === "tr"
        ? "Ağ bağlantısı kurulamadı."
        : "Network connection failed.",
    );
  }

  if (res.status === 401) {
    _clearSession();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  return res.json();
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  // Dashboard
  getHivesSummary: () => authFetch(`${API_URL}/api/hives/summary`),
  getSensorData: () => authFetch(`${API_URL}/api/sensor-data`),
  getGatewayStatus: () => authFetch(`${API_URL}/api/gateway/status`),
  getWeather: () => authFetch(`${API_URL}/api/weather`),

  // Chart
  getHiveChart: (hiveId) => authFetch(`${API_URL}/api/hives/${hiveId}/chart`),

  // Hive CRUD
  getHives: () => authFetch(`${API_URL}/api/hives`),
  createHive: (data) =>
    authFetch(`${API_URL}/api/hives`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateHive: (id, data) =>
    authFetch(`${API_URL}/api/hives/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteHive: (id) =>
    authFetch(`${API_URL}/api/hives/${id}`, { method: "DELETE" }),

  // Backup & Restore
  getBackup: () => authFetch(`${API_URL}/api/backup`),
  restoreBackup: (data) =>
    authFetch(`${API_URL}/api/restore`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetData: (target = "sensor") =>
    authFetch(
      `${API_URL}/api/data/reset?target=${encodeURIComponent(target)}`,
      { method: "DELETE" },
    ),

  // Profile & Password
  updateProfile: (data) =>
    authFetch(`${API_URL}/api/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  changePassword: (currentPassword, newPassword) =>
    authFetch(`${API_URL}/api/auth/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Hive Photo Upload
  uploadHivePhoto: (hiveId, file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return uploadFetch(`${API_URL}/api/hives/${hiveId}/photo`, formData);
  },

  // Daily sensor data
  getDailySensorData: (days = 30, hiveId = null) => {
    const params = new URLSearchParams({ days });
    if (hiveId != null) params.append("hive_id", hiveId);
    return authFetch(`${API_URL}/api/sensor-data/daily?${params}`);
  },

  // Health check (auth gerektirmez)
  async getHealth() {
    let res;
    try {
      res = await fetch(`${API_URL}/api/health`);
    } catch {
      throw new Error("API hatası");
    }
    if (!res.ok) throw new Error("API hatası");
    return res.json();
  },
};

// ─── Veri dönüşümü ───────────────────────────────────────────────────────────

export function apiToHiveFormat(apiHive) {
  const isTr = _getLang() === "tr";

  const temp = apiHive.temp ?? apiHive.temperature ?? null;
  const humidity = apiHive.humidity ?? null;
  const vibration = apiHive.vibration ?? 0;
  const soundDb = apiHive.sound_db ?? null;

  let status = "stable";
  let alertType = null;
  let priority = 3;

  if (temp !== null) {
    const highTemp = temp > 38;
    const lowTemp = temp < 10;
    const highVib = vibration > 2_000;
    const warnTemp = temp > 36;
    const warnHum = humidity !== null && (humidity > 80 || humidity < 30);
    const warnVib = vibration > 1_000;

    if (highTemp || lowTemp || highVib) {
      status = "critical";
      priority = 1;
      if (highTemp)
        alertType =
          (isTr ? "Yüksek Sıcaklık (" : "High Temperature (") +
          temp.toFixed(1) +
          "°C)";
      else if (lowTemp)
        alertType =
          (isTr ? "Düşük Sıcaklık (" : "Low Temperature (") +
          temp.toFixed(1) +
          "°C)";
      else alertType = isTr ? "Yüksek Titreşim Alarmı" : "High Vibration Alert";
    } else if (warnTemp || warnHum || warnVib) {
      status = "warning";
      priority = 2;
      alertType = isTr ? "Dikkat Gerektiriyor" : "Attention Required";
    }
  }

  const lastUpdateRaw = apiHive.lastUpdate || apiHive.created_at;
  const timeDiff = lastUpdateRaw
    ? getTimeDiff(new Date(lastUpdateRaw), isTr)
    : isTr
      ? "Bilinmiyor"
      : "Unknown";

  const sound =
    soundDb !== null
      ? Math.max(0, 100 + soundDb)
      : vibration
        ? Math.min(100, vibration / 40)
        : 40;

  return {
    id: apiHive.id || apiHive.hive_id,
    name: apiHive.name || apiHive.id || "Kovan",
    location: apiHive.location || "",
    lat: apiHive.lat ?? null,
    lng: apiHive.lng ?? null,
    adapterType: apiHive.adapterType || "standard",
    deviceSerial: apiHive.deviceSerial || "",
    status,
    alertType,
    temp: temp ?? 0,
    humidity: humidity ?? 0,
    pressure: apiHive.pressure ?? 0,
    vibration,
    battery: apiHive.battery ?? 100,
    weight: apiHive.weight ?? 0,
    sound,
    soundDb,
    lastUpdate: timeDiff,
    lastActivity:
      alertType || (isTr ? "Tüm Sistemler Normal" : "All Systems Normal"),
    priority,
    hasData: apiHive.hasData !== undefined ? apiHive.hasData : temp !== null,
  };
}
