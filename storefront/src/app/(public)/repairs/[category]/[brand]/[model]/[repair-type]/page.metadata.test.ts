import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchRepairCatalog,
  fetchRepairDetails,
  type RepairCatalog,
} from '@/lib/api';
import { GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS } from '@/data/grandfatheredSecondaryPhoneDetailRepairs';
import {
  BATCH_THREE_SECONDARY_PHONE_BRAND_SLUGS,
  BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS,
} from '@/lib/secondaryPhoneModelIdentity';
import { getSamsungHardwareConfig } from '@/lib/seo/content/samsung/config';
import { getSamsungFoldableScreenDetailContext } from '@/lib/seo/content/samsung/screen-replacement';

vi.mock('@/lib/api', () => ({
  fetchRepairCatalog: vi.fn(),
  fetchRepairDetails: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  permanentRedirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

const { generateMetadata } = await import('./page');

const catalog: RepairCatalog = {
  source: 'fallback',
  catalogueSource: 'development-fallback',
  fetchedAt: '2026-07-21T00:00:00.000Z',
  validatedAt: '2026-07-21T00:00:00.000Z',
  checksum: 'test-catalog',
  inventoryRowCount: 3,
  publicModelCount: 2,
  publicRepairCount: 3,
  brands: [
    {
      category: 'phone',
      slug: 'iphone',
      brand: 'iPhone',
      icon: 'phone',
      models: [
        {
          slug: 'iphone-15',
          model: 'iPhone 15',
          repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 150 },
            { slug: 'battery-replacement', name: 'Battery Replacement', price: 100 },
          ],
        },
      ],
    },
    {
      category: 'phone',
      slug: 'oneplus',
      brand: 'OnePlus',
      icon: 'phone',
      models: [
        {
          slug: '9-pro',
          model: '9 Pro',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        },
      ],
    },
    {
      category: 'phone',
      slug: 'samsung',
      brand: 'Samsung',
      icon: 'phone',
      models: [
        {
          slug: 'galaxy-z-fold-7',
          model: 'Galaxy Z Fold 7',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        },
        {
          slug: 'galaxy-z-flip-7',
          model: 'Galaxy Z Flip 7',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        },
        {
          slug: 'galaxy-s23-ultra',
          model: 'Galaxy S23 Ultra',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        },
      ],
    },
    {
      category: 'laptop',
      slug: 'macbook',
      brand: 'MacBook',
      icon: 'laptop',
      models: [
        {
          slug: 'macbook-air-m2-13-2022',
          model: 'MacBook Air M2 13 2022',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 400 }],
        },
        {
          slug: 'macbook-unlisted-13',
          model: 'MacBook Unlisted 13',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 500 }],
        },
      ],
    },
    {
      category: 'tablet',
      slug: 'samsung',
      brand: 'Samsung',
      icon: 'tablet',
      models: [
        {
          slug: 'galaxy-tab-a8-sm-x200-sm-x205',
          model: 'Galaxy Tab A8',
          repairTypes: [{
            slug: 'battery-replacement',
            name: 'Galaxy Tab A8 Battery Service',
            price: 90,
          }],
        },
      ],
    },
    {
      category: 'tablet',
      slug: 'lenovo',
      brand: 'Lenovo',
      icon: 'tablet',
      models: [
        {
          slug: 'lenovo-tab-p11-gen-2-tb-350fu',
          model: 'Lenovo Tab P11 Gen 2',
          repairTypes: [{
            slug: 'charging-port-replacement',
            name: 'Lenovo Tab P11 Gen 2 Charging Port',
            price: 0,
          }],
        },
      ],
    },
    {
      category: 'watch',
      slug: 'apple',
      brand: 'Apple',
      icon: 'watch',
      models: [
        {
          slug: 'apple-watch-series-3-38mm',
          model: 'Apple Watch Series 3 38mm',
          repairTypes: [{ slug: 'charging-repair', name: 'Charging Repair', price: 0, sourceType: 'diagnostic' }],
        },
        {
          slug: 'apple-watch-unconfigured',
          model: 'Apple Watch Unconfigured',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        },
      ],
    },
  ],
};

