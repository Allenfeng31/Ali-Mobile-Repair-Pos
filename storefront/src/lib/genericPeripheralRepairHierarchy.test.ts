import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildGenericPeripheralRepairHierarchyModels,
  resolveGenericPeripheralRepairHierarchySelection,
  type GenericPeripheralRepairHierarchyCandidate,
} from './genericPeripheralRepairHierarchy';
import { buildSharedRepairHierarchy } from './sharedRepairHierarchy';

function candidate({
  brandSlug,
  brand,
  modelSlug,
  model,
  repair,
}: {
  brandSlug: string;
  brand: string;
  modelSlug: string;
  model: string;
  repair?: GenericPeripheralRepairHierarchyCandidate['repair'];
}): GenericPeripheralRepairHierarchyCandidate {
  return { canonicalBrandSlug: brandSlug, displayBrand: brand, modelSlug, displayModel: model, repair };
}

const loudspeaker = (price: unknown, repairOrigin: 'pos' | 'virtual' | 'synthetic-backfill' = 'pos', variants?: Array<{ quality_grade: string; price: number; is_recommended: boolean }>) => ({
  slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: price as number, variants, repairOrigin,
});

const candidates = [
  candidate({ brandSlug: 'huawei', brand: 'Huawei', modelSlug: 'mate-20', model: 'Mate 20', repair: loudspeaker(79) }),
  candidate({ brandSlug: 'huawei', brand: 'Huawei', modelSlug: 'p30', model: 'P30' }),
  candidate({ brandSlug: 'xiaomi', brand: 'Xiaomi', modelSlug: 'redmi-note-12', model: 'Redmi Note 12', repair: loudspeaker(149, 'pos', [{ quality_grade: 'Standard', price: 149, is_recommended: true }, { quality_grade: 'Premium', price: 179, is_recommended: false }]) }),
  candidate({ brandSlug: 'htc', brand: 'HTC', modelSlug: 'u24', model: 'U24', repair: loudspeaker(0) }),
  candidate({ brandSlug: 'future', brand: 'Future', modelSlug: 'one', model: 'One', repair: loudspeaker(50, 'virtual') }),
  candidate({ brandSlug: 'motorola', brand: 'Motorola', modelSlug: 'edge-50', model: 'Edge 50', repair: loudspeaker(Number.NaN) }),
  candidate({ brandSlug: 'nokia', brand: 'Nokia', modelSlug: 'g60', model: 'G60', repair: loudspeaker(undefined) }),
  candidate({ brandSlug: 'vivo', brand: 'Vivo', modelSlug: 'x100', model: 'X100', repair: loudspeaker(99, 'synthetic-backfill') }),
];

