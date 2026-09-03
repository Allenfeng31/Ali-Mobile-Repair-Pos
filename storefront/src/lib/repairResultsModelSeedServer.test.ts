import { afterEach, describe, expect, it, vi } from 'vitest';

const createPublicRepairResultsClient = vi.hoisted(() => vi.fn());

vi.mock('./repair-results', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./repair-results')>()),
  createPublicRepairResultsClient,
}));

import { fetchModelRepairResultSeeds } from './repair-results.server';
import type { PublicRepairResult } from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'exact-screen',
    device_category: 'phone',
    brand: 'Future Brand',
    brand_slug: 'future-brand',
    model: 'Future Phone 99',
    model_slug: 'future-phone-99',
    repair_type: 'Screen Replacement',
    repair_type_slug: 'screen-replacement',
    before_image_path: 'approved/before.webp',
    after_image_path: 'approved/after.webp',
    image_pair_alt_text: 'Public proof',
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Exact repair proof',
    short_description: 'Published and privacy-checked.',
    status: 'published',
    privacy_checked: true,
    featured_on_homepage: false,
    featured_on_repair_hub: false,
    featured_on_brand_hub: false,
    sort_order: 10,
    related_repair_url: '/repairs/phone/future-brand/future-phone-99/screen-replacement',
    created_at: '2026-09-03T00:00:00.000Z',
    updated_at: '2026-09-03T00:00:00.000Z',
    published_at: '2026-09-03T00:00:00.000Z',
    ...overrides,
  };
}

function queryFor(rows: PublicRepairResult[]) {
  const conditions: Array<(row: PublicRepairResult) => boolean> = [];
  const query = {
    select: vi.fn(),
    eq: vi.fn((field: keyof PublicRepairResult, value: unknown) => {
      conditions.push((row) => row[field] === value);
      return query;
    }),
    neq: vi.fn((field: keyof PublicRepairResult, value: unknown) => {
      conditions.push((row) => row[field] !== value);
      return query;
    }),
    order: vi.fn(() => query),
    limit: vi.fn((limit: number) => Promise.resolve({ data: rows.filter((row) => conditions.every((condition) => condition(row))).slice(0, limit), error: null })),
  };
  query.select.mockReturnValue(query);
  return query;
}

describe('server Model Hub initial result reader', () => {
  afterEach(() => createPublicRepairResultsClient.mockReset());

  it('uses exact category, alias brand, and model equality with ordered bounded safe visual seeds', async () => {
    const query = queryFor([
      result(),
      result({ id: 'battery', repair_type: 'Battery Replacement', repair_type_slug: 'battery-replacement' }),
      result({ id: 'sibling', model_slug: 'future-phone-98' }),
      result({ id: 'wrong-category', device_category: 'tablet' }),
      result({ id: 'wrong-brand', brand_slug: 'other-brand' }),
      result({ id: 'url-prefix-only', model_slug: 'future-phone-98', related_repair_url: '/repairs/phone/future-brand/future-phone-99/screen-replacement' }),
      result({ id: 'draft', status: 'draft' }),
      result({ id: 'privacy-missing', privacy_checked: false }),
      result({ id: 'before-missing', before_image_path: '' }),
      result({ id: 'after-missing', after_image_path: '' }),
    ]);
    createPublicRepairResultsClient.mockReturnValue({ from: vi.fn(() => query) });

    const seeds = await fetchModelRepairResultSeeds({ category: 'phone', brandSlug: 'future-brand', modelSlug: 'future-phone-99' });

    expect(query.eq).toHaveBeenCalledWith('device_category', 'phone');
    expect(query.eq).toHaveBeenCalledWith('brand_slug', 'future-brand');
    expect(query.eq).toHaveBeenCalledWith('model_slug', 'future-phone-99');
    expect(query.order.mock.calls).toEqual([
      ['featured_on_homepage', { ascending: false }],
      ['sort_order', { ascending: true }],
      ['published_at', { ascending: false, nullsFirst: false }],
      ['updated_at', { ascending: false }],
    ]);
    expect(query.limit).toHaveBeenCalledWith(12);
    expect(seeds.map((seed) => seed.id)).toEqual(['exact-screen', 'battery']);
    expect(seeds[0]).not.toHaveProperty('before_image_path');
    expect(seeds[0]).not.toHaveProperty('after_image_path');
  });

  it('bounds iPhone alias fanout to two queries, 12 rows each, and three output seeds', async () => {
    const queries = [
      queryFor([result({ id: 'iphone-screen', brand_slug: 'iphone', model_slug: 'iphone-16-pro' })]),
      queryFor([
        result({ id: 'apple-battery', brand_slug: 'apple', model_slug: 'iphone-16-pro', repair_type: 'Battery Replacement', repair_type_slug: 'battery-replacement' }),
        result({ id: 'apple-camera', brand_slug: 'apple', model_slug: 'iphone-16-pro', repair_type: 'Back Camera Replacement', repair_type_slug: 'back-camera-replacement' }),
        result({ id: 'apple-overflow', brand_slug: 'apple', model_slug: 'iphone-16-pro', repair_type: 'Charging Port Replacement', repair_type_slug: 'charging-port-replacement' }),
      ]),
    ];
    const from = vi.fn(() => queries.shift());
    createPublicRepairResultsClient.mockReturnValue({ from });

    const seeds = await fetchModelRepairResultSeeds({ category: 'phone', brandSlug: 'iphone', modelSlug: 'iphone-16-pro' });

    expect(from).toHaveBeenCalledTimes(2);
    expect(seeds.map((seed) => seed.id)).toEqual(['iphone-screen', 'apple-battery', 'apple-camera']);
    expect(seeds).toHaveLength(3);
  });
});
