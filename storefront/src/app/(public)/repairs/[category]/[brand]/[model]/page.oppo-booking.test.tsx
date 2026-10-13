import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveInitialCartState, resolvePublicBookingCartState } from '@/lib/cartAutoSelect';
import type { ParsedItem } from '@/lib/inventoryUtils';
import { resolvePublicBookingSelection } from '@/lib/publicBookingSelection';
import type { RepairCatalog } from '@/lib/publicRepairCataloguePolicy';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchModelRepairTypes = vi.hoisted(() => vi.fn());
const fetchRepairDetailInitialResults = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const fetchModelRepairResultSeeds = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const RepairResultsMatchingSection = vi.hoisted(() => vi.fn(() => null));
const FaqAccordion = vi.hoisted(() => vi.fn(() => null));
const permanentRedirect = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  fetchRepairCatalog,
  fetchModelRepairTypes,
}));
vi.mock('@/lib/repair-results.server', () => ({
  fetchRepairDetailInitialResults,
  fetchModelRepairResultSeeds,
}));
vi.mock('@/components/repair-results/RepairResultsMatchingSection', () => ({ default: RepairResultsMatchingSection }));
vi.mock('@/components/FaqAccordion', () => ({ default: FaqAccordion }));
vi.mock('@/components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('@/components/BackButton', () => ({ default: () => null }));
vi.mock('@/components/ScrollReveal', () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock('@/components/FloatingJumpCTA', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({
  notFound,
  permanentRedirect,
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn() }),
}));

import ModelHubPage from './page';
import RepairServicePage from './[repair-type]/page';
import RepairPricingAndCTA from '@/components/services/RepairPricingAndCTA';

function findElementByType<P>(node: ReactNode, type: unknown): ReactElement<P> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByType<P>(child, type);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement(node)) return null;
  if (node.type === type) return node as ReactElement<P>;
  return findElementByType<P>((node as ReactElement<{ children?: ReactNode }>).props.children, type);
}

const oppoCatalogue: RepairCatalog = {
  brands: [
    {
      category: 'phone',
      brand: 'Oppo',
      slug: 'oppo',
      icon: '',
      models: [
        {
          model: 'Find X3 Pro',
          slug: 'find-x3-pro',
          repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 289, repairOrigin: 'pos' },
            { slug: 'battery-replacement', name: 'Battery Replacement', price: 109, repairOrigin: 'pos' },
          ],
        },
        {
          model: 'Find X5 Pro',
          slug: 'find-x5-pro',
          repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 349, repairOrigin: 'pos' },
            { slug: 'battery-replacement', name: 'Battery Replacement', price: 119, repairOrigin: 'pos' },
          ],
        },
      ],
    },
    {
      category: 'phone',
      brand: 'Samsung',
      slug: 'samsung',
      icon: '',
      models: [
        {
          model: 'Galaxy S24 Ultra',
          slug: 'galaxy-s24-ultra',
          repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 399, repairOrigin: 'pos' },
          ],
        },
      ],
    },
    {
      category: 'phone',
      brand: 'iPhone',
      slug: 'iphone',
      icon: '',
      models: [
        {
          model: 'iPhone 16 Plus',
          slug: 'iphone-16-plus',
          repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 299, repairOrigin: 'pos' },
          ],
        },
      ],
    },
  ],
  retiredRepairs: [],
  source: 'pos',
};

const oppoInventory: ParsedItem[] = [
  {
    id: 101,
    category: 'phone',
    brand: 'P Oppo',
    deviceModel: 'Find X3 Pro',
    service: 'Screen Replacement',
    price: 289,
    deviceType: 'phone',
    quality_grade: 'Standard',
    is_recommended: false,
    name: 'OPPO Find X3 Pro Screen Replacement',
  },
  {
    id: 102,
    category: 'phone',
    brand: 'P Oppo',
    deviceModel: 'Find X5 Pro',
    service: 'Screen Replacement',
    price: 349,
    deviceType: 'phone',
    quality_grade: 'Standard',
    is_recommended: false,
    name: 'OPPO Find X5 Pro Screen Replacement',
  },
];

