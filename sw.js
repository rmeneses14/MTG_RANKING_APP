// ─── Antares SW — Toph's Forge ───────────────────────────────────────────────
const CACHE_NAME = 'tophs-forge-v2';

const ASSETS = [
  '/MTG_RANKING_APP/',
  '/MTG_RANKING_APP/index.html',
  '/MTG_RANKING_APP/manifest.json',
  '/MTG_RANKING_APP/icon-192x192.png',
  '/MTG_RANKING_APP/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls → siempre red
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('api.scryfall.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos → cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
