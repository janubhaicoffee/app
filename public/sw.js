self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip non-HTTP(S) requests and API calls
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached if available, otherwise fetch
      return cached || fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok && url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|avif|woff2?)$/)) {
          const clone = response.clone();
          caches.open('static-v1').then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback for page navigations
      if (request.mode === 'navigate') {
        return caches.match('/offline');
      }
      return new Response('Offline', { status: 503 });
    }),
  );
});
