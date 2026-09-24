import { afterEach, describe, expect, it, vi } from 'vitest';

const isLocalRepairCatalogueOnly = vi.hoisted(() => vi.fn());
const twilio = vi.hoisted(() => vi.fn());
const createClient = vi.hoisted(() => vi.fn());

vi.mock('@/lib/localRepairCatalogueFixture', () => ({ isLocalRepairCatalogueOnly }));
vi.mock('twilio', () => ({ default: twilio }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('@/utils/supabase/service-role', () => ({ resolveServerSupabaseKey: () => '' }));

import { POST } from './route';

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/chat-alert', () => {
  it('does not create Supabase or Twilio clients in local-only mode', async () => {
    isLocalRepairCatalogueOnly.mockReturnValue(true);

    const response = await POST(new Request('https://local.test/api/chat-alert', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    }));

    expect(response.status).toBe(503);
    expect(createClient).not.toHaveBeenCalled();
    expect(twilio).not.toHaveBeenCalled();
  });

  it('retains the normal no-SMS-credentials response when local-only mode is disabled', async () => {
    isLocalRepairCatalogueOnly.mockReturnValue(false);

    const response = await POST(new Request('https://local.test/api/chat-alert', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, message: 'Alert logged (SMS disabled)' });
  });
});
