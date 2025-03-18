const CACHE_NAME = "pwa-cache-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Forces new SW to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "images/icons/android-chrome-192x192.png",
        "images/icons/android-chrome-512x512.png",
      ]);
    })
  );
});

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
      .then(() => self.clients.claim()) // Forces all open tabs to use the new SW
  );
});

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
          if (event.request.method === "GET" && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(event.request)); // Serve from cache if offline
    })
  );
});
