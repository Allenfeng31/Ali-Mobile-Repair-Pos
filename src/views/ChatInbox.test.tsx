/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';

const polls = vi.hoisted(() => [] as Array<() => Promise<string>>);
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }) }));
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
