import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchModelRepairTypes, fetchRepairCatalog } from '@/lib/api';

const state = vi.hoisted(() => ({
  gridProps: null as {
    repairTypes: Array<{ slug: string; href?: string; price?: number; displayName?: string; timingLabel?: string }>;
    showStartingPriceFallback?: boolean;
    useQuoteLedPricingSummary?: boolean;
  } | null,
  matchingProps: [] as Array<{ initialResults?: unknown[]; suppressSelfLinkedCta?: boolean }>,
  breadcrumbProps: null as { modelLabel?: string } | null,
}));
const fetchModelRepairResultSeeds = vi.hoisted(() => vi.fn());

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }), permanentRedirect: vi.fn() }));
vi.mock('@/lib/api', () => ({ fetchModelRepairTypes: vi.fn(), fetchRepairCatalog: vi.fn() }));
vi.mock('@/lib/virtualCameraLens', () => ({ withVirtualCameraLensRepairOption: (repairs: unknown[]) => repairs }));
vi.mock('@/lib/virtualPhoneRepairs', () => ({
  withVirtualPhoneRepairOptions: (repairs: Array<Record<string, unknown>>, category: string, brand: string) =>
    category === 'phone' && brand !== 'iphone'
      ? [...repairs, { slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 0, repairOrigin: 'virtual' }]
      : repairs,
}));
vi.mock('@/lib/seo/content/selectedCrawledRepairPages', () => ({ getSelectedCrawledModelHubContent: () => null }));
vi.mock('@/components/Breadcrumbs', () => ({
  default: (props: { modelLabel?: string }) => {
    state.breadcrumbProps = props;
    return null;
  },
}));
vi.mock('@/components/BackButton', () => ({ default: () => null }));
vi.mock('@/components/services/RepairOptionsGrid', () => ({
  default: (props: {
    repairTypes: Array<{ slug: string; href?: string; price?: number; displayName?: string; timingLabel?: string }>;
    showStartingPriceFallback?: boolean;
    useQuoteLedPricingSummary?: boolean;
  }) => {
    state.gridProps = props;
    return <div data-repair-options-grid="true" />;
  },
}));
vi.mock('@/components/services/RepairCTA', () => ({ default: () => null }));
vi.mock('@/components/repair-results/RepairResultsMatchingSection', () => ({
  default: (props: { initialResults?: unknown[]; suppressSelfLinkedCta?: boolean }) => {
    state.matchingProps.push(props);
    return null;
  },
}));
vi.mock('@/lib/repair-results.server', () => ({ fetchModelRepairResultSeeds }));
vi.mock('@/components/ScrollReveal', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/FloatingJumpCTA', () => ({ default: () => null }));

const { default: ModelHubPage, generateMetadata } = await import('./page');

const modelData = (overrides: Record<string, unknown> = {}) => ({
  brand: 'OPPO',
  model: 'Find X8 Pro',
  source: 'pos' as const,
  catalogueSource: 'last-known-good' as const,
  repairTypes: [
    { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' as const },
    { slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 0, repairOrigin: 'synthetic-backfill' as const },
  ],
  brandModels: [{ slug: 'find-x8-pro', model: 'Find X8 Pro', repairTypes: [] }],
  ...overrides,
});

const pixelLogicBoardPolicy = {
  retained: [
    'pixel-10-pro-fold', 'pixel-10-pro-xl', 'pixel-3a-xl', 'pixel-4-xl', 'pixel-5',
    'pixel-6-pro', 'pixel-6a', 'pixel-7', 'pixel-8-pro',
  ],
  consolidated: [
    'pixel-10-pro', 'pixel-10', 'pixel-3-xl', 'pixel-3', 'pixel-3a', 'pixel-4',
    'pixel-4a-5g', 'pixel-4a', 'pixel-5a', 'pixel-6', 'pixel-7-pro', 'pixel-7a',
    'pixel-8', 'pixel-8a', 'pixel-9-pro-fold', 'pixel-9-pro-xl', 'pixel-9-pro', 'pixel-9',
  ],
} as const;

const macBookMetadataFixtures = [
  ['macbook-air-m3-13-2024', 'MacBook Air M3 13-inch 2024', 'A3113'],
  ['macbook-air-m3-15-2024', 'MacBook Air M3 15-inch 2024', 'A3114'],
  ['macbook-air-m2-13-2022', 'MacBook Air M2 13-inch 2022', 'A2681'],
  ['macbook-air-m2-15-2023', 'MacBook Air M2 15-inch 2023', 'A2941'],
  ['macbook-air-13-2014-2017', 'MacBook Air 13-inch 2014-2017', 'A1466'],
  ['macbook-air-13-2018-2020', 'MacBook Air 13-inch 2018-2020', 'A1932 / A2179'],
  ['macbook-air-11-2014-2015', 'MacBook Air 11-inch 2014-2015', 'A1465'],
  ['macbook-air-13-m1-2020', 'MacBook Air 13-inch M1 2020', 'A2337'],
  ['macbook-pro-14-16-m3-pro-max-2024', 'MacBook Pro 14/16-inch M3 Pro/Max 2024', 'A2992 / A2991'],
  ['macbook-pro-13-m2-2022', 'MacBook Pro 13-inch M2 2022', 'A2686'],
  ['macbook-pro-14-16-m2-pro-max-2023', 'MacBook Pro 14/16-inch M2 Pro/Max 2023', 'A2779 / A2780'],
  ['macbook-pro-16-2019', 'MacBook Pro 16-inch 2019', 'A2141'],
  ['macbook-pro-15-2014-2015', 'MacBook Pro 15-inch 2014-2015', 'A1398'],
  ['macbook-pro-15-2016-2017', 'MacBook Pro 15-inch 2016-2017', 'A1707'],
  ['macbook-pro-13-2014-2015', 'MacBook Pro 13-inch 2014-2015', 'A1502'],
  ['macbook-pro-13-2016-2017', 'MacBook Pro 13-inch 2016-2017', 'A1706 / A1708'],
  ['macbook-pro-13-2018-2020', 'MacBook Pro 13-inch 2018-2020', 'A1989 / A2251'],
  ['macbook-pro-13-m1-2020', 'MacBook Pro 13-inch M1 2020', 'A2338'],
  ['macbook-pro-14-16-m1-pro-max-2021', 'MacBook Pro 14/16-inch M1 Pro/Max 2021', 'A2442 / A2485'],
  ['macbook-12-2015-2019', 'MacBook 12-inch 2015-2019', 'A1534'],
] as const;

const pixelModelData = (modelSlug: string, repairTypes = [
  { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' },
  { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 0, repairOrigin: 'pos' },
]) => modelData({
  brand: 'Google Pixel',
  model: `Google Pixel ${modelSlug}`,
  catalogueSource: 'live-pos',
  repairTypes,
  brandModels: [{ slug: modelSlug, model: `Google Pixel ${modelSlug}`, repairTypes: [] }],
});

beforeEach(() => {
  state.gridProps = null;
  state.matchingProps = [];
  state.breadcrumbProps = null;
  vi.mocked(fetchRepairCatalog).mockReset();
  vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData() as Awaited<ReturnType<typeof fetchModelRepairTypes>>);
  fetchModelRepairResultSeeds.mockResolvedValue([]);
});

describe('Model Hub page-mode Server consumer', () => {
  it.each([
    {
      label: 'iPhone 16 Plus',
      brand: 'iPhone',
      brandSlug: 'iphone',
      model: 'iPhone 16 Plus',
      modelSlug: 'iphone-16-plus',
      expectedH1: 'iPhone 16 Plus Repairs',
      expectedSummary: 'Most standard repairs: 30 Minutes',
      repairs: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 170, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 110, repairOrigin: 'pos' },
        { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 120, repairOrigin: 'pos' },
        { slug: 'water-damage-repair', name: 'Water Damage', price: 0, repairOrigin: 'pos' },
      ],
      expectedCards: [
        ['screen-replacement', '30 Minutes', undefined],
        ['back-glass-replacement', 'Varies', undefined],
        ['water-damage-repair', 'Depends on Damage', undefined],
        ['logic-board-repair', 'Diagnostic Required', undefined],
      ],
    },
    {
      label: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      brandSlug: 'samsung',
      model: 'Galaxy S24 Ultra',
      modelSlug: 'galaxy-s24-ultra',
      expectedH1: 'Samsung Galaxy S24 Ultra Repairs',
      expectedSummary: 'Most standard repairs: 30 Minutes',
      repairs: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 320, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 100, repairOrigin: 'pos' },
        { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 65, repairOrigin: 'pos' },
        { slug: 'water-damage-repair', name: 'Water Damage', price: 0, repairOrigin: 'synthetic-core' },
      ],
      expectedCards: [
        ['screen-replacement', '30 Minutes', undefined],
        ['back-glass-replacement', '20 Minutes', undefined],
        ['water-damage-repair', 'Initial Assessment & Cleaning — 30 Minutes', undefined],
        ['logic-board-repair', '30 Minutes', undefined],
      ],
    },
    {
      label: 'Google Pixel 8 Pro',
      brand: 'Google Pixel',
      brandSlug: 'google-pixel',
      model: 'Pixel 8 Pro',
      modelSlug: 'pixel-8-pro',
      expectedH1: 'Google Pixel 8 Pro Repairs',
      expectedSummary: 'Most standard repairs: 30 Minutes',
      repairs: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 360, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 99, repairOrigin: 'pos' },
        { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 0, repairOrigin: 'pos' },
        { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 0, repairOrigin: 'pos' },
      ],
      expectedCards: [
        ['screen-replacement', '30 Minutes', undefined],
        ['back-glass-replacement', '30 Minutes', 'Back Glass Replacement'],
        ['logic-board-repair', 'Diagnostic Required', undefined],
      ],
    },
    {
      label: 'OPPO Find X3 Pro',
      brand: 'OPPO',
      brandSlug: 'oppo',
      model: 'Find X3 Pro',
      modelSlug: 'find-x3-pro',
      expectedH1: 'OPPO Find X3 Pro Repairs',
      expectedSummary: 'Most standard repairs: 30–45 Minutes',
      repairs: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 320, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 90, repairOrigin: 'pos' },
        { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 0, repairOrigin: 'pos' },
      ],
      expectedCards: [
        ['screen-replacement', '45 Minutes', undefined],
        ['battery-replacement', '30 Minutes', undefined],
        ['back-glass-replacement', '20 Minutes', undefined],
        ['logic-board-repair', 'Diagnostic Required', undefined],
      ],
    },
  ])('renders precise shared model-hub content for $label', async ({
    brand,
    brandSlug,
    model,
    modelSlug,
    expectedH1,
    expectedSummary,
    repairs,
    expectedCards,
  }) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand,
      model,
      catalogueSource: 'live-pos',
      repairTypes: repairs,
      brandModels: [{ slug: modelSlug, model, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: brandSlug, model: modelSlug }),
    }));

    expect(html).toContain(`<h1 id="model-repair-heading">${expectedH1}</h1>`);
    expect(html).not.toContain('<main');
    expect(html).toContain(expectedSummary);
    expect(html).toContain('Exact repair time is shown with each service below.');
    expect(html).not.toMatch(/Around 80%|same[ -]day/i);

    for (const [slug, timingLabel, displayName] of expectedCards) {
      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === slug)).toMatchObject({
        slug,
        timingLabel,
        ...(displayName ? { displayName } : {}),
      });
    }
  });

  it('uses neutral top pricing when the lowest value is only a virtual shared-service fallback', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Samsung',
      model: 'Galaxy S24 Ultra',
      catalogueSource: 'live-pos',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 320, repairOrigin: 'pos' },
        { slug: 'camera-lens-replacement', name: 'Camera Lens Replacement', price: 50, repairOrigin: 'virtual', sourceType: 'virtual' },
      ],
      brandModels: [{ slug: 'galaxy-s24-ultra', model: 'Galaxy S24 Ultra', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'samsung', model: 'galaxy-s24-ultra' }),
    }));

    expect(html).toContain('<h2>Galaxy S24 Ultra repair pricing</h2>');
    expect(html).toContain('Each service below shows its current published price, starting price or Quote on Request.');
    expect(html).not.toContain('<h2>Galaxy S24 Ultra repairs from $50</h2>');
  });

  it('uses approved standard Apple Watch timing and disables static quote fallbacks', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Apple',
      model: 'Apple Watch Series 3 (42mm)',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'synthetic-core' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 90, repairOrigin: 'pos' },
        { slug: 'charging-repair', name: 'Charging Repair', price: 0, repairOrigin: 'synthetic-core', sourceType: 'diagnostic' },
      ],
      brandModels: [{ slug: 'apple-watch-series-3-42mm', model: 'Apple Watch Series 3 (42mm)', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'watch', brand: 'apple', model: 'apple-watch-series-3-42mm' }),
    }));

    expect(state.gridProps?.showStartingPriceFallback).toBe(false);
    expect(html).toContain('Most standard repairs: 45 Minutes');
    expect(html).not.toContain('<main');
    expect(html).toContain('Exact repair time is shown with each service below.');
    for (const repairSlug of ['screen-replacement', 'battery-replacement', 'charging-repair']) {
      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === repairSlug)?.timingLabel)
        .toBe('45 Minutes');
    }
    expect(html).not.toContain('Same-day completion is not promised');
  });

  it('uses Apple Watch-only catalogue-aware metadata without price or hardware identifiers', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Apple',
      model: 'Apple Watch Series 9 (41mm)',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'synthetic-core', sourceType: 'real' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 120, repairOrigin: 'pos' },
        { slug: 'charging-repair', name: 'Charging Repair', price: 0, repairOrigin: 'diagnostic', sourceType: 'diagnostic' },
      ],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'watch', brand: 'apple', model: 'apple-watch-series-9-41mm' }),
    });

    expect(metadata.title).toBe('Apple Watch Series 9 (41mm) Repair | Ali Mobile');
    expect(metadata.description).toBe('Apple Watch Series 9 (41mm) screen repair quote, battery replacement and charging assessment. 6-month warranty on eligible repairs. Call 0481 058 514.');
    expect(metadata.openGraph?.title).toBe('Apple Watch Series 9 (41mm) Repair | Ali Mobile');
    expect(metadata.description).not.toMatch(/\$\d|A\d{4}|Ringwood/i);
  });

  it('resolves active non-iPhone options before the Client Grid without another catalogue fetch', async () => {
    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'oppo', model: 'find-x8-pro' }) }));

    expect(fetchRepairCatalog).not.toHaveBeenCalled();
    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'front-camera-replacement', href: '/repairs/phone/front-camera-replacement?brand=oppo&model=find-x8-pro' }),
      expect.objectContaining({ slug: 'loudspeaker-replacement', href: '/repairs/phone/oppo/loudspeaker-replacement?model=find-x8-pro' }),
    ]));
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')).not.toHaveProperty('href');
  });

  it('disables static quote fallbacks for a secondary-phone model while preserving exact catalogue prices', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Motorola',
      model: 'Moto G04',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'synthetic-core' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 75, repairOrigin: 'pos' },
      ],
      brandModels: [{ slug: 'moto-g04', model: 'Moto G04', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'motorola', model: 'moto-g04' }),
    }));

    expect(state.gridProps?.showStartingPriceFallback).toBe(false);
    expect(state.gridProps?.useQuoteLedPricingSummary).toBe(true);
    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'screen-replacement', price: 0 }),
      expect.objectContaining({ slug: 'battery-replacement', price: 75 }),
      expect.objectContaining({ slug: 'loudspeaker-replacement', timingLabel: '30 Minutes' }),
    ]));
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.timingLabel)
      .toBeUndefined();
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'battery-replacement')?.timingLabel)
      .toBeUndefined();
  });

  it('omits hidden taxonomy and renders one conflicting Detail option rather than selecting POS evidence', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' },
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'synthetic-core' },
        { slug: 'microsoldering-special', name: 'Microsoldering', price: 0, repairOrigin: 'pos' },
      ],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'oppo', model: 'find-x8-pro' }) }));

    expect(state.gridProps?.repairTypes.filter((repair) => repair.slug === 'screen-replacement')).toHaveLength(1);
    expect(state.gridProps?.repairTypes.some((repair) => repair.slug === 'microsoldering-special')).toBe(false);
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')).not.toHaveProperty('href');
  });

  it('passes the central Water Damage URL to the Grid without contextual query parameters', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      repairTypes: [{ slug: 'water-damage-repair', name: 'Water Damage', price: 0, repairOrigin: 'synthetic-core' }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'oppo', model: 'find-x8-pro' }) }));

    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'water-damage-repair', href: '/repairs/water-damage' }),
    ]));
  });

  it.each([
    ['Galaxy A16', 'galaxy-a16', '/repairs/phone/samsung/galaxy-a16/water-damage-repair'],
    ['Galaxy S24 Ultra', 'galaxy-s24-ultra', '/repairs/water-damage'],
  ])('passes the resolved Samsung Water Damage target for %s to the Grid', async (model, modelSlug, href) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Samsung',
      model,
      repairTypes: [{ slug: 'water-damage-repair', name: 'Water Damage', price: 0, repairOrigin: 'synthetic-core' }],
      brandModels: [{ slug: modelSlug, model, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'samsung', model: modelSlug }),
    }));

    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'water-damage-repair', href }),
    ]));
  });

  it('keeps iPhone repairs unchanged while server-rendering one selected Motherboard Master card', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'iPhone',
      model: 'iPhone 15',
      catalogueSource: 'live-pos',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }],
      brandModels: [{ slug: 'iphone-15', model: 'iPhone 15', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'iphone', model: 'iphone-15' }),
    }));

    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'screen-replacement' }),
      expect.objectContaining({
        slug: 'logic-board-repair',
        name: 'Motherboard & Logic Board Repair',
        price: 0,
        href: '/repairs/motherboard-repair?category=phone&brand=iphone&model=iphone-15',
      }),
    ]));
    expect(state.gridProps?.repairTypes.filter((repair) => repair.slug === 'logic-board-repair')).toHaveLength(1);
    expect(state.gridProps?.repairTypes[0]).not.toHaveProperty('href');
    expect(html).toContain('href="/repairs/phone/iphone/iphone-15/screen-replacement"');
  });

  it('keeps a retained Pixel Logic Board card on its direct Detail URL without a same-day promise', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(pixelModelData('pixel-8-pro') as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'google-pixel', model: 'pixel-8-pro' }),
    }));

    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        slug: 'logic-board-repair',
        href: '/repairs/phone/google-pixel/pixel-8-pro/logic-board-repair',
      }),
    ]));
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'logic-board-repair')?.href)
      .not.toContain('/repairs/motherboard-repair?');
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'logic-board-repair')?.timingLabel)
      .toBe('Diagnostic Required');
    expect(html).not.toMatch(/same[ -]day/i);
    expect(html).toContain('Most standard repairs: 30 Minutes');
  });

  it('uses the existing 9 retained / 18 consolidated / 1 unsupported Pixel Logic Board policy without master-selector links', async () => {
    for (const modelSlug of pixelLogicBoardPolicy.retained) {
      vi.mocked(fetchModelRepairTypes).mockResolvedValue(pixelModelData(modelSlug) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

      renderToStaticMarkup(await ModelHubPage({
        params: Promise.resolve({ category: 'phone', brand: 'google-pixel', model: modelSlug }),
      }));

      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'logic-board-repair')?.href)
        .toBe(`/repairs/phone/google-pixel/${modelSlug}/logic-board-repair`);
      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.href)
        .toBe(`/repairs/phone/google-pixel/${modelSlug}/screen-replacement`);
    }

    for (const modelSlug of pixelLogicBoardPolicy.consolidated) {
      vi.mocked(fetchModelRepairTypes).mockResolvedValue(pixelModelData(modelSlug) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

      renderToStaticMarkup(await ModelHubPage({
        params: Promise.resolve({ category: 'phone', brand: 'google-pixel', model: modelSlug }),
      }));

      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'logic-board-repair')?.href)
        .toBe('/repairs/phone/logic-board-repair');
      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.href)
        .toBe(`/repairs/phone/google-pixel/${modelSlug}/screen-replacement`);
    }

    vi.mocked(fetchModelRepairTypes).mockResolvedValue(pixelModelData('pixel-9a', [
      { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' },
    ]) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'google-pixel', model: 'pixel-9a' }),
    }));

    expect(state.gridProps?.repairTypes.filter((repair) => repair.slug === 'logic-board-repair')).toHaveLength(0);
    expect(state.gridProps?.repairTypes.some((repair) => repair.href?.includes('/repairs/motherboard-repair?'))).toBe(false);
  });

  it.each([
    ['Pixel 10 Pro XL', 'pixel-10-pro-xl'],
    ['Pixel 9 Pro XL', 'pixel-9-pro-xl'],
    ['Pixel 8 Pro', 'pixel-8-pro'],
    ['Pixel 7 Pro', 'pixel-7-pro'],
    ['Pixel 6a', 'pixel-6a'],
    ['Pixel 5', 'pixel-5'],
    ['Pixel 3', 'pixel-3'],
    ['Pixel 9a', 'pixel-9a'],
  ])('renders precise per-service timing without unsupported urgency wording for %s', async (_label, modelSlug) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(pixelModelData(modelSlug) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'google-pixel', model: modelSlug }),
    }));

    expect(html).toContain('Most standard repairs: 30 Minutes');
    expect(html).toContain('Exact repair time is shown with each service below.');
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.timingLabel)
      .toBe('30 Minutes');
    expect(html).not.toMatch(/same[ -]day|while you wait|immediate|instant/i);
  });

  it.each([
    ['iPad 10th Generation', 'ipad-10th-generation', 'Charging port repairs may require additional time depending on the repair process.', 'Fast Turnaround'],
    ['iPad Air 5th Generation', 'ipad-air-5th-generation', 'Charging port repairs may require additional time depending on the repair process.', 'Fast Turnaround'],
    ['iPad mini 7th Generation', 'ipad-mini-7th-generation', 'Choose the repair below for its current service details.', '60 Minutes'],
    ['iPad Pro 11-inch M4', 'ipad-pro-11-inch-m4', 'Choose the repair below for its current service details.', '60 Minutes'],
  ])('renders approved iPad timing guidance for %s without urgency claims', async (model, modelSlug, expectedGuidance, chargingTiming) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'iPad',
      model,
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
      ],
      brandModels: [{ slug: modelSlug, model, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'tablet', brand: 'ipad', model: modelSlug }),
    }));

    expect(html).toContain('Most standard repairs for this iPad are completed in around 1 hour.');
    expect(html).not.toContain('<main');
    expect(html).toContain(expectedGuidance);
    expect(html).toContain('Typical Repair Time');
    expect(html).toContain('Most standard repairs take around 60 minutes. See individual services for details.');
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.timingLabel)
      .toBe('60 Minutes');
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'charging-port-replacement')?.timingLabel)
      .toBe(chargingTiming);
    expect(html).not.toMatch(/45 minutes|same[ -]day|while you wait|immediate|instant/i);
    expect(state.gridProps?.showStartingPriceFallback).toBe(false);
  });

  it('uses the iPad-only identity, metadata, breadcrumb and minimum-price source without changing the repair cards', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'iPad',
      model: 'iPad 10th Generation',
      repairTypes: [
        { slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 90, repairOrigin: 'pos' },
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 149, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 140, repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 140, repairOrigin: 'pos' },
      ],
      brandModels: [{ slug: 'ipad-10th-generation', model: 'iPad 10th Generation', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'tablet', brand: 'ipad', model: 'ipad-10th-generation' }),
    });
    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'tablet', brand: 'ipad', model: 'ipad-10th-generation' }),
    }));

    expect(metadata.title).toBe('iPad 10th Generation Repair | Ali Mobile');
    expect(metadata.description).toBe('iPad 10th Generation screen repair, battery replacement, and charging repair options. 6-month warranty on eligible repairs. Call 0481 058 514.');
    expect(`${metadata.title} ${metadata.description}`).not.toMatch(/\$\d|A\d{4}|Ringwood/);
    expect(html).toContain('Model Numbers: A2696 · A2757 · A2777 · A3162');
    expect(html).toContain('iPad Repairs From $90');
    expect(html).toContain('Starting price applies to Front Camera Replacement. Select a repair below to view pricing and availability.');
    expect(html).toContain('Typical Repair Time');
    expect(html).toContain('Most standard repairs take around 60 minutes. See individual services for details.');
    expect(html).toContain('6-Month Repair Warranty');
    expect(html).toContain('Eligible iPad repairs include a 6-month warranty on parts and labour. Water-damage repairs are excluded.');
    const identityLine = html.match(/<p class="mt-2 text-sm font-semibold text-slate-600">(Model Numbers:[^<]+)<\/p>/)?.[1];
    expect(identityLine).toBe('Model Numbers: A2696 · A2757 · A2777 · A3162');
    expect(identityLine).not.toMatch(/China|North America|Wi-Fi|Cellular|mmWave/);
    expect(state.breadcrumbProps).toEqual(expect.objectContaining({ modelLabel: 'iPad 10th Generation' }));
    expect(state.matchingProps).toEqual([expect.objectContaining({ suppressSelfLinkedCta: true })]);
    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'front-camera-replacement', price: 90 }),
      expect.objectContaining({ slug: 'screen-replacement', price: 149 }),
      expect.objectContaining({ slug: 'battery-replacement', price: 140 }),
      expect.objectContaining({ slug: 'charging-port-replacement', price: 140 }),
    ]));
  });

  it.each([
    ['Samsung tablet', 'Samsung', 'Galaxy Tab A 8.0 2017', 'samsung', 'galaxy-tab-a-80-2017-sm-t380-sm-t385'],
    ['Lenovo tablet', 'Lenovo', 'Lenovo Tab P12', 'lenovo', 'lenovo-tab-p12-tb-370fu'],
  ])('renders 1-hour standard timing on the %s Model Hub', async (_label, brand, model, brandSlug, modelSlug) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand,
      model,
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 99, repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
      ],
      brandModels: [{ slug: modelSlug, model, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'tablet', brand: brandSlug, model: modelSlug }),
    }));

    expect(html).toContain('Most standard repairs: 60 Minutes');
    expect(html).not.toContain('<main');
    for (const repairSlug of ['screen-replacement', 'battery-replacement', 'charging-port-replacement']) {
      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === repairSlug)?.timingLabel)
        .toBe('60 Minutes');
    }
  });

  it('renders 1-hour standard MacBook timing without applying it to Logic Board diagnosis', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'MacBook',
      model: 'MacBook Air M3 13-inch',
      modelCode: 'A3113',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 299, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 159, repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
      ],
      brandModels: [{ slug: 'macbook-air-m3-13-2024', model: 'MacBook Air M3 13-inch', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'laptop', brand: 'macbook', model: 'macbook-air-m3-13-2024' }),
    }));

    expect(html).toContain('Most standard repairs: 60 Minutes');
    expect(html).not.toContain('<main');
    expect(html).toContain('Many standard MacBook repairs take around 1 hour when the correct part is available and the repair path is confirmed. More complex diagnosis and parts ordering may take longer.');
    expect(html).toContain('<p class="mt-2 text-sm font-semibold text-slate-600">Model A3113</p>');
    expect(html).toContain('6-Month Repair Warranty');
    expect(html).toContain('Water-damage repairs are excluded.');
    expect(html).toContain('Parts availability and ordering time are confirmed before repair.');
    expect(html).not.toMatch(/one to two days/i);
    for (const repairSlug of ['screen-replacement', 'battery-replacement', 'charging-port-replacement']) {
      expect(state.gridProps?.repairTypes.find((repair) => repair.slug === repairSlug)?.timingLabel)
        .toBe('60 Minutes');
    }
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'logic-board-repair')?.timingLabel)
      .toBe('Diagnostic Required');
  });

  it('uses the catalogue A-number and actual repair availability in MacBook metadata', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'MacBook',
      model: 'MacBook Air M3 13-inch',
      modelCode: 'A3113',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 299, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 159, repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
      ],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'laptop', brand: 'macbook', model: 'macbook-air-m3-13-2024' }),
    });

    expect(metadata.title).toBe('MacBook Air M3 13-inch A3113 Repair | Ali Mobile');
    expect(metadata.description).toBe('MacBook Air M3 13-inch, model A3113. Screen and battery repairs, plus charging repair quote. View options and quotes. 6-month warranty on eligible repairs. Call 0481 058 514.');
    expect(metadata.description).not.toMatch(/Ringwood|\$\d|60 Minutes/i);
  });

  it.each(macBookMetadataFixtures)('uses only the fixture model identity for %s metadata', async (modelSlug, model, modelCode) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'MacBook',
      model,
      modelCode,
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 299, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 159, repairOrigin: 'pos' },
        { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
      ],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'laptop', brand: 'macbook', model: modelSlug }),
    });

    expect(metadata.title).toBe(`${model} ${modelCode} Repair | Ali Mobile`);
    expect(metadata.description).toBe(`${model}, ${modelCode.includes('/') ? 'models' : 'model'} ${modelCode}. Screen and battery repairs, plus charging repair quote. View options and quotes. 6-month warranty on eligible repairs. Call 0481 058 514.`);
    expect(metadata.description).not.toMatch(/Ringwood|\$\d|guaranteed|1[–-]2 days/i);
  });

  it.each([
    ['Samsung', 'Samsung', 'galaxy-s23', '/repairs/motherboard-repair?category=phone&brand=samsung&model=galaxy-s23'],
    ['OPPO', 'OPPO', 'find-x8-pro', '/repairs/motherboard-repair?category=phone&brand=oppo&model=find-x8-pro'],
  ])('keeps the motherboard master card for non-Pixel %s model hubs', async (_label, brand, modelSlug, href) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand,
      model: `${brand} ${modelSlug}`,
      catalogueSource: 'live-pos',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }],
      brandModels: [{ slug: modelSlug, model: `${brand} ${modelSlug}`, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: brand.toLowerCase(), model: modelSlug }),
    }));

    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'logic-board-repair', href }),
    ]));
  });

  it('keeps iPhone Model Hub metadata broad and sends screen-detail intent to the exact SSR link', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'iPhone',
      model: 'iPhone 17 Pro Max',
      catalogueSource: 'live-pos',
      repairTypes: [
        {
          slug: 'screen-replacement',
          name: 'Screen Replacement',
          price: 199,
          repairOrigin: 'pos',
          variants: [{ quality_grade: 'Premium OLED', price: 249 }],
        },
      ],
      brandModels: [{ slug: 'iphone-17-pro-max', model: 'iPhone 17 Pro Max', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'phone', brand: 'iphone', model: 'iphone-17-pro-max' }),
    });
    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'iphone', model: 'iphone-17-pro-max' }),
    }));

    expect(metadata.title).toBe('iPhone 17 Pro Max Repair in Ringwood | Repair Options, Pricing & Booking | Ali Mobile');
    expect(metadata.openGraph?.title).toBe('iPhone 17 Pro Max Repair in Ringwood | Repair Options, Pricing & Booking');
    expect(metadata.description).not.toContain('screen options where published');
    expect(html).toContain('href="/repairs/phone/iphone/iphone-17-pro-max/screen-replacement"');
    expect(html).toContain('View screen replacement options');
    expect(html.match(/View screen replacement options/g)).toHaveLength(1);
    expect(html).toContain('Screen replacement preview for this iPhone model');
    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'screen-replacement' }),
    ]));
  });

  it.each([
    ['galaxy-z-fold-7', 'Galaxy Z Fold 7'],
    ['galaxy-z-flip-7', 'Galaxy Z Flip 7'],
  ])('uses the approved Samsung screen timing for %s', async (model, modelName) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Samsung',
      model: modelName,
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' }],
      brandModels: [{ slug: model, model: modelName, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'samsung', model }),
    }));

    expect(html).toContain('Most standard repairs: 30 Minutes');
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.timingLabel)
      .toBe('30 Minutes');
    expect(html).not.toMatch(/same[ -]day/i);
  });

  it('keeps normal Samsung screen timing unchanged', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Samsung',
      model: 'Galaxy S23 Ultra',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' }],
      brandModels: [{ slug: 'galaxy-s23-ultra', model: 'Galaxy S23 Ultra', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'samsung', model: 'galaxy-s23-ultra' }),
    }));

    expect(html).toContain('Most standard repairs: 30 Minutes');
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')?.timingLabel)
      .toBe('30 Minutes');
    expect(html).not.toMatch(/same[ -]day/i);
  });

  it('server-renders the category-aware Motherboard Master card for MacBook without phone query leakage', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'MacBook',
      model: 'MacBook Air M3',
      catalogueSource: 'live-pos',
      repairTypes: [{ slug: 'keyboard-repair', name: 'Keyboard Repair', price: 249, repairOrigin: 'pos' }],
      brandModels: [{ slug: 'macbook-air-m3', model: 'MacBook Air M3', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'laptop', brand: 'macbook', model: 'macbook-air-m3' }) }));

    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'keyboard-repair', name: 'Keyboard Repair', price: 249 }),
      expect.objectContaining({
        slug: 'logic-board-repair',
        href: '/repairs/motherboard-repair?category=laptop&brand=macbook&model=macbook-air-m3',
      }),
    ]));
    expect(state.gridProps?.showStartingPriceFallback).toBe(false);
  });

  it('passes canonical exact-model server seeds to the one enhanced-branch Repair Results module', async () => {
    const seed = [{ id: 'exact-result', model_slug: 'find-x8-pro' }];
    fetchModelRepairResultSeeds.mockResolvedValueOnce(seed);

    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'oppo', model: 'find-x8-pro' }) }));

    expect(fetchModelRepairResultSeeds).toHaveBeenCalledWith({ category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro' });
    expect(state.matchingProps).toEqual([expect.objectContaining({ initialResults: seed })]);
  });

  it('passes the same server seed to the one standard-branch Repair Results module', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Future Brand',
      model: 'Future Laptop',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }],
      brandModels: [{ slug: 'future-laptop', model: 'Future Laptop', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);
    const seed = [{ id: 'future-laptop-result', model_slug: 'future-laptop' }];
    fetchModelRepairResultSeeds.mockResolvedValueOnce(seed);

    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'laptop', brand: 'future-brand', model: 'future-laptop' }) }));

    expect(fetchModelRepairResultSeeds).toHaveBeenCalledWith({ category: 'laptop', brandSlug: 'future-brand', modelSlug: 'future-laptop' });
    expect(state.matchingProps).toEqual([expect.objectContaining({ initialResults: seed })]);
  });

  it('keeps the enhanced branch unseeded when the server reader has no usable results', async () => {
    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'oppo', model: 'find-x8-pro' }) }));

    expect(state.matchingProps).toEqual([expect.objectContaining({ initialResults: undefined })]);
  });
});