type RepairDetails = Exclude<Awaited<ReturnType<typeof fetchRepairDetails>>, null>;

const repairDetails: Record<string, RepairDetails> = {
  'phone/oneplus/9-pro/screen-replacement': {
    brand: 'OnePlus',
    model: '9 Pro',
    repairType: 'Screen Replacement',
    price: 0,
    variants: [],
    source: 'fallback',
  },
  'phone/iphone/iphone-15/screen-replacement': {
    brand: 'iPhone',
    model: 'iPhone 15',
    modelCode: 'A3090',
    repairType: 'Screen Replacement',
    price: 150,
    variants: [],
    source: 'fallback',
  },
  'phone/iphone/iphone-15/battery-replacement': {
    brand: 'iPhone',
    model: 'iPhone 15',
    modelCode: 'A3090',
    repairType: 'Battery Replacement',
    price: 100,
    variants: [],
    source: 'fallback',
  },
  'phone/samsung/galaxy-z-fold-7/screen-replacement': {
    brand: 'Samsung',
    model: 'Galaxy Z Fold 7',
    repairType: 'Screen Replacement',
    price: 0,
    variants: [],
    source: 'fallback',
  },
  'phone/samsung/galaxy-z-flip-7/screen-replacement': {
    brand: 'Samsung',
    model: 'Galaxy Z Flip 7',
    repairType: 'Screen Replacement',
    price: 0,
    variants: [],
    source: 'fallback',
  },
  'phone/samsung/galaxy-s23-ultra/screen-replacement': {
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    repairType: 'Screen Replacement',
    price: 0,
    variants: [],
    source: 'fallback',
  },
  'laptop/macbook/macbook-air-m2-13-2022/screen-replacement': {
    brand: 'MacBook',
    model: 'MacBook Air M2 13 2022',
    repairType: 'Screen Replacement',
    price: 400,
    variants: [],
    source: 'fallback',
  },
  'laptop/macbook/macbook-unlisted-13/screen-replacement': {
    brand: 'MacBook',
    model: 'MacBook Unlisted 13',
    repairType: 'Screen Replacement',
    price: 500,
    variants: [],
    source: 'fallback',
  },
  'tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205/battery-replacement': {
    brand: 'Samsung',
    model: 'Galaxy Tab A8',
    repairType: 'Galaxy Tab A8 Battery Service',
    price: 90,
    variants: [],
    source: 'fallback',
  },
  'tablet/lenovo/lenovo-tab-p11-gen-2-tb-350fu/charging-port-replacement': {
    brand: 'Lenovo',
    model: 'Lenovo Tab P11 Gen 2',
    repairType: 'Lenovo Tab P11 Gen 2 Charging Port',
    price: 0,
    variants: [],
    source: 'fallback',
  },
  'watch/apple/apple-watch-series-3-38mm/charging-repair': {
    brand: 'Apple',
    model: 'Apple Watch Series 3 38mm',
    repairType: 'Charging Repair',
    price: 0,
    variants: [],
    source: 'fallback',
    sourceType: 'diagnostic',
  },
};

function params(category: string, brand: string, model: string, repairType: string) {
  return { params: Promise.resolve({ category, brand, model, 'repair-type': repairType }) };
}

