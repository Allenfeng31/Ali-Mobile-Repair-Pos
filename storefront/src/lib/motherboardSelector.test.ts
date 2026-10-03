import { describe, expect, it } from 'vitest';

import { buildMotherboardSelectorGroups } from './motherboardSelector';
import { getMotherboardEligibleDevices, type MotherboardEligibleDevice } from './motherboardRepair';
import type { BrandEntry } from './publicRepairCataloguePolicy';

const devices: MotherboardEligibleDevice[] = [
  { category: 'phone', brand: 'iPhone', brandSlug: 'iphone', model: 'iPhone 15', modelSlug: 'iphone-15' },
  { category: 'phone', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S24', modelSlug: 'galaxy-s24' },
  { category: 'phone', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' },
  { category: 'phone', brand: 'OPPO', brandSlug: 'oppo', model: 'Find X5 Pro', modelSlug: 'find-x5-pro' },
  { category: 'phone', brand: 'Asus', brandSlug: 'asus', model: 'ROG Phone 5', modelSlug: 'rog-phone-5' },
  { category: 'tablet', brand: 'iPad', brandSlug: 'ipad', model: 'iPad Air M3', modelSlug: 'ipad-air-m3' },
  { category: 'tablet', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy Tab S10', modelSlug: 'galaxy-tab-s10' },
  { category: 'tablet', brand: 'Lenovo', brandSlug: 'lenovo', model: 'Lenovo Tab P12', modelSlug: 'lenovo-tab-p12' },
  { category: 'laptop', brand: 'MacBook', brandSlug: 'macbook', model: 'MacBook Air M3', modelSlug: 'macbook-air-m3' },
  { category: 'watch', brand: 'Apple', brandSlug: 'apple', model: 'Apple Watch Series 9', modelSlug: 'apple-watch-series-9' },
];

const incompleteCatalogue: BrandEntry[] = [
  { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{ model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [] }] },
  { category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{ model: 'Pixel 8 Pro', slug: 'pixel-8-pro', repairTypes: [] }] },
  { category: 'phone', brand: 'OPPO', slug: 'oppo', icon: '', models: [{ model: 'Find X5 Pro', slug: 'find-x5-pro', repairTypes: [] }] },
  { category: 'phone', brand: 'Asus', slug: 'asus', icon: '', models: [{ model: 'ROG Phone 5', slug: 'rog-phone-5', repairTypes: [] }] },
];

describe('Motherboard selector groups', () => {
  it('maps every approved device cohort into the ten collapsed selector groups', () => {
    const groups = buildMotherboardSelectorGroups(devices, '/repairs/motherboard-repair');

    expect(groups.map((group) => group.label)).toEqual([
      'iPhone', 'Samsung', 'Google Pixel', 'OPPO', 'Other Phone',
      'iPad', 'Samsung Tab', 'Lenovo', 'MacBook', 'Apple Watch',
    ]);
    expect(groups.map((group) => group.modelCount)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it('populates every approved group from its canonical authority without inventing model identities', () => {
    const groups = buildMotherboardSelectorGroups(
      getMotherboardEligibleDevices(incompleteCatalogue),
      '/repairs/motherboard-repair',
    );
    const hrefs = groups.flatMap((group) => group.brands.flatMap((brand) => brand.series.flatMap((series) => series.models.map((model) => model.href))));

    expect(groups.every((group) => group.modelCount > 0)).toBe(true);
    expect(hrefs).toEqual(expect.arrayContaining([
      '/repairs/motherboard-repair?category=phone&brand=iphone&model=iphone-15',
      '/repairs/motherboard-repair?category=phone&brand=samsung&model=galaxy-s21',
      '/repairs/motherboard-repair?category=phone&brand=google-pixel&model=pixel-8-pro',
      '/repairs/motherboard-repair?category=phone&brand=oppo&model=find-x5-pro',
      '/repairs/motherboard-repair?category=phone&brand=asus&model=rog-phone-5',
      '/repairs/motherboard-repair?category=tablet&brand=ipad&model=ipad-pro-11-inch-m4',
      '/repairs/motherboard-repair?category=tablet&brand=samsung&model=galaxy-tab-s9-sm-x710-sm-x716',
      '/repairs/motherboard-repair?category=tablet&brand=lenovo&model=lenovo-tab-p12-tb-370fu',
      '/repairs/motherboard-repair?category=laptop&brand=macbook&model=macbook-air-m3-13-inch-2024',
      '/repairs/motherboard-repair?category=watch&brand=apple&model=apple-watch-series-9-41mm',
    ]));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('preserves every selected category, canonical brand slug, and model slug in model links', () => {
    const groups = buildMotherboardSelectorGroups(devices, '/repairs/motherboard-repair');
    const models = groups.flatMap((group) => group.brands.flatMap((brand) => brand.series.flatMap((series) => series.models)));

    expect(models.map((model) => model.href)).toEqual(expect.arrayContaining([
      '/repairs/motherboard-repair?category=phone&brand=iphone&model=iphone-15',
      '/repairs/motherboard-repair?category=phone&brand=google-pixel&model=pixel-8-pro',
      '/repairs/motherboard-repair?category=tablet&brand=ipad&model=ipad-air-m3',
      '/repairs/motherboard-repair?category=laptop&brand=macbook&model=macbook-air-m3',
      '/repairs/motherboard-repair?category=watch&brand=apple&model=apple-watch-series-9',
    ]));
  });

  it('keeps Other Phone hierarchical by brand before its series and models', () => {
    const groups = buildMotherboardSelectorGroups(devices, '/repairs/motherboard-repair');
    const otherPhone = groups.find((group) => group.key === 'other-phone');

    expect(otherPhone?.brands).toEqual([expect.objectContaining({
      brandSlug: 'asus',
      series: [expect.objectContaining({ models: [expect.objectContaining({ modelSlug: 'rog-phone-5' })] })],
    })]);
  });
});
