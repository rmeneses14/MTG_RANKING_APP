// ─── Antares SW — generado para MTG Deck Analyzer - Toph's Forge ────────────
const CACHE_NAME = 'tophs-forge-v1';

// Archivos a cachear para modo offline
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Fuentes de Google Fonts
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&display=swap',
];

// Instalar: pre-cachear assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para assets estáticos, network-first para API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Llamadas a la API de Anthropic / backend → siempre red (no cachear)
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('anthropic.com') ||
    url.hostname.includes('api.scryfall.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos → cache primero, fallback a red
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cachear respuesta nueva
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
