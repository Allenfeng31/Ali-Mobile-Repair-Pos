import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchHomepageRepairResultSeed = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ repairResultsProps: [] as Array<Record<string, unknown>> }));

vi.mock('next/link', () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('@/components/seo/SchemaOrg', () => ({ LocalBusinessSchema: () => null }));
vi.mock('@/components/ScrollReveal', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/RingwoodSquareLocationMap', () => ({ default: () => null }));
vi.mock('@/lib/repair-results.server', () => ({ fetchHomepageRepairResultSeed }));
vi.mock('@/components/repair-results/RealRepairResultsSection', () => ({
  default: (props: Record<string, unknown>) => {
    state.repairResultsProps.push(props);
    return <div data-repair-results="true" />;
  },
}));
vi.mock('lucide-react', () => ({
  Clock3: () => null,
  MapPin: () => null,
  Navigation: () => null,
  PhoneCall: () => null,
}));

const { default: Home } = await import('./page');

beforeEach(() => {
  state.repairResultsProps = [];
  fetchHomepageRepairResultSeed.mockReset();
});

describe('Homepage Repair Results SSR integration', () => {
  it('fetches once and passes one non-empty server seed to the existing visual module', async () => {
    const seed = { resultsByCategory: { phone: { id: 'homepage-result' } }, latestPublishedAt: '2026-09-03T09:00:00.000Z' };
    fetchHomepageRepairResultSeed.mockResolvedValue(seed);

    renderToStaticMarkup(await Home());

    expect(fetchHomepageRepairResultSeed).toHaveBeenCalledTimes(1);
    expect(state.repairResultsProps).toEqual([expect.objectContaining({ initialResults: seed.resultsByCategory, initialLatestPublishedAt: seed.latestPublishedAt })]);
  });

  it('passes undefined rather than an empty server payload, preserving the client fallback', async () => {
    fetchHomepageRepairResultSeed.mockResolvedValue({ resultsByCategory: {}, latestPublishedAt: null });

    renderToStaticMarkup(await Home());

    expect(state.repairResultsProps).toEqual([expect.objectContaining({ initialResults: undefined, initialLatestPublishedAt: undefined })]);
  });
});
