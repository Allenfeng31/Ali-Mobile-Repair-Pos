import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchCategoryHubRepairResultSeeds = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ serviceProps: [] as Array<Record<string, unknown>> }));

vi.mock('next/link', () => ({ default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }) }));
vi.mock('lucide-react', () => ({ ArrowRight: () => null, Clock: () => null, MapPin: () => null, MessageCircle: () => null, PhoneCall: () => null, ShieldCheck: () => null, Sparkles: () => null }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));
vi.mock('@/lib/inventoryUtils', () => ({ formatDynamicParam: (value: string) => value, safeSlugSegment: (value: string) => value }));
vi.mock('@/lib/repair-results.server', () => ({ fetchCategoryHubRepairResultSeeds }));
vi.mock('@/components/services/ServiceSchema', () => ({
  ServiceSchema: (props: Record<string, unknown>) => {
    state.serviceProps.push(props);
    return null;
  },
}));
vi.mock('@/components/services/LivePricingGrid', () => ({ default: () => null }));
vi.mock('@/components/ScrollReveal', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/FloatingJumpCTA', () => ({ default: () => null }));
vi.mock('@/components/repair-results/HubRepairResultsSection', () => ({ default: () => null }));

const { default: CategoryHubPage } = await import('./page');

beforeEach(() => {
  state.serviceProps = [];
  fetchRepairCatalog.mockResolvedValue({ brands: [{ category: 'phone', slug: 'samsung', brand: 'Samsung', models: [] }] });
  fetchCategoryHubRepairResultSeeds.mockResolvedValue([]);
});

describe('CategoryHubPage service schema', () => {
  it('passes the phone hub canonical URL and existing category-specific Service data', async () => {
    renderToStaticMarkup(await CategoryHubPage({ params: Promise.resolve({ category: 'phone' }) }));

    expect(state.serviceProps).toEqual([{
      url: 'https://www.alimobile.com.au/repairs/phone',
      serviceName: 'Mobile Phone Repair Services by Brand and Model',
      description: 'Mobile phone repair pathways for supported iPhone, Samsung Galaxy, Google Pixel, OPPO and other models. Pricing and timing are confirmed after the model, repair type, parts availability and diagnosis are checked.',
    }]);
  });

  it('keeps phone-hub SSR facts, links, and timing qualified without owning a second main landmark', async () => {
    const html = renderToStaticMarkup(await CategoryHubPage({ params: Promise.resolve({ category: 'phone' }) }));

    expect(html).not.toContain('<main');
    expect(html).toContain('available repair options and the current published price or Quote on Request');
    expect(html).toContain('Typical phone repairs can take 15–60 Minutes');
    expect(html).toContain('exact model, repair type, diagnosis, parts availability and workshop workload');
    expect(html).toContain('Complex faults, liquid damage and board-level repairs may require a different timeframe');
    expect(html).toContain('Model-specific parts and repair options');
    expect(html).toContain('Common screen and battery repair pathways');
    expect(html).not.toContain('live repair options and pricing');
    expect(html).not.toContain('Premium Quality Screens &amp; Parts Available');
    expect(html).not.toContain('Fast repair options for common screens and batteries');

    for (const href of [
      '/repairs/screen-replacement',
      '/repairs/battery-replacement',
      '/repairs/charging-port-replacement',
      '/repairs/back-glass-replacement',
    ]) {
      expect(html).toContain(`href=\"${href}\"`);
    }
  });

  it.each(['tablet', 'laptop', 'watch'])('does not add a page-level main landmark to the shared %s category template', async (category) => {
    const html = renderToStaticMarkup(await CategoryHubPage({ params: Promise.resolve({ category }) }));

    expect(html).not.toContain('<main');
  });
});
