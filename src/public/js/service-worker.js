const CACHE_NAME = "xuân-trường-cache-v3";  // Cập nhật version để force reload
const urlsToCache = [
    "/",
    "/css/style.css",
    "/images/1.jpeg",
    "/images/2.jpg",
    "/images/3.jpeg",
    "/images/rau%20xà%20lách.jpg",
    "/images/Picture1.jpg",
    "/images/logo.jpg",
    "/manifest.json",   // Đảm bảo đúng đường dẫn
    "/offline.html"
];

// Caching tài nguyên khi install
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            try {
                console.log("Caching resources...");
                await cache.addAll(urlsToCache);
                console.log("Resources cached successfully!");
            } catch (err) {
                console.error("Cache failed", err);
            }
        })
    );
});

// Lấy dữ liệu từ cache khi offline
self.addEventListener("fetch", event => {
    console.log("Fetching:", event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                console.log("Cache hit:", response);
                return response || fetch(event.request);
            })
            .catch(() => {
                console.warn("Offline! Serving offline.html");
                return caches.match("/offline.html");
            })
    );
});


// Xóa cache cũ khi cập nhật service worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME).map(cache => caches.delete(cache))
            );
        })
    );
});
