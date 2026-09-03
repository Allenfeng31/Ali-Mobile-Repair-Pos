import { describe, expect, it } from 'vitest';

import {
  selectCategoryHubRepairResultSeeds,
  selectHubRepairResults,
  type PublicRepairResult,
} from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'screen-first', device_category: 'phone', brand: 'Future Brand', brand_slug: 'future-brand',
    model: 'Future Phone', model_slug: 'future-phone', repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
    before_image_path: 'approved/before.webp', after_image_path: 'approved/after.webp', image_pair_alt_text: 'Approved proof',
    image_aspect_ratio: '4:3', before_image_width: 1200, before_image_height: 900, after_image_width: 1200, after_image_height: 900,
    title: 'Future Phone screen repaired', short_description: 'Approved public proof.', status: 'published', privacy_checked: true,
    featured_on_homepage: false, featured_on_repair_hub: true, featured_on_brand_hub: false, sort_order: 10,
    related_repair_url: '/repairs/phone/future-brand/future-phone/screen-replacement',
    created_at: '2026-09-03T08:00:00.000Z', updated_at: '2026-09-03T08:00:00.000Z', published_at: '2026-09-03T09:00:00.000Z',
    ...overrides,
  };
}

describe('Category Hub Repair Results selection', () => {
  it('keeps first eligible rows from the ordered source then returns the existing fixed four-group display order', () => {
    const selected = selectHubRepairResults([
      result({ id: 'battery-first', repair_type: 'Battery Replacement', repair_type_slug: 'battery-replacement' }),
      result({ id: 'screen-first' }),
      result({ id: 'charging-first', repair_type: 'Charging Port Replacement', repair_type_slug: 'charging-port-replacement' }),
      result({ id: 'housing-first', repair_type: 'Back Housing Replacement', repair_type_slug: 'back-housing-replacement' }),
      result({ id: 'screen-later', repair_type: 'Screen Repair', repair_type_slug: 'screen-repair' }),
    ]);

    expect(selected.map((entry) => entry.id)).toEqual(['screen-first', 'battery-first', 'charging-first', 'housing-first']);
    expect(selectCategoryHubRepairResultSeeds(selected, 'phone').map((entry) => entry.id))
      .toEqual(['screen-first', 'battery-first', 'charging-first', 'housing-first']);
  });

  it('uses trim-safe public gates, exact repair-hub placement, and only the first 50 ordered source rows without hardcoded models', () => {
    const candidates = Array.from({ length: 50 }, (_, index) => result({
      id: `excluded-${index}`,
      model: `Future Model ${index}`,
      model_slug: `future-model-${index}`,
      repair_type_slug: 'unrelated-repair',
      featured_on_repair_hub: index === 0,
      privacy_checked: false,
    }));
    candidates.push(result({ id: 'row-51', model: 'Future Model 51', model_slug: 'future-model-51' }));

    expect(selectHubRepairResults(candidates)).toEqual([]);
    expect(selectCategoryHubRepairResultSeeds([
      result({ id: 'draft', status: 'draft' }),
      result({ id: 'private', privacy_checked: false }),
      result({ id: 'not-featured', featured_on_repair_hub: false }),
      result({ id: 'missing-before', before_image_path: '  ' }),
      result({ id: 'missing-after', after_image_path: '  ' }),
      result({ id: 'future-tablet', device_category: 'tablet', model: 'Future Tablet', model_slug: 'future-tablet' }),
    ], 'tablet')).toEqual([expect.objectContaining({ id: 'future-tablet', model_slug: 'future-tablet' })]);
  });
});