describe('generic peripheral hierarchy adapter', () => {
  it('keeps every pre-approved secondary candidate visible while rendering only exact positive POS prices', () => {
    const models = buildGenericPeripheralRepairHierarchyModels({ repairSlug: 'loudspeaker-replacement', bookingService: 'Loudspeaker Replacement', candidates });

    expect(models.map((model) => model.modelSlug)).toEqual(candidates.map((candidate) => candidate.modelSlug));
    expect(models.map((model) => model.priceLabel)).toEqual(['$79', null, 'From $149', null, null, null, null, null]);
    expect(models[0]?.bookingHref).toBe('/book-repair?category=phone&service=Loudspeaker+Replacement&brand=Huawei&model=Mate+20&brandSlug=huawei&modelSlug=mate-20&serviceSlug=loudspeaker-replacement');
    expect(models.map((model) => model.priceLabel).join(' ')).not.toMatch(/Quote on Request|Starting from \$50|\$50/);
  });

  it('reuses B1 grouping without making flat or unknown brands ineligible', () => {
    const hierarchy = buildSharedRepairHierarchy(buildGenericPeripheralRepairHierarchyModels({ repairSlug: 'loudspeaker-replacement', bookingService: 'Loudspeaker Replacement', candidates }));
    expect(hierarchy.brands[0]?.series.map((series) => series.seriesKey)).toEqual(['mate', 'p']);
    expect(hierarchy.brands.find((brand) => brand.brandSlug === 'htc')?.models.map((model) => model.modelSlug)).toEqual(['u24']);
    expect(hierarchy.brands.find((brand) => brand.brandSlug === 'future')?.models.map((model) => model.modelSlug)).toEqual(['one']);
  });

  it('uses paired, server-trusted query identity and fails closed for untrusted query shapes', () => {
    const input = { repairSlug: 'loudspeaker-replacement' as const, bookingService: 'Loudspeaker Replacement', candidates };
    expect(resolveGenericPeripheralRepairHierarchySelection({ ...input, query: { brand: 'huawei' } })).toEqual({ selectedBrandSlug: 'huawei', selectedModelSlug: null, selectedDevice: null });
    expect(resolveGenericPeripheralRepairHierarchySelection({ ...input, query: { brand: 'huawei', model: 'p30' } })).toMatchObject({
      selectedBrandSlug: 'huawei',
      selectedModelSlug: 'p30',
      selectedDevice: {
        selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'P30', modelSlug: 'p30' },
        selectedRepair: { name: 'Loudspeaker Replacement', serviceSlug: 'loudspeaker-replacement' },
        booking: { href: '/book-repair?category=phone&service=Loudspeaker+Replacement&brand=Huawei&model=P30&brandSlug=huawei&modelSlug=p30&serviceSlug=loudspeaker-replacement', isAvailable: true },
      },
    });
    for (const query of [
      { model: 'p30' }, { brand: 'invalid' }, { brand: 'huawei', model: 'u24' },
      { brand: ['huawei', 'htc'] }, { brand: 'huawei', model: ['p30', 'mate-20'] },
      { brand: 'huawei', service: 'Logic Board Repair' },
    ]) {
      expect(resolveGenericPeripheralRepairHierarchySelection({ ...input, query })).toEqual({ selectedBrandSlug: null, selectedModelSlug: null, selectedDevice: null });
    }
  });

  it('gives future eligible models the same selected-device contract without hardcoding them', () => {
    expect(resolveGenericPeripheralRepairHierarchySelection({
      repairSlug: 'loudspeaker-replacement',
      bookingService: 'Loudspeaker Replacement',
      candidates: [candidate({ brandSlug: 'future', brand: 'Future', modelSlug: 'one', model: 'One' })],
      query: { brand: 'future', model: 'one' },
    })).toMatchObject({
      selectedDevice: {
        selectedDevice: { brand: 'Future', brandSlug: 'future', model: 'One', modelSlug: 'one' },
      },
    });
  });

  it('expands a selected sixth model without moving it and avoids virtual/model-hub price paths', () => {
    const longCandidates = Array.from({ length: 6 }, (_, index) => candidate({ brandSlug: 'motorola', brand: 'Motorola', modelSlug: `edge-${index + 1}`, model: `Edge ${index + 1}` }));
    const hierarchy = buildSharedRepairHierarchy(buildGenericPeripheralRepairHierarchyModels({ repairSlug: 'loudspeaker-replacement', bookingService: 'Loudspeaker Replacement', candidates: longCandidates }), { selectedBrandSlug: 'motorola', selectedModelSlug: 'edge-6' });
    expect(hierarchy.brands[0]?.initiallyExpandedModelList).toBe(true);
    expect(hierarchy.brands[0]?.models.map((model) => model.modelSlug)).toEqual(['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5', 'edge-6']);
    const source = readFileSync(resolve(process.cwd(), 'src/lib/genericPeripheralRepairHierarchy.ts'), 'utf8');
    expect(source).not.toMatch(/getStartingPrice|RepairOptionsGrid|withVirtualPhoneRepairOptions/);
  });
});
