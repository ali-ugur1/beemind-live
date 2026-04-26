import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Keyboard,
  Monitor,
  Bell,
  BarChart3,
  Map,
  GitCompareArrows,
  Shield,
  Zap,
  BookOpen,
  Search,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const HelpView = () => {
  const { lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (id) => setOpenFaq((prev) => (prev === id ? null : id));

  const faqs =
    lang === "tr"
      ? [
          {
            id: 1,
            q: "Hexora nedir?",
            a: "Hexora, AI destekli bir IoT arıcılık yönetim sistemidir. ESP32 tabanlı sensörler aracılığıyla kovanlarınızı uzaktan izleyebilir; sıcaklık, nem, ses, titreşim ve ağırlık verilerini takip edebilirsiniz.",
          },
          {
            id: 2,
            q: "Kovan verilerini nasıl görebilirim?",
            a: "Dashboard sayfasından tüm kovanlarınızın anlık durumunu görebilirsiniz. Kovan Listesi sayfasında ise detaylı filtreleme, sıralama ve tek tek kovan detaylarına erişebilirsiniz.",
          },
          {
            id: 3,
            q: "Kritik alarm geldiğinde ne yapmalıyım?",
            a: "Kritik alarm geldiğinde ilgili kovanın detay sayfasına gidip AI önerilerini inceleyin. Oğul tespiti, devrilme alarmı veya aşırı sıcaklık gibi durumlarda fiziksel müdahale gerekebilir.",
          },
          {
            id: 4,
            q: "Rapor nasıl indirebilirim?",
            a: "Raporlar sayfasından CSV, Excel, JSON ve PDF formatlarında rapor indirebilirsiniz. Tarih aralığını seçip ilgili butonlara tıklayarak rapor oluşturabilirsiniz.",
          },
          {
            id: 5,
            q: "Harita görünümünde ne yapabilirim?",
            a: "Harita görünümünde kovanlarınızın coğrafi konumlarını görebilir, durumlarına göre filtreleyebilir ve işaretçilere tıklayarak detaylara erişebilirsiniz.",
          },
          {
            id: 6,
            q: "Bildirimler nasıl çalışır?",
            a: "Hexora kritik durumlarda otomatik bildirim gönderir. Ayarlar sayfasından e-posta, SMS ve push bildirim tercihlerinizi yapılandırabilirsiniz.",
          },
          {
            id: 7,
            q: "ESP32 cihazı nasıl bağlanır?",
            a: "Yeni kovan ekle seçeneğinden ESP32 cihazınızın MAC adresini girerek bağlantıyı kurabilirsiniz. Cihaz ağıyla bağlantı kurulduğunda sensör verileri otomatik akmaya başlar.",
          },
          {
            id: 8,
            q: "Kovan karşılaştırma nasıl yapılır?",
            a: "Karşılaştır sayfasında 2-3 kovan seçerek sıcaklık, nem, pil, ses ve ağırlık metriklerini yan yana kıyaslayabilirsiniz.",
          },
        ]
      : [
          {
            id: 1,
            q: "What is Hexora?",
            a: "Hexora is an AI-powered IoT beekeeping management system. You can remotely monitor your hives through ESP32-based sensors, tracking temperature, humidity, sound, vibration and weight data.",
          },
          {
            id: 2,
            q: "How can I see hive data?",
            a: "You can see the real-time status of all your hives from the Dashboard page. On the Hive List page, you can access detailed filtering, sorting and individual hive details.",
          },
          {
            id: 3,
            q: "What should I do when a critical alarm comes?",
            a: "When a critical alarm comes, go to the detail page of the relevant hive and review AI suggestions. Physical intervention may be required for swarm detection, tipping alarm or excessive temperature.",
          },
          {
            id: 4,
            q: "How can I download a report?",
            a: "You can download reports in CSV, Excel, JSON and PDF formats from the Reports page. Select the date range and click the relevant buttons to generate reports.",
          },
          {
            id: 5,
            q: "What can I do in map view?",
            a: "In the map view, you can see geographic locations of your hives, filter by status, and click markers to access details.",
          },
          {
            id: 6,
            q: "How do notifications work?",
            a: "Hexora automatically sends notifications in critical situations. You can configure your email, SMS and push notification preferences from the Settings page.",
          },
          {
            id: 7,
            q: "How to connect an ESP32 device?",
            a: "You can establish the connection by entering the MAC address of your ESP32 device from the Add New Hive option. Sensor data starts flowing automatically when connection is established.",
          },
          {
            id: 8,
            q: "How to compare hives?",
            a: "On the Compare page, you can select 2-3 hives to compare temperature, humidity, battery, sound and weight metrics side by side.",
          },
        ];

  const shortcuts = [
    { key: "D", action: "Dashboard" },
    { key: "L", action: lang === "tr" ? "Kovan Listesi" : "Hive List" },
    { key: "H", action: lang === "tr" ? "Harita" : "Map" },
    { key: "R", action: lang === "tr" ? "Raporlar" : "Reports" },
    { key: "K", action: lang === "tr" ? "Karşılaştır" : "Compare" },
    { key: "N", action: lang === "tr" ? "Bildirimler" : "Notifications" },
    { key: "S", action: lang === "tr" ? "Ayarlar" : "Settings" },
    { key: "?", action: lang === "tr" ? "Yardım" : "Help" },
  ];

  const guides = [
    {
      icon: Monitor,
      title: "Dashboard",
      desc:
        lang === "tr"
          ? "Genel bakış, gateway durumu, hava durumu ve hızlı eylemler"
          : "Overview, gateway status, weather and quick actions",
    },
    {
      icon: BarChart3,
      title: lang === "tr" ? "Raporlar" : "Reports",
      desc:
        lang === "tr"
          ? "Grafik, analiz ve farklı formatlarda rapor indirme"
          : "Charts, analytics and report download in various formats",
    },
    {
      icon: Map,
      title: lang === "tr" ? "Harita" : "Map",
      desc:
        lang === "tr"
          ? "Kovan konumları ve durum filtreleme"
          : "Hive locations and status filtering",
    },
    {
      icon: GitCompareArrows,
      title: lang === "tr" ? "Karşılaştırma" : "Comparison",
      desc:
        lang === "tr"
          ? "Kovan metriklerini yan yana kıyaslama"
          : "Compare hive metrics side by side",
    },
    {
      icon: Bell,
      title: lang === "tr" ? "Bildirimler" : "Notifications",
      desc:
        lang === "tr"
          ? "Alarm, uyarı ve bilgi bildirimleri"
          : "Alarm, warning and info notifications",
    },
    {
      icon: Shield,
      title: lang === "tr" ? "Güvenlik" : "Security",
      desc:
        lang === "tr"
          ? "İki faktörlü doğrulama ve hesap güvenliği"
          : "Two-factor auth and account security",
    },
  ];

  const query = searchQuery.trim().toLowerCase();
  const filteredFaqs = query
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(query) ||
          f.a.toLowerCase().includes(query),
      )
    : faqs;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-gray-100">
            {lang === "tr" ? "Yardım & SSS" : "Help & FAQ"}
          </h1>
        </div>
        <p className="text-gray-500">
          {lang === "tr"
            ? "Hexora hakkında bilmeniz gereken her şey"
            : "Everything you need to know about Hexora"}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === "tr" ? "Soru ara..." : "Search questions..."}
          aria-label={lang === "tr" ? "Soru ara" : "Search questions"}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Quick Guides */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            {lang === "tr" ? "Özellik Rehberi" : "Feature Guide"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {guides.map((g, i) => {
            const Icon = g.icon;
            return (
              <div
                key={i}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-amber-500/30 transition-colors"
              >
                <Icon className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-gray-200 mb-1">
                  {g.title}
                </p>
                <p className="text-xs text-gray-500">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Keyboard className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            {lang === "tr" ? "Klavye Kısayolları" : "Keyboard Shortcuts"}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
            >
              <kbd className="px-2.5 py-1 bg-gray-700 border border-gray-600 rounded text-amber-400 font-mono text-sm min-w-[32px] text-center">
                {s.key}
              </kbd>
              <span className="text-sm text-gray-300">{s.action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            {lang === "tr"
              ? "Sıkça Sorulan Sorular"
              : "Frequently Asked Questions"}
          </h2>
        </div>
        <div className="space-y-2">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-gray-800 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${faq.id}`}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-200">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${faq.id}`}
                    className="px-4 pb-4 text-sm text-gray-400 leading-relaxed animate-fade-in"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {lang === "tr" ? "Sonuç bulunamadı" : "No results found"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Support Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
        <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          {lang === "tr"
            ? "Daha fazla yardıma mı ihtiyacınız var?"
            : "Need more help?"}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {lang === "tr"
            ? "Teknik destek için proje ekibiyle iletişime geçebilirsiniz."
            : "Contact our project team for technical support."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="mailto:hexoraproject@gmail.com"
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-amber-500/40 hover:text-amber-400 transition-colors"
          >
            hexoraproject@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
