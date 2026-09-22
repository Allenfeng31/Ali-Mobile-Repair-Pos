import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({
  fetchRepairCatalogMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/components/services/VirtualPhoneRepairLandingPage', () => ({
  default: () => <div data-testid="virtual-phone-repair-landing" />,
}));

import Page, { metadata } from './page';

const repair = (price: number, repairOrigin: 'pos' | 'virtual' = 'pos') => ({
  slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price, repairOrigin,
});

function catalogue() {
  return {
    brands: [
      { category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [
        { model: 'Mate 20', slug: 'mate-20', repairTypes: [repair(79)] },
        { model: 'P30', slug: 'p30', repairTypes: [] },
      ] },
      { category: 'phone', brand: 'Xiaomi', slug: 'xiaomi', icon: '', models: [{ model: 'Redmi Note 12', slug: 'redmi-note-12', repairTypes: [repair(129)] }] },
      { category: 'phone', brand: 'HTC', slug: 'htc', icon: '', models: [{ model: 'U24', slug: 'u24', repairTypes: [repair(50, 'virtual')] }] },
      { category: 'phone', brand: 'Future', slug: 'future', icon: '', models: [{ model: 'One', slug: 'one', repairTypes: [] }] },
      { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{ model: 'Galaxy S25', slug: 'galaxy-s25', repairTypes: [repair(100)] }] },
      { category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{ model: 'Pixel 9', slug: 'pixel-9', repairTypes: [repair(100)] }] },
      { category: 'phone', brand: 'OPPO', slug: 'oppo', icon: '', models: [{ model: 'Find X8', slug: 'find-x8', repairTypes: [repair(100)] }] },
      { category: 'phone', brand: 'Apple', slug: 'apple', icon: '', models: [{ model: 'iPhone 16', slug: 'iphone-16', repairTypes: [repair(100)] }] },
    ],
  };
}

describe('generic loudspeaker shared hierarchy route', () => {
  it('uses the runtime secondary-brand population without requiring an exact Loudspeaker repair for visibility', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue());
    const element = await Page({ searchParams: Promise.resolve({ brand: 'huawei', model: 'p30' }) });
    const props = element.props as {
      canonicalPath: string;
      models: Array<{ brandSlug: string; modelSlug: string }>;
      hierarchy: { models: Array<{ modelSlug: string; priceLabel: string | null; bookingHref: string }>; selectedBrandSlug: string | null; selectedModelSlug: string | null; selectedDevice: { selectedDevice: { brand: string; model: string }; booking: { href: string } } | null };
    };

    expect(props.canonicalPath).toBe('/repairs/phone/loudspeaker-replacement');
    expect(props.models.map((model) => model.brandSlug)).toEqual(['future', 'htc', 'huawei', 'huawei', 'xiaomi']);
    expect(props.hierarchy.models.map((model) => model.modelSlug)).toEqual(['one', 'u24', 'mate-20', 'p30', 'redmi-note-12']);
    expect(props.hierarchy.models.map((model) => model.priceLabel)).toEqual([null, null, '$79', null, '$129']);
    expect(props.hierarchy.models.find((model) => model.modelSlug === 'mate-20')?.bookingHref).toContain('service=Loudspeaker+Replacement');
    expect(props.hierarchy.selectedBrandSlug).toBe('huawei');
    expect(props.hierarchy.selectedModelSlug).toBe('p30');
    expect(props.hierarchy.selectedDevice).toMatchObject({
      selectedDevice: { brand: 'Huawei', model: 'P30' },
      booking: { href: '/book-repair?category=phone&service=Loudspeaker+Replacement&brand=Huawei&model=P30&brandSlug=huawei&modelSlug=p30&serviceSlug=loudspeaker-replacement' },
    });
  });

  it('fails closed for model-only, mismatched, duplicate and service-override query input without changing canonical metadata', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue());
    for (const query of [
      { model: 'p30' }, { brand: 'huawei', model: 'u24' }, { brand: ['huawei', 'xiaomi'] }, { brand: 'huawei', service: 'Logic Board Repair' },
    ]) {
      const element = await Page({ searchParams: Promise.resolve(query) });
      const hierarchy = (element.props as { hierarchy: { selectedBrandSlug: string | null; selectedModelSlug: string | null } }).hierarchy;
      expect(hierarchy).toMatchObject({ selectedBrandSlug: null, selectedModelSlug: null });
    }
    expect(metadata.alternates?.canonical).toBe('/repairs/phone/loudspeaker-replacement');
  });
});
