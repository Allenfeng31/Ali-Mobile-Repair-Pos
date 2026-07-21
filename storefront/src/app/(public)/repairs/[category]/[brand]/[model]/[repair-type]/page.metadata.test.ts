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
  });

  it('retains the existing 404 behavior for an invalid taxonomy combination', async () => {
    await expect(generateMetadata(params('phone', 'iphone', 'not-a-real-model', 'screen-replacement'))).rejects.toThrow(
      'NEXT_NOT_FOUND'
    );
  });
});
