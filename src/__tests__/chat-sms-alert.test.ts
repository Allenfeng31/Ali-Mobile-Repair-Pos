/**
 * TDD: Chat SMS Alert Behavior
 * 
 * Tests the logic that determines when to send an SMS alert
 * for incoming customer chat messages.
 * 
 * ARCHITECTURE NOTE: Debounce is DB-backed (not in-memory) because
 * Vercel serverless functions are stateless across cold starts.
 */
import { describe, it, expect } from 'vitest';

// ── Pure logic extracted for testability ──────────────────────────────

const INTRO_PREFIX = '[CUSTOMER_INFO]';
const BOOKING_PREFIX = '[BOOKING_DATA]';

/**
 * Determines whether a newly inserted chat message should trigger
 * an SMS alert to the admin.
 */
function shouldTriggerSmsAlert(
  sender: string,
  content: string,
): boolean {
  // Only customer messages trigger alerts
  if (sender !== 'customer') return false;
  // System intro messages (name/phone collection) are silent
  if (content.startsWith(INTRO_PREFIX)) return false;
  // Booking data messages are handled by their own booking SMS flow
  if (content.startsWith(BOOKING_PREFIX)) return false;
  return true;
}

/**
 * DB-backed debounce check: determines whether we are within the
 * debounce window for a session.
 * 
 * Uses a database timestamp (`last_sms_sent_at` on `chat_sessions`)
 * instead of an in-memory Map, ensuring correctness across Vercel
 * serverless cold starts.
 * 
 * Returns true if the last alert was sent LESS than `windowMs` ago,
 * meaning we should SKIP this alert.
 */
function isWithinDebounceWindow(
  lastSmsTimestamp: string | null,
  now: Date,
  windowMs: number = 5 * 60 * 1000, // 5 minutes
): boolean {
  if (!lastSmsTimestamp) return false;
  const lastAlert = new Date(lastSmsTimestamp);
  return (now.getTime() - lastAlert.getTime()) < windowMs;
}

/**
 * Formats the SMS body for a chat alert.
 */
function formatChatAlertSms(content: string): string {
  const snippet = content.length > 30 ? content.substring(0, 30) + '...' : content;
  return `New POS Chat: "${snippet}"`;
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('Chat SMS Alert — Trigger Logic', () => {
  it('triggers SMS for a regular customer message', () => {
    expect(shouldTriggerSmsAlert('customer', 'Hi, how much for an iPhone 13 screen?')).toBe(true);
  });

  it('does NOT trigger SMS for staff messages', () => {
    expect(shouldTriggerSmsAlert('staff', 'We can do it for $180')).toBe(false);
  });

  it('does NOT trigger SMS for CUSTOMER_INFO intro messages', () => {
    expect(shouldTriggerSmsAlert('customer', '[CUSTOMER_INFO]\nName: John\nPhone: 0412345678')).toBe(false);
  });

  it('does NOT trigger SMS for BOOKING_DATA messages', () => {
    expect(shouldTriggerSmsAlert('customer', '[BOOKING_DATA] {"appointmentId":"abc"}')).toBe(false);
  });
});

describe('Chat SMS Alert — DB-Backed Debounce (Serverless-Safe)', () => {
  it('is NOT within debounce window when last_sms_sent_at is null (first message ever)', () => {
    expect(isWithinDebounceWindow(null, new Date(), 5 * 60 * 1000)).toBe(false);
  });

  it('IS within debounce window when last_sms_sent_at was 2 minutes ago', () => {
    const now = new Date('2026-05-02T10:10:00Z');
    const lastAlert = '2026-05-02T10:08:00Z'; // 2 min ago
    expect(isWithinDebounceWindow(lastAlert, now, 5 * 60 * 1000)).toBe(true);
  });

  it('is NOT within debounce window when last_sms_sent_at was 6 minutes ago', () => {
    const now = new Date('2026-05-02T10:10:00Z');
    const lastAlert = '2026-05-02T10:04:00Z'; // 6 min ago
    expect(isWithinDebounceWindow(lastAlert, now, 5 * 60 * 1000)).toBe(false);
  });

  it('handles edge case: exactly at the 5-minute boundary (not within window)', () => {
    const now = new Date('2026-05-02T10:05:00Z');
    const lastAlert = '2026-05-02T10:00:00Z'; // exactly 5 min ago
    expect(isWithinDebounceWindow(lastAlert, now, 5 * 60 * 1000)).toBe(false);
  });

  it('survives cold start: null timestamp means no debounce (always send)', () => {
    // Simulates Vercel cold start — no in-memory state, DB has no timestamp
    const freshColdStart = isWithinDebounceWindow(null, new Date());
    expect(freshColdStart).toBe(false);
  });
});

describe('Chat SMS Alert — SMS Body Formatting', () => {
  it('truncates long messages to 30 chars with ellipsis', () => {
    const msg = 'Hi, I need a screen replacement for my iPhone 15 Pro Max';
    const result = formatChatAlertSms(msg);
    expect(result).toBe('New POS Chat: "Hi, I need a screen replacemen..."');
    expect(result.length).toBeLessThanOrEqual(60);
  });

  it('keeps short messages intact', () => {
    const result = formatChatAlertSms('Hello');
    expect(result).toBe('New POS Chat: "Hello"');
  });
});
