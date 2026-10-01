import { describe, expect, it } from 'vitest';

import {
  buildRepairTypeHubCatalog,
  getRepairTypeHubDefinition,
  getRepairTypeHubStartingPriceLabel,
  getRepairTypeHubSelectedPriceLabel,
  resolveRepairTypeHubSelectedState,
  resolveRepairTypeHubSelectedModel,
} from './repair-type-hubs';
import type { RepairCatalog } from './publicRepairCataloguePolicy';

const catalog = {
  catalogueSource: 'live-pos',
  brands: [
    {
      category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [
        {
          model: 'P30', slug: 'p30', repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'synthetic-core' },
          ],
        },
        {
          model: 'P40', slug: 'p40', repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 189, repairOrigin: 'pos' },
          ],
        },
        {
          model: 'P50', slug: 'p50', repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'unknown-legacy' },
          ],
        },
      ],
    },
    {
      category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{
        model: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [
          { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'synthetic-core' },
        ],
      }],
    },
    {
      category: 'tablet', brand: 'Lenovo Tablet', slug: 'lenovo', icon: '', models: [{
        model: 'Tab P12', slug: 'tab-p12', repairTypes: [
          { slug: 'screen-replacement', name: 'Screen Replacement', price: 99, repairOrigin: 'pos' },
        ],
      }],
    },
  ],
} as Pick<RepairCatalog, 'catalogueSource' | 'brands'> as RepairCatalog;

