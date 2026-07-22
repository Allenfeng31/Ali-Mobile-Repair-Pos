import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchRepairCatalog,
  fetchRepairDetails,
  type RepairCatalog,
} from '@/lib/api';

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
  ],
};

type RepairDetails = Exclude<Awaited<ReturnType<typeof fetchRepairDetails>>, null>;

const repairDetails: Record<string, RepairDetails> = {
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
};

function params(category: string, brand: string, model: string, repairType: string) {
  return { params: Promise.resolve({ category, brand, model, 'repair-type': repairType }) };
}

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
    expect(metadata.openGraph?.title).toContain('iPhone 15 Screen Replacement');
    expect(metadata.twitter?.title).toContain('iPhone 15 Screen Replacement');
    expect(metadata.description).toContain('cracked glass');
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
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

  it('retains the existing 404 behavior for an invalid taxonomy combination', async () => {
    await expect(generateMetadata(params('phone', 'iphone', 'not-a-real-model', 'screen-replacement'))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
  });

  it('passes laptop category to generic metadata and social descriptions', async () => {
    const metadata = await generateMetadata(
      params('laptop', 'macbook', 'macbook-unlisted-13', 'screen-replacement')
    );

    expect(metadata.description).toContain('MacBook Unlisted 13');
    expect(metadata.description).toContain('cracked display');
    expect(metadata.description).not.toMatch(/touch-screen|touchscreen|phone/i);
    expect(metadata.openGraph?.description).toBe(metadata.description);
    expect(metadata.twitter?.description).toBe(metadata.description);
    expect(metadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/laptop/macbook/macbook-unlisted-13/screen-replacement'
    );
  });

  it('places Repair Results before the policy disclosure after pricing', () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), 'src/app/(public)/repairs/[category]/[brand]/[model]/[repair-type]/page.tsx'),
      'utf8'
    );

    expect(pageSource.indexOf('<RepairResultsMatchingSection')).toBeLessThan(
      pageSource.indexOf('<RepairPolicySection')
    );
    const metadataDescriptionStart = pageSource.indexOf('const description =');
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
