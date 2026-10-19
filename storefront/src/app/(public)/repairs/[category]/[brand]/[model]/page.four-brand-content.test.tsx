import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveModelHubRepairPresentation } from '@/lib/modelHubRepairPresentation';
import { getRepairTierDescription } from '@/lib/repairTierDescriptions';
import type { RepairCatalog } from '@/lib/publicRepairCataloguePolicy';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchModelRepairTypes = vi.hoisted(() => vi.fn());
const fetchRepairDetails = vi.hoisted(() => vi.fn());
const fetchRepairDetailInitialResults = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const fetchModelRepairResultSeeds = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const RepairResultsMatchingSection = vi.hoisted(() => vi.fn(() => null));
const FaqAccordion = vi.hoisted(() => vi.fn(({ items, faqs }: { items?: Array<{ question: string; answer: string }>; faqs?: Array<{ question: string; answer: string }> }) => {
  const list = items ?? faqs;
  return (
    <div data-testid="faq-accordion">
      {list?.map((item, idx) => (
        <div key={idx} data-testid="faq-item">
          <h3>{item.question}</h3>
          <p>{item.answer}</p>
        </div>
      )) ?? null}
    </div>
  );
}));
const permanentRedirect = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api')>()),
  fetchRepairCatalog,
  fetchModelRepairTypes,
  fetchRepairDetails,
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
import RepairDetailPage, { generateMetadata } from './[repair-type]/page';

const testCatalogue: RepairCatalog = {
  brands: [
    {
      category: 'phone',
      brand: 'iPhone',
      slug: 'iphone',
      icon: '',
      models: [
        {
          model: 'iPhone 16 Plus',
          slug: 'iphone-16-plus',
          repairs: [
            { type: 'Screen Replacement', slug: 'screen-replacement', price: 299, description: 'Screen replacement' },
            { type: 'Back Glass Replacement', slug: 'back-glass-replacement', price: 199, description: 'Back glass replacement' },
          ],
          repairTypes: [
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 299, repairOrigin: 'pos' },
            { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 199, repairOrigin: 'pos' },
          ],
        },
      ],
    },
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
          repairs: [
            { type: 'Water Damage Repair', slug: 'water-damage-repair', price: 0, description: 'Water damage assessment and cleaning' },
            { type: 'Logic Board Repair', slug: 'logic-board-repair', price: 0, description: 'Logic board service' },
          ],
          repairTypes: [
            { slug: 'water-damage-repair', name: 'Water Damage Repair', price: 0, repairOrigin: 'pos' },
            { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 0, repairOrigin: 'pos' },
          ],
        },
      ],
    },
    {
      category: 'phone',
      brand: 'Google Pixel',
      slug: 'google-pixel',
      icon: '',
      models: [
        {
          model: 'Pixel 8 Pro',
          slug: 'pixel-8-pro',
          repairs: [
            { type: 'Back Glass Replacement', slug: 'back-glass-replacement', price: 0, description: 'Rear glass replacement' },
          ],
          repairTypes: [
            { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 0, repairOrigin: 'pos' },
          ],
        },
        {
          model: 'Pixel 5',
          slug: 'pixel-5',
          repairs: [
            { type: 'Back Housing Replacement', slug: 'back-glass-replacement', price: 0, description: 'Rear housing assembly replacement' },
          ],
          repairTypes: [
            { slug: 'back-glass-replacement', name: 'Back Housing Replacement', price: 0, repairOrigin: 'pos' },
          ],
        },
      ],
    },
  ],
  retiredRepairs: [],
  source: 'pos',
};

