// ─── Normalize (Turkish‑aware) ────────────────────────────────────────────────
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Greetings ────────────────────────────────────────────────────────────────
const GREETINGS = [
  {
    patterns: ["merhaba", "selam", "hey", "selamlar", "meraba", "slm", "hello", "hi", "mrhb"],
    tr: [
      "Merhaba! 🐝 Bugün kovanlar nasıl? Arıcılık, sensörler veya bakım hakkında ne sormak istersin?",
      "Selam! Maya burada. Kovan bakımı, arı sağlığı veya sensor verileri hakkında yardımcı olabilirim.",
      "Merhaba! Bugün sana nasıl yardımcı olabilirim? Arıcılıkla ilgili aklına takılan bir şey var mı?",
    ],
    en: [
      "Hello! 🐝 How are the hives today? Ask me anything about beekeeping, sensors, or hive care.",
      "Hi there! I'm Maya. Ready to help with hive management, bee health, or sensor data.",
      "Hello! How can I help you today? Got any beekeeping questions on your mind?",
    ],
  },
  {
    patterns: ["nasılsın", "naber", "ne haber", "nbr", "nabersin", "iyi misin", "napıyorsun", "ne yapıyorsun"],
    tr: [
      "İyiyim, teşekkürler! Kovanlarını takip ediyorum 🐝 Sen nasılsın? Bu sezon arılar iyi gidiyor mu?",
      "Gayet iyiyim! Arıları izlemek her zaman ilginç. Kovanlarında bir gelişme var mı?",
      "Teşekkürler, iyi! Sen nasılsın? Arıcılıkta mevsim nasıl geçiyor?",
    ],
    en: [
      "I'm doing great, thanks! Keeping an eye on your hives 🐝 How are you? How's the season going?",
      "All good! Monitoring the bees is always interesting. Anything new with your hives?",
      "Fine, thanks! How are you doing? How's the beekeeping season treating you?",
    ],
  },
  {
    patterns: ["teşekkür", "sağol", "eyvallah", "thanks", "thank you", "tşk", "saol", "tesekkur"],
    tr: [
      "Rica ederim! 🐝 Başka sorun olursa buradayım. İyi arıcılıklar!",
      "Ne demek, her zaman! Kovanların için en iyisini diliyorum.",
      "Tabii ki! Aklına başka bir şey takılırsa çekinme.",
    ],
    en: [
      "You're welcome! 🐝 I'm always here if you need more help.",
      "Happy to help! Wishing your hives all the best.",
      "Of course! Don't hesitate if anything else comes up.",
    ],
  },
  {
    patterns: ["günaydın", "gunaydin", "good morning", "sabah"],
    tr: [
      "Günaydın! ☀️🐝 Sabah erken arılar en aktif saatlerinde. Kovanları kontrol etmek için harika bir zaman!",
      "Günaydın! Umarım bugün kovanlar iyi haberler verir. Ne sormak istersin?",
    ],
    en: [
      "Good morning! ☀️🐝 Bees are most active in the early hours. Great time to check the hives!",
      "Morning! Hope the hives have good news today. What's on your mind?",
    ],
  },
  {
    patterns: ["iyi geceler", "gece", "good night"],
    tr: [
      "İyi geceler! 🌙 Arılar da bu saatlerde kovanlarında dinleniyor. Yarın görüşürüz!",
      "İyi geceler! Kovanlar gece boyunca sessiz olur genelde. Güle güle!",
    ],
    en: [
      "Good night! 🌙 Bees rest in their hives at night too. See you tomorrow!",
      "Good night! The hives will be quiet until morning. Take care!",
    ],
  },
  {
    patterns: ["görüşürüz", "hoşçakal", "hoscakal", "bye", "goodbye", "bb", "gorüsüruz"],
    tr: [
      "Görüşürüz! 🐝 Kovanlarına iyi bak, sorun olursa yaz!",
      "Hoşça kal! Arıların her zaman bol bal versin.",
    ],
    en: [
      "See you! 🐝 Take care of your hives, reach out if you need anything!",
      "Goodbye! May your bees always be productive.",
    ],
  },
  {
    patterns: ["kimsin", "sen kimsin", "nesin", "ne yaparsın", "who are you", "maya kimsin"],
    tr: [
      "Ben **Maya**, BeeMora'nın arıcılık asistanıyım! 🐝 Kovan bakımı, arı hastalıkları, bal üretimi, mevsimsel bakım ve sensör verileri hakkında bilgi verebilirim. Gerçek kovan verilerine bakarak sana kişiselleştirilmiş öneriler de sunabiliyorum.",
    ],
    en: [
      "I'm **Maya**, BeeMora's beekeeping assistant! 🐝 I can help with hive care, bee diseases, honey production, seasonal maintenance, and sensor data. I can also give personalized advice based on your real hive readings.",
    ],
  },
];

