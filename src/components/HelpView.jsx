import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Keyboard, Monitor, Bell, BarChart3, Map, GitCompareArrows, Shield, Zap, BookOpen, Search, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const HelpView = () => {
  const { lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id) => setOpenFaq(prev => prev === id ? null : id);

  const faqs = lang === 'tr' ? [
    { id: 1, q: 'BeeMind nedir?', a: 'BeeMind, AI destekli bir IoT ariclik yonetim sistemidir. ESP32 tabanli sensorler araciligiyla kovanlarinizi uzaktan izleyebilir, sicaklik, nem, ses, titresim ve agirlik verilerini takip edebilirsiniz.' },
    { id: 2, q: 'Kovan verilerini nasil gorebilirim?', a: 'Dashboard sayfasindan tum kovanlarinizin anlk durumunu gorebilirsiniz. Kovan Listesi sayfasinda ise detayli filtreleme, siralama ve tek tek kovan detaylarina erisebilirsiniz.' },
    { id: 3, q: 'Kritik alarm geldiginde ne yapmaliyim?', a: 'Kritik alarm geldiginde ilgili kovanin detay sayfasina gidip AI onerilerini inceleyin. Ogul tespiti, devrilme alarmi veya asiri sicaklik gibi durumlarda fiziksel mudahale gerekebilir.' },
    { id: 4, q: 'Rapor nasil indirebilirim?', a: 'Raporlar sayfasindan CSV, Excel, JSON ve PDF formatlarinda rapor indirebilirsiniz. Tarih araligini secip ilgili butonlara tiklayarak rapor olusturabilirsiniz.' },
    { id: 5, q: 'Harita gorunumunde ne yapabilirim?', a: 'Harita gorunumunde kovanlarinizin cografi konumlarini gorebilir, durumlarina gore filtreleyebilir ve isretcilere tiklayarak detaylara erisebilirsiniz.' },
    { id: 6, q: 'Bildirimler nasil calisir?', a: 'BeeMind kritik durumlarda otomatik bildirim gonderir. Ayarlar sayfasindan e-posta, SMS ve push bildirim tercihlerinizi yaplandirabilirsiniz.' },
    { id: 7, q: 'ESP32 cihazi nasil baglanir?', a: 'Yeni kovan ekle seceneginden ESP32 cihazinizin MAC adresini girerek baglantiyi kurabilirsiniz. Cihaz agiyla baglanti kuruldugunda sensor verileri otomatik akmaya baslar.' },
    { id: 8, q: 'Kovan karsilastirma nasil yapilir?', a: 'Karsilastir sayfasinda 2-3 kovan secerek sicaklik, nem, pil, ses ve agirlik metriklerini yan yana kiyaslayabilirsiniz.' },
  ] : [
    { id: 1, q: 'What is BeeMind?', a: 'BeeMind is an AI-powered IoT beekeeping management system. You can remotely monitor your hives through ESP32-based sensors, tracking temperature, humidity, sound, vibration and weight data.' },
    { id: 2, q: 'How can I see hive data?', a: 'You can see the real-time status of all your hives from the Dashboard page. On the Hive List page, you can access detailed filtering, sorting and individual hive details.' },
    { id: 3, q: 'What should I do when a critical alarm comes?', a: 'When a critical alarm comes, go to the detail page of the relevant hive and review AI suggestions. Physical intervention may be required for swarm detection, tipping alarm or excessive temperature.' },
    { id: 4, q: 'How can I download a report?', a: 'You can download reports in CSV, Excel, JSON and PDF formats from the Reports page. Select the date range and click the relevant buttons to generate reports.' },
    { id: 5, q: 'What can I do in map view?', a: 'In the map view, you can see geographic locations of your hives, filter by status, and click markers to access details.' },
    { id: 6, q: 'How do notifications work?', a: 'BeeMind automatically sends notifications in critical situations. You can configure your email, SMS and push notification preferences from the Settings page.' },
    { id: 7, q: 'How to connect an ESP32 device?', a: 'You can establish the connection by entering the MAC address of your ESP32 device from the Add New Hive option. Sensor data starts flowing automatically when connection is established.' },
    { id: 8, q: 'How to compare hives?', a: 'On the Compare page, you can select 2-3 hives to compare temperature, humidity, battery, sound and weight metrics side by side.' },
  ];

  const shortcuts = [
    { key: 'D', action: lang === 'tr' ? 'Dashboard' : 'Dashboard' },
    { key: 'L', action: lang === 'tr' ? 'Kovan Listesi' : 'Hive List' },
    { key: 'H', action: lang === 'tr' ? 'Harita' : 'Map' },
    { key: 'R', action: lang === 'tr' ? 'Raporlar' : 'Reports' },
    { key: 'K', action: lang === 'tr' ? 'Karsilastir' : 'Compare' },
    { key: 'N', action: lang === 'tr' ? 'Bildirimler' : 'Notifications' },
    { key: 'S', action: lang === 'tr' ? 'Ayarlar' : 'Settings' },
    { key: '?', action: lang === 'tr' ? 'Yardim' : 'Help' },
  ];

  const guides = [
    { icon: Monitor, title: lang === 'tr' ? 'Dashboard' : 'Dashboard', desc: lang === 'tr' ? 'Genel bakis, gateway durumu, hava durumu ve hizli eylemler' : 'Overview, gateway status, weather and quick actions' },
    { icon: BarChart3, title: lang === 'tr' ? 'Raporlar' : 'Reports', desc: lang === 'tr' ? 'Grafik, analiz ve farklformatlarda rapor indirme' : 'Charts, analytics and report download in various formats' },
    { icon: Map, title: lang === 'tr' ? 'Harita' : 'Map', desc: lang === 'tr' ? 'Kovan konumlari ve durum filtreleme' : 'Hive locations and status filtering' },
    { icon: GitCompareArrows, title: lang === 'tr' ? 'Karsilastirma' : 'Comparison', desc: lang === 'tr' ? 'Kovan metriklerini yan yana kiyaslama' : 'Compare hive metrics side by side' },
    { icon: Bell, title: lang === 'tr' ? 'Bildirimler' : 'Notifications', desc: lang === 'tr' ? 'Alarm, uyari ve bilgi bildirimleri' : 'Alarm, warning and info notifications' },
    { icon: Shield, title: lang === 'tr' ? 'Guvenlik' : 'Security', desc: lang === 'tr' ? 'Iki faktorlu dogrulama ve hesap guvenligi' : 'Two-factor auth and account security' },
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-gray-100">
            {lang === 'tr' ? 'Yardim & SSS' : 'Help & FAQ'}
          </h1>
        </div>
        <p className="text-gray-500">
          {lang === 'tr' ? 'BeeMind hakkinda bilmeniz gereken her sey' : 'Everything you need to know about BeeMind'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'tr' ? 'Soru ara...' : 'Search questions...'}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Quick Guides */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-gray-100">
            {lang === 'tr' ? 'Ozellik Rehberi' : 'Feature Guide'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {guides.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-amber-500/30 transition-colors">
                <Icon className="w-5 h-5 text-amber-400 mb-2" />
                <p className="text-sm font-semibold text-gray-200 mb-1">{g.title}</p>
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
            {lang === 'tr' ? 'Klavye Kisayollari' : 'Keyboard Shortcuts'}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
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
            {lang === 'tr' ? 'Sikca Sorulan Sorular' : 'Frequently Asked Questions'}
          </h2>
        </div>
        <div className="space-y-2">
          {filteredFaqs.map(faq => (
            <div key={faq.id} className="border border-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-200">{faq.q}</span>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openFaq === faq.id && (
                <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {lang === 'tr' ? 'Sonuc bulunamadi' : 'No results found'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Support Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
        <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          {lang === 'tr' ? 'Daha fazla yardima mi ihtiyaciniz var?' : 'Need more help?'}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {lang === 'tr'
            ? 'Teknik destek icin proje ekibiyle iletisime gecebilirsiniz.'
            : 'Contact the project team for technical support.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
            support@beemind.com
          </span>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
