const CACHE_NAME = 'janu-bhai-os-v1';
const STATIC_ASSETS = [
  '/',
  '/app/home',
  '/app/wallet',
  '/favicon.png',
  '/icon-192.png',
  // In a real production build, Next.js generates hashed CSS/JS chunks.
  // We rely on standard browser caching for those, but cache the app shell routes.
];

// Install Event: Cache core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache, adding static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network First, falling back to cache (Stale-While-Revalidate pattern for shell)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  // Ignore API requests and Supabase requests from service worker caching
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If we get a valid response, clone it and cache it for offline use
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), return cached version
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If the request is for a document (HTML) and it's not in cache, fallback to offline UI if we had one
          if (event.request.mode === 'navigate') {
            return caches.match('/app/home');
          }
        });
      })
  );
});
