import { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, FileSpreadsheet, FileJson, FileDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsView = ({ hives }) => {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tooltipStyle = { backgroundColor: isDark ? '#1f2937' : '#ffffff', border: `1px solid ${isDark ? '#374151' : '#e0ddd5'}`, borderRadius: '8px' };
  const axisColor = isDark ? '#9ca3af' : '#888888';
  const gridColor = isDark ? '#374151' : '#e0ddd5';
  const [dateRange, setDateRange] = useState('7days'); // '7days', '30days', '90days'

  // Zaman serisi verisi (mock)
  const timeSeriesData = useMemo(() => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short' }),
      avgTemp: 34 + Math.random() * 2,
      avgHumidity: 55 + Math.random() * 10,
      critical: Math.floor(Math.random() * 3),
      warning: Math.floor(Math.random() * 5) + 2,
      stable: 19 - Math.floor(Math.random() * 3)
    }));
  }, [dateRange]);

  // Durum dağılımı
  const statusDistribution = useMemo(() => {
    const critical = hives.filter(h => h.status === 'critical').length;
    const warning = hives.filter(h => h.status === 'warning').length;
    const stable = hives.filter(h => h.status === 'stable').length;

    return [
      { name: lang === 'tr' ? 'Kritik' : 'Critical', value: critical, color: '#ef4444' },
      { name: lang === 'tr' ? 'Uyarı' : 'Warning', value: warning, color: '#f59e0b' },
      { name: lang === 'tr' ? 'Stabil' : 'Stable', value: stable, color: '#10b981' }
    ];
  }, [hives]);

  // Pil durumu dağılımı
  const batteryDistribution = useMemo(() => {
    return [
      { range: '0-20%', count: hives.filter(h => h.battery <= 20).length },
      { range: '21-50%', count: hives.filter(h => h.battery > 20 && h.battery <= 50).length },
      { range: '51-80%', count: hives.filter(h => h.battery > 50 && h.battery <= 80).length },
      { range: '81-100%', count: hives.filter(h => h.battery > 80).length }
    ];
  }, [hives]);

  // İstatistikler
  const stats = useMemo(() => {
    if (hives.length === 0) {
      return { avgTemp: '0.0', maxTemp: '0.0', minTemp: '0.0', avgHumidity: '0', avgBattery: '0', lowBattery: 0 };
    }
    const temps = hives.map(h => h.temp);
    const humidities = hives.map(h => h.humidity);
    const batteries = hives.map(h => h.battery);

    return {
      avgTemp: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
      maxTemp: Math.max(...temps).toFixed(1),
      minTemp: Math.min(...temps).toFixed(1),
      avgHumidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(0),
      avgBattery: (batteries.reduce((a, b) => a + b, 0) / batteries.length).toFixed(0),
      lowBattery: batteries.filter(b => b < 20).length
    };
  }, [hives]);

  const txt = {
    tr: {
      title: 'Raporlar & Analiz', subtitle: 'Kovan performansı ve istatistikler',
      last7: 'Son 7 Gün', last30: 'Son 30 Gün', last90: 'Son 90 Gün',
      avgTemp: 'Ort. Sıcaklık', maxTemp: 'Max Sıcaklık', minTemp: 'Min Sıcaklık',
      avgHum: 'Ort. Nem', avgBat: 'Ort. Pil', lowBat: 'Düşük Pil',
      tempHumTrend: 'Sıcaklık & Nem Trendi', statusDist: 'Durum Dağılımı',
      dailyChange: 'Günlük Durum Değişimi', batDist: 'Pil Durumu Dağılımı',
      tempC: 'Sıcaklık (°C)', humP: 'Nem (%)', critical: 'Kritik', warning: 'Uyarı', stable: 'Stabil',
      hiveCount: 'Kovan Sayısı', summaryTitle: 'Özet Rapor', findings: 'Önemli Bulgular', suggestions: 'Öneriler',
      f1: 'Ortalama sıcaklık ideal aralıkta', f2: 'Nem seviyeleri stabil',
      f3: 'kovanda pil değişimi gerekli', f4: 'Genel koloni sağlığı iyi durumda',
      s1: 'Haftalık rutin kontrole devam edin', s2: 'Düşük pilli kovanların bataryalarını değiştirin',
      s3: 'Kritik durumdaki kovanları öncelikli izleyin',
    },
    en: {
      title: 'Reports & Analytics', subtitle: 'Hive performance and statistics',
      last7: 'Last 7 Days', last30: 'Last 30 Days', last90: 'Last 90 Days',
      avgTemp: 'Avg. Temp', maxTemp: 'Max Temp', minTemp: 'Min Temp',
      avgHum: 'Avg. Humidity', avgBat: 'Avg. Battery', lowBat: 'Low Battery',
      tempHumTrend: 'Temperature & Humidity Trend', statusDist: 'Status Distribution',
      dailyChange: 'Daily Status Change', batDist: 'Battery Distribution',
      tempC: 'Temperature (°C)', humP: 'Humidity (%)', critical: 'Critical', warning: 'Warning', stable: 'Stable',
      hiveCount: 'Hive Count', summaryTitle: 'Summary Report', findings: 'Key Findings', suggestions: 'Suggestions',
      f1: 'Average temperature is in ideal range', f2: 'Humidity levels are stable',
      f3: 'hive(s) need battery replacement', f4: 'Overall colony health is good',
      s1: 'Continue weekly routine inspections', s2: 'Replace batteries of low-battery hives',
      s3: 'Prioritize monitoring of critical hives',
    }
  };
  const r = txt[lang] || txt.tr;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-1">{r.title}</h2>
          <p className="text-sm text-gray-500">{r.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
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
            onClick={() => exportCSV(hives)}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportExcel(hives)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileDown className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => exportJSON(hives)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => exportPDF(hives, stats, r)}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title={r.avgTemp} value={`${stats.avgTemp}°C`} icon="🌡️" />
        <KPICard title={r.maxTemp} value={`${stats.maxTemp}°C`} icon="🔥" />
        <KPICard title={r.minTemp} value={`${stats.minTemp}°C`} icon="❄️" />
        <KPICard title={r.avgHum} value={`${stats.avgHumidity}%`} icon="💧" />
        <KPICard title={r.avgBat} value={`${stats.avgBattery}%`} icon="🔋" />
        <KPICard title={r.lowBat} value={stats.lowBattery} icon="⚠️" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sıcaklık & Nem Trendi */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">{r.tempHumTrend}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={axisColor} style={{ fontSize: '12px' }} />
              <YAxis stroke={axisColor} style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={tooltipStyle}
                labelStyle={{ color: isDark ? '#f3f4f6' : '#1a1a1a' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avgTemp" stroke="#f59e0b" strokeWidth={2} name={r.tempC} />
              <Line type="monotone" dataKey="avgHumidity" stroke="#3b82f6" strokeWidth={2} name={r.humP} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Dağılımı (Pie Chart) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">{r.statusDist}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={tooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Durum Değişim Trendi (Stacked Bar) */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">{r.dailyChange}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" stroke={axisColor} style={{ fontSize: '12px' }} />
              <YAxis stroke={axisColor} style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name={r.critical} />
              <Bar dataKey="warning" stackId="a" fill="#f59e0b" name={r.warning} />
              <Bar dataKey="stable" stackId="a" fill="#10b981" name={r.stable} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pil Durumu Dağılımı */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">{r.batDist}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={batteryDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="range" stroke={axisColor} style={{ fontSize: '12px' }} />
              <YAxis stroke={axisColor} style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="count" fill="#f59e0b" name={r.hiveCount} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Özet Rapor */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-100">{r.summaryTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">{r.findings}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{r.f1} ({stats.avgTemp}°C)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{r.f2} ({stats.avgHumidity}%)</span>
              </li>
              {stats.lowBattery > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">⚠️</span>
                  <span>{stats.lowBattery} {r.f3}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-400">ℹ️</span>
                <span>{r.f4}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">{r.suggestions}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span>→</span>
                <span>{r.s1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                <span>{r.s2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>→</span>
                <span>{r.s3}</span>
              </li>
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

// CSV Export Utility
function exportCSV(hives) {
  const headers = ['ID', 'Name', 'Location', 'Status', 'Temperature (°C)', 'Humidity (%)', 'Battery (%)', 'Weight (kg)', 'Sound (dB)', 'Last Update'];
  const rows = hives.map(h => [
    h.id,
    h.name || h.id,
    h.location || '',
    h.status,
    h.temp,
    h.humidity,
    h.battery,
    h.weight,
    h.sound,
    h.lastUpdate
  ]);

  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hexora-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportExcel(hives) {
  const escapeCsv = (val) => {
    const str = String(val ?? '');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const headers = ['ID', 'İsim', 'Konum', 'Durum', 'Sıcaklık (°C)', 'Nem (%)', 'Pil (%)', 'Ağırlık (kg)', 'Ses (dB)', 'Son Güncelleme'];
  const rows = hives.map(h => [h.id, h.name || h.id, h.location || '', h.status, h.temp, h.humidity, h.battery, h.weight, h.sound, h.lastUpdate]);

  const temps = hives.map(h => h.temp);
  const humids = hives.map(h => h.humidity);
  const summaryRows = [
    [],
    ['Hexora Özet Rapor'],
    ['Tarih', new Date().toLocaleDateString('tr-TR')],
    ['Toplam Kovan', hives.length],
    ['Ort. Sıcaklık', temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) + '°C' : '-'],
    ['Max Sıcaklık', temps.length ? Math.max(...temps).toFixed(1) + '°C' : '-'],
    ['Min Sıcaklık', temps.length ? Math.min(...temps).toFixed(1) + '°C' : '-'],
    ['Ort. Nem', humids.length ? (humids.reduce((a, b) => a + b, 0) / humids.length).toFixed(0) + '%' : '-'],
    ['Kritik Kovan', hives.filter(h => h.status === 'critical').length],
    ['Uyarı Kovan', hives.filter(h => h.status === 'warning').length],
    ['Stabil Kovan', hives.filter(h => h.status === 'stable').length],
  ];

  const csvContent = [headers, ...rows, ...summaryRows].map(row => row.map(escapeCsv).join(',')).join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hexora-rapor-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportPDF(hives, stats, r) {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('tr-TR');

  // Header
  doc.setFontSize(20);
  doc.setTextColor(245, 158, 11);
  doc.text('Hexora', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Rapor Tarihi: ${date}`, 14, 28);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(r.summaryTitle || 'Ozet Rapor', 14, 42);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const summaryLines = [
    `Toplam Kovan: ${hives.length}`,
    `${r.avgTemp}: ${stats.avgTemp}\u00B0C  |  ${r.maxTemp}: ${stats.maxTemp}\u00B0C  |  ${r.minTemp}: ${stats.minTemp}\u00B0C`,
    `${r.avgHum}: %${stats.avgHumidity}  |  ${r.avgBat}: %${stats.avgBattery}  |  ${r.lowBat}: ${stats.lowBattery}`,
    `Kritik: ${hives.filter(h => h.status === 'critical').length}  |  Uyari: ${hives.filter(h => h.status === 'warning').length}  |  Stabil: ${hives.filter(h => h.status === 'stable').length}`,
  ];
  summaryLines.forEach((line, i) => doc.text(line, 14, 52 + i * 7));

  // Hive table
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text('Kovan Detaylari', 14, 88);

  autoTable(doc, {
    startY: 94,
    head: [['ID', 'Isim', 'Durum', 'Sicaklik', 'Nem', 'Pil', 'Ses', 'Son Guncelleme']],
    body: hives.map(h => [
      h.id,
      h.name || h.id,
      h.status === 'critical' ? 'KRITIK' : h.status === 'warning' ? 'UYARI' : 'STABIL',
      `${h.temp}\u00B0C`,
      `%${h.humidity}`,
      `%${h.battery}`,
      `${h.sound} dB`,
      h.lastUpdate
    ]),
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0], fontStyle: 'bold' },
    bodyStyles: { textColor: [50, 50, 50] },
    alternateRowStyles: { fillColor: [250, 249, 246] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Findings
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(r.findings || 'Onemli Bulgular', 14, finalY);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  [r.f1, r.f2, `${stats.lowBattery} ${r.f3}`, r.f4].forEach((f, i) => {
    doc.text(`\u2022 ${f}`, 18, finalY + 8 + i * 6);
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(`Hexora - AI Destekli IoT Kovan Yonetim Sistemi | ${date}`, 14, pageHeight - 10);

  doc.save(`hexora-rapor-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportJSON(hives) {
  const data = hives.map(h => ({
    id: h.id,
    name: h.name || h.id,
    location: h.location || '',
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
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hexora-rapor-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
