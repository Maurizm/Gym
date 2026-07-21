const CACHE_NAME = 'gymapp-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/reset.css',
  '/css/theme.css',
  '/css/components.css',
  '/js/app.js',
  '/js/data/routine.json',
  '/js/modules/storage.js',
  '/js/modules/timer.js',
  '/js/modules/workout.js',
  '/js/modules/progress.js',
  '/js/modules/week-phase.js',
  '/js/views/home.js',
  '/js/views/workout-session.js',
  '/js/views/history.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Use cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
