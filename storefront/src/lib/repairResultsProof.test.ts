import { describe, expect, it } from 'vitest';
import {
  selectRepairTypeHubRepairResultSeeds,
  selectServerRepairResultProofs,
  type PublicRepairResult,
} from './repair-results';

function result(overrides: Partial<PublicRepairResult> = {}): PublicRepairResult {
  return {
    id: 'result-1',
    device_category: 'phone',
    brand: 'Samsung',
    brand_slug: 'samsung',
    model: 'Galaxy S21 Ultra',
    model_slug: 'galaxy-s21-ultra',
    repair_type: 'Back Camera Replacement',
    repair_type_slug: 'back-camera-replacement',
    before_image_path: 'approved/result-1-before.jpg',
    after_image_path: 'approved/result-1-after.jpg',
    image_pair_alt_text: 'Approved repair result',
    image_aspect_ratio: '4:3',
    before_image_width: 1200,
    before_image_height: 900,
    after_image_width: 1200,
    after_image_height: 900,
    title: 'Galaxy S21 Ultra back camera restored',
    short_description: 'A published, privacy-checked repair result.',
    status: 'published',
    privacy_checked: true,
    featured_on_homepage: false,
    featured_on_repair_hub: false,
    featured_on_brand_hub: false,
    sort_order: 10,
    related_repair_url: '/repairs/phone/samsung/galaxy-s21-ultra/back-camera-replacement',
    created_at: '2026-09-01T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
    published_at: '2026-09-01T09:00:00.000Z',
    ...overrides,
  };
}

