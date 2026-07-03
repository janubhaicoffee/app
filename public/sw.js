const STATIC_CACHE = "jbc-pos-v1";

const STATIC_PATTERNS = [
  /\/_next\/static\//,
  /\/icon\.(png|svg|ico)$/,
  /\/logo\.(png|svg)$/,
  /\/favicon\.ico$/,
];

const POS_PATHS = ["/pos", "/api/pos", "/_next/static", "/icon", "/logo", "/favicon"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isPosRequest(url) {
  return POS_PATHS.some((p) => url.pathname.startsWith(p));
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    return cached || new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.headers.get("accept")?.includes("application/json")) {
      return new Response(JSON.stringify({ data: null, error: "offline", offline: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (!isPosRequest(url)) return;

  if (STATIC_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "clear-cache") {
    caches.delete(STATIC_CACHE);
  }
});
