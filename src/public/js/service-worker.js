const CACHE_NAME = "xuân-trường-cache-v2";  // Cập nhật tên cache để force reload
const urlsToCache = [
    "/",
    "/css/style.css",
    "/images/1.jpeg",
    "/images/2.jpg",
    "/images/3.jpeg",
    "/images/rau%20xà%20lách.jpg",
    "/images/Picture1.jpg",
    "/images/logo.jpg",
    "/manifest.json"  // Đảm bảo đúng đường dẫn, có thể bỏ `/js/`
];

// Caching tài nguyên khi install
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Caching resources");
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error("Cache failed", err))
    );
});

// Lấy dữ liệu từ cache khi offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request)
                    .then(networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            throw new Error("Fetch failed");
                        }
                        return networkResponse;
                    });
            })
            .catch(() => caches.match("/offline.html"))  // Trả về file offline nếu không có mạng
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
