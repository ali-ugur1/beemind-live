import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const REQUIRED_COLS = ["id", "name"];
const OPTIONAL_COLS = ["location", "temp", "humidity", "battery", "weight", "status"];

const STATUS_VALUES = new Set(["critical", "warning", "stable"]);

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { error: "empty", rows: [] };

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  const missingRequired = REQUIRED_COLS.filter((c) => !headers.includes(c));
  if (missingRequired.length > 0) {
    return { error: `missing_cols:${missingRequired.join(",")}`, rows: [] };
  }

  const rows = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Basic CSV parse (handles quoted fields)
    const cells = [];
    let inQuotes = false;
    let cell = "";
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx]?.replace(/^"|"$/g, "") ?? "";
    });

    if (!row.id || !row.name) {
      errors.push(i + 1);
      continue;
    }

    const parsed = {
      id: row.id,
      name: row.name,
      location: row.location || "",
      temp: row.temp !== "" ? parseFloat(row.temp) : null,
      humidity: row.humidity !== "" ? parseFloat(row.humidity) : null,
      battery: row.battery !== "" ? parseFloat(row.battery) : null,
      weight: row.weight !== "" ? parseFloat(row.weight) : null,
      status: STATUS_VALUES.has(row.status) ? row.status : "stable",
      priority: row.status === "critical" ? 1 : row.status === "warning" ? 2 : 3,
      hasData: true,
    };
    rows.push(parsed);
  }

  return { error: null, rows, skippedLines: errors };
}

const TEMPLATE_CSV =
  "id,name,location,temp,humidity,battery,weight,status\n" +
  "HIVE-001,Garden Hive 1,North Garden,35.2,55,88,32.5,stable\n" +
  "HIVE-002,Garden Hive 2,South Field,36.8,62,45,28.1,warning\n" +
  "HIVE-003,Apiary East,East Meadow,38.5,70,22,25.0,critical\n";

const CSVImportModal = ({ onClose, onImport }) => {
  const { lang } = useLanguage();
  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus the dialog on mount; restore on unmount
  useEffect(() => {
    const prev = document.activeElement;
    dialogRef.current?.focus();
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = original;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [onClose]);
  const [dragOver, setDragOver] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imported, setImported] = useState(false);

  const tr = {
    title: "CSV ile Kovan İçe Aktar",
    drop: "CSV dosyasını buraya bırakın veya",
    browse: "dosya seçin",
    template: "Örnek Şablon İndir",
    previewTitle: "Önizleme",
    rows: "satır bulundu",
    skipped: "satır atlandı (eksik alan)",
    import: "İçe Aktar",
    cancel: "İptal",
    success: "kovan başarıyla içe aktarıldı!",
    errorEmpty: "Dosya boş veya geçersiz format.",
    errorMissingCols: "Zorunlu sütunlar eksik:",
    colsRequired: "Zorunlu: id, name",
    colsOptional: "İsteğe bağlı: location, temp, humidity, battery, weight, status",
    statusNote: "Geçerli durum değerleri: stable, warning, critical",
  };

  const en = {
    title: "Import Hives from CSV",
    drop: "Drop your CSV file here or",
    browse: "browse",
    template: "Download Sample Template",
    previewTitle: "Preview",
    rows: "rows found",
    skipped: "rows skipped (missing fields)",
    import: "Import",
    cancel: "Cancel",
    success: "hives imported successfully!",
    errorEmpty: "File is empty or invalid format.",
    errorMissingCols: "Required columns missing:",
    colsRequired: "Required: id, name",
    colsOptional: "Optional: location, temp, humidity, battery, weight, status",
    statusNote: "Valid status values: stable, warning, critical",
  };

  const tx = lang === "tr" ? tr : en;

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseError(tx.errorEmpty);
      setParsed(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = parseCSV(e.target.result);
      if (result.error) {
        if (result.error.startsWith("missing_cols:")) {
          setParseError(`${tx.errorMissingCols} ${result.error.split(":")[1]}`);
        } else {
          setParseError(tx.errorEmpty);
        }
        setParsed(null);
      } else {
        setParsed(result);
        setParseError(null);
      }
    };
    reader.readAsText(file, "UTF-8");
  }, [tx]);

  const handleFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = () => {
    if (!parsed?.rows?.length) return;
    onImport?.(parsed.rows);
    setImported(true);
    setTimeout(onClose, 1500);
  };

  const downloadTemplate = () => {
    const blob = new Blob(["﻿" + TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "beemora-import-template.csv",
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-w-xl w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Upload className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-100">{tx.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Drop zone */}
          {!parsed && !imported && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-amber-500 bg-amber-500/10" : "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                }`}
              >
                <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  {tx.drop}{" "}
                  <span className="text-amber-400 underline underline-offset-2">{tx.browse}</span>
                </p>
                <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileInput} />
              </div>

              {parseError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{parseError}</p>
                </div>
              )}

              {/* Format guide */}
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-1">
                <p className="text-xs text-gray-400">{tx.colsRequired}</p>
                <p className="text-xs text-gray-500">{tx.colsOptional}</p>
                <p className="text-xs text-gray-600">{tx.statusNote}</p>
              </div>

              <button onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                <Download className="w-4 h-4" />
                {tx.template}
              </button>
            </>
          )}

          {/* Preview */}
          {parsed && !imported && (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm text-gray-200 font-medium">{fileName}</p>
                  <p className="text-xs text-gray-500">
                    {parsed.rows.length} {tx.rows}
                    {parsed.skippedLines?.length > 0 && ` · ${parsed.skippedLines.length} ${tx.skipped}`}
                  </p>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-800">
                <table className="w-full text-xs">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      {["ID", lang === "tr" ? "İsim" : "Name", lang === "tr" ? "Konum" : "Location", lang === "tr" ? "Durum" : "Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-gray-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((row, i) => (
                      <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-3 py-2 text-gray-300 font-mono">{row.id}</td>
                        <td className="px-3 py-2 text-gray-200">{row.name}</td>
                        <td className="px-3 py-2 text-gray-400">{row.location || "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            row.status === "critical" ? "bg-red-500/20 text-red-300"
                            : row.status === "warning" ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                          }`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Success */}
          {imported && (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
              <p className="text-base font-semibold text-gray-100">
                {parsed?.rows?.length} {tx.success}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!imported && (
          <div className="flex justify-end gap-3 px-6 pb-5">
            <button onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
              {tx.cancel}
            </button>
            {parsed && (
              <button onClick={handleImport} disabled={!parsed.rows.length}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-black font-semibold rounded-lg text-sm transition-colors">
                {tx.import} ({parsed.rows.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVImportModal;
