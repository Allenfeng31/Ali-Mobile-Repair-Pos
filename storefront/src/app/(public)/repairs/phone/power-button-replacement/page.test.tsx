import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { buildSharedRepairHierarchy } from '@/lib/sharedRepairHierarchy';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({ fetchRepairCatalogMock: vi.fn() }));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/components/services/VirtualPhoneRepairLandingPage', () => ({ default: () => <div data-testid="virtual-phone-repair-landing" /> }));

import Page, { metadata } from './page';

const power = (
  price: unknown,
  repairOrigin: 'pos' | 'virtual' | 'synthetic-backfill' = 'pos',
  variants?: Array<{ quality_grade: string; price: number; is_recommended: boolean }>,
) => ({ slug: 'power-button-replacement', name: 'Power Button Replacement', price: price as number, repairOrigin, variants });

function catalogue() {
  return { brands: [
    { category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [{ model: 'Mate 20', slug: 'mate-20', repairTypes: [power(79)] }, { model: 'P30', slug: 'p30', repairTypes: [] }] },
    { category: 'phone', brand: 'Xiaomi', slug: 'xiaomi', icon: '', models: [{ model: 'Redmi Note 12', slug: 'redmi-note-12', repairTypes: [power(129, 'pos', [{ quality_grade: 'Standard', price: 129, is_recommended: true }, { quality_grade: 'Premium', price: 159, is_recommended: false }])] }] },
    { category: 'phone', brand: 'HTC', slug: 'htc', icon: '', models: [{ model: 'U24', slug: 'u24', repairTypes: [power(0)] }] },
    { category: 'phone', brand: 'Future', slug: 'future', icon: '', models: [{ model: 'One', slug: 'one', repairTypes: [power(50, 'virtual')] }] },
    { category: 'phone', brand: 'Motorola', slug: 'motorola', icon: '', models: [{ model: 'Edge 50', slug: 'edge-50', repairTypes: [power(Number.NaN)] }] },
    { category: 'phone', brand: 'Nokia', slug: 'nokia', icon: '', models: [{ model: 'G60', slug: 'g60', repairTypes: [power(undefined)] }] },
    { category: 'phone', brand: 'Vivo', slug: 'vivo', icon: '', models: [{ model: 'X100', slug: 'x100', repairTypes: [power(99, 'synthetic-backfill')] }] },
    { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{ model: 'Galaxy S25', slug: 'galaxy-s25', repairTypes: [power(100)] }] },
    { category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{ model: 'Pixel 9', slug: 'pixel-9', repairTypes: [power(100)] }] },
    { category: 'phone', brand: 'OPPO', slug: 'oppo', icon: '', models: [{ model: 'Find X8', slug: 'find-x8', repairTypes: [power(100)] }] },
    { category: 'phone', brand: 'Apple', slug: 'apple', icon: '', models: [{ model: 'iPhone 16', slug: 'iphone-16', repairTypes: [power(100)] }] },
  ] };
}

type LandingProps = { canonicalPath: string; models: Array<{ brandSlug: string }>; hierarchy: { models: Array<{ brandSlug: string; brandLabel: string; modelSlug: string; modelLabel: string; repairLabel: string; priceLabel: string | null; bookingHref: string }>; selectedBrandSlug: string | null; selectedModelSlug: string | null } };

async function renderRoute(query: Record<string, string | string[] | undefined> = {}) {
  fetchRepairCatalogMock.mockResolvedValue(catalogue());
  return (await Page({ searchParams: Promise.resolve(query) })).props as LandingProps;
}

