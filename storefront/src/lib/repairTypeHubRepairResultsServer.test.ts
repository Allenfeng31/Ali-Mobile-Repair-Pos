import { afterEach, describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());

vi.mock('./repair-results', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./repair-results')>()),
  createPublicRepairResultsClient,
}));

import { fetchRepairTypeHubRepairResultSeeds } from './repair-results.server';
import type { PublicRepairResult } from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'screen-result', device_category: 'phone', brand: 'Samsung', brand_slug: 'samsung',
    model: 'Galaxy S21', model_slug: 'galaxy-s21', repair_type: 'Screen Repair', repair_type_slug: 'screen-repair',
    before_image_path: 'approved/before.jpg', after_image_path: 'approved/after.jpg', image_pair_alt_text: 'Safe result',
    image_aspect_ratio: '4:3', before_image_width: 1200, before_image_height: 900, after_image_width: 1200, after_image_height: 900,
    title: 'Screen repaired', short_description: 'Safe public summary.', status: 'published', privacy_checked: true,
    featured_on_homepage: false, featured_on_repair_hub: false, featured_on_brand_hub: false, sort_order: 0,
    related_repair_url: '/repairs/phone/samsung/galaxy-s21/screen-replacement',
    created_at: '2026-09-01T00:00:00.000Z', updated_at: '2026-09-01T00:00:00.000Z', published_at: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

function queryFor(data: unknown[], error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), neq: vi.fn(), in: vi.fn(), order: vi.fn(), limit: vi.fn() };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.neq.mockReturnValue(query);
  query.in.mockReturnValue(query); query.order.mockReturnValue(query); query.limit.mockResolvedValue({ data, error });
  return query;
}

describe('server Repair-Type Hub Repair Results seed reader', () => {
  afterEach(() => createPublicRepairResultsClient.mockReset());

  it('uses one bounded phone alias query and returns safe matching seeds', async () => {
    const query = queryFor([result()]);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });

    const seeds = await fetchRepairTypeHubRepairResultSeeds({ category: 'phone', repairTypeSlug: 'screen-replacement' });

    expect(query.eq).toHaveBeenCalledWith('device_category', 'phone');
    expect(query.eq).toHaveBeenCalledWith('status', 'published');
    expect(query.eq).toHaveBeenCalledWith('privacy_checked', true);
    expect(query.in).toHaveBeenCalledWith('repair_type_slug', ['screen-replacement', 'screen-repair']);
    expect(query.neq).toHaveBeenCalledWith('before_image_path', '');
    expect(query.neq).toHaveBeenCalledWith('after_image_path', '');
    expect(query.order.mock.calls).toEqual([
      ['published_at', { ascending: false, nullsFirst: false }],
      ['created_at', { ascending: false }],
      ['id', { ascending: false }],
    ]);
    expect(query.limit).toHaveBeenCalledWith(3);
    expect(seeds[0]).toMatchObject({ id: 'screen-result' });
    expect(seeds[0]).not.toHaveProperty('before_image_path');
  });

  it('fails closed to an empty seed on missing client or query failure', async () => {
    createPublicRepairResultsClient.mockReturnValue(null);
    await expect(fetchRepairTypeHubRepairResultSeeds({ category: 'phone', repairTypeSlug: 'screen-replacement' })).resolves.toEqual([]);

    const query = queryFor([], { message: 'unavailable' });
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });
    await expect(fetchRepairTypeHubRepairResultSeeds({ category: 'phone', repairTypeSlug: 'screen-replacement' })).resolves.toEqual([]);
  });
});