// ─── Hive-context aware responses ─────────────────────────────────────────────
function buildHiveContext(hives) {
  if (!hives || hives.length === 0) return null;

  const critical = hives.filter((h) => h.status === "critical");
  const warning = hives.filter((h) => h.status === "warning");
  const lowBattery = hives.filter((h) => typeof h.battery === "number" && h.battery < 20);
  const highTemp = hives.filter((h) => typeof h.temp === "number" && h.temp > 38);
  const lowTemp = hives.filter((h) => typeof h.temp === "number" && h.temp < 32 && h.temp > 0);
  const highHumidity = hives.filter((h) => typeof h.humidity === "number" && h.humidity > 80);

  return { critical, warning, lowBattery, highTemp, lowTemp, highHumidity, total: hives.length };
}

function hiveContextResponse(q, lang, hives) {
  const ctx = buildHiveContext(hives);
  if (!ctx) return null;
  const isTR = lang === "tr";

  // "durum", "nasil", "genel", "ozet", "bilgi ver" — q zaten normalize edilmiş
  const isStatusQuery = /durum|nasil|genel|ozet|anlat|bilgi|summary|status|overview/.test(q);
  if (isStatusQuery && ctx.total > 0) {
    const lines = [];
    if (isTR) {
      lines.push(`Şu an **${ctx.total} kovanı** izliyorum.`);
      if (ctx.critical.length > 0)
        lines.push(`🔴 **${ctx.critical.length} kovanda kritik durum**: ${ctx.critical.map((h) => h.name || h.id).join(", ")}`);
      if (ctx.warning.length > 0)
        lines.push(`🟡 **${ctx.warning.length} kovanda uyarı**: ${ctx.warning.map((h) => h.name || h.id).join(", ")}`);
      if (ctx.critical.length === 0 && ctx.warning.length === 0)
        lines.push(`✅ Tüm kovanlar stabil görünüyor.`);
      if (ctx.lowBattery.length > 0)
        lines.push(`🔋 Düşük pil: ${ctx.lowBattery.map((h) => `${h.name || h.id} (%${h.battery})`).join(", ")}`);
    } else {
      lines.push(`I'm monitoring **${ctx.total} hives** right now.`);
      if (ctx.critical.length > 0)
        lines.push(`🔴 **${ctx.critical.length} hive(s) in critical state**: ${ctx.critical.map((h) => h.name || h.id).join(", ")}`);
      if (ctx.warning.length > 0)
        lines.push(`🟡 **${ctx.warning.length} hive(s) with warnings**: ${ctx.warning.map((h) => h.name || h.id).join(", ")}`);
      if (ctx.critical.length === 0 && ctx.warning.length === 0)
        lines.push(`✅ All hives appear stable.`);
      if (ctx.lowBattery.length > 0)
        lines.push(`🔋 Low battery: ${ctx.lowBattery.map((h) => `${h.name || h.id} (${h.battery}%)`).join(", ")}`);
    }
    return lines.join("\n");
  }

  // Sıcaklık sorgusu
  const isTempQuery = /sicaklik|derece|isi|temperature|temp|sicak|soguk/.test(q);
  if (isTempQuery && (ctx.highTemp.length > 0 || ctx.lowTemp.length > 0)) {
    const lines = [];
    if (isTR) {
      if (ctx.highTemp.length > 0)
        lines.push(`🌡️ **Yüksek sıcaklık uyarısı**: ${ctx.highTemp.map((h) => `${h.name || h.id} (${h.temp}°C)`).join(", ")} — Acil havalandırma gerekebilir!`);
      if (ctx.lowTemp.length > 0)
        lines.push(`❄️ **Düşük sıcaklık**: ${ctx.lowTemp.map((h) => `${h.name || h.id} (${h.temp}°C)`).join(", ")} — Yalıtım kontrol edin.`);
      lines.push(`\nKovan içi ideal sıcaklık **34-36°C** arasıdır. 38°C üzerinde acil müdahale, 32°C altında ek yalıtım önerilir.`);
    } else {
      if (ctx.highTemp.length > 0)
        lines.push(`🌡️ **High temperature alert**: ${ctx.highTemp.map((h) => `${h.name || h.id} (${h.temp}°C)`).join(", ")} — Urgent ventilation may be needed!`);
      if (ctx.lowTemp.length > 0)
        lines.push(`❄️ **Low temperature**: ${ctx.lowTemp.map((h) => `${h.name || h.id} (${h.temp}°C)`).join(", ")} — Check insulation.`);
      lines.push(`\nIdeal hive temperature is **34-36°C**. Above 38°C requires urgent action, below 32°C needs extra insulation.`);
    }
    return lines.join("\n");
  }

  // Pil sorgusu
  const isBatteryQuery = /pil|batarya|sarj|battery|charge/.test(q);
  if (isBatteryQuery) {
    if (ctx.lowBattery.length > 0) {
      return isTR
        ? `🔋 **Düşük pil seviyesi tespit ettim**: ${ctx.lowBattery.map((h) => `${h.name || h.id} (%${h.battery})`).join(", ")}.\n\nSensör bataryaları yakında şarj edilmeli veya değiştirilmeli. Aksi takdirde veri akışı kesilir.`
        : `🔋 **Low battery detected**: ${ctx.lowBattery.map((h) => `${h.name || h.id} (${h.battery}%)`).join(", ")}.\n\nSensor batteries should be charged or replaced soon, otherwise data will stop.`;
    }
    return isTR
      ? `✅ Tüm sensörlerin pil seviyeleri normal görünüyor. Pilin %20'nin altına düşmemesine dikkat edin.`
      : `✅ All sensor batteries look fine. Keep an eye on levels and recharge before they drop below 20%.`;
  }

  // Nem sorgusu
  const isHumidityQuery = /nem|rutubet|humidity|nemli|kuru/.test(q); // normalize: nem → nem (değişmez)
  if (isHumidityQuery && ctx.highHumidity.length > 0) {
    return isTR
      ? `💧 **Yüksek nem uyarısı**: ${ctx.highHumidity.map((h) => `${h.name || h.id} (%${h.humidity})`).join(", ")}.\n\n%80 üzerindeki nem mantar hastalığı riskini artırır ve balın sulanmasına yol açar. Havalandırmayı artırın.`
      : `💧 **High humidity alert**: ${ctx.highHumidity.map((h) => `${h.name || h.id} (${h.humidity}%)`).join(", ")}.\n\nHumidity above 80% increases fungal disease risk and can thin honey. Improve ventilation.`;
  }

  // Kritik/acil durum
  const isUrgentQuery = /kritik|acil|sorun|problem|alarm|uyar|kotu|urgent|critical|alert|issue/.test(q);
  if (isUrgentQuery && (ctx.critical.length > 0 || ctx.warning.length > 0)) {
    const lines = [];
    if (isTR) {
      if (ctx.critical.length > 0)
        lines.push(`🔴 **Kritik kovanlar** (hemen müdahale gerekebilir):\n${ctx.critical.map((h) => `• ${h.name || h.id}: ${h.alertType || "kritik durum"} — Sıcaklık: ${h.temp ?? "?"}°C, Nem: ${h.humidity ?? "?"}%, Pil: ${h.battery ?? "?"}%`).join("\n")}`);
      if (ctx.warning.length > 0)
        lines.push(`🟡 **Uyarı durumundaki kovanlar**:\n${ctx.warning.map((h) => `• ${h.name || h.id}: ${h.alertType || "uyarı"}`).join("\n")}`);
    } else {
      if (ctx.critical.length > 0)
        lines.push(`🔴 **Critical hives** (may need immediate attention):\n${ctx.critical.map((h) => `• ${h.name || h.id}: ${h.alertType || "critical status"} — Temp: ${h.temp ?? "?"}°C, Humidity: ${h.humidity ?? "?"}%, Battery: ${h.battery ?? "?"}%`).join("\n")}`);
      if (ctx.warning.length > 0)
        lines.push(`🟡 **Hives with warnings**:\n${ctx.warning.map((h) => `• ${h.name || h.id}: ${h.alertType || "warning"}`).join("\n")}`);
    }
    return lines.join("\n\n");
  }

  return null;
}

