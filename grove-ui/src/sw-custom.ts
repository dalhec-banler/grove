/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute, setDefaultHandler } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// Explicit install + activate handlers for Chrome PWA installability detection
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Take control immediately — required for PWA installability on first visit
clientsClaim();

// Precache all built assets (manifest injected by workbox at build time)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Navigation fallback — serve index.html for all navigation requests
const navHandler = createHandlerBoundToURL('/apps/grove/index.html');
registerRoute(
  new NavigationRoute(navHandler, {
    denylist: [/^\/~\//, /^\/apps\/grove\/desk\//],
  }),
);

// The live Urbit channel (SSE + poke PUTs) and all scries must never be
// cached — caching the never-ending text/event-stream stalls the fetch and
// severs live updates (breaking upload completion). NetworkOnly passes both
// GET and PUT straight through. No BackgroundSync here: uploads are not
// idempotent, so blindly replaying failed channel PUTs would duplicate files.
registerRoute(({ url }) => url.pathname.startsWith('/~/'), new NetworkOnly());

// Blob downloads are large and one-shot — caching them bloats the runtime
// cache and evicts the precache (QuotaExceededError). Always go to network.
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/grove-file/') ||
    url.pathname.startsWith('/grove-remote-file/') ||
    url.pathname.startsWith('/grove-share/'),
  new NetworkOnly(),
);

// Default handler — ensures ALL fetch events get a respondWith() call, which
// Chrome requires for beforeinstallprompt to fire. Workbox routes above handle
// precached assets, navigation, the channel, and blobs; this catches
// everything else with a network-only pass-through (no caching).
setDefaultHandler(new NetworkOnly());
