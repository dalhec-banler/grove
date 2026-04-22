// Minimal service worker — no workbox, no precaching.
// Just enough to satisfy PWA install criteria.
self.addEventListener('install', function() {
  self.skipWaiting();
});
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function(event) {
  // Let the browser handle manifest and icon requests directly —
  // SW interception can prevent Chrome from detecting the manifest.
  var url = event.request.url;
  if (url.endsWith('manifest.json') || url.endsWith('.png') || url.endsWith('.svg')) return;
  event.respondWith(fetch(event.request));
});
