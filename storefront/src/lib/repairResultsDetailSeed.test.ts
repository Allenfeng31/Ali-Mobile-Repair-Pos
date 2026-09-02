import { describe, expect, it } from 'vitest';
import {
  selectDetailRepairResultInitialSeeds,
  type PublicRepairResult,
} from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'public-result-1',
    device_category: 'phone',
    brand: 'Future Brand',
    brand_slug: 'future-brand',
    model: 'Future Phone',
    model_slug: 'future-phone',
    repair_type: 'Future Repair',
    repair_type_slug: 'future-repair',
    before_image_path: 'approved/before.jpg',
    after_image_path: 'approved/after.jpg',
    image_pair_alt_text: 'Approved public repair result',
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Future repair proof',
    short_description: 'A privacy-checked published repair result.',
    status: 'published',
    privacy_checked: true,
    featured_on_homepage: false,
    featured_on_repair_hub: false,
    featured_on_brand_hub: false,
    sort_order: 10,
    related_repair_url: '/repairs/phone/future-brand/future-phone/future-repair',
    created_at: '2026-09-02T09:00:00.000Z',
    updated_at: '2026-09-02T09:00:00.000Z',
    published_at: '2026-09-02T09:00:00.000Z',
    ...overrides,
  };
}

describe('Repair Detail initial result seed', () => {
  it('projects one ordered public result into the existing safe matching-item shape', () => {
    const first = result();
    const second = result({ id: 'public-result-2', title: 'Second proof' });
    const unsafe = first as PublicRepairResult & Record<string, unknown>;
    unsafe.customer_name = 'Private Customer';
    unsafe.before_image_path = 'approved/private-before.jpg';

    const seeds = selectDetailRepairResultInitialSeeds([first, second]);

    expect(seeds).toEqual([{
      id: 'public-result-1',
      device_category: 'phone',
      brand: 'Future Brand',
      brand_slug: 'future-brand',
      model: 'Future Phone',
      model_slug: 'future-phone',
      repair_type: 'Future Repair',
      repair_type_slug: 'future-repair',
      title: 'Future repair proof',
      short_description: 'A privacy-checked published repair result.',
      image_pair_alt_text: 'Approved public repair result',
      related_repair_url: '/repairs/phone/future-brand/future-phone/future-repair',
    }]);
    expect(seeds[0]).not.toHaveProperty('before_image_path');
    expect(seeds[0]).not.toHaveProperty('after_image_path');
    expect(seeds[0]).not.toHaveProperty('customer_name');
  });

  it('does not seed unpublished, private, or incomplete-media records', () => {
    expect(selectDetailRepairResultInitialSeeds([
      result({ status: 'draft' }),
      result({ id: 'private', privacy_checked: false }),
      result({ id: 'missing-before', before_image_path: '' }),
      result({ id: 'missing-after', after_image_path: '' }),
    ])).toEqual([]);
  });
});
