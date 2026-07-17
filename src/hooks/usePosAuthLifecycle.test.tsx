/** @vitest-environment jsdom */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { usePosAuthLifecycle } from './usePosAuthLifecycle';

function Probe({ client, handlers }: any) { usePosAuthLifecycle(client, handlers); return null; }
const handlers = () => ({ authenticated: vi.fn(), signedOut: vi.fn(), restorationFailure: vi.fn(), ready: vi.fn() });

describe('POS auth lifecycle', () => {
  afterEach(() => { cleanup(); localStorage.clear(); });
  it('restores a verified startup session and clears only confirmed sign-out', async () => {
    let listener: any;
    const unsubscribe = vi.fn(); const h = handlers();
    const client = { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'staff-1' } } }, error: null }), onAuthStateChange: vi.fn((cb) => { listener = cb; return { data: { subscription: { unsubscribe } } }; }) } };
    render(<Probe client={client} handlers={h} />);
    await waitFor(() => expect(h.authenticated).toHaveBeenCalledWith({ id: 'staff-1' }));
    listener('SIGNED_OUT', null);
    expect(h.signedOut).toHaveBeenCalledOnce();
    cleanup(); expect(unsubscribe).toHaveBeenCalledOnce();
  });
  it('preserves a valid cached identity during temporary restoration failure', async () => {
    localStorage.setItem('pos_session', JSON.stringify({ user: { id: 'cached' }, expiresAt: Date.now() + 10_000 }));
    const h = handlers();
    const client = { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: new Error('network') }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) } };
    render(<Probe client={client} handlers={h} />);
    await waitFor(() => expect(h.restorationFailure).toHaveBeenCalledWith({ id: 'cached' }));
    expect(h.signedOut).not.toHaveBeenCalled();
  });
});
