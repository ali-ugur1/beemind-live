import { useEffect } from "react";

const BASE_URL = "https://beemora.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const PAGE_META = {
  tr: {
    dashboard: {
      title: "Gösterge Paneli",
      description: "Tüm kovanlarınızın anlık durum özeti, sensör verileri ve aktivite akışı.",
    },
    list: {
      title: "Kovan Listesi",
      description: "Kovanlarınızı arayın, filtreleyin ve yönetin. Sıcaklık, nem ve pil verilerine hızlı erişim.",
    },
    map: {
      title: "Harita",
      description: "Kovanlarınızın coğrafi konumlarını interaktif harita üzerinde görüntüleyin.",
    },
    compare: {
      title: "Karşılaştır",
      description: "İki veya daha fazla kovanı sensör verileri üzerinden karşılaştırın.",
    },
    calendar: {
      title: "Takvim",
      description: "Kovan bakım planlarınızı ve geçmiş aktivitelerinizi takvimde takip edin.",
    },
    reports: {
      title: "Raporlar",
      description: "Kovan verilerinizden PDF ve CSV formatında detaylı raporlar oluşturun.",
    },
    notificationHistory: {
      title: "Bildirim Geçmişi",
      description: "Geçmiş uyarı ve bildirimlerinizi inceleyin, kovan sorunlarını takip edin.",
    },
    assistant: {
      title: "Maya — AI Asistan",
      description: "Maya yapay zeka asistanına kovan yönetimi ve arıcılık hakkında sorular sorun.",
    },
    settings: {
      title: "Ayarlar",
      description: "Uygulama tercihlerinizi, bildirim ayarlarını ve hesap seçeneklerini yönetin.",
    },
    profile: {
      title: "Profil",
      description: "Hesap bilgilerinizi ve kişisel tercihlerinizi görüntüleyin ve düzenleyin.",
    },
    help: {
      title: "Yardım",
      description: "BeeMora kullanımı hakkında rehberler, ipuçları ve sıkça sorulan sorular.",
    },
    about: {
      title: "Hakkında",
      description: "BeeMora hakkında bilgi, sürüm detayları ve teknoloji altyapısı.",
    },
  },
  en: {
    dashboard: {
      title: "Dashboard",
      description: "Real-time overview of all your hives, sensor data, and activity feed.",
    },
    list: {
      title: "Hive List",
      description: "Search, filter and manage all your hives. Quick access to status, temperature, humidity and battery data.",
    },
    map: {
      title: "Map",
      description: "View the geographic locations of your hives on an interactive map.",
    },
    compare: {
      title: "Compare",
      description: "Compare two or more hives side-by-side across all sensor metrics.",
    },
    calendar: {
      title: "Calendar",
      description: "Track hive maintenance schedules and historical activities on a calendar.",
    },
    reports: {
      title: "Reports",
      description: "Generate detailed PDF and CSV reports from your hive sensor data.",
    },
    notificationHistory: {
      title: "Notification History",
      description: "Review past alerts and notifications, track hive issues over time.",
    },
    assistant: {
      title: "Maya — AI Assistant",
      description: "Ask Maya, your AI assistant, questions about hive management and beekeeping.",
    },
    settings: {
      title: "Settings",
      description: "Manage your application preferences, notification settings, and account options.",
    },
    profile: {
      title: "Profile",
      description: "View and edit your account information and personal preferences.",
    },
    help: {
      title: "Help",
      description: "Guides, tips, and frequently asked questions about using BeeMora.",
    },
    about: {
      title: "About",
      description: "Learn about BeeMora, version details, and technology stack.",
    },
  },
};

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useSEO({ title, description, url }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | BeeMora` : "BeeMora — AI Destekli IoT Kovan Yönetimi";

    document.title = fullTitle;

    if (description) {
      setMeta("description", description);
      setOG("og:description", description);
      setMeta("twitter:description", description);
    }

    setOG("og:title", fullTitle);
    setMeta("twitter:title", fullTitle);
    setOG("og:image", OG_IMAGE);
    setMeta("twitter:image", OG_IMAGE);

    if (url) {
      setOG("og:url", url);
      setCanonical(url);
    }
  }, [title, description, url]);
}
