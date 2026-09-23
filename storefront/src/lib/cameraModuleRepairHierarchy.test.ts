import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  repairSlug = 'front-camera-replacement',
}: {
  brandSlug: string;
  brand: string;
  modelSlug: string;
  model: string;
  price: number;
  variants?: Array<{ quality_grade: string; price: number; is_recommended: boolean }>;
  repairOrigin?: 'pos' | 'synthetic-backfill' | 'virtual';
  repairSlug?: 'front-camera-replacement' | 'back-camera-replacement';
}): CameraModuleRepairHierarchyCandidate {
  return {
    canonicalBrandSlug: brandSlug,
    displayBrand: brand,
    modelSlug,
    displayModel: model,
    repair: {
      slug: repairSlug,
      name: repairSlug === 'front-camera-replacement' ? 'Front Camera Replacement' : 'Back Camera Replacement',
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

const missingBackPriceCandidate = candidate({ brandSlug: 'nokia', brand: 'Nokia', modelSlug: 'g60', model: 'G60', price: 0, repairSlug: 'back-camera-replacement' });
missingBackPriceCandidate.repair.price = undefined as unknown as number;

const backCandidates = [
  candidate({ brandSlug: 'huawei', brand: 'Huawei', modelSlug: 'p60-pro', model: 'P60 Pro', price: 129, repairSlug: 'back-camera-replacement' }),
  candidate({ brandSlug: 'oppo', brand: 'OPPO', modelSlug: 'find-x8-pro', model: 'Find X8 Pro', price: 0, repairSlug: 'back-camera-replacement' }),
  candidate({ brandSlug: 'oppo', brand: 'OPPO', modelSlug: 'reno-12', model: 'Reno 12', price: 159, repairSlug: 'back-camera-replacement', variants: [
    { quality_grade: 'Standard', price: 159, is_recommended: true },
    { quality_grade: 'Premium', price: 189, is_recommended: false },
  ] }),
  candidate({ brandSlug: 'motorola', brand: 'Motorola', modelSlug: 'edge-50', model: 'Edge 50', price: Number.NaN, repairSlug: 'back-camera-replacement' }),
  candidate({ brandSlug: 'future', brand: 'Future', modelSlug: 'one', model: 'One', price: 120, repairOrigin: 'synthetic-backfill', repairSlug: 'back-camera-replacement' }),
  candidate({ brandSlug: 'virtual', brand: 'Virtual', modelSlug: 'one', model: 'One', price: 50, repairOrigin: 'virtual', repairSlug: 'back-camera-replacement' }),
  missingBackPriceCandidate,
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
    expect(models[0]?.bookingHref).toBe('/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=P30+Pro&brandSlug=huawei&modelSlug=p30-pro&serviceSlug=front-camera-replacement');
    expect(models.map((model) => model.priceLabel).join(' ')).not.toMatch(/Quote on Request|Starting from \$50/);
  });

  it('accepts only an exact brand and model pair, while brand-only state remains model-free', () => {
    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
      query: { brand: 'huawei' },
    })).toEqual({ selectedBrandSlug: 'huawei', selectedModelSlug: null, selectedDevice: null });

    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
      query: { brand: 'huawei', model: 'p30-pro' },
    })).toMatchObject({
      selectedBrandSlug: 'huawei',
      selectedModelSlug: 'p30-pro',
      selectedDevice: {
        selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'P30 Pro', modelSlug: 'p30-pro' },
        selectedRepair: { name: 'Front Camera Replacement', serviceSlug: 'front-camera-replacement' },
        booking: { href: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=P30+Pro&brandSlug=huawei&modelSlug=p30-pro&serviceSlug=front-camera-replacement' },
      },
    });
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

  it('promotes a future supported Camera model only after the same exact brand and model validation', () => {
    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'front-camera-replacement',
      bookingService: 'Front Camera Replacement',
      candidates,
      query: { brand: 'future', model: 'one' },
    })).toMatchObject({
      selectedBrandSlug: 'future',
      selectedModelSlug: 'one',
      selectedDevice: {
        selectedDevice: { brand: 'Future', model: 'One' },
        booking: { href: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Future&model=One&brandSlug=future&modelSlug=one&serviceSlug=front-camera-replacement' },
      },
    });
  });

  it('uses only exact trusted Back Camera prices and never a model-hub starting-price fallback', () => {
    const models = buildCameraModuleRepairHierarchyModels({
      repairSlug: 'back-camera-replacement',
      bookingService: 'Back Camera Replacement',
      candidates: backCandidates,
    });

    expect(models.map((model) => model.priceLabel)).toEqual(['$129', null, 'From $159', null, null, null, null]);
    expect(models[0]?.bookingHref).toBe('/book-repair?category=phone&service=Back+Camera+Replacement&brand=Huawei&model=P60+Pro&brandSlug=huawei&modelSlug=p60-pro&serviceSlug=back-camera-replacement');
    expect(models.map((model) => model.priceLabel).join(' ')).not.toMatch(/Quote on Request|Starting from \$50|\$50/);
    expect(readFileSync(resolve(process.cwd(), 'src/lib/cameraModuleRepairHierarchy.ts'), 'utf8')).not.toContain('getStartingPrice');
  });

  it('uses B1 grouping for Back Camera while flat and unknown eligible brands remain direct', () => {
    const hierarchy = buildSharedRepairHierarchy(buildCameraModuleRepairHierarchyModels({
      repairSlug: 'back-camera-replacement',
      bookingService: 'Back Camera Replacement',
      candidates: backCandidates,
    }));

    expect(hierarchy.brands.map((brand) => brand.brandSlug)).toEqual(['huawei', 'oppo', 'motorola', 'future', 'virtual', 'nokia']);
    expect(hierarchy.brands[1]?.series.map((series) => series.seriesKey)).toEqual(['find', 'reno']);
    expect(hierarchy.brands[2]?.series).toEqual([]);
    expect(hierarchy.brands[2]?.models.map((model) => model.modelSlug)).toEqual(['edge-50']);
    expect(hierarchy.brands[3]?.series).toEqual([]);
  });

  it('opens a selected Back Camera model after five without reordering its flat model list', () => {
    const longCandidates = Array.from({ length: 6 }, (_, index) => candidate({
      brandSlug: 'motorola', brand: 'Motorola', modelSlug: `edge-${index + 1}`, model: `Edge ${index + 1}`, price: 100 + index, repairSlug: 'back-camera-replacement',
    }));
    const hierarchy = buildSharedRepairHierarchy(buildCameraModuleRepairHierarchyModels({
      repairSlug: 'back-camera-replacement', bookingService: 'Back Camera Replacement', candidates: longCandidates,
    }), { selectedBrandSlug: 'motorola', selectedModelSlug: 'edge-6' });

    expect(hierarchy.brands[0]?.initiallyExpandedModelList).toBe(true);
    expect(hierarchy.brands[0]?.models.map((model) => model.modelSlug)).toEqual(['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5', 'edge-6']);
  });

  it('applies the same fail-closed Back Camera query contract', () => {
    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'back-camera-replacement', bookingService: 'Back Camera Replacement', candidates: backCandidates, query: { brand: 'oppo' },
    })).toEqual({ selectedBrandSlug: 'oppo', selectedModelSlug: null, selectedDevice: null });
    expect(resolveCameraModuleRepairHierarchySelection({
      repairSlug: 'back-camera-replacement', bookingService: 'Back Camera Replacement', candidates: backCandidates, query: { brand: 'oppo', model: 'reno-12' },
    })).toMatchObject({
      selectedBrandSlug: 'oppo',
      selectedModelSlug: 'reno-12',
      selectedDevice: {
        selectedDevice: { brand: 'OPPO', brandSlug: 'oppo', model: 'Reno 12', modelSlug: 'reno-12' },
        selectedRepair: { name: 'Back Camera Replacement', serviceSlug: 'back-camera-replacement' },
        booking: { href: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=OPPO&model=Reno+12&brandSlug=oppo&modelSlug=reno-12&serviceSlug=back-camera-replacement' },
      },
    });

    for (const query of [
      { model: 'reno-12' },
      { brand: 'huawei', model: 'reno-12' },
      { brand: ['oppo', 'huawei'], model: 'reno-12' },
      { brand: 'oppo', model: ['reno-12', 'find-x8-pro'] },
      { brand: 'oppo', model: 'reno-12', service: 'Front Camera Replacement' },
    ]) {
      expect(resolveCameraModuleRepairHierarchySelection({
        repairSlug: 'back-camera-replacement', bookingService: 'Back Camera Replacement', candidates: backCandidates, query,
      })).toEqual({ selectedBrandSlug: null, selectedModelSlug: null, selectedDevice: null });
    }
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
    })).toEqual({ selectedBrandSlug: null, selectedModelSlug: null, selectedDevice: null });
  });
});
