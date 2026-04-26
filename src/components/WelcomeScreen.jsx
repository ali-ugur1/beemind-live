import { useState, useEffect, useCallback } from "react";
import {
  ArrowRight,
  Wifi,
  Shield,
  BarChart3,
  Zap,
  Globe,
  Bell,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const WelcomeScreen = ({ onEnter }) => {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isTr = lang === "tr";

  // Sahneye giriş
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Aşamalı animasyon: 0 -> 1 -> 2 -> 3
  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), 450);
    return () => clearTimeout(t);
  }, [step]);

  // Klavye kısayolları (Enter / Space / Esc)
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        onEnter?.();
      }
    },
    [onEnter],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const features = [
    {
      icon: Wifi,
      title: isTr ? "Canlı IoT Verisi" : "Live IoT Data",
      desc: isTr
        ? "ESP32 sensörlerinden anlık veri akışı"
        : "Real-time stream from ESP32 sensors",
    },
    {
      icon: Shield,
      title: isTr ? "Akıllı Alarm" : "Smart Alerts",
      desc: isTr
        ? "Oğul, devrilme ve sıcaklık uyarıları"
        : "Swarm, tipping and temperature alerts",
    },
    {
      icon: BarChart3,
      title: isTr ? "Detaylı Analiz" : "Detailed Analytics",
      desc: isTr
        ? "Grafik, rapor ve trend takibi"
        : "Charts, reports and trend tracking",
    },
    {
      icon: Zap,
      title: isTr ? "Yapay Zekâ" : "AI Engine",
      desc: isTr
        ? "ML destekli öneriler ve tahminler"
        : "ML-powered suggestions & predictions",
    },
    {
      icon: Globe,
      title: isTr ? "Hava Durumu" : "Weather Data",
      desc: isTr
        ? "Gerçek zamanlı meteoroloji verisi"
        : "Real-time meteorological data",
    },
    {
      icon: Bell,
      title: isTr ? "Bildirimler" : "Notifications",
      desc: isTr
        ? "Push, SMS ve e-posta bildirimleri"
        : "Push, SMS and email notifications",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isTr ? "Hexora Karşılama Ekranı" : "Hexora Welcome Screen"}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-gray-950 transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Arka plan ışık halesi */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* Hexagon dokulu zemin */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden="true"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="hex-pattern"
              width="56"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(2)"
            >
              <path
                d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="hex-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="hex-mask">
              <rect width="100%" height="100%" fill="url(#hex-fade)" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#hex-pattern)"
            mask="url(#hex-mask)"
          />
        </svg>
      </div>

      {/* İçerik */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Logo & Başlık */}
        <div
          className={`mb-8 transition-all duration-700 ${
            step >= 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/10">
            {!logoError ? (
              <img
                src="/hexora-logo.svg"
                alt="Hexora"
                className="h-16 w-16 object-contain"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.5))",
                }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span
                className="text-3xl font-bold text-amber-400"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(245, 158, 11, 0.5))",
                }}
              >
                H
              </span>
            )}
          </div>

          <h1 className="mb-3 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Hex
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              ora
            </span>
          </h1>

          <p className="text-base font-medium text-gray-400 md:text-lg">
            {isTr
              ? "AI Destekli IoT Kovan Yönetim Sistemi"
              : "AI-Powered IoT Hive Management System"}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              v2.0
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              PRO
            </span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              TÜBİTAK
            </span>
          </div>
        </div>

        {/* Özellik Kartları */}
        <div
          className={`mb-10 grid grid-cols-2 gap-3 transition-all duration-700 md:grid-cols-3 ${
            step >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-gray-900/70 hover:shadow-lg hover:shadow-amber-500/5"
                style={{
                  transitionDelay: step >= 2 ? `${i * 60}ms` : "0ms",
                }}
              >
                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 transition-all group-hover:scale-110 group-hover:bg-amber-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-gray-200">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Giriş Butonu */}
        <div
          className={`transition-all duration-700 ${
            step >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <button
            type="button"
            onClick={onEnter}
            autoFocus
            className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:from-amber-400 hover:to-orange-400 hover:shadow-amber-500/40 focus:outline-none focus:ring-4 focus:ring-amber-500/40 active:scale-100"
          >
            {isTr ? "Panele Gir" : "Enter Dashboard"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-4 text-xs text-gray-600">
            {isTr
              ? "Enter, Boşluk veya ESC tuşuyla da girebilirsiniz"
              : "Press Enter, Space or ESC to continue"}
          </p>
        </div>
      </div>

      {/* Alt bilgi çubuğu */}
      <div className="absolute bottom-6 left-0 right-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-xs text-gray-600">
        <span>Hexora v2.0</span>
        <span aria-hidden="true">•</span>
        <span>TÜBİTAK 2204-A</span>
        <span aria-hidden="true">•</span>
        <span>2025</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;
