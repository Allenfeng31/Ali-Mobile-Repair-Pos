/** @vitest-environment jsdom */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const polls = vi.hoisted(() => [] as Array<{ task: () => Promise<string>; delay: number }>);
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) }));
vi.mock('@/hooks/useAdaptivePoll', () => ({ useAdaptivePoll: (task: () => Promise<string>, delay: number) => { polls.push({ task, delay }); } }));
vi.mock('@/hooks/useAuthStore', () => ({ useAuthStore: () => ({ permissions: { is_super_admin: true } }) }));
vi.mock('@/lib/supabase', () => ({ supabase: { auth: { getSession } } }));
vi.mock('@/lib/apiBase', () => ({ getApiBaseUrl: () => '/api' }));
vi.mock('@/lib/api', () => ({ api: { getSettings: vi.fn().mockResolvedValue({}), updateSettings: vi.fn(), getDebugInfo: vi.fn().mockReturnValue({}) } }));

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
