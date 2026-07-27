import { afterEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock('next/cache', () => ({ revalidateTag }));

import { POST } from './route';

afterEach(() => {
  vi.unstubAllEnvs();
  revalidateTag.mockReset();
});

describe('announcement revalidation webhook', () => {
  it('rejects missing and incorrect secrets without invalidating anything', async () => {
    vi.stubEnv('ANNOUNCEMENT_REVALIDATION_SECRET', 'test-secret');

    expect((await POST(new Request('http://localhost/api/internal/revalidate-announcement', { method: 'POST' }))).status).toBe(401);
    expect((await POST(new Request('http://localhost/api/internal/revalidate-announcement', {
      method: 'POST',
      headers: { 'x-announcement-revalidation-secret': 'incorrect' },
    }))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('expires only the top-announcement tag for an authorized POST', async () => {
    vi.stubEnv('ANNOUNCEMENT_REVALIDATION_SECRET', 'test-secret');
    const response = await POST(new Request('http://localhost/api/internal/revalidate-announcement', {
      method: 'POST',
      headers: { 'x-announcement-revalidation-secret': 'test-secret' },
    }));

    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('top-announcement', { expire: 0 });
  });
});
