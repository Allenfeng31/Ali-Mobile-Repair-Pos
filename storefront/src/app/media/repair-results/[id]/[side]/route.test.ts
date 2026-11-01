import { afterEach, describe, expect, it, vi } from 'vitest';

const createServiceRoleClient = vi.hoisted(() => vi.fn());

vi.mock('@/utils/supabase/service-role', () => ({ createServiceRoleClient }));

import { GET } from './route';

function mockPublicImage() {
  const maybeSingle = vi.fn(async () => ({
    data: {
      id: 'result-1',
      status: 'published',
      privacy_checked: true,
      before_image_path: 'approved/result-1/before.webp',
      after_image_path: 'approved/result-1/after.webp',
    },
    error: null,
  }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const download = vi.fn(async () => ({ data: new Blob(['image'], { type: 'image/webp' }), error: null }));
  createServiceRoleClient.mockReturnValue({
    from: vi.fn(() => ({ select })),
    storage: { from: vi.fn(() => ({ download })) },
  });
}

describe('Repair Result media privacy caching', () => {
  afterEach(() => vi.clearAllMocks());

  it('does not cache a stable media URL after its database privacy check', async () => {
    mockPublicImage();

    const response = await GET(new Request('https://example.test/media/repair-results/result-1/before'), {
      params: Promise.resolve({ id: 'result-1', side: 'before' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0, must-revalidate');
  });
});
