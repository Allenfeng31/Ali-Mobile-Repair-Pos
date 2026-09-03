import { describe, expect, it } from 'vitest';

import {
  selectModelRepairResultInitialSeeds,
  type PublicRepairResult,
} from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'screen-first',
    device_category: 'phone',
    brand: 'Future Brand',
    brand_slug: 'future-brand',
    model: 'Future Phone 99',
    model_slug: 'future-phone-99',
    repair_type: 'Screen Replacement',
    repair_type_slug: 'screen-replacement',
    before_image_path: 'approved/private-before.webp',
    after_image_path: 'approved/private-after.webp',
    image_pair_alt_text: 'Future repair result',
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Future screen repair',
    short_description: 'A public result.',
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

describe('Model Repair Result initial seed selection', () => {
  it('deduplicates alias-overlap IDs, prefers repair-type diversity in input order, and exposes only safe visual fields', () => {
    const seeds = selectModelRepairResultInitialSeeds([
      result(),
      result({ id: 'screen-duplicate', title: 'Later screen', repair_type_slug: 'screen-replacement' }),
      result({ id: 'battery', repair_type: 'Battery Replacement', repair_type_slug: 'battery-replacement' }),
      result({ id: 'screen-first', repair_type: 'Back Camera Replacement', repair_type_slug: 'back-camera-replacement' }),
      result({ id: 'camera', repair_type: 'Back Camera Replacement', repair_type_slug: 'back-camera-replacement' }),
    ]);

    expect(seeds.map((seed) => seed.id)).toEqual(['screen-first', 'battery', 'camera']);
    expect(seeds[0]).toEqual(expect.objectContaining({ model_slug: 'future-phone-99', repair_type_slug: 'screen-replacement' }));
    expect(seeds[0]).not.toHaveProperty('before_image_path');
    expect(seeds[0]).not.toHaveProperty('after_image_path');
  });

  it('uses duplicate repair types only after distinct types and supports arbitrary future identities', () => {
    const seeds = selectModelRepairResultInitialSeeds([
      result({ id: 'screen-one', repair_type_slug: 'screen-replacement' }),
      result({ id: 'screen-two', repair_type_slug: 'screen-replacement' }),
      result({ id: 'draft', repair_type_slug: 'battery-replacement', status: 'draft' }),
      result({ id: 'privacy-missing', repair_type_slug: 'back-camera-replacement', privacy_checked: false }),
    ]);

    expect(seeds.map((seed) => seed.id)).toEqual(['screen-one', 'screen-two']);
  });
});
