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
vi.mock('../ClientChatWidget', () => ({ default: () => null }));
vi.mock('../Header', () => ({ default: () => null }));
vi.mock('@/context/CartContext', () => ({ CartProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/PageTransition', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/SocialIcon', () => ({ default: () => null }));
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
  ShieldCheck: () => null,
  Wrench: () => null,
}));

const { default: Home } = await import('./page');
const { default: PublicLayout } = await import('./layout');

beforeEach(() => {
  state.repairResultsProps = [];
  fetchHomepageRepairResultSeed.mockReset();
});

describe('Homepage Repair Results SSR integration', () => {
  it('keeps approved homepage trust, price-path, timing, and repair-category content visible', async () => {
    fetchHomepageRepairResultSeed.mockResolvedValue({ resultsByCategory: {}, latestPublishedAt: null });

    const markup = renderToStaticMarkup(await Home());

    expect(markup).toContain('Serving Ringwood since 2014');
    expect(markup).toContain('6-Month Warranty on Standard Repairs');
    expect(markup).toMatch(/<a class="primary-btn" href="\/book-repair">Check Price &amp; Book<\/a>/);
    expect(markup).toContain('Typical repair time: 15–60 min');
    expect(markup.match(/Typical repair time: 1–2 hours/g)).toHaveLength(2);
    expect(markup).toContain('Typical repair time: around 45 min');
    expect(markup).toContain('Expert Phone, Tablet &amp; MacBook Repair');
    expect(markup).toContain('Phone Repair');
    expect(markup).toContain('iPhone, Samsung, Google Pixel and Oppo');
    expect(markup).toContain('iPad and tablet');
    expect(markup).toContain('MacBook screen');
    expect(markup).toContain('Apple Watch screen');
    expect(markup).toContain('Screen Replacement');
    expect(markup).toContain('Battery Replacement');
    expect(markup).toContain('Charging Port Repair');
    expect(markup).toContain('href="/repairs/screen-replacement"');
    expect(markup).toContain('href="/repairs/battery-replacement"');
    expect(markup).toContain('href="/repairs/charging-port-replacement"');
    expect(markup).toContain('href="/repairs/back-glass-replacement"');
    expect(markup).toContain('Ringwood Square');
  });

  it('renders the homepage inside the public layout with exactly one main landmark', async () => {
    fetchHomepageRepairResultSeed.mockResolvedValue({ resultsByCategory: {}, latestPublishedAt: null });

    const markup = renderToStaticMarkup(<PublicLayout>{await Home()}</PublicLayout>);

    expect(markup.match(/<main(?:\s|>)/g)).toHaveLength(1);
  });

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