describe('Four-Brand Content & Semantic Parity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchRepairCatalog.mockResolvedValue(testCatalogue);
    fetchModelRepairTypes.mockImplementation((category: string, brand: string, model: string) => {
      const brandEntry = testCatalogue.brands.find((b) => b.category === category && b.slug === brand);
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
    fetchRepairDetails.mockImplementation((category: string, brand: string, model: string, repairType: string) => {
      const brandEntry = testCatalogue.brands.find((b) => b.category === category && b.slug === brand);
      const modelEntry = brandEntry?.models.find((m) => m.slug === model);
      const repairEntry = modelEntry?.repairTypes?.find((r) => r.slug === repairType);
      if (!brandEntry || !modelEntry) return Promise.resolve(null);
      return Promise.resolve({
        brand: brandEntry.brand,
        model: modelEntry.model,
        repairType: repairEntry?.name || 'Back Housing Replacement',
        price: repairEntry?.price || 0,
      });
    });
  });

  it('uses "an" for iPhone 16 Plus FAQs in model hub', async () => {
    const page = await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'iphone',
        model: 'iphone-16-plus',
      }),
    });

    const markup = renderToStaticMarkup(page);
    expect(markup).toContain('How much does an iPhone 16 Plus repair cost?');
    expect(markup).toContain('How long does an iPhone 16 Plus repair take?');
    expect(markup).toContain('Will Face ID or Touch ID still work after an iPhone 16 Plus repair?');
    expect(markup).not.toContain('How much does a iPhone 16 Plus repair cost?');
    expect(markup).not.toContain('How long does a iPhone 16 Plus repair take?');
    expect(markup).toContain('6-Month Repair Warranty');
    expect(markup).toContain('Eligible iPhone repairs include a 6-month warranty on parts and labour. Water-damage repairs are excluded.');
    expect(markup).not.toContain('Parts availability');
  });

  it('uses "a" for Find X3 Pro FAQs in OPPO model hub', async () => {
    const page = await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'oppo',
        model: 'find-x3-pro',
      }),
    });

    const markup = renderToStaticMarkup(page);
    expect(markup).toContain('How much does a Find X3 Pro repair cost?');
    expect(markup).toContain('How long does a Find X3 Pro repair take?');
    expect(markup).not.toContain('How much does an Find X3 Pro repair cost?');
    expect(markup).not.toContain('How long does an Find X3 Pro repair take?');
  });

  it('preserves Samsung Logic Board at 30 Minutes with truthful FAQ clarification', async () => {
    const presentation = resolveModelHubRepairPresentation({
      category: 'phone',
      brandSlug: 'samsung',
      modelSlug: 'galaxy-s24-ultra',
      repairSlug: 'logic-board-repair',
    });
    expect(presentation).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });

    const page = await ModelHubPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'samsung',
        model: 'galaxy-s24-ultra',
      }),
    });

    const markup = renderToStaticMarkup(page);
    expect(markup).toContain('Published Logic Board repair is 30 minutes once the fault is diagnosed');
  });

  it('ensures Samsung Water displays Initial Assessment & Cleaning — 30 Minutes without implying complete repair', async () => {
    const presentation = resolveModelHubRepairPresentation({
      category: 'phone',
      brandSlug: 'samsung',
      modelSlug: 'galaxy-s24-ultra',
      repairSlug: 'water-damage-repair',
    });
    expect(presentation.timingLabel).toBe('Initial Assessment & Cleaning — 30 Minutes');

    const detailPage = await RepairDetailPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'samsung',
        model: 'galaxy-s24-ultra',
        'repair-type': 'water-damage-repair',
      }),
    });

    const markup = renderToStaticMarkup(detailPage);
    expect(markup).toContain('Initial Assessment &amp; Cleaning — 30 Minutes');
    expect(markup).toContain('No Warranty for Water Damage');
    expect(markup).toContain('Initial assessment and cleaning usually take around 30 minutes');
    expect(markup).toContain('Further repair time depends on liquid damage');
    expect(markup).not.toContain('Water Damage Repair — 30 Minutes');
  });

  it('aligns Google Pixel rear visible semantics to authoritative model-aware rules while preserving canonical URL', async () => {
    const housingModels = [
      'pixel-3a',
      'pixel-3a-xl',
      'pixel-4a',
      'pixel-4a-5g',
      'pixel-5',
      'pixel-5a',
    ] as const;

    // 1-6: All six Back Housing models use Back Housing Replacement / 60 Minutes
    for (const modelSlug of housingModels) {
      const presentation = resolveModelHubRepairPresentation({
        category: 'phone',
        brandSlug: 'google-pixel',
        modelSlug,
        repairSlug: 'back-glass-replacement',
      });
      expect(presentation).toMatchObject({
        displayName: 'Back Housing Replacement',
        timingLabel: '60 Minutes',
        turnaroundMinutes: 60,
      });
    }

    // 7: Pixel 8 Pro = Back Glass / 30 Minutes
    const pixel8ProPresentation = resolveModelHubRepairPresentation({
      category: 'phone',
      brandSlug: 'google-pixel',
      modelSlug: 'pixel-8-pro',
      repairSlug: 'back-glass-replacement',
    });
    expect(pixel8ProPresentation).toMatchObject({
      displayName: 'Back Glass Replacement',
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });

    // 8: One other newer Pixel = Back Glass / 30 Minutes (Pixel 9 Pro)
    const pixel9ProPresentation = resolveModelHubRepairPresentation({
      category: 'phone',
      brandSlug: 'google-pixel',
      modelSlug: 'pixel-9-pro',
      repairSlug: 'back-glass-replacement',
    });
    expect(pixel9ProPresentation).toMatchObject({
      displayName: 'Back Glass Replacement',
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });

    // 9-11: Pixel 8 Pro detail page (Back Glass, 30 min, metadata title, schema serviceName, canonical URL)
    const pixel8ProDetail = await RepairDetailPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'google-pixel',
        model: 'pixel-8-pro',
        'repair-type': 'back-glass-replacement',
      }),
    });
    const pixel8ProMarkup = renderToStaticMarkup(pixel8ProDetail);
    expect(pixel8ProMarkup).toContain('Pixel 8 Pro Back Glass Replacement');
    expect(pixel8ProMarkup).toContain('30 Minutes');
    expect(pixel8ProMarkup).toContain('Pixel 8 Pro Back Glass Replacement in Ringwood');

    const pixel8ProMetadata = await generateMetadata({
      params: Promise.resolve({
        category: 'phone',
        brand: 'google-pixel',
        model: 'pixel-8-pro',
        'repair-type': 'back-glass-replacement',
      }),
    });
    // 9: Metadata says Back Glass
    expect(pixel8ProMetadata.title).toBe('Pixel 8 Pro Back Glass Replacement in Ringwood | Ali Mobile');
    // 11: Canonical still uses /back-glass-replacement
    expect(pixel8ProMetadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/phone/google-pixel/pixel-8-pro/back-glass-replacement'
    );

    // 12: Housing-model route continues using existing /back-glass-replacement URL without route changes
    const pixel5Detail = await RepairDetailPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'google-pixel',
        model: 'pixel-5',
        'repair-type': 'back-glass-replacement',
      }),
    });
    const pixel5Markup = renderToStaticMarkup(pixel5Detail);
    expect(pixel5Markup).toContain('Pixel 5 Back Housing Replacement');
    expect(pixel5Markup).toContain('60 Minutes');
    expect(pixel5Markup).toContain('Pixel 5 Back Housing Replacement in Ringwood');

    const pixel5Metadata = await generateMetadata({
      params: Promise.resolve({
        category: 'phone',
        brand: 'google-pixel',
        model: 'pixel-5',
        'repair-type': 'back-glass-replacement',
      }),
    });
    expect(pixel5Metadata.title).toBe('Pixel 5 Back Housing Replacement in Ringwood | Ali Mobile');
    expect(pixel5Metadata.alternates?.canonical).toBe(
      'https://www.alimobile.com.au/repairs/phone/google-pixel/pixel-5/back-glass-replacement'
    );
  });

  it('updates iPhone Back Glass to around 60 minutes with 60-minute badge and turnaround FAQ', async () => {
    const iphoneBackGlassPresentation = resolveModelHubRepairPresentation({
      category: 'phone',
      brandSlug: 'iphone',
      modelSlug: 'iphone-16-plus',
      repairSlug: 'back-glass-replacement',
    });
    expect(iphoneBackGlassPresentation).toMatchObject({
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });

    const detailPage = await RepairDetailPage({
      params: Promise.resolve({
        category: 'phone',
        brand: 'iphone',
        model: 'iphone-16-plus',
        'repair-type': 'back-glass-replacement',
      }),
    });
    const markup = renderToStaticMarkup(detailPage);
    expect(markup).toContain('Repair Time: 60 Minutes');
    expect(markup).toContain('iPhone 16 Plus back glass / back housing replacement usually takes around 60 minutes');
  });

  it('provides neutral, approved tier descriptions for Standard and Premium', () => {
    expect(getRepairTierDescription('Screen Replacement', 'Standard')).toBe(
      'A cost-effective repair option using a compatible replacement part.'
    );
    expect(getRepairTierDescription('Screen Replacement', 'Premium')).toBe(
      'A higher-quality replacement part option, where available. Ask us about the differences for your repair.'
    );
    expect(getRepairTierDescription('Custom Repair', 'Standard')).toBe(
      'A cost-effective repair option using a compatible replacement part.'
    );
    expect(getRepairTierDescription('Custom Repair', 'Premium')).toBe(
      'A higher-quality replacement part option, where available. Ask us about the differences for your repair.'
    );
  });
});
