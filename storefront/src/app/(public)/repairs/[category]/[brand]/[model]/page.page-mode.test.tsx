import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchModelRepairTypes, fetchRepairCatalog } from '@/lib/api';

const state = vi.hoisted(() => ({
  gridProps: null as { repairTypes: Array<{ slug: string; href?: string }>; showStartingPriceFallback?: boolean } | null,
  matchingProps: [] as Array<{ initialResults?: unknown[] }>,
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
vi.mock('@/components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('@/components/BackButton', () => ({ default: () => null }));
vi.mock('@/components/services/RepairOptionsGrid', () => ({
  default: (props: { repairTypes: Array<{ slug: string; href?: string }>; showStartingPriceFallback?: boolean }) => {
    state.gridProps = props;
    return <div data-repair-options-grid="true" />;
  },
}));
vi.mock('@/components/services/RepairCTA', () => ({ default: () => null }));
vi.mock('@/components/repair-results/RepairResultsMatchingSection', () => ({
  default: (props: { initialResults?: unknown[] }) => {
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
  vi.mocked(fetchRepairCatalog).mockReset();
  vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData() as Awaited<ReturnType<typeof fetchModelRepairTypes>>);
  fetchModelRepairResultSeeds.mockResolvedValue([]);
});

describe('Model Hub page-mode Server consumer', () => {
  it('resolves active non-iPhone options before the Client Grid without another catalogue fetch', async () => {
    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'oppo', model: 'find-x8-pro' }) }));

    expect(fetchRepairCatalog).not.toHaveBeenCalled();
    expect(state.gridProps?.repairTypes).toEqual(expect.arrayContaining([
      expect.objectContaining({ slug: 'front-camera-replacement', href: '/repairs/phone/front-camera-replacement?brand=oppo&model=find-x8-pro' }),
      expect.objectContaining({ slug: 'loudspeaker-replacement', href: '/repairs/phone/oppo/loudspeaker-replacement?model=find-x8-pro' }),
    ]));
    expect(state.gridProps?.repairTypes.find((repair) => repair.slug === 'screen-replacement')).not.toHaveProperty('href');
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
    expect(html).not.toMatch(/same[ -]day/i);
    expect(html).toContain('Timing depends on the selected repair, part availability and the device condition.');
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
  ])('renders neutral repair-timing guidance without unsupported urgency wording for %s', async (_label, modelSlug) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(pixelModelData(modelSlug) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'google-pixel', model: modelSlug }),
    }));

    expect(html).toContain('How is repair timing confirmed?');
    expect(html).toContain('What affects Google Pixel');
    expect(html).toContain('Timing depends on the selected repair, part availability and the device condition.');
    expect(html).not.toMatch(/same[ -]day|while you wait|immediate|instant/i);
  });

  it.each([
    ['iPad 10th Generation', 'ipad-10th-generation', 'Charging port repairs may require additional time depending on the repair process.'],
    ['iPad Air 5th Generation', 'ipad-air-5th-generation', 'Charging port repairs may require additional time depending on the repair process.'],
    ['iPad mini 7th Generation', 'ipad-mini-7th-generation', 'Choose the repair below for its current service details.'],
    ['iPad Pro 11-inch M4', 'ipad-pro-11-inch-m4', 'Choose the repair below for its current service details.'],
  ])('renders approved iPad timing guidance for %s without urgency claims', async (model, modelSlug, expectedGuidance) => {
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
    expect(html).toContain(expectedGuidance);
    expect(html).not.toMatch(/45 minutes|same[ -]day|while you wait|immediate|instant/i);
    expect(state.gridProps?.showStartingPriceFallback).toBe(false);
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
  ])('uses foldable-safe screen timing for %s', async (model, modelName) => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'Samsung',
      model: modelName,
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' }],
      brandModels: [{ slug: model, model: modelName, repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const html = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'samsung', model }),
    }));

    expect(html).toContain('Timing depends on the confirmed display path, parts availability and assessment.');
    expect(html).not.toContain('about 30 minutes');
    expect(html).not.toContain('Same-day repair may be available');
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

    expect(html).toContain('about 30 minutes');
    expect(html).toContain('Same-day repair may be available');
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
