import { describe, expect, it } from 'vitest';

import {
  selectSharedRepairPageResultSeeds,
  type PublicRepairResult,
} from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'result-1',
    device_category: 'phone',
    brand: 'Google Pixel',
    brand_slug: 'google-pixel',
    model: 'Pixel 8',
    model_slug: 'pixel-8',
    repair_type: 'Loudspeaker Replacement',
    repair_type_slug: 'loudspeaker-replacement',
    before_image_path: 'approved/before.jpg',
    after_image_path: 'approved/after.jpg',
    image_pair_alt_text: 'Approved repair result',
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Pixel loudspeaker restored',
    short_description: 'Published and privacy checked.',
    status: 'published',
    privacy_checked: true,
    featured_on_homepage: false,
    featured_on_repair_hub: false,
    featured_on_brand_hub: false,
    sort_order: 10,
    related_repair_url: '/historical-detail-url',
    created_at: '2026-09-01T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
    published_at: '2026-09-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('Shared Page V2 Repair Result selection', () => {
  it('uses canonical category, shared-brand and repair taxonomy rather than related_repair_url', () => {
    const selected = selectSharedRepairPageResultSeeds([
      result({ id: 'pixel-8', model_slug: 'pixel-8' }),
      result({ id: 'pixel-9', model: 'Pixel 9', model_slug: 'pixel-9', related_repair_url: null }),
      result({ id: 'wrong-repair', repair_type_slug: 'screen-replacement' }),
      result({ id: 'wrong-brand', brand_slug: 'samsung', brand: 'Samsung' }),
      result({ id: 'wrong-category', device_category: 'tablet' }),
    ], {
      category: 'phone',
      brandSlug: 'google-pixel',
      repairTypeSlug: 'loudspeaker-replacement',
      selectedModelSlug: 'pixel-8',
    });

    expect(selected.map((seed) => seed.id)).toEqual(['pixel-8', 'pixel-9']);
    expect(selected[0]).not.toHaveProperty('before_image_path');
    expect(selected[0]).not.toHaveProperty('after_image_path');
  });

  it('prioritizes the selected model, allows same-brand/same-repair fill, and caps display at five', () => {
    const rows = [
      result({ id: 'other-newest', model: 'Pixel 9', model_slug: 'pixel-9', published_at: '2026-09-06T09:00:00.000Z' }),
      result({ id: 'selected-older', model_slug: 'pixel-8', published_at: '2026-09-01T09:00:00.000Z' }),
      ...Array.from({ length: 6 }, (_, index) => result({
        id: `fill-${index}`,
        model: `Pixel ${index}`,
        model_slug: `pixel-${index}`,
        published_at: `2026-09-${String(index + 1).padStart(2, '0')}T09:00:00.000Z`,
      })),
    ];

    const selected = selectSharedRepairPageResultSeeds(rows, {
      category: 'phone', brandSlug: 'google-pixel', repairTypeSlug: 'loudspeaker-replacement', selectedModelSlug: 'pixel-8',
    });

    expect(selected).toHaveLength(5);
    expect(selected[0]?.id).toBe('selected-older');
    expect(selected.map((seed) => seed.id)).toContain('other-newest');
  });

  it('prioritizes a selected supported model independently of price-candidate membership', () => {
    const selected = selectSharedRepairPageResultSeeds([
      result({ id: 'pixel-8-newer', model_slug: 'pixel-8', published_at: '2026-09-06T09:00:00.000Z' }),
      result({ id: 'pixel-9a', model: 'Pixel 9a', model_slug: 'pixel-9a', published_at: '2026-09-01T09:00:00.000Z' }),
    ], {
      category: 'phone', brandSlug: 'google-pixel', repairTypeSlug: 'loudspeaker-replacement', selectedModelSlug: 'pixel-9a',
    });

    expect(selected[0]?.id).toBe('pixel-9a');
  });

  it('matches and prioritizes selected Google Pixel Earpiece Speaker proof by exact repair identity', () => {
    const selected = selectSharedRepairPageResultSeeds([
      result({ id: 'earpiece-pixel-8', repair_type: 'Earpiece Speaker Replacement', repair_type_slug: 'earpiece-speaker-replacement', published_at: '2026-09-06T09:00:00.000Z' }),
      result({ id: 'earpiece-pixel-9a', model: 'Pixel 9a', model_slug: 'pixel-9a', repair_type: 'Earpiece Speaker Replacement', repair_type_slug: 'earpiece-speaker-replacement', published_at: '2026-09-01T09:00:00.000Z' }),
      result({ id: 'wrong-loudspeaker', repair_type_slug: 'loudspeaker-replacement' }),
    ], {
      category: 'phone', brandSlug: 'google-pixel', repairTypeSlug: 'earpiece-speaker-replacement', selectedModelSlug: 'pixel-9a',
    });

    expect(selected.map((seed) => seed.id)).toEqual(['earpiece-pixel-9a', 'earpiece-pixel-8']);
  });

  it('prioritizes a selected catalogue-only Pixel 10a result without a price candidate', () => {
    const selected = selectSharedRepairPageResultSeeds([
      result({ id: 'pixel-8-newer', model_slug: 'pixel-8', published_at: '2026-09-06T09:00:00.000Z' }),
      result({ id: 'pixel-10a', model: 'Pixel 10a', model_slug: 'pixel-10a', published_at: '2026-09-01T09:00:00.000Z' }),
    ], {
      category: 'phone', brandSlug: 'google-pixel', repairTypeSlug: 'loudspeaker-replacement', selectedModelSlug: 'pixel-10a',
    });

    expect(selected[0]?.id).toBe('pixel-10a');
  });

  it('does not reinterpret independent placement flags or migrate historical records', () => {
    const homepage = result({ id: 'homepage', featured_on_homepage: true, featured_on_repair_hub: false, featured_on_brand_hub: false });
    const brandHub = result({ id: 'brand-hub', featured_on_homepage: false, featured_on_repair_hub: false, featured_on_brand_hub: true });
    const before = structuredClone([homepage, brandHub]);

    expect(selectSharedRepairPageResultSeeds([homepage, brandHub], {
      category: 'phone', brandSlug: 'google-pixel', repairTypeSlug: 'loudspeaker-replacement',
    }).map((seed) => seed.id)).toEqual(['brand-hub', 'homepage']);
    expect([homepage, brandHub]).toEqual(before);
  });
});
