/** @vitest-environment jsdom */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

const polls = vi.hoisted(() => [] as Array<{ task: () => Promise<string>; delay: number }>);
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) }));
const apiMocks = vi.hoisted(() => ({
  getInventory: vi.fn().mockResolvedValue([
    { id: 1, brand: 'Google', model: 'Pixel 7', device_model: 'GVU6C', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'GOO-P7-SCR-P', price: 289, stock: 2, costPrice: 80, margin: 72 },
    { id: 2, brand: 'Google', model: 'Pixel 7 Pro', device_model: 'GP4BC', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Genuine', sku: 'GOO-P7P-SCR-G', price: 449, stock: 1, costPrice: 160, margin: 64 },
  ]),
  getIp: vi.fn().mockResolvedValue({}),
}));
vi.mock('@/hooks/useAdaptivePoll', () => ({ useAdaptivePoll: (task: () => Promise<string>, delay: number) => { polls.push({ task, delay }); } }));
vi.mock('@/hooks/useAuthStore', () => ({ useAuthStore: () => ({ permissions: { is_super_admin: true } }) }));
vi.mock('@/lib/supabase', () => ({ supabase: { auth: { getSession } } }));
vi.mock('@/lib/apiBase', () => ({ getApiBaseUrl: () => '/api' }));
vi.mock('@/lib/api', () => ({ api: { getSettings: vi.fn().mockResolvedValue({}), updateSettings: vi.fn(), updateSetting: vi.fn(), getDebugInfo: vi.fn().mockReturnValue({}), ...apiMocks } }));

import { Layout } from './Layout';

function renderLayout() {
  return render(<Layout currentView="sales" onViewChange={vi.fn()} onLogout={vi.fn()} currentUser={{}} t={() => ''}><div>child</div></Layout>);
}
const response = (status: number, body = '{}') => new Response(body, { status, headers: { 'Content-Type': 'application/json' } });

describe('Layout unread adaptive polling integration', () => {
  afterEach(() => { cleanup(); polls.length = 0; vi.restoreAllMocks(); });
  it('wires unread polling at 30 seconds and keeps retryable failures non-expired', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(429)));
    renderLayout();
    const unread = polls.find((poll) => poll.delay === 30_000);
    expect(unread).toBeTruthy();
    await unread!.task();
    await waitFor(() => expect(screen.getByText('Authentication service is temporarily busy. Retrying shortly.')).toBeTruthy());
    expect(screen.queryByText('Staff chat session expired. Please sign out and sign back in.')).toBeNull();
  });
  it.each([[401, 'Staff session expired. Please sign out and sign back in.'], [503, 'Staff Chat is temporarily unavailable. Retrying connection.'], [500, 'Staff Chat encountered a temporary service error.']])('maps unread HTTP %i safely', async (status, text) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(status)));
    renderLayout();
    const unread = polls.find((poll) => poll.delay === 30_000)!;
    await unread.task();
    await waitFor(() => expect(screen.getByText(text)).toBeTruthy());
  });
});

describe('Layout Quick Quote', () => {
  afterEach(() => { cleanup(); polls.length = 0; vi.restoreAllMocks(); });

  it('supports multi-token lookup, customer-safe view, clear, close and focus restoration', async () => {
    renderLayout();
    const trigger = screen.getByRole('button', { name: /Quick Quote/i });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Quick Quote' });
    const input = within(dialog).getByRole('searchbox', { name: 'Search repair prices' });
    await waitFor(() => expect(document.activeElement).toBe(input));

    fireEvent.change(input, { target: { value: 'google pixel screen' } });
    expect(await within(dialog).findByText('Google Pixel 7')).toBeTruthy();
    expect(within(dialog).getByText('GOO-P7-SCR-P')).toBeTruthy();
    expect(within(dialog).getByText('2 in stock')).toBeTruthy();
    expect(dialog.querySelector('.truncate')).toBeNull();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Open customer view' }));
    expect(within(dialog).queryByText('GOO-P7-SCR-P')).toBeNull();
    expect(within(dialog).queryByText('2 in stock')).toBeNull();
    expect(within(dialog).getByText('$289.00')).toBeTruthy();
    expect(within(dialog).getByText('Premium')).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Exit customer view' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Clear search' }));
    expect((input as HTMLInputElement).value).toBe('');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close Quick Quote' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Quick Quote' })).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });
});
