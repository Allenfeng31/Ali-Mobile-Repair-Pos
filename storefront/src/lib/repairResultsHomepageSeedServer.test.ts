import { afterEach, describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());

vi.mock('./repair-results', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./repair-results')>()),
  createPublicRepairResultsClient,
}));

import { fetchHomepageRepairResultSeed } from './repair-results.server';
import type { PublicRepairResult } from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'homepage-result', device_category: 'phone', brand: 'Future Brand', brand_slug: 'future-brand',
    model: 'Future Phone', model_slug: 'future-phone', repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
    before_image_path: 'approved/before.webp', after_image_path: 'approved/after.webp', image_pair_alt_text: 'Approved proof',
    image_aspect_ratio: '4:3', before_image_width: 1000, before_image_height: 1000, after_image_width: 1000, after_image_height: 1000,
    title: 'Future Phone screen repaired', short_description: 'Approved public proof.', status: 'published', privacy_checked: true,
    featured_on_homepage: true, featured_on_repair_hub: false, featured_on_brand_hub: false, sort_order: 1,
    related_repair_url: '/repairs/phone/future-brand/future-phone/screen-replacement',
    created_at: '2026-09-03T08:00:00.000Z', updated_at: '2026-09-03T08:00:00.000Z', published_at: '2026-09-03T09:00:00.000Z',
    ...overrides,
  };
}

function queryFor(data: PublicRepairResult[], error: unknown = null) {
  const query = {
    select: vi.fn(), eq: vi.fn(), neq: vi.fn(), order: vi.fn(), limit: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.neq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockResolvedValue({ data, error });
  return query;
}

describe('server Homepage Repair Results seed reader', () => {
  afterEach(() => createPublicRepairResultsClient.mockReset());

  it('uses one bounded existing homepage query and returns only safe selected visual fields', async () => {
    const query = queryFor([result()]);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });

    const seed = await fetchHomepageRepairResultSeed();

    expect(query.eq).toHaveBeenCalledWith('status', 'published');
    expect(query.eq).toHaveBeenCalledWith('privacy_checked', true);
    expect(query.eq).toHaveBeenCalledWith('featured_on_homepage', true);
    expect(query.order.mock.calls).toEqual([
      ['sort_order', { ascending: true }],
      ['published_at', { ascending: false, nullsFirst: false }],
    ]);
    expect(query.limit).toHaveBeenCalledWith(24);
    expect(seed.resultsByCategory.phone).toEqual(expect.objectContaining({ id: 'homepage-result' }));
    expect(seed.resultsByCategory.phone).not.toHaveProperty('before_image_path');
    expect(seed.resultsByCategory.phone).not.toHaveProperty('after_image_path');
  });

  it('fails closed to an empty safe seed when the public reader is unavailable or fails', async () => {
    createPublicRepairResultsClient.mockReturnValue(null);
    await expect(fetchHomepageRepairResultSeed()).resolves.toEqual({ resultsByCategory: {}, latestPublishedAt: null });

    const query = queryFor([], { message: 'unavailable' });
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });
    await expect(fetchHomepageRepairResultSeed()).resolves.toEqual({ resultsByCategory: {}, latestPublishedAt: null });
  });
});