const batchTwoMetadataModels = {
  huawei: { brand: 'Huawei', models: { 'mate-20-pro': 'Mate 20 Pro', 'mate-30-pro': 'Mate 30 Pro', 'nova-5t': 'Nova 5T', 'p30-pro': 'P30 Pro', 'p40-pro': 'P40 Pro' } },
  htc: { brand: 'HTC', models: { 'desire-21-pro-5g': 'Desire 21 Pro 5G', 'one-m8': 'One M8', 'one-m9': 'One M9', u11: 'U11', 'u12-plus': 'U12+' } },
  sony: { brand: 'Sony', models: { 'xperia-1': 'Xperia 1', 'xperia-1-ii': 'Xperia 1 II', 'xperia-10-ii': 'Xperia 10 II', 'xperia-5': 'Xperia 5', 'xperia-5-ii': 'Xperia 5 II' } },
  telstra: { brand: 'Telstra', models: { 'essential-pro': 'Essential Pro', 'essential-smart-21': 'Essential Smart 2.1', 'evoke-pro-2': 'Evoke Pro 2', 't-smart': 'T-Smart', 'tough-max-3': 'Tough Max 3' } },
  motorola: { brand: 'Motorola', models: { 'edge-20': 'Edge 20', 'edge-30-pro': 'Edge 30 Pro', 'moto-g-power': 'Moto G Power', 'moto-g-stylus': 'Moto G Stylus', 'moto-g04': 'Moto G04', 'moto-g24': 'Moto G24', 'moto-g50': 'Moto G50', 'moto-g55': 'Moto G55' } },
} as const;
const batchTwoMetadataRepairNames = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Replacement',
} as const;
const batchThreeMetadataModels = {
  microsoft: { brand: 'Microsoft', publicBrand: 'Microsoft', models: { 'lumia-640': 'Lumia 640', 'lumia-950': 'Lumia 950', 'lumia-950-xl': 'Lumia 950 XL', 'surface-duo': 'Surface Duo', 'surface-duo-2': 'Surface Duo 2' } },
  realme: { brand: 'Realme', publicBrand: 'Realme', models: { '7-pro': '7 Pro', '8-5g': '8 5G', c21y: 'C21Y', 'gt-master-edition': 'GT Master Edition', 'x3-superzoom': 'X3 SuperZoom' } },
  asus: { brand: 'Asus', publicBrand: 'ASUS', models: { 'rog-phone-3': 'ROG Phone 3', 'rog-phone-5': 'ROG Phone 5', 'rog-phone-6': 'ROG Phone 6', 'zenfone-8': 'Zenfone 8', 'zenfone-9': 'Zenfone 9' } },
  tcl: { brand: 'TCL', publicBrand: 'TCL', models: { '10-pro': '10 Pro', '20-5g': '20 5G', '20-pro-5g': '20 Pro 5G', '30-plus': '30+', '30-se': '30 SE' } },
  nothing: { brand: 'Nothing', publicBrand: 'Nothing', models: { 'cmf-phone-2-pro-5g': 'CMF Phone 2 Pro 5G', 'phone-1': 'Phone 1', 'phone-2': 'Phone 2', 'phone-3a-5g': 'Phone 3a 5G', 'phone-3a-pro-5g': 'Phone 3a Pro 5G' } },
} as const;

