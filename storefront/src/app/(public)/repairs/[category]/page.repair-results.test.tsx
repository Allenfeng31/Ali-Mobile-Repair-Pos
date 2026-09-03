import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchCategoryHubRepairResultSeeds = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ hubProps: [] as Array<Record<string, unknown>> }));

vi.mock('next/link', () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }) }));
vi.mock('lucide-react', () => ({ ArrowRight: () => null, Clock: () => null, MapPin: () => null, MessageCircle: () => null, PhoneCall: () => null, ShieldCheck: () => null, Sparkles: () => null }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/inventoryUtils', () => ({ formatDynamicParam: (value: string) => value, safeSlugSegment: (value: string) => value }));
vi.mock('@/lib/repair-results.server', () => ({ fetchCategoryHubRepairResultSeeds }));
vi.mock('@/components/services/ServiceSchema', () => ({ ServiceSchema: () => null }));
vi.mock('@/components/services/LivePricingGrid', () => ({ default: () => null }));
vi.mock('@/components/ScrollReveal', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/FloatingJumpCTA', () => ({ default: () => null }));
vi.mock('@/components/repair-results/HubRepairResultsSection', () => ({
  default: (props: Record<string, unknown>) => {
    state.hubProps.push(props);
    return <div data-hub-repair-results="true" />;
  },
}));

const { default: CategoryHubPage } = await import('./page');

const catalog = {
  brands: [{ category: 'phone', slug: 'future-brand', brand: 'Future Brand', models: [] }],
};

beforeEach(() => {
  state.hubProps = [];
  fetchRepairCatalog.mockResolvedValue(catalog);
  fetchCategoryHubRepairResultSeeds.mockReset();
});

describe('Category Hub Repair Results SSR integration', () => {
  it('reads once and passes a non-empty server seed to the one existing Hub module', async () => {
    const seeds = [{ id: 'category-result', repair_type_slug: 'screen-replacement' }];
    fetchCategoryHubRepairResultSeeds.mockResolvedValue(seeds);

    renderToStaticMarkup(await CategoryHubPage({ params: Promise.resolve({ category: 'phone' }) }));

    expect(fetchCategoryHubRepairResultSeeds).toHaveBeenCalledTimes(1);
    expect(fetchCategoryHubRepairResultSeeds).toHaveBeenCalledWith('phone');
    expect(state.hubProps).toEqual([expect.objectContaining({ initialResults: seeds, category: 'phone', scope: 'repair-hub' })]);
  });

  it.each(['phone', 'tablet', 'laptop', 'watch'])('passes undefined rather than [] for an empty %s seed', async (category) => {
    fetchCategoryHubRepairResultSeeds.mockResolvedValue([]);

    renderToStaticMarkup(await CategoryHubPage({ params: Promise.resolve({ category }) }));

    expect(state.hubProps).toEqual([expect.objectContaining({ initialResults: undefined, category, scope: 'repair-hub' })]);
  });
});