describe('generic Power Button shared hierarchy route', () => {
  it('activates a secondary-brand hierarchy with exact Power prices while no-repair models stay visible and bookable', async () => {
    const props = await renderRoute({ brand: 'huawei', model: 'p30' });
    expect(props.canonicalPath).toBe('/repairs/phone/power-button-replacement');
    expect(props.models.map((model) => model.brandSlug)).toEqual(['future', 'htc', 'huawei', 'huawei', 'motorola', 'nokia', 'vivo', 'xiaomi']);
    expect(props.hierarchy.models.map((model) => model.priceLabel)).toEqual([null, null, '$79', null, null, null, null, 'From $129']);
    expect(props.hierarchy.models.every((model) => model.repairLabel === 'Power Button Replacement')).toBe(true);
    expect(props.hierarchy.models.find((model) => model.modelSlug === 'p30')?.bookingHref).toBe('/book-repair?category=phone&service=Power+Button+Replacement&brand=Huawei&model=P30');
    expect(props.hierarchy).toMatchObject({ selectedBrandSlug: 'huawei', selectedModelSlug: 'p30' });
  });

  it('reuses B1/B2 grouping and selected-after-five ordering', async () => {
    const props = await renderRoute();
    const hierarchy = buildSharedRepairHierarchy(props.hierarchy.models);
    expect(hierarchy.brands.find((brand) => brand.brandSlug === 'huawei')?.series.map((series) => series.seriesKey)).toEqual(['mate', 'p']);
    expect(hierarchy.brands.find((brand) => brand.brandSlug === 'htc')?.models.map((model) => model.modelSlug)).toEqual(['u24']);
    const models = Array.from({ length: 6 }, (_, index) => ({ brandSlug: 'motorola', brandLabel: 'Motorola', modelSlug: `edge-${index + 1}`, modelLabel: `Motorola Edge ${index + 1}`, repairLabel: 'Power Button Replacement', bookingHref: `/book/${index + 1}`, priceLabel: null }));
    const longHierarchy = buildSharedRepairHierarchy(models, { selectedBrandSlug: 'motorola', selectedModelSlug: 'edge-6' });
    expect(longHierarchy.brands[0]?.initiallyExpandedModelList).toBe(true);
    expect(longHierarchy.brands[0]?.models.map((model) => model.modelSlug)).toEqual(['edge-1', 'edge-2', 'edge-3', 'edge-4', 'edge-5', 'edge-6']);
  });

  it('uses paired server query state and fails closed for untrusted input without changing metadata', async () => {
    expect((await renderRoute({ brand: 'huawei' })).hierarchy).toMatchObject({ selectedBrandSlug: 'huawei', selectedModelSlug: null });
    expect((await renderRoute({ brand: 'huawei', model: 'p30' })).hierarchy).toMatchObject({ selectedBrandSlug: 'huawei', selectedModelSlug: 'p30' });
    for (const query of [{ model: 'p30' }, { brand: 'invalid' }, { brand: 'huawei', model: 'u24' }, { brand: ['huawei', 'xiaomi'] }, { brand: 'huawei', model: ['p30', 'mate-20'] }, { brand: 'huawei', service: 'Logic Board Repair' }]) {
      expect((await renderRoute(query)).hierarchy).toMatchObject({ selectedBrandSlug: null, selectedModelSlug: null });
    }
    expect(metadata.alternates?.canonical).toBe('/repairs/phone/power-button-replacement');
  });

  it('keeps the completed Loudspeaker, Earpiece, Power and Volume hierarchy rollout active', () => {
    const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');
    expect(source('src/app/(public)/repairs/phone/loudspeaker-replacement/page.tsx')).toContain('buildGenericPeripheralRepairHierarchyModels');
    expect(source('src/app/(public)/repairs/phone/earpiece-speaker-replacement/page.tsx')).toContain('buildGenericPeripheralRepairHierarchyModels');
    expect(source('src/app/(public)/repairs/phone/volume-button-replacement/page.tsx')).toContain('buildGenericPeripheralRepairHierarchyModels');
    expect(source('src/app/(public)/repairs/phone/power-button-replacement/page.tsx')).not.toMatch(/getStartingPrice|RepairOptionsGrid|withVirtualPhoneRepairOptions|Quote on Request|Starting from \$50/);
  });
});
