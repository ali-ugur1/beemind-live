import { useMemo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileDown,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { api } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportsView = ({ hives }) => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const toast = useToast();
  const isDark = theme === "dark";
  const tooltipStyle = {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    border: `1px solid ${isDark ? "#374151" : "#e0ddd5"}`,
    borderRadius: "8px",
  };
  const axisColor = isDark ? "#9ca3af" : "#888888";
  const gridColor = isDark ? "#374151" : "#e0ddd5";
  const [dateRange, setDateRange] = useState("7days"); // '7days', '30days', '90days'
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
    let cancelled = false;
    api
      .getDailySensorData(days)
      .then((res) => {
        if (cancelled) return;
        if (res.status === "ok" && Array.isArray(res.data)) {
          setDailyData(res.data);
        }
      })
      .catch(() => {
        if (cancelled) return;
        toast.error(
          lang === "tr"
            ? "Geçmiş veri yüklenemedi"
            : "Failed to load historical data",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange, lang, toast]);

  // Durum sayıları – tek geçişte (filter * 3 yerine)
  const statusCounts = useMemo(() => {
    return hives.reduce(
      (acc, h) => {
        if (h.status === "critical") acc.critical += 1;
        else if (h.status === "warning") acc.warning += 1;
        else if (h.status === "stable") acc.stable += 1;
        return acc;
      },
      { critical: 0, warning: 0, stable: 0 },
    );
  }, [hives]);

  const timeSeriesData = useMemo(() => {
    const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;
    const locale = lang === "tr" ? "tr-TR" : "en-US";
    const { critical, warning, stable } = statusCounts;

    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().slice(0, 10);
      const real = dailyData.find((d) => d.date === dateKey);
      const isLast = i === days - 1;
      return {
        date: date.toLocaleDateString(locale, {
          day: "2-digit",
          month: "short",
        }),
        avgTemp: real?.avgTemp ?? null,
        avgHumidity: real?.avgHumidity ?? null,
        // Stacked bar yalnızca son günde anlamlı; diğer günlerde geçmiş snapshot yoksa 0 göster.
        critical: real?.critical ?? (isLast ? critical : 0),
        warning: real?.warning ?? (isLast ? warning : 0),
        stable: real?.stable ?? (isLast ? stable : 0),
      };
    });
  }, [dateRange, dailyData, statusCounts, lang]);

  // Durum dağılımı
  const statusDistribution = useMemo(() => {
    const { critical, warning, stable } = statusCounts;
    return [
      {
        name: lang === "tr" ? "Kritik" : "Critical",
        value: critical,
        color: "#ef4444",
      },
      {
        name: lang === "tr" ? "Uyarı" : "Warning",
        value: warning,
        color: "#f59e0b",
      },
      {
        name: lang === "tr" ? "Stabil" : "Stable",
        value: stable,
        color: "#10b981",
      },
    ].filter((d) => d.value > 0); // boş dilimleri gösterme
  }, [statusCounts, lang]);

  // Pil durumu dağılımı
  const batteryDistribution = useMemo(() => {
    const buckets = { b1: 0, b2: 0, b3: 0, b4: 0 };
    for (const h of hives) {
      const b = h.battery ?? 0;
      if (b <= 20) buckets.b1 += 1;
      else if (b <= 50) buckets.b2 += 1;
      else if (b <= 80) buckets.b3 += 1;
      else buckets.b4 += 1;
    }
    return [
      { range: "0-20%", count: buckets.b1 },
      { range: "21-50%", count: buckets.b2 },
      { range: "51-80%", count: buckets.b3 },
      { range: "81-100%", count: buckets.b4 },
    ];
  }, [hives]);

  // İstatistikler
  const stats = useMemo(() => {
    if (hives.length === 0) {
      return {
        avgTemp: "-",
        maxTemp: "-",
        minTemp: "-",
        avgHumidity: "-",
        avgBattery: "-",
        lowBattery: 0,
        empty: true,
      };
    }
    const temps = hives.map((h) => h.temp).filter((v) => Number.isFinite(v));
    const humidities = hives
      .map((h) => h.humidity)
      .filter((v) => Number.isFinite(v));
    const batteries = hives
      .map((h) => h.battery)
      .filter((v) => Number.isFinite(v));

    const avg = (arr) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      avgTemp: temps.length ? avg(temps).toFixed(1) : "-",
      maxTemp: temps.length ? Math.max(...temps).toFixed(1) : "-",
      minTemp: temps.length ? Math.min(...temps).toFixed(1) : "-",
      avgHumidity: humidities.length ? avg(humidities).toFixed(0) : "-",
      avgBattery: batteries.length ? avg(batteries).toFixed(0) : "-",
      lowBattery: batteries.filter((b) => b < 20).length,
      empty: false,
    };
  }, [hives]);

  const txt = {
    tr: {
      title: "Raporlar & Analiz",
      subtitle: "Kovan performansı ve istatistikler",
      last7: "Son 7 Gün",
      last30: "Son 30 Gün",
      last90: "Son 90 Gün",
      avgTemp: "Ort. Sıcaklık",
      maxTemp: "Max Sıcaklık",
      minTemp: "Min Sıcaklık",
      avgHum: "Ort. Nem",
      avgBat: "Ort. Pil",
      lowBat: "Düşük Pil",
      tempHumTrend: "Sıcaklık & Nem Trendi",
      statusDist: "Durum Dağılımı",
      dailyChange: "Günlük Durum Değişimi",
      batDist: "Pil Durumu Dağılımı",
      tempC: "Sıcaklık (°C)",
      humP: "Nem (%)",
      critical: "Kritik",
      warning: "Uyarı",
      stable: "Stabil",
      hiveCount: "Kovan Sayısı",
      summaryTitle: "Özet Rapor",
      findings: "Önemli Bulgular",
      suggestions: "Öneriler",
    },
    en: {
      title: "Reports & Analytics",
      subtitle: "Hive performance and statistics",
      last7: "Last 7 Days",
      last30: "Last 30 Days",
      last90: "Last 90 Days",
      avgTemp: "Avg. Temp",
      maxTemp: "Max Temp",
      minTemp: "Min Temp",
      avgHum: "Avg. Humidity",
      avgBat: "Avg. Battery",
      lowBat: "Low Battery",
      tempHumTrend: "Temperature & Humidity Trend",
      statusDist: "Status Distribution",
      dailyChange: "Daily Status Change",
      batDist: "Battery Distribution",
      tempC: "Temperature (°C)",
      humP: "Humidity (%)",
      critical: "Critical",
      warning: "Warning",
      stable: "Stable",
      hiveCount: "Hive Count",
      summaryTitle: "Summary Report",
      findings: "Key Findings",
      suggestions: "Suggestions",
    },
  };
  const r = txt[lang] || txt.tr;

  // Dinamik bulgular & öneriler — UI ve PDF aynı kaynağı paylaşır
  const { findings, suggestions } = useMemo(() => {
    const avgTempNum = parseFloat(stats.avgTemp);
    const avgHumNum = parseFloat(stats.avgHumidity);
    const { critical: criticalCount, warning: warningCount } = statusCounts;
    const isTr = lang === "tr";

    const findingsList = [
      {
        ok: avgTempNum >= 34 && avgTempNum <= 36,
        warn: !Number.isNaN(avgTempNum) && (avgTempNum > 36 || avgTempNum < 30),
        text: Number.isNaN(avgTempNum)
          ? isTr
            ? "Sıcaklık verisi henüz yok"
            : "No temperature data yet"
          : avgTempNum >= 34 && avgTempNum <= 36
            ? `${isTr ? "Ort. sıcaklık ideal aralıkta" : "Avg. temperature in ideal range"} (${stats.avgTemp}°C)`
            : `${isTr ? "Ort. sıcaklık dikkat istiyor" : "Avg. temperature needs attention"} (${stats.avgTemp}°C)`,
      },
      {
        ok: avgHumNum >= 40 && avgHumNum <= 70,
        warn: !Number.isNaN(avgHumNum) && (avgHumNum > 70 || avgHumNum < 40),
        text: Number.isNaN(avgHumNum)
          ? isTr
            ? "Nem verisi henüz yok"
            : "No humidity data yet"
          : avgHumNum >= 40 && avgHumNum <= 70
            ? `${isTr ? "Nem seviyeleri stabil" : "Humidity levels stable"} (%${stats.avgHumidity})`
            : `${isTr ? "Nem seviyesi sınır dışı" : "Humidity out of range"} (%${stats.avgHumidity})`,
      },
      stats.lowBattery > 0 && {
        ok: false,
        warn: true,
        text: `${stats.lowBattery} ${isTr ? "kovanda pil değişimi gerekli" : "hive(s) need battery replacement"}`,
      },
      {
        ok: criticalCount === 0 && warningCount === 0,
        warn: criticalCount > 0,
        text:
          criticalCount > 0
            ? `${criticalCount} ${isTr ? "kovanda kritik durum!" : "hive(s) in critical state!"}`
            : warningCount > 0
              ? `${warningCount} ${isTr ? "kovanda uyarı durumu" : "hive(s) with warnings"}`
              : isTr
                ? "Genel koloni sağlığı iyi"
                : "Overall colony health is good",
      },
    ].filter(Boolean);

    const suggestionsList = [
      isTr
        ? "Haftalık rutin kontrole devam edin"
        : "Continue weekly routine inspections",
      stats.lowBattery > 0
        ? isTr
          ? `${stats.lowBattery} kovanda pil değiştirin`
          : `Replace batteries in ${stats.lowBattery} hive(s)`
        : isTr
          ? "Pil seviyeleri normal"
          : "Battery levels normal",
      criticalCount > 0
        ? isTr
          ? `Kritik ${criticalCount} kovana öncelik verin`
          : `Prioritize ${criticalCount} critical hive(s)`
        : avgTempNum > 36
          ? isTr
            ? "Yüksek sıcaklık — havalandırmayı kontrol edin"
            : "High temp — check ventilation"
          : isTr
            ? "Tüm sistemler normal görünüyor"
            : "All systems appear normal",
    ];

    return { findings: findingsList, suggestions: suggestionsList };
  }, [stats, statusCounts, lang]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">{r.title}</h2>
          <p className="text-sm text-gray-500">{r.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:border-amber-500"
          >
            <option value="7days">{r.last7}</option>
            <option value="30days">{r.last30}</option>
            <option value="90days">{r.last90}</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={() => exportCSV(hives, lang)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportExcel(hives, stats, statusCounts, lang)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileDown className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => exportJSON(hives)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium rounded-lg transition-colors text-sm"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() =>
              exportPDF(
                hives,
                stats,
                statusCounts,
                findings,
                suggestions,
                r,
                lang,
              )
            }
            className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title={r.avgTemp}
          value={stats.empty ? "-" : `${stats.avgTemp}°C`}
          icon="🌡️"
        />
        <KPICard
          title={r.maxTemp}
          value={stats.empty ? "-" : `${stats.maxTemp}°C`}
          icon="🔥"
        />
        <KPICard
          title={r.minTemp}
          value={stats.empty ? "-" : `${stats.minTemp}°C`}
          icon="❄️"
        />
        <KPICard
          title={r.avgHum}
          value={stats.empty ? "-" : `${stats.avgHumidity}%`}
          icon="💧"
        />
        <KPICard
          title={r.avgBat}
          value={stats.empty ? "-" : `${stats.avgBattery}%`}
          icon="🔋"
        />
        <KPICard title={r.lowBat} value={stats.lowBattery} icon="⚠️" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sıcaklık & Nem Trendi */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            {r.tempHumTrend}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={axisColor}
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke={axisColor} style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: isDark ? "#f3f4f6" : "#1a1a1a" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgTemp"
                stroke="#f59e0b"
                strokeWidth={2}
                name={r.tempC}
                connectNulls
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avgHumidity"
                stroke="#3b82f6"
                strokeWidth={2}
                name={r.humP}
                connectNulls
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Dağılımı (Pie Chart) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            {r.statusDist}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Değişim Trendi (Stacked Bar) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            {r.dailyChange}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={axisColor}
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke={axisColor} style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar
                dataKey="critical"
                stackId="a"
                fill="#ef4444"
                name={r.critical}
              />
              <Bar
                dataKey="warning"
                stackId="a"
                fill="#f59e0b"
                name={r.warning}
              />
              <Bar
                dataKey="stable"
                stackId="a"
                fill="#10b981"
                name={r.stable}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pil Durumu Dağılımı */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
            {r.batDist}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={batteryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="range"
                stroke={axisColor}
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke={axisColor} style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#f59e0b" name={r.hiveCount} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Özet Rapor */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-100">
            {r.summaryTitle}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              {r.findings}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={
                      f.warn
                        ? "text-amber-400"
                        : f.ok
                          ? "text-emerald-400"
                          : "text-blue-400"
                    }
                  >
                    {f.warn ? "⚠️" : f.ok ? "✓" : "ℹ️"}
                  </span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              {r.suggestions}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, icon }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-xs text-gray-500 mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-100">{value}</p>
  </div>
);

export default ReportsView;

// ---------- Yardımcılar ----------
const csvEscape = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadBlob = (content, filename, mime) => {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const todayISO = () => new Date().toISOString().slice(0, 10);

// jsPDF default fontu Türkçe karakterleri bozar; ASCII'ye indir.
const asciiTr = (s) =>
  String(s ?? "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");

// ---------- CSV Export ----------
function exportCSV(hives, lang = "tr") {
  const isTr = lang === "tr";
  const headers = isTr
    ? [
        "ID",
        "İsim",
        "Konum",
        "Durum",
        "Sıcaklık (°C)",
        "Nem (%)",
        "Pil (%)",
        "Ağırlık (kg)",
        "Ses (dB)",
        "Son Güncelleme",
      ]
    : [
        "ID",
        "Name",
        "Location",
        "Status",
        "Temperature (°C)",
        "Humidity (%)",
        "Battery (%)",
        "Weight (kg)",
        "Sound (dB)",
        "Last Update",
      ];

  const rows = hives.map((h) => [
    h.id,
    h.name || h.id,
    h.location || "",
    h.status,
    h.temp,
    h.humidity,
    h.battery,
    h.weight,
    h.sound,
    h.lastUpdate,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  downloadBlob(`\uFEFF${csv}`, `beemora-report-${todayISO()}.csv`, "text/csv");
}

// ---------- Excel Export (CSV with .csv; Excel açar) ----------
function exportExcel(hives, stats, statusCounts, lang = "tr") {
  const isTr = lang === "tr";
  const headers = isTr
    ? [
        "ID",
        "İsim",
        "Konum",
        "Durum",
        "Sıcaklık (°C)",
        "Nem (%)",
        "Pil (%)",
        "Ağırlık (kg)",
        "Ses (dB)",
        "Son Güncelleme",
      ]
    : [
        "ID",
        "Name",
        "Location",
        "Status",
        "Temperature (°C)",
        "Humidity (%)",
        "Battery (%)",
        "Weight (kg)",
        "Sound (dB)",
        "Last Update",
      ];

  const rows = hives.map((h) => [
    h.id,
    h.name || h.id,
    h.location || "",
    h.status,
    h.temp,
    h.humidity,
    h.battery,
    h.weight,
    h.sound,
    h.lastUpdate,
  ]);

  const summaryRows = [
    [],
    [isTr ? "BeeMora Özet Rapor" : "BeeMora Summary Report"],
    [
      isTr ? "Tarih" : "Date",
      new Date().toLocaleDateString(isTr ? "tr-TR" : "en-US"),
    ],
    [isTr ? "Toplam Kovan" : "Total Hives", hives.length],
    [
      isTr ? "Ort. Sıcaklık" : "Avg. Temp",
      stats.avgTemp === "-" ? "-" : `${stats.avgTemp}°C`,
    ],
    [
      isTr ? "Max Sıcaklık" : "Max Temp",
      stats.maxTemp === "-" ? "-" : `${stats.maxTemp}°C`,
    ],
    [
      isTr ? "Min Sıcaklık" : "Min Temp",
      stats.minTemp === "-" ? "-" : `${stats.minTemp}°C`,
    ],
    [
      isTr ? "Ort. Nem" : "Avg. Humidity",
      stats.avgHumidity === "-" ? "-" : `%${stats.avgHumidity}`,
    ],
    [isTr ? "Kritik Kovan" : "Critical", statusCounts.critical],
    [isTr ? "Uyarı Kovan" : "Warning", statusCounts.warning],
    [isTr ? "Stabil Kovan" : "Stable", statusCounts.stable],
  ];

  const csv = [headers, ...rows, ...summaryRows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  downloadBlob(
    `\uFEFF${csv}`,
    `beemora-${isTr ? "rapor" : "report"}-${todayISO()}.csv`,
    "text/csv",
  );
}

// ---------- PDF Export ----------
function exportPDF(
  hives,
  stats,
  statusCounts,
  findings,
  suggestions,
  r,
  lang = "tr",
) {
  const doc = new jsPDF();
  const isTr = lang === "tr";
  const date = new Date().toLocaleDateString(isTr ? "tr-TR" : "en-US");
  const t = (s) => asciiTr(s);

  // Header
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11);
  doc.text("BeeMora", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(t(`${isTr ? "Rapor Tarihi" : "Report Date"}: ${date}`), 14, 28);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(t(r.summaryTitle), 14, 42);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const summaryLines = [
    `${isTr ? "Toplam Kovan" : "Total Hives"}: ${hives.length}`,
    `${r.avgTemp}: ${stats.avgTemp}${stats.avgTemp === "-" ? "" : "\u00B0C"}  |  ${r.maxTemp}: ${stats.maxTemp}${stats.maxTemp === "-" ? "" : "\u00B0C"}  |  ${r.minTemp}: ${stats.minTemp}${stats.minTemp === "-" ? "" : "\u00B0C"}`,
    `${r.avgHum}: ${stats.avgHumidity === "-" ? "-" : "%" + stats.avgHumidity}  |  ${r.avgBat}: ${stats.avgBattery === "-" ? "-" : "%" + stats.avgBattery}  |  ${r.lowBat}: ${stats.lowBattery}`,
    `${r.critical}: ${statusCounts.critical}  |  ${r.warning}: ${statusCounts.warning}  |  ${r.stable}: ${statusCounts.stable}`,
  ];
  summaryLines.forEach((line, i) => doc.text(t(line), 14, 52 + i * 7));

  // Hive table
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(t(isTr ? "Kovan Detayları" : "Hive Details"), 14, 88);

  const labelCritical = t(r.critical).toUpperCase();
  const labelWarning = t(r.warning).toUpperCase();
  const labelStable = t(r.stable).toUpperCase();

  autoTable(doc, {
    startY: 94,
    head: [
      [
        "ID",
        t(isTr ? "İsim" : "Name"),
        t(isTr ? "Durum" : "Status"),
        t(isTr ? "Sıcaklık" : "Temp"),
        t(isTr ? "Nem" : "Humidity"),
        t(isTr ? "Pil" : "Battery"),
        t(isTr ? "Ses" : "Sound"),
        t(isTr ? "Son Güncelleme" : "Last Update"),
      ],
    ],
    body: hives.map((h) => [
      h.id,
      t(h.name || h.id),
      h.status === "critical"
        ? labelCritical
        : h.status === "warning"
          ? labelWarning
          : labelStable,
      `${h.temp}\u00B0C`,
      `%${h.humidity}`,
      `%${h.battery}`,
      `${h.sound} dB`,
      t(h.lastUpdate),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    bodyStyles: { textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [250, 249, 246] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Findings & Suggestions — UI ile aynı dinamik veriden
  let y = doc.lastAutoTable.finalY + 15;
  const pageHeight = doc.internal.pageSize.height;

  const ensureSpace = (needed) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  ensureSpace(10);
  doc.text(t(r.findings), 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  findings.forEach((f) => {
    ensureSpace(6);
    const prefix = f.warn ? "[!]" : f.ok ? "[OK]" : "[i]";
    doc.text(t(`${prefix} ${f.text}`), 18, y);
    y += 6;
  });

  y += 6;
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  ensureSpace(10);
  doc.text(t(r.suggestions), 14, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  suggestions.forEach((s) => {
    ensureSpace(6);
    doc.text(t(`- ${s}`), 18, y);
    y += 6;
  });

  // Footer (tüm sayfalara)
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(
      t(
        `BeeMora - ${isTr ? "AI Destekli IoT Kovan Yönetim Sistemi" : "AI-Powered IoT Hive Management"} | ${date} | ${i}/${pageCount}`,
      ),
      14,
      pageHeight - 10,
    );
  }

  doc.save(`beemora-${isTr ? "rapor" : "report"}-${todayISO()}.pdf`);
}

// ---------- JSON Export ----------
function exportJSON(hives) {
  const data = hives.map((h) => ({
    id: h.id,
    name: h.name || h.id,
    location: h.location || "",
    status: h.status,
    temperature: h.temp,
    humidity: h.humidity,
    battery: h.battery,
    weight: h.weight,
    sound: h.sound,
    alertType: h.alertType || null,
    lastUpdate: h.lastUpdate,
    exportDate: new Date().toISOString(),
  }));
  downloadBlob(
    JSON.stringify(data, null, 2),
    `beemora-rapor-${todayISO()}.json`,
    "application/json",
  );
}
