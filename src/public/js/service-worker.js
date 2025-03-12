const CACHE_NAME = "xuân-trường-cache-v1";
const urlsToCache = [
    "/",
    "/css/style.css",
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/rau_xa_lach.jpg",
    "/images/Picture1.jpg",
    "/images/logo.jpg",
    "/manifest.json"    
];

// Caching tài nguyên khi install
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Caching resources");
                return cache.addAll(urlsToCache);
            })
    );
});

// Lấy dữ liệu từ cache khi offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
