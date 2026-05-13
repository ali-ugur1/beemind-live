const beeKnowledge = [
  // ─── Genel Arıcılık ──────────────────────────────────────────────────────
  {
    id: 1,
    keywords: ["arıcılık", "başlangıç", "nasıl", "başlarım", "yeni", "acemi", "öğren", "beekeeping", "start", "beginner"],
    question_tr: "Arıcılığa nasıl başlarım?",
    question_en: "How do I start beekeeping?",
    answer_tr: "Arıcılığa başlamak için önce temel eğitim almanız önerilir. İl/ilçe tarım müdürlüklerinden veya arıcılık birliklerinden eğitim alabilirsiniz. Başlangıç için en az 2-3 kovan ile başlamanız, koruyucu ekipman (tulum, eldiven, maske), duman makinesi ve kovan aletleri edinmeniz gerekir. İlkbahar en ideal başlangıç zamanıdır. Ayrıca bulunduğunuz bölgedeki flora ve iklim koşullarını iyi tanımanız önemlidir.",
    answer_en: "To start beekeeping, it's recommended to get basic training first. You can get training from agricultural directorates or beekeeping associations. Start with at least 2-3 hives, get protective equipment (suit, gloves, veil), a smoker, and hive tools. Spring is the ideal time to start. It's also important to know the flora and climate conditions in your area.",
    category: "genel"
  },
  {
    id: 2,
    keywords: ["kovan", "tip", "tür", "çeşit", "langstroth", "dadant", "hive", "type"],
    question_tr: "Hangi kovan tipini kullanmalıyım?",
    question_en: "Which hive type should I use?",
    answer_tr: "Türkiye'de en yaygın kovan tipleri Langstroth ve Dadant kovanlardır. Langstroth kovanlar modüler yapısıyla bal hasadını kolaylaştırır ve taşımaya uygundur. Dadant kovanlar daha geniş çerçeveleriyle güçlü koloniler için idealdir. Başlangıç için Langstroth kovan tavsiye edilir çünkü yedek parça bulmak kolaydır ve standart ölçüleri yaygındır. Bölgenizin iklimi ve flora yapısına göre seçim yapmanız en doğrusudur.",
    answer_en: "The most common hive types in Turkey are Langstroth and Dadant hives. Langstroth hives facilitate honey harvesting with their modular structure and are suitable for transport. Dadant hives are ideal for strong colonies with their wider frames. Langstroth is recommended for beginners because spare parts are easy to find and standard measurements are common.",
    category: "ekipman"
  },
  {
    id: 3,
    keywords: ["ana", "arı", "kraliçe", "queen", "ana arı", "kraliçe arı", "değiştir"],
    question_tr: "Ana arı neden önemlidir?",
    question_en: "Why is the queen bee important?",
    answer_tr: "Ana arı koloninin kalbidir. Günde 1500-2000 yumurta bırakabilir ve koloninin genetik yapısını belirler. İyi bir ana arı; güçlü koloni, yüksek bal verimi, hastalık direnci ve sakin mizaç sağlar. Ana arı 3-5 yıl yaşar ancak en verimli dönemi ilk 2 yıldır. Ana arının yaşı ve kalitesi düştüğünde koloni zayıflar, bal üretimi azalır ve oğul verme eğilimi artar. Her yıl veya en geç 2 yılda bir ana arı yenilenmesi önerilir.",
    answer_en: "The queen bee is the heart of the colony. She can lay 1500-2000 eggs per day and determines the genetic makeup of the colony. A good queen provides: strong colony, high honey yield, disease resistance, and calm temperament. The queen lives 3-5 years but is most productive in the first 2 years. When the queen's age and quality decline, the colony weakens. Renewing the queen every 1-2 years is recommended.",
    category: "koloni"
  },
  {
    id: 4,
    keywords: ["oğul", "bölünme", "swarm", "oğul verme", "engelle", "önle"],
    question_tr: "Oğul vermeyi nasıl önlerim?",
    question_en: "How do I prevent swarming?",
    answer_tr: "Oğul vermeyi önlemek için şu adımları izleyin: 1) Genç ana arı kullanın (1-2 yaşında). 2) Kovana yeterli alan sağlayın, gerektiğinde bal katı ekleyin. 3) Havalandırmayı iyileştirin, özellikle sıcak günlerde giriş deliğini genişletin. 4) Düzenli kontrol yaparak ana arı gözlerini (oğul hücrelerini) kaldırın. 5) Yapay oğul yaparak koloni baskısını azaltın. 6) Kovanı gölgelik bir yere yerleştirin. Özellikle ilkbahar ve yaz başında haftalık kontroller kritiktir.",
    answer_en: "To prevent swarming: 1) Use a young queen (1-2 years old). 2) Provide sufficient space, add honey supers when needed. 3) Improve ventilation, especially widen the entrance on hot days. 4) Regularly inspect and remove queen cells. 5) Make artificial swarms to reduce colony pressure. 6) Place the hive in a shaded area. Weekly inspections in spring and early summer are critical.",
    category: "koloni"
  },
  {
    id: 5,
    keywords: ["varroa", "akar", "tedavi", "ilaç", "parazit", "mite", "treatment"],
    question_tr: "Varroa akarı nasıl tedavi edilir?",
    question_en: "How is Varroa mite treated?",
    answer_tr: "Varroa tedavisinde birkaç yöntem kullanılır: 1) **Organik asitler**: Oksalik asit (kışın kuluçkasız dönemde), formik asit (yaz aylarında). 2) **Timol bazlı ilaçlar**: Apiguard, ApiLife Var gibi ürünler. 3) **Sentetik akarisitler**: Amitraz şeritleri (son çare olarak). 4) **Mekanik yöntemler**: Erkek arı çerçevesi tuzağı, şeker tozu serpme. Tedavi öncesi varroa sayımı yapın (şeker tozu veya alkol yıkama yöntemi). 100 arıda 3'ten fazla varroa varsa tedavi başlatın. Bal hasadından en az 6 hafta önce kimyasal tedaviyi sonlandırın.",
    answer_en: "Several methods are used for Varroa treatment: 1) Organic acids: Oxalic acid (winter, broodless period), formic acid (summer). 2) Thymol-based products: Apiguard, ApiLife Var. 3) Synthetic acaricides: Amitraz strips (last resort). 4) Mechanical methods: Drone brood trapping, powdered sugar dusting. Do a Varroa count before treatment. Start treatment if more than 3 mites per 100 bees. End chemical treatment at least 6 weeks before honey harvest.",
    category: "hastalık"
  },
  {
    id: 6,
    keywords: ["bal", "hasat", "toplama", "süzme", "honey", "harvest", "extract"],
    question_tr: "Bal hasadı ne zaman ve nasıl yapılır?",
    question_en: "When and how is honey harvested?",
    answer_tr: "Bal hasadı genellikle çiçeklenme döneminin sonunda yapılır. Türkiye'de ana hasat zamanları: Temmuz-Ağustos (çiçek balı), Mayıs-Haziran (narenciye, akasya), Ağustos-Eylül (çam balı). Hasat için peteklerin en az %80'i kapatılmış olmalıdır. Süzme işlemi: 1) Arıları peteklerden uzaklaştırın. 2) Kapakları bıçakla kesin. 3) Santrifüj makinesinde süzün. 4) Süzgeçten geçirip kavanozlara doldurun. Hasattan sonra koloniye kış için yeterli bal (15-20 kg) bırakmayı unutmayın.",
    answer_en: "Honey is usually harvested at the end of the blooming period. In Turkey, main harvest times: July-August (flower honey), May-June (citrus, acacia), August-September (pine honey). At least 80% of cells should be capped before harvesting. Process: 1) Remove bees from frames. 2) Uncap with a knife. 3) Extract in a centrifuge. 4) Filter and jar. Remember to leave enough honey (15-20 kg) for winter.",
    category: "üretim"
  },
  {
    id: 7,
    keywords: ["kış", "kışlatma", "kışlama", "hazırlık", "winter", "winterize", "soğuk"],
    question_tr: "Arıları kışa nasıl hazırlarım?",
    question_en: "How do I prepare bees for winter?",
    answer_tr: "Kışa hazırlık adımları: 1) **Eylül-Ekim'de** varroa tedavisi yapın. 2) Kolonide en az 15-20 kg bal rezervi bırakın, yetersizse şurup verin (2:1 şeker/su). 3) Zayıf kolonileri birleştirin. 4) Ana arının genç ve sağlıklı olduğundan emin olun. 5) Kovan girişini daraltın (fare koruması). 6) Kovanın üstünü yalıtın ama alt havalandırmayı kapatmayın. 7) Rüzgara karşı koruma sağlayın. 8) Kovana rahatsız etmeden düzenli kontrol yapın (ağırlık takibi). Kışın kovana müdahale en aza indirilmelidir.",
    answer_en: "Winter preparation steps: 1) Treat for Varroa in September-October. 2) Leave at least 15-20 kg honey reserves, supplement with syrup if needed (2:1 sugar/water). 3) Combine weak colonies. 4) Ensure queen is young and healthy. 5) Reduce entrance (mouse guard). 6) Insulate top but keep bottom ventilation. 7) Provide wind protection. 8) Monitor without disturbing (weight tracking). Minimize hive interventions in winter.",
    category: "mevsimsel"
  },
  {
    id: 8,
    keywords: ["sıcaklık", "ideal", "derece", "temperature", "temp", "optimum", "kovan sıcaklığı"],
    question_tr: "Kovan için ideal sıcaklık nedir?",
    question_en: "What is the ideal temperature for a hive?",
    answer_tr: "Kuluçka bölgesinde ideal sıcaklık 34-36°C arasıdır. Arılar bu sıcaklığı kanat çırpma (soğutma) ve kümelenme (ısınma) ile düzenler. Kovan dış sıcaklığı 10°C'nin altına düştüğünde arılar küme oluşturur. 40°C üzerinde ise tehlikeli bölgeye girilir, petekler eriyebilir ve kuluçka zarar görebilir. BeeMora sensörleriyle sıcaklığı sürekli takip edebilir, anormal değerlerde otomatik uyarı alabilirsiniz.",
    answer_en: "The ideal temperature in the brood area is 34-36°C. Bees regulate this through fanning (cooling) and clustering (warming). Below 10°C, bees form a cluster. Above 40°C is dangerous - combs can melt and brood can be damaged. With BeeMora sensors, you can continuously monitor temperature and receive automatic alerts for abnormal values.",
    category: "sensör"
  },
  {
    id: 9,
    keywords: ["nem", "humidity", "nemlilik", "kovan nem", "rutubet"],
    question_tr: "Kovan nem seviyesi ne olmalı?",
    question_en: "What should the hive humidity level be?",
    answer_tr: "Kovan içi ideal nem seviyesi %50-65 arasıdır. Kuluçka bölgesinde %60-70 normaldir. %85 üzeri nem; mantar hastalıkları, tebeşir hastalığı ve bal fermantasyonuna yol açar. %30 altı nem ise kuluçka gelişimini olumsuz etkiler. Yüksek nemde: havalandırmayı artırın, kovan tabanına havalandırma tahtası koyun. Düşük nemde: yakına su kaynağı koyun. BeeMora nem sensörü bu değerleri anlık takip eder.",
    answer_en: "The ideal humidity level inside the hive is 50-65%. In the brood area, 60-70% is normal. Above 85% causes fungal diseases, chalkbrood, and honey fermentation. Below 30% negatively affects brood development. For high humidity: increase ventilation. For low humidity: place a water source nearby. BeeMora humidity sensor tracks these values in real-time.",
    category: "sensör"
  },
  {
    id: 10,
    keywords: ["ses", "sound", "ses seviyesi", "gürültü", "frekans", "akustik"],
    question_tr: "Kovan ses seviyesi ne anlama gelir?",
    question_en: "What does the hive sound level mean?",
    answer_tr: "Kovan sesi koloni sağlığının önemli bir göstergesidir. Normal ses: 40-60 dB arası, düzenli ve homojen bir vızıltı. Yüksek ses (>70 dB): Stres, oğul hazırlığı, ana arı kaybı veya dış tehdit. Ani ses değişimleri: Yağmacı arı saldırısı, hayvan müdahalesi. Düşük frekans titreşimleri: Ana arı olgunlaşma sinyali (piping). BeeMora ses sensörü bu değişimleri algılayarak size otomatik uyarı gönderir.",
    answer_en: "Hive sound is an important indicator of colony health. Normal sound: 40-60 dB, regular and homogeneous buzzing. High sound (>70 dB): Stress, swarm preparation, queen loss, or external threat. Sudden changes: Robber bee attack, animal interference. Low frequency vibrations: Queen piping signal. BeeMora sound sensor detects these changes and sends automatic alerts.",
    category: "sensör"
  },
  {
    id: 11,
    keywords: ["pil", "batarya", "battery", "şarj", "enerji", "güneş", "solar"],
    question_tr: "Sensör pili ne kadar dayanır?",
    question_en: "How long does the sensor battery last?",
    answer_tr: "BeeMora sensör pili kullanım şekline göre 3-12 ay arası dayanır. Pil ömrünü uzatmak için: 1) Veri gönderim aralığını optimize edin (15-30 dk ideal). 2) Güneş paneli eklentisi kullanın. 3) Düşük sıcaklıklarda pil performansı düşer, kışın daha sık kontrol edin. %20 altına düştüğünde BeeMora uyarı gönderir. Pil değişimi basittir ve kullanım kılavuzunda adım adım anlatılmıştır.",
    answer_en: "BeeMora sensor battery lasts 3-12 months depending on usage. To extend battery life: 1) Optimize data transmission interval (15-30 min ideal). 2) Use solar panel addon. 3) Battery performance drops in low temperatures, check more often in winter. BeeMora sends alerts when below 20%. Battery replacement is simple and described in the user guide.",
    category: "sensör"
  },
  {
    id: 12,
    keywords: ["hastalık", "nosema", "tebeşir", "amerikan", "avrupa", "yavru çürüklüğü", "disease", "foulbrood"],
    question_tr: "Yaygın arı hastalıkları nelerdir?",
    question_en: "What are common bee diseases?",
    answer_tr: "Yaygın arı hastalıkları: 1) **Amerikan Yavru Çürüklüğü (AYÇ)**: En ciddi hastalık, bulaşıcı, ihbar mecburiyeti var. Belirtisi: çökmüş, delikli kapaklar, yapışkan larva kalıntısı. Tedavi zor, genellikle kovan imha edilir. 2) **Avrupa Yavru Çürüklüğü**: Daha hafif, antibiyotikle tedavi mümkün. 3) **Nosema**: Yetişkin arı hastalığı, ishal belirtisi. Fumidil-B ile tedavi. 4) **Tebeşir Hastalığı**: Mantar kaynaklı, havalandırma iyileştirmesi ve güçlü koloni ile kontrol altına alınır. 5) **Varroa**: En yaygın parazit, düzenli tedavi gerektirir.",
    answer_en: "Common bee diseases: 1) American Foulbrood (AFB): Most serious, contagious, must be reported. Symptoms: sunken/perforated caps, sticky larval remains. Hard to treat, usually hive is destroyed. 2) European Foulbrood: Milder, treatable with antibiotics. 3) Nosema: Adult bee disease, diarrhea symptoms. Treated with Fumidil-B. 4) Chalkbrood: Fungal, controlled by improving ventilation and strong colony. 5) Varroa: Most common parasite, requires regular treatment.",
    category: "hastalık"
  },
  {
    id: 13,
    keywords: ["besleme", "şurup", "kek", "besle", "şeker", "feed", "feeding", "sugar", "syrup"],
    question_tr: "Arıları ne zaman ve nasıl beslemeliyim?",
    question_en: "When and how should I feed bees?",
    answer_tr: "Arı besleme zamanları ve yöntemleri: 1) **Sonbahar beslemesi** (Eylül-Ekim): 2:1 oranında şeker şurubu (kışlık stok). 2) **İlkbahar uyarı beslemesi** (Şubat-Mart): 1:1 şeker şurubu (kuluçkayı tetikler). 3) **Protein takviyesi**: Polen yetersizliğinde protein keki verin. 4) Kış ortasında acil durumlarda fondanla besleyin. Şurup hazırlama: Şekeri sıcak suyla eritin, kaynatmayın. Kovana akşam saatlerinde verin (yağmacılığı önler). Bal mevsiminde şurup vermeyin, balın kalitesini düşürür.",
    answer_en: "Bee feeding times and methods: 1) Autumn feeding (Sep-Oct): 2:1 sugar syrup (winter stock). 2) Spring stimulation (Feb-Mar): 1:1 sugar syrup (triggers brood). 3) Protein supplement: Give protein patties when pollen is scarce. 4) Emergency winter feeding with fondant. Syrup preparation: Dissolve sugar in warm water, don't boil. Feed in evening (prevents robbing). Don't feed syrup during honey flow as it reduces honey quality.",
    category: "bakım"
  },
  {
    id: 14,
    keywords: ["ağırlık", "tartı", "weight", "kovan ağırlığı", "kilo", "bal akışı"],
    question_tr: "Kovan ağırlığı ne anlama gelir?",
    question_en: "What does hive weight mean?",
    answer_tr: "Kovan ağırlığı koloni sağlığı ve bal üretiminin en güvenilir göstergesidir. Günlük ağırlık artışı: Nektar akışının göstergesi (günde 1-3 kg artış iyi). Ani ağırlık düşüşü: Oğul verme (2-3 kg kayıp), yağmacılık veya bal tüketimi. Kış ağırlığı: Başlangıçta 30-35 kg olmalı, kış sonunda 20 kg'ın altına düşerse acil besleme gerekir. BeeMora ağırlık sensörü bu verileri 24 saat takip eder ve trend analizi sunar.",
    answer_en: "Hive weight is the most reliable indicator of colony health and honey production. Daily weight gain: Indicates nectar flow (1-3 kg/day is good). Sudden weight drop: Swarming (2-3 kg loss), robbing, or honey consumption. Winter weight: Should start at 30-35 kg, if it drops below 20 kg by end of winter, emergency feeding is needed. BeeMora weight sensor tracks this 24/7 with trend analysis.",
    category: "sensör"
  },
  {
    id: 15,
    keywords: ["ilkbahar", "bahar", "spring", "ilk kontrol", "bahar bakımı", "mevsim açılış"],
    question_tr: "İlkbaharda neler yapmalıyım?",
    question_en: "What should I do in spring?",
    answer_tr: "İlkbahar kontrol listesi: 1) Ana arı kontrolü — yumurta ve genç larva varlığını doğrulayın. 2) Koloni gücünü değerlendirin, zayıf kolonileri güçlendirin. 3) Eski ve kararmış petekleri yenileyin. 4) Kovan tabanını temizleyin. 5) Uyarı beslemesi başlatın (1:1 şurup). 6) Varroa sayımı yapın. 7) Kovan genişletmeye hazırlanın, petekli çerçeve ekleyin. 8) Oğul kontrollerine başlayın (haftalık). Bu dönemde BeeMora sensörleri kritik verileri anlık takip etmenize yardımcı olur.",
    answer_en: "Spring checklist: 1) Queen check — verify eggs and young larvae. 2) Assess colony strength, strengthen weak colonies. 3) Replace old dark combs. 4) Clean hive bottom board. 5) Start stimulation feeding (1:1 syrup). 6) Do Varroa count. 7) Prepare for expansion, add drawn frames. 8) Begin swarm inspections (weekly). BeeMora sensors help you monitor critical data in real-time during this period.",
    category: "mevsimsel"
  },
  {
    id: 16,
    keywords: ["yaz", "summer", "sıcak", "gölge", "havalandırma", "soğutma"],
    question_tr: "Yaz aylarında dikkat edilecekler neler?",
    question_en: "What to watch for in summer?",
    answer_tr: "Yaz aylarında dikkat edilecekler: 1) **Sıcak stresi**: Kovanları gölgelik yere taşıyın veya gölgelik yapın. 2) **Su kaynağı**: Yakına temiz su kaynağı koyun. 3) **Havalandırma**: Kovan girişini genişletin, gerekirse üst havalandırma açın. 4) **Bal hasadı**: Petekler %80 kapalıyken hasat edin. 5) **Oğul kontrolü**: Devam edin. 6) **Yağmacılık**: Zayıf kovanları koruyun, girişi daraltın. 7) **Pestisit riski**: Çevredeki tarımsal ilaçlama takvimini takip edin. BeeMora sıcaklık alarmlarını 38°C'ye ayarlayın.",
    answer_en: "Summer precautions: 1) Heat stress: Move hives to shade or create shade. 2) Water source: Place clean water nearby. 3) Ventilation: Widen entrance, open top ventilation if needed. 4) Honey harvest: Harvest when 80% capped. 5) Swarm checks: Continue. 6) Robbing: Protect weak hives, reduce entrance. 7) Pesticide risk: Monitor agricultural spraying schedule. Set BeeMora temperature alarms to 38°C.",
    category: "mevsimsel"
  },
  {
    id: 17,
    keywords: ["sonbahar", "güz", "autumn", "fall", "hasat sonrası"],
    question_tr: "Sonbaharda neler yapmalıyım?",
    question_en: "What should I do in autumn?",
    answer_tr: "Sonbahar kontrol listesi: 1) Son bal hasadını yapın. 2) Varroa tedavisini Eylül'de başlatın. 3) Kışlık beslemeye geçin (2:1 şurup). 4) Zayıf kolonileri birleştirin (güçlü koloni > 2 zayıf koloni). 5) Ana arıyı kontrol edin, gerekirse değiştirin. 6) Fare koruması takın. 7) Kovan yalıtımını yapın. 8) Kovanlara son genel bakımı yapın. Sonbahar, gelecek sezonun temelinin atıldığı en kritik dönemdir.",
    answer_en: "Autumn checklist: 1) Complete final honey harvest. 2) Start Varroa treatment in September. 3) Switch to winter feeding (2:1 syrup). 4) Combine weak colonies. 5) Check queen, replace if needed. 6) Install mouse guards. 7) Insulate hives. 8) Final general maintenance. Autumn is the most critical period for laying the foundation of the next season.",
    category: "mevsimsel"
  },
  {
    id: 18,
    keywords: ["polen", "propolis", "arı sütü", "bal mumu", "pollen", "royal jelly", "beeswax", "ürün"],
    question_tr: "Arı ürünleri nelerdir?",
    question_en: "What are bee products?",
    answer_tr: "Başlıca arı ürünleri: 1) **Bal**: Ana ürün, çiçek nektarından üretilir. 2) **Polen**: Protein kaynağı, taze veya kurutulmuş tüketilir. 3) **Propolis**: Antimikrobiyal özellikleri olan yapışkan madde, sağlık ürünlerinde kullanılır. 4) **Arı sütü (Royal Jelly)**: Ana arı besini, yüksek besin değeri. 5) **Bal mumu**: Kozmetik ve mum yapımında kullanılır. 6) **Arı zehri (Apitoksin)**: Tıbbi amaçlarla kullanılır. Her ürünün kendine özel hasat yöntemi ve saklama koşulları vardır.",
    answer_en: "Main bee products: 1) Honey: Main product, made from flower nectar. 2) Pollen: Protein source, consumed fresh or dried. 3) Propolis: Antimicrobial substance used in health products. 4) Royal Jelly: Queen bee food, high nutritional value. 5) Beeswax: Used in cosmetics and candle making. 6) Bee venom (Apitoxin): Used for medical purposes. Each product has specific harvesting and storage methods.",
    category: "üretim"
  },
  {
    id: 19,
    keywords: ["beemora", "sensör", "sensor", "kurulum", "bağlantı", "setup", "install", "wifi", "cihaz"],
    question_tr: "BeeMora sensörü nasıl kurulur?",
    question_en: "How to set up BeeMora sensor?",
    answer_tr: "BeeMora sensör kurulumu: 1) Sensör ünitesini kovan tabanına veya yan duvarına sabitleyin. 2) Sıcaklık/nem probu kuluçka bölgesine yakın yerleştirin. 3) Ağırlık sensörünü kovan altına koyun. 4) Cihazı açın ve BeeMora uygulamasından WiFi/GSM bağlantısını yapın. 5) Kovanı uygulamadan tanımlayın ve sensörü eşleştirin. 6) Alarm eşik değerlerini ayarlayın. İlk veri 5-10 dakika içinde gelmeye başlar. Sorun yaşarsanız cihazı resetleyip tekrar deneyin.",
    answer_en: "BeeMora sensor setup: 1) Mount sensor unit on hive floor or side wall. 2) Place temperature/humidity probe near brood area. 3) Put weight sensor under hive. 4) Turn on device and connect via WiFi/GSM from BeeMora app. 5) Register hive in app and pair sensor. 6) Set alarm thresholds. First data arrives within 5-10 minutes. If issues occur, reset device and retry.",
    category: "beemora"
  },
  {
    id: 20,
    keywords: ["alarm", "uyarı", "bildirim", "notification", "alert", "eşik", "threshold"],
    question_tr: "BeeMora alarm ayarlarını nasıl yapabilirim?",
    question_en: "How do I configure BeeMora alarms?",
    answer_tr: "BeeMora alarm ayarları: Ayarlar sayfasından bildirim tercihlerinizi yapılandırabilirsiniz. Önerilen eşik değerleri: Sıcaklık: 10°C altı ve 40°C üstü kritik. Nem: %30 altı ve %85 üstü kritik. Ses: 80 dB üstü uyarı. Pil: %20 altı uyarı. Ağırlık: Günlük 2 kg'dan fazla düşüş uyarı. Bildirimler e-posta, SMS veya push notification olarak alınabilir. Kritik alarmlar her zaman aktif tutulmalıdır.",
    answer_en: "BeeMora alarm settings: Configure notification preferences from the Settings page. Recommended thresholds: Temperature: below 10°C and above 40°C critical. Humidity: below 30% and above 85% critical. Sound: above 80 dB warning. Battery: below 20% warning. Weight: daily drop over 2 kg warning. Notifications can be received via email, SMS, or push notification. Critical alarms should always be kept active.",
    category: "beemora"
  },
  {
    id: 21,
    keywords: ["göç", "göçer", "taşıma", "nakil", "gezginci", "arıcılık", "migratory", "transport"],
    question_tr: "Gezginci arıcılık nasıl yapılır?",
    question_en: "How is migratory beekeeping done?",
    answer_tr: "Gezginci arıcılık ipuçları: 1) Taşıma öncesi akşam kovan girişlerini kapatın. 2) Çerçeveleri sabitleyin (kayma önleyici). 3) Havalandırma sağlayın (üst kapakta tül). 4) Gece veya serin saatlerde taşıyın. 5) Yeni lokasyonda kovanları en az 3 km uzağa yerleştirin (arılar eski yere dönmesin). 6) Varışta girişleri hemen açın. 7) 2-3 gün kolonilerin yerleşmesini bekleyin. BeeMora GPS takibi ile kovan lokasyonlarını harita üzerinde takip edebilirsiniz.",
    answer_en: "Migratory beekeeping tips: 1) Close entrances in evening before transport. 2) Secure frames (anti-slip). 3) Provide ventilation (mesh on top cover). 4) Transport at night or cool hours. 5) Place hives at least 3 km away at new location. 6) Open entrances immediately on arrival. 7) Wait 2-3 days for colonies to settle. With BeeMora GPS tracking, you can track hive locations on the map.",
    category: "genel"
  },
  {
    id: 22,
    keywords: ["arı", "sokması", "sokmak", "alerjik", "alerji", "reaksiyon", "sting", "allergy"],
    question_tr: "Arı sokmasında ne yapmalıyım?",
    question_en: "What should I do for a bee sting?",
    answer_tr: "Arı sokmasında ilk müdahale: 1) İğneyi hemen çıkarın — tırnakla kazıyarak, cımbızla sıkmayın (daha fazla zehir yayılır). 2) Bölgeyi sabun ve suyla yıkayın. 3) Buz uygulayın (şişlik için). 4) Antihistaminik krem sürün. **Acil durum**: Nefes darlığı, yüz/boğaz şişmesi, baş dönmesi varsa HEMEN 112'yi arayın — anafilaktik şok riski. Alerjik kişiler yanlarında epinefrin otoenjektör (EpiPen) taşımalıdır. Arıcılık yaparken her zaman koruyucu ekipman giymeyi unutmayın.",
    answer_en: "First aid for bee sting: 1) Remove stinger immediately — scrape with fingernail, don't squeeze with tweezers. 2) Wash with soap and water. 3) Apply ice (for swelling). 4) Apply antihistamine cream. Emergency: If difficulty breathing, face/throat swelling, dizziness — CALL 911 immediately — anaphylactic shock risk. Allergic people should carry epinephrine auto-injector (EpiPen). Always wear protective equipment when beekeeping.",
    category: "genel"
  },
  {
    id: 23,
    keywords: ["organik", "doğal", "organic", "natural", "kimyasal", "ilaçsız"],
    question_tr: "Organik arıcılık nasıl yapılır?",
    question_en: "How is organic beekeeping done?",
    answer_tr: "Organik arıcılık prensipleri: 1) Kovanlar tarım ilaçlama yapılmayan bölgelere yerleştirilir (3 km yarıçap). 2) Sadece doğal malzemeden kovan (ahşap, balmumu). 3) Varroa tedavisinde yalnızca organik asitler (oksalik, formik asit) ve timol. 4) Besleme sadece organik bal veya organik şeker şurubu ile. 5) Antibiyotik kullanımı yasak. 6) Plastik temel petek yerine doğal balmumu. 7) Sertifika için 1-3 yıl geçiş süreci gerekir. Organik bal daha yüksek fiyattan satılır ancak üretim maliyeti de yüksektir.",
    answer_en: "Organic beekeeping principles: 1) Hives placed in areas free from pesticides (3 km radius). 2) Only natural materials for hives (wood, beeswax). 3) Varroa treatment only with organic acids and thymol. 4) Feeding only with organic honey or organic sugar syrup. 5) No antibiotics. 6) Natural beeswax foundation instead of plastic. 7) Certification requires 1-3 year transition. Organic honey sells at higher prices but production costs are also higher.",
    category: "genel"
  },
  {
    id: 24,
    keywords: ["çam", "balı", "pine", "honey", "salgı", "basra biti"],
    question_tr: "Çam balı nasıl üretilir?",
    question_en: "How is pine honey produced?",
    answer_tr: "Çam balı, Türkiye'ye özgü bir bal türüdür ve dünya çam balı üretiminin %90'ı Türkiye'den gelir. Üretim süreci: Marchalina hellenica (basra biti) adlı böcek çam ağaçlarından salgı üretir, arılar bu salgıyı toplayarak bala dönüştürür. Muğla, Aydın ve çevresi ana üretim bölgesidir. Hasat zamanı: Ağustos-Ekim. Çam balı koyu renkli, mineralce zengin ve kristalleşmesi yavaştır. Özel bakım: Basra biti popülasyonunun korunması kritiktir.",
    answer_en: "Pine honey is unique to Turkey, producing 90% of the world's pine honey. Production process: Marchalina hellenica insect produces secretions on pine trees, bees collect and convert to honey. Mugla, Aydin region is the main production area. Harvest: August-October. Pine honey is dark, mineral-rich, and slow to crystallize. Special care: Preserving the insect population is critical.",
    category: "üretim"
  },
  {
    id: 25,
    keywords: ["arı", "ırk", "ırklar", "kafkas", "karniol", "italian", "buckfast", "race", "breed"],
    question_tr: "Hangi arı ırkı en iyisidir?",
    question_en: "Which bee race is the best?",
    answer_tr: "Türkiye'de yaygın arı ırkları: 1) **Kafkas arısı (Apis mellifera caucasica)**: Uzun dili sayesinde derin çiçeklerden nektar toplar, sakin mizaçlı, kışa dayanıklı. Doğu Karadeniz kökenli. 2) **Anadolu arısı (A.m. anatoliaca)**: Yerel ırk, bölgeye adapte, dayanıklı. 3) **Muğla arısı**: Çam balı üretiminde başarılı. 4) **İtalyan arısı (A.m. ligustica)**: Yüksek bal verimi, sakin ama kışa dayanımı düşük. 5) **Carniolan (A.m. carnica)**: Hızlı gelişir, az propolis yapar. Bölgenize uygun yerel ırkı tercih etmeniz en doğrusudur.",
    answer_en: "Common bee races in Turkey: 1) Caucasian (A.m. caucasica): Long tongue for deep flowers, calm, winter-hardy. 2) Anatolian (A.m. anatoliaca): Local, adapted, resilient. 3) Mugla bee: Successful in pine honey. 4) Italian (A.m. ligustica): High yield, calm but less winter-hardy. 5) Carniolan (A.m. carnica): Fast growth, less propolis. Choose the local race suited to your region.",
    category: "koloni"
  },
  {
    id: 26,
    keywords: ["mevzuat", "yasal", "ruhsat", "izin", "tescil", "kayıt", "legal", "license", "regulation"],
    question_tr: "Arıcılık için yasal gereklilikler neler?",
    question_en: "What are the legal requirements for beekeeping?",
    answer_tr: "Türkiye'de arıcılık yasal gereklilikleri: 1) İl/ilçe tarım müdürlüğüne arıcılık kaydı yaptırmalısınız. 2) Arılık tescil belgesi almanız gerekir. 3) Gezginci arıcılık için il dışı yer değiştirme belgesi. 4) Hayvan sağlık raporu (taşıma için). 5) Arı hastalıklarını bildirme zorunluluğu (AYÇ gibi). 6) Organik arıcılık yapacaksanız sertifika kuruluşlarına başvuru. 7) Bal satışı için gıda üretim izni (işletme olarak). Detaylı bilgi için yerel Tarım ve Orman İl Müdürlüğü'ne başvurun.",
    answer_en: "Legal requirements for beekeeping in Turkey: 1) Register with agricultural directorate. 2) Get apiary registration certificate. 3) Relocation permit for migratory beekeeping. 4) Animal health certificate (for transport). 5) Mandatory disease reporting (AFB etc.). 6) Organic certification if applicable. 7) Food production license for honey sales. Contact your local Agriculture and Forestry Directorate for details.",
    category: "genel"
  },
  {
    id: 27,
    keywords: ["grafik", "chart", "veri", "data", "analiz", "istatistik", "trend", "rapor"],
    question_tr: "BeeMora grafiklerini nasıl okurum?",
    question_en: "How do I read BeeMora charts?",
    answer_tr: "BeeMora grafik okuma rehberi: 1) **Sıcaklık grafiği**: Yeşil bölge (20-36°C) ideal, sarı bölge uyarı, kırmızı bölge kritik. 2) **Nem grafiği**: %50-65 ideal bölge. 3) **Ağırlık grafiği**: Yukarı trend = nektar akışı iyi, düz = normal, aşağı = stok tüketimi veya sorun. 4) **Ses grafiği**: Ani yükselişler dikkat gerektirir. Raporlar sayfasından detaylı analizlere ulaşabilir, tarih aralığı seçerek geçmiş verileri inceleyebilirsiniz.",
    answer_en: "BeeMora chart reading guide: 1) Temperature chart: Green zone (20-36°C) ideal, yellow warning, red critical. 2) Humidity chart: 50-65% ideal. 3) Weight chart: Upward trend = good nectar flow, flat = normal, downward = stock consumption or problem. 4) Sound chart: Sudden spikes need attention. Access detailed analysis from the Reports page with custom date ranges.",
    category: "beemora"
  },
  {
    id: 28,
    keywords: ["arı", "zehir", "apiterapi", "tedavi", "venom", "therapy", "apitherapy"],
    question_tr: "Arı zehri tedavisi (apiterapi) nedir?",
    question_en: "What is bee venom therapy (apitherapy)?",
    answer_tr: "Apiterapi, arı ürünlerinin (özellikle arı zehri) tedavi amaçlı kullanımıdır. Arı zehri (apitoksin) anti-enflamatuar ve ağrı kesici özelliklere sahiptir. Kullanım alanları: romatoid artrit, bel fıtığı, MS hastalığı, bazı alerjiler. Dikkat: Mutlaka uzman doktor gözetiminde uygulanmalıdır. Alerjik reaksiyon riski yüksektir. İlk uygulamadan önce alerji testi yapılmalıdır. Hamileler ve kalp hastaları için kontrendikedir.",
    answer_en: "Apitherapy is the therapeutic use of bee products, especially bee venom. Bee venom (apitoxin) has anti-inflammatory and analgesic properties. Uses: rheumatoid arthritis, herniated disc, MS, some allergies. Warning: Must be administered under expert medical supervision. High risk of allergic reaction. Allergy test required before first application. Contraindicated for pregnant women and heart patients.",
    category: "genel"
  },
  {
    id: 29,
    keywords: ["petrol", "petek", "temel", "balmumu", "foundation", "comb", "wax"],
    question_tr: "Petek bakımı nasıl yapılır?",
    question_en: "How to maintain combs?",
    answer_tr: "Petek bakım rehberi: 1) Kararmış petekleri 3 yılda bir değiştirin (hastalık riski). 2) Temel petekleri güvenilir üreticiden alın (kalıntı riski). 3) Kullanılmayan petekleri serin, karanlık yerde saklayın. 4) Güve koruması: petekleri kükürt veya B401 ile koruyun. 5) Yeni petek çekim zamanı: nektar akışı döneminde arılara temel petek verin. 6) Bal peteklerini ayrı saklayın, kuluçka petekleriyle karıştırmayın. 7) Hastalıklı kovandaki petekleri imha edin, başka kovana vermeyin.",
    answer_en: "Comb maintenance guide: 1) Replace darkened combs every 3 years (disease risk). 2) Buy foundation from trusted producers (residue risk). 3) Store unused combs in cool, dark place. 4) Moth protection: treat with sulfur or B401. 5) New comb drawing: give foundation during nectar flow. 6) Store honey combs separately from brood combs. 7) Destroy combs from diseased hives, never reuse.",
    category: "bakım"
  },
  {
    id: 30,
    keywords: ["drone", "erkek", "döllenme", "çiftleşme", "male", "mating"],
    question_tr: "Erkek arıların rolü nedir?",
    question_en: "What is the role of drone bees?",
    answer_tr: "Erkek arılar (drone) kolonide önemli roller üstlenir: 1) **Ana görevi**: Ana arıyı dölleme. Çiftleşme uçuşu 15-30 metre yükseklikte gerçekleşir. 2) Genetik çeşitlilik sağlar (bir ana arı 10-20 erkekle çiftleşir). 3) Kovan sıcaklık düzenlemesine katkıda bulunur. Erkek arılar ilkbahar-yaz arası en fazladır. İğneleri yoktur, bal toplamazlar. Sonbaharda işçi arılar erkekleri kovandan atar (kış tasarrufu). Sağlıklı bir kolonide %10-15 erkek arı normaldir.",
    answer_en: "Drone bees play important roles: 1) Main duty: Mating with queen. Mating flight occurs at 15-30m altitude. 2) Ensures genetic diversity (queen mates with 10-20 drones). 3) Contributes to hive temperature regulation. Drones are most numerous spring-summer. They have no stinger and don't collect honey. In autumn, worker bees evict drones (winter conservation). 10-15% drones is normal in a healthy colony.",
    category: "koloni"
  },

  // ─── Maliyet & Gelir ─────────────────────────────────────────────────────────
  {
    id: 31,
    keywords: ["maliyet", "fiyat", "ücret", "masraf", "bütçe", "para", "tutar", "cost", "price", "expense", "budget", "yatırım", "investment"],
    question_tr: "Arıcılığa başlamak ne kadar maliyetli?",
    question_en: "How much does it cost to start beekeeping?",
    answer_tr: "Arıcılığa başlangıç maliyeti kovan sayısına ve ekipmana göre değişir. Temel maliyet kalemleri (2024 tahmini): 1) **Kovan** (Langstroth): 800–1.500 ₺/adet. 2) **Koruyucu ekipman** (tulum+eldiven+maske): 500–1.000 ₺. 3) **Duman makinesi**: 300–600 ₺. 4) **Kovan aletleri seti**: 150–300 ₺. 5) **Arılı oğul paketi** (3 çerçeveli): 1.500–3.000 ₺/kovan. 3 kovanla başlangıç için toplam yaklaşık 10.000–15.000 ₺ bütçe önerilir. İlk yıl gelir beklemeden yatırım dönemi olarak değerlendirin. Ekipman bir kez alınır, asıl gider arı ve kovan yenileme olur.",
    answer_en: "Startup costs depend on hive count and equipment. Basic costs (2024 estimate): 1) Hive (Langstroth): 800–1,500 ₺ each. 2) Protective gear (suit+gloves+veil): 500–1,000 ₺. 3) Smoker: 300–600 ₺. 4) Hive tool set: 150–300 ₺. 5) Package bees (3-frame): 1,500–3,000 ₺/hive. Budget around 10,000–15,000 ₺ to start with 3 hives. Treat the first year as an investment period without expecting income. Equipment is a one-time purchase; main ongoing expenses are bees and hive renewal.",
    category: "genel"
  },
  {
    id: 32,
    keywords: ["kazanç", "gelir", "kâr", "satış", "para kazan", "getiri", "income", "profit", "earn", "revenue", "return"],
    question_tr: "Arıcılıktan ne kadar kazanılır?",
    question_en: "How much can you earn from beekeeping?",
    answer_tr: "Arıcılık geliri kovan sayısı, bölge ve ürün çeşitliliğine göre büyük farklılık gösterir. Ortalama değerler (2024): 1) **Bal verimi**: Kovan başına yılda 15–40 kg (çiçek balı), çam balında 20–60 kg. 2) **Bal fiyatı**: 150–400 ₺/kg (kalite ve türe göre). 3) **Kovan başı yıllık gelir**: 2.500–8.000 ₺. 50 kovanla profesyonel düzeyde 125.000–400.000 ₺ yıllık gelir mümkündür. Ek gelir: Polen, propolis, balmumu, arı sütü satışı. Giderler düşüldükten sonra net kâr kovan başına %30–50 marj sunar. Sabır gerektiren, uzun vadeli bir yatırımdır.",
    answer_en: "Beekeeping income varies greatly by hive count, region, and product diversity. Average values (2024): 1) Honey yield: 15–40 kg/hive/year (flower honey), 20–60 kg for pine honey. 2) Honey price: 150–400 ₺/kg. 3) Annual income per hive: 2,500–8,000 ₺. With 50 hives, professional income of 125,000–400,000 ₺/year is possible. Extra income from pollen, propolis, beeswax, royal jelly. Net profit after expenses is 30–50% margin per hive. It's a long-term investment requiring patience.",
    category: "genel"
  },
  {
    id: 33,
    keywords: ["beemora", "fiyat", "ücret", "abonelik", "paket", "plan", "satın", "price", "subscription", "plan", "buy", "purchase"],
    question_tr: "BeeMora'nın fiyatı nedir?",
    question_en: "What is BeeMora's price?",
    answer_tr: "BeeMora'nın fiyatlandırması hakkında detaylı bilgi almak için lütfen bizimle iletişime geçin. Sensör paketi ve yazılım aboneliği dahil özel teklifler sunulmaktadır. Kovan sayısına göre ölçeklenebilir planlar mevcuttur. İletişim: info@beemora.com veya WhatsApp: 0552 347 80 15. Demo talebinde bulunabilir, 30 günlük ücretsiz deneme imkânından yararlanabilirsiniz.",
    answer_en: "For detailed pricing information about BeeMora, please contact us. Special offers including sensor package and software subscription are available. Scalable plans based on hive count are available. Contact: info@beemora.com or WhatsApp: 0552 347 80 15. You can request a demo and benefit from a 30-day free trial.",
    category: "beemora"
  },

  // ─── Koloni Yönetimi ──────────────────────────────────────────────────────────
  {
    id: 34,
    keywords: ["koloni", "güçlendir", "zayıf", "birleştir", "strengthen", "weak", "merge", "combine"],
    question_tr: "Zayıf koloniyi nasıl güçlendiririm?",
    question_en: "How do I strengthen a weak colony?",
    answer_tr: "Zayıf koloni güçlendirme yöntemleri: 1) **Kapalı kuluçka ekle**: Güçlü kovandan kapalı kuluçkalı çerçeve ver (genç arı artışı). 2) **Birleştirme**: İki zayıf koloniyi gazete kâğıdı yöntemiyle birleştir. 3) **Uyarı beslemesi**: 1:1 şeker şurubu ile kuluçkayı tetikle. 4) **Kovan küçült**: Kışlık bölme ile ısı kaybını önle. 5) **Ana arı kontrolü**: Hasta veya yaşlı ana arıyı yeni ve genç bir ana arı ile değiştir. 6) **Sağlık kontrolü**: Varroa ve diğer hastalıkları tedavi et. Zayıf koloniyi asla yakın bir güçlü koloninin yanına koyma (yağmacılık riski).",
    answer_en: "Methods to strengthen a weak colony: 1) Add sealed brood: Transfer frames with capped brood from a strong hive (increases young bees). 2) Merging: Combine two weak colonies using the newspaper method. 3) Stimulation feeding: Trigger brood with 1:1 sugar syrup. 4) Reduce hive space: Use divider to prevent heat loss. 5) Queen check: Replace old/sick queen with new young queen. 6) Health check: Treat Varroa and other diseases. Never place a weak colony next to a strong one (robbing risk).",
    category: "koloni"
  },
  {
    id: 35,
    keywords: ["yağmacılık", "yağma", "robbing", "saldırı", "hırsız", "savunma"],
    question_tr: "Yağmacılığı (robbing) nasıl önlerim?",
    question_en: "How do I prevent robbing?",
    answer_tr: "Yağmacılık önleme adımları: 1) Kovan girişini daraltın — zayıf kolonilerde 1-2 arı geçecek kadar küçültün. 2) Şurubu akşam verin, gündüz giriş etrafında damlama bırakmayın. 3) Muayene sırasında kovanı uzun süre açık tutmayın. 4) Zayıf kovanlara yakın kaynak (şurup, bal) bırakmayın. 5) Yağmacılık başladıysa: girişi ıslak çuval veya otla geçici olarak kapatın. 6) Bal işleme ve mum eritme kovanlara yakın yapmayın. BeeMora ses sensörü, yağmacılık sırasında oluşan anormal ses artışını algılar.",
    answer_en: "Robbing prevention steps: 1) Reduce entrance — make it small enough for only 1-2 bees in weak colonies. 2) Feed syrup in the evening; avoid spills near entrances during the day. 3) Don't leave hives open for long during inspections. 4) Don't leave food sources near weak hives. 5) If robbing has started: temporarily block entrance with wet burlap or grass. 6) Don't process honey or melt wax near hives. BeeMora sound sensor detects abnormal sound increases during robbing.",
    category: "koloni"
  },
  {
    id: 36,
    keywords: ["yapay", "oğul", "bölme", "nükleus", "artificial swarm", "split", "divide", "nuc"],
    question_tr: "Yapay oğul (bölme) nasıl yapılır?",
    question_en: "How do I make an artificial swarm (split)?",
    answer_tr: "Yapay oğul yapma adımları: 1) Güçlü koloniden 2-3 kapalı kuluçka çerçevesi + 1-2 bal çerçevesi al. 2) Genç arıları çerçevelerle birlikte yeni kovana koy. 3) Ana arı hücresini veya yetiştirilmiş ana arı ekle (ya da 24 saat bekleyip arıların kendi ana arı yapmasına izin ver). 4) Yeni kovanda su ve uyarı beslemesi sağla. 5) En az 3 km uzağa koy (aksi hâlde arılar eski yere döner). Ana koloniye dokunmadan ayrılan arılar 3-4 haftada güçlü koloni oluşturur. En ideal zaman: ilkbahar sonu, oğul sezonu başı.",
    answer_en: "Artificial swarm steps: 1) Take 2-3 capped brood frames + 1-2 honey frames from strong colony. 2) Place young bees with frames into new hive. 3) Add queen cell or mated queen (or wait 24h for bees to build their own). 4) Provide water and stimulation feeding in new hive. 5) Place at least 3 km away (otherwise bees return). Bees separated without disturbing the main colony form a strong colony in 3-4 weeks. Best time: late spring, start of swarm season.",
    category: "koloni"
  },

  // ─── Hastalık & Sağlık ────────────────────────────────────────────────────────
  {
    id: 37,
    keywords: ["pestisit", "ilaçlama", "zehirlenme", "tarım", "pesticide", "poisoning", "spray", "chemical"],
    question_tr: "Tarım ilaçlaması arıları nasıl etkiler?",
    question_en: "How does pesticide spraying affect bees?",
    answer_tr: "Pestisit zehirlenmesi belirtileri: Kovan önünde yığılmış ölü arı, titreyen/dönen arılar, ani nüfus düşüşü. Koruma önlemleri: 1) Yakın çiftçilerle iletişim kurun, ilaçlama takvimi öğrenin. 2) İlaçlama günü kovan girişini tel kafes veya naylon örtüyle kapat. 3) Sabah erken (arılar çıkmadan) veya akşam geç kapatın, gündüz açın. 4) İlaçlamadan etkilendiyseniz Gıda, Tarım ve Hayvancılık İl Müdürlüğü'ne bildirin (tazminat hakkı). 5) Organik arıcılıkta tampon bölge kritiktir (3 km yarıçap). BeeMora'nın bölge uyarı sistemi ile yakın tarımsal alanlardaki ilaçlama bildirimlerini takip edebilirsiniz.",
    answer_en: "Pesticide poisoning symptoms: Dead bees piled in front of hive, trembling/spinning bees, sudden population drop. Protection measures: 1) Communicate with nearby farmers about spray schedules. 2) Close entrance on spray day with mesh or plastic cover. 3) Close early morning (before bees leave) or late evening, open during day. 4) Report to Agricultural Directorate if affected (compensation rights). 5) Buffer zone is critical for organic beekeeping (3 km radius). BeeMora regional alert system helps track nearby agricultural spraying.",
    category: "hastalık"
  },
  {
    id: 38,
    keywords: ["tropilaelaps", "küçük kovan", "böcek", "küçük kovan böceği", "small hive beetle", "shb"],
    question_tr: "Küçük kovan böceği nedir ve nasıl önlenir?",
    question_en: "What is the small hive beetle and how to prevent it?",
    answer_tr: "Küçük kovan böceği (Aethina tumida) dünyada hızla yayılan bir arı zararlısıdır. Türkiye'de nadir görülmekle birlikte dikkatli olunmalıdır. Belirtiler: Peteklerde bozulma, bal fermente kokusu, küçük kahverengi böcekler. Önleme: 1) Güçlü koloni — işçi arılar böcekleri kontrol altında tutar. 2) Kovan tabanına tuz/yağ tuzağı koy. 3) Toprak zeminde kovan kurma (larva toprakta pupalaşır). 4) Şüpheli durumda bakanlığa bildirin. Bu hastalık ihbar zorunluluğu kapsamındadır.",
    answer_en: "Small hive beetle (Aethina tumida) is a rapidly spreading bee pest. Rare in Turkey but vigilance is needed. Symptoms: Damaged combs, fermented honey smell, small brown beetles. Prevention: 1) Strong colony — workers keep beetles in check. 2) Oil/salt trap on hive floor. 3) Avoid sandy soil locations (larvae pupate in soil). 4) Report to authorities if suspected. This disease is subject to mandatory reporting.",
    category: "hastalık"
  },
  {
    id: 39,
    keywords: ["sağlıklı", "kontrol", "muayene", "inspection", "check", "healthy", "bakış", "gözlem"],
    question_tr: "Kovana nasıl sağlık kontrolü yaparım?",
    question_en: "How do I do a hive health inspection?",
    answer_tr: "Kovan muayene adımları: 1) **Hazırlık**: Tulum, eldiven, maske giy. Duman makinesini çalıştır. 2) **Giriş gözlemi**: Arı trafiği, ölü arı varlığı, dışkı lekeleri. 3) **Kovan açışı**: Üstten duman ver, hafifçe aç. 4) **Çerçeve kontrolü**: Ana arı varlığı (veya yumurta/genç larva), kuluçka düzeni, bal/polen rezervi. 5) **Varroa kontrolü**: Şeker tozu veya alkol yıkama (100 arıda 3'ten fazla = tedavi). 6) **Hastalık belirtisi**: Çökmüş/delikli kapak, anormal koku, şüpheli larva. 7) **Kovan kapatma**: Çerçeveleri yavaşça yerleştir, sıkışma olmadan kapat. Muayene süresi 15-20 dakikayı geçmemeli.",
    answer_en: "Hive inspection steps: 1) Preparation: Wear suit, gloves, veil. Light smoker. 2) Entrance observation: bee traffic, dead bees, fecal staining. 3) Opening: Puff smoke from top, open gently. 4) Frame check: Queen presence (or eggs/young larvae), brood pattern, honey/pollen reserves. 5) Varroa check: sugar shake or alcohol wash (more than 3 per 100 bees = treat). 6) Disease signs: sunken/perforated caps, abnormal smell, suspicious larvae. 7) Closing: Replace frames slowly, close without crushing bees. Inspection shouldn't exceed 15-20 minutes.",
    category: "bakım"
  },

  // ─── Ekipman & Teknoloji ──────────────────────────────────────────────────────
  {
    id: 40,
    keywords: ["duman", "duman makinesi", "smoker", "duman ver", "tüttür", "smoke"],
    question_tr: "Duman makinesini nasıl kullanırım?",
    question_en: "How do I use a smoker?",
    answer_tr: "Duman makinesi kullanımı: 1) **Yakıt**: Kuru ot, pine needles, karton — yanmayan/kimyasal içermeyen malzeme. 2) **Yakma**: Alt kısma ateşle tutuş, körükleyerek alevlendirin. 3) **Duman**: Serinlemiş, yoğun beyaz duman ideal. Sıcak/siyah duman arıyı yakar. 4) **Uygulama**: Kovana 2-3 puf, girişe 1-2 puf. 30 saniye bekleyin. 5) **Kullanım süresi**: Dakikada 3-4 puf yaparak aktif tutun. Neden işe yarar? Duman, arıların alarm feromonunu maskeler ve arılar bal stokunu korumaya geçer (daha sakin olurlar). Aşırı duman vermekten kaçının.",
    answer_en: "Smoker usage: 1) Fuel: dry grass, pine needles, cardboard — non-chemical, natural materials. 2) Lighting: ignite at bottom, pump to flame. 3) Smoke: Cool, dense white smoke is ideal. Hot/black smoke burns bees. 4) Application: 2-3 puffs at hive top, 1-2 at entrance. Wait 30 seconds. 5) Maintenance: Keep active with 3-4 puffs per minute. Why it works: Smoke masks alarm pheromones and bees focus on protecting honey stores (becoming calmer). Avoid over-smoking.",
    category: "ekipman"
  },
  {
    id: 41,
    keywords: ["santrifüj", "bal süzme", "extractor", "süzgeç", "honey extractor", "harvest equipment"],
    question_tr: "Bal süzme ekipmanları neler?",
    question_en: "What honey extraction equipment is needed?",
    answer_tr: "Bal hasat ekipmanları: 1) **Uncapping bıçağı/çatalı**: Peteklerin balmumu kapağını kesmek için. 2) **Santrifüj (ekstraktor)**: El veya motorlu. 2-kovan için 2-çerçeveli, daha büyük üretim için 9-36 çerçeveli radyal santrifüj. 3) **Uncapping tankı**: Balmumuyla karışık balı ayırmak için. 4) **Çift katlı süzgeç**: Mumu ve partikülleri ayırmak için. 5) **Olgunlaştırma tankı (settling tank)**: Balın köpüğünü ve partikülleri yüzeye çıkarmak için (24-48 saat). 6) **Bal kavanozu dolum vanaları**. Ekipman paylaşımı: Arı birliklerinin ortak ekipmanı kiralayabilirsiniz.",
    answer_en: "Honey harvest equipment: 1) Uncapping knife/fork: To remove beeswax cappings. 2) Extractor: Manual or motorized. 2-frame for 2 hives, 9-36 frame radial extractor for larger production. 3) Uncapping tank: To separate honey from wax mix. 4) Double-layer strainer: To remove wax and particles. 5) Settling tank: To bring foam and particles to surface (24-48 hours). 6) Honey jar filling valves. Equipment sharing: You can rent shared equipment from beekeeping associations.",
    category: "ekipman"
  },
  {
    id: 42,
    keywords: ["gsm", "internet", "bağlantı", "4g", "lte", "wifi", "connectivity", "signal", "sinyal", "lora"],
    question_tr: "BeeMora internet bağlantısı olmayan yerlerde çalışır mı?",
    question_en: "Does BeeMora work in places without internet?",
    answer_tr: "BeeMora farklı bağlantı seçenekleri sunar: 1) **WiFi**: Evde veya yakınında WiFi varsa ideal. 2) **GSM/4G**: Yerleşim dışı alanlarda 4G şebekesi üzerinden çalışır (SIM kart gerekir). 3) **LoRa**: Uzak bölgeler için uzun menzilli, düşük güç tüketen ağ protokolü. Şebeke olmayan bölgelerde lokal veri depolama yapar, bağlantı sağlandığında otomatik senkronize eder. Cihaz satın alırken kullanacağınız bağlantı tipini belirtin. Türkiye'nin neredeyse her bölgesinde GSM kapsama alanı mevcuttur.",
    answer_en: "BeeMora offers different connectivity options: 1) WiFi: Ideal if home or WiFi is nearby. 2) GSM/4G: Works via 4G network in rural areas (SIM card required). 3) LoRa: Long-range, low-power network protocol for remote areas. In areas without network, stores data locally and auto-syncs when connection is available. Specify the connection type you'll use when purchasing. GSM coverage is available in almost all regions of Turkey.",
    category: "beemora"
  },

  // ─── Üretim & Satış ───────────────────────────────────────────────────────────
  {
    id: 43,
    keywords: ["bal", "satış", "satmak", "pazar", "market", "sell", "sell honey", "pazarlama", "marketing"],
    question_tr: "Balımı nerede ve nasıl satarım?",
    question_en: "Where and how do I sell my honey?",
    answer_tr: "Bal satış kanalları: 1) **Doğrudan satış**: Çiftçi pazarları, arı fuarları, ev satışı. En yüksek kâr marjı. 2) **Yerel dükkanlar**: Bakkal, organik gıda dükkanları, kuruyemiş. 3) **Online satış**: Instagram, Facebook, Trendyol, Gittigidiyor, kendi web sitesi. 4) **Toptancı**: Toplu satış, düşük birim fiyat. 5) **Otel ve restoranlar**: Sürekli müşteri ilişkisi. Markalama önerileri: Güzel etiket, üretim yeri, flora türü, hasat tarihi bilgisi kaliteyi artırır. Gıda kodeksine uygun etiket zorunludur. Belgeli (analiz raporu) bal daha yüksek fiyattan satılır.",
    answer_en: "Honey sales channels: 1) Direct sales: Farmers markets, bee fairs, home sales — highest profit margin. 2) Local shops: Grocery, organic food, nut stores. 3) Online: Instagram, Facebook, marketplaces, own website. 4) Wholesalers: Bulk sales, lower unit price. 5) Hotels and restaurants: Ongoing customer relationship. Branding tips: Good label, production location, flora type, harvest date info adds value. Compliant labeling is mandatory. Certified honey (analysis report) sells at higher prices.",
    category: "üretim"
  },
  {
    id: 44,
    keywords: ["kristalize", "kristalleşme", "katılaşma", "donma", "crystallize", "granulate", "solid honey"],
    question_tr: "Balım kristalleşti, bozuldu mu?",
    question_en: "My honey crystallized, is it spoiled?",
    answer_tr: "Kristalleşme balın bozulduğunun değil, **doğal ve kaliteli** olduğunun göstergesidir! Saf bal er ya da geç kristalleşir. Nedeni: baldaki glikozun doymuş çözelti oluşturması. Erime yöntemi: 1) Kavanozu 40°C'yi geçmeyen ılık suya koy (ısı eşanjörü veya tencere). 2) Hiç kaynatmaya veya mikrodalga fırına koyma — enzimleri ve antioksidanları yok eder. 3) Kristal bal ürün olarak da satılabilir (yayma bal). Kristalleşme hızı: Kolza balı çok hızlı, çam balı çok yavaş, akasya balı yavaş kristalleşir.",
    answer_en: "Crystallization is a sign that honey is natural and high quality, NOT spoiled! Pure honey crystallizes sooner or later. Cause: glucose in honey forms a supersaturated solution. Melting method: 1) Place jar in warm water not exceeding 40°C. 2) Never boil or microwave — destroys enzymes and antioxidants. 3) Crystallized honey can also be sold as a product (spreadable honey). Crystallization speed: rapeseed honey very fast, pine honey very slow, acacia honey slow.",
    category: "üretim"
  },
  {
    id: 45,
    keywords: ["analiz", "test", "sertifika", "gıda", "kalite", "analysis", "certificate", "quality", "lab"],
    question_tr: "Bal analizi neden önemlidir?",
    question_en: "Why is honey analysis important?",
    answer_tr: "Bal analizi hem yasal zorunluluk hem de kalite güvencesidir. Analiz kapsamı: 1) **Fizikokimyasal**: Nem, pH, HMF (işlenme sıcaklığı göstergesi), diastaz aktivitesi, elektriksel iletkenlik. 2) **Botanik orijin**: Polen analizi ile bal türü doğrulanır. 3) **Mikrobiyoloji**: Yeast, küf, patojenik bakteri. 4) **Pestisit kalıntısı**: Özellikle organik belgesi için kritik. Analiz yaptıracağınız kurumlar: TÜBİTAK MAM, üniversite gıda mühendisliği bölümleri, akredite özel laboratuvarlar. Analiz maliyeti: 300–800 ₺ (parametreye göre). Belgeli bal premium fiyata satılır.",
    answer_en: "Honey analysis is both a legal requirement and quality assurance. Analysis scope: 1) Physicochemical: moisture, pH, HMF (processing temperature indicator), diastase activity, electrical conductivity. 2) Botanical origin: Pollen analysis verifies honey type. 3) Microbiology: yeast, mold, pathogenic bacteria. 4) Pesticide residue: especially critical for organic certification. Testing institutions: TUBITAK MAM, university food engineering departments, accredited private labs. Cost: 300–800 ₺ (depending on parameters). Certified honey sells at premium price.",
    category: "üretim"
  },

  // ─── BeeMora Platform ─────────────────────────────────────────────────────────
  {
    id: 46,
    keywords: ["dashboard", "panel", "ekran", "arayüz", "interface", "app", "uygulama", "mobil", "mobile"],
    question_tr: "BeeMora uygulamasında neler yapabiliyorum?",
    question_en: "What can I do in the BeeMora app?",
    answer_tr: "BeeMora uygulamasının temel özellikleri: 1) **Gerçek zamanlı izleme**: Sıcaklık, nem, ses, ağırlık anlık görüntüleme. 2) **Grafik & Analizler**: Geçmişe dönük trend analizi, custom tarih aralığı. 3) **Alarmlar**: Eşik değer bildirimleri (push, SMS, e-posta). 4) **Kovan yönetimi**: Kovan ekleme, düzenleme, aktivite günlüğü. 5) **Harita**: Kovan konumları ve GPS takibi. 6) **Raporlar**: Sezonluk özet, bal verimi tahmini. 7) **Çoklu cihaz**: Mobil ve web tarayıcı desteği. 8) **Bildirim geçmişi**: Geçmiş alarmları incele. Tüm veriler bulutta güvenle saklanır.",
    answer_en: "Core BeeMora app features: 1) Real-time monitoring: Temperature, humidity, sound, weight live view. 2) Charts & Analysis: Historical trend analysis, custom date ranges. 3) Alarms: Threshold notifications (push, SMS, email). 4) Hive management: Add hives, edit, activity log. 5) Map: Hive locations and GPS tracking. 6) Reports: Seasonal summary, honey yield estimates. 7) Multi-device: Mobile and web browser support. 8) Notification history: Review past alerts. All data is securely stored in the cloud.",
    category: "beemora"
  },
  {
    id: 47,
    keywords: ["güncelleme", "update", "firmware", "yazılım", "software", "version", "sürüm", "yeni"],
    question_tr: "BeeMora sensörü nasıl güncellenir?",
    question_en: "How do I update the BeeMora sensor?",
    answer_tr: "BeeMora sensör güncellemeleri OTA (Over-the-Air — Havadan Güncelleme) yöntemiyle yapılır. Güncelleme süreci: 1) Cihaz internete bağlıyken otomatik olarak güncelleme kontrolü yapar. 2) Yeni sürüm varsa uygulama üzerinden bildirim alırsınız. 3) 'Güncelle' butonuna tıklayın, cihaz 2-5 dakikada güncellenir. 4) Güncelleme sırasında cihazı kapatmayın. Manuel güncelleme: USB bağlantısıyla da yapılabilir (teknik destek gerektirebilir). Güncel firmware önemlidir — hata düzeltmeleri ve yeni özellikler içerir.",
    answer_en: "BeeMora sensor updates are done via OTA (Over-the-Air). Update process: 1) Device automatically checks for updates when connected to internet. 2) You receive a notification through the app when a new version is available. 3) Click 'Update' — device updates in 2-5 minutes. 4) Don't power off during update. Manual update: Can also be done via USB (may require technical support). Keeping firmware current is important — contains bug fixes and new features.",
    category: "beemora"
  },
  {
    id: 48,
    keywords: ["çoklu", "birden fazla", "kovan sayısı", "kaç", "multiple", "how many", "fleet", "büyük ölçek", "scale"],
    question_tr: "Kaç kovana kadar BeeMora kullanabilirim?",
    question_en: "How many hives can I manage with BeeMora?",
    answer_tr: "BeeMora'nın çoklu kovan desteği ölçeklenebilir bir yapıya sahiptir. 5 kovandan 500+ kovana kadar tek platformdan yönetim mümkündür. Büyük ölçekli kullanım özellikleri: 1) Kovan grupları ve lokasyon bazlı filtreleme. 2) Toplu alarm yönetimi. 3) API entegrasyonu (büyük işletmeler için). 4) Çoklu kullanıcı ve rol bazlı erişim. 5) Özel raporlama ve Excel/CSV dışa aktarma. Kurumsal kullanım için özel fiyatlandırma seçenekleri mevcuttur. İletişime geçerek işletmenize özel çözüm alabilirsiniz.",
    answer_en: "BeeMora's multi-hive support has a scalable architecture. Management from 5 hives to 500+ is possible from a single platform. Large-scale features: 1) Hive groups and location-based filtering. 2) Bulk alarm management. 3) API integration (for large enterprises). 4) Multi-user and role-based access. 5) Custom reporting and Excel/CSV export. Custom pricing options available for enterprise use. Contact us for a solution tailored to your operation.",
    category: "beemora"
  },

  // ─── Genel Bilgi ──────────────────────────────────────────────────────────────
  {
    id: 49,
    keywords: ["lokasyon", "yer", "arılık", "konum", "location", "place", "site", "yerleşim", "ideal yer"],
    question_tr: "Kovan için ideal lokasyon nasıl seçilir?",
    question_en: "How to choose an ideal location for hives?",
    answer_tr: "İdeal kovan lokasyonu kriterleri: 1) **Yön**: Güneydoğu bakan, sabah güneşi alan konum (arıların erken aktivasyonu için). 2) **Rüzgar koruması**: Arkasında ağaç/duvar. 3) **Gölge**: Öğleden sonra gölge varsa yaz sıcağında avantaj. 4) **Su kaynağı**: 500 m içinde temiz su (arılar günde 1 litre su tüketir). 5) **Uçuş yolu**: Kovan girişi önünde 3 metre açık alan. 6) **Komşu mesafesi**: Yasal düzenlemeye göre yerleşim alanından uzaklık (50-100 m). 7) **Flora**: 3 km yarıçapta zengin çiçeklenme. 8) **Tarım ilaçlaması**: Tarlalara en az 1-2 km mesafe. BeeMora harita özelliğiyle ideal lokasyonları işaretleyebilirsiniz.",
    answer_en: "Ideal hive location criteria: 1) Orientation: Southeast-facing, morning sun (early bee activation). 2) Wind protection: Trees/walls behind. 3) Shade: Afternoon shade is advantageous in summer heat. 4) Water source: Clean water within 500m (bees consume 1 liter/day). 5) Flight path: 3m clear space in front of entrance. 6) Neighbor distance: Distance from settlements per local regulations (50-100m). 7) Flora: Rich blooming within 3 km radius. 8) Pesticides: At least 1-2 km from farmland. Use BeeMora map feature to mark ideal locations.",
    category: "genel"
  },
  {
    id: 50,
    keywords: ["arıcılık", "eğitim", "kurs", "sertifika", "öğren", "training", "course", "certificate", "learn", "birlik", "dernek"],
    question_tr: "Arıcılık eğitimi nerede alabilirim?",
    question_en: "Where can I get beekeeping training?",
    answer_tr: "Arıcılık eğitimi kaynakları: 1) **Tarım ve Orman Bakanlığı**: İl tarım müdürlükleri ücretsiz veya düşük ücretli kurs düzenler. 2) **Arı Yetiştiricileri Birlikleri**: Türkiye genelinde il bazında birlikler mevcuttur. 3) **Ziraat Fakülteleri**: Üniversitelerin zootekni/arıcılık bölümleri. 4) **Halk Eğitim Merkezleri**: MEB bünyesinde arıcılık kursları. 5) **Online kaynaklar**: YouTube kanalları, arıcılık forumları, BeeMora Blog. 6) **Arıcı yanında staj**: En pratik yöntem, deneyimli bir arıcının yanında çalışmak. Teorik eğitim + pratik uygulama kombinasyonu en etkili öğrenim yöntemidir.",
    answer_en: "Beekeeping training resources: 1) Ministry of Agriculture and Forestry: Provincial offices offer free or low-cost courses. 2) Beekeeping Associations: Province-based associations across Turkey. 3) Agricultural Faculties: Zootechnics/beekeeping departments at universities. 4) Public Education Centers: Beekeeping courses under MEB. 5) Online resources: YouTube channels, beekeeping forums, BeeMora Blog. 6) Apprenticeship with a beekeeper: Most practical method — working alongside an experienced beekeeper. Theory + hands-on practice combination is most effective.",
    category: "genel"
  },
];

export default beeKnowledge;