// ─── Conversation context ─────────────────────────────────────────────────────
function getConversationContext(history) {
  if (!history || history.length < 2) return null;
  // Son assistant mesajından konu damgası çıkar
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant) return null;
  const text = normalize(lastAssistant.content || "");
  if (text.includes("varroa") || text.includes("akar") || text.includes("tedavi")) return "varroa";
  if (text.includes("sicaklik") || text.includes("temperature") || text.includes("isı")) return "sicaklik";
  if (text.includes("ogul") || text.includes("swarm")) return "ogul";
  if (text.includes("bal") || text.includes("hasat") || text.includes("honey")) return "bal";
  if (text.includes("kis") || text.includes("winter")) return "kis";
  return null;
}

// ─── Topic responses ──────────────────────────────────────────────────────────
const TOPIC_RESPONSES = [
  {
    patterns: ["sıcaklık", "sicaklik", "derece", "ısı", "isi", "sıcak", "sicak", "soğuk", "soguk", "temperature"],
    tr: "Kovan içi ideal sıcaklık **34-36°C** arasıdır. Bu aralık kuluçkanın sağlıklı gelişimi için kritiktir.\n\n**Uyarı eşikleri:**\n• 38°C üzeri → Acil havalandırma gerekir\n• 32°C altı → Yalıtım yetersiz, kışın koloni zarar görebilir\n• 10°C altı → Kış kümelenmesinde sorun işareti\n\nBeeMora sensörün bu değerleri anlık izler ve anormal durumda uyarı gönderir.",
    en: "The ideal hive temperature is **34-36°C**. This range is critical for healthy brood development.\n\n**Warning thresholds:**\n• Above 38°C → Urgent ventilation needed\n• Below 32°C → Insulation insufficient\n• Below 10°C → Risk to winter cluster\n\nYour BeeMora sensor monitors these values in real-time and sends alerts on anomalies.",
    category: "sensör",
  },
  {
    patterns: ["nem", "rutubet", "humidity", "nemli", "kuru"],
    tr: "Kovan içi nem oranı **50-70%** arasında olmalıdır.\n\n**Sorunlar:**\n• %80+ → Mantar hastalıkları riski artar, bal sulanır\n• %30- → Larva gelişimi bozulur, arılar strese girer\n\nNem yüksekse kovan girişini genişletin, üst havalandırma deliği açın. Düşükse yakınına küçük su kabı koyabilirsiniz.",
    en: "Hive humidity should be **50-70%**.\n\n**Problems:**\n• 80%+ → Fungal disease risk, honey thinning\n• 30%- → Larval development impaired\n\nFor high humidity: widen entrance, add upper ventilation. For low: place a small water source nearby.",
    category: "sensör",
  },
  {
    patterns: ["ağırlık", "agirlik", "weight", "tartı", "tarti", "kilo", "bal akım", "bal akimi"],
    tr: "Kovan ağırlığı **bal akımını** ve koloni gelişimini takip etmenin en güvenilir yoludur.\n\n**Yorumlama:**\n• Günlük +0.5-2 kg → İyi bal akımı var\n• Ani +3-5 kg/gün → Güçlü nektar akımı\n• Ani düşüş → Oğul verme veya yağmacılık işareti\n• Yavaş yavaş düşüş → Kışlık yiyecek tükeniyor olabilir\n\nBeeMora ağırlık sensörü bu değişimleri otomatik algılar ve trend grafikleri sunar.",
    en: "Hive weight is the most reliable way to track **nectar flow** and colony development.\n\n**Interpretation:**\n• Daily +0.5-2 kg → Good nectar flow\n• Sudden +3-5 kg/day → Strong flow\n• Sudden drop → Swarming or robbing sign\n• Gradual decline → Winter stores depleting\n\nBeeMora weight sensor automatically detects these changes.",
    category: "sensör",
  },
  {
    patterns: ["varroa", "akar", "parazit", "mite", "ilaç", "ilac", "tedavi"],
    tr: "Varroa akarı arıcılığın en büyük tehdididir. **Tedavi seçenekleri:**\n\n1. **Organik asitler** (en güvenli):\n   • Oksalik asit — kışın kuluçkasız dönemde (damla veya buharlaştırma)\n   • Formik asit — yaz aylarında, 10°C üzerinde\n\n2. **Timol bazlı** (Apiguard, ApiLife Var) — yaz/sonbahar\n\n3. **Amitraz şeritleri** — son çare, direnç riski var\n\n**Kritik kural:** Bal hasadından en az **6 hafta önce** kimyasal tedaviyi kes. Düşme tahtasında 100 arı başına 3+ varroa varsa tedaviye başla.",
    en: "Varroa mite is beekeeping's greatest threat. **Treatment options:**\n\n1. **Organic acids** (safest):\n   • Oxalic acid — winter, broodless period\n   • Formic acid — summer, above 10°C\n\n2. **Thymol-based** (Apiguard, ApiLife Var) — summer/autumn\n\n3. **Amitraz strips** — last resort, resistance risk\n\n**Critical rule:** Stop chemical treatment at least **6 weeks before** honey harvest. Start treatment if 3+ mites per 100 bees on drop board.",
    category: "hastalık",
  },
  {
    patterns: ["oğul", "ogul", "swarm", "bölünme", "bolunme", "engelle", "önle", "onle"],
    tr: "Oğul verme koloni genişlemesinin doğal yoludur ama arıcı için bal kaybı demektir.\n\n**Önleme yöntemleri:**\n1. **Genç ana arı** kullan (1-2 yaşında)\n2. Kovana yeterli alan sağla — bal katı ekle\n3. Giriş deliğini büyüt, havalandırmayı artır\n4. Ana arı gözelerini düzenli kaldır\n5. Yapay oğul yaparak baskıyı azalt\n\n**Oğul verme işaretleri:** Kovan girişinde yoğun arı birikimi, ana arı gözesi varlığı, ani ağırlık düşüşü.",
    en: "Swarming is the colony's natural way to reproduce, but it means honey loss for the beekeeper.\n\n**Prevention methods:**\n1. Use a **young queen** (1-2 years)\n2. Provide enough space — add honey supers\n3. Widen entrance, improve ventilation\n4. Regularly remove queen cells\n5. Make artificial swarms to relieve pressure\n\n**Swarm signs:** Dense bee clustering at entrance, presence of queen cells, sudden weight drop.",
    category: "koloni",
  },
  {
    patterns: ["bal", "hasat", "suz", "süz", "honey", "harvest", "sag", "sağ"],
    tr: "Bal hasadı için doğru zamanlamaya dikkat et:\n\n**Türkiye için tipik hasat dönemleri:**\n• Akasya balı: Mayıs-Haziran\n• Çiçek balı: Haziran-Temmuz\n• Çam balı: Temmuz-Ağustos\n• Sonbahar: Eylül (varsa)\n\n**Hasat kriterleri:**\n• Peteklerin en az **%80'i** kapatılmış olmalı\n• Nem ölçeri ile kontrol: **%18'in altında** olmalı\n• Arılara **15-20 kg** kışlık bal bırak!\n\nBeeMora ağırlık sensörü ile hasat öncesi ve sonrası kovan ağırlığını karşılaştırabilirsin.",
    en: "Proper timing is everything for honey harvest:\n\n**Typical harvest seasons in Turkey:**\n• Acacia honey: May-June\n• Wildflower: June-July\n• Pine honey: July-August\n• Autumn: September (if available)\n\n**Harvest criteria:**\n• At least **80% of cells** must be capped\n• Check with refractometer: moisture **below 18%**\n• Leave **15-20 kg** winter stores!\n\nUse BeeMora weight sensor to compare hive weight before and after harvest.",
    category: "üretim",
  },
  {
    patterns: ["kış", "kis", "kışlat", "kisla", "kıslama", "winter", "kışlık", "kislik"],
    tr: "Kışlatma en kritik dönemdir. **Hazırlık takvimi:**\n\n**Ağustos-Eylül:**\n• Varroa tedavisini tamamla\n• 15-20 kg bal rezervini garantile, yetersizse şeker şurubu (2:1) ile destekle\n\n**Ekim:**\n• Kovanı rüzgardan korunaklı, güney bakışlı yere al\n• Giriş deliğini daralt (fare girişini engelle)\n• Üst havalandırmayı açık bırak — nem sorununu önler\n\n**Kış boyunca:**\n• BeeMora ile kovan sıcaklığını uzaktan izle\n• Dokunma gerektiren müdahaleden kaçın (10°C+ gün bekle)",
    en: "Winter preparation is the most critical period. **Preparation timeline:**\n\n**August-September:**\n• Complete Varroa treatment\n• Ensure 15-20 kg honey reserves; supplement with sugar syrup (2:1) if needed\n\n**October:**\n• Move hive to sheltered, south-facing location\n• Reduce entrance (prevent mice)\n• Keep upper ventilation open — prevents moisture problems\n\n**During winter:**\n• Monitor hive temperature remotely via BeeMora\n• Avoid opening unless above 10°C",
    category: "mevsimsel",
  },
  {
    patterns: ["ilkbahar", "bahar", "spring", "ilkbahar", "yeni sezon", "sezon"],
    tr: "İlkbahar arıcının en yoğun dönemidir! **Yapılacaklar listesi:**\n\n**İlk ılık günler (10°C+):**\n• İlk kovan kontrolü — kışı geçirdi mi?\n• Ana arı durumunu gözlemle (gözeden yumurta var mı?)\n• Yiyecek stoğunu kontrol et — gerekirse şeker şurubu (1:1)\n\n**Şubat-Mart:**\n• Boş çerçeve ekleyerek büyümeye alan aç\n• Oğul önleme tedbirlerini başlat\n\n**Nisan-Mayıs:**\n• Bal katı eklemeye hazırlan\n• Varroa sayımı yap, gerekirse tedavi planla",
    en: "Spring is the busiest time for beekeepers! **To-do list:**\n\n**First warm days (10°C+):**\n• First hive inspection — did they survive winter?\n• Check queen status (are there eggs in cells?)\n• Check food stores — feed sugar syrup (1:1) if needed\n\n**February-March:**\n• Add empty frames to allow expansion\n• Start swarm prevention measures\n\n**April-May:**\n• Prepare to add honey supers\n• Do Varroa count, plan treatment if needed",
    category: "mevsimsel",
  },
  {
    patterns: ["besleme", "seker", "şeker", "surup", "şurup", "feeding", "besle", "fondant", "kek"],
    tr: "Arı beslemesi mevsime ve amaca göre değişir:\n\n**Şeker şurubu oranları:**\n• 1:1 (ince) → İlkbahar uyarıcı besleme, koloni büyümesi\n• 2:1 (koyu) → Sonbahar kışlık stok oluşturma\n\n**Katı besleme:**\n• Fondant veya şeker keki → Kış acil beslemesi (sıvıyı donmadan koru)\n• Polen ikamesi → İlkbaharda koloni gelişimini hızlandırır\n\n**Kritik kural:** Bal akımı sırasında **asla besleme yapma** — balın kalitesi bozulur, etiketleme sorunları çıkar!",
    en: "Bee feeding varies by season and purpose:\n\n**Sugar syrup ratios:**\n• 1:1 (thin) → Spring stimulative feeding, colony growth\n• 2:1 (thick) → Autumn winter store building\n\n**Solid feeding:**\n• Fondant or sugar cake → Winter emergency feeding (prevents freezing)\n• Pollen substitute → Accelerates spring colony development\n\n**Critical rule:** **Never feed** during nectar flow — it ruins honey quality and causes labeling issues!",
    category: "bakım",
  },
  {
    patterns: ["beemora", "sensor", "sensör", "iot", "cihaz", "kurulum", "gateway", "kurulumu"],
    tr: "BeeMora IoT sistemi kovanlarını **7/24** izler:\n\n**Sensör ölçümleri:**\n• Sıcaklık, nem, ses, ağırlık, titreşim, batarya\n\n**Kurulum adımları:**\n1. Sensörü kovanın içine (üst çıta üzerine) yerleştir\n2. Gateway'i WiFi'ye bağla\n3. BeeMora panel → Kovan Ekle → seri numarasını gir\n4. 5 dakika içinde veriler akmaya başlar\n\n**Uyarı sistemi:**\nDeğerler kritik eşiği geçince anlık push bildirimi alırsın. Uyarı eşiklerini Ayarlar > Bildirimler bölümünden özelleştirebilirsin.",
    en: "BeeMora IoT system monitors your hives **24/7**:\n\n**Sensor measurements:**\n• Temperature, humidity, sound, weight, vibration, battery\n\n**Setup steps:**\n1. Place sensor inside the hive (on top bar)\n2. Connect gateway to WiFi\n3. BeeMora panel → Add Hive → enter serial number\n4. Data starts flowing within 5 minutes\n\n**Alert system:**\nYou get instant push notifications when values cross critical thresholds. Customize alert thresholds in Settings > Notifications.",
    category: "beemora",
  },
  {
    patterns: ["ana arı", "ana ari", "kraliçe", "kral", "queen", "degistir", "değiştir"],
    tr: "Ana arı koloninin kalbidir. **Yenileme kriterleri:**\n\n• **Her 1-2 yılda** bir yenilenmesi önerilir\n• Günde 500'den az yumurta bırakıyorsa\n• Koloni gelişimi yavaşladıysa\n• Agresif veya hastalığa yatkın davranış varsa\n\n**Yenileme yöntemleri:**\n• Satın alınan ana arı kabul kafesi ile\n• Sürü hücresi ürettirme\n• Yapay oğul yöntemi\n\nYeni ana arı kabulü 3-7 gün sürer. Bu sürede kovana dokunma!",
    en: "The queen bee is the heart of the colony. **Replacement criteria:**\n\n• Recommended every **1-2 years**\n• Fewer than 500 eggs per day\n• Slow colony development\n• Aggressive behavior or disease susceptibility\n\n**Replacement methods:**\n• Purchase a new queen in an introduction cage\n• Raise from queen cells\n• Artificial swarm method\n\nNew queen acceptance takes 3-7 days. Don't disturb the hive during this time!",
    category: "koloni",
  },
  {
    patterns: ["pil", "batarya", "sarj", "şarj", "battery", "charge", "sarjı"],
    tr: "Sensör batarya yönetimi için öneriler:\n\n• Batarya **%20'nin altına** düşmeden şarj edin/değiştirin\n• Kış aylarında batarya tüketimi daha hızlı olabilir (düşük sıcaklık)\n• BeeMora panelinden pil durumunu Kovan Listesi'nde görebilirsiniz\n• Düşük pil uyarısı geldiğinde 1-2 hafta içinde işlem yapın\n\nLi-ion bataryalarda tam deşarj, ömrü kısaltır. %20-80 arasında tutmak idealdir.",
    en: "Sensor battery management tips:\n\n• Charge/replace before battery drops **below 20%**\n• Winter may drain batteries faster (cold temperatures)\n• Check battery status in the Hive List view\n• Act within 1-2 weeks when low battery alert arrives\n\nFor Li-ion batteries, full discharge shortens lifespan. Keeping between 20-80% is ideal.",
    category: "sensör",
  },
];

