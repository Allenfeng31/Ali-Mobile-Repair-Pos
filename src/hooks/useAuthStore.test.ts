/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getPermissions, maybeSingle } = vi.hoisted(() => ({
  getPermissions: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock('../lib/api', () => ({ api: { getPermissions } }));
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle })),
      })),
    })),
    auth: { signOut: vi.fn() },
  },
}));

import { useAuthStore } from './useAuthStore';

describe('useAuthStore staff permission loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    maybeSingle.mockResolvedValue({
      data: {
        user_id: 'staff-1',
        is_super_admin: false,
        can_give_discount: false,
      },
      error: null,
    });
  });

  it('loads the signed-in employee own permissions through RLS without the Super Admin API', async () => {
    await useAuthStore.getState().fetchPermissions('staff-1');

    expect(getPermissions).not.toHaveBeenCalled();
    expect(useAuthStore.getState().permissions).toMatchObject({
      user_id: 'staff-1',
      is_super_admin: false,
    });
    expect(useAuthStore.getState().error).toBeNull();
  });
});
