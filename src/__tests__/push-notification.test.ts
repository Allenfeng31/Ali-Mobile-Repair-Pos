/**
 * TDD: Push Subscription Management & Notification Behavior
 * 
 * Tests for:
 * 1. Push notification payload construction (service worker)
 * 2. Push subscription upsert logic (DB-backed, serverless-safe)
 * 3. App Badge API feature detection and clearing
 */
import { describe, it, expect } from 'vitest';

// ── Pure logic extracted from service worker for testability ──────────

interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

interface NotificationOptions {
  body: string;
  icon: string;
  badge: string;
  vibrate: number[];
  requireInteraction: boolean;
  data: { url: string };
}

function buildNotificationOptions(payload: PushPayload): { title: string; options: NotificationOptions } {
  const title = payload.title || 'New Customer Chat';
  const body = payload.body || 'You have a new message';
  const url = payload.url || '/admin/chat';

  return {
    title,
    options: {
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-monochrome.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: { url },
    },
  };
}

// ── Push subscription deduplication logic ─────────────────────────────

interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id?: string;
}

/**
 * Determines the upsert payload for a push subscription.
 * Used when storing subscriptions in Supabase `push_subscriptions` table.
 * Deduplicates by endpoint (UNIQUE constraint).
 */
function buildSubscriptionUpsert(
  subscriptionJSON: { endpoint?: string; keys?: { p256dh?: string; auth?: string } },
  userId?: string,
): PushSubscriptionRecord | null {
  if (!subscriptionJSON.endpoint || !subscriptionJSON.keys?.p256dh || !subscriptionJSON.keys?.auth) {
    return null; // Invalid subscription
  }
  return {
    endpoint: subscriptionJSON.endpoint,
    p256dh: subscriptionJSON.keys.p256dh,
    auth: subscriptionJSON.keys.auth,
    user_id: userId,
  };
}

// ── App Badge feature detection logic ─────────────────────────────────

/**
 * Safely sets the app badge count. Wraps in try/catch for browsers
 * that don't support the Badging API (pre-iOS 16.4, older Android).
 */
async function safeSetAppBadge(count: number, nav: any): Promise<boolean> {
  try {
    if (nav && typeof nav.setAppBadge === 'function') {
      await nav.setAppBadge(count);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Safely clears the app badge. Used when the admin opens the chat inbox
 * and messages are marked as read.
 */
async function safeClearAppBadge(nav: any): Promise<boolean> {
  try {
    if (nav && typeof nav.clearAppBadge === 'function') {
      await nav.clearAppBadge();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('Service Worker — Push Notification Options', () => {
  it('uses provided title and body from payload', () => {
    const result = buildNotificationOptions({
      title: 'Chat from John',
      body: 'Hi, how much for iPhone 13 screen?',
      url: '/admin/chat',
    });
    expect(result.title).toBe('Chat from John');
    expect(result.options.body).toBe('Hi, how much for iPhone 13 screen?');
  });

  it('defaults title to "New Customer Chat" when not provided', () => {
    const result = buildNotificationOptions({
      body: 'Hello there',
    });
    expect(result.title).toBe('New Customer Chat');
  });

  it('defaults body to "You have a new message" when not provided', () => {
    const result = buildNotificationOptions({});
    expect(result.options.body).toBe('You have a new message');
  });

  it('always includes vibrate pattern [200, 100, 200]', () => {
    const result = buildNotificationOptions({ body: 'test' });
    expect(result.options.vibrate).toEqual([200, 100, 200]);
  });

  it('sets requireInteraction to true for persistent banner', () => {
    const result = buildNotificationOptions({ body: 'test' });
    expect(result.options.requireInteraction).toBe(true);
  });

  it('routes to /admin/chat by default', () => {
    const result = buildNotificationOptions({ body: 'test' });
    expect(result.options.data.url).toBe('/admin/chat');
  });

  it('uses icon-192x192.png and badge-monochrome.png', () => {
    const result = buildNotificationOptions({ body: 'test' });
    expect(result.options.icon).toBe('/icon-192x192.png');
    expect(result.options.badge).toBe('/badge-monochrome.png');
  });
});

describe('Push Subscription — DB-Backed Upsert Logic', () => {
  it('builds valid upsert record from a PushSubscription JSON', () => {
    const result = buildSubscriptionUpsert({
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
      keys: { p256dh: 'key_p256dh_value', auth: 'key_auth_value' },
    }, 'user-uuid-123');

    expect(result).toEqual({
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
      p256dh: 'key_p256dh_value',
      auth: 'key_auth_value',
      user_id: 'user-uuid-123',
    });
  });

  it('returns null for missing endpoint', () => {
    const result = buildSubscriptionUpsert({
      keys: { p256dh: 'key', auth: 'key' },
    });
    expect(result).toBeNull();
  });

  it('returns null for missing p256dh key', () => {
    const result = buildSubscriptionUpsert({
      endpoint: 'https://example.com',
      keys: { auth: 'key' },
    });
    expect(result).toBeNull();
  });

  it('returns null for missing auth key', () => {
    const result = buildSubscriptionUpsert({
      endpoint: 'https://example.com',
      keys: { p256dh: 'key' },
    });
    expect(result).toBeNull();
  });

  it('handles subscription without user_id (anonymous device)', () => {
    const result = buildSubscriptionUpsert({
      endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
      keys: { p256dh: 'pk', auth: 'ak' },
    });
    expect(result).toEqual({
      endpoint: 'https://fcm.googleapis.com/fcm/send/xyz',
      p256dh: 'pk',
      auth: 'ak',
      user_id: undefined,
    });
  });
});

describe('App Badge API — Feature Detection & Clearing', () => {
  it('sets badge when navigator supports setAppBadge', async () => {
    const mockNav = { setAppBadge: async (_: number) => {} };
    const result = await safeSetAppBadge(1, mockNav);
    expect(result).toBe(true);
  });

  it('returns false when navigator does NOT support setAppBadge', async () => {
    const result = await safeSetAppBadge(1, {});
    expect(result).toBe(false);
  });

  it('returns false when navigator is null', async () => {
    const result = await safeSetAppBadge(1, null);
    expect(result).toBe(false);
  });

  it('catches exceptions from setAppBadge gracefully', async () => {
    const mockNav = { setAppBadge: async () => { throw new Error('Not allowed'); } };
    const result = await safeSetAppBadge(1, mockNav);
    expect(result).toBe(false);
  });

  it('clears badge when navigator supports clearAppBadge', async () => {
    const mockNav = { clearAppBadge: async () => {} };
    const result = await safeClearAppBadge(mockNav);
    expect(result).toBe(true);
  });

  it('returns false when navigator does NOT support clearAppBadge', async () => {
    const result = await safeClearAppBadge({});
    expect(result).toBe(false);
  });

  it('catches exceptions from clearAppBadge gracefully (older browser crash prevention)', async () => {
    const mockNav = { clearAppBadge: async () => { throw new Error('SecurityError'); } };
    const result = await safeClearAppBadge(mockNav);
    expect(result).toBe(false);
  });
});