describe('repair detail metadata', () => {
  beforeEach(() => {
    vi.mocked(fetchRepairCatalog).mockResolvedValue(catalog);
    vi.mocked(fetchRepairDetails).mockImplementation(async (category, brand, model, repairType) => {
      return repairDetails[`${category}/${brand}/${model}/${repairType}`] ?? null;
    });
  });

  it('uses the exact iPhone repair URL and labels for social metadata', async () => {
    const metadata = await generateMetadata(params('phone', 'iphone', 'iphone-15', 'screen-replacement'));
    const canonicalUrl = 'https://www.alimobile.com.au/repairs/phone/iphone/iphone-15/screen-replacement';

    expect(metadata.alternates?.canonical).toBe(canonicalUrl);
    expect(metadata.openGraph).toMatchObject({ url: canonicalUrl });
    expect(metadata.openGraph?.title).toBe('iPhone 15 Screen Replacement | Ali Mobile & Repair');
    expect(metadata.twitter?.title).toBe('iPhone 15 Screen Replacement | Ali Mobile & Repair');
    expect(metadata.description).toContain('cracked glass');
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
  });

  it('uses the complete commercial secondary-phone identity in metadata', async () => {
    const metadata = await generateMetadata(params('phone', 'oneplus', '9-pro', 'screen-replacement'));

    expect(metadata.title).toBe('OnePlus 9 Pro Screen Replacement in Ringwood | Ali Mobile');
    expect(metadata.description).toContain('OnePlus 9 Pro');
    expect(metadata.openGraph?.title).toBe('OnePlus 9 Pro Screen Replacement | Ali Mobile & Repair');
    expect(metadata.twitter?.title).toBe('OnePlus 9 Pro Screen Replacement | Ali Mobile & Repair');
    expect(metadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/phone/oneplus/9-pro/screen-replacement'
    );
  });

  it.each([
    ['Xiaomi', 'xiaomi', '14C', '14c', 'Xiaomi 14C'],
    ['Nokia', 'nokia', 'Nokia 8.3 5G', '83-5g', 'Nokia 8.3 5G'],
    ['Vivo', 'vivo', 'Y52 5G', 'y52-5g', 'Vivo Y52 5G'],
    ['LG', 'lg', 'Velvet', 'velvet', 'LG Velvet'],
    ['OnePlus', 'oneplus', '9 Pro', '9-pro', 'OnePlus 9 Pro'],
  ] as const)('keeps Batch 1 %s commercial metadata identity across all three services', async (
    brand,
    brandSlug,
    model,
    modelSlug,
    publicModel,
  ) => {
    for (const [repairName, repairSlug] of [
      ['Screen Replacement', 'screen-replacement'],
      ['Battery Replacement', 'battery-replacement'],
      ['Charging Port Replacement', 'charging-port-replacement'],
    ] as const) {
      vi.mocked(fetchRepairCatalog).mockResolvedValue({
        ...catalog,
        checksum: `batch-1-${brandSlug}-${repairSlug}`,
        inventoryRowCount: 1,
        publicModelCount: 1,
        publicRepairCount: 1,
        brands: [{
          category: 'phone',
          brand,
          slug: brandSlug,
          icon: 'phone',
          models: [{
            model,
            slug: modelSlug,
            repairTypes: [{ name: repairName, slug: repairSlug, price: 0, variants: [] }],
          }],
        }],
      });
      vi.mocked(fetchRepairDetails).mockResolvedValue({
        brand,
        model,
        repairType: repairName,
        price: 0,
        variants: [],
        source: 'fallback',
      });

      const metadata = await generateMetadata(params('phone', brandSlug, modelSlug, repairSlug));
      const canonicalUrl = `https://www.alimobile.com.au/repairs/phone/${brandSlug}/${modelSlug}/${repairSlug}`;

      expect(metadata.title).toContain(`${publicModel} ${repairName}`);
      expect(metadata.description).toContain(publicModel);
      expect(metadata.alternates?.canonical).toBe(canonicalUrl);
      expect(metadata.openGraph).toMatchObject({
        title: `${publicModel} ${repairName} | Ali Mobile & Repair`,
        url: canonicalUrl,
      });
    }
  });

  it('keeps complete indexable metadata and exact canonicals across all 84 Batch 2 routes', async () => {
    const batchTwoBrands = new Set<string>(BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS);
    const routes = GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.filter(({ brandSlug }) => batchTwoBrands.has(brandSlug));

    expect(routes).toHaveLength(84);
    for (const route of routes) {
      const brandEntry = batchTwoMetadataModels[route.brandSlug as keyof typeof batchTwoMetadataModels];
      const model = brandEntry.models[route.modelSlug as keyof typeof brandEntry.models];
      const repairName = batchTwoMetadataRepairNames[route.repairSlug as keyof typeof batchTwoMetadataRepairNames];
      const publicModel = `${brandEntry.brand} ${model}`;
      const canonicalUrl = `https://www.alimobile.com.au/repairs/phone/${route.brandSlug}/${route.modelSlug}/${route.repairSlug}`;
      vi.mocked(fetchRepairCatalog).mockResolvedValue({
        ...catalog,
        checksum: `batch-2-${route.brandSlug}-${route.modelSlug}-${route.repairSlug}`,
        inventoryRowCount: 1,
        publicModelCount: 1,
        publicRepairCount: 1,
        brands: [{
          category: 'phone', brand: brandEntry.brand, slug: route.brandSlug, icon: 'phone',
          models: [{ model, slug: route.modelSlug, repairTypes: [{ name: repairName, slug: route.repairSlug, price: 0 }] }],
        }],
      });
      vi.mocked(fetchRepairDetails).mockResolvedValue({
        brand: brandEntry.brand,
        model,
        repairType: repairName,
        price: 0,
        variants: [],
        source: 'fallback',
      });

      const metadata = await generateMetadata(params('phone', route.brandSlug, route.modelSlug, route.repairSlug));

      expect(String(metadata.title), canonicalUrl).toContain(`${publicModel} ${repairName}`);
      expect(String(metadata.description), canonicalUrl).toContain(publicModel);
      expect(metadata.alternates?.canonical, canonicalUrl).toBe(canonicalUrl);
      expect(metadata.openGraph, canonicalUrl).toMatchObject({
        title: `${publicModel} ${repairName} | Ali Mobile & Repair`,
        url: canonicalUrl,
      });
      expect(metadata.robots, canonicalUrl).toBeUndefined();
    }
  });

  it('keeps complete indexable metadata and exact canonicals across all 75 Batch 3 routes', async () => {
    const batchThreeBrands = new Set<string>(BATCH_THREE_SECONDARY_PHONE_BRAND_SLUGS);
    const routes = GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.filter(({ brandSlug }) => batchThreeBrands.has(brandSlug));

    expect(routes).toHaveLength(75);
    for (const route of routes) {
      const brandEntry = batchThreeMetadataModels[route.brandSlug as keyof typeof batchThreeMetadataModels];
      const model = brandEntry.models[route.modelSlug as keyof typeof brandEntry.models];
      const repairName = batchTwoMetadataRepairNames[route.repairSlug as keyof typeof batchTwoMetadataRepairNames];
      const publicModel = `${brandEntry.publicBrand} ${model}`;
      const canonicalUrl = `https://www.alimobile.com.au/repairs/phone/${route.brandSlug}/${route.modelSlug}/${route.repairSlug}`;
      vi.mocked(fetchRepairCatalog).mockResolvedValue({
        ...catalog,
        checksum: `batch-3-${route.brandSlug}-${route.modelSlug}-${route.repairSlug}`,
        inventoryRowCount: 1,
        publicModelCount: 1,
        publicRepairCount: 1,
        brands: [{
          category: 'phone', brand: brandEntry.brand, slug: route.brandSlug, icon: 'phone',
          models: [{ model, slug: route.modelSlug, repairTypes: [{ name: repairName, slug: route.repairSlug, price: 0 }] }],
        }],
      });
      vi.mocked(fetchRepairDetails).mockResolvedValue({
        brand: brandEntry.brand,
        model,
        repairType: repairName,
        price: 0,
        variants: [],
        source: 'fallback',
      });

      const metadata = await generateMetadata(params('phone', route.brandSlug, route.modelSlug, route.repairSlug));

      expect(String(metadata.title), canonicalUrl).toContain(`${publicModel} ${repairName}`);
      expect(String(metadata.description), canonicalUrl).toContain(publicModel);
      expect(metadata.alternates?.canonical, canonicalUrl).toBe(canonicalUrl);
      expect(metadata.openGraph, canonicalUrl).toMatchObject({
        title: `${publicModel} ${repairName} | Ali Mobile & Repair`,
        url: canonicalUrl,
      });
      expect(metadata.twitter?.title, canonicalUrl).toBe(`${publicModel} ${repairName} | Ali Mobile & Repair`);
      expect(metadata.robots, canonicalUrl).toBeUndefined();
    }
  });

  it.each([
    ['Screen Replacement', 'screen-replacement'],
    ['Battery Replacement', 'battery-replacement'],
    ['Charging Port Replacement', 'charging-port-replacement'],
  ] as const)('adds the verified Essential Pro manufacturer identifier to %s metadata only', async (
    repairName,
    repairSlug,
  ) => {
    vi.mocked(fetchRepairCatalog).mockResolvedValue({
      ...catalog,
      checksum: `essential-pro-${repairSlug}`,
      inventoryRowCount: 1,
      publicModelCount: 1,
      publicRepairCount: 1,
      brands: [{
        category: 'phone',
        brand: 'Telstra',
        slug: 'telstra',
        icon: 'phone',
        models: [{
          model: 'Essential Pro',
          slug: 'essential-pro',
          repairTypes: [{ name: repairName, slug: repairSlug, price: 0, variants: [] }],
        }],
      }],
    });
    vi.mocked(fetchRepairDetails).mockResolvedValue({
      brand: 'Telstra',
      model: 'Essential Pro',
      repairType: repairName,
      price: 0,
      variants: [],
      source: 'fallback',
    });

    const metadata = await generateMetadata(params('phone', 'telstra', 'essential-pro', repairSlug));

    expect(metadata.title).toContain(`Telstra Essential Pro ${repairName}`);
    expect(metadata.description).toContain('Telstra Essential Pro');
    expect(metadata.description).toContain('ZTE A5 2019T');
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
    expect(metadata.alternates?.canonical).toBe(
      `https://www.alimobile.com.au/repairs/phone/telstra/essential-pro/${repairSlug}`,
    );
  });

  it.each([
    ['galaxy-z-fold-7', 'Galaxy Z Fold 7'],
    ['galaxy-z-flip-7', 'Galaxy Z Flip 7'],
  ])('uses foldable assessment-first metadata for %s without changing the exact title', async (model, modelName) => {
    const metadata = await generateMetadata(params('phone', 'samsung', model, 'screen-replacement'));

    expect(metadata.title).toBe(`${modelName} Screen Replacement in Ringwood | Ali Mobile`);
    expect(metadata.description).toBe(
      `${modelName} screen replacement in Ringwood. We assess inner foldable-display and outer cover-display issues separately, then confirm the repair path, parts availability and quote before work begins.`
    );
    expect(metadata.alternates?.canonical).toBe(
      `https://www.alimobile.com.au/repairs/phone/samsung/${model}/screen-replacement`
    );
  });

  it('keeps normal Samsung screen metadata on the existing generic description', async () => {
    const metadata = await generateMetadata(
      params('phone', 'samsung', 'galaxy-s23-ultra', 'screen-replacement')
    );

    expect(metadata.description).toContain('cracked glass, display faults or touch-screen problems');
    expect(metadata.description).not.toContain('outer cover-display');
  });

  it('provides the Assessment First detail badge only for Samsung Fold and Flip hardware', () => {
    expect(getSamsungFoldableScreenDetailContext(getSamsungHardwareConfig('galaxy-z-fold-7'))?.timingBadge)
      .toBe('Assessment First');
    expect(getSamsungFoldableScreenDetailContext(getSamsungHardwareConfig('galaxy-z-flip-7'))?.timingBadge)
      .toBe('Assessment First');
    expect(getSamsungFoldableScreenDetailContext(getSamsungHardwareConfig('galaxy-s23-ultra')))
      .toBeNull();
  });

  it('uses canonical MacBook labels and a non-screen repair without hard-coding', async () => {
    const macbookMetadata = await generateMetadata(
      params('laptop', 'macbook', 'macbook-air-m2-13-2022', 'screen-replacement')
    );
    const batteryMetadata = await generateMetadata(
      params('phone', 'iphone', 'iphone-15', 'battery-replacement')
    );

    expect(macbookMetadata.openGraph?.title).toContain('MacBook Air M2 13 2022 Screen Replacement');
    expect(macbookMetadata.openGraph?.url).toBe(
      'https://www.alimobile.com.au/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement'
    );
    expect(batteryMetadata.openGraph?.title).toContain('iPhone 15 Battery Replacement');
    expect(batteryMetadata.description).toContain('poor battery life');
    expect(batteryMetadata.description).not.toBe(macbookMetadata.description);
    expect(batteryMetadata.openGraph?.description).toBe(batteryMetadata.description);
    expect(batteryMetadata.twitter?.description).toBe(batteryMetadata.description);
  });

  it('uses the enhanced Samsung Tablet identity for social metadata instead of the raw catalogue label', async () => {
    const metadata = await generateMetadata(
      params('tablet', 'samsung', 'galaxy-tab-a8-sm-x200-sm-x205', 'battery-replacement')
    );
    const expectedTitle = 'Galaxy Tab A8 (SM-X200 / SM-X205) Battery Replacement | Ali Mobile & Repair';

    expect(metadata.openGraph?.title).toBe(expectedTitle);
    expect(metadata.twitter?.title).toBe(expectedTitle);
    expect(String(metadata.openGraph?.title).match(/Galaxy Tab A8/g)).toHaveLength(1);
    expect(metadata.openGraph?.title).not.toContain('Battery Service');
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
    expect(metadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205/battery-replacement'
    );
    expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
  });

  it('uses the enhanced Lenovo Tablet identity for social metadata instead of the raw catalogue label', async () => {
    const metadata = await generateMetadata(
      params('tablet', 'lenovo', 'lenovo-tab-p11-gen-2-tb-350fu', 'charging-port-replacement')
    );
    const expectedTitle = 'Lenovo Tab P11 Gen 2 (TB-350FU) Charging Port Replacement | Ali Mobile & Repair';

    expect(metadata.openGraph?.title).toBe(expectedTitle);
    expect(metadata.twitter?.title).toBe(expectedTitle);
    expect(String(metadata.openGraph?.title).match(/Lenovo Tab P11 Gen 2/g)).toHaveLength(1);
    expect(metadata.openGraph?.title).not.toMatch(/Charging Port \|/);
    expect(metadata.openGraph?.title).toContain('Charging Port Replacement');
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
    expect(metadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/tablet/lenovo/lenovo-tab-p11-gen-2-tb-350fu/charging-port-replacement'
    );
    expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
  });

  it('retains the existing 404 behavior for an invalid taxonomy combination', async () => {
    await expect(generateMetadata(params('phone', 'iphone', 'not-a-real-model', 'screen-replacement'))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
  });

  it('uses catalogue-backed enhanced MacBook metadata without phone terminology', async () => {
    const metadata = await generateMetadata(
      params('laptop', 'macbook', 'macbook-unlisted-13', 'screen-replacement')
    );

    expect(metadata.description).toContain('MacBook Unlisted 13');
    expect(metadata.description).toContain('screen damage');
    expect(metadata.description).not.toMatch(/touch-screen|touchscreen|phone/i);
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
    expect(metadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/laptop/macbook/macbook-unlisted-13/screen-replacement'
    );
  });

  it('uses the exact Apple Watch Charging Repair canonical and social metadata', async () => {
    const metadata = await generateMetadata(
      params('watch', 'apple', 'apple-watch-series-3-38mm', 'charging-repair'),
    );
    const canonicalUrl = 'https://www.alimobile.com.au/repairs/watch/apple/apple-watch-series-3-38mm/charging-repair';

    expect(metadata.alternates?.canonical).toBe(canonicalUrl);
    expect(metadata.openGraph).toMatchObject({ url: canonicalUrl });
    expect(metadata.openGraph?.title).toContain('Apple Watch Series 3 38mm Charging Repair');
    expect(metadata.twitter?.title).toContain('Apple Watch Series 3 38mm Charging Repair');
    expect(metadata.description).toContain('Apple Watch Series 3 38mm');
    expect(metadata.description).not.toMatch(/charging port/i);
    expect(metadata.robots).toBeUndefined();
  });

  it('keeps an unconfigured Apple Watch charging-repair route as a 404', async () => {
    await expect(generateMetadata(
      params('watch', 'apple', 'apple-watch-unconfigured', 'charging-repair'),
    )).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('places Repair Results before the policy disclosure after pricing', () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), 'src/app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/page.tsx'),
      'utf8'
    );

    expect(pageSource.indexOf('<RepairResultsMatchingSection')).toBeLessThan(
      pageSource.indexOf('<RepairPolicySection')
    );
    const metadataDescriptionStart = pageSource.indexOf('const baseDescription =');
    const metadataDescriptionEnd = pageSource.indexOf('const baseUrl =', metadataDescriptionStart);
    const schemaDescriptionStart = pageSource.indexOf('const genericRepairIntentDescription =');
    const schemaDescriptionEnd = pageSource.indexOf('const crossModelSectionRepairName', schemaDescriptionStart);
    expect(pageSource.slice(metadataDescriptionStart, metadataDescriptionEnd)).toContain('category: resolvedParams.category');
    expect(pageSource.slice(schemaDescriptionStart, schemaDescriptionEnd)).toContain('category: resolvedParams.category');
    expect(pageSource).toContain('genericRepairIntentDescription');
    const serviceSchemaStart = pageSource.indexOf('<RepairServiceSchema');
    const serviceSchemaEnd = pageSource.indexOf('/>', serviceSchemaStart);
    expect(pageSource.slice(serviceSchemaStart, serviceSchemaEnd)).toContain('genericRepairIntentDescription');
  });
});
