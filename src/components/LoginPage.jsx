import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Wifi,
  Shield,
  Sun,
  Moon,
  Globe,
  Bell,
  CheckCircle,
  ArrowRight,
  MapPin,
  Info,
  X,
  Zap,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   PASSWORD STRENGTH
   ═══════════════════════════════════════════════ */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", labelEn: "", color: "" };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1)
    return {
      score,
      label: "Çok Zayıf",
      labelEn: "Very Weak",
      color: "bg-red-500",
    };
  if (score === 2)
    return { score, label: "Zayıf", labelEn: "Weak", color: "bg-orange-500" };
  if (score === 3)
    return { score, label: "Orta", labelEn: "Fair", color: "bg-amber-400" };
  if (score === 4)
    return { score, label: "İyi", labelEn: "Good", color: "bg-emerald-400" };
  return { score, label: "Güçlü", labelEn: "Strong", color: "bg-emerald-500" };
}

/* ═══════════════════════════════════════════════
   COUNTDOWN HOOK (lockout timer)
   - stale closure riski yok, interval her zaman temizleniyor
   ═══════════════════════════════════════════════ */
function useCountdown() {
  const [remaining, setRemaining] = useState(0);
  const ref = useRef(null);

  const stop = useCallback(() => {
    if (ref.current) {
      clearInterval(ref.current);
      ref.current = null;
    }
  }, []);

  const start = useCallback(
    (s) => {
      const secs = Math.max(0, Math.floor(Number(s) || 0));
      setRemaining(secs);
      stop();
      if (secs <= 0) return;
      ref.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            stop();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  return { remaining, start };
}

/* ═══════════════════════════════════════════════
   LIVE DASHBOARD MOCKUP (left panel)
   ═══════════════════════════════════════════════ */
const LiveMockup = ({ isTr }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // overflow'a karşı güvenli: modulo ile sınırlı tutuluyor
    const t = setInterval(() => setTick((p) => (p + 1) % 10_000), 3000);
    return () => clearInterval(t);
  }, []);

  const hives = [
    {
      id: "#01",
      name: isTr ? "Kovan A" : "Hive A",
      status: "stable",
      temp: (34.5 + Math.sin(tick * 0.3) * 0.4).toFixed(1),
      hum: 55,
    },
    {
      id: "#02",
      name: isTr ? "Kovan B" : "Hive B",
      status: "warning",
      temp: (37.8 + Math.sin(tick * 0.5) * 0.3).toFixed(1),
      hum: 72,
    },
    {
      id: "#03",
      name: isTr ? "Kovan C" : "Hive C",
      status: "stable",
      temp: (33.1 + Math.sin(tick * 0.4) * 0.5).toFixed(1),
      hum: 48,
    },
    {
      id: "#04",
      name: isTr ? "Kovan D" : "Hive D",
      status: "critical",
      temp: (39.2 + Math.sin(tick * 0.2) * 0.6).toFixed(1),
      hum: 80,
    },
  ];

  const bars = [40, 55, 45, 62, 50, 70, 65, 78, 58, 82, 70, 88];
  const offset = tick % bars.length;
  const shifted = [...bars.slice(offset), ...bars.slice(0, offset)];

  const statusBadge = (s) => {
    if (s === "critical")
      return {
        cls: "bg-red-500/20 text-red-400",
        txt: isTr ? "KRİTİK" : "CRIT",
      };
    if (s === "warning")
      return {
        cls: "bg-amber-500/20 text-amber-400",
        txt: isTr ? "UYARI" : "WARN",
      };
    return { cls: "bg-emerald-500/20 text-emerald-400", txt: "OK" };
  };

  return (
    <div className="w-full bg-gray-900/80 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm shadow-2xl shadow-black/40">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
        <div className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
        <div className="w-2.5 h-2.5 bg-amber-500/80 rounded-full" />
        <div className="w-2.5 h-2.5 bg-emerald-500/80 rounded-full" />
        <span className="ml-2 text-[10px] font-mono text-gray-600">
          hexora.app/panel
        </span>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-400">
            {isTr ? "CANLI" : "LIVE"}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          {
            l: isTr ? "Kovan" : "Hives",
            v: "4",
            c: "text-amber-400",
            b: "bg-amber-500/8",
          },
          {
            l: isTr ? "Stabil" : "Stable",
            v: "2",
            c: "text-emerald-400",
            b: "bg-emerald-500/8",
          },
          {
            l: isTr ? "Uyarı" : "Warning",
            v: "1",
            c: "text-amber-400",
            b: "bg-amber-500/8",
          },
          {
            l: isTr ? "Kritik" : "Critical",
            v: "1",
            c: "text-red-400",
            b: "bg-red-500/8",
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`${s.b} rounded-lg p-2 text-center border border-gray-800/60`}
          >
            <p className="text-[9px] text-gray-500 mb-0.5">{s.l}</p>
            <p className={`text-base font-bold ${s.c}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Hive list */}
      <div className="space-y-1.5 mb-4">
        {hives.map((h) => {
          const tempNum = parseFloat(h.temp);
          const tempCls =
            tempNum > 38
              ? "text-red-400"
              : tempNum > 36
                ? "text-amber-400"
                : "text-gray-400";
          const borderCls =
            h.status === "critical"
              ? "border-red-500/30"
              : h.status === "warning"
                ? "border-amber-500/20"
                : "border-gray-800";
          const dotCls =
            h.status === "critical"
              ? "bg-red-500 animate-pulse"
              : h.status === "warning"
                ? "bg-amber-500"
                : "bg-emerald-500";
          const badge = statusBadge(h.status);

          return (
            <div
              key={h.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/40 border transition-colors duration-700 ${borderCls}`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`}
              />
              <span className="text-[10px] font-mono text-amber-400 w-7">
                {h.id}
              </span>
              <span className="text-[10px] text-gray-400 flex-1">{h.name}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.cls}`}
              >
                {badge.txt}
              </span>
              <span className={`text-[10px] font-mono ml-1 ${tempCls}`}>
                {h.temp}°C
              </span>
            </div>
          );
        })}
      </div>

      {/* Mini live chart */}
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">
            {isTr ? "Sıcaklık Trendi" : "Temp Trend"}
          </span>
          <span className="text-[9px] text-amber-400 font-mono">
            {isTr ? "Canlı" : "Live"} ↑
          </span>
        </div>
        <div className="flex items-end gap-0.5 h-10">
          {shifted.map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-amber-500/70 to-amber-400/20 rounded-t transition-all duration-700"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TESTIMONIALS (left panel)
   ═══════════════════════════════════════════════ */
const Testimonials = ({ isTr }) => {
  const items = [
    {
      name: "Mehmet K.",
      role: isTr ? "Konya • 80 Kovan" : "Konya • 80 Hives",
      text: isTr
        ? '"Gece yarısı alarm geldi, sabah gitseydim koloniyi kaybetmiştik."'
        : '"Alert came at midnight — if I went in the morning the colony would have been lost."',
    },
    {
      name: "Fatma Ş.",
      role: isTr ? "Ankara • 15 Kovan" : "Ankara • 15 Hives",
      text: isTr
        ? '"Hasat zamanını doğru yakaladım, geçen yıldan %30 daha fazla bal çıkardım."'
        : '"I caught the perfect harvest time — 30% more honey than last year."',
    },
    {
      name: "İbrahim T.",
      role: isTr ? "Muğla • 200 Kovan" : "Muğla • 200 Hives",
      text: isTr
        ? '"Arılığa gidişlerim yarıya indi, yakıt ve emek maliyetim düştü."'
        : '"Half as many trips to the apiary — fuel and labor costs dropped."',
    },
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
    // items.length sabit, bağımlılık gerekmiyor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item = items[idx];
  return (
    <div className="mt-5 bg-gray-900/50 border border-gray-800 rounded-xl p-4 relative overflow-hidden">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-amber-400 text-xs">
            ★
          </span>
        ))}
        <span className="ml-auto flex gap-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Testimonial ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-amber-400" : "bg-gray-700"}`}
            />
          ))}
        </span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed italic mb-3">
        {item.text}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-sm">
          🧑‍🌾
        </div>
        <div>
          <p className="text-xs font-bold text-gray-200">{item.name}</p>
          <p className="text-[9px] text-gray-500">{item.role}</p>
        </div>
        <span className="ml-auto text-[9px] text-gray-600 italic">
          {isTr ? "Beta Kullanıcısı" : "Beta User"}
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN LOGIN PAGE
   ═══════════════════════════════════════════════ */
const LoginPage = () => {
  const { login, register } = useAuth();
  const { lang, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const { remaining, start: startCountdown } = useCountdown();

  const isTr = lang === "tr";
  const strength = getPasswordStrength(password);
  const isLocked = remaining > 0;
  const passwordsMatch = confirmPassword === "" || password === confirmPassword;
  const IS_DEV =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.DEV;

  // Hatırlanan emaili yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem("beemora_remember");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.email === "string" && parsed.email) {
          setEmail(parsed.email);
          setRememberMe(true);
        }
      }
    } catch {
      /* localStorage erişilemez (SSR/private mode) – sessizce geç */
    }
  }, []);

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
    setForgotSent(false);
  };

  // Hata mesajını normalleştir (string olmayan hataları da güvenli göster)
  const normalizeError = (err, fallback) => {
    if (!err) return fallback;
    if (err === "network_error") {
      return isTr
        ? "Sunucuya bağlanılamadı. Lütfen tekrar deneyin."
        : "Could not connect to server. Please try again.";
    }
    if (typeof err === "string") return err;
    if (err.message && typeof err.message === "string") return err.message;
    return fallback;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked || isLoading) return;
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    // Validation
    if (!trimmedEmail) {
      setError(isTr ? "Email adresi gerekli" : "Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(
        isTr ? "Geçerli bir email adresi girin" : "Enter a valid email address",
      );
      return;
    }
    if (!password) {
      setError(isTr ? "Şifre gerekli" : "Password is required");
      return;
    }
    if (mode === "register") {
      if (password.length < 6) {
        setError(
          isTr
            ? "Şifre en az 6 karakter olmalı"
            : "Password must be at least 6 characters",
        );
        return;
      }
      if (password !== confirmPassword) {
        setError(isTr ? "Şifreler eşleşmiyor" : "Passwords do not match");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === "register") {
        const result = await register(
          trimmedEmail,
          password,
          fullName.trim() || undefined,
        );
        if (!result || !result.success) {
          setError(
            normalizeError(
              result && result.error,
              isTr ? "Kayıt başarısız" : "Registration failed",
            ),
          );
        }
      } else {
        const result = await login(trimmedEmail, password);
        if (!result || !result.success) {
          const next = attempts + 1;
          setAttempts(next);
          const fallback = isTr
            ? `Email veya şifre hatalı (${next}/5 deneme)`
            : `Invalid email or password (${next}/5 attempts)`;
          setError(normalizeError(result && result.error, fallback));
          if (next >= 3) setShowDemo(true);
          if (next >= 5) startCountdown(30);
        } else {
          // Başarılı giriş → remember-me tercihini uygula
          try {
            if (rememberMe) {
              localStorage.setItem(
                "beemora_remember",
                JSON.stringify({ email: trimmedEmail }),
              );
            } else {
              localStorage.removeItem("beemora_remember");
            }
          } catch {
            /* no-op */
          }
        }
      }
    } catch (err) {
      setError(
        normalizeError(
          err,
          isTr ? "Beklenmeyen bir hata oluştu" : "Unexpected error occurred",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotSent(true);
    setError("");
  };

  const fillDemo = () => {
    setEmail("admin@hexora.app");
    setPassword("admin123");
    setError("");
    setShowDemo(false);
  };

  const inputClass = (hasError = false) =>
    `w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all text-sm ${
      hasError
        ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
        : "border-gray-700/50 focus:border-amber-500/60 focus:ring-amber-500/20 hover:border-gray-600"
    }`;

  // Submit disabled koşulu — register'da şifreler eşleşmiyorsa veya confirm boşsa tıklanamaz
  const submitDisabled =
    isLoading ||
    isLocked ||
    (mode === "register" && (confirmPassword === "" || !passwordsMatch));

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden">
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Honeycomb grid */}
        <svg
          className="w-full h-full opacity-[0.045]"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <polygon
              key={i}
              points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.8"
              transform={`translate(${(i % 7) * 130 + (Math.floor(i / 7) % 2) * 65 - 30}, ${Math.floor(i / 7) * 108 - 30}) scale(1.1)`}
            />
          ))}
        </svg>
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[400px] bg-amber-500/7 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-orange-500/5 rounded-full blur-[100px]" />
        {/*
          NOT: animate-float-slow/medium/fast, animate-fade-in, btn-shimmer custom class'lardır.
          Tailwind config'de (keyframes + animation) tanımlı olmalı; değilse sessizce görünmez.
        */}
        <svg
          className="absolute top-20 right-20 w-28 h-32 animate-float-slow opacity-30"
          viewBox="0 0 80 90"
          fill="none"
        >
          <path
            d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
            stroke="#f59e0b"
            strokeWidth="1.2"
            fill="rgba(245,158,11,0.05)"
          />
        </svg>
        <svg
          className="absolute bottom-24 left-16 w-16 h-[4.5rem] animate-float-medium opacity-20"
          viewBox="0 0 80 90"
          fill="none"
        >
          <path
            d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
            stroke="#fb923c"
            strokeWidth="1"
            fill="rgba(251,146,60,0.04)"
          />
        </svg>
        <svg
          className="absolute top-1/2 right-1/3 w-10 h-12 animate-float-fast opacity-15"
          viewBox="0 0 80 90"
          fill="none"
        >
          <path
            d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
            stroke="#fbbf24"
            strokeWidth="1.5"
            fill="rgba(251,191,36,0.05)"
          />
        </svg>
      </div>

      {/* ── Top bar ── */}
      <div className="relative flex items-center justify-between px-6 py-4 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/10">
            <span className="text-lg leading-none">🐝</span>
          </div>
          <div>
            <span className="text-base font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Hex
            </span>
            <span className="text-base font-extrabold text-white">ora</span>
            <span className="ml-2 text-[9px] text-gray-600 border border-gray-800 px-1.5 py-0.5 rounded-full align-middle">
              Beta
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isTr ? "Tema değiştir" : "Toggle theme"}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => changeLanguage(lang === "tr" ? "en" : "tr")}
            aria-label={isTr ? "Dili değiştir" : "Change language"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-gray-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "tr" ? "EN" : "TR"}
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10">
        {/* ── LEFT PANEL ── */}
        <motion.div
          className="hidden lg:flex lg:w-[55%] flex-col justify-center px-10 xl:px-16 py-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="max-w-lg">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">
                {isTr
                  ? "Sistem Aktif — Sensörler Çalışıyor"
                  : "System Active — Sensors Online"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-100 leading-[1.15] mb-4">
              {isTr ? "Kovanlarınızı" : "Monitor Your"}
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                {isTr ? "Akıllıca İzleyin" : "Hives Smartly"}
              </span>
            </h1>

            <p className="text-gray-400 text-base leading-relaxed mb-7">
              {isTr
                ? "IoT sensörler ve yapay zeka ile kovanlarınızı 7/24 uzaktan izleyin. Varroa, oğul riski ve sıcaklık anomalilerini erken tespit edin."
                : "Monitor your hives 24/7 remotely with IoT sensors and AI. Detect Varroa, swarm risk, and temperature anomalies early."}
            </p>

            {/* Quick feature pills */}
            <div className="flex flex-wrap gap-2 mb-7">
              {[
                {
                  icon: Wifi,
                  label: isTr ? "7/24 İzleme" : "24/7 Monitoring",
                  color: "text-blue-400",
                  bg: "bg-blue-500/8 border-blue-500/20",
                },
                {
                  icon: Zap,
                  label: isTr ? "AI Analiz" : "AI Analysis",
                  color: "text-purple-400",
                  bg: "bg-purple-500/8 border-purple-500/20",
                },
                {
                  icon: Bell,
                  label: isTr ? "Anlık Uyarı" : "Instant Alert",
                  color: "text-amber-400",
                  bg: "bg-amber-500/8 border-amber-500/20",
                },
                {
                  icon: Shield,
                  label: isTr ? "%85 Az Kayıp" : "85% Less Loss",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/8 border-emerald-500/20",
                },
              ].map(({ icon: Icon, label, color, bg }, i) => (
                <span
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${bg} ${color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>

            {/* Live mockup */}
            <LiveMockup isTr={isTr} />

            {/* Testimonials carousel */}
            <Testimonials isTr={isTr} />
          </div>
        </motion.div>

        {/* ── RIGHT PANEL (Form) ── */}
        <motion.div
          className="w-full lg:w-[45%] flex items-center justify-center p-6 py-8"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.1,
          }}
        >
          <div className="w-full max-w-md">
            {/* Mobile feature strip */}
            <div className="lg:hidden mb-6 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    v: "Beta",
                    l: isTr ? "Erken Erişim" : "Early Access",
                    c: "text-amber-400",
                  },
                  {
                    v: "3",
                    l: isTr ? "Adaptör Tipi" : "Adapter Types",
                    c: "text-blue-400",
                  },
                  { v: "99.8%", l: "Uptime", c: "text-emerald-400" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5 text-center"
                  >
                    <p className={`text-sm font-bold ${s.c}`}>{s.v}</p>
                    <p className="text-[9px] text-gray-500">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo + Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/25 to-orange-500/15 border border-amber-500/35 rounded-2xl mb-4 shadow-xl shadow-amber-500/15">
                <span className="text-3xl leading-none">🐝</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-100 mb-1">
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Hex
                </span>
                ora
              </h2>
              <p className="text-gray-500 text-xs">
                {isTr
                  ? "Akıllı Kovan İzleme Sistemi"
                  : "Smart Hive Monitoring System"}
              </p>
            </div>

            {/* Form card */}
            <div className="bg-gray-900/80 border border-gray-800/80 rounded-2xl p-6 sm:p-7 backdrop-blur-md shadow-2xl shadow-black/30">
              {/* Tab switcher */}
              <div
                className="flex bg-gray-800/70 rounded-xl p-1 mb-6 gap-1"
                role="tablist"
              >
                {["login", "register"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      mode === m
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md shadow-amber-500/20"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {m === "login"
                      ? isTr
                        ? "Giriş Yap"
                        : "Sign In"
                      : isTr
                        ? "Kayıt Ol"
                        : "Sign Up"}
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-bold text-gray-100 mb-0.5 text-center">
                {mode === "register"
                  ? isTr
                    ? "Hesap Oluştur"
                    : "Create Account"
                  : isTr
                    ? "Kontrol Paneline Giriş"
                    : "Sign In to Dashboard"}
              </h3>
              <p className="text-xs text-gray-500 text-center mb-5">
                {mode === "register"
                  ? isTr
                    ? "Kovanlarınızı izlemeye hemen başlayın"
                    : "Start monitoring your hives right away"
                  : isTr
                    ? "Hesabınıza giriş yapın"
                    : "Access your account"}
              </p>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex items-start gap-2.5 text-red-400 text-sm animate-fade-in"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 break-words">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label={isTr ? "Hata mesajını kapat" : "Dismiss error"}
                    className="text-red-400/60 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2.5 text-emerald-400 text-sm animate-fade-in">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Lockout countdown */}
              {isLocked && (
                <div
                  role="status"
                  className="mb-4 p-3 bg-orange-500/10 border border-orange-500/25 rounded-xl flex items-center gap-2.5 text-orange-400 text-sm animate-fade-in"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isTr
                      ? `Çok fazla deneme. ${remaining}sn bekleyin.`
                      : `Too many attempts. Wait ${remaining}s.`}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Full Name (register only) */}
                {mode === "register" && (
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-semibold text-gray-400 mb-1.5"
                    >
                      {isTr ? "Ad Soyad" : "Full Name"}{" "}
                      <span className="text-gray-600">
                        {isTr ? "(isteğe bağlı)" : "(optional)"}
                      </span>
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                        aria-hidden="true"
                      >
                        👤
                      </span>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setError("");
                        }}
                        placeholder={
                          isTr ? "Adınız Soyadınız" : "Your Full Name"
                        }
                        className={inputClass()}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-400 mb-1.5"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        isTr ? "email@ornek.com" : "email@example.com"
                      }
                      className={inputClass()}
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-gray-400 mb-1.5"
                  >
                    {isTr ? "Şifre" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        isTr ? "Şifrenizi girin" : "Enter your password"
                      }
                      className={`${inputClass()} pr-11`}
                      autoComplete={
                        mode === "register"
                          ? "new-password"
                          : "current-password"
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword
                          ? isTr
                            ? "Şifreyi gizle"
                            : "Hide password"
                          : isTr
                            ? "Şifreyi göster"
                            : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password strength (register only) */}
                  {mode === "register" && password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : "bg-gray-800"}`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-[10px] ${strength.score >= 4 ? "text-emerald-400" : strength.score >= 3 ? "text-amber-400" : "text-red-400"}`}
                      >
                        {isTr ? strength.label : strength.labelEn}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password (register only) */}
                {mode === "register" && (
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-gray-400 mb-1.5"
                    >
                      {isTr ? "Şifre Tekrar" : "Confirm Password"}
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                        aria-hidden="true"
                      />
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError("");
                        }}
                        placeholder={
                          isTr
                            ? "Şifrenizi tekrar girin"
                            : "Confirm your password"
                        }
                        className={`${inputClass(!passwordsMatch && confirmPassword !== "")} pr-11`}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={
                          showConfirm
                            ? isTr
                              ? "Şifreyi gizle"
                              : "Hide password"
                            : isTr
                              ? "Şifreyi göster"
                              : "Show password"
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {!passwordsMatch && confirmPassword !== "" && (
                      <p className="text-[10px] text-red-400 mt-1">
                        {isTr
                          ? "Şifreler eşleşmiyor"
                          : "Passwords do not match"}
                      </p>
                    )}
                    {passwordsMatch && confirmPassword !== "" && (
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {isTr ? "Şifreler eşleşiyor" : "Passwords match"}
                      </p>
                    )}
                  </div>
                )}

                {/* Remember me + Forgot password (login only) */}
                {mode === "login" && (
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 cursor-pointer accent-amber-500"
                      />
                      <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                        {isTr ? "Beni hatırla" : "Remember me"}
                      </span>
                    </label>

                    {!forgotSent ? (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs text-amber-500/70 hover:text-amber-400 transition-colors"
                      >
                        {isTr ? "Şifremi unuttum" : "Forgot password?"}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 text-right">
                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {isTr
                            ? "hexoraproject@gmail.com ile iletişime geçin"
                            : "Contact hexoraproject@gmail.com"}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: submitDisabled ? 1 : 0.97 }}
                  whileHover={{ scale: submitDisabled ? 1 : 1.01 }}
                  disabled={submitDisabled}
                  className="btn-shimmer w-full py-3 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 overflow-hidden"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>
                        {mode === "register"
                          ? isTr
                            ? "Hesap oluşturuluyor..."
                            : "Creating account..."
                          : isTr
                            ? "Giriş yapılıyor..."
                            : "Signing in..."}
                      </span>
                    </>
                  ) : isLocked ? (
                    <span>
                      {isTr ? `${remaining}sn bekleyin` : `Wait ${remaining}s`}
                    </span>
                  ) : (
                    <>
                      <span>
                        {mode === "register"
                          ? isTr
                            ? "Hesap Oluştur"
                            : "Create Account"
                          : isTr
                            ? "Giriş Yap"
                            : "Sign In"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Demo hint (only in dev mode, after 3 failed login attempts) */}
              {IS_DEV && mode === "login" && showDemo && !isLocked && (
                <div className="mt-4 p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl animate-fade-in">
                  <p className="text-[11px] text-amber-400/80 mb-2 font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    {isTr
                      ? "Geliştirici Modu — Demo hesabı:"
                      : "Dev Mode — Demo account:"}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-gray-400 space-x-2 min-w-0">
                      <span className="text-gray-500">
                        {isTr ? "Kullanıcı:" : "User:"}
                      </span>
                      <code className="text-amber-300 bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                        admin@hexora.app
                      </code>
                      <span className="text-gray-500">
                        {isTr ? "Şifre:" : "Pass:"}
                      </span>
                      <code className="text-amber-300 bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                        admin123
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={fillDemo}
                      className="text-[11px] px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors font-semibold flex-shrink-0"
                    >
                      {isTr ? "Doldur" : "Fill"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-5 flex items-center justify-center gap-5">
              {[
                { icon: Shield, label: "SSL" },
                { icon: Lock, label: "JWT" },
                { icon: CheckCircle, label: "KVKK" },
              ].map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-gray-600"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-gray-700 text-[10px] flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                {isTr
                  ? "Konya, Türkiye • © 2026 Hexora - BeeMora"
                  : "Konya, Turkey • © 2026 Hexora - BeeMora"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
