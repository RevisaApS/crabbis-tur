/* Crabbis tur offline helper. The page is fetched fresh when there is internet (so updates arrive) and comes from
   the cache when there is not. f6ccf7bbb0 is replaced by publish_site.py so each publish gets a clean cache. */
const CACHE = 'crabbis-tur-f6ccf7bbb0';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const keep = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => keep(e.request, r))
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => keep(e.request, res))));
  }
});