describe('OPPO Booking Auto-Fill & Handoff Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchRepairCatalog.mockResolvedValue(oppoCatalogue);
    fetchModelRepairTypes.mockImplementation((category: string, brand: string, model: string) => {
      const brandEntry = oppoCatalogue.brands.find((b) => b.category === category && b.slug === brand);
      const modelEntry = brandEntry?.models.find((m) => m.slug === model);
      if (!modelEntry || !brandEntry) return Promise.resolve(null);
      return Promise.resolve({
        brand: brandEntry.brand,
        model: modelEntry.model,
        source: 'pos' as const,
        catalogueSource: 'live-pos' as const,
        repairTypes: modelEntry.repairTypes,
        brandModels: brandEntry.models.map((m) => ({ model: m.model, slug: m.slug })),
      });
    });
  });

  it('generates canonical booking tuple with un-prefixed model name for OPPO Find X3 Pro detail page', async () => {
    const page = await RepairServicePage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'oppo',
        model: 'find-x3-pro',
        'repair-type': 'screen-replacement',
      }),
    });

    const pricing = findElementByType<{ bookingHref?: string }>(page, RepairPricingAndCTA)?.props;
    expect(pricing?.bookingHref).toBeDefined();

    const url = new URL(pricing!.bookingHref!, 'https://example.test');
    const query = url.searchParams;

    // 1. Canonical tuple present
    expect(query.get('category')).toBe('phone');
    expect(query.get('brandSlug')).toBe('oppo');
    expect(query.get('modelSlug')).toBe('find-x3-pro');
    expect(query.get('serviceSlug')).toBe('screen-replacement');

    // 2. Display parameters present with un-prefixed catalogue model name
    expect(query.get('brand')).toBe('Oppo');
    expect(query.get('model')).toBe('Find X3 Pro');
    expect(query.get('service')).toBe('Screen Replacement');
  });

  it('resolves OPPO Find X3 Pro detail booking query into cart auto-selection', async () => {
    const page = await RepairServicePage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'oppo',
        model: 'find-x3-pro',
        'repair-type': 'screen-replacement',
      }),
    });

    const pricing = findElementByType<{ bookingHref?: string }>(page, RepairPricingAndCTA)?.props;
    const url = new URL(pricing!.bookingHref!, 'https://example.test');
    const query = Object.fromEntries(url.searchParams.entries());

    // Public booking selection resolver resolves the canonical tuple + model
    const selection = resolvePublicBookingSelection(oppoCatalogue, query);
    expect(selection).not.toBeNull();
    expect(selection).toMatchObject({
      brand: 'Oppo',
      model: 'Find X3 Pro',
      service: 'Screen Replacement',
      serviceSlug: 'screen-replacement',
    });

    // Cart auto-select populates the cart with the service
    const cartState = resolvePublicBookingCartState(selection!, oppoInventory);
    expect(cartState).toMatchObject({
      brand: 'P Oppo',
      model: 'Find X3 Pro',
      serviceToSelect: {
        id: 101,
        name: 'Screen Replacement',
        price: 289,
      },
    });
  });

  it('generates valid model-level booking handoff on OPPO Find X3 Pro model hub without repair=general', async () => {
    const page = await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'oppo',
        model: 'find-x3-pro',
      }),
    });

    const html = renderToStaticMarkup(page);
    const bookLinks = [...html.matchAll(/href="([^"]*\/book-repair[^"]*)"/g)].map((m) => m[1]);
    expect(bookLinks.length).toBeGreaterThan(0);

    // Any model-hub CTA linking to book-repair with query params must not use legacy repair=general
    const ctaLinksWithQuery = bookLinks.filter((href) => href.includes('?'));
    expect(ctaLinksWithQuery.length).toBeGreaterThan(0);

    for (const rawLink of ctaLinksWithQuery) {
      const link = rawLink.replace(/&amp;/g, '&');
      expect(link).not.toContain('repair=general');
      const url = new URL(link, 'https://example.test');
      expect(url.searchParams.get('category')).toBe('phone');
      expect(url.searchParams.get('brand')).toBe('Oppo');
      expect(url.searchParams.get('model')).toBe('Find X3 Pro');

      // Model-only selection in cart
      const cartResult = resolveInitialCartState(
        url.searchParams.get('brand'),
        url.searchParams.get('model'),
        url.searchParams.get('service'),
        oppoInventory,
      );
      expect(cartResult.brand).toBe('P Oppo');
      expect(cartResult.model).toBe('Find X3 Pro');
      expect(cartResult.category).toBe('phone');
      expect(cartResult.serviceToSelect).toBeNull();
      expect(cartResult.shouldAutoConfirm).toBe(false);
    }
  });

  it('resolves OPPO Find X5 Pro detail and model hub identically', async () => {
    // Detail page
    const detailPage = await RepairServicePage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'oppo',
        model: 'find-x5-pro',
        'repair-type': 'screen-replacement',
      }),
    });

    const pricing = findElementByType<{ bookingHref?: string }>(detailPage, RepairPricingAndCTA)?.props;
    const detailUrl = new URL(pricing!.bookingHref!, 'https://example.test');
    expect(detailUrl.searchParams.get('category')).toBe('phone');
    expect(detailUrl.searchParams.get('brandSlug')).toBe('oppo');
    expect(detailUrl.searchParams.get('modelSlug')).toBe('find-x5-pro');
    expect(detailUrl.searchParams.get('model')).toBe('Find X5 Pro');

    const selection = resolvePublicBookingSelection(oppoCatalogue, Object.fromEntries(detailUrl.searchParams.entries()));
    expect(selection).not.toBeNull();
    expect(selection).toMatchObject({
      brand: 'Oppo',
      model: 'Find X5 Pro',
      serviceSlug: 'screen-replacement',
    });

    const cartState = resolvePublicBookingCartState(selection!, oppoInventory);
    expect(cartState.serviceToSelect?.id).toBe(102);

    // Model hub
    const hubPage = await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'oppo',
        model: 'find-x5-pro',
      }),
    });
    const hubHtml = renderToStaticMarkup(hubPage);
    const bookLinks = [...hubHtml.matchAll(/href="([^"]*\/book-repair\?[^"]*)"/g)].map((m) => m[1]);
    expect(bookLinks.length).toBeGreaterThan(0);
    for (const rawLink of bookLinks) {
      const link = rawLink.replace(/&amp;/g, '&');
      expect(link).not.toContain('repair=general');
      const hubUrl = new URL(link, 'https://example.test');
      expect(hubUrl.searchParams.get('category')).toBe('phone');
      expect(hubUrl.searchParams.get('brand')).toBe('Oppo');
      expect(hubUrl.searchParams.get('model')).toBe('Find X5 Pro');
    }
  });

  it('keeps iPhone and Samsung controls working without regression', async () => {
    const samsungPage = await RepairServicePage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'samsung',
        model: 'galaxy-s24-ultra',
        'repair-type': 'screen-replacement',
      }),
    });
    const samsungPricing = findElementByType<{ bookingHref?: string }>(samsungPage, RepairPricingAndCTA)?.props;
    expect(samsungPricing?.bookingHref).toBeDefined();
    const samsungUrl = new URL(samsungPricing!.bookingHref!, 'https://example.test');
    expect(samsungUrl.searchParams.get('brand')).toBe('Samsung');
    expect(samsungUrl.searchParams.get('model')).toBe('Galaxy S24 Ultra');

    const iphonePage = await RepairServicePage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'iphone',
        model: 'iphone-16-plus',
        'repair-type': 'screen-replacement',
      }),
    });
    const iphonePricing = findElementByType<{ bookingHref?: string }>(iphonePage, RepairPricingAndCTA)?.props;
    expect(iphonePricing?.bookingHref).toBeDefined();
    const iphoneUrl = new URL(iphonePricing!.bookingHref!, 'https://example.test');
    expect(iphoneUrl.searchParams.get('brand')).toBe('iPhone');
    expect(iphoneUrl.searchParams.get('model')).toBe('iPhone 16 Plus');

    const samsungHubHtml = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'samsung',
        model: 'galaxy-s24-ultra',
      }),
    }));
    expect(samsungHubHtml).toContain(
      'href="/book-repair?model=galaxy-s24-ultra&amp;repair=general"',
    );

    const iphoneHubHtml = renderToStaticMarkup(await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'iphone',
        model: 'iphone-16-plus',
      }),
    }));
    expect(iphoneHubHtml).toContain(
      'href="/book-repair?model=iphone-16-plus&amp;repair=general"',
    );
  });
});
