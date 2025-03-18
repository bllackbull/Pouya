const CACHE_NAME = "pwa-cache-v1.3";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "images/icons/android-chrome-192x192.png",
  "images/icons/android-chrome-512x512.png",
];

// Install event: Cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // Always fetch a fresh index.html
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Only cache GET requests & successful responses
          if (event.request.method === "GET" && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(event.request)); // Serve from cache if offline
    })
  );
});

// Activate event: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Force clients to use new service worker
  );
});
