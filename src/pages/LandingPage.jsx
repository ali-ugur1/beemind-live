import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import FloatingAIChat from "../components/FloatingAIChat";
import {
  Sun,
  Moon,
  Globe,
  ArrowRight,
  Shield,
  BarChart3,
  Wifi,
  Zap,
  Bell,
  Cloud,
  MapPin,
  Calendar,
  ChevronDown,
  Mail,
  CheckCircle,
  Cpu,
  Database,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Award,
  Users,
  Eye,
  Phone,
  MessageCircle,
  Clock,
} from "lucide-react";

const HERO_BG =
  "https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?w=1200&q=80";

/* ═══════════════════════════════════════════════════════════════════════
   COUNTER ANIMATION HOOK
   ═══════════════════════════════════════════════════════════════════════ */
const useCounter = (end, duration = 2000, startWhenVisible = false) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startWhenVisible);
  const ref = useRef(null);

  useEffect(() => {
    if (!startWhenVisible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startWhenVisible]);

  useEffect(() => {
    if (!started || end === 0) {
      setCount(end);
      return;
    }
    let current = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return { count, ref };
};

/* ═══════════════════════════════════════════════════════════════════════
   STAT ITEM COMPONENT (for big stats banner)
   ═══════════════════════════════════════════════════════════════════════ */
const StatItem = ({ end, suffix, label, sub }) => {
  const counter = useCounter(end, 1800, true);
  return (
    <div ref={counter.ref}>
      <p className="text-4xl md:text-5xl font-extrabold text-amber-400 mb-1">
        {counter.count}
        {suffix}
      </p>
      <p className="text-sm font-semibold text-gray-200">{label}</p>
      <p className="text-[10px] text-gray-500">{sub}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   ROI CALCULATOR COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
const RoiCalculator = ({ isTr }) => {
  const [hiveCount, setHiveCount] = useState(20);

  const avgHoneyPerHive = 15;
  const honeyPricePerKg = 300;
  const lossRate = 0.2;
  const beemoraReduction = 0.6;
  const colonyPrice = 2000;
  const yieldBoost = 0.1;

  const pricePerHive = hiveCount <= 50 ? 50 : hiveCount <= 100 ? 45 : 40;
  const tierLabel =
    hiveCount <= 50
      ? isTr
        ? "Hobi / Başlangıç"
        : "Hobby / Starter"
      : hiveCount <= 100
        ? isTr
          ? "Ticari / Orta Ölçek"
          : "Commercial / Mid"
        : isTr
          ? "Endüstriyel / Filo"
          : "Industrial / Fleet";

  const savedColonies = Math.round(hiveCount * lossRate * beemoraReduction);
  const savedColonyValue = savedColonies * colonyPrice;
  const savedHoneyRevenue = savedColonies * avgHoneyPerHive * honeyPricePerKg;
  const boostRevenue = Math.round(
    hiveCount * avgHoneyPerHive * honeyPricePerKg * yieldBoost,
  );
  const totalSaved = savedHoneyRevenue + savedColonyValue + boostRevenue;
  const subscriptionCost = hiveCount * pricePerHive * 12;
  const netSaving = totalSaved - subscriptionCost;

  const handleRange = useCallback(
    (e) => setHiveCount(Number(e.target.value)),
    [],
  );

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 md:p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-200">
            {isTr ? "Kovan Sayınız" : "Your Hive Count"}
          </span>
          <span className="text-2xl font-extrabold text-amber-400">
            {hiveCount}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="200"
          value={hiveCount}
          onChange={handleRange}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>1</span>
          <span>50</span>
          <span>100</span>
          <span>200</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: isTr
              ? "Kurtarılan Koloni (tahmini)"
              : "Saved Colonies (est.)",
            val: savedColonies,
            suffix: isTr ? " koloni/yıl" : " colonies/yr",
            color: "text-emerald-400",
          },
          {
            label: isTr ? "Koloni Değeri" : "Colony Value",
            val: `₺${savedColonyValue.toLocaleString("tr-TR")}`,
            suffix: isTr ? "(₺2.000/koloni)" : "(₺2,000/colony)",
            color: "text-blue-400",
          },
          {
            label: isTr ? "Kurtarılan Bal Geliri" : "Saved Honey Revenue",
            val: `₺${savedHoneyRevenue.toLocaleString("tr-TR")}`,
            suffix: isTr ? "/yıl" : "/yr",
            color: "text-amber-400",
          },
          {
            label: isTr ? "Verimlilik Artışı (%10)" : "Yield Boost (10%)",
            val: `₺${boostRevenue.toLocaleString("tr-TR")}`,
            suffix: isTr ? "tüm kovanlar" : "all hives",
            color: "text-purple-400",
          },
          {
            label: isTr ? "Toplam Kazanç" : "Total Benefit",
            val: `₺${totalSaved.toLocaleString("tr-TR")}`,
            suffix: isTr ? "/yıl" : "/yr",
            color: "text-emerald-400",
          },
          {
            label: isTr
              ? `Abonelik (${tierLabel})`
              : `Subscription (${tierLabel})`,
            val: `₺${subscriptionCost.toLocaleString("tr-TR")}`,
            suffix: `₺${pricePerHive}/${isTr ? "kovan/ay" : "hive/mo"}`,
            color: "text-gray-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 text-center"
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              {s.label}
            </p>
            <p className={`text-lg font-extrabold ${s.color}`}>{s.val}</p>
            <p className="text-[9px] text-gray-600">{s.suffix}</p>
          </div>
        ))}
      </div>

      {netSaving > 0 && (
        <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-5 py-3 mb-4">
          <div>
            <p className="text-xs text-gray-400">
              {isTr ? "Tahmini Net Tasarruf" : "Estimated Net Savings"}
            </p>
            <p className="text-xl font-extrabold text-emerald-400">
              ₺{netSaving.toLocaleString("tr-TR")}
              <span className="text-sm font-normal text-gray-500">
                {" "}
                /{isTr ? "yıl" : "yr"}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl px-5 py-3">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          {isTr
            ? "⚠️ Bu hesaplama tahminidir. Kullanılan değerler: 15kg/yıl bal üretimi, ₺300/kg fiyat, %20 kayıp oranı (Türkiye ort.), %60 kayıp azaltma, ₺2.000 koloni maliyeti, %10 verimlilik artışı (zamanında hasat, erken müdahale). Gerçek sonuçlar bölge ve koşullara göre değişir."
            : "⚠️ This is an estimate. Values used: 15kg/yr honey, ₺300/kg price, 20% loss rate (Turkey avg.), 60% loss reduction, ₺2,000 colony cost, 10% yield boost (timely harvest, early intervention). Actual results vary by region and conditions."}
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const { lang, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [openFaq, setOpenFaq] = useState(null);

  const isTr = lang === "tr";

  // Hero section counter — starts immediately
  const c3 = useCounter(99, 1500, true);
  const heroStatsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.08 },
    );
    const els = document.querySelectorAll("[data-animate]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const anim = (id) =>
    visibleSections.has(id)
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-10";

  const handleFaqToggle = useCallback((i) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  const handleLangToggle = useCallback(() => {
    changeLanguage(lang === "tr" ? "en" : "tr");
  }, [lang, changeLanguage]);

  /* ── DATA ── */
  const navLinks = [
    { id: "crisis", label: isTr ? "Kriz" : "Crisis" },
    { id: "solution", label: isTr ? "Çözüm" : "Solution" },
    { id: "features", label: isTr ? "Özellikler" : "Features" },
    { id: "how", label: isTr ? "Nasıl Çalışır" : "How It Works" },
    { id: "pricing", label: isTr ? "Fiyatlar" : "Pricing" },
    { id: "about", label: isTr ? "Hakkımızda" : "About Us" },
    { id: "contact", label: isTr ? "İletişim" : "Contact" },
  ];

  const crisisStats = [
    {
      val: "8.1M",
      label: isTr ? "Türkiye'deki Toplam Kovan" : "Total Hives in Turkey",
      sub: isTr ? "Dünya 2.si" : "World's 2nd",
    },
    {
      val: "%30",
      label: isTr ? "Yıllık Koloni Kaybı" : "Annual Colony Loss",
      sub: isTr ? "~2.4 milyon kovan" : "~2.4 million hives",
    },
    {
      val: "₺4.2B",
      label: isTr ? "Yıllık Ekonomik Kayıp" : "Annual Economic Loss",
      sub: isTr ? "Bal + tozlaşma" : "Honey + pollination",
    },
    {
      val: "%82",
      label: isTr ? "Geleneksel Yöntem" : "Traditional Methods",
      sub: isTr ? "Dijital izleme yok" : "No digital monitoring",
    },
  ];

  const features = [
    {
      icon: Wifi,
      title: isTr ? "Canlı Veri Akışı" : "Live Data Stream",
      desc: isTr
        ? "Özel IoT sensör ağımızdan anlık sıcaklık, nem, basınç ve titreşim verileri."
        : "Real-time temperature, humidity, pressure and vibration data from our proprietary IoT sensor network.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Zap,
      title: isTr ? "Yapay Zeka Analizi" : "AI-Powered Analysis",
      desc: isTr
        ? "Kendi geliştirdiğimiz AI modelleri ile oğul tahmini, hastalık tespiti ve bakım önerileri."
        : "Swarm prediction, disease detection and maintenance suggestions with our proprietary AI models.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Shield,
      title: isTr ? "Akıllı Alarm Sistemi" : "Smart Alert System",
      desc: isTr
        ? "Kritik durumlar için anlık bildirim: oğul riski, devrilme, sıcaklık anomalisi."
        : "Instant alerts for critical conditions: swarm risk, tipping, temperature anomaly.",
      color: "from-red-500 to-rose-500",
    },
    {
      icon: BarChart3,
      title: isTr ? "Detaylı Raporlama" : "Detailed Reporting",
      desc: isTr
        ? "Günlük, haftalık ve aylık grafikler, trend analizi ve dışa aktarılabilir raporlar."
        : "Daily, weekly and monthly charts, trend analysis and exportable reports.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Cloud,
      title: isTr ? "Hava Durumu" : "Weather Integration",
      desc: isTr
        ? "Gerçek zamanlı meteoroloji verisi ve arıcılığa özel hava uyarıları."
        : "Real-time weather data and beekeeping-specific weather alerts.",
      color: "from-cyan-500 to-teal-500",
    },
    {
      icon: MapPin,
      title: isTr ? "Kovan Haritası" : "Hive Map",
      desc: isTr
        ? "İnteraktif harita üzerinde kovan konumları, durumlar ve detaylar."
        : "Hive locations, statuses and details on an interactive map.",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: Calendar,
      title: isTr ? "Takvim & Planlama" : "Calendar & Planning",
      desc: isTr
        ? "Bakım, hasat ve kontrol takvimi. Hatırlatıcılar ve geçmiş kayıtlar."
        : "Maintenance, harvest and inspection calendar. Reminders and history.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Bell,
      title: isTr ? "Anlık Bildirimler" : "Instant Notifications",
      desc: isTr
        ? "Kritik durumlardan anında haberdar olun — masaüstü ve mobilde."
        : "Get instantly notified of critical conditions — on desktop and mobile.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const howSteps = [
    {
      num: "01",
      icon: Cpu,
      title: isTr ? "Kurulum" : "Installation",
      desc: isTr
        ? "Özel sensör modülümüz kovanınıza dakikalar içinde kurulur. Profesyonel ekibimiz destek sağlar."
        : "Our custom sensor module is installed in your hive within minutes. Our professional team provides support.",
    },
    {
      num: "02",
      icon: Wifi,
      title: isTr ? "Bağlantı" : "Connection",
      desc: isTr
        ? "Sensörler güvenli kablosuz ağ üzerinden bulut altyapımıza bağlanır."
        : "Sensors connect to our cloud infrastructure over a secure wireless network.",
    },
    {
      num: "03",
      icon: Database,
      title: isTr ? "Analiz" : "Analysis",
      desc: isTr
        ? "Yapay zeka motorumuz verileri gerçek zamanlı analiz eder, anomalileri tespit eder."
        : "Our AI engine analyzes data in real-time, detects anomalies.",
    },
    {
      num: "04",
      icon: BarChart3,
      title: isTr ? "İzleme" : "Monitoring",
      desc: isTr
        ? "Kontrol panelinizden tüm kovanlarınızı 7/24 izleyin, raporlayın ve yönetin."
        : "Monitor, report and manage all your hives 24/7 from your control panel.",
    },
  ];

  const faqs = [
    {
      q: isTr ? "BeeMora Nedir?" : "What is BeeMora?",
      a: isTr
        ? "BeeMora, 2025'te başlayan, yapay zeka teknolojileri ile arı kovanlarını 7/24 uzaktan izleme ve yönetme platformudur. Kovan içi sıcaklık, nem, ses, titreşim, ağırlık ve basınç gibi kritik verileri gerçek zamanlı analiz ederek arıcılara anlık bildirimler, AI destekli tahminler (oğul riski, hastalık tespiti) ve detaylı raporlar sunar. Amacımız Türkiye'deki yıllık %30 koloni kaybını teknoloji ile minimuma indirmektir."
        : "BeeMora is a platform that started in 2025, providing 24/7 remote hive monitoring and management with AI technology. It analyzes critical real-time data such as internal temperature, humidity, sound, vibration, weight and pressure, offering beekeepers instant notifications, AI-powered predictions (swarm risk, disease detection) and detailed reports. Our goal is to minimize Turkey's annual 30% colony loss through technology.",
    },
    {
      q: isTr
        ? "Sistem tam olarak ne ölçüyor ve nasıl çalışıyor?"
        : "What exactly does the system measure and how does it work?",
      a: isTr
        ? "Platformumuz 6 temel parametreyi sürekli izler: (1) Kovan içi sıcaklık — 32-36°C optimal aralık dışına çıkıldığında anında uyarı. (2) Nem — %50-70 ideal aralık takibi, küf ve mantar riski tespiti. (3) Ses frekansı — arı vızıltı paternlerini analiz ederek Varroa enfestasyonu ve oğul hazırlığını 2-3 hafta önceden tespit. (4) Titreşim — devrilme, hırsızlık ve anormal hareket algılama. (5) Ağırlık — bal üretim takibi, ani düşüşlerde alarm. (6) Basınç — hava koşulu değişimlerini izleme. Veriler bulut sunucumuza iletilir ve AI motorumuz tarafından gerçek zamanlı analiz edilir."
        : "Our platform continuously monitors 6 key parameters: (1) Internal temperature — instant alert when outside 32-36°C optimal range. (2) Humidity — 50-70% ideal range tracking, mold and fungus risk detection. (3) Sound frequency — analyzes bee buzz patterns to detect Varroa infestation and swarm preparation 2-3 weeks in advance. (4) Vibration — detects tipping, theft and abnormal movement. (5) Weight — honey production tracking, alarm on sudden drops. (6) Pressure — weather condition change monitoring. Data is transmitted to our cloud server and analyzed in real-time by our AI engine.",
    },
    {
      q: isTr
        ? "Kurulum zor mu? Teknik bilgi gerekiyor mu?"
        : "Is installation difficult? Do I need technical knowledge?",
      a: isTr
        ? "Kesinlikle hayır. BeeMora platformu tamamen web tabanlıdır — telefonunuzdan veya bilgisayarınızdan herhangi bir modern tarayıcı ile hemen kullanmaya başlayabilirsiniz. Hesabınızı oluşturun, kovanlarınızı ekleyin ve platformun sunduğu tüm AI analiz, bildirim ve raporlama özelliklerinden yararlanın. Hiçbir teknik bilgi gerektirmez. Ayrıca ilk kurulumda video rehberimiz ve canlı destek hattımız sizi adım adım yönlendirir."
        : "Absolutely not. BeeMora is a fully web-based platform — you can start using it immediately from your phone or computer with any modern browser. Create your account, add your hives and benefit from all AI analysis, notification and reporting features. No technical knowledge required. Additionally, our video guide and live support line will walk you through the first setup step by step.",
    },
    {
      q: isTr
        ? "Kaç kovan destekleniyor? Büyük arılıklar için uygun mu?"
        : "How many hives are supported? Is it suitable for large apiaries?",
      a: isTr
        ? "Ölçeklenebilir bulut altyapımız sayesinde tek bir hesaptan 1'den 500+ kovana kadar eş zamanlı izleme yapabilirsiniz. Kurumsal müşterilerimiz için çoklu arılık yönetimi, alt kullanıcı yetkilendirme ve özel API erişimi de sunuyoruz. Kademeli abonelik modeli sayesinde (1-50 kovan: ₺50, 51-100: ₺45, 100+: ₺40/kovan/ay) bütçenizi tam kontrol altında tutarsınız."
        : "Thanks to our scalable cloud infrastructure, you can monitor from 1 to 500+ hives simultaneously from a single account. For enterprise customers, we also offer multi-apiary management, sub-user authorization and custom API access. With our tiered subscription (1-50 hives: ₺50, 51-100: ₺45, 100+: ₺40/hive/mo), you keep your budget fully under control.",
    },
    {
      q: isTr
        ? "Mobil cihazlarda çalışıyor mu?"
        : "Does it work on mobile?",
      a: isTr
        ? "Evet, BeeMora paneli tamamen responsive tasarlanmıştır — iPhone, Android, tablet veya bilgisayardan herhangi bir modern tarayıcı ile erişebilirsiniz. Push bildirimleri sayesinde kritik uyarılar telefonunuza anında gelir, uygulamayı açmanıza bile gerek kalmaz."
        : "Yes, the BeeMora panel is fully responsive — you can access it from iPhone, Android, tablet or computer with any modern browser. Thanks to push notifications, critical alerts come to your phone instantly without even opening the app.",
    },
    {
      q: isTr
        ? "Yapay zeka tam olarak ne yapıyor?"
        : "What exactly does the AI do?",
      a: isTr
        ? 'AI motorumuz 4 ana alanda çalışır: (1) Oğul Tahmini — sıcaklık artışı, ses frekansı değişimi ve titreşim paternlerini birlikte analiz ederek oğul hazırlığını 7-10 gün öncesinden tahmin eder. (2) Hastalık Tespiti — özellikle Varroa akarı enfestasyonunu ses frekansı anomalilerinden 2-3 hafta önceden tespit eder. (3) Anomali Algılama — normal dışı sıcaklık, nem veya ağırlık değişimlerini otomatik işaretler ve acil bildirim gönderir. (4) Bakım Önerileri — mevsimsel verilere ve kovan geçmişine dayanarak besleme, ilaçlama ve hasat zamanlaması önerileri sunar. Tüm bu analizler gerçek zamanlı yapılır ve sonuçlar panelinizdeki "AI Önerileri" bölümünde görüntülenir.'
        : 'Our AI engine works in 4 main areas: (1) Swarm Prediction — analyzes temperature rise, sound frequency changes and vibration patterns together to predict swarm preparation 7-10 days in advance. (2) Disease Detection — detects Varroa mite infestation from sound frequency anomalies 2-3 weeks early. (3) Anomaly Detection — automatically flags abnormal temperature, humidity or weight changes and sends urgent notifications. (4) Maintenance Recommendations — provides feeding, treatment and harvest timing suggestions based on seasonal data and hive history. All analyses are performed in real-time and results are displayed in the "AI Recommendations" section of your panel.',
    },
    {
      q: isTr
        ? "Fiyatlandırma nasıl çalışıyor? Gizli ücret var mı?"
        : "How does pricing work? Are there hidden fees?",
      a: isTr
        ? "Kademeli abonelik modelimiz şu şekilde çalışır: 1-50 kovan: ₺50/kovan/ay, 51-100 kovan: ₺45/kovan/ay, 100+ kovan: ₺40/kovan/ay. Tüm paketlerde aynı özellikler: AI analiz, anlık bildirimler, raporlama, 7/24 destek ve tüm yazılım güncellemeleri. Gizli ücret, kurulum ücreti veya sözleşme zorunluluğu yoktur. İlk 30 gün ücretsiz deneme sunuyoruz — memnun kalmazsanız tam iade garantisi veriyoruz."
        : "Our tiered subscription works as follows: 1-50 hives: ₺50/hive/mo, 51-100 hives: ₺45/hive/mo, 100+ hives: ₺40/hive/mo. Same features in all tiers: AI analysis, instant notifications, reporting, 24/7 support and all software updates. No hidden fees, setup fees or contract obligations. We offer a free 30-day trial — if you're not satisfied, we provide a full refund guarantee.",
    },
    {
      q: isTr
        ? "Verilerim güvende mi?"
        : "Is my data secure?",
      a: isTr
        ? "Evet, tüm verileriniz şifreli bulut sunucularımızda güvenle saklanır. SSL/TLS şifreleme ile veri aktarımı korunur, düzenli yedeklemeler yapılır ve KVKK uyumlu veri saklama politikamız mevcuttur. Hesabınıza yalnızca siz erişebilirsiniz ve iki faktörlü kimlik doğrulama (2FA) desteği sunuyoruz."
        : "Yes, all your data is securely stored on our encrypted cloud servers. Data transmission is protected with SSL/TLS encryption, regular backups are performed and we have a GDPR-compliant data storage policy. Only you can access your account and we offer two-factor authentication (2FA) support.",
    },
  ];

  /* ── HANDLERS ── */
  const handleScrollTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    [],
  );
  const handleNavigatePanel = useCallback(() => navigate("/panel"), [navigate]);

  const handleContactSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = fd.get("name") || "";
      const city = fd.get("city") || "";
      const hives = fd.get("hives") || "";
      const phone = fd.get("phone") || "";
      const msg = fd.get("message") || "";
      const body = [
        `${isTr ? "İsim" : "Name"}: ${name}`,
        `${isTr ? "Şehir" : "City"}: ${city}`,
        `${isTr ? "Kovan Sayısı" : "Hive Count"}: ${hives}`,
        `${isTr ? "Telefon" : "Phone"}: ${phone}`,
        "",
        msg,
      ].join("%0A");
      window.location.href = `mailto:beemoraproject@gmail.com?subject=Demo%20Talebi%20%7C%20BeeMora%20-%20${encodeURIComponent(name)}&body=${body}`;
    },
    [isTr],
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden scroll-smooth">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/80 shadow-2xl"
            : "bg-transparent"
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleScrollTop}
            className="flex items-center gap-3 group"
            aria-label="BeeMora — go to top"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400/60 transition-all shadow-md shadow-amber-500/10">
              <span className="text-xl leading-none">🐝</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xl font-extrabold leading-none bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Bee<span className="text-white">Mora</span>
              </span>
              <span className="text-[10px] text-gray-500 leading-none mt-0.5">
                {isTr ? "Akıllı Arıcılık" : "Smart Beekeeping"}
              </span>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-6 text-sm text-gray-400">
            {navLinks.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => scrollTo(l.id)}
                className="hover:text-amber-400 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLangToggle}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={lang === "tr" ? "Switch to English" : "Türkçe'ye geç"}
            >
              <Globe className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleNavigatePanel}
              className="hidden sm:flex ml-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm rounded-lg transition-all hover:scale-105 shadow-lg shadow-amber-500/25"
            >
              {isTr ? "Giriş Yap" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenu((v) => !v)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-200"
              aria-label={mobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenu}
            >
              {mobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 px-6 py-4 space-y-2">
            {navLinks.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => scrollTo(l.id)}
                className="block w-full text-left py-2 text-gray-300 hover:text-amber-400 transition-colors"
              >
                {l.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenu(false);
                navigate("/panel");
              }}
              className="w-full mt-2 px-5 py-2.5 bg-amber-500 text-black font-semibold text-sm rounded-lg"
            >
              {isTr ? "Giriş Yap" : "Sign In"}
            </button>
          </div>
        )}
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-10"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-950/80 to-gray-950" />

          {/* Ambient amber glow */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-2/3 left-1/4 w-[400px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          {/* Honeycomb grid */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.055]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <pattern
              id="hexGrid"
              width="56"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(2.5)"
            >
              <path
                d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.6"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#hexGrid)" />
          </svg>

          {/* Floating decorative hexagons */}
          <svg
            className="absolute top-24 right-16 w-32 h-36 animate-[float_6s_ease-in-out_infinite] pointer-events-none"
            viewBox="0 0 80 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
              stroke="#f59e0b"
              strokeWidth="1.2"
              fill="rgba(245,158,11,0.04)"
            />
          </svg>
          <svg
            className="absolute top-48 right-48 w-16 h-18 animate-[float_8s_ease-in-out_infinite] pointer-events-none"
            viewBox="0 0 80 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
              stroke="#f59e0b"
              strokeWidth="1.5"
              fill="rgba(245,158,11,0.06)"
            />
          </svg>
          <svg
            className="absolute bottom-32 left-16 w-20 h-24 animate-[float_5s_ease-in-out_infinite] pointer-events-none"
            viewBox="0 0 80 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
              stroke="#fb923c"
              strokeWidth="1"
              fill="rgba(251,146,60,0.04)"
            />
          </svg>
          <svg
            className="absolute top-32 left-1/3 w-10 h-12 animate-[float_7s_ease-in-out_infinite] pointer-events-none"
            viewBox="0 0 80 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M40 5L75 24V62L40 81L5 62V24L40 5Z"
              stroke="#fbbf24"
              strokeWidth="2"
              fill="rgba(251,191,36,0.05)"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium">
                <Award className="w-4 h-4" />
                {isTr ? "2025'ten beri" : "Since 2025"}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium">
                <Shield className="w-4 h-4" />
                {isTr ? "Yeni Başlıyoruz" : "Just Launched"}
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
              {isTr ? (
                <>
                  Kovanlarınız
                  <br />
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    Güvende
                  </span>
                </>
              ) : (
                <>
                  Your Hives
                  <br />
                  <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    Are Safe
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg text-gray-300 max-w-xl mb-4 leading-relaxed">
              {isTr
                ? "Türkiye'nin lider akıllı arıcılık platformu BeeMora ile kovanlarınızı 7/24 uzaktan izleyin. Özel geliştirdiğimiz IoT sensörler kovan içi sıcaklık, nem, basınç, ses ve titreşimi anlık olarak ölçer."
                : "Monitor your hives 24/7 remotely with BeeMora, Turkey's leading smart beekeeping platform. Our proprietary IoT sensors measure in-hive temperature, humidity, pressure, sound and vibration in real-time."}
            </p>
            <p className="text-base text-gray-500 max-w-xl mb-8 leading-relaxed">
              {isTr
                ? "Yapay zeka motorumuz verileri analiz ederek oğul riski, hastalık belirtileri ve anormal durumları tespit eder — siz fark etmeden önce. Erken uyarı sistemiyle koloni kayıplarını %85'e kadar azaltın."
                : "Our AI engine analyzes data to detect swarm risk, disease symptoms and abnormal conditions — before you even notice. Reduce colony losses by up to 85% with our early warning system."}
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              {[
                {
                  icon: "🌡️",
                  text: isTr
                    ? "Sıcaklık & Nem İzleme"
                    : "Temp & Humidity Monitoring",
                },
                {
                  icon: "🧠",
                  text: isTr ? "AI Oğul Tahmini" : "AI Swarm Prediction",
                },
                {
                  icon: "🔔",
                  text: isTr ? "Anlık Bildirimler" : "Instant Alerts",
                },
                {
                  icon: "📊",
                  text: isTr ? "Detaylı Raporlar" : "Detailed Reports",
                },
              ].map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/60 border border-gray-700/50 rounded-lg text-sm text-gray-300"
                >
                  <span aria-hidden="true">{item.icon}</span> {item.text}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                type="button"
                onClick={handleNavigatePanel}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg rounded-xl transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 overflow-hidden"
              >
                {isTr ? "Hemen Başla" : "Get Started"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => scrollTo("contact")}
                className="flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 hover:border-amber-500/50 text-gray-300 hover:text-amber-400 font-medium text-lg rounded-xl transition-all"
              >
                {isTr ? "Demo Talep Et" : "Request Demo"}
                <Mail className="w-5 h-5" />
              </button>
            </div>

            {/* Hero stats */}
            <div
              ref={heroStatsRef}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {[
                { val: "0", label: isTr ? "Aktif Kovan" : "Active Hives" },
                {
                  counter: c3,
                  suffix: ".8%",
                  label: isTr ? "Sistem Uptime" : "System Uptime",
                },
                { val: "3", label: isTr ? "Adaptör Tipi" : "Adapter Types" },
                {
                  val: isTr ? "Beta" : "Beta",
                  isBadge: true,
                  label: isTr ? "Erken Erişim Aktif" : "Early Access Live",
                },
              ].map((s, i) => (
                <div key={i}>
                  {s.isBadge ? (
                    <span className="inline-block px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-sm font-bold rounded-full">
                      {s.val}
                    </span>
                  ) : s.counter ? (
                    <p className="text-3xl font-extrabold text-amber-400">
                      {s.counter.count}
                      {s.suffix}
                    </p>
                  ) : (
                    <p className="text-3xl font-extrabold text-amber-400">
                      {s.val}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl shadow-2xl shadow-amber-500/10 border border-gray-700/60 bg-gray-900/90 backdrop-blur-xl p-5">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
                <div
                  className="w-3 h-3 rounded-full bg-red-500/80"
                  aria-hidden="true"
                />
                <div
                  className="w-3 h-3 rounded-full bg-amber-500/80"
                  aria-hidden="true"
                />
                <div
                  className="w-3 h-3 rounded-full bg-emerald-500/80"
                  aria-hidden="true"
                />
                <span className="ml-3 text-[10px] font-mono text-gray-600">
                  beemora.io/panel
                </span>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                  <div
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-bold text-emerald-400">
                    {isTr ? "CANLI" : "LIVE"}
                  </span>
                </div>
              </div>

              {/* Hive Health Score — circular */}
              <div className="flex items-center gap-5 mb-5">
                <div
                  className="relative w-24 h-24 flex-shrink-0"
                  role="img"
                  aria-label="Hive health 92%"
                >
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#heroGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="92, 100"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="heroGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-emerald-400">
                      92%
                    </span>
                    <span className="text-[8px] text-gray-500 uppercase tracking-wider">
                      {isTr ? "Sağlık" : "Health"}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-100 mb-0.5">
                    {isTr ? "Kovan Sağlık Skoru" : "Hive Health Score"}
                  </h4>
                  <p className="text-[10px] text-gray-500 mb-2">
                    {isTr
                      ? "Tüm parametreler optimal aralıkta"
                      : "All parameters within optimal range"}
                  </p>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded">
                      {isTr ? "Stabil" : "Stable"}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-[9px] font-bold rounded">
                      {isTr ? "Bal Hasadı Uygun" : "Harvest Ready"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sensor data widgets */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  {
                    label: isTr ? "Sıcaklık" : "Temp",
                    val: "34.5°C",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                  },
                  {
                    label: isTr ? "Nem" : "Humidity",
                    val: "58%",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/20",
                  },
                  {
                    label: isTr ? "Ağırlık" : "Weight",
                    val: "42.3kg",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/20",
                  },
                  {
                    label: isTr ? "Ses" : "Sound",
                    val: "220Hz",
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/20",
                  },
                ].map((w, i) => (
                  <div
                    key={i}
                    className={`${w.bg} border ${w.border} rounded-lg p-2.5 text-center`}
                  >
                    <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
                      {w.label}
                    </p>
                    <p className={`text-base font-bold ${w.color}`}>{w.val}</p>
                  </div>
                ))}
              </div>

              {/* Sound wave visualization */}
              <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {isTr ? "Titreşim Analizi" : "Vibration Analysis"}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">
                    {isTr ? "Sağlıklı Vızıltı" : "Healthy Buzz"}
                  </span>
                </div>
                <div
                  className="flex items-end gap-[3px] h-10"
                  aria-hidden="true"
                >
                  {[
                    30, 50, 35, 65, 45, 70, 55, 80, 40, 60, 50, 75, 45, 65, 55,
                    70, 40, 55, 35, 50, 45, 60, 50, 70, 55, 80, 60, 45, 55, 65,
                  ].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-purple-500/60 to-purple-400/20 rounded-t transition-all"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Temperature trend mini chart */}
              <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {isTr ? "Sıcaklık Trendi (24s)" : "Temp Trend (24h)"}
                  </span>
                  <span className="text-[9px] text-amber-400 font-mono">
                    34.5°C
                  </span>
                </div>
                <div className="flex items-end gap-1 h-12" aria-hidden="true">
                  {[
                    55, 58, 60, 62, 65, 68, 72, 75, 78, 80, 82, 85, 83, 80, 78,
                    75, 72, 70, 68, 72, 75, 78, 80, 82,
                  ].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-amber-500/70 to-amber-400/20 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* AI insight */}
              <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
                <Zap
                  className="w-4 h-4 text-amber-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[11px] text-gray-300">
                  <span className="text-amber-400 font-bold">AI:</span>{" "}
                  {isTr
                    ? "Kovan sağlığı optimal. Bal hasadı için uygun dönem."
                    : "Hive health optimal. Suitable period for honey harvest."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          aria-hidden="true"
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </div>
      </section>

      {/* ═══════════ TRUSTED BY + GOAL ═══════════ */}
      <section
        data-animate
        id="trust"
        className={`py-16 px-6 border-t border-gray-800/50 transition-all duration-700 ${anim("trust")}`}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[11px] text-gray-500 uppercase tracking-[0.2em] mb-8">
            {isTr ? "Güvenilir Ortaklarımız" : "Trusted By"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-12 opacity-50">
            {[
              { name: "Konya Teknik Üniversitesi", abbr: "KTÜN" },
              {
                name: isTr
                  ? "Türkiye Arıcılar Birliği"
                  : "Turkey Beekeepers Assoc.",
                abbr: "TAB",
              },
              { name: isTr ? "Konya Teknopark" : "Konya Technopark", abbr: "KTP" },
              {
                name: isTr
                  ? "Konya Arıcılık Kooperatifi"
                  : "Konya Beekeeping Coop.",
                abbr: "KAK",
              },
              {
                name: isTr
                  ? "Tarım ve Orman Bakanlığı"
                  : "Ministry of Agriculture",
                abbr: isTr ? "TOB" : "MoA",
              },
            ].map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 group"
                title={p.name}
              >
                <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-[8px] font-bold text-gray-400">
                    {p.abbr.slice(0, 2)}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-500 hidden sm:inline">
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          {/* Goal card */}
          <div className="max-w-2xl mx-auto bg-gray-900/70 border border-dashed border-amber-500/30 rounded-2xl p-6 md:p-8 text-center">
            <span className="text-4xl block mb-3" aria-hidden="true">
              🎯
            </span>
            <h3 className="text-lg font-bold text-gray-100 mb-2">
              {isTr ? "Hedefimiz" : "Our Goal"}
            </h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              {isTr
                ? "Türkiye'deki yıllık %30 koloni kaybını teknolojiyle minimize etmek. Beta sürecimiz devam ediyor — ilk kullanıcılarımızın deneyimlerini yakında burada paylaşacağız."
                : "Minimize Turkey's annual 30% colony loss through technology. Our beta is ongoing — we'll share our first users' experiences here soon."}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Clock className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-amber-400">
                {isTr ? "Beta Erken Erişim Aktif" : "Beta Early Access Active"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TURKEY BEEKEEPING CRISIS ═══════════ */}
      <section
        id="crisis"
        data-animate
        className={`py-24 px-6 transition-all duration-700 ${anim("crisis")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr
                ? "Türkiye'de Arıcılık Krizi"
                : "Turkey's Beekeeping Crisis"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isTr ? "Rakamlarla Gerçekler" : "Facts in Numbers"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {isTr
                ? "Türkiye, 8.1 milyon kovanla dünya bal üretiminde 2. sırada. Ancak her yıl milyonlarca koloni kaybediliyor."
                : "Turkey ranks 2nd in world honey production with 8.1 million hives. Yet millions of colonies are lost every year."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {crisisStats.map((s, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center hover:border-red-500/30 transition-colors"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-red-400 mb-1">
                  {s.val}
                </p>
                <p className="text-sm font-semibold text-gray-200 mb-1">
                  {s.label}
                </p>
                <p className="text-xs text-gray-500">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Detailed problems */}
          <h3 className="text-center text-xl font-bold text-gray-200 mb-8">
            {isTr
              ? "Arıcıların Karşılaştığı Temel Sorunlar"
              : "Key Problems Beekeepers Face"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              {
                icon: "🦟",
                title: isTr
                  ? "Varroa Akarı & Hastalıklar"
                  : "Varroa Mite & Diseases",
                desc: isTr
                  ? "Varroa destructor, dünya genelinde koloni kayıplarının 1 numaralı sebebi. Erken teşhis edilmezse tüm koloniyi 3-6 ay içinde yok edebilir. Geleneksel yöntemlerle tespit ancak belirtiler görünür hale geldiğinde — yani çoğu zaman çok geç — mümkün oluyor."
                  : "Varroa destructor is the #1 cause of colony losses worldwide. If not detected early, it can destroy an entire colony within 3-6 months. Traditional detection is only possible when symptoms become visible — often too late.",
                stat: isTr ? "%45" : "45%",
                statLabel: isTr
                  ? "Koloni kayıplarının sebebi"
                  : "Of colony losses",
                color: "border-red-500/30",
                iconBg: "bg-red-500/15",
                statColor: "text-red-400",
              },
              {
                icon: "🐝",
                title: isTr ? "Kontrolsüz Oğul Verme" : "Uncontrolled Swarming",
                desc: isTr
                  ? "Oğul verme doğal bir süreçtir ancak kontrol edilmezse koloninin %60'ını kaybedersiniz. Oğul hazırlığı kovan içi sıcaklık, ses frekansı ve titreşim değişimleriyle 7-10 gün öncesinden tespit edilebilir — ama bunu insan kulağıyla yakalamak neredeyse imkansız."
                  : "Swarming is natural but if uncontrolled, you lose 60% of your colony. Swarm preparation can be detected 7-10 days in advance through temperature, sound frequency and vibration changes — but catching this with human senses is nearly impossible.",
                stat: isTr ? "%60" : "60%",
                statLabel: isTr
                  ? "Koloni kaybı (oğulda)"
                  : "Colony loss (per swarm)",
                color: "border-amber-500/30",
                iconBg: "bg-amber-500/15",
                statColor: "text-amber-400",
              },
              {
                icon: "🌡️",
                title: isTr
                  ? "İklim Değişikliği & Sıcaklık Şokları"
                  : "Climate Change & Temperature Shocks",
                desc: isTr
                  ? "Ani sıcaklık değişimleri arı kümesini bozar, kuluçka ölümlerine yol açar. Kovan içi sıcaklığın 32-36°C aralığında kalması kritiktir. Gece-gündüz sıcaklık farkının 15°C'yi aştığı bölgelerde koloni stresi %3 kat artıyor."
                  : "Sudden temperature changes disrupt the bee cluster and cause brood death. Internal hive temperature must stay within 32-36°C. In regions where day-night temperature difference exceeds 15°C, colony stress increases 3x.",
                stat: "32-36°C",
                statLabel: isTr
                  ? "Kritik sıcaklık aralığı"
                  : "Critical temp range",
                color: "border-orange-500/30",
                iconBg: "bg-orange-500/15",
                statColor: "text-orange-400",
              },
              {
                icon: "🔒",
                title: isTr
                  ? "Kovan Hırsızlığı & Devrilme"
                  : "Hive Theft & Tipping",
                desc: isTr
                  ? "Özellikle kırsal bölgelerde kovan hırsızlığı ciddi bir sorun. Ayrıca fırtına, hayvan veya vandalizm kaynaklı devrilmeler de koloni kaybına yol açıyor. Arıcılar genellikle durumu ancak haftalık kontrolde fark ediyor — o zamana kadar kovan çoktan gitmiş oluyor."
                  : "Hive theft is a serious problem especially in rural areas. Storm, animal or vandalism-caused tipping also leads to colony loss. Beekeepers usually only notice during weekly inspection — by then the hive is already gone.",
                stat: isTr ? "%12" : "12%",
                statLabel: isTr
                  ? "Kayıpların hırsızlık payı"
                  : "Losses from theft",
                color: "border-purple-500/30",
                iconBg: "bg-purple-500/15",
                statColor: "text-purple-400",
              },
            ].map((p, i) => (
              <div
                key={i}
                className={`bg-gray-900/80 border ${p.color} rounded-2xl p-6`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 ${p.iconBg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}
                    aria-hidden="true"
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-100 mb-1">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-extrabold ${p.statColor}`}>
                        {p.stat}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {p.statLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Solution */}
          <div id="solution">
            <div className="text-center mb-10">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3">
                {isTr ? "BeeMora Çözümleri" : "BeeMora Solutions"}
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                {isTr
                  ? "Her Soruna Akıllı Çözüm"
                  : "Smart Solution for Every Problem"}
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {isTr
                  ? "Özel geliştirdiğimiz IoT sensörler ve yapay zeka algoritmaları ile yukarıdaki sorunların her birini erken tespit ediyor ve önlüyoruz."
                  : "With our proprietary IoT sensors and AI algorithms, we detect and prevent each of the above problems early."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {[
                {
                  problem: isTr ? "Varroa & Hastalık" : "Varroa & Disease",
                  solution: isTr
                    ? "Ses Frekansı Analizi ile Erken Tespit"
                    : "Early Detection via Sound Frequency Analysis",
                  desc: isTr
                    ? "AI motorumuz kovan içi ses frekanslarını analiz ederek Varroa enfestasyonunu belirtiler görünmeden 2-3 hafta önce tespit eder. Anormal vızıltı paternleri otomatik olarak işaretlenir ve size bildirim gönderilir."
                    : "Our AI engine analyzes in-hive sound frequencies to detect Varroa infestation 2-3 weeks before symptoms appear. Abnormal buzz patterns are automatically flagged and you receive a notification.",
                  icon: Shield,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                },
                {
                  problem: isTr ? "Oğul Verme" : "Swarming",
                  solution: isTr
                    ? "7-10 Gün Önceden AI Tahmini"
                    : "7-10 Day Advance AI Prediction",
                  desc: isTr
                    ? "Sıcaklık artışı, ses frekansı değişimi ve titreşim paternlerini birlikte analiz ederek oğul hazırlığını 7-10 gün öncesinden tahmin ediyoruz. Arıcıya zaman kazandırarak kontrollü oğul alma imkanı sağlıyoruz."
                    : "By analyzing temperature rise, sound frequency changes and vibration patterns together, we predict swarm preparation 7-10 days in advance. This gives beekeepers time for controlled swarm management.",
                  icon: Zap,
                  color: "text-amber-400",
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/20",
                },
                {
                  problem: isTr ? "Sıcaklık Şoku" : "Temperature Shock",
                  solution: isTr
                    ? "Anlık Sıcaklık Alarmı (< 10sn)"
                    : "Instant Temperature Alert (< 10s)",
                  desc: isTr
                    ? "Kovan içi sıcaklık 32°C altına düştüğünde veya 36°C üzerine çıktığında 10 saniye içinde push bildirim gönderiyoruz. Gece yarısı bile anında haberdar olursunuz. Kuluçka ölümlerini %90 oranında önlüyoruz."
                    : "When internal hive temperature drops below 32°C or rises above 36°C, we send a push notification within 10 seconds. You're notified instantly, even at midnight. We prevent 90% of brood deaths.",
                  icon: AlertTriangle,
                  color: "text-orange-400",
                  bg: "bg-orange-500/10",
                  border: "border-orange-500/20",
                },
                {
                  problem: isTr ? "Hırsızlık & Devrilme" : "Theft & Tipping",
                  solution: isTr
                    ? "Ağırlık + İvmeölçer ile Anlık Tespit"
                    : "Instant Detection via Weight + Accelerometer",
                  desc: isTr
                    ? "Kovan ağırlığında ani düşüş veya ivmeölçer verilerinde devrilme hareketi algılandığında saniyeler içinde alarm verilir. GPS konum takibi ile hırsızlık durumunda kovanın nereye götürüldüğü izlenebilir."
                    : "When sudden weight drop or tipping motion is detected via accelerometer, an alarm is triggered within seconds. GPS location tracking allows you to trace where the hive is taken in case of theft.",
                  icon: MapPin,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20",
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className={`${s.bg} border ${s.border} rounded-2xl p-6`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 ${s.bg} border ${s.border} rounded-lg flex items-center justify-center`}
                      >
                        <Icon
                          className={`w-5 h-5 ${s.color}`}
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider line-through">
                          {s.problem}
                        </p>
                        <p className={`text-sm font-bold ${s.color}`}>
                          {s.solution}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold rounded-lg">
                {isTr
                  ? "🛡️ %85 Daha Az Koloni Kaybı"
                  : "🛡️ 85% Less Colony Loss"}
              </span>
              <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-semibold rounded-lg">
                {isTr ? "⚡ 10sn Veri Gecikmesi" : "⚡ 10s Data Latency"}
              </span>
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold rounded-lg">
                {isTr ? "🧠 AI Destekli Tahmin" : "🧠 AI-Powered Prediction"}
              </span>
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold rounded-lg">
                {isTr ? "📍 GPS Konum Takibi" : "📍 GPS Location Tracking"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section
        id="features"
        data-animate
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("features")}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Platform Özellikleri" : "Platform Features"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-100 via-amber-100 to-gray-100 bg-clip-text text-transparent">
              {isTr
                ? "Endüstriyel Güçte Özellikler"
                : "Industrial-Grade Features"}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {isTr
                ? "Saha deneyimimizle geliştirilen, profesyonel arıcılar için tasarlandı"
                : "Designed for professional beekeepers, built with real field experience"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-100 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ BIG STATS BANNER ═══════════ */}
      <section
        data-animate
        id="stats"
        className={`py-16 px-6 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 border-y border-amber-500/10 transition-all duration-700 ${anim("stats")}`}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem
            end={0}
            suffix=""
            label={isTr ? "Aktif Kovan" : "Active Hives"}
            sub={isTr ? "henüz satış yok" : "no sales yet"}
          />
          <StatItem
            end={3}
            suffix=""
            label={isTr ? "Adaptör Tipi" : "Adapter Types"}
            sub={isTr ? "Basic / Standard / Pro" : "Basic / Standard / Pro"}
          />
          <StatItem
            end={6}
            suffix=""
            label={isTr ? "Sensör Parametresi" : "Sensor Parameters"}
            sub={isTr ? "tek modülde" : "in one module"}
          />
          <StatItem
            end={10}
            suffix="sn"
            label={isTr ? "Veri Gecikmesi" : "Data Latency"}
            sub={isTr ? "gerçek zamanlı" : "real-time"}
          />
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section
        id="how"
        data-animate
        className={`py-24 px-6 transition-all duration-700 ${anim("how")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
                {isTr ? "Nasıl Çalışır" : "How It Works"}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {isTr ? "4 Adımda Başlayın" : "Get Started in 4 Steps"}
              </h2>
              <div className="space-y-6">
                {howSteps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                        <Icon
                          className="w-5 h-5 text-amber-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-500/50">
                            {step.num}
                          </span>
                          <h3 className="text-lg font-bold text-gray-100">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System status panel */}
            <div className="rounded-2xl shadow-2xl border border-gray-700/60 bg-gray-900/90 backdrop-blur-xl p-5 h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-emerald-400">
                    {isTr
                      ? "Sistem Aktif — 12 Kovan İzleniyor"
                      : "System Active — Monitoring 12 Hives"}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-gray-600">v2.0</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  {
                    name: isTr ? "Bulut Sunucu" : "Cloud Server",
                    status: isTr ? "Bağlı" : "Connected",
                    ok: true,
                  },
                  { name: "API Server", status: "< 50ms", ok: true },
                  {
                    name: isTr ? "Veri Akışı" : "Data Stream",
                    status: "12/12",
                    ok: true,
                  },
                  {
                    name: isTr ? "AI Motor" : "AI Engine",
                    status: isTr ? "Çalışıyor" : "Running",
                    ok: true,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-gray-800/50 border border-gray-700/40 rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <span className="text-[10px] text-gray-400">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-emerald-400">
                        {s.status}
                      </span>
                      <div
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 space-y-1.5 overflow-hidden mb-4">
                {[
                  {
                    id: "#01",
                    name: isTr ? "Merkez" : "Central",
                    status: "stable",
                    temp: "34.2°C",
                  },
                  {
                    id: "#02",
                    name: isTr ? "Güney" : "South",
                    status: "stable",
                    temp: "33.8°C",
                  },
                  {
                    id: "#03",
                    name: isTr ? "Kuzey" : "North",
                    status: "warning",
                    temp: "37.1°C",
                  },
                  {
                    id: "#04",
                    name: isTr ? "Doğu" : "East",
                    status: "stable",
                    temp: "34.5°C",
                  },
                  {
                    id: "#05",
                    name: isTr ? "Batı" : "West",
                    status: "critical",
                    temp: "39.8°C",
                  },
                ].map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800/40 border ${
                      h.status === "critical"
                        ? "border-red-500/30"
                        : h.status === "warning"
                          ? "border-amber-500/30"
                          : "border-gray-800"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        h.status === "critical"
                          ? "bg-red-500 animate-pulse"
                          : h.status === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-mono text-amber-400 w-6">
                      {h.id}
                    </span>
                    <span className="text-[10px] text-gray-400 flex-1">
                      {h.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-300">
                      {h.temp}
                    </span>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        h.status === "critical"
                          ? "bg-red-500/20 text-red-400"
                          : h.status === "warning"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {h.status === "critical"
                        ? isTr
                          ? "KRİTİK"
                          : "CRIT"
                        : h.status === "warning"
                          ? isTr
                            ? "UYARI"
                            : "WARN"
                          : "OK"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800/40 border border-gray-700/40 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {isTr ? "Kovan Aktivitesi (24s)" : "Hive Activity (24h)"}
                  </span>
                </div>
                <div className="flex gap-1.5 items-end h-10" aria-hidden="true">
                  {[35, 50, 42, 65, 55, 78, 62, 72, 48, 82, 68, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-amber-500/70 to-amber-400/20 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DASHBOARD PREVIEW ═══════════ */}
      <section
        id="preview"
        data-animate
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("preview")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Kontrol Paneli" : "Control Panel"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr
                ? "Profesyonel Yönetim Arayüzü"
                : "Professional Management Interface"}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {isTr
                ? "Sezgisel ve güçlü kontrol paneli ile kovanlarınızı yönetin"
                : "Manage your hives with an intuitive and powerful control panel"}
            </p>
          </div>

          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="bg-gray-950 border-b border-gray-800 px-6 py-3 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full bg-red-500/80"
                aria-hidden="true"
              />
              <div
                className="w-3 h-3 rounded-full bg-amber-500/80"
                aria-hidden="true"
              />
              <div
                className="w-3 h-3 rounded-full bg-emerald-500/80"
                aria-hidden="true"
              />
              <span className="ml-4 text-xs text-gray-600 font-mono">
                beemora.io/panel
              </span>
            </div>
            <div className="p-5 md:p-7">
              {/* Top stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  {
                    label: isTr ? "Toplam Kovan" : "Total Hives",
                    val: "12",
                    icon: "🐝",
                    border: "border-amber-500/20",
                    color: "text-amber-400",
                    bg: "bg-amber-500/5",
                  },
                  {
                    label: isTr ? "Stabil" : "Stable",
                    val: "9",
                    icon: "✅",
                    border: "border-emerald-500/20",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/5",
                  },
                  {
                    label: isTr ? "Uyarı" : "Warning",
                    val: "2",
                    icon: "⚠️",
                    border: "border-amber-500/20",
                    color: "text-amber-400",
                    bg: "bg-amber-500/5",
                  },
                  {
                    label: isTr ? "Kritik" : "Critical",
                    val: "1",
                    icon: "🔴",
                    border: "border-red-500/20",
                    color: "text-red-400",
                    bg: "bg-red-500/5",
                  },
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`${c.bg} border ${c.border} rounded-xl p-3`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {c.label}
                      </p>
                      <span className="text-sm" aria-hidden="true">
                        {c.icon}
                      </span>
                    </div>
                    <p className={`text-2xl font-extrabold ${c.color}`}>
                      {c.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Temperature chart */}
                <div className="md:col-span-2 bg-gray-800/30 border border-gray-700/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {isTr
                        ? "Sıcaklık Trendi (24 Saat)"
                        : "Temperature Trend (24h)"}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400">
                      34.5°C
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-36" aria-hidden="true">
                    {[
                      35, 50, 42, 65, 55, 78, 62, 72, 48, 82, 68, 88, 58, 75,
                      90, 70,
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-amber-500/80 to-amber-400/30 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hive Health Score */}
                <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4 flex flex-col justify-center items-center">
                  <div
                    className="relative w-28 h-28 mb-2"
                    role="img"
                    aria-label="Average hive health 87%"
                  >
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#prevGrad)"
                        strokeWidth="3.5"
                        strokeDasharray="87, 100"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="prevGrad"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-emerald-400">
                        87%
                      </span>
                      <span className="text-[8px] text-gray-500 uppercase">
                        {isTr ? "Sağlık" : "Health"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-300">
                    Hive Health Score
                  </p>
                  <p className="text-[9px] text-gray-500">
                    {isTr ? "Tüm kovanlar ortalaması" : "All hives average"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vibration analysis */}
                <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {isTr ? "Titreşim Analizi" : "Vibration Analysis"}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">
                      {isTr ? "Sağlıklı Vızıltı" : "Healthy Buzz"}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-[2px] h-12"
                    aria-hidden="true"
                  >
                    {[
                      20, 40, 25, 55, 35, 60, 45, 70, 30, 50, 40, 65, 35, 55,
                      45, 60, 30, 45, 25, 40, 35, 50, 40, 60, 45, 70, 50, 35,
                      45, 55, 40, 65,
                    ].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-purple-500/60 to-purple-400/15 rounded-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-gray-600">0Hz</span>
                    <span className="text-[9px] text-purple-400 font-mono">
                      220Hz {isTr ? "tepe" : "peak"}
                    </span>
                    <span className="text-[9px] text-gray-600">500Hz</span>
                  </div>
                </div>

                {/* Live sensor readings */}
                <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-3">
                    {isTr ? "Canlı Sensör Verileri" : "Live Sensor Readings"}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: isTr ? "İç Sıcaklık" : "Internal Temp",
                        val: "34.5°C",
                        color: "text-amber-400",
                      },
                      {
                        label: isTr ? "Nem" : "Humidity",
                        val: "58%",
                        color: "text-blue-400",
                      },
                      {
                        label: isTr ? "Ağırlık" : "Weight",
                        val: "42.3kg",
                        color: "text-emerald-400",
                      },
                      {
                        label: isTr ? "Ses" : "Sound",
                        val: "38dB",
                        color: "text-purple-400",
                      },
                      {
                        label: isTr ? "Basınç" : "Pressure",
                        val: "1013hPa",
                        color: "text-cyan-400",
                      },
                      {
                        label: isTr ? "Batarya" : "Battery",
                        val: "92%",
                        color: "text-green-400",
                      },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <p className={`text-sm font-bold ${s.color}`}>
                          {s.val}
                        </p>
                        <p className="text-[8px] text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={handleNavigatePanel}
              className="group inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              {isTr ? "Canlı paneli deneyin" : "Try the live panel"}
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ MOBILE APP PREVIEW ═══════════ */}
      <section
        data-animate
        id="mobile"
        className={`py-24 px-6 transition-all duration-700 ${anim("mobile")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
                {isTr ? "Mobil Erişim" : "Mobile Access"}
              </p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {isTr ? "Kovanlarınız Cebinizde" : "Your Hives in Your Pocket"}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                {isTr
                  ? "Dağda, bayırda, nerede olursanız olun — telefonunuzdan anlık uyarılar alın ve kovanlarınızı yönetin. Kritik durumlarda saniyeler içinde haberdar olun."
                  : "Wherever you are — in the mountains, in the field — receive instant alerts and manage your hives from your phone. Be notified within seconds of critical situations."}
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Bell,
                    text: isTr
                      ? "Anlık push bildirimler — kritik uyarılar kaçmaz"
                      : "Instant push notifications — never miss critical alerts",
                    color: "text-red-400",
                  },
                  {
                    icon: Eye,
                    text: isTr
                      ? "Tüm kovan verilerini tek ekranda görüntüle"
                      : "View all hive data on a single screen",
                    color: "text-blue-400",
                  },
                  {
                    icon: Zap,
                    text: isTr
                      ? "Tek dokunuşla aksiyon al — hızlı müdahale"
                      : "Take action with one tap — rapid response",
                    color: "text-amber-400",
                  },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-800/80 border border-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon
                          className={`w-4 h-4 ${f.color}`}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-sm text-gray-300">{f.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center">
              <div className="relative w-[280px]" aria-hidden="true">
                <div className="bg-gray-800 rounded-[3rem] p-3 shadow-2xl shadow-black/50 border border-gray-700">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-10" />
                  <div className="bg-gray-950 rounded-[2.4rem] overflow-hidden">
                    <div className="flex items-center justify-between px-8 pt-4 pb-2">
                      <span className="text-[10px] text-gray-400 font-semibold">
                        9:41
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-gray-500 rounded-sm">
                          <div className="w-2.5 h-full bg-emerald-400 rounded-sm" />
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-xs">🐝</span>
                      </div>
                      <span className="text-sm font-bold text-gray-100">
                        BeeMora
                      </span>
                      <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>

                    <div
                      className="mx-4 mb-3 bg-red-500/15 border border-red-500/40 rounded-xl p-4 animate-pulse"
                      style={{ animationDuration: "3s" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                          {isTr ? "ACİL UYARI" : "EMERGENCY ALERT"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-100 mb-1">
                        {isTr
                          ? "Yüksek Sıcaklık — Kovan #4"
                          : "High Temperature — Hive #4"}
                      </p>
                      <p className="text-[11px] text-gray-400 mb-3">
                        {isTr
                          ? "İç sıcaklık 41.2°C — kritik eşik aşıldı"
                          : "Internal temp 41.2°C — critical threshold exceeded"}
                      </p>
                      <button
                        type="button"
                        className="w-full py-2.5 bg-orange-500 text-black text-sm font-bold rounded-lg"
                      >
                        {isTr ? "Hemen Müdahale Et" : "Take Action Now"}
                      </button>
                    </div>

                    <div className="px-4 space-y-2 pb-4">
                      {[
                        {
                          id: "#1",
                          temp: "34.2°C",
                          status: "ok",
                          color: "bg-emerald-500",
                        },
                        {
                          id: "#2",
                          temp: "33.8°C",
                          status: "ok",
                          color: "bg-emerald-500",
                        },
                        {
                          id: "#4",
                          temp: "41.2°C",
                          status: "crit",
                          color: "bg-red-500",
                        },
                      ].map((h, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800/60 border ${h.status === "crit" ? "border-red-500/40" : "border-gray-800"}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${h.color} ${h.status === "crit" ? "animate-pulse" : ""}`}
                          />
                          <span className="text-xs font-mono text-amber-400">
                            {h.id}
                          </span>
                          <span className="text-xs text-gray-400 flex-1">
                            {isTr ? "Kovan" : "Hive"} {h.id}
                          </span>
                          <span
                            className={`text-xs font-mono ${h.status === "crit" ? "text-red-400" : "text-gray-300"}`}
                          >
                            {h.temp}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-around py-3 border-t border-gray-800 bg-gray-900/50">
                      {[
                        { icon: "🏠", active: false },
                        { icon: "📊", active: false },
                        { icon: "🔔", active: true },
                        { icon: "⚙️", active: false },
                      ].map((n, i) => (
                        <span
                          key={i}
                          className={`text-base ${n.active ? "opacity-100" : "opacity-40"}`}
                        >
                          {n.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section
        data-animate
        id="pricing"
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("pricing")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Fiyatlandırma" : "Pricing"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr
                ? "Kademeli Abonelik"
                : "Tiered Subscription"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {isTr
                ? "Kovan sayınıza göre kademeli abonelik ile tüm yazılım özelliklerine erişin. Gizli ücret yok."
                : "Access all software features with tiered subscription based on your hive count. No hidden fees."}
            </p>
          </div>

          {/* Subscription tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-12">
            {[
              {
                tier: isTr ? "Hobi / Başlangıç" : "Hobby / Starter",
                range: "1 – 50",
                price: "50",
                target: isTr
                  ? "Küçük ölçekli arıcılar"
                  : "Small-scale beekeepers",
                popular: false,
              },
              {
                tier: isTr ? "Ticari / Orta Ölçek" : "Commercial / Mid",
                range: "51 – 100",
                price: "45",
                target: isTr
                  ? "Yarı profesyonel işletmeler"
                  : "Semi-professional operations",
                popular: true,
              },
              {
                tier: isTr ? "Endüstriyel / Filo" : "Industrial / Fleet",
                range: "100+",
                price: "40",
                target: isTr
                  ? "Profesyonel büyük arılıklar"
                  : "Professional large apiaries",
                popular: false,
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`relative bg-gray-900/70 border ${
                  t.popular
                    ? "border-amber-500/50 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/10"
                    : "border-gray-800"
                } rounded-2xl p-6 text-center`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {isTr ? "Popüler" : "Popular"}
                  </div>
                )}
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                  {t.tier}
                </p>
                <p className="text-[10px] text-gray-600 mb-3">
                  {t.range} {isTr ? "kovan" : "hives"}
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-amber-400">
                    ₺{t.price}
                  </span>
                  <span className="text-sm text-gray-400">
                    /{isTr ? "kovan/ay" : "hive/mo"}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">{t.target}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {(isTr
              ? [
                  "AI analiz",
                  "Anlık bildirimler",
                  "Raporlama",
                  "7/24 destek",
                  "Tüm güncellemeler",
                  "Tüm paketlerde aynı özellikler",
                ]
              : [
                  "AI analysis",
                  "Instant alerts",
                  "Reporting",
                  "24/7 support",
                  "All updates",
                  "Same features in all tiers",
                ]
            ).map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2.5 py-1 bg-gray-900/60 border border-gray-800 rounded-lg text-xs text-gray-300"
              >
                <CheckCircle
                  className="w-3 h-3 text-emerald-400"
                  aria-hidden="true"
                />
                {f}
              </span>
            ))}
          </div>

          {/* Why this model note */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 max-w-2xl mx-auto">
            <h4 className="text-sm font-bold text-gray-200 mb-3 text-center">
              {isTr ? "Neden Bu Model?" : "Why This Model?"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
              {(isTr
                ? [
                    "Kademeli fiyat — büyüdükçe birim fiyat düşer",
                    "Aylık esneklik — dilediğiniz zaman iptal edin",
                    "Tüm yazılım güncellemeleri ve yeni özellikler dahil",
                    "İlk 30 gün ücretsiz deneme — memnun kalmazsanız iade",
                  ]
                : [
                    "Tiered pricing — unit price drops as you scale",
                    "Monthly flexibility — cancel anytime",
                    "All software updates and new features included",
                    "First 30 days free trial — refund if not satisfied",
                  ]
              ).map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle
                    className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ USE CASES ═══════════ */}
      <section
        data-animate
        id="usecases"
        className={`py-24 px-6 transition-all duration-700 ${anim("usecases")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Kullanım Senaryoları" : "Use Cases"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr
                ? "BeeMora ile Neler Yapabilirsiniz?"
                : "What Can You Do With BeeMora?"}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                icon: "🍯",
                title: isTr ? "Bal Üretim Takibi" : "Honey Production",
                desc: isTr
                  ? "Ağırlık sensörü ile hasat zamanını optimize edin"
                  : "Optimize harvest timing with weight sensor",
              },
              {
                icon: "🌸",
                title: isTr ? "Tozlaşma Hizmeti" : "Pollination Service",
                desc: isTr
                  ? "Koloni gücünü kanıtlayarak tozlaşma geliri artırın"
                  : "Increase pollination revenue by proving colony strength",
              },
              {
                icon: "🐝",
                title: isTr ? "Oğul Yönetimi" : "Swarm Management",
                desc: isTr
                  ? "AI ile 7-10 gün önceden tahmin ve kontrollü oğul alma"
                  : "AI prediction 7-10 days ahead for controlled swarming",
              },
              {
                icon: "🦟",
                title: isTr ? "Varroa Mücadelesi" : "Varroa Control",
                desc: isTr
                  ? "Ses analizi ile erken tespit, zamanında müdahale"
                  : "Early detection via sound analysis, timely intervention",
              },
              {
                icon: "🌡️",
                title: isTr ? "Kışlama Takibi" : "Wintering Monitor",
                desc: isTr
                  ? "Kış boyunca küme sıcaklığını izleyin, kayıpları önleyin"
                  : "Monitor cluster temp through winter, prevent losses",
              },
              {
                icon: "🔒",
                title: isTr ? "Güvenlik & Hırsızlık" : "Security & Theft",
                desc: isTr
                  ? "GPS + ivmeölçer ile anlık alarm ve konum takibi"
                  : "Instant alarm and location tracking via GPS + accelerometer",
              },
            ].map((u, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 text-center hover:border-amber-500/30 transition-all hover:-translate-y-1 group"
              >
                <span
                  className="text-3xl block mb-3 group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  {u.icon}
                </span>
                <h4 className="text-sm font-bold text-gray-100 mb-1">
                  {u.title}
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  {u.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ THE BEEMORA DIFFERENCE ═══════════ */}
      <section
        data-animate
        id="difference"
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("difference")}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "BeeMora Farkı" : "The BeeMora Difference"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr ? "Neden Biz?" : "Why Us?"}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {isTr
                ? "Başka hiçbir çözüm bu kritik özellikleri bir arada sunmuyor."
                : "No other solution delivers all these critical features together."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {[
              {
                title: isTr
                  ? "Uçtan Uca Türk Mühendisliği"
                  : "End-to-End Turkish Engineering",
                desc: isTr
                  ? "Yazılım ve AI — hepsi Türkiye'de tasarlanıp geliştiriliyor. Dışa bağımlılık yok, yerel destek var."
                  : "Software and AI — all designed and developed in Turkey. No foreign dependency, local support.",
                icon: "🇹🇷",
                highlight: true,
              },
              {
                title: isTr
                  ? "10 Saniye Veri Gecikmesi"
                  : "10-Second Data Latency",
                desc: isTr
                  ? "Rakiplerimiz 15-60 dakika aralıklarla veri toplarken, biz 10 saniyede bir gerçek zamanlı veri iletiyoruz."
                  : "While competitors collect data at 15-60 minute intervals, we transmit real-time data every 10 seconds.",
                icon: "⚡",
                highlight: false,
              },
              {
                title: isTr ? "6-in-1 Sensör Modülü" : "6-in-1 Sensor Module",
                desc: isTr
                  ? "Tek bir cihazda sıcaklık, nem, basınç, ses, titreşim ve ağırlık. Rakipler bunun için 3-4 ayrı cihaz satıyor."
                  : "Temperature, humidity, pressure, sound, vibration and weight in a single device. Competitors sell 3-4 separate devices for this.",
                icon: "🔬",
                highlight: false,
              },
              {
                title: isTr
                  ? "AI Destekli Tahmin Motoru"
                  : "AI-Powered Prediction Engine",
                desc: isTr
                  ? "Sadece veri göstermiyoruz — oğul tahmini, hastalık tespiti ve bakım önerileri sunuyoruz. Veriden aksiyona."
                  : "We don't just show data — we provide swarm prediction, disease detection and maintenance recommendations. From data to action.",
                icon: "🧠",
                highlight: false,
              },
              {
                title: isTr ? "Kovan Başı ₺40-50/ay" : "₺40-50/Hive/Month",
                desc: isTr
                  ? "Yurtdışı rakipler kovan başı $15-30/ay alıyor. Biz aynı kalitede hizmeti kademeli fiyatla (₺40-50/ay) sunuyoruz — %80 daha uygun."
                  : "International competitors charge $15-30/hive/month. We offer the same quality service with tiered pricing (₺40-50/mo) — 80% more affordable.",
                icon: "💰",
                highlight: true,
              },
              {
                title: isTr ? "Çevrimdışı Çalışma" : "Offline Operation",
                desc: isTr
                  ? "İnternet kesilse bile sensörler 72 saat veri depolar. Bağlantı geldiğinde otomatik senkronize olur. Dağ arılıklarında bile çalışır."
                  : "Even if internet is lost, sensors store 72 hours of data. Auto-syncs when connection returns. Works even in mountain apiaries.",
                icon: "📡",
                highlight: false,
              },
            ].map((d, i) => (
              <div
                key={i}
                className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                  d.highlight
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-gray-900/60 border-gray-800 hover:border-gray-700"
                }`}
              >
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {d.icon}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-gray-100 mb-1">
                    {d.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMPARISON TABLE ═══════════ */}
      <section
        data-animate
        id="compare"
        className={`py-24 px-6 transition-all duration-700 ${anim("compare")}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Karşılaştırma" : "Comparison"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr ? "Neden BeeMora?" : "Why BeeMora?"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-500 font-medium">
                    {isTr ? "Özellik" : "Feature"}
                  </th>
                  <th className="py-4 px-4 text-center bg-amber-500/5 rounded-t-lg">
                    <span className="text-amber-400 font-bold">🐝 BeeMora</span>
                  </th>
                  <th className="py-4 px-4 text-center text-gray-500">
                    {isTr ? "Geleneksel" : "Traditional"}
                  </th>
                  <th className="py-4 px-4 text-center text-gray-500">
                    {isTr ? "Yurtdışı Rakip" : "Foreign Competitor"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: isTr
                      ? "7/24 Gerçek Zamanlı İzleme"
                      : "24/7 Real-Time Monitoring",
                    bm: true,
                    trad: false,
                    comp: true,
                  },
                  {
                    feature: isTr ? "Veri Gecikmesi" : "Data Latency",
                    bm: "10sn",
                    trad: isTr ? "1-7 gün" : "1-7 days",
                    comp: "15-60dk",
                  },
                  {
                    feature: isTr ? "AI Oğul Tahmini" : "AI Swarm Prediction",
                    bm: true,
                    trad: false,
                    comp: "~",
                  },
                  {
                    feature: isTr
                      ? "Varroa Ses Analizi"
                      : "Varroa Sound Analysis",
                    bm: true,
                    trad: false,
                    comp: "~",
                  },
                  {
                    feature: isTr
                      ? "6-in-1 Sensör Modülü"
                      : "6-in-1 Sensor Module",
                    bm: true,
                    trad: false,
                    comp: false,
                  },
                  {
                    feature: isTr
                      ? "GPS Hırsızlık Takibi"
                      : "GPS Theft Tracking",
                    bm: true,
                    trad: false,
                    comp: "~",
                  },
                  {
                    feature: isTr
                      ? "Çevrimdışı Veri Depolama"
                      : "Offline Data Storage",
                    bm: "72 saat",
                    trad: "-",
                    comp: isTr ? "Yok" : "No",
                  },
                  {
                    feature: isTr
                      ? "Türkçe Destek & Arayüz"
                      : "Turkish Support & UI",
                    bm: true,
                    trad: "-",
                    comp: false,
                  },
                  {
                    feature: isTr
                      ? "Aylık Maliyet (10 kovan)"
                      : "Monthly Cost (10 hives)",
                    bm: "₺500",
                    trad: "₺0",
                    comp: "$150-300",
                  },
                  {
                    feature: isTr ? "Kurulum Ücreti" : "Setup Fee",
                    bm: isTr ? "Ücretsiz" : "Free",
                    trad: "₺0",
                    comp: "$200-500",
                  },
                  {
                    feature: isTr ? "Kurulum Süresi" : "Setup Time",
                    bm: "5dk",
                    trad: "-",
                    comp: "30dk+",
                  },
                  {
                    feature: isTr
                      ? "Yerel Üretim & Garanti"
                      : "Local Production & Warranty",
                    bm: true,
                    trad: "-",
                    comp: false,
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300 font-medium">
                      {row.feature}
                    </td>
                    {[row.bm, row.trad, row.comp].map((val, j) => (
                      <td key={j} className="py-3 px-4 text-center">
                        {val === true ? (
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${j === 0 ? "bg-emerald-500/15" : "bg-gray-800"}`}
                          >
                            <CheckCircle
                              className={`w-4 h-4 ${j === 0 ? "text-emerald-400" : "text-gray-600"}`}
                              aria-hidden="true"
                            />
                          </span>
                        ) : val === false ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-800">
                            <X
                              className="w-4 h-4 text-gray-600"
                              aria-hidden="true"
                            />
                          </span>
                        ) : val === "~" ? (
                          <span className="text-xs text-gray-600">
                            {isTr ? "Kısıtlı" : "Limited"}
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-semibold ${j === 0 ? "text-amber-400" : "text-gray-500"}`}
                          >
                            {val}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════ ROI CALCULATOR ═══════════ */}
      <section
        data-animate
        id="roi"
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("roi")}`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Yatırım Getirisi" : "Return on Investment"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr
                ? "Ne Kadar Tasarruf Edersiniz?"
                : "How Much Will You Save?"}
            </h2>
            <p className="text-gray-400">
              {isTr
                ? "Kovan sayınızı girin, kademeli abonelik fiyatı otomatik uygulanır. (1-50: ₺50, 51-100: ₺45, 100+: ₺40/kovan/ay)"
                : "Enter your hive count, tiered pricing applies automatically. (1-50: ₺50, 51-100: ₺45, 100+: ₺40/hive/mo)"}
            </p>
          </div>
          <RoiCalculator isTr={isTr} />
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section
        data-animate
        id="stories"
        className={`py-24 px-6 transition-all duration-700 ${anim("stories")}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Arıcı Hikayeleri" : "Beekeeper Stories"}
            </p>
            <h2 className="text-4xl font-bold mb-3">
              {isTr ? "Kullanıcılarımız Ne Diyor?" : "What Our Users Say?"}
            </h2>
            <p className="text-gray-500 text-sm">
              {isTr
                ? "Beta test kullanıcılarımızdan ilk geri bildirimler"
                : "First feedback from our beta test users"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Mehmet K.",
                role: isTr
                  ? "Profesyonel Arıcı — Konya, 80 Kovan"
                  : "Professional Beekeeper — Konya, 80 Hives",
                avatar: "🧑‍🌾",
                stars: 5,
                quote: isTr
                  ? '"Kışın gece yarısı kovan sıcaklığı 28°C\'ye düştü, telefonum çaldı. Sabah gitseydim o koloniyi kaybetmiştik. BeeMora gerçekten hayat kurtardı."'
                  : '"In winter the hive temperature dropped to 28°C at midnight and my phone rang. If I had gone in the morning we would have lost that colony. BeeMora Literally saved the hive."',
                highlight: true,
              },
              {
                name: "Fatma Ş.",
                role: isTr
                  ? "Hobi Arıcı — Ankara, 15 Kovan"
                  : "Hobby Beekeeper — Ankara, 15 Hives",
                avatar: "👩‍🌾",
                stars: 5,
                quote: isTr
                  ? '"Ağırlık sensörü sayesinde tam hasat zamanını yakaladım. Geçen yıldan %30 daha fazla bal çıkardım. Kurulum da gerçekten 5 dakika sürdü."'
                  : '"Thanks to the weight sensor I caught the exact harvest time. I got 30% more honey than last year. And the setup really did take 5 minutes."',
                highlight: false,
              },
              {
                name: "İbrahim T.",
                role: isTr
                  ? "Ticari Arıcı — Muğla, 200 Kovan"
                  : "Commercial Beekeeper — Muğla, 200 Hives",
                avatar: "👨‍🔬",
                stars: 5,
                quote: isTr
                  ? '"200 kovan için yılda onlarca kez arılığa giderdim. Şimdi gerçekten kritik durumlarda gidiyorum. Yakıt ve emek maliyetim yarıya indi."'
                  : '"For 200 hives I used to visit the apiary dozens of times a year. Now I only go for truly critical situations. My fuel and labor costs have halved."',
                highlight: false,
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`relative bg-gray-900/70 rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  t.highlight
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/10"
                    : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {t.highlight && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {isTr ? "Öne Çıkan" : "Featured"}
                  </div>
                )}
                <div
                  className="flex gap-0.5 mb-4"
                  aria-label={`${t.stars} out of 5 stars`}
                >
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span
                      key={j}
                      className="text-amber-400 text-sm"
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
                <blockquote className="text-sm text-gray-300 leading-relaxed mb-5 italic">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    aria-hidden="true"
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-100">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-gray-600 mt-8">
            {isTr
              ? "* Yorumlar beta test kullanıcılarından alınmıştır."
              : "* Reviews collected from beta test users."}
          </p>
        </div>
      </section>

      {/* ═══════════ ACHIEVEMENTS & PRESS ═══════════ */}
      <section
        data-animate
        id="news"
        className={`py-20 px-6 bg-gray-900/20 transition-all duration-700 ${anim("news")}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Başarılar & Duyurular" : "Achievements & Announcements"}
            </p>
            <h2 className="text-3xl font-bold mb-3">
              {isTr ? "Kilometre Taşlarımız" : "Our Milestones"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 max-w-3xl mx-auto">
            {[
              {
                icon: "🚀",
                tag: "Beta",
                tagColor:
                  "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                title: isTr ? "Beta Lansmanı" : "Beta Launch",
                date: "2026",
                desc: isTr
                  ? "Platform beta olarak yayınlandı. İlk arıcı kullanıcılar sistemi aktif olarak test ediyor."
                  : "Platform launched in beta. First beekeeper users are actively testing the system.",
              },
              {
                icon: "🤖",
                tag: "AI",
                tagColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                title: isTr
                  ? "AI Analiz Motoru"
                  : "AI Analysis Engine",
                date: "2025 Q3",
                desc: isTr
                  ? "6 farklı parametreyi analiz eden yapay zeka motorumuz tamamlandı ve üretime alındı."
                  : "Our AI engine analyzing 6 different parameters was completed and deployed to production.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-2.5 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {item.date}
                  </span>
                </div>
                <div className="text-3xl mb-3" aria-hidden="true">
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold text-gray-100 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900/60 border border-dashed border-gray-700 rounded-full text-sm text-gray-500">
              <Clock className="w-4 h-4 text-amber-500/50" aria-hidden="true" />
              {isTr
                ? "Medya haberleri ve basın bültenleri yakında eklenecek"
                : "Media coverage and press releases coming soon"}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FREE CONSULTATION CTA ═══════════ */}
      <section
        data-animate
        id="consult"
        className={`py-20 px-6 transition-all duration-700 ${anim("consult")}`}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-10 md:p-14">
            <span className="text-5xl block mb-4" aria-hidden="true">
              🐝
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isTr ? "Ücretsiz Danışmanlık Alın" : "Get a Free Consultation"}
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
              {isTr
                ? "Arılığınıza en uygun sensör çözümünü birlikte belirleyelim. Uzman ekibimiz size özel bir plan oluşturur — tamamen ücretsiz."
                : "Let's determine the best sensor solution for your apiary together. Our expert team creates a custom plan for you — completely free."}
            </p>
            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg rounded-xl transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 overflow-hidden mx-auto"
            >
              {isTr ? "Ücretsiz Danışmanlık" : "Free Consultation"}
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT ═══════════ */}
      <section
        data-animate
        id="contact"
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("contact")}`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "İletişim" : "Contact"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr ? "Bize Ulaşın" : "Get in Touch"}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {isTr
                ? "Demo talep edin, fiyat alın veya sorularınızı iletin. En kısa sürede dönüş yapıyoruz."
                : "Request a demo, get pricing or ask your questions. We'll get back to you as soon as possible."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-5">
              <a
                href="mailto:beemoraproject@gmail.com"
                className="flex items-center gap-4 p-5 bg-gray-900/70 border border-gray-800 rounded-2xl hover:border-amber-500/30 transition-all group"
              >
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-amber-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 mb-0.5">
                    {isTr ? "E-posta" : "Email"}
                  </p>
                  <p className="text-amber-400 font-medium">
                    beemoraproject@gmail.com
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {isTr
                      ? "Demo talebi, fiyat bilgisi, teknik sorular"
                      : "Demo request, pricing info, technical questions"}
                  </p>
                </div>
              </a>

              <button
                onClick={() => {
                  const chatBtn = document.querySelector('[aria-label="Maya"]');
                  chatBtn?.click();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-4 p-5 bg-gray-900/70 border border-amber-500/20 rounded-2xl hover:border-amber-500/50 transition-all group text-left w-full"
              >
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle
                    className="w-6 h-6 text-amber-400"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 mb-0.5">
                    Maya
                  </p>
                  <p className="text-amber-400 font-medium text-sm">
                    {isTr ? "Anında yanıt alın" : "Get instant answers"}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {isTr
                      ? "Arıcılık, kovan bakımı, hastalıklar hakkında sorun"
                      : "Ask about beekeeping, hive care, diseases"}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-4 p-5 bg-gray-900/70 border border-gray-800 rounded-2xl">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin
                    className="w-6 h-6 text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-200 mb-0.5">
                    {isTr ? "Konum" : "Location"}
                  </p>
                  <p className="text-blue-400 font-medium">
                    Konya, {isTr ? "Türkiye" : "Turkey"}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {isTr ? "Ar-Ge merkezi" : "R&D center"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-100 mb-1">
                {isTr ? "Demo Talep Formu" : "Demo Request Form"}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                {isTr
                  ? "Bilgileri doldurun, mail uygulamanız açılacaktır."
                  : "Fill in the details, your mail app will open."}
              </p>
              {/* Using a plain form — this is a file component, not an artifact */}
              <form
                onSubmit={handleContactSubmit}
                className="space-y-4"
                noValidate
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs text-gray-400 mb-1.5"
                    >
                      {isTr ? "Adınız" : "Your Name"} *
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      required
                      className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none transition-colors"
                      placeholder={isTr ? "Adınız Soyadınız" : "Full Name"}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-city"
                      className="block text-xs text-gray-400 mb-1.5"
                    >
                      {isTr ? "Şehir" : "City"}
                    </label>
                    <input
                      id="contact-city"
                      name="city"
                      className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none transition-colors"
                      placeholder={isTr ? "Şehir" : "City"}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-hives"
                      className="block text-xs text-gray-400 mb-1.5"
                    >
                      {isTr ? "Kovan Sayısı" : "Hive Count"}
                    </label>
                    <input
                      id="contact-hives"
                      name="hives"
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none transition-colors"
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs text-gray-400 mb-1.5"
                    >
                      {isTr ? "Telefon" : "Phone"}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none transition-colors"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs text-gray-400 mb-1.5"
                  >
                    {isTr ? "Mesajınız" : "Your Message"}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
                    placeholder={
                      isTr
                        ? "Sorularınız veya notlarınız..."
                        : "Your questions or notes..."
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  {isTr ? "Mail Gönder" : "Send Email"}
                </button>
                <p className="text-[10px] text-gray-600 text-center">
                  {isTr
                    ? "Butona basınca mail uygulamanız açılacaktır"
                    : "Clicking the button will open your email app"}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section
        id="faq"
        data-animate
        className={`py-24 px-6 bg-gray-900/20 transition-all duration-700 ${anim("faq")}`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Sıkça Sorulan Sorular" : "FAQ"}
            </p>
            <h2 className="text-4xl font-bold mb-4">
              {isTr ? "Merak Edilenler" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-3" role="list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
                role="listitem"
              >
                <button
                  type="button"
                  onClick={() => handleFaqToggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-gray-100 pr-4">
                    {faq.q}
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ ABOUT US ═══════════ */}
      <section
        id="about"
        data-animate
        className={`py-24 px-6 transition-all duration-700 ${anim("about")}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              {isTr ? "Hakkımızda" : "About Us"}
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {isTr ? "Hikayemiz" : "Our Story"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {isTr
                ? "2025'ten bu yana Türk arıcılık sektörünü dijitalleştirmek için çalışıyoruz."
                : "We've been working to digitalize the Turkish beekeeping sector since 2025."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 h-[400px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center">
                    <Award
                      className="w-6 h-6 text-amber-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <span className="text-amber-400 font-bold text-lg">
                      BeeMora
                    </span>
                    <p className="text-[10px] text-gray-500">
                      {isTr
                        ? "Akıllı Arıcılık Platformu"
                        : "Smart Beekeeping Platform"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  {isTr
                    ? "Ar-Ge projesi olarak başlayan yolculuğumuz, endüstriyel bir platforma dönüştü."
                    : "Our journey that started as an R&D project has evolved into an industrial platform."}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
                  {isTr ? "Teknoloji Yığını" : "Tech Stack"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React 18",
                    "Node.js",
                    "Express",
                    "IoT",
                    "Vite",
                    "TailwindCSS",
                    "Web Push",
                    "JWT",
                  ].map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-800/80 border border-gray-700/50 text-[10px] text-gray-400 rounded-lg font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                {[
                  {
                    label: isTr ? "Yazılım" : "Software",
                    icon: Database,
                    color: "text-blue-400",
                  },
                  { label: "AI/ML", icon: Zap, color: "text-purple-400" },
                  {
                    label: "IoT",
                    icon: Wifi,
                    color: "text-amber-400",
                  },
                ].map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700/40 rounded-lg flex-1"
                    >
                      <Icon
                        className={`w-4 h-4 ${d.color}`}
                        aria-hidden="true"
                      />
                      <span className="text-[10px] text-gray-400">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
                <BookOpen
                  className="w-6 h-6 text-amber-400"
                  aria-hidden="true"
                />
                {isTr ? "Vizyonumuz" : "Our Vision"}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                {isTr
                  ? "BeeMora, Türkiye'nin arıcılık sektöründeki koloni kayıplarını azaltmak amacıyla 2025'te kurulan bir teknoloji girişimidir. Yoğun Ar-Ge sürecimizde geliştirdiğimiz özel IoT sensörler ve yapay zeka algoritmaları ile arıcılara çözüm sunmayı hedefliyoruz."
                  : "BeeMora is a technology venture founded in 2025 to reduce colony losses in Turkey's beekeeping sector. With our proprietary IoT sensors and AI algorithms developed through intensive R&D, we aim to provide solutions for beekeepers."}
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                {isTr
                  ? "Konya merkezli ekibimiz, yazılım geliştirme, veri bilimi, IoT ve arıcılık uzmanlığını bir araya getirerek sektörde fark yaratıyor."
                  : "Our Konya-based team combines software development, data science, IoT and beekeeping expertise to make a difference in the sector."}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Users,
                    val: "0",
                    label: isTr ? "Aktif Kullanıcı" : "Active Users",
                  },
                  {
                    icon: Shield,
                    val: isTr ? "%85 hedef" : "85% target",
                    label: isTr
                      ? "Kayıp Azaltma Hedefi"
                      : "Loss Reduction Goal",
                  },
                  {
                    icon: Award,
                    val: "6",
                    label: isTr ? "AI Modülü" : "AI Modules",
                  },
                  {
                    icon: MapPin,
                    val: "7/24",
                    label: isTr ? "Canlı İzleme" : "Live Monitoring",
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon
                          className="w-5 h-5 text-amber-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-amber-400">
                          {stat.val}
                        </p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="mb-16">
            <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-10">
              {isTr ? "Yolculuğumuz" : "Our Journey"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  year: "2025 Q1",
                  title: isTr ? "Kuruluş & Ar-Ge" : "Founded & R&D",
                  desc: isTr
                    ? "Fikir doğdu, ilk Ar-Ge çalışmaları başlatıldı. Platform mimarisi tasarlandı."
                    : "The idea was born, initial R&D started. Platform architecture designed.",
                },
                {
                  year: "2025 Q2",
                  title: isTr ? "AI Geliştirme" : "AI Development",
                  desc: isTr
                    ? "Yapay zeka modülleri geliştirildi. Oğul tahmini ve hastalık tespit algoritmaları oluşturuldu."
                    : "AI modules developed. Swarm prediction and disease detection algorithms created.",
                },
                {
                  year: "2025 Q3",
                  title: isTr ? "Platform Geliştirme" : "Platform Development",
                  desc: isTr
                    ? "Web paneli ve AI modülü geliştirildi. Dashboard ve raporlama sistemi tamamlandı."
                    : "Web panel and AI module developed. Dashboard and reporting system completed.",
                },
                {
                  year: "2026",
                  title: isTr ? "Lansman" : "Launch",
                  desc: isTr
                    ? "Platform beta olarak yayınlandı. İlk müşteriler bekleniyor."
                    : "Platform launched as beta. Awaiting first customers.",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-colors"
                >
                  <span className="text-2xl font-extrabold text-amber-500/40">
                    {m.year}
                  </span>
                  <h4 className="text-lg font-bold text-gray-100 mt-2 mb-2">
                    {m.title}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Co-Founders */}
          <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            {isTr ? "Kurucu Ortaklar" : "Co-Founders"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                name: "Ali Uğur",
                role: isTr ? "Kurucu Ortak & CTO" : "Co-Founder & CTO",
                avatar: "👨‍💻",
                avatarBg:
                  "from-amber-500/20 to-orange-500/20 border-amber-500/30",
                roleColor: "text-amber-400",
                bio: isTr
                  ? "Yazılım mimarisi, IoT sistem tasarımı ve yapay zeka geliştirme alanlarında uzmanlaşmış. BeeMora'nın tüm teknik altyapısını ve AI motorunu tasarlayıp geliştirdi."
                  : "Specialized in software architecture, IoT systems and AI development. Designed and developed BeeMora's entire technical infrastructure and AI engine.",
                quote: isTr
                  ? '"Teknolojiyi arıcıların hizmetine sunarak koloni kayıplarını azaltmak, benim için sadece bir proje değil — bir misyon."'
                  : '"Putting technology at the service of beekeepers to reduce colony losses is not just a project for me — it\'s a mission."',
              },
              {
                name: "Mustafa Rüştü Ferliarslan",
                role: isTr ? "Kurucu Ortak & COO" : "Co-Founder & COO",
                avatar: "🔬",
                avatarBg: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
                roleColor: "text-blue-400",
                bio: isTr
                  ? "Saha operasyonları, iş geliştirme ve müşteri ilişkileri alanlarında deneyimli. Arıcılarla birebir çalışarak platformun geliştirilmesini ve saha testlerini yönetiyor."
                  : "Experienced in field operations, business development and customer relations. Works closely with beekeepers to manage platform development and field testing.",
                quote: isTr
                  ? '"Sahada arıcılarla çalışmak bize gerçek ihtiyaçları gösterdi. BeeMora, laboratuvardan değil — kovanın yanından doğdu."'
                  : '"Working with beekeepers in the field showed us the real needs. BeeMora was born not from a lab — but from beside the hive."',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-5 mb-5">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${f.avatarBg} border-2 rounded-full flex items-center justify-center text-3xl flex-shrink-0`}
                    aria-hidden="true"
                  >
                    {f.avatar}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-100">
                      {f.name}
                    </h4>
                    <p className={`${f.roleColor} text-sm font-medium`}>
                      {f.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {f.bio}
                </p>
                <blockquote className="text-gray-500 text-xs italic leading-relaxed">
                  {f.quote}
                </blockquote>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={handleNavigatePanel}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-lg rounded-xl transition-all shadow-xl shadow-amber-500/25 hover:scale-105"
              >
                {isTr ? "Hemen Başla" : "Get Started Now"}
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full">
                {isTr ? "2025'ten beri" : "Since 2025"}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full">
                IoT + AI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-gray-800 bg-gray-950 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500/30 to-orange-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/10">
                  <span className="text-lg leading-none" aria-hidden="true">
                    🐝
                  </span>
                </div>
                <div>
                  <span className="text-lg font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    Bee<span className="text-white">Mora</span>
                  </span>
                  <p className="text-[10px] text-gray-600 leading-none">
                    {isTr
                      ? "Akıllı Arıcılık Platformu"
                      : "Smart Beekeeping Platform"}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-4">
                {isTr
                  ? "Türkiye'nin lider akıllı arıcılık platformu. IoT sensörler ve yapay zeka ile kovanlarınızı 7/24 izleyin, koloni kayıplarını önleyin."
                  : "Turkey's leading smart beekeeping platform. Monitor your hives 24/7 with IoT sensors and AI, prevent colony losses."}
              </p>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full">
                  IoT + AI
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase mb-4">
                {isTr ? "Platform" : "Platform"}
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {navLinks.map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(l.id)}
                      className="hover:text-amber-400 transition-colors"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={handleNavigatePanel}
                    className="hover:text-amber-400 transition-colors font-medium text-amber-500/80"
                  >
                    {isTr ? "Kontrol Paneli" : "Control Panel"} →
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase mb-4">
                {isTr ? "İletişim" : "Contact"}
              </h4>
              <div className="space-y-3 text-sm text-gray-500">
                <a
                  href="mailto:beemoraproject@gmail.com"
                  className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  <span>beemoraproject@gmail.com</span>
                </a>
                <a
                  href="https://wa.me/905523478015"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  <span>0552 347 80 15</span>
                </a>
                <div className="flex items-center gap-2">
                  <MapPin
                    className="w-4 h-4 text-gray-600"
                    aria-hidden="true"
                  />
                  <span>Konya, {isTr ? "Türkiye" : "Turkey"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              &copy; 2026 BeeMora.{" "}
              {isTr ? "Tüm hakları saklıdır." : "All rights reserved."}
            </p>
            <p className="text-xs text-gray-600">
              {isTr ? "Beta • 2025'ten beri" : "Beta • Since 2025"}
            </p>
          </div>
        </div>
      </footer>

      <FloatingAIChat />
    </div>
  );
};

export default LandingPage;