// ─── Fallbacks ────────────────────────────────────────────────────────────────
const FALLBACKS = {
  tr: [
    "Bu konuda net bir bilgim yok, ama arıcılık hakkında pek çok şeyi konuşabiliriz 🐝 Kovan bakımı, varroa tedavisi, bal hasadı veya sensör kurulumu hakkında sorabilirsin.",
    "Hmm, bu soruyu tam yanıtlayamadım. Ama mesela kovan sıcaklığı, mevsimsel bakım veya arı hastalıkları hakkında detaylı bilgi verebilirim.",
    "Bunu tam olarak bilmiyorum. Daha spesifik bir arıcılık sorusu sormayı dener misin? 🐝",
  ],
  en: [
    "I don't have a clear answer for that, but there's a lot we can discuss about beekeeping 🐝 Ask me about hive care, Varroa treatment, honey harvest, or sensor setup.",
    "Hmm, I couldn't fully answer that. But I can give detailed info on hive temperature, seasonal care, or bee diseases.",
    "I'm not sure about that one. Try asking a more specific beekeeping question? 🐝",
  ],
};

// ─── Main response generator ──────────────────────────────────────────────────
export function generateMayaResponse(query, lang = "tr", { hives = [], conversationHistory = [] } = {}) {
  const q = normalize(query);
  const isTR = lang === "tr";

  // 1. Greeting check — pattern'leri de normalize et (Türkçe karakter farkı sorununu önler)
  const words = q.split(/\s+/);
  for (const g of GREETINGS) {
    for (const p of g.patterns) {
      const np = normalize(p);
      if (q.includes(np) || words.some((w) => w === np)) {
        const variants = isTR ? g.tr : g.en;
        return { text: pick(variants), category: null };
      }
    }
  }

  // 2. Hive-context personalized response
  if (hives.length > 0) {
    const ctxResponse = hiveContextResponse(q, lang, hives);
    if (ctxResponse) {
      return { text: ctxResponse, category: "sensör" };
    }
  }

  // 3. Conversation context — follow-up sorularda konuyu sürdür
  const prevTopic = getConversationContext(conversationHistory);
  const isFollowUp = /daha fazla|detay|anlat|peki|ne yapayim|nasil|tell me more|more detail|what about|how/.test(q);

  if (prevTopic && isFollowUp) {
    const related = TOPIC_RESPONSES.find((t) => {
      const topicKey = prevTopic.toLowerCase();
      return t.patterns.some((p) => p.includes(topicKey));
    });
    if (related) {
      return {
        text: isTR ? related.tr : related.en,
        category: related.category,
      };
    }
  }

  // 4. Topic keyword matching — pattern'leri normalize ederek karşılaştır
  let bestTopic = null;
  let bestScore = 0;
  for (const topic of TOPIC_RESPONSES) {
    let score = 0;
    for (const p of topic.patterns) {
      const np = normalize(p);
      if (q.includes(np)) score += 2;
      if (words.some((w) => w === np)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore >= 2) {
    return {
      text: isTR ? bestTopic.tr : bestTopic.en,
      category: bestTopic.category,
    };
  }

  // 5. Fallback
  const fallbacks = isTR ? FALLBACKS.tr : FALLBACKS.en;
  return { text: pick(fallbacks), category: null };
}
