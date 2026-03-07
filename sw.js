/**
 * iQuizPros Service Worker — Phase 8
 *
 * Caching strategy:
 *   Shell assets   → cache-first (installed on SW activation)
 *   JS/CSS/images  → cache-first with runtime caching (lazy-fill on first request)
 *   Templates JSON → stale-while-revalidate (show cached, update in background)
 *   Navigation     → network-first, fallback to cached index.html (SPA offline mode)
 *   Cross-origin   → not intercepted (Firebase SDK handles its own offline persistence)
 */

'use strict';

var CACHE_VERSION = 'v8.2';  // bumped: CSP fix (connect-src: replaced invalid firebase* wildcard with explicit entries)
var SHELL_CACHE    = 'iqp-shell-'     + CACHE_VERSION;
var RUNTIME_CACHE  = 'iqp-runtime-'   + CACHE_VERSION;
var TEMPLATE_CACHE = 'iqp-templates-' + CACHE_VERSION;

// App shell — minimal set cached on install so the app works offline immediately
var SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/images/default-personality.webp'
];

// ── Install ──────────────────────────────────────────────────────────────────
// Cache the app shell.  Use skipWaiting() so the new SW takes control
// immediately without waiting for existing tabs to close.
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(function (cache) { return cache.addAll(SHELL_ASSETS); })
      .then(function () { return self.skipWaiting(); })
      .catch(function (err) {
        console.warn('[SW] Shell cache install error:', err);
        return self.skipWaiting(); // still activate even on cache failure
      })
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
// Clean up caches from previous SW versions, then claim all open clients.
self.addEventListener('activate', function (event) {
  var validCaches = [SHELL_CACHE, RUNTIME_CACHE, TEMPLATE_CACHE];
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) { return validCaches.indexOf(k) === -1; })
            .map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Only intercept GET requests
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Skip cross-origin requests — Firebase SDK (googleapis.com, identitytoolkit.googleapis.com,
  // analytics, etc.) handles its own offline persistence.  Do not intercept.
  if (url.origin !== self.location.origin) return;

  // Skip the service worker itself and chrome-extension URLs
  if (url.pathname === '/sw.js') return;

  // ── Templates (quiz JSON) — stale-while-revalidate ──────────────────────
  // Show cached data immediately, then update cache in background for next visit.
  if (url.pathname.startsWith('/templates/')) {
    event.respondWith(staleWhileRevalidate(req, TEMPLATE_CACHE));
    return;
  }

  // ── Navigation requests — network-first, SPA fallback ───────────────────
  // Try the network so the user always gets the latest index.html.
  // If offline, serve the cached shell (index.html).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(function () {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // ── Static assets — cache-first ─────────────────────────────────────────
  // JS, CSS, images, fonts, sounds — long-lived assets with content hashes.
  // Serve from cache; on miss, fetch and cache for next time.
  if (/\.(js|css|webp|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp3|wav|ogg)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  // All other same-origin requests: network-only (API calls, etc.)
});

// ── Cache helpers ─────────────────────────────────────────────────────────────

function cacheFirst(request) {
  return caches.open(RUNTIME_CACHE).then(function (cache) {
    return cache.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        if (response && response.ok) {
          // Clone before consuming — response body can only be read once
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function () {
        // Offline fallback: return default image for any image request
        if (/\.(webp|png|jpg|jpeg|gif|svg)(\?.*)?$/.test(request.url)) {
          return caches.match('/assets/images/default-personality.webp');
        }
        // No fallback for other asset types
      });
    });
  });
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (cached) {
      // Start network fetch regardless of cache hit
      var networkFetch = fetch(request).then(function (response) {
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(function () {
        // Network failed — return cached version if available
        return cached;
      });
      // Return cached immediately if available, otherwise wait for network
      return cached || networkFetch;
    });
  });
}

// ── Background Sync ───────────────────────────────────────────────────────────
// When connectivity returns, notify all open clients to flush their
// locally-queued quiz history entries to Firestore.
// (The actual Firestore write happens in the client — the SW just signals it.)
self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-quiz-history') {
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(function (clients) {
          clients.forEach(function (client) {
            client.postMessage({ type: 'SYNC_QUIZ_HISTORY' });
          });
        })
    );
  }
});
