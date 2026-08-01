import { afterEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const refreshPublicRepairCatalogue = vi.hoisted(() => vi.fn());
vi.mock('next/cache', () => ({ revalidateTag, revalidatePath }));
vi.mock('@/lib/api', () => ({
  PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG: 'public-repair-catalogue-source',
  refreshPublicRepairCatalogue,
}));

import { POST } from './route';

const payload = (overrides = {}) => JSON.stringify({ mutations: [{
  operation: 'update',
  category: 'phone',
  brand: 'Motorola',
  model: 'Moto G24',
  repairType: 'Screen Replacement',
  changedFields: ['price'],
  topologyChanged: false,
  ...overrides,
}] });

const request = (body: string, secret = 'test-secret') => new Request('http://localhost/api/internal/revalidate-repair-catalogue', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-catalogue-revalidation-secret': secret },
  body,
});

afterEach(() => {
  vi.unstubAllEnvs();
  revalidateTag.mockReset();
  revalidatePath.mockReset();
  refreshPublicRepairCatalogue.mockReset();
});

describe('repair catalogue revalidation webhook', () => {
  it('returns 401 for missing or incorrect secrets without refreshing anything', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    expect((await POST(new Request('http://localhost/api/internal/revalidate-repair-catalogue', { method: 'POST' }))).status).toBe(401);
    expect((await POST(request(payload(), 'wrong-secret'))).status).toBe(401);
    expect(refreshPublicRepairCatalogue).not.toHaveBeenCalled();
  });

  it('refreshes the durable catalogue snapshot before invalidating price-only paths', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    const order: string[] = [];
    revalidateTag.mockImplementation(() => order.push('source'));
    refreshPublicRepairCatalogue.mockImplementation(async () => {
      order.push('snapshot');
      return { catalogueSource: 'live-pos' };
    });
    revalidatePath.mockImplementation(() => order.push('path'));

    expect((await POST(request(payload()))).status).toBe(200);
    expect(order.indexOf('snapshot')).toBeLessThan(order.indexOf('path'));
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola/moto-g24/screen-replacement');
    expect(revalidatePath).not.toHaveBeenCalledWith('/sitemap.xml');
  });

  it('rejects Accessories/path injection and skips stock-only notifications', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    expect((await POST(request(payload({ brand: 'Accessories' })))).status).toBe(400);
    expect((await POST(request(payload({ path: '/sitemap.xml' })))).status).toBe(400);
    const stockOnlyResponse = await POST(request(payload({ changedFields: ['stock'] })));
    expect(await stockOnlyResponse.json()).toEqual({ ignored: true });
    expect(refreshPublicRepairCatalogue).not.toHaveBeenCalled();
  });

  it('keeps last-known-good routes untouched when snapshot refresh fails', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    refreshPublicRepairCatalogue.mockRejectedValueOnce(new Error('invalid live catalogue'));
    expect((await POST(request(payload()))).status).toBe(503);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('adds only category, repairs index, and sitemap for a topology mutation', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'live-pos' });
    expect((await POST(request(payload({ operation: 'create', topologyChanged: true })))).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs');
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
    expect(revalidatePath).not.toHaveBeenCalledWith('/');
  });

  it('does not invalidate paths when refresh falls back to last-known-good data', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'last-known-good' });
    expect((await POST(request(payload()))).status).toBe(503);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
