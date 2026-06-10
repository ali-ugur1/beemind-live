import { initializeApp } from "firebase/app";
import { getDatabase, ref, query, orderByChild, limitToLast, onValue } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://beemora-4893a-default-rtdb.firebaseio.com",
  projectId: "beemora-4893a",
};

let app;
let db;

function getDb() {
  if (!db) {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db;
}

function parseLatestEntry(data) {
  if (!data || typeof data !== "object") return null;

  const entries = Object.values(data);
  if (entries.length === 0) return null;

  const latest = entries.reduce((a, b) =>
    (b.timestamp || 0) > (a.timestamp || 0) ? b : a
  );

  return {
    temperature: latest.temperature ?? null,
    humidity: latest.humidity ?? null,
    pressure: latest.pressure ?? null,
    co2: latest.co2 ?? null,
    tvoc: latest.tvoc ?? null,
    sound_db: latest.sound_db ?? null,
    vibration: latest.vibration ?? 0,
    battery: latest.bat_percent ?? null,
    bat_voltage: latest.bat_voltage ?? null,
    timestamp: latest.timestamp ? latest.timestamp * 1000 : Date.now(),
  };
}

export function subscribeToSensorData(callback) {
  try {
    const database = getDb();
    const sensorQuery = query(
      ref(database),
      orderByChild("timestamp"),
      limitToLast(1)
    );

    return onValue(sensorQuery, (snapshot) => {
      const data = snapshot.val();
      const parsed = parseLatestEntry(data);
      if (parsed) callback(parsed);
    }, (error) => {
      console.warn("[Firebase] Listener error:", error.message);
    });
  } catch (err) {
    console.warn("[Firebase] Init error:", err.message);
    return () => {};
  }
}
