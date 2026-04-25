// BioLab Interactive — Service Worker v1
const CACHE_NAME = 'biolab-v2';

const ASSETS = [
  './',
  './biolab.html',
  './biolab_en.html',
  './mapa_misiones.html',
  './competencia_grupal.html',
  './citopolis_hub.html',
  './Citopolis_Interactivo_v3.html',
  './citopolis_parp.html',
  './citopolis_inmuno.html',
  './citopolis_p53.html',
  './citopolis_en.html',
  './nanomision.html',
  './nanomision_en.html',
  './oro_caballo_troya.html',
  './DNA_Double_Helix_Interactive.html',
  './biomol_estructura.html',
  './biomol_replicacion.html',
  './biomol_transcripcion.html',
  './biomol_traduccion.html',
  './biomol_mutaciones.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache all game files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML (get updates fast), cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // HTML files: network first, fall back to cache
  if (event.request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: cache first, fall back to network
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
