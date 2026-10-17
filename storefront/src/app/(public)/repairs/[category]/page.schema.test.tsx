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
vi.mock('@/components/CategoryHubJumpButton', () => ({ default: ({ children, targetId }: { children: ReactNode; targetId: string }) => <button type="button" aria-controls={targetId}>{children}</button> }));
vi.mock('@/components/repair-results/HubRepairResultsSection', () => ({ default: () => null }));

const { default: CategoryHubPage } = await import('./page');

beforeEach(() => {
  state.serviceProps = [];
  fetchRepairCatalog.mockResolvedValue({ brands: [
    { category: 'phone', slug: 'iphone', brand: 'iPhone', models: [] },
    { category: 'phone', slug: 'motorola', brand: 'Motorola', models: [] },
    { category: 'tablet', slug: 'ipad', brand: 'iPad', models: [] },
    { category: 'laptop', slug: 'dell', brand: 'Dell', models: [] },
    { category: 'laptop', slug: 'macbook', brand: 'MacBook', models: [] },
    { category: 'watch', slug: 'apple', brand: 'Apple', models: [] },
  ] });
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
    expect(html).toContain('Choose Your Phone Brand');
    expect(html).toContain('aria-controls="brands-list"');
    expect(html).toContain('id="brands-list"');
    expect(html).toContain('<div class="repair-hero-actions"><button type="button" aria-controls="brands-list">Choose Your Phone Brand');
    expect(html).not.toContain('<div class="repair-hero-actions"><a href="/book-repair"');
    expect(html).toContain('href="/repairs/phone/iphone"');
    expect(html).toContain('href="/repairs/phone/motorola"');
    expect(html).toContain('Other Supported Brands');

    for (const href of [
      '/repairs/screen-replacement',
      '/repairs/battery-replacement',
      '/repairs/charging-port-replacement',
      '/repairs/back-glass-replacement',
    ]) {
      expect(html).toContain(`href=\"${href}\"`);
    }
  });

  it.each([
    ['tablet', 'Choose Your Tablet Brand', 'brands-list', '/repairs/tablet/ipad'],
    ['laptop', 'Choose Your Laptop Brand', 'laptop-brands', '/repairs/laptop/dell'],
    ['watch', 'Choose Your Watch Model', 'watch-model-selection', '/repairs/watch/apple'],
  ])('keeps the shared %s category template landmark-free and targets its existing selection section', async (category, label, targetId, brandHref) => {
    const html = renderToStaticMarkup(await CategoryHubPage({ params: Promise.resolve({ category }) }));

    expect(html).not.toContain('<main');
    expect(html).toContain(label);
    expect(html).toContain(`aria-controls="${targetId}"`);
    expect(html).toContain(`id="${targetId}"`);
    expect(html).toContain(`href="${brandHref}"`);
    expect(html).not.toContain('<div class="repair-hero-actions"><a href="/book-repair"');
    expect(html).not.toContain('>Choose a Brand<');

    if (category === 'laptop') {
      expect(html.match(/Choose Your Laptop Brand/g)).toHaveLength(1);
    }

    if (category === 'watch') {
      expect(html).toContain('Smart Watch Brand and Model Paths');
    }

    if (category === 'tablet') {
      expect(html).toContain('Many standard tablet repairs take around 1 hour. Timing depends on the model, repair type, diagnosis and parts availability.');
      expect(html).toContain('Monday–Saturday: 9:00am–5:00pm; Sunday: Closed. Walk-ins are welcome.');
      expect(html).toContain('iPad screen repairs start from $99 for selected older models. Contact us to confirm pricing and availability for your device.');
    }
  });
});