describe('Repair Type Hub secondary-phone hybrid routing', () => {
  const data = buildRepairTypeHubCatalog(catalog, 'screen-replacement', {
    enableSecondaryPhoneHybridFallback: true,
  })!;

  it('keeps primary and non-phone links unchanged, routes only secondary shared services to the Hub, and fails closed for unresolved evidence', () => {
    const phoneBrands = data.categories.find((category) => category.category === 'phone')!.brands;
    const huawei = phoneBrands.find((brand) => brand.brandSlug === 'huawei')!.models;
    const samsung = phoneBrands.find((brand) => brand.brandSlug === 'samsung')!.models;
    const tablet = data.categories.find((category) => category.category === 'tablet')!.brands
      .find((brand) => brand.brandSlug === 'lenovo')!.models;

    expect(huawei).toEqual(expect.arrayContaining([
      expect.objectContaining({ modelSlug: 'p30', destination: 'hub-selected', href: '/repairs/screen-replacement?brand=huawei&model=p30' }),
      expect.objectContaining({ modelSlug: 'p40', destination: 'hub-selected', href: '/repairs/screen-replacement?brand=huawei&model=p40' }),
    ]));
    expect(huawei.some((model) => model.modelSlug === 'p50')).toBe(false);
    expect(samsung[0]).toMatchObject({ destination: 'detail', href: '/repairs/phone/samsung/galaxy-s24/screen-replacement' });
    expect(tablet[0]).toMatchObject({ destination: 'detail', href: '/repairs/tablet/lenovo/tab-p12/screen-replacement' });
  });

  it('accepts only a resolver-approved secondary selected query', () => {
    expect(resolveRepairTypeHubSelectedModel(data, { brand: 'huawei', model: 'p30' }))
      .toMatchObject({ brandSlug: 'huawei', modelSlug: 'p30', destination: 'hub-selected' });
    expect(resolveRepairTypeHubSelectedModel(data, { brand: 'samsung', model: 'galaxy-s24' })).toBeNull();
    expect(resolveRepairTypeHubSelectedModel(data, { brand: 'huawei', model: 'p40' }))
      .toMatchObject({ brandSlug: 'huawei', modelSlug: 'p40', destination: 'hub-selected' });
    expect(resolveRepairTypeHubSelectedModel(data, { brand: 'huawei', model: 'p50' })).toBeNull();
    expect(resolveRepairTypeHubSelectedModel(data, { brand: ['huawei', 'samsung'], model: 'p30' })).toBeNull();
  });

  it('uses only trusted exact, variant, or quote labels', () => {
    const selected = resolveRepairTypeHubSelectedModel(data, { brand: 'huawei', model: 'p30' })!;
    expect(getRepairTypeHubSelectedPriceLabel(selected, { priceAuthority: 'quote-only', price: 0 })).toBe('Quote on Request');
    expect(getRepairTypeHubSelectedPriceLabel({ ...selected, variants: [
      { quality_grade: 'Standard', price: 119, is_recommended: false },
      { quality_grade: 'Premium', price: 189, is_recommended: true },
    ], repairOrigin: 'pos' }, { priceAuthority: 'quote-only', price: 0 })).toBe('From $119');
    expect(getRepairTypeHubSelectedPriceLabel(selected, { priceAuthority: 'exact-pos', price: 129 })).toBe('$129');
  });

  it.each([
    ['screen-replacement', 'From $60'],
    ['battery-replacement', 'From $50'],
    ['charging-port-replacement', 'From $50'],
    ['back-glass-replacement', 'From $50'],
  ] as const)('uses the explicit category-level Hero price for %s without POS pricing', (repairSlug, priceLabel) => {
    const commercialData = {
      ...data,
      categories: [{
        ...data.categories[0]!,
        brands: [{
          ...data.categories[0]!.brands[0]!,
          models: [
            { ...data.categories[0]!.brands[0]!.models[0]!, price: 50, repairOrigin: 'synthetic-core' as const },
            { ...data.categories[0]!.brands[0]!.models[1]!, price: 119, repairOrigin: 'pos' as const, variants: [{ quality_grade: 'Standard', price: 60, is_recommended: false }] },
          ],
        }],
      }],
    };

    const hub = getRepairTypeHubDefinition(repairSlug)!;
    expect(hub.startingPriceLabel).toBe(priceLabel);
    expect(getRepairTypeHubStartingPriceLabel({ ...commercialData, hub })).toBe(priceLabel);
  });

  it('keeps booking explicit and carries canonical secondary phone identity only after a valid selected query', () => {
    expect(resolveRepairTypeHubSelectedState({ catalog, data, query: { brand: 'huawei', model: 'p30' } }))
      .toMatchObject({
        brand: 'Huawei',
        model: 'P30',
        repairName: 'Screen Replacement',
        priceLabel: 'Quote on Request',
        bookingHref: expect.stringContaining('category=phone'),
      });
    expect(resolveRepairTypeHubSelectedState({ catalog, data, query: { brand: 'samsung', model: 'galaxy-s24' } })).toBeNull();
  });

  it.each([
    ['screen-replacement', 'Screen Replacement'],
    ['battery-replacement', 'Battery Replacement'],
    ['charging-port-replacement', 'Charging Port Replacement'],
    ['back-glass-replacement', 'Back Glass Replacement'],
  ] as const)('creates a secondary fallback URL only for %s', (repairSlug, repairName) => {
    const serviceCatalog = {
      catalogueSource: 'live-pos',
      brands: [{
        category: 'phone', brand: 'Motorola', slug: 'motorola', icon: '', models: [{
          model: 'Future Phone', slug: 'future-phone', repairTypes: [
            { slug: repairSlug, name: repairName, price: 99, repairOrigin: 'pos' },
          ],
        }],
      }],
    } as Pick<RepairCatalog, 'catalogueSource' | 'brands'> as RepairCatalog;

    const serviceData = buildRepairTypeHubCatalog(serviceCatalog, repairSlug, {
      enableSecondaryPhoneHybridFallback: true,
    })!;
    const model = serviceData.categories[0]!.brands[0]!.models[0]!;

    expect(model).toMatchObject({
      destination: 'hub-selected',
      href: `/repairs/${repairSlug}?brand=motorola&model=future-phone`,
    });
  });

  it('keeps a non-grandfathered multi-variant Screen repair in Hybrid state without choosing a tier', () => {
    const futureScreenCatalog = {
      catalogueSource: 'live-pos',
      brands: [{
        category: 'phone', brand: 'Motorola', slug: 'motorola', icon: '', models: [{
          model: 'Future Phone', slug: 'future-phone', repairTypes: [{
            slug: 'screen-replacement', name: 'Screen Replacement', price: 119, repairOrigin: 'pos', variants: [
              { quality_grade: 'Standard', price: 119, is_recommended: false },
              { quality_grade: 'Premium', price: 189, is_recommended: true },
            ],
          }],
        }],
      }],
    } as Pick<RepairCatalog, 'catalogueSource' | 'brands'> as RepairCatalog;
    const futureScreenData = buildRepairTypeHubCatalog(futureScreenCatalog, 'screen-replacement', {
      enableSecondaryPhoneHybridFallback: true,
    })!;

    const selected = resolveRepairTypeHubSelectedState({
      catalog: futureScreenCatalog,
      data: futureScreenData,
      query: { brand: 'motorola', model: 'future-phone' },
    });

    expect(selected).toMatchObject({
      priceLabel: 'From $119',
      bookingHref: expect.stringContaining('serviceSlug=screen-replacement'),
    });
    expect(selected?.bookingHref).not.toContain('quality_grade');
    expect(selected?.bookingHref).not.toContain('price=');
  });
});
