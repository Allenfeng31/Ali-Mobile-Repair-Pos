/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

const polls = vi.hoisted(() => [] as Array<() => Promise<string>>);
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) }));
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
vi.mock('@/hooks/useAdaptivePoll', () => ({ useAdaptivePoll: (task: () => Promise<string>) => { polls.push(task); } }));
vi.mock('@/hooks/useAuthStore', () => ({ useAuthStore: () => ({ permissions: { is_super_admin: true } }) }));
vi.mock('@/lib/supabase', () => ({ supabase: { auth: { getSession } } }));
vi.mock('@/lib/apiBase', () => ({ getApiBaseUrl: () => '/api' }));

import { ChatInbox, getChatSessionLabel } from './ChatInbox';

const messageFor = (status: number) => new Response('{}', { status, headers: { 'Content-Type': 'application/json' } });

describe('ChatInbox adaptive polling integration', () => {
  afterEach(() => { cleanup(); polls.length = 0; vi.restoreAllMocks(); });

  it.each([
    [401, 'Staff session expired. Please sign out and sign back in.'],
    [403, 'Your account does not have permission to access Staff Chat.'],
    [429, 'Authentication service is temporarily busy. Retrying shortly.'],
    [503, 'Staff Chat is temporarily unavailable. Retrying connection.'],
    [500, 'Staff Chat encountered a temporary service error.'],
  ])('maps polling HTTP %i without mislabeling it', async (status, text) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(messageFor(status)));
    render(<ChatInbox />);
    expect(polls.length).toBeGreaterThanOrEqual(2);
    await polls[0]();
    await waitFor(() => expect(screen.getByText(text)).toBeTruthy());
    if (status !== 401) expect(screen.queryByText('Staff session expired. Please sign out and sign back in.')).toBeNull();
  });
});

describe('ChatInbox session labels', () => {
  it('keeps anonymous labels stable when the session list is reordered', () => {
    const first = { id: 'synthetic-session-alpha', customer_name: null };
    const second = { id: 'synthetic-session-beta', customer_name: null };

    const firstLabel = getChatSessionLabel(first);
    const secondLabel = getChatSessionLabel(second);

    expect(getChatSessionLabel(second)).toBe(secondLabel);
    expect(getChatSessionLabel(first)).toBe(firstLabel);
    expect(firstLabel).not.toBe(secondLabel);
    expect(firstLabel).not.toContain(first.id);
    expect(firstLabel).not.toBe('Customer #001');
  });
});

describe('ChatInbox booking confirmation card', () => {
  afterEach(() => { cleanup(); polls.length = 0; vi.restoreAllMocks(); });

  it('renders persisted items, prices, requested date, and an optional remark for staff', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/chat/sessions')) {
        return new Response(JSON.stringify([{
          id: 'booking-session', session_token: 'staff-only', created_at: '', last_message_at: '',
          customer_name: 'Fernando', customer_phone: '0435000000', unread_count: 1,
        }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/chat/session/id/booking-session/messages')) {
        return new Response(JSON.stringify([{
          id: 'booking-message', sender: 'customer', created_at: '2026-10-01T00:00:00.000Z', is_read: false,
          content: '[BOOKING_DATA] {"appointmentId":"appointment-1","name":"Fernando","phone":"0435000000","bookingDate":"2026-10-02","bookingTime":"12:30","bookingItems":[{"brand":"Google Pixel","model":"Pixel 10 Pro XL","services":[{"id":"repair","name":"Charging Port Replacement","price":120,"isUpsell":false,"isQuoteOnRequest":false},{"id":"upsell-glass","name":"Tempered Glass","price":20,"isUpsell":true,"isQuoteOnRequest":false}]}],"bookingTotal":140,"hasCustomQuote":false,"notes":"Please check cable fit."}',
        }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/appointments/upcoming')) return new Response('[]', { status: 200 });
      if (url.includes('/appointments/appointment-1')) return new Response(JSON.stringify({ status: 'pending' }), { status: 200 });
      return new Response('{}', { status: 200 });
    }));

    render(<ChatInbox />);
    await polls[0]();
    fireEvent.click(await screen.findByText('Fernando'));

    expect(await screen.findByText('Inbound Booking Data')).toBeTruthy();
    expect(screen.getByText('Charging Port Replacement')).toBeTruthy();
    expect(screen.getByText('Tempered Glass (Add-on)')).toBeTruthy();
    expect(screen.getByText('$120.00')).toBeTruthy();
    expect(screen.getByText('$20.00')).toBeTruthy();
    expect(screen.getByText('$140.00')).toBeTruthy();
    expect(screen.getByText((_, element) => element?.textContent === '2 October 202612:30 pm')).toBeTruthy();
    expect(screen.getByText('Please check cable fit.')).toBeTruthy();
  });
});
