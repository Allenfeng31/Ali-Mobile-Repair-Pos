import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock('./apiBase', () => ({
  getApiBaseUrl: () => 'https://api.example.test/api',
  getApiDiagnostics: () => ({}),
}));

vi.mock('./supabase', () => ({
  supabase: { auth: { getSession: mocks.getSession } },
}));

import { api } from './api';

describe('POS inventory authorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'staff-token' } } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      url: 'https://api.example.test/api/inventory',
      text: async () => '[]',
    }));
  });

  it('sends the staff bearer token on every inventory read and write', async () => {
    await api.getInventory();
    await api.createInventoryItem({ name: 'Repair' });
    await api.updateInventoryItem(1, { price: 100 });
    await api.deleteInventoryItem(1);
    await api.bulkCreateInventoryItems([{ name: 'Repair' }]);

    expect(fetch).toHaveBeenCalledTimes(5);
    for (const [, init] of vi.mocked(fetch).mock.calls) {
      expect(init?.headers).toMatchObject({ Authorization: 'Bearer staff-token' });
    }
  });
});
