// ─── Toph's Forge SW v3 ──────────────────────────────────────────────────────
const CACHE_NAME = 'tophs-forge-v3';

// Rutas relativas al scope del SW — funciona sin importar el subpath del repo
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
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

  // API calls → siempre red, nunca cachear
  if (
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('api.scryfall.com') ||
    url.pathname.includes('/api/')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos → cache first, fallback a red
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('./index.html')); // fallback offline
    })
  );
});
