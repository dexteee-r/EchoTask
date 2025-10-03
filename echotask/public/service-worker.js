const CACHE = "echotask-v8";
const ASSETS = [ "/", "/index.html", "/manifest.webmanifest" ];

// install
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// activate (clean old caches)
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// stale-while-revalidate
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // cache uniquement les fichiers statiques (assets/ et root)
        if (/\.(js|css|png|svg|webp|ico|json)$/i.test(url.pathname) || url.pathname.startsWith("/assets/")) {
          const copy = res.clone();
          caches.open("echotask-v1").then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match("/"));
    })
  );
});

