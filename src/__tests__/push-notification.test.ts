/**
 * TDD: Service Worker Push Notification Payload
 * 
 * Tests the logic that constructs notification options from a push event payload.
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
