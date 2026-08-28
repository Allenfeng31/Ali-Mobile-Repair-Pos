import { afterEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const refreshPublicRepairCatalogue = vi.hoisted(() => vi.fn());
const fetchRepairCatalog = vi.hoisted(() => vi.fn());
vi.mock('next/cache', () => ({ revalidateTag, revalidatePath }));
vi.mock('@/lib/api', () => ({
  PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG: 'public-repair-catalogue-source',
  refreshPublicRepairCatalogue,
  fetchRepairCatalog,
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
  fetchRepairCatalog.mockReset();
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
    const dummyCatalogue = {
      catalogueSource: 'live-pos',
      brands: [{ category: 'phone', slug: 'motorola', models: [{ slug: 'moto-g24', repairTypes: [{ slug: 'screen-replacement' }] }] }]
    };
    fetchRepairCatalog.mockResolvedValueOnce(dummyCatalogue);
    revalidateTag.mockImplementation(() => order.push('source'));
    refreshPublicRepairCatalogue.mockImplementation(async () => {
      order.push('snapshot');
      return dummyCatalogue;
    });
    revalidatePath.mockImplementation(() => order.push('path'));

    expect((await POST(request(payload()))).status).toBe(200);
    expect(order.indexOf('snapshot')).toBeLessThan(order.indexOf('path'));
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola/moto-g24/screen-replacement');
    expect(revalidatePath).not.toHaveBeenCalledWith('/sitemap.xml');
  });

  it('invalidates canonical OPPO detail paths for raw POS repair aliases', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'live-pos', brands: [] });

    const response = await POST(request(JSON.stringify({ mutations: [
      { operation: 'update', category: 'phone', brand: 'OPPO', model: 'Find X8 Pro', repairType: 'Screen Repair', changedFields: ['price'], topologyChanged: false },
      { operation: 'update', category: 'phone', brand: 'OPPO', model: 'Find X8 Pro', repairType: 'Battery Service', changedFields: ['price'], topologyChanged: false },
      { operation: 'update', category: 'phone', brand: 'OPPO', model: 'Find X8 Pro', repairType: 'Front Camera', changedFields: ['price'], topologyChanged: false },
    ] })));

    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/oppo/find-x8-pro/screen-replacement');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/oppo/find-x8-pro/battery-replacement');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/oppo/find-x8-pro/front-camera-replacement');
    expect(revalidatePath).not.toHaveBeenCalledWith('/repairs/phone/oppo/find-x8-pro/screen-repair');
    expect(revalidatePath).not.toHaveBeenCalledWith('/repairs/phone/oppo/find-x8-pro/battery-service');
    expect(revalidatePath).not.toHaveBeenCalledWith('/repairs/phone/oppo/find-x8-pro/front-camera');
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
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'live-pos', brands: [] });
    expect((await POST(request(payload({ operation: 'create', topologyChanged: true })))).status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs');
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
    expect(revalidatePath).not.toHaveBeenCalledWith('/');
  });

  it('detects missing live topology (e.g. Moto G24 price update on old snapshot without it) and triggers broad invalidation', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    // Before: no Moto G24
    fetchRepairCatalog.mockResolvedValueOnce({ brands: [] });
    // After: Moto G24 exists
    refreshPublicRepairCatalogue.mockResolvedValueOnce({
      catalogueSource: 'live-pos',
      brands: [{ category: 'phone', slug: 'motorola', models: [{ slug: 'moto-g24', repairTypes: [{ slug: 'screen-replacement' }] }] }]
    });

    const response = await POST(request(payload()));
    expect(response.status).toBe(200);
    // Should trigger broad invalidation because topology changed
    expect(revalidatePath).toHaveBeenCalledWith('/repairs');
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola/moto-g24/screen-replacement');
  });

  it('detects model deletion and invalidates parent URLs', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    fetchRepairCatalog.mockResolvedValueOnce({
      brands: [{ category: 'phone', slug: 'motorola', models: [{ slug: 'old-model', repairTypes: [{ slug: 'screen-replacement' }] }] }]
    });
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'live-pos', brands: [] });

    // Payload deletes the model
    const response = await POST(request(payload({ operation: 'delete', model: 'old-model', topologyChanged: true })));
    expect(response.status).toBe(200);

    // Explicitly invalidates the deleted detail and its parents
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola/old-model');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola');
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
  });

  it('does not invalidate paths when refresh falls back to last-known-good data', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'last-known-good' });
    expect((await POST(request(payload()))).status).toBe(503);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('accepts an event identity and invalidates both old and new rename paths without creating a redirect', async () => {
    vi.stubEnv('CATALOGUE_REVALIDATION_SECRET', 'test-secret');
    refreshPublicRepairCatalogue.mockResolvedValueOnce({ catalogueSource: 'live-pos', brands: [] });
    const response = await POST(request(JSON.stringify({ eventId: 'event-1', eventVersion: 2, mutations: [
      JSON.parse(payload({ model: 'Moto G24', repairType: 'Screen Repair', topologyChanged: true })).mutations[0],
      { ...JSON.parse(payload({ model: 'Moto G24 5G', repairType: 'Screen Repair', topologyChanged: true })).mutations[0], changedFields: ['model'] },
    ] })));
    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola/moto-g24/screen-replacement');
    expect(revalidatePath).toHaveBeenCalledWith('/repairs/phone/motorola/moto-g24-5g/screen-replacement');
  });
});
