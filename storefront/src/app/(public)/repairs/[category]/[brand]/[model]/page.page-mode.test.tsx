import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchModelRepairTypes, fetchRepairCatalog } from '@/lib/api';

const state = vi.hoisted(() => ({
  gridProps: null as { repairTypes: Array<{ slug: string; href?: string }> } | null,
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
  default: (props: { repairTypes: Array<{ slug: string; href?: string }> }) => {
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

const { default: ModelHubPage } = await import('./page');

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

  it('leaves iPhone options without a Server policy href', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(modelData({
      brand: 'iPhone',
      model: 'iPhone 15',
      catalogueSource: 'live-pos',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }],
      brandModels: [{ slug: 'iphone-15', model: 'iPhone 15', repairTypes: [] }],
    }) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category: 'phone', brand: 'iphone', model: 'iphone-15' }) }));

    expect(state.gridProps?.repairTypes).toEqual([expect.objectContaining({ slug: 'screen-replacement' })]);
    expect(state.gridProps?.repairTypes[0]).not.toHaveProperty('href');
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
