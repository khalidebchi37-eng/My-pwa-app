// خدمة العامل (Service Worker) لتطبيق MyBusiness

const CACHE_NAME = 'mybusiness-v1';
const OFFLINE_URL = '/offline.html';

// الملفات التي سيتم تخزينها مؤقتاً
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات وتقديم نسخة من الكاش
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجدت نسخة في الكاش، قدمها
        if (response) {
          return response;
        }

        // وإلا، أحضرها من الشبكة
        return fetch(event.request)
          .then((networkResponse) => {
            // لا تخزن طلبات غير ناجحة
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // نسخ الاستجابة وتخزينها للمرة القادمة
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // إذا فشلت الشبكة والكاش، قدم صفحة عدم الاتصال
            return caches.match(OFFLINE_URL);
          });
      })
  );
});
