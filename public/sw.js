// sw.js
const VERSION = "v2";
const STATIC_CACHE = `beemora-static-${VERSION}`;
const RUNTIME_CACHE = `beemora-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/beemora-logo.svg",
  "/manifest.json",
];

// Tüm cache'lerin listesi (temizlik için)
const EXPECTED_CACHES = [STATIC_CACHE, RUNTIME_CACHE];

// ============================================================
// INSTALL — statik varlıkları önbelleğe al
// ============================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // addAll atomiktir; biri başarısız olursa hepsi başarısız olur.
      // Kritik olmayan varlıkları ayrı ayrı eklemek daha güvenli.
      await Promise.all(
        STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
          } catch (err) {
            console.warn(`[SW] ${url} önbelleğe alınamadı:`, err);
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

// ============================================================
// ACTIVATE — eski cache'leri temizle
// ============================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Navigation Preload — mümkünse hızlandırma için aç
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !EXPECTED_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

// ============================================================
// FETCH — istek türüne göre strateji
// ============================================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sadece GET + aynı origin
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // API istekleri — her zaman network (cache'leme)
  if (url.pathname.startsWith("/api/")) return;

  // Chrome extension vs. diğer özel şemaları atla
  if (!url.protocol.startsWith("http")) return;

  // Navigation istekleri: Network-first + offline fallback
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  // Diğer GET istekleri: Stale-while-revalidate
  event.respondWith(handleAsset(request));
});

/**
 * Navigation (sayfa yükleme) — network-first
 */
async function handleNavigation(event) {
  try {
    // Varsa preload response kullan
    const preload = await event.preloadResponse;
    if (preload) {
      updateCache(event.request, preload.clone());
      return preload;
    }

    const networkResponse = await fetch(event.request);
    updateCache(event.request, networkResponse.clone());
    return networkResponse;
  } catch (err) {
    // Offline — önce cache'deki sayfayı, yoksa offline sayfasını döndür
    const cached = await caches.match(event.request);
    if (cached) return cached;

    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("Çevrimdışı", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Statik varlıklar — stale-while-revalidate
 * (cache'den anında döner, arkada günceller)
 */
async function handleAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached); // offline fallback

  return cached || networkFetch;
}

/**
 * Cache güncelleme yardımcısı
 */
async function updateCache(request, response) {
  if (!response || !response.ok) return;
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response);
  } catch (err) {
    console.warn("[SW] Cache güncellenemedi:", err);
  }
}

// ============================================================
// PUSH — bildirim
// ============================================================
self.addEventListener("push", (event) => {
  const defaultData = {
    title: "BeeMora",
    body: "Yeni bildirim",
    icon: "/beemora-logo.svg",
    badge: "/beemora-logo.svg",
    url: "/panel",
    tag: "hexora-alert",
  };

  let data = defaultData;

  if (event.data) {
    try {
      data = { ...defaultData, ...event.data.json() };
    } catch {
      data = { ...defaultData, body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    tag: data.tag,
    renotify: Boolean(data.renotify),
    requireInteraction: Boolean(data.requireInteraction),
    timestamp: Date.now(),
    data: {
      url: data.url,
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: "open", title: "Paneli Aç" },
      { action: "dismiss", title: "Kapat" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ============================================================
// NOTIFICATION CLICK
// ============================================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/panel";
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Aynı URL'de zaten açık bir pencere varsa odaklan
      for (const client of windowClients) {
        if (client.url === absoluteUrl && "focus" in client) {
          return client.focus();
        }
      }

      // Aynı origin'de açık bir pencere varsa oraya yönlendir
      for (const client of windowClients) {
        if (
          new URL(client.url).origin === self.location.origin &&
          "navigate" in client
        ) {
          await client.navigate(absoluteUrl);
          return client.focus();
        }
      }

      // Hiçbiri yoksa yeni pencere aç
      return self.clients.openWindow(absoluteUrl);
    })(),
  );
});

// ============================================================
// MESSAGE — sayfadan SW'ye komut (örn. hemen güncelle)
// ============================================================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
