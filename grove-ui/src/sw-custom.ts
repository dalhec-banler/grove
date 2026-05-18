/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute, setDefaultHandler } from 'workbox-routing';
import { NetworkOnly, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

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

// Background sync — queue failed channel PUT requests for retry when online
const pokeSync = new BackgroundSyncPlugin('grove-poke-queue', {
  maxRetentionTime: 24 * 60, // retain for 24 hours
});

registerRoute(
  ({ url }) => url.pathname.includes('/~/channel/'),
  new NetworkOnly({ plugins: [pokeSync] }),
  'PUT',
);

// Default handler — ensures ALL fetch events get a respondWith() call,
// which Chrome requires for beforeinstallprompt to fire. Workbox routes
// above handle precached assets, navigation, and channel PUTs; this
// catches everything else with a network-first pass-through.
setDefaultHandler(new NetworkFirst());
