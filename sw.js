// Nama cache (versi bisa diupdate untuk cache busting) harus diupdate setiap kali melakukan perubahan,
// karena menjadi parameter untuk mengganti cache yang lama menjadi yang terbaru 
const CACHE_NAME = 'kalkulator-pwa-v9';

// Daftar file yang akan di-cache (Yang akan di cache untuk akses ketika offline)
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/kalkulator-icon.png',
  '/favicon.ico'
];

// Event saat Service Worker di-install
self.addEventListener('install', (event) => {
  event.waitUntil(
    // Buka cache dengan nama CACHE_NAME
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache terbuka');
        // Tambahkan semua asset ke cache
        return cache.addAll(ASSETS);
      })
  );
});

// Event saat ada request (fetch) (Mengambil dari cache yang pertama: versi 1),
// Cek dulu apakah ada cache, kalo tidak ada ambil dari internet, kalo tidak ada internet ambil dari cache yang pertama

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     // Cek apakah request ada di cache
//     caches.match(event.request)
//       .then(response => {
//         // Jika ada di cache, kembalikan dari cache
//         // Jika tidak, fetch dari network
//         return response || fetch(event.request);
//       })
//   );
// });

// Solusi ketika update version
//  Alurnya -> 1.Coba ambil cache terbaru dari internet, 2. 
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Buat ngecek appakah ada request di cache
    caches.match(event.request).then((response) => {
      // Jika ada di cache, kembalikan dari cache
      // Jika tidak ada,fetch dari network
      return fetch(event.request).then((response) => {
        // Check kalau valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 
        var responseToCache = response.clone();

        // 
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseToCache);
        });
        return response
      });
    })
  );
});