describe('server repair result proofs', () => {
  it('selects the existing phone repair-type hub aliases in source order as safe max-three visual seeds', () => {
    const rows = [
      result({ id: 'screen-alias', repair_type_slug: 'screen-repair' }),
      result({ id: 'screen-current', repair_type_slug: 'screen-replacement' }),
      result({ id: 'screen-third', repair_type_slug: 'screen-replacement' }),
      result({ id: 'screen-fourth', repair_type_slug: 'screen-replacement' }),
      result({ id: 'tablet', device_category: 'tablet', repair_type_slug: 'screen-replacement' }),
      result({ id: 'unsupported', repair_type_slug: 'housing-replacement' }),
    ];

    const seeds = selectRepairTypeHubRepairResultSeeds(rows, 'phone', 'screen-replacement');

    expect(seeds.map((seed) => seed.id)).toEqual(['screen-alias', 'screen-current', 'screen-third']);
    expect(seeds[0]).toMatchObject({ image_pair_alt_text: 'Approved repair result' });
    expect(seeds[0]).not.toHaveProperty('before_image_path');
    expect(seeds[0]).not.toHaveProperty('after_image_path');
  });

  it.each([
    ['screen-replacement', ['screen-replacement', 'screen-repair']],
    ['battery-replacement', ['battery-replacement', 'battery-service', 'battery-repair']],
    ['charging-port-replacement', ['charging-port-replacement', 'charging-port-repair', 'charging-port']],
    ['back-glass-replacement', ['back-glass-replacement', 'back-housing-replacement', 'back-glass', 'back-housing']],
  ])('selects every existing %s alias without introducing new aliases', (canonicalSlug, aliases) => {
    const rows = aliases.map((repair_type_slug, index) => result({ id: `${canonicalSlug}-${index}`, repair_type_slug }));
    const seeds = selectRepairTypeHubRepairResultSeeds(rows, 'phone', canonicalSlug);

    expect(seeds.map((seed) => seed.repair_type_slug)).toEqual(aliases.slice(0, 3));
    for (const alias of aliases) {
      expect(selectRepairTypeHubRepairResultSeeds([result({ repair_type_slug: alias })], 'phone', canonicalSlug))
        .toEqual([expect.objectContaining({ repair_type_slug: alias })]);
    }
    for (const unsupported of ['housing-replacement', 'back-cover-replacement', 'rear-glass']) {
      expect(selectRepairTypeHubRepairResultSeeds([result({ repair_type_slug: unsupported })], 'phone', canonicalSlug)).toEqual([]);
    }
  });

  it('requires public eligibility and exact category without adding diversity rules', () => {
    const rows = [
      result({ id: 'published-one', model_slug: 'future-phone', repair_type_slug: 'screen-replacement' }),
      result({ id: 'published-two', model_slug: 'future-phone', repair_type_slug: 'screen-repair' }),
      result({ id: 'draft', status: 'draft', repair_type_slug: 'screen-replacement' }),
      result({ id: 'private', privacy_checked: false, repair_type_slug: 'screen-replacement' }),
      result({ id: 'before-missing', before_image_path: '', repair_type_slug: 'screen-replacement' }),
      result({ id: 'after-missing', after_image_path: '', repair_type_slug: 'screen-replacement' }),
      result({ id: 'tablet', device_category: 'tablet', repair_type_slug: 'screen-replacement' }),
    ];

    expect(selectRepairTypeHubRepairResultSeeds(rows, 'phone', 'screen-replacement').map((seed) => seed.id))
      .toEqual(['published-one', 'published-two']);
  });
  it('uses existing placement flags and canonical taxonomy without a current inventory allowlist', () => {
    const homepage = result({ id: 'homepage', featured_on_homepage: true });
    const repairHub = result({ id: 'repair-hub', featured_on_repair_hub: true });
    const brandHub = result({ id: 'brand-hub', featured_on_brand_hub: true });
    const future = result({
      id: 'future',
      brand: 'Future Brand',
      brand_slug: 'future-brand',
      model: 'Future Phone 99',
      model_slug: 'future-phone-99',
      repair_type: 'Future Camera Repair',
      repair_type_slug: 'future-camera-repair',
      related_repair_url: '/repairs/phone/future-brand/future-phone-99/future-camera-repair',
    });
    const records = [homepage, repairHub, brandHub, future];

    expect(selectServerRepairResultProofs(records, { surface: 'homepage' }).map(({ title }) => title)).toEqual(['Galaxy S21 Ultra back camera restored']);
    expect(selectServerRepairResultProofs(records, { surface: 'repair-hub', category: 'phone' }).map(({ title }) => title)).toEqual(['Galaxy S21 Ultra back camera restored']);
    expect(selectServerRepairResultProofs(records, { surface: 'brand-hub', category: 'phone', brandSlug: 'samsung' }).map(({ title }) => title)).toEqual(['Galaxy S21 Ultra back camera restored']);
    expect(selectServerRepairResultProofs(records, {
      surface: 'model-hub', category: 'phone', brandSlug: 'future-brand', modelSlug: 'future-phone-99',
    }).map(({ model_slug }) => model_slug)).toEqual(['future-phone-99']);
    expect(selectServerRepairResultProofs(records, {
      surface: 'repair-detail', category: 'phone', brandSlug: 'future-brand', modelSlug: 'future-phone-99', repairTypeSlug: 'future-camera-repair',
    }).map(({ model_slug }) => model_slug)).toEqual(['future-phone-99']);
  });

  it('rejects wrong taxonomy, unpublished records, records without privacy approval, and missing public media', () => {
    const exact = result();
    const wrongModel = result({ id: 'wrong-model', model_slug: 'galaxy-s21', model: 'Galaxy S21' });
    const wrongRepair = result({ id: 'wrong-repair', repair_type_slug: 'screen-replacement' });
    const wrongBrand = result({ id: 'wrong-brand', brand_slug: 'oppo', brand: 'OPPO' });
    const draft = result({ id: 'draft', status: 'draft' });
    const privateResult = result({ id: 'private', privacy_checked: false });
    const missingMedia = result({ id: 'missing-media', before_image_path: '' });
    const request = {
      surface: 'repair-detail' as const,
      category: 'phone' as const,
      brandSlug: 'samsung',
      modelSlug: 'galaxy-s21-ultra',
      repairTypeSlug: 'back-camera-replacement',
    };

    expect(selectServerRepairResultProofs([exact, wrongModel, wrongRepair, wrongBrand, draft, privateResult, missingMedia], request)).toHaveLength(1);
    expect(selectServerRepairResultProofs([exact], { ...request, modelSlug: 'galaxy-s21' })).toEqual([]);
    expect(selectServerRepairResultProofs([exact], { ...request, repairTypeSlug: 'screen-replacement' })).toEqual([]);
    expect(selectServerRepairResultProofs([exact], { ...request, brandSlug: 'oppo' })).toEqual([]);
  });

  it('uses the existing generic repair hub alias definition', () => {
    const aliasResult = result({ repair_type_slug: 'screen-repair' });

    expect(selectServerRepairResultProofs([aliasResult], {
      surface: 'repair-type-hub', category: 'phone', repairTypeSlug: 'screen-replacement',
    })).toHaveLength(1);
  });

  it('returns a bounded, deterministic, non-mutating safe presentation shape', () => {
    const records = Array.from({ length: 6 }, (_, index) => result({
      id: `result-${index}`,
      published_at: `2026-09-0${index + 1}T09:00:00.000Z`,
      title: `Result ${index}`,
      featured_on_homepage: true,
    }));
    const unsafe = records[0] as PublicRepairResult & Record<string, unknown>;
    unsafe.customer_name = 'Private Customer';
    unsafe.customer_phone = '0400000000';
    unsafe.customer_email = 'private@example.com';
    unsafe.imei = 'private-imei';
    unsafe.serial_number = 'private-serial';
    unsafe.booking_id = 'private-booking';
    unsafe.technician_notes = 'private technician note';
    const snapshot = structuredClone(records);

    const proofs = selectServerRepairResultProofs(records, { surface: 'homepage', limit: 99 });

    expect(proofs).toHaveLength(4);
    expect(proofs[0]).toEqual({
      device_category: 'phone', brand: 'Samsung', brand_slug: 'samsung', model: 'Galaxy S21 Ultra', model_slug: 'galaxy-s21-ultra',
      repair_type: 'Back Camera Replacement', repair_type_slug: 'back-camera-replacement', title: 'Result 5',
      short_description: 'A published, privacy-checked repair result.', related_repair_url: '/repairs/phone/samsung/galaxy-s21-ultra/back-camera-replacement',
    });
    expect(Object.keys(proofs[0]).sort()).toEqual([
      'brand', 'brand_slug', 'device_category', 'model', 'model_slug', 'related_repair_url', 'repair_type', 'repair_type_slug', 'short_description', 'title',
    ]);
    expect(proofs).not.toContainEqual(expect.objectContaining({
      before_image_path: expect.anything(), after_image_path: expect.anything(), sort_order: expect.anything(), created_at: expect.anything(), updated_at: expect.anything(),
      customer_name: expect.anything(), customer_phone: expect.anything(), customer_email: expect.anything(), imei: expect.anything(), serial_number: expect.anything(), booking_id: expect.anything(), technician_notes: expect.anything(),
    }));
    expect(records).toEqual(snapshot);
  });

  it('returns an empty list safely when no record matches', () => {
    expect(selectServerRepairResultProofs([], { surface: 'model-hub', category: 'phone', brandSlug: 'future-brand', modelSlug: 'future-phone-99' })).toEqual([]);
  });
});
