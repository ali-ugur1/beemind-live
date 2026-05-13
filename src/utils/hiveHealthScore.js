export function hiveHealthScore(hive) {
  if (!hive) return 0;

  let score = 0;

  // Status: 40 points max
  if (hive.status === "stable") score += 40;
  else if (hive.status === "warning") score += 20;
  else score += 5; // critical

  // Temperature (ideal 32-38°C): 25 points max
  const temp = hive.temp ?? 35;
  if (temp >= 32 && temp <= 38) score += 25;
  else if (temp >= 30 && temp <= 40) score += 15;
  else if (temp >= 28 && temp <= 42) score += 8;

  // Humidity (ideal 50-75%): 20 points max
  const hum = hive.humidity ?? 60;
  if (hum >= 50 && hum <= 75) score += 20;
  else if (hum >= 40 && hum <= 80) score += 12;
  else score += 5;

  // Battery: 15 points max
  const bat = hive.battery ?? 50;
  score += Math.round((bat / 100) * 15);

  // Max = 40 + 25 + 20 + 15 = 100, scale to 1-10
  return Math.max(1, Math.min(10, Math.round(score / 10)));
}

export function healthScoreColor(score) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-red-400";
}

export function healthScoreBg(score) {
  if (score >= 8) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 5) return "bg-amber-500/20 border-amber-500/30";
  return "bg-red-500/20 border-red-500/30";
}

export function healthScoreLabel(score, lang) {
  if (lang === "tr") {
    if (score >= 8) return "Sağlıklı";
    if (score >= 5) return "Orta";
    return "Dikkat";
  }
  if (score >= 8) return "Healthy";
  if (score >= 5) return "Fair";
  return "At Risk";
}

export function healthScoreEmoji(score) {
  if (score >= 8) return "🟢";
  if (score >= 5) return "🟡";
  return "🔴";
}
