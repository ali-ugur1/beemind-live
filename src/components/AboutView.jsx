import {
  Thermometer,
  Droplets,
  Volume2,
  Wifi,
  Cpu,
  Monitor,
  Server,
  Smartphone,
  Shield,
  BarChart3,
  Bell,
  MapPin,
  Zap,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const AboutView = () => {
  const { lang } = useLanguage();

  const content = {
    tr: {
      title: "BeeMora Nedir?",
      desc: "BeeMora, arıcılık sektörüne yönelik geliştirilmiş akıllı kovan izleme sistemidir. IoT sensörleri ile kovan içi sıcaklık, nem, basınç, ağırlık, ses analizi ve titreşim gibi kritik verileri gerçek zamanlı olarak izler.",
      howTitle: "Nasıl Çalışır?",
      howDesc:
        "Kovanlara yerleştirilen ESP32 tabanlı sensör modülleri, verileri düzenli aralıklarla bulut sunucuya gönderir. Web paneli ve mobil uygulama üzerinden bu verileri anlık olarak takip edebilir, geçmiş verilerle karşılaştırma yapabilirsiniz.",
      whyTitle: "Neden BeeMora?",
      whyDesc:
        "Geleneksel arıcılık yöntemlerinde kovan kontrolü için fiziksel ziyaret gerekir. BeeMora ile kovanlarınızı 7/24 uzaktan izleyebilir, anormal durumları anında tespit edebilir ve zamanında müdahale edebilirsiniz.",
      featuresTitle: "Özellikler",
      techTitle: "Teknik Altyapı",
      archTitle: "Sistem Mimarisi",
      contactTitle: "İletişim",
      subtitle: "Akıllı Kovan İzleme Sistemi",
      features: {
        realtime: {
          title: "Gerçek Zamanlı İzleme",
          desc: "Kovan verilerini anlık olarak takip edin",
        },
        alerts: {
          title: "Akıllı Uyarılar",
          desc: "Kritik durumlarda anında bildirim alın",
        },
        history: {
          title: "Geçmiş Veri Analizi",
          desc: "Trend analizi ve raporlama",
        },
        map: {
          title: "Harita Görünümü",
          desc: "Kovanlarınızı haritada izleyin",
        },
        mobile: { title: "Mobil Uygulama", desc: "Her yerden erişim imkânı" },
        multi: {
          title: "Çoklu Kovan Yönetimi",
          desc: "Tüm kovanlarınızı tek panelden yönetin",
        },
      },
      tech: {
        esp32: "Mikrodenetleyici",
        dht22: "Sıcaklık & Nem",
        hx711: "Ağırlık Sensörü",
        inmp441: "Ses Sensörü",
      },
      stats: {
        components: "Bileşen",
        sensors: "Sensör Tipi",
        languages: "Dil Desteği",
        monitoring: "İzleme",
      },
    },
    en: {
      title: "What is BeeMora?",
      desc: "BeeMora is a smart hive monitoring system developed for the beekeeping industry. It monitors critical data such as hive temperature, humidity, pressure, weight, sound analysis and vibration in real-time using IoT sensors.",
      howTitle: "How Does It Work?",
      howDesc:
        "ESP32-based sensor modules placed in hives send data to the cloud server at regular intervals. You can track this data in real-time through the web panel and mobile app, and compare it with historical data.",
      whyTitle: "Why BeeMora?",
      whyDesc:
        "Traditional beekeeping methods require physical visits for hive inspection. With BeeMora, you can remotely monitor your hives 24/7, instantly detect abnormal conditions, and intervene in time.",
      featuresTitle: "Features",
      techTitle: "Technical Infrastructure",
      archTitle: "System Architecture",
      contactTitle: "Contact",
      subtitle: "Smart Hive Monitoring System",
      features: {
        realtime: {
          title: "Real-time Monitoring",
          desc: "Track hive data in real-time",
        },
        alerts: {
          title: "Smart Alerts",
          desc: "Get instant notifications for critical situations",
        },
        history: {
          title: "Historical Analysis",
          desc: "Trend analysis and reporting",
        },
        map: { title: "Map View", desc: "Track your hives on the map" },
        mobile: { title: "Mobile App", desc: "Access from anywhere" },
        multi: {
          title: "Multi-Hive Management",
          desc: "Manage all hives from one panel",
        },
      },
      tech: {
        esp32: "Microcontroller",
        dht22: "Temp & Humidity",
        hx711: "Weight Sensor",
        inmp441: "Sound Sensor",
      },
      stats: {
        components: "Components",
        sensors: "Sensor Types",
        languages: "Languages",
        monitoring: "Monitoring",
      },
    },
  };

  const t = content[lang] || content.tr;

  const features = [
    { icon: Monitor, ...t.features.realtime },
    { icon: Bell, ...t.features.alerts },
    { icon: BarChart3, ...t.features.history },
    { icon: MapPin, ...t.features.map },
    { icon: Smartphone, ...t.features.mobile },
    { icon: Shield, ...t.features.multi },
  ];

  const techStack = [
    { name: "ESP32", desc: t.tech.esp32, icon: Cpu },
    { name: "DHT22", desc: t.tech.dht22, icon: Thermometer },
    { name: "HX711", desc: t.tech.hx711, icon: Droplets },
    { name: "INMP441", desc: t.tech.inmp441, icon: Volume2 },
    { name: "Node.js", desc: "Backend API", icon: Server },
    { name: "React", desc: "Web Dashboard", icon: Monitor },
  ];

  const architecture = [
    {
      icon: Cpu,
      label: "ESP32 Sensor",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      icon: Wifi,
      label: "Gateway",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    {
      icon: Server,
      label: "API Server",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    },
    {
      icon: Monitor,
      label: "Web Dashboard",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
  ];

  const stats = [
    { value: "30+", label: t.stats.components },
    { value: "6", label: t.stats.sensors },
    { value: "2", label: t.stats.languages },
    { value: "24/7", label: t.stats.monitoring },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl mb-4">
          <img
            src="/beemora-logo.svg"
            alt="BeeMora"
            className="w-12 h-12 object-contain"
            style={{ filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">BeeMora</h1>
        <p className="text-amber-400 font-medium">{t.subtitle}</p>
      </div>

      {/* What is BeeMora */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
          <span role="img" aria-label="bee">
            🐝
          </span>{" "}
          {t.title}
        </h2>
        <p className="text-gray-400 leading-relaxed">{t.desc}</p>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> {t.howTitle}
        </h2>
        <p className="text-gray-400 leading-relaxed">{t.howDesc}</p>
      </section>

      {/* Why BeeMora */}
      <section className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" /> {t.whyTitle}
        </h2>
        <p className="text-gray-400 leading-relaxed">{t.whyDesc}</p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-bold text-gray-100 mb-4">
          {t.featuresTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-amber-500/30 transition-colors"
              >
                <Icon className="w-6 h-6 text-amber-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-200 mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-6">{t.archTitle}</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {architecture.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === architecture.length - 1;
            return (
              <div key={i} className="flex items-center gap-4">
                <div
                  className={`${item.color} border rounded-lg p-4 text-center min-w-[100px]`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-300">
                    {item.label}
                  </p>
                </div>
                {!isLast && <span className="text-2xl text-gray-600">→</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="text-xl font-bold text-gray-100 mb-4">{t.techTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {techStack.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-3"
              >
                <Icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-200">
                    {tech.name}
                  </p>
                  <p className="text-xs text-gray-500">{tech.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-gray-100 mb-4">
          {t.contactTitle}
        </h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            <span role="img" aria-label="email">
              📧
            </span>{" "}
            <a
              href="mailto:hexoraproject@gmail.com"
              className="hover:text-amber-400 transition-colors"
            >
              hexoraproject@gmail.com
            </a>
          </p>
          <p>
            <span role="img" aria-label="web">
              🌐
            </span>{" "}
            <a
              href="https://beemora.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition-colors"
            >
              beemora.io
            </a>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center"
          >
            <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AboutView;
