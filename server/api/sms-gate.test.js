/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from 'vitest';

// Import the module under test
const { isSmsAlertEnabled } = await import('./sms-gate.js');

/**
 * Creates a mock Supabase client that returns a specific value for
 * `settings` table queries on key='sms_alerts_enabled'.
 */
function createMockSupabase(returnData, returnError = null) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
        }),
      }),
    }),
  };
}

describe('isSmsAlertEnabled (SMS Gate)', () => {
  it('returns false when setting is explicitly disabled', async () => {
    const supabase = createMockSupabase({ value: 'false' });
    const result = await isSmsAlertEnabled(supabase);
    expect(result).toBe(false);
  });

  it('returns true when setting is explicitly enabled', async () => {
    const supabase = createMockSupabase({ value: 'true' });
    const result = await isSmsAlertEnabled(supabase);
    expect(result).toBe(true);
  });

  it('returns true (default enabled) when no setting row exists', async () => {
    const supabase = createMockSupabase(null);
    const result = await isSmsAlertEnabled(supabase);
    expect(result).toBe(true);
  });

  it('returns true (fail-open) when DB query errors', async () => {
    const supabase = createMockSupabase(null, { message: 'connection failed' });
    const result = await isSmsAlertEnabled(supabase);
    expect(result).toBe(true);
  });

  it('queries the correct table and key', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { value: 'true' }, error: null });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    const supabase = { from: mockFrom };

    await isSmsAlertEnabled(supabase);

    expect(mockFrom).toHaveBeenCalledWith('settings');
    expect(mockSelect).toHaveBeenCalledWith('value');
    expect(mockEq).toHaveBeenCalledWith('key', 'sms_alerts_enabled');
  });
});
