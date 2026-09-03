import { describe, expect, it } from 'vitest';

import {
  selectHomepageRepairResultSeed,
  type PublicRepairResult,
} from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'phone-first',
    device_category: 'phone',
    brand: 'Future Brand',
    brand_slug: 'future-brand',
    model: 'Future Phone 99',
    model_slug: 'future-phone-99',
    repair_type: 'Screen Replacement',
    repair_type_slug: 'screen-replacement',
    before_image_path: 'approved/before.webp',
    after_image_path: 'approved/after.webp',
    image_pair_alt_text: 'Approved repair proof',
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Future Phone screen repaired',
    short_description: 'Approved public proof.',
    status: 'published',
    privacy_checked: true,
    featured_on_homepage: true,
    featured_on_repair_hub: false,
    featured_on_brand_hub: false,
    sort_order: 10,
    related_repair_url: '/repairs/phone/future-brand/future-phone-99/screen-replacement',
    created_at: '2026-09-03T08:00:00.000Z',
    updated_at: '2026-09-03T08:00:00.000Z',
    published_at: '2026-09-03T09:00:00.000Z',
    ...overrides,
  };
}

describe('Homepage Repair Results initial seed selection', () => {
  it('keeps the ordered first public homepage result for each existing category and derives freshness only from those selections', () => {
    const seed = selectHomepageRepairResultSeed([
      result(),
      result({ id: 'tablet', device_category: 'tablet', sort_order: 11, published_at: null, created_at: '2026-09-06T09:00:00.000Z' }),
      result({ id: 'laptop', device_category: 'laptop', sort_order: 12, published_at: '2026-09-04T09:00:00.000Z' }),
      result({ id: 'watch', device_category: 'watch', sort_order: 13, published_at: '2026-09-02T09:00:00.000Z' }),
      result({ id: 'phone-later', sort_order: 20, published_at: '2026-09-05T09:00:00.000Z' }),
      result({ id: 'outside-selection', device_category: 'phone', sort_order: 21, published_at: '2026-09-10T09:00:00.000Z' }),
    ]);

    expect(Object.keys(seed.resultsByCategory)).toEqual(['phone', 'tablet', 'laptop', 'watch']);
    expect(seed.resultsByCategory.phone?.id).toBe('phone-first');
    expect(seed.resultsByCategory.tablet?.id).toBe('tablet');
    expect(seed.resultsByCategory.laptop?.id).toBe('laptop');
    expect(seed.resultsByCategory.watch?.id).toBe('watch');
    expect(seed.latestPublishedAt).toBe('2026-09-06T09:00:00.000Z');
    expect(seed.resultsByCategory.phone).not.toHaveProperty('before_image_path');
    expect(seed.resultsByCategory.phone).not.toHaveProperty('after_image_path');
  });

  it('rejects non-public or non-homepage records, is bounded to the first 24 query-ordered rows, and accepts arbitrary future models', () => {
    const candidates = Array.from({ length: 24 }, (_, index) => result({
      id: `private-${index}`,
      model: `Future Model ${index}`,
      model_slug: `future-model-${index}`,
      status: index === 0 ? 'draft' : 'published',
      privacy_checked: false,
    }));
    candidates.push(result({
      id: 'row-25',
      model: 'Future Model 25',
      model_slug: 'future-model-25',
      privacy_checked: true,
    }));

    const seed = selectHomepageRepairResultSeed(candidates);

    expect(seed.resultsByCategory).toEqual({});
    expect(seed.latestPublishedAt).toBeNull();
  });
});
