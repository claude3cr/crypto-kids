// Minimal offline cache so "Add to Home Screen" keeps working with no network.
// Bump CACHE when you change any shell file.
const CACHE = 'crypto-kids-v1';
const SHELL = [
  './', './index.html', './style.css?v=1', './app.js?v=1', './audio.js',
  './js/games/index.js', './js/games/bull-or-bear.js',
  './manifest.webmanifest', './icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// cache-first: instant load, fully offline once cached
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
