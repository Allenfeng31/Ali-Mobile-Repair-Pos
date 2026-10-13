import { renderToStaticMarkup } from 'react-dom/server';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchModelRepairTypes, fetchRepairCatalog } from '@/lib/api';

const state = vi.hoisted(() => ({
  gridProps: null as {
    repairTypes: Array<{ slug: string; href?: string; price?: number }>;
    showStartingPriceFallback?: boolean;
    useQuoteLedPricingSummary?: boolean;
  } | null,
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock('next/navigation', () => ({ notFound: vi.fn(), permanentRedirect: vi.fn() }));
vi.mock('@/lib/api', () => ({ fetchModelRepairTypes: vi.fn(), fetchRepairCatalog: vi.fn() }));
vi.mock('@/lib/virtualCameraLens', () => ({ withVirtualCameraLensRepairOption: (repairs: unknown[]) => repairs }));
vi.mock('@/lib/virtualPhoneRepairs', () => ({
  withVirtualPhoneRepairOptions: (repairs: Array<Record<string, unknown>>) => repairs,
}));
vi.mock('@/components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('@/components/BackButton', () => ({ default: () => null }));
vi.mock('@/components/services/RepairOptionsGrid', () => ({
  default: (props: {
    repairTypes: Array<{ slug: string; href?: string; price?: number }>;
    categorySlug?: string;
    brandSlug?: string;
    modelSlug?: string;
    showStartingPriceFallback?: boolean;
    useQuoteLedPricingSummary?: boolean;
  }) => {
    state.gridProps = props;
    return (
      <div data-repair-options-grid="true">
        {props.repairTypes.map((r) => (
          <a
            key={r.slug}
            href={
              r.href ||
              `/repairs/${props.categorySlug || 'phone'}/${props.brandSlug || 'vivo'}/${props.modelSlug || 'y20s'}/${r.slug}`
            }
          >
            {r.slug}
          </a>
        ))}
      </div>
    );
  },
}));
vi.mock('@/components/services/RepairCTA', () => ({ default: () => null }));
vi.mock('@/components/repair-results/RepairResultsMatchingSection', () => ({ default: () => null }));
vi.mock('@/lib/repair-results.server', () => ({ fetchModelRepairResultSeeds: vi.fn().mockResolvedValue([]) }));
vi.mock('@/components/ScrollReveal', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/FloatingJumpCTA', () => ({ default: () => null }));

const { default: ModelHubPage, generateMetadata } = await import('./page');

const vivoY20sModelData = () => ({
  brand: 'Vivo',
  model: 'Y20s',
  source: 'pos' as const,
  catalogueSource: 'live-pos' as const,
  repairTypes: [
    { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' as const },
    { slug: 'battery-replacement', name: 'Battery Replacement', price: 0, repairOrigin: 'pos' as const },
    { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' as const },
    { slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 0, repairOrigin: 'pos' as const },
    { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 0, repairOrigin: 'pos' as const },
    { slug: 'water-damage-repair', name: 'Water Damage Repair', price: 0, repairOrigin: 'pos' as const },
  ],
  brandModels: [{ slug: 'y20s', model: 'Y20s', repairTypes: [] }],
});

const vivoControlModelData = () => ({
  brand: 'Vivo',
  model: 'Y70',
  source: 'pos' as const,
  catalogueSource: 'last-known-good' as const,
  repairTypes: [
    { slug: 'screen-replacement', name: 'Screen Replacement', price: 0 },
  ],
  brandModels: [{ slug: 'y70', model: 'Y70', repairTypes: [] }],
});

beforeEach(() => {
  state.gridProps = null;
  vi.mocked(fetchRepairCatalog).mockReset();
  vi.mocked(fetchModelRepairTypes).mockReset();
});

describe('Vivo Y20s Model Hub Content Refinement', () => {
  it('renders improved H1 and bespoke intro for Vivo Y20s while keeping controls generic', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(vivoY20sModelData() as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const pageElement = await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'vivo', model: 'y20s' }),
    });
    const html = renderToStaticMarkup(pageElement);

    // Expected H1
    expect(html).toContain('<h1 id="model-repair-heading">Vivo Y20s Repairs</h1>');
    expect(html).not.toContain('<h1 id="model-repair-heading">Y20s repair options</h1>');

    // Expected bespoke intro
    expect(html).toContain('Ali Mobile provides Vivo Y20s repairs at Ringwood Square.');
    expect(html).toContain('service details and booking options');
    expect(html).not.toContain('Choose the available repair for your exact Y20s to view current pricing, screen options where published');

    // No fabricated model codes or specs
    expect(html).not.toContain('V2029');
    expect(html).not.toContain('V2027');
    expect(html).not.toContain('5000 mAh');
    expect(html).not.toContain('6.51');

    // Repair links preserved
    expect(html).toContain('/repairs/phone/vivo/y20s/screen-replacement');
    expect(html).toContain('/repairs/phone/vivo/y20s/battery-replacement');
    expect(html).toContain('/repairs/phone/vivo/y20s/charging-port-replacement');
  });

  it('preserves existing Vivo Y20s metadata unchanged', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(vivoY20sModelData() as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: 'phone', brand: 'vivo', model: 'y20s' }),
    });

    expect(metadata.title).toBe('Y20s Repair in Ringwood | Pricing, Screen Options & Booking | Ali Mobile');
    expect(metadata.description).toBe(
      'Choose the available Vivo repairs for Y20s, view current pricing, check supported repair options, and book with Ali Mobile & Repair in Ringwood.'
    );
    expect(metadata.alternates?.canonical).toBe('/repairs/phone/vivo/y20s');
  });

  it('keeps other Vivo models on generic H1 and intro', async () => {
    vi.mocked(fetchModelRepairTypes).mockResolvedValue(vivoControlModelData() as Awaited<ReturnType<typeof fetchModelRepairTypes>>);

    const pageElement = await ModelHubPage({
      params: Promise.resolve({ category: 'phone', brand: 'vivo', model: 'y70' }),
    });
    const html = renderToStaticMarkup(pageElement);

    expect(html).toContain('<h1 id="model-repair-heading">Y70 repair options</h1>');
    expect(html).not.toContain('<h1 id="model-repair-heading">Vivo Y70 Repair in Ringwood</h1>');
    expect(html).toContain('Choose the available repair for your exact Y70 to view current pricing');
  });
});
