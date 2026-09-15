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
      description: 'Mobile phone repair pathways for supported iPhone, Samsung Galaxy, Google Pixel, OPPO and other models. Same-day options may be available for common screen and battery repairs when parts are in stock.',
    }]);
  });
});
