import { describe, expect, it } from 'vitest';
import {
  buildCameraModuleRepairHierarchyModels,
  resolveCameraModuleRepairHierarchySelection,
  type CameraModuleRepairHierarchyCandidate,
} from './cameraModuleRepairHierarchy';
import { buildSharedRepairHierarchy } from './sharedRepairHierarchy';

function candidate({
  brandSlug,
  brand,
  modelSlug,
  model,
  price,
  variants,
  repairOrigin = 'pos',
}: {
  brandSlug: string;
  brand: string;
  modelSlug: string;
  model: string;
  price: number;
  variants?: Array<{ quality_grade: string; price: number; is_recommended: boolean }>;
  repairOrigin?: 'pos' | 'synthetic-backfill' | 'virtual';
}): CameraModuleRepairHierarchyCandidate {
  return {
    canonicalBrandSlug: brandSlug,
    displayBrand: brand,
    modelSlug,
    displayModel: model,
    repair: {
      slug: 'front-camera-replacement',
      name: 'Front Camera Replacement',
      price,
      variants,
      repairOrigin,
    },
  };
}

const candidates = [
  candidate({ brandSlug: 'huawei', brand: 'Huawei', modelSlug: 'p30-pro', model: 'P30 Pro', price: 99 }),
  candidate({ brandSlug: 'huawei', brand: 'Huawei', modelSlug: 'mate-20', model: 'Mate 20', price: 149, variants: [
    { quality_grade: 'Standard', price: 149, is_recommended: true },
    { quality_grade: 'Premium', price: 179, is_recommended: false },
  ] }),
  candidate({ brandSlug: 'htc', brand: 'HTC', modelSlug: 'u24', model: 'U24', price: 0 }),
  candidate({ brandSlug: 'future', brand: 'Future', modelSlug: 'one', model: 'One', price: 120, repairOrigin: 'synthetic-backfill' }),
];

describe('camera module hierarchy adapter', () => {
  it('maps already eligible exact camera candidates to server hierarchy records without changing order', () => {
    const models = buildCameraModuleRepairHierarchyModels({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
    });

    expect(models.map((model) => model.modelSlug)).toEqual(['p30-pro', 'mate-20', 'u24', 'one']);
    expect(models.map((model) => model.priceLabel)).toEqual(['$99', 'From $149', null, null]);
    expect(models.every((model) => model.repairLabel === 'Front Camera Replacement')).toBe(true);
    expect(models[0]?.bookingHref).toBe('/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=P30+Pro');
    expect(models.map((model) => model.priceLabel).join(' ')).not.toMatch(/Quote on Request|Starting from \$50/);
  });

  it('accepts only an exact brand and model pair, while brand-only state remains model-free', () => {
    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
      query: { brand: 'huawei' },
    })).toEqual({ selectedBrandSlug: 'huawei', selectedModelSlug: null });

    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
      query: { brand: 'huawei', model: 'p30-pro' },
    })).toEqual({ selectedBrandSlug: 'huawei', selectedModelSlug: 'p30-pro' });
  });

  it('feeds exact Front Camera models into the approved B1 grouping while unknown brands remain flat', () => {
    const hierarchy = buildSharedRepairHierarchy(buildCameraModuleRepairHierarchyModels({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
    }));

    expect(hierarchy.brands.map((brand) => brand.brandSlug)).toEqual(['huawei', 'htc', 'future']);
    expect(hierarchy.brands[0]?.series.map((series) => series.seriesKey)).toEqual(['mate', 'p']);
    expect(hierarchy.brands[0]?.series.flatMap((series) => series.models).map((model) => model.modelSlug)).toEqual(['mate-20', 'p30-pro']);
    expect(hierarchy.brands[1]?.series).toEqual([]);
    expect(hierarchy.brands[1]?.models.map((model) => model.modelSlug)).toEqual(['u24']);
  });

  it.each([
    { model: 'p30-pro' },
    { brand: 'invalid', model: 'p30-pro' },
    { brand: 'huawei', model: 'u24' },
    { brand: ['huawei', 'htc'], model: 'p30-pro' },
    { brand: 'huawei', model: ['p30-pro', 'mate-20'] },
    { brand: 'huawei', model: 'p30-pro', service: 'Logic Board Repair' },
  ])('fails closed for untrusted query state %j', (query) => {
    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
      query,
    })).toEqual({ selectedBrandSlug: null, selectedModelSlug: null });
  });
});
