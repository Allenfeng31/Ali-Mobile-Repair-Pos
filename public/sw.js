// ─── Ali Mobile Repair POS — Service Worker ──────────────────────────
// Handles Web Push notifications and offline caching for PWA behavior.

const CACHE_NAME = 'ali-pos-v1';

// ── Install ──────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// ── Push ─────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { body: event.data ? event.data.text() : 'New message' };
  }

  const title = payload.title || 'New Customer Chat';
  const body = payload.body || 'You have a new message';
  const url = payload.url || '/admin/chat';
  const unreadCount = payload.unreadCount || 1;

  const options = {
    body,
    icon: '/icon-192x192.png',
    badge: '/badge-monochrome.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url },
  };

  // Set app badge count if supported (iOS 16.4+, Android)
  // Wrapped in try/catch — some older browsers crash if API is absent
  try {
    if (navigator.setAppBadge) {
      navigator.setAppBadge(unreadCount).catch(() => {});
    } else if (self.navigator && self.navigator.setAppBadge) {
      self.navigator.setAppBadge(unreadCount).catch(() => {});
    }
  } catch (_) {
    // Badge API not supported — fail silently
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Clear app badge on tap — wrapped in try/catch for safety
  try {
    if (self.navigator && typeof self.navigator.clearAppBadge === 'function') {
      self.navigator.clearAppBadge().catch(() => {});
    }
  } catch (_) {
    // Badge API not supported — fail silently
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing POS window if found
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ── Badge Clearing Message Handler ───────────────────────────────────
// Allows the main app to request badge clearing (e.g. when chat is opened)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_BADGE') {
    try {
      if (self.navigator && typeof self.navigator.clearAppBadge === 'function') {
        self.navigator.clearAppBadge().catch(() => {});
      }
    } catch (_) {
      // Badge API not supported — fail silently
    }
  }
});
