import { afterEach, describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());

vi.mock('./repair-results', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./repair-results')>()),
  createPublicRepairResultsClient,
}));

import { fetchCategoryHubRepairResultSeeds } from './repair-results.server';
import type { PublicRepairResult } from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'category-result', device_category: 'phone', brand: 'Future Brand', brand_slug: 'future-brand',
    model: 'Future Phone', model_slug: 'future-phone', repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
    before_image_path: 'approved/before.webp', after_image_path: 'approved/after.webp', image_pair_alt_text: 'Approved proof',
    image_aspect_ratio: '4:3', before_image_width: 1000, before_image_height: 1000, after_image_width: 1000, after_image_height: 1000,
    title: 'Future Phone screen repaired', short_description: 'Approved public proof.', status: 'published', privacy_checked: true,
    featured_on_homepage: false, featured_on_repair_hub: true, featured_on_brand_hub: false, sort_order: 1,
    related_repair_url: '/repairs/phone/future-brand/future-phone/screen-replacement',
    created_at: '2026-09-03T08:00:00.000Z', updated_at: '2026-09-03T08:00:00.000Z', published_at: '2026-09-03T09:00:00.000Z',
    ...overrides,
  };
}

function queryFor(data: PublicRepairResult[], error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), neq: vi.fn(), order: vi.fn(), limit: vi.fn() };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.neq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockResolvedValue({ data, error });
  return query;
}

describe('server Category Hub Repair Results seed reader', () => {
  afterEach(() => createPublicRepairResultsClient.mockReset());

  it('uses one bounded exact-category repair-hub query and returns safe four-group seeds', async () => {
    const query = queryFor([result()]);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });

    const seeds = await fetchCategoryHubRepairResultSeeds('phone');

    expect(query.eq).toHaveBeenCalledWith('device_category', 'phone');
    expect(query.eq).toHaveBeenCalledWith('featured_on_repair_hub', true);
    expect(query.order.mock.calls).toEqual([
      ['published_at', { ascending: false, nullsFirst: false }],
      ['created_at', { ascending: false }],
      ['id', { ascending: false }],
    ]);
    expect(query.limit).toHaveBeenCalledWith(50);
    expect(seeds).toEqual([expect.objectContaining({ id: 'category-result' })]);
    expect(seeds[0]).not.toHaveProperty('before_image_path');
    expect(seeds[0]).not.toHaveProperty('after_image_path');
  });

  it('fails closed to an empty seed without throwing when the public reader fails', async () => {
    createPublicRepairResultsClient.mockReturnValue(null);
    await expect(fetchCategoryHubRepairResultSeeds('phone')).resolves.toEqual([]);

    const query = queryFor([], { message: 'unavailable' });
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });
    await expect(fetchCategoryHubRepairResultSeeds('phone')).resolves.toEqual([]);
  });
});
