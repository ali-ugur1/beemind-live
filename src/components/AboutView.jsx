import { Thermometer, Droplets, Volume2, Wifi, Cpu, Monitor, Server, Smartphone, Shield, BarChart3, Bell, MapPin, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AboutView = () => {
  const { lang } = useLanguage();

  const content = {
    tr: {
      title: 'BeeMind Nedir?',
      desc: 'BeeMind, ariclik sektorune yonelik gelistirilmis akilli kovan izleme sistemidir. IoT sensorleri ile kovan ici sicaklik, nem, basinc, agirlik, ses analizi ve titresim gibi kritik verileri gercek zamanli olarak izler.',
      howTitle: 'Nasil Calisir?',
      howDesc: 'Kovanlara yerlestirilen ESP32 tabanli sensor modulleri, verileri duzenli araliklarla bulut sunucuya gonderir. Web paneli ve mobil uygulama uzerinden bu verileri anlik olarak takip edebilir, gecmis verilerle karsilastirma yapabilirsiniz.',
      whyTitle: 'Neden BeeMind?',
      whyDesc: 'Geleneksel aricilik yontemlerinde kovan kontrolu icin fiziksel ziyaret gerekir. BeeMind ile kovanlarinizi 7/24 uzaktan izleyebilir, anormal durumlari aninda tespit edebilir ve zamaninda mudahale edebilirsiniz.',
      featuresTitle: 'Ozellikler',
      techTitle: 'Teknik Altyapi',
      archTitle: 'Sistem Mimarisi',
      contactTitle: 'Iletisim',
    },
    en: {
      title: 'What is BeeMind?',
      desc: 'BeeMind is a smart hive monitoring system developed for the beekeeping industry. It monitors critical data such as hive temperature, humidity, pressure, weight, sound analysis and vibration in real-time using IoT sensors.',
      howTitle: 'How Does It Work?',
      howDesc: 'ESP32-based sensor modules placed in hives send data to the cloud server at regular intervals. You can track this data in real-time through the web panel and mobile app, and compare it with historical data.',
      whyTitle: 'Why BeeMind?',
      whyDesc: 'Traditional beekeeping methods require physical visits for hive inspection. With BeeMind, you can remotely monitor your hives 24/7, instantly detect abnormal conditions, and intervene in time.',
      featuresTitle: 'Features',
      techTitle: 'Technical Infrastructure',
      archTitle: 'System Architecture',
      contactTitle: 'Contact',
    }
  };

  const t = content[lang] || content.tr;

  const features = [
    { icon: Monitor, title: lang === 'tr' ? 'Gercek Zamanli Izleme' : 'Real-time Monitoring', desc: lang === 'tr' ? 'Kovan verilerini anlik olarak takip edin' : 'Track hive data in real-time' },
    { icon: Bell, title: lang === 'tr' ? 'Akilli Uyarilar' : 'Smart Alerts', desc: lang === 'tr' ? 'Kritik durumlarda aninda bildirim alin' : 'Get instant notifications for critical situations' },
    { icon: BarChart3, title: lang === 'tr' ? 'Gecmis Veri Analizi' : 'Historical Analysis', desc: lang === 'tr' ? 'Trend analizi ve raporlama' : 'Trend analysis and reporting' },
    { icon: MapPin, title: lang === 'tr' ? 'Harita Gorunumu' : 'Map View', desc: lang === 'tr' ? 'Kovanlarinizi haritada izleyin' : 'Track your hives on the map' },
    { icon: Smartphone, title: lang === 'tr' ? 'Mobil Uygulama' : 'Mobile App', desc: lang === 'tr' ? 'Her yerden erisim imkani' : 'Access from anywhere' },
    { icon: Shield, title: lang === 'tr' ? 'Coklu Kovan Yonetimi' : 'Multi-Hive Management', desc: lang === 'tr' ? 'Tum kovanlarinizi tek panelden yonetin' : 'Manage all hives from one panel' },
  ];

  const techStack = [
    { name: 'ESP32', desc: lang === 'tr' ? 'Mikrodenetleyici' : 'Microcontroller', icon: Cpu },
    { name: 'DHT22', desc: lang === 'tr' ? 'Sicaklik & Nem' : 'Temp & Humidity', icon: Thermometer },
    { name: 'HX711', desc: lang === 'tr' ? 'Agirlik Sensoru' : 'Weight Sensor', icon: Droplets },
    { name: 'INMP441', desc: lang === 'tr' ? 'Ses Sensoru' : 'Sound Sensor', icon: Volume2 },
    { name: 'Node.js', desc: 'Backend API', icon: Server },
    { name: 'React', desc: 'Web Dashboard', icon: Monitor },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl mb-4">
          <img
            src="/logo.png"
            alt="BeeMind"
            className="w-12 h-12 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">BeeMind</h1>
        <p className="text-amber-400 font-medium">
          {lang === 'tr' ? 'Akilli Kovan Izleme Sistemi' : 'Smart Hive Monitoring System'}
        </p>
      </div>

      {/* What is BeeMind */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
          🐝 {t.title}
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

      {/* Why BeeMind */}
      <section className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" /> {t.whyTitle}
        </h2>
        <p className="text-gray-400 leading-relaxed">{t.whyDesc}</p>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-bold text-gray-100 mb-4">{t.featuresTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-amber-500/30 transition-colors">
              <f.icon className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="text-sm font-semibold text-gray-200 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-100 mb-6">{t.archTitle}</h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: Cpu, label: 'ESP32 Sensor', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            { icon: Wifi, label: 'Gateway', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
            { icon: Server, label: 'API Server', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
            { icon: Monitor, label: 'Web Dashboard', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
          ].map((item, i, arr) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`${item.color} border rounded-lg p-4 text-center min-w-[100px]`}>
                <item.icon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-300">{item.label}</p>
              </div>
              {i < arr.length - 1 && (
                <span className="text-2xl text-gray-600">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="text-xl font-bold text-gray-100 mb-4">{t.techTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {techStack.map((tech, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-3">
              <tech.icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-200">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold text-gray-100 mb-4">{t.contactTitle}</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>📧 aliugurpamuk@gmail.com</p>
          <p>🌐 beemind.tech</p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: '30+', label: lang === 'tr' ? 'Bilesen' : 'Components' },
          { value: '6', label: lang === 'tr' ? 'Sensor Tipi' : 'Sensor Types' },
          { value: '2', label: lang === 'tr' ? 'Dil Destegi' : 'Languages' },
          { value: '24/7', label: lang === 'tr' ? 'Izleme' : 'Monitoring' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AboutView;
