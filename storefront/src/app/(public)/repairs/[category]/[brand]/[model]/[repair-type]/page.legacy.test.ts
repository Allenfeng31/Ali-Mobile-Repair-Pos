import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchRepairDetailInitialResults = vi.hoisted(() => vi.fn());
const RepairResultsMatchingSection = vi.hoisted(() => vi.fn(() => null));
const FaqAccordion = vi.hoisted(() => vi.fn(() => null));
const permanentRedirect = vi.hoisted(() => vi.fn((destination: string) => {
  throw new Error(`NEXT_REDIRECT_TEST:${destination}`);
}));
const notFound = vi.hoisted(() => vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND_TEST');
}));

vi.mock('@/lib/api', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/lib/api')>()), fetchRepairCatalog }));
vi.mock('@/lib/repair-results.server', () => ({ fetchRepairDetailInitialResults }));
vi.mock('@/components/repair-results/RepairResultsMatchingSection', () => ({ default: RepairResultsMatchingSection }));
vi.mock('@/components/FaqAccordion', () => ({ default: FaqAccordion }));
vi.mock('next/navigation', () => ({
  notFound,
  permanentRedirect,
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn() }),
}));

import RepairServicePage, { generateStaticParams } from './page';
import FaqAccordionComponent from '@/components/FaqAccordion';
import RepairPricingAndCTA from '@/components/services/RepairPricingAndCTA';
import { getGooglePixelHardwareConfig } from '@/lib/seo/content/google-pixel/config';
import { getAliMobileEnhancedGooglePixelRepairType } from '@/lib/seo/content/google-pixel';
import { getAliMobileEnhancedIphoneSeoPocket } from '@/lib/seo/content/iphone';

const params = (overrides: Record<string, string> = {}) => ({ category: 'phone', brand: 'motorola', model: 'moto-g24', 'repair-type': 'screen-replacement', ...overrides });
const active = { category: 'phone', brand: 'Motorola', slug: 'motorola', models: [{ model: 'Moto G24', slug: 'moto-g24', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', price: 149, variants: [] }] }] };
const activeModelWithoutScreenRepair = {
  ...active,
  models: [{ ...active.models[0], repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] }] }],
};
const waterRepair = { name: 'Water Damage Repair', slug: 'water-damage-repair', price: 0, variants: [] };
const oppoA77WithoutWaterRepair = {
  category: 'phone',
  brand: 'OPPO',
  slug: 'oppo',
  models: [{ model: 'A77', slug: 'a77', repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] }] }],
};
const pixel8ProWithWaterRepair = {
  category: 'phone',
  brand: 'Google Pixel',
  slug: 'google-pixel',
  models: [{ model: 'Pixel 8 Pro', slug: 'pixel-8-pro', repairTypes: [waterRepair] }],
};
const pixel4WithWaterRepair = {
  category: 'phone',
  brand: 'Google Pixel',
  slug: 'google-pixel',
  models: [{ model: 'Pixel 4', slug: 'pixel-4', repairTypes: [waterRepair] }],
};
const pixel9aRepairs = [
  { name: 'Screen Replacement', slug: 'screen-replacement', price: 0, variants: [] },
  { name: 'Battery Replacement', slug: 'battery-replacement', price: 0, variants: [] },
  { name: 'Charging Port Replacement', slug: 'charging-port-replacement', price: 0, variants: [] },
  { name: 'Back Glass Replacement', slug: 'back-glass-replacement', price: 0, variants: [] },
];
const pixel9a = {
  category: 'phone',
  brand: 'Google Pixel',
  slug: 'google-pixel',
  models: [{ model: 'Google Pixel 9a', slug: 'pixel-9a', repairTypes: pixel9aRepairs }],
};
const pixelRepairCatalogue = (
  model: string,
  slug: string,
  repairName: string,
  repairSlug: string,
  variants: ReadonlyArray<{ quality_grade: string; price: number }> = [],
) => ({
  category: 'phone',
  brand: 'Google Pixel',
  slug: 'google-pixel',
  models: [{
    model,
    slug,
    repairTypes: [{ name: repairName, slug: repairSlug, price: 0, variants: [...variants] }],
  }],
});
const lenovoYogaSmartTabWithWaterRepair = {
  category: 'tablet',
  brand: 'Lenovo',
  slug: 'lenovo',
  models: [{ model: 'Lenovo Yoga Smart Tab', slug: 'lenovo-yoga-smart-tab-yt-x705f', repairTypes: [waterRepair] }],
};
const retired = { lifecycle: 'retired' as const, category: 'phone', brand: 'Motorola', brandSlug: 'motorola', model: 'Moto G24', modelSlug: 'moto-g24', repair: { name: 'Screen Replacement', slug: 'screen-replacement', price: 149, sourceType: 'real' as const } };
const iphone16ProScreen = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 16 Pro',
    slug: 'iphone-16-pro',
    repairTypes: [{
      name: 'Screen Replacement',
      slug: 'screen-replacement',
      price: 0,
      variants: [
        { quality_grade: 'Genuine', price: 987 },
        { quality_grade: 'Premium', price: 654 },
        { quality_grade: 'Standard', price: 321 },
      ],
    }],
  }],
};
const iphone15Screen = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 15',
    slug: 'iphone-15',
    repairTypes: [{
      name: 'Screen Replacement',
      slug: 'screen-replacement',
      price: 0,
      variants: [
        { quality_grade: 'Premium', price: 654 },
        { quality_grade: 'Standard', price: 321 },
      ],
    }],
  }],
};
const iphone15ScreenWithoutPricedTiers = {
  ...iphone15Screen,
  models: [{
    ...iphone15Screen.models[0],
    repairTypes: [{
      ...iphone15Screen.models[0].repairTypes[0],
      variants: [],
    }],
  }],
};
const iphone15Battery = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 15',
    slug: 'iphone-15',
    repairTypes: [{
      name: 'Battery Replacement',
      slug: 'battery-replacement',
      price: 0,
      variants: [
        { quality_grade: 'Premium', price: 179 },
        { quality_grade: 'Standard', price: 149 },
        { quality_grade: 'Service Pack', price: 199 },
      ],
    }],
  }],
};
const iphone7Battery = {
  ...iphone15Battery,
  models: [{
    ...iphone15Battery.models[0],
    model: 'iPhone 7',
    slug: 'iphone-7',
  }],
};
const iphone15ChargingPort = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 15',
    slug: 'iphone-15',
    repairTypes: [{
      name: 'Charging Port Replacement',
      slug: 'charging-port-replacement',
      price: 0,
      variants: [{ quality_grade: 'Standard', price: 169 }],
    }],
  }],
};
const iphone7ChargingPort = {
  ...iphone15ChargingPort,
  models: [{
    ...iphone15ChargingPort.models[0],
    model: 'iPhone 7',
    slug: 'iphone-7',
  }],
};
const iphone16ProFrontCamera = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 16 Pro',
    slug: 'iphone-16-pro',
    repairTypes: [{
      name: 'Front Camera Replacement',
      slug: 'front-camera-replacement',
      price: 0,
      variants: [
        { quality_grade: 'Genuine', price: 289 },
        { quality_grade: 'Standard', price: 219 },
        { quality_grade: 'Service Pack', price: 249 },
      ],
    }],
  }],
};
const iphone16ProBackCamera = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 16 Pro',
    slug: 'iphone-16-pro',
    repairTypes: [{
      name: 'Back Camera Replacement',
      slug: 'back-camera-replacement',
      price: 0,
      variants: [
        { quality_grade: 'Genuine', price: 359 },
        { quality_grade: 'Standard', price: 299 },
      ],
    }],
  }],
};
const iphone17FrontCameraQuoteOnly = {
  ...iphone16ProFrontCamera,
  models: [{
    ...iphone16ProFrontCamera.models[0],
    model: 'iPhone 17',
    slug: 'iphone-17',
    repairTypes: [{ name: 'Front Camera Replacement', slug: 'front-camera-replacement', price: 0, variants: [] }],
  }],
};
const iphone17BackCameraQuoteOnly = {
  ...iphone16ProBackCamera,
  models: [{
    ...iphone16ProBackCamera.models[0],
    model: 'iPhone 17',
    slug: 'iphone-17',
    repairTypes: [{ name: 'Back Camera Replacement', slug: 'back-camera-replacement', price: 0, variants: [] }],
  }],
};
const iphone8BackCamera = {
  ...iphone16ProBackCamera,
  models: [{
    ...iphone16ProBackCamera.models[0],
    model: 'iPhone 8',
    slug: 'iphone-8',
    repairTypes: [{
      name: 'Back Camera Replacement',
      slug: 'back-camera-replacement',
      price: 0,
      variants: [{ quality_grade: 'Standard', price: 179 }],
    }],
  }],
};
const batteryQuoteOnlyModels = [
  { model: 'iPhone 17', slug: 'iphone-17' },
  { model: 'iPhone 17 Air', slug: 'iphone-17-air' },
  { model: 'iPhone 17 Pro', slug: 'iphone-17-pro' },
  { model: 'iPhone 17 Pro Max', slug: 'iphone-17-pro-max' },
  { model: 'iPhone 17e', slug: 'iphone-17e' },
  { model: 'iPhone SE 2', slug: 'iphone-se-2' },
];
const chargingPortQuoteOnlyModels = batteryQuoteOnlyModels.slice(0, 5);
const iphone6Screen = {
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model: 'iPhone 6',
    slug: 'iphone-6',
    repairTypes: [{
      name: 'Screen Replacement',
      slug: 'screen-replacement',
      price: 0,
      variants: [{ quality_grade: 'Standard', price: 169 }],
    }],
  }],
};

const iphoneHardwareRepairCatalogue = (
  model: string,
  slug: string,
  repairName: string,
  repairSlug: string,
  partTier: string,
) => ({
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model,
    slug,
    repairTypes: [{
      name: repairName,
      slug: repairSlug,
      price: 0,
      variants: [{ quality_grade: partTier, price: 199 }],
    }],
  }],
});

const iphoneBackRepairCatalogue = (
  model: string,
  slug: string,
  variants: Array<{ quality_grade: string; price: number }> = [{ quality_grade: 'Premium', price: 199 }],
) => ({
  category: 'phone',
  brand: 'iPhone',
  slug: 'iphone',
  models: [{
    model,
    slug,
    repairTypes: [{
      name: 'Back Glass Replacement',
      slug: 'back-glass-replacement',
      price: 0,
      variants,
    }],
  }],
});

type DetailMatchingProps = { children?: ReactNode; initialResults?: unknown } & Record<string, unknown>;

function findElementByType(node: ReactNode, type: unknown): ReactElement<DetailMatchingProps> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByType(child, type);
      if (found) return found;
    }
    return null;
  }

  if (!isValidElement(node)) return null;
  if (node.type === type) return node as ReactElement<DetailMatchingProps>;
  return findElementByType((node as ReactElement<{ children?: ReactNode }>).props.children, type);
}

describe('Repair Detail active and legacy page-data resolution', () => {
  beforeEach(() => {
    fetchRepairDetailInitialResults.mockResolvedValue([]);
  });

  afterEach(() => {
    fetchRepairCatalog.mockReset();
    fetchRepairDetailInitialResults.mockReset();
    fetchRepairDetailInitialResults.mockResolvedValue([]);
    RepairResultsMatchingSection.mockClear();
    notFound.mockClear();
    permanentRedirect.mockClear();
  });

  it.each([
    ['water', 'water-damage-repair', '/repairs/water-damage'],
    ['logic board', 'logic-board-repair', '/repairs/phone/logic-board-repair'],
  ])('redirects an allowlisted Phase 1 %s source before loading Detail data', async (_label, repairType, destination) => {
    await expect(RepairServicePage({ params: Promise.resolve(params({ brand: 'asus', model: 'rog-phone-5', 'repair-type': repairType })) }))
      .rejects.toThrow(`NEXT_REDIRECT_TEST:${destination}`);
    expect(permanentRedirect).toHaveBeenCalledWith(destination);
    expect(fetchRepairCatalog).not.toHaveBeenCalled();
  });

  it('returns notFound for OPPO A77 Water when the current model lacks that exact repair', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [oppoA77WithoutWaterRepair], retiredRepairs: [] });

    await expect(RepairServicePage({ params: Promise.resolve(params({ brand: 'oppo', model: 'a77', 'repair-type': 'water-damage-repair' })) }))
      .rejects.toThrow('NEXT_NOT_FOUND_TEST');
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it('keeps Pixel 8 Pro Water on its retained model-specific Detail route', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [pixel8ProWithWaterRepair], retiredRepairs: [] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'google-pixel', model: 'pixel-8-pro', 'repair-type': 'water-damage-repair' })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;

    expect(html).toContain('Timeframe Depends on Damage');
    expect(html).toContain('Choose a quality tier');
    expect(html).not.toContain('Initial Assessment &amp; Cleaning');
    expect(html).not.toContain('href="/repairs/water-damage"');
    expect(faqs[0].answer).toContain('Power it off if possible, do not charge it');
    expect(faqs.map((faq) => faq.answer).join(' ')).not.toContain('around 30 minutes');
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it('keeps Galaxy A16 Water Damage quote-first with a 30-minute initial service and no completed-repair promise', async () => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        category: 'phone', brand: 'Samsung', slug: 'samsung', models: [{
          model: 'Galaxy A16', slug: 'galaxy-a16', modelCode: 'SM-A166B', repairTypes: [waterRepair],
        }],
      }],
      retiredRepairs: [],
    });

    const page = await RepairServicePage({ params: Promise.resolve(params({
      brand: 'samsung', model: 'galaxy-a16', 'repair-type': 'water-damage-repair',
    })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaqs = faqs.filter((faq) => /how long/i.test(faq.question));
    const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

    expect(html).toContain('<h1>Galaxy A16 Water Damage Cleaning / Assessment</h1>');
    expect(html).toContain('Initial Assessment &amp; Cleaning');
    expect(html).toContain('30 Minutes');
    expect(html).toContain('Further repair time depends');
    expect(html).toContain('Quote on Request');
    expect(html).toContain('Diagnostic Required');
    expect(html).toContain('No Warranty for Water Damage');
    expect(html).toContain('href="/repairs/water-damage"');
    expect(html).not.toContain('Choose a quality tier');
    expect(html).not.toContain('Timeframe Depends on Damage');
    expect(html).not.toContain('6-Month Warranty');
    expect(timingFaqs).toHaveLength(1);
    expect(timingFaqs[0].answer).toContain('around 30 minutes');
    expect(timingFaqs[0].answer).not.toMatch(/around 1 hour|repair.*takes around 30 minutes/i);
    expect(faqs.some((faq) => /gets wet/i.test(faq.question))).toBe(true);
    expect(faqs.some((faq) => /recover/i.test(faq.question))).toBe(true);
    expect(serviceSchema).toContain('"@type":"Service"');
    expect(serviceSchema).not.toContain('"offers"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it('serves only the configured Pixel 9a catalogue-backed Detail repairs', async () => {
    const config = getGooglePixelHardwareConfig('pixel-9a');
    expect(config).toMatchObject({
      modelSlug: 'pixel-9a',
      modelName: 'Google Pixel 9a',
      rearPanelType: 'composite',
      fingerprintType: 'under-display',
      supportedRepairTypes: pixel9aRepairs.map((repair) => repair.slug),
    });
    expect(getGooglePixelHardwareConfig('pixel-9')).not.toBeNull();
    expect(getGooglePixelHardwareConfig('pixel-8a')).not.toBeNull();

    for (const repair of pixel9aRepairs) {
      expect(getAliMobileEnhancedGooglePixelRepairType({
        category: 'phone', brand: 'google-pixel', model: 'pixel-9a', 'repair-type': repair.slug,
      })).toBe(repair.slug);
    }
    for (const repairType of ['front-camera-replacement', 'back-camera-replacement', 'logic-board-repair']) {
      expect(getAliMobileEnhancedGooglePixelRepairType({
        category: 'phone', brand: 'google-pixel', model: 'pixel-9a', 'repair-type': repairType,
      })).toBeNull();
    }

    fetchRepairCatalog.mockResolvedValue({ brands: [pixel9a], retiredRepairs: [] });
    for (const repair of pixel9aRepairs) {
      await expect(RepairServicePage({ params: Promise.resolve(params({
        brand: 'google-pixel', model: 'pixel-9a', 'repair-type': repair.slug,
      })) })).resolves.toBeTruthy();
    }
    expect(notFound).not.toHaveBeenCalled();
  });

  it.each([
    ['Pixel 7 Pro Screen', 'Google Pixel 7 Pro', 'pixel-7-pro', 'Screen Replacement', 'screen-replacement', 30, [{ quality_grade: 'Standard', price: 299 }], true],
    ['Pixel 8 Pro Battery', 'Google Pixel 8 Pro', 'pixel-8-pro', 'Battery Replacement', 'battery-replacement', 30, [{ quality_grade: 'Standard', price: 189 }], true],
    ['Pixel 9 Pro XL Charging Port', 'Google Pixel 9 Pro XL', 'pixel-9-pro-xl', 'Charging Port Replacement', 'charging-port-replacement', 30, [], false],
    ['Pixel 10 Front Camera', 'Google Pixel 10', 'pixel-10', 'Front Camera Replacement', 'front-camera-replacement', 30, [], false],
    ['Pixel 8 Pro Back Camera', 'Google Pixel 8 Pro', 'pixel-8-pro', 'Back Camera Replacement', 'back-camera-replacement', 30, [], false],
    ['Pixel 10 Pro Fold Back Glass', 'Google Pixel 10 Pro Fold', 'pixel-10-pro-fold', 'Back Glass Replacement', 'back-glass-replacement', 60, [], false],
    ['Pixel 9a Back Glass', 'Google Pixel 9a', 'pixel-9a', 'Back Glass Replacement', 'back-glass-replacement', 60, [{ quality_grade: 'Standard', price: 239 }], true],
  ] as const)('renders %s with approved timing and catalogue pricing state', async (
    _label,
    model,
    modelSlug,
    repairName,
    repairSlug,
    turnaroundMinutes,
    variants,
    hasResolvedPrice,
  ) => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [pixelRepairCatalogue(model, modelSlug, repairName, repairSlug, variants)],
      retiredRepairs: [],
    });

    const page = await RepairServicePage({ params: Promise.resolve(params({
      brand: 'google-pixel', model: modelSlug, 'repair-type': repairSlug,
    })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaqs = faqs.filter((faq) => /how long/i.test(faq.question));
    const priceFaq = faqs.find((faq) => /how much/i.test(faq.question) && /cost/i.test(faq.question));
    const pricing = findElementByType(page, RepairPricingAndCTA)?.props;
    const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

    expect(html).toContain(`${turnaroundMinutes} Minutes`);
    expect(html).toContain('6-Month Warranty');
    expect(html).not.toContain('Fast Turnaround');
    expect(html).not.toContain('Timeframe Varies');
    expect(html).not.toContain('a few hours');
    expect(timingFaqs).toHaveLength(1);
    expect(timingFaqs[0].answer).toContain(`around ${turnaroundMinutes} minutes`);

    if (hasResolvedPrice) {
      expect(pricing?.showStartingPriceFallback).toBe(true);
      expect(priceFaq?.answer).toContain(`$${variants[0].price}`);
      expect(serviceSchema).toContain('"offers"');
      expect(html).toContain('View the current repair price below.');
    } else {
      expect(pricing?.showStartingPriceFallback).toBe(false);
      expect(html).toContain('Quote on Request');
      expect(html).toContain('Ringwood Square');
      expect(html).not.toContain('Choose a quality tier');
      expect(priceFaq?.answer).toMatch(/quote/i);
      expect(serviceSchema).not.toContain('"offers"');
    }

    if (repairSlug === 'back-glass-replacement') {
      expect(html).toMatch(/housing assembly|back housing/i);
    }
  });

  it('keeps the Google-brand Pixel 4 Water alias consolidating to shared Water', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [pixel4WithWaterRepair], retiredRepairs: [] });

    await expect(RepairServicePage({ params: Promise.resolve(params({ brand: 'google', model: 'pixel-4', 'repair-type': 'water-damage-repair' })) }))
      .rejects.toThrow('NEXT_REDIRECT_TEST:/repairs/water-damage');
    expect(permanentRedirect).toHaveBeenCalledWith('/repairs/water-damage');
  });

  it('keeps Lenovo Yoga Smart Tab Water on its retained model-specific Detail route', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [lenovoYogaSmartTabWithWaterRepair], retiredRepairs: [] });

    await expect(RepairServicePage({ params: Promise.resolve(params({ category: 'tablet', brand: 'lenovo', model: 'lenovo-yoga-smart-tab-yt-x705f', 'repair-type': 'water-damage-repair' })) }))
      .resolves.toBeTruthy();
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it('returns normal page data for an active repair', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });
    await expect(RepairServicePage({ params: Promise.resolve(params()) })).resolves.toBeTruthy();
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it('fails closed for a non-grandfathered secondary protected-service detail route', async () => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        category: 'phone', brand: 'Motorola', slug: 'motorola', models: [{
          model: 'Future Phone', slug: 'future-phone', repairTypes: [
            { name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] },
          ],
        }],
      }],
      retiredRepairs: [],
    });

    await expect(RepairServicePage({ params: Promise.resolve(params({
      model: 'future-phone', 'repair-type': 'battery-replacement',
    })) })).rejects.toThrow('NEXT_NOT_FOUND_TEST');
    expect(fetchRepairDetailInitialResults).not.toHaveBeenCalled();
  });

  it('emits only grandfathered secondary protected-service static params', async () => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [
        {
          category: 'phone', brand: 'Asus', slug: 'asus', models: [{
            model: 'ROG Phone 3', slug: 'rog-phone-3', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', price: 0, variants: [] }],
          }],
        },
        {
          category: 'phone', brand: 'Motorola', slug: 'motorola', models: [{
            model: 'Future Phone', slug: 'future-phone', repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] }],
          }],
        },
        {
          category: 'phone', brand: 'Samsung', slug: 'samsung', models: [{
            model: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] }],
          }],
        },
      ],
    });

    await expect(generateStaticParams()).resolves.toEqual(expect.arrayContaining([
      { category: 'phone', brand: 'asus', model: 'rog-phone-3', 'repair-type': 'screen-replacement' },
      { category: 'phone', brand: 'samsung', model: 'galaxy-s24', 'repair-type': 'battery-replacement' },
    ]));
    await expect(generateStaticParams()).resolves.not.toEqual(expect.arrayContaining([
      { category: 'phone', brand: 'motorola', model: 'future-phone', 'repair-type': 'battery-replacement' },
    ]));
  });

  it('returns page data only for the exact retired legacy identity', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [activeModelWithoutScreenRepair], retiredRepairs: [retired] });
    await expect(RepairServicePage({ params: Promise.resolve(params()) })).resolves.toBeTruthy();
  });

  it('calls notFound for an unknown repair, a same-slug wrong model, and a same-slug wrong brand', async () => {
    const unrelatedModel = {
      ...active,
      models: [{ ...active.models[0], model: 'Moto G54', slug: 'moto-g54' }],
    };
    const unrelatedBrand = { ...active, brand: 'Nokia', slug: 'nokia' };

    for (const [routeParams, catalog] of [
      [params({ 'repair-type': 'battery-replacement' }), { brands: [active], retiredRepairs: [] }],
      [params(), { brands: [unrelatedModel], retiredRepairs: [] }],
      [params(), { brands: [unrelatedBrand], retiredRepairs: [] }],
    ] as const) {
      fetchRepairCatalog.mockResolvedValue(catalog);
      await expect(RepairServicePage({ params: Promise.resolve(routeParams) })).rejects.toThrow('NEXT_NOT_FOUND_TEST');
    }

    expect(notFound).toHaveBeenCalledTimes(3);
  });

  it('keeps a grandfathered tombstone renderable while rejecting a renamed non-grandfathered identity', async () => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        ...active,
        models: [
          { ...activeModelWithoutScreenRepair.models[0] },
          { ...active.models[0], model: 'Moto G24 5G', slug: 'moto-g24-5g' },
        ],
      }],
      retiredRepairs: [retired],
    });
    await expect(RepairServicePage({ params: Promise.resolve(params({ model: 'moto-g24-5g' })) })).rejects.toThrow('NEXT_NOT_FOUND_TEST');
    await expect(RepairServicePage({ params: Promise.resolve(params()) })).resolves.toBeTruthy();
  });

  it('passes one exact server Detail seed into the existing matching module', async () => {
    const initialResults = [{
      id: 'public-result-1', device_category: 'phone' as const, brand: 'Motorola', brand_slug: 'motorola',
      model: 'Moto G24', model_slug: 'moto-g24', repair_type: 'Screen Replacement', repair_type_slug: 'screen-replacement',
      image_pair_alt_text: 'Approved public repair result', title: 'Moto G24 screen proof', short_description: 'Published proof.',
      related_repair_url: '/repairs/phone/motorola/moto-g24/screen-replacement',
    }];
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });
    fetchRepairDetailInitialResults.mockResolvedValue(initialResults);

    const page = await RepairServicePage({ params: Promise.resolve(params()) });
    const matchingElement = findElementByType(page, RepairResultsMatchingSection);

    expect(fetchRepairDetailInitialResults).toHaveBeenCalledWith({
      category: 'phone', brandSlug: 'motorola', modelSlug: 'moto-g24', repairTypeSlug: 'screen-replacement',
    });
    expect(matchingElement?.props).toEqual(expect.objectContaining({
      category: 'phone', brand: 'motorola', model: 'moto-g24', repairType: 'screen-replacement', context: 'detail', initialResults,
    }));
  });

  it('uses resolved iPhone 16 Pro screen tiers and its approved turnaround in only its opted-in FAQs', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone16ProScreen] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-16-pro' })) });
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const faq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How much will my iPhone 16 Pro screen repair cost?'
    );
    const timingFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How long does iPhone 16 Pro screen replacement usually take?'
    );

    expect(faq?.answer).toBe(
      'Current iPhone 16 Pro screen replacement options are: Standard – $321. Industry-standard replacement part with reliable performance. Premium – $654. Top-tier aftermarket display selected for strong colour, touch response and daily reliability. Genuine – $987. Original equipment display where available, selected for the closest match to factory display performance. Parts availability and device condition are confirmed, and we confirm the final quote before work begins.'
    );
    expect(timingFaq?.answer).toBe(
      'iPhone 16 Pro screen replacement usually takes around 30 minutes when the correct part is available. If additional damage is found during inspection, turnaround may vary.'
    );
  });

  it('renders the approved iPhone 16 Pro Screen hero facts without changing its pricing cards', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone16ProScreen] });

    const html = renderToStaticMarkup(
      await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-16-pro' })) }),
    );

    expect(html).toContain('<h1>iPhone 16 Pro Screen Replacement</h1>');
    expect(html).toContain('Screen replacement at Ali Mobile in Ringwood Square. Choose from the current screen options and prices below. Walk-ins are welcome, and booking is recommended to confirm the correct part is available.');
    expect(html).toContain('30 Minutes');
    expect(html).toContain('6-Month Warranty');
    expect(html).not.toContain('Fast Turnaround');
    expect(html).not.toMatch(/same-day|same day|immediate repair|while you wait/i);
    expect(html).toContain('Select Standard tier at $321');
    expect(html).toContain('Select Premium tier at $654');
    expect(html).toContain('Select Genuine tier at $987');
  });

  it('uses the shared iPhone screen source for non-reference timing, price FAQ, and hero copy', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone15Screen] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-15' })) });
    const html = renderToStaticMarkup(page);
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const timingFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How long does iPhone 15 screen replacement usually take?'
    );
    const priceFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How much will my iPhone 15 screen repair cost?'
    );

    expect(html).toContain('<h1>iPhone 15 Screen Replacement</h1>');
    expect(html).toContain('iPhone 15 screen replacement at Ali Mobile in Ringwood Square. Choose from the current screen options and prices below. Walk-ins are welcome, and booking is recommended to confirm the correct part is available.');
    expect(html).toContain('30 Minutes');
    expect(timingFaq?.answer).toBe(
      'iPhone 15 screen replacement usually takes around 30 minutes when the correct part is available. If additional damage is found during inspection, turnaround may vary.'
    );
    expect(priceFaq?.answer).toContain('Standard – $321. Industry-standard replacement part with reliable performance.');
    expect(priceFaq?.answer).toContain('Premium – $654. Top-tier aftermarket display selected for strong colour, touch response and daily reliability.');
  });

  it('keeps iPhone screen pages without priced tiers quote-first and free of price claims in the hero', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone15ScreenWithoutPricedTiers] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-15' })) });
    const html = renderToStaticMarkup(page);
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const priceFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How much will my iPhone 15 screen repair cost?'
    );

    expect(html).toContain('iPhone 15 screen replacement at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the correct part and quote before you visit.');
    expect(html).not.toContain('Choose from the current screen options and prices below.');
    expect(priceFaq?.answer).toMatch(/quote/i);
    expect(priceFaq?.answer).not.toMatch(/Current iPhone 15 screen replacement options are|Current iPhone 15 screen replacement price is/);
    const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';
    expect(serviceSchema).not.toContain('"offers"');
  });

  it('keeps legacy iPhone screen details on the shared screen family rule without modern-device copy', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone6Screen] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-6' })) });
    const html = renderToStaticMarkup(page);
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const timingFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How long does iPhone 6 screen replacement usually take?'
    );
    const priceFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How much will my iPhone 6 screen repair cost?'
    );

    expect(html).toContain('<h1>iPhone 6 Screen Replacement</h1>');
    expect(html).toContain('30 Minutes');
    expect(html).not.toContain('Face ID');
    expect(html).not.toContain('OLED');
    expect(timingFaq?.answer).toContain('around 30 minutes');
    expect(priceFaq?.answer).toContain('Standard option');
    expect(priceFaq?.answer).toContain('$169');
  });

  it('uses the shared iPhone battery source for hero copy, timing, price FAQ, and warranty', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone15Battery] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-15', 'repair-type': 'battery-replacement' })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaq = faqs.find((entry) => /how long/i.test(entry.question));
    const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));

    expect(html).toContain('<h1>iPhone 15 Battery Replacement</h1>');
    expect(html).toContain('iPhone 15 battery replacement at Ali Mobile in Ringwood Square. View the current repair options and prices below. Walk-ins are welcome, and booking is recommended to confirm the correct battery is available.');
    expect(html).toContain('30 Minutes');
    expect(html).toContain('6-Month Warranty');
    expect(html).not.toContain('Fast Turnaround');
    expect(timingFaq?.answer).toContain('around 30 minutes');
    expect(priceFaq?.answer).toContain('Standard – $149. Reliable replacement battery selected for stable charging and everyday performance.');
    expect(priceFaq?.answer).toContain('Premium – $179. High-quality replacement battery selected for stronger daily reliability and longer service life.');
    expect(priceFaq?.answer).toContain('Service Pack – $199. Current repair option for this model. We confirm the suitable option before work begins.');
  });

  it('keeps legacy iPhone battery details on the same family rule without modern-device copy', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone7Battery] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-7', 'repair-type': 'battery-replacement' })) });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('<h1>iPhone 7 Battery Replacement</h1>');
    expect(html).toContain('30 Minutes');
    expect(html).not.toContain('Face ID');
    expect(html).not.toContain('USB-C');
  });

  it('keeps every current battery quote-only route quote-first and free of family price claims', async () => {
    for (const quoteOnlyModel of batteryQuoteOnlyModels) {
      const quoteOnlyBattery = {
        ...iphone15Battery,
        models: [{
          ...iphone15Battery.models[0],
          ...quoteOnlyModel,
          repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 0, variants: [] }],
        }],
      };
      fetchRepairCatalog.mockResolvedValue({ brands: [quoteOnlyBattery] });

      const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: quoteOnlyModel.slug, 'repair-type': 'battery-replacement' })) });
      const html = renderToStaticMarkup(page);
      const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
      const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));
      const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

      expect(html).toContain(`${quoteOnlyModel.model} battery replacement at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the correct battery and quote before you visit.`);
      expect(html).not.toContain('View the current repair options and prices below.');
      expect(priceFaq?.answer).toMatch(/quote/i);
      expect(priceFaq?.answer).not.toMatch(/Current .* battery replacement (options are|price is)/i);
      expect(serviceSchema).not.toContain('"offers"');
    }
  });

  it('uses the shared iPhone charging port source for USB-C copy, timing, and the resolved price FAQ', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone15ChargingPort] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-15', 'repair-type': 'charging-port-replacement' })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaq = faqs.find((entry) => /how long/i.test(entry.question));
    const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));

    expect(html).toContain('<h1>iPhone 15 Charging Port Replacement</h1>');
    expect(html).toContain('iPhone 15 charging port replacement at Ali Mobile in Ringwood Square. View the current repair price below. Walk-ins are welcome, and booking is recommended to confirm the correct part is available.');
    expect(html).toContain('USB-C');
    expect(html).toContain('30 Minutes');
    expect(timingFaq?.answer).toContain('around 30 minutes');
    expect(priceFaq?.answer).toContain('Standard option');
    expect(priceFaq?.answer).toContain('$169');
  });

  it('preserves legacy Lightning charging-port copy while using the shared timing rule', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone7ChargingPort] });

    const html = renderToStaticMarkup(
      await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-7', 'repair-type': 'charging-port-replacement' })) }),
    );

    expect(html).toContain('<h1>iPhone 7 Charging Port Replacement</h1>');
    expect(html).toContain('Lightning');
    expect(html).not.toContain('USB-C');
    expect(html).toContain('30 Minutes');
  });

  it('keeps every current charging-port quote-only route quote-first and free of family price claims', async () => {
    for (const quoteOnlyModel of chargingPortQuoteOnlyModels) {
      const quoteOnlyChargingPort = {
        ...iphone15ChargingPort,
        models: [{
          ...iphone15ChargingPort.models[0],
          ...quoteOnlyModel,
          repairTypes: [{ name: 'Charging Port Replacement', slug: 'charging-port-replacement', price: 0, variants: [] }],
        }],
      };
      fetchRepairCatalog.mockResolvedValue({ brands: [quoteOnlyChargingPort] });

      const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: quoteOnlyModel.slug, 'repair-type': 'charging-port-replacement' })) });
      const html = renderToStaticMarkup(page);
      const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
      const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));
      const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

      expect(html).toContain(`${quoteOnlyModel.model} charging port replacement at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the correct part and quote before you visit.`);
      expect(html).not.toContain('View the current repair options and prices below.');
      expect(priceFaq?.answer).toMatch(/quote/i);
      expect(priceFaq?.answer).not.toMatch(/Current .* charging port replacement (options are|price is)/i);
      expect(serviceSchema).not.toContain('"offers"');
    }
  });

  it('uses the shared Front Camera source for timing, family-safe hero copy, and resolved prices', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone16ProFrontCamera] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-16-pro', 'repair-type': 'front-camera-replacement' })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaq = faqs.find((entry) => /how long/i.test(entry.question));
    const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));

    expect(html).toContain('<h1>iPhone 16 Pro Front Camera Replacement</h1>');
    expect(html).toContain('iPhone 16 Pro front camera replacement at Ali Mobile in Ringwood Square. View the current repair options and prices below. Walk-ins are welcome, and booking is recommended to confirm the correct camera part is available.');
    expect(html).toContain('30 Minutes');
    expect(html).toContain('6-Month Warranty');
    expect(html).toContain('does not automatically guarantee Face ID restoration');
    expect(html).not.toMatch(/same-day|same day|immediate repair|while you wait/i);
    expect(timingFaq?.answer).toContain('around 30 minutes');
    expect(priceFaq?.answer).toContain('Standard – $219. Reliable front camera replacement selected for clear selfies and video calls.');
    expect(priceFaq?.answer).toContain('Genuine – $289. Original equipment front camera component where available.');
    expect(priceFaq?.answer).toContain('Service Pack – $249. Current repair option for this model. We confirm the suitable option before work begins.');
  });

  it('uses the shared Back Camera source without collapsing lens, housing, or multi-camera semantics', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone16ProBackCamera] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-16-pro', 'repair-type': 'back-camera-replacement' })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaq = faqs.find((entry) => /how long/i.test(entry.question));
    const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));

    expect(html).toContain('<h1>iPhone 16 Pro Back Camera Replacement</h1>');
    expect(html).toContain('iPhone 16 Pro back camera replacement at Ali Mobile in Ringwood Square. View the current repair options and prices below. Walk-ins are welcome, and booking is recommended to confirm the correct camera module is available.');
    expect(html).toContain('30 Minutes');
    expect(html).toContain('6-Month Warranty');
    expect(html).toContain('rear camera switching');
    expect(html).toContain('External camera lens glass damage is not automatically the same repair as internal back camera module replacement.');
    expect(html).not.toContain('Camera Lens Replacement');
    expect(html).not.toMatch(/same-day|same day|immediate repair|while you wait/i);
    expect(timingFaq?.answer).toContain('around 30 minutes');
    expect(priceFaq?.answer).toContain('Standard – $299. Reliable rear camera replacement selected for clear everyday photos and videos.');
    expect(priceFaq?.answer).toContain('Genuine – $359. Original equipment rear camera component where available.');
  });

  it('keeps Front and Back Camera quote-only pages quote-first without an Offer', async () => {
    for (const [catalogue, repairType, part] of [
      [iphone17FrontCameraQuoteOnly, 'front-camera-replacement', 'camera part'],
      [iphone17BackCameraQuoteOnly, 'back-camera-replacement', 'camera module'],
    ] as const) {
      fetchRepairCatalog.mockResolvedValue({ brands: [catalogue] });

      const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-17', 'repair-type': repairType })) });
      const html = renderToStaticMarkup(page);
      const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
      const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));
      const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

      expect(html).toContain(`iPhone 17 ${repairType === 'front-camera-replacement' ? 'front' : 'back'} camera replacement at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the correct ${part} and quote before you visit.`);
      expect(html).not.toContain('View the current repair options and prices below.');
      expect(priceFaq?.answer).toMatch(/quote/i);
      expect(serviceSchema).not.toContain('"offers"');
    }
  });

  it.each([
    ['camera-lens-replacement', 'Camera Lens Replacement', 'Premium', 'correct lens part', 'outer lens glass'],
    ['power-button-replacement', 'Power Button Replacement', 'Genuine', 'correct button part', 'button flex'],
    ['volume-button-replacement', 'Volume Button Replacement', 'Genuine', 'correct button part', 'volume up and down response'],
    ['earpiece-speaker-replacement', 'Earpiece Speaker Replacement', 'Genuine', 'correct earpiece part', 'receiver output'],
    ['loudspeaker-replacement', 'Loudspeaker Replacement', 'Genuine', 'correct speaker part', 'ringtone, media playback'],
  ])('renders the approved iPhone hardware family source for %s', async (repairSlug, repairName, partTier, partLabel, semanticCopy) => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [iphoneHardwareRepairCatalogue('iPhone 15', 'iphone-15', repairName, repairSlug, partTier)],
    });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-15', 'repair-type': repairSlug })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaqs = faqs.filter((entry) => /how long/i.test(entry.question));
    const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));
    const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

    expect(html).toContain(`<h1>iPhone 15 ${repairName}</h1>`);
    expect(html).toContain(`iPhone 15 ${repairName.toLowerCase()} at Ali Mobile in Ringwood Square. View the current repair price below. Walk-ins are welcome, and booking is recommended to confirm the ${partLabel} is available.`);
    expect(html).toContain(semanticCopy);
    expect(html).toContain('30 Minutes');
    expect(html).toContain('6-Month Warranty');
    expect(html).not.toContain('Fast Turnaround');
    expect(timingFaqs).toHaveLength(1);
    expect(timingFaqs[0]?.answer).toContain('around 30 minutes');
    expect(priceFaq?.answer).toContain('model compatibility, price, and repair requirements');
    expect(priceFaq?.answer).not.toMatch(/current .* price is/i);
    expect(serviceSchema).toContain('"offers"');
    expect(html).not.toMatch(/same-day|same day|immediate|immediately|while you wait/i);
  });

  it.each([
    ['iPhone 11', 'iphone-11', 'Power Button Replacement', 'power-button-replacement', 'correct button part'],
    ['iPhone SE 2', 'iphone-se-2', 'Loudspeaker Replacement', 'loudspeaker-replacement', 'correct speaker part'],
  ])('keeps approved quote-only hardware routes quote-first without an Offer', async (model, modelSlug, repairName, repairSlug, partLabel) => {
    const quoteOnlyCatalogue = iphoneHardwareRepairCatalogue(model, modelSlug, repairName, repairSlug, 'Genuine');
    quoteOnlyCatalogue.models[0].repairTypes[0].variants = [];
    fetchRepairCatalog.mockResolvedValue({ brands: [quoteOnlyCatalogue] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: modelSlug, 'repair-type': repairSlug })) });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const priceFaq = faqs.find((entry) => /how much/i.test(entry.question) && /cost/i.test(entry.question));
    const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

    expect(html).toContain(`${model} ${repairName.toLowerCase()} at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the ${partLabel} and quote before you visit.`);
    expect(html).not.toContain('View the current repair price below.');
    expect(priceFaq?.answer).toContain('model compatibility, price, and repair requirements');
    expect(serviceSchema).not.toContain('"offers"');
  });

  it('keeps the exact iPhone 13 Power Button Repair Result on its canonical Detail route', async () => {
    const initialResults = [{
      id: 'power-button-result', device_category: 'phone' as const, brand: 'iPhone', brand_slug: 'iphone',
      model: 'iPhone 13', model_slug: 'iphone-13', repair_type: 'Power Button Replacement', repair_type_slug: 'power-button-replacement',
      image_pair_alt_text: 'Approved public repair result', title: 'iPhone 13 Power Button Replacement', short_description: 'Published proof.',
      related_repair_url: '/repairs/phone/iphone/iphone-13/power-button-replacement',
    }];
    fetchRepairCatalog.mockResolvedValue({
      brands: [iphoneHardwareRepairCatalogue('iPhone 13', 'iphone-13', 'Power Button Replacement', 'power-button-replacement', 'Genuine')],
    });
    fetchRepairDetailInitialResults.mockResolvedValue(initialResults);

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-13', 'repair-type': 'power-button-replacement' })) });
    const matchingElement = findElementByType(page, RepairResultsMatchingSection);

    expect(fetchRepairDetailInitialResults).toHaveBeenCalledWith({
      category: 'phone', brandSlug: 'iphone', modelSlug: 'iphone-13', repairTypeSlug: 'power-button-replacement',
    });
    expect(matchingElement?.props).toEqual(expect.objectContaining({
      category: 'phone', brand: 'iphone', model: 'iphone-13', repairType: 'power-button-replacement', context: 'detail', initialResults,
    }));
  });

  it('enables only the five approved null-pocket hardware families', () => {
    const enabledRepairTypes = [
      'camera-lens-replacement',
      'power-button-replacement',
      'volume-button-replacement',
      'earpiece-speaker-replacement',
      'loudspeaker-replacement',
    ];

    for (const repairType of enabledRepairTypes) {
      expect(getAliMobileEnhancedIphoneSeoPocket({
        category: 'phone', brand: 'iphone', model: 'iphone-15', repairType, pocket: null,
      })).not.toBeNull();
    }

    for (const repairType of ['microphone-replacement', 'back-glass-replacement', 'logic-board-repair', 'water-damage-repair']) {
      expect(getAliMobileEnhancedIphoneSeoPocket({
        category: 'phone', brand: 'iphone', model: 'iphone-15', repairType, pocket: null,
      })).toBeNull();
    }
  });

  it.each([
    ['iPhone SE', 'iphone-se', [{ quality_grade: 'Genuine', price: 100 }]],
    ['iPhone 7', 'iphone-7', []],
    ['iPhone 7 Plus', 'iphone-7-plus', [{ quality_grade: 'Genuine', price: 100 }]],
  ])('renders %s as a 60-minute Back Housing service', async (model, slug, variants) => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphoneBackRepairCatalogue(model, slug, variants)] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: slug, 'repair-type': 'back-glass-replacement' })) });
    const html = renderToStaticMarkup(page);
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const faqs = faqElement?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaqs = faqs.filter((faq) => /how long/i.test(faq.question));

    expect(html).toContain(`<h1>${model} Back Glass / Back Housing Replacement</h1>`);
    expect(html).toContain(`${model} back housing replacement at Ali Mobile in Ringwood Square.`);
    expect(faqs[0]?.answer).toContain('rear housing or chassis assembly');
    expect(html).toContain('60 Minutes');
    expect(html).not.toContain('Timeframe Varies');
    expect(html).toContain('6-Month Warranty');
    expect(timingFaqs).toHaveLength(1);
    expect(timingFaqs[0]?.answer).toContain('usually takes around 60 minutes');
    if (variants.length > 0) {
      expect(html).toContain(`$${variants[0].price}`);
      expect(html).toContain('"offers"');
    }
  });

  it.each([
    ['iPhone 8', 'iphone-8', []],
    ['iPhone 14 Pro', 'iphone-14-pro', [{ quality_grade: 'Premium', price: 210 }]],
    ['iPhone 15 Pro', 'iphone-15-pro', [{ quality_grade: 'Premium', price: 150 }]],
    ['iPhone 17 Pro', 'iphone-17-pro', [{ quality_grade: 'Premium', price: 120 }]],
  ])('renders %s as a variable-time Back Glass service', async (model, slug, variants) => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphoneBackRepairCatalogue(model, slug, variants)] });

    const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: slug, 'repair-type': 'back-glass-replacement' })) });
    const html = renderToStaticMarkup(page);
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const faqs = faqElement?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaqs = faqs.filter((faq) => /how long/i.test(faq.question));

    expect(html).toContain(`<h1>${model} Back Glass / Back Housing Replacement</h1>`);
    expect(html).toContain(`${model} back glass replacement at Ali Mobile in Ringwood Square.`);
    expect(html).not.toContain('full rear housing replacement instead of back glass only');
    expect(faqs[0]?.answer).toContain('rear glass component');
    expect(html).toContain('Timeframe Varies');
    expect(html).not.toContain('60 Minutes');
    expect(html).toContain('6-Month Warranty');
    expect(timingFaqs).toHaveLength(1);
    expect(timingFaqs[0]?.answer).toContain('varies depending on the repair scope');
    expect(timingFaqs[0]?.answer).not.toMatch(/30|60|same-day|immediate|while you wait/i);
    if (variants.length > 0) {
      expect(html).toContain(`$${variants[0].price}`);
      expect(html).toContain('"offers"');
    }
  });

  it.each([
    ['iPhone 7', 'iphone-7'],
    ['iPhone 8', 'iphone-8'],
    ['iPhone SE 2', 'iphone-se-2'],
    ['iPhone 17 Pro Max', 'iphone-17-pro-max'],
  ])('keeps quote-only %s Back Glass/Housing copy price-safe', async (model, slug) => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphoneBackRepairCatalogue(model, slug, [])] });

    const html = renderToStaticMarkup(
      await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: slug, 'repair-type': 'back-glass-replacement' })) }),
    );

    expect(html).not.toContain('price below');
    expect(html).not.toContain('"offers"');
  });

  it('keeps legacy single-camera Back Camera copy model-safe while using the shared turnaround', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [iphone8BackCamera] });

    const html = renderToStaticMarkup(
      await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: 'iphone-8', 'repair-type': 'back-camera-replacement' })) }),
    );

    expect(html).toContain('<h1>iPhone 8 Back Camera Replacement</h1>');
    expect(html).toContain('30 Minutes');
    expect(html).not.toContain('rear camera switching');
    expect(html).not.toContain('supported rear camera modes');
  });

  it('keeps non-pilot Repair Detail hero copy and timing unchanged', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });

    const page = await RepairServicePage({ params: Promise.resolve(params()) });
    const html = renderToStaticMarkup(page);
    const faqElement = findElementByType(page, FaqAccordionComponent);
    const timingFaq = (faqElement?.props.faqs as Array<{ question: string; answer: string }>).find(
      (entry) => entry.question === 'How long does the Moto G24 Screen Replacement take?'
    );

    expect(html).toContain('Choose a quality tier, confirm the quote, then book the repair path that fits your device and budget.');
    expect(html).toContain('Fast Turnaround');
    expect(html).not.toContain('30 Minutes');
    expect(html).not.toContain('Screen replacement at Ali Mobile in Ringwood Square.');
    expect(timingFaq?.answer).toBe(
      'Many Moto G24 screen replacement jobs are completed quickly at Ringwood Square Shopping Centre when the correct part is in stock. Walk-ins are welcome on weekdays, and we confirm timing after checking the model, fault and queue.'
    );
  });

  it.each([
    ['screen-replacement', 'Screen Replacement', 30],
    ['battery-replacement', 'Battery Replacement', 30],
    ['charging-port-replacement', 'Charging Port Replacement', 30],
    ['back-glass-replacement', 'Back Glass Replacement', 20],
    ['front-camera-replacement', 'Front Camera Replacement', 30],
    ['back-camera-replacement', 'Back Camera Replacement', 30],
    ['logic-board-repair', 'Logic Board Repair', 30],
  ])('renders the approved Samsung semantic turnaround for %s', async (repairType, repairName, turnaroundMinutes) => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        category: 'phone',
        brand: 'Samsung',
        slug: 'samsung',
        models: [{
          model: 'Galaxy S25',
          slug: 'galaxy-s25',
          repairTypes: [{
            name: repairName,
            slug: repairType,
            price: repairType === 'logic-board-repair' ? 0 : 199,
            variants: repairType === 'logic-board-repair' ? [] : [{ quality_grade: 'Standard', price: 199 }],
          }],
        }],
      }],
    });

    const page = await RepairServicePage({
      params: Promise.resolve(params({ brand: 'samsung', model: 'galaxy-s25', 'repair-type': repairType })),
    });
    const html = renderToStaticMarkup(page);
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const timingFaqs = faqs.filter((faq) => /how long/i.test(faq.question));

    expect(html).toContain(`${turnaroundMinutes} Minutes`);
    expect(html).toContain('6-Month Warranty');
    expect(html).not.toContain('Fast Turnaround');
    expect(html).not.toContain('Timeframe Varies');
    expect(html).not.toMatch(/same-day|same day|immediate|while you wait/i);
    expect(html).toContain(
      repairType === 'logic-board-repair'
        ? 'Galaxy S25 logic board repair at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the correct part and quote before you visit.'
        : `Galaxy S25 ${repairName.toLowerCase()} at Ali Mobile in Ringwood Square. View the current repair price below. Walk-ins are welcome, and booking is recommended to confirm the correct part is available.`
    );
    expect(timingFaqs).toHaveLength(1);
    expect(timingFaqs[0]).toEqual(expect.objectContaining({
      question: `How long does Galaxy S25 ${repairName} usually take?`,
      answer: `Galaxy S25 ${repairName.toLowerCase()} usually takes around ${turnaroundMinutes} minutes when the correct part is available. If additional damage is found during inspection, turnaround may vary.`,
    }));
  });

  it('keeps Samsung quote-only logic-board content quote-safe and out of Offer schema', async () => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        category: 'phone',
        brand: 'Samsung',
        slug: 'samsung',
        models: [{
          model: 'Galaxy S25',
          slug: 'galaxy-s25',
          repairTypes: [{ name: 'Logic Board Repair', slug: 'logic-board-repair', price: 0, variants: [] }],
        }],
      }],
    });

    const html = renderToStaticMarkup(await RepairServicePage({
      params: Promise.resolve(params({ brand: 'samsung', model: 'galaxy-s25', 'repair-type': 'logic-board-repair' })),
    }));
    const serviceSchema = html.match(/<script id="schema-service"[^>]*>(.*?)<\/script>/)?.[1] ?? '';

    expect(html).toContain('Galaxy S25 logic board repair at Ali Mobile in Ringwood Square. Walk-ins are welcome, and booking is recommended so we can confirm the correct part and quote before you visit.');
    expect(html).not.toContain('price below');
    expect(serviceSchema).not.toContain('"offers"');
  });

  it.each([
    ['screen-replacement', 'Screen Replacement', 30],
    ['back-glass-replacement', 'Back Glass Replacement', 20],
  ])('uses live Samsung tier pricing only for multi-tier %s FAQs', async (repairType, repairName, turnaroundMinutes) => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        category: 'phone',
        brand: 'Samsung',
        slug: 'samsung',
        models: [{
          model: 'Galaxy S24 Ultra',
          slug: 'galaxy-s24-ultra',
          repairTypes: [{
            name: repairName,
            slug: repairType,
            price: 0,
            variants: [
              { quality_grade: 'Standard', price: 299 },
              { quality_grade: 'Custom', price: 399 },
            ],
          }],
        }],
      }],
    });

    const page = await RepairServicePage({
      params: Promise.resolve(params({ brand: 'samsung', model: 'galaxy-s24-ultra', 'repair-type': repairType })),
    });
    const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
    const priceFaq = faqs.find((faq) => /how much/i.test(faq.question) && /cost/i.test(faq.question));
    const timingFaq = faqs.find((faq) => /how long/i.test(faq.question));

    expect(timingFaq?.answer).toContain(`around ${turnaroundMinutes} minutes`);
    expect(priceFaq?.answer).toContain('Standard – $299');
    expect(priceFaq?.answer).toContain('Custom – $399. Current repair option for this model.');
    expect(priceFaq?.answer).not.toContain('Current screen option for this model.');
  });

  it('server-renders all 42 approved Galaxy Note detail routes', async () => {
    const noteModels = [
      ['Galaxy Note 8', 'galaxy-note-8'],
      ['Galaxy Note 9', 'galaxy-note-9'],
      ['Galaxy Note 10', 'galaxy-note-10'],
      ['Galaxy Note 10+', 'galaxy-note-10-plus'],
      ['Galaxy Note 20', 'galaxy-note-20'],
      ['Galaxy Note 20 Ultra', 'galaxy-note-20-ultra'],
    ] as const;
    const repairFamilies = [
      ['screen-replacement', 'Screen Replacement', 30],
      ['battery-replacement', 'Battery Replacement', 30],
      ['charging-port-replacement', 'Charging Port Replacement', 30],
      ['back-glass-replacement', 'Back Glass Replacement', 20],
      ['front-camera-replacement', 'Front Camera Replacement', 30],
      ['back-camera-replacement', 'Back Camera Replacement', 30],
      ['logic-board-repair', 'Logic Board Repair', 30],
    ] as const;

    for (const [model, modelSlug] of noteModels) {
      for (const [repairType, repairName, turnaroundMinutes] of repairFamilies) {
        fetchRepairCatalog.mockResolvedValue({
          brands: [{
            category: 'phone',
            brand: 'Samsung',
            slug: 'samsung',
            models: [{
              model,
              slug: modelSlug,
              repairTypes: [{
                name: repairName,
                slug: repairType,
                price: repairType === 'logic-board-repair' ? 0 : 199,
                variants: repairType === 'logic-board-repair' ? [] : [{ quality_grade: 'Standard', price: 199 }],
              }],
            }],
          }],
        });

        const page = await RepairServicePage({
          params: Promise.resolve(params({ brand: 'samsung', model: modelSlug, 'repair-type': repairType })),
        });
        const html = renderToStaticMarkup(page);
        const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{
          question: string;
          answer: string;
        }>;

        expect(html).toContain(`<h1>${model} ${repairName}</h1>`);
        expect(html).toContain(`${turnaroundMinutes} Minutes`);
        expect(html).toContain('6-Month Warranty');
        expect(faqs.map((faq) => `${faq.question} ${faq.answer}`).join(' '))
          .not.toMatch(/same-day|same day|immediate|while you wait/i);
      }
    }
  });

  it.each([
    ['Galaxy S24 Ultra', 'galaxy-s24-ultra', 'Screen Replacement', 'screen-replacement', 30],
    ['Galaxy S23 Ultra', 'galaxy-s23-ultra', 'Back Glass Replacement', 'back-glass-replacement', 20],
    ['Galaxy Z Fold 6', 'galaxy-z-fold-6', 'Screen Replacement', 'screen-replacement', 30],
  ])('keeps non-Note Samsung %s %s server-renderable', async (model, modelSlug, repairName, repairType, turnaroundMinutes) => {
    fetchRepairCatalog.mockResolvedValue({
      brands: [{
        category: 'phone',
        brand: 'Samsung',
        slug: 'samsung',
        models: [{
          model,
          slug: modelSlug,
          repairTypes: [{
            name: repairName,
            slug: repairType,
            price: repairType === 'logic-board-repair' ? 0 : 199,
            variants: repairType === 'logic-board-repair' ? [] : [{ quality_grade: 'Standard', price: 199 }],
          }],
        }],
      }],
    });

    const html = renderToStaticMarkup(await RepairServicePage({
      params: Promise.resolve(params({ brand: 'samsung', model: modelSlug, 'repair-type': repairType })),
    }));

    expect(html).toContain(`<h1>${model} ${repairName}</h1>`);
    expect(html).toContain(`${turnaroundMinutes} Minutes`);
  });

  it('leaves Galaxy A16 Logic Board on its existing hub redirect', async () => {
    await expect(RepairServicePage({
      params: Promise.resolve(params({ brand: 'samsung', model: 'galaxy-a16', 'repair-type': 'logic-board-repair' })),
    })).rejects.toThrow('NEXT_REDIRECT_TEST:/repairs/phone/logic-board-repair');
  });

  it('leaves the matching module unseeded when the server reader has no result', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });

    const page = await RepairServicePage({ params: Promise.resolve(params()) });
    const matchingElement = findElementByType(page, RepairResultsMatchingSection);

    expect(matchingElement?.props.initialResults).toBeUndefined();
  });

  it('deduplicates battery timing FAQs and normalizes model casing across legacy and modern models', async () => {
    const testCases = [
      { slug: 'iphone-12-mini', model: 'iPhone 12 mini', expectedQuestion: 'How long does iPhone 12 mini battery replacement usually take?' },
      { slug: 'iphone-13-mini', model: 'iPhone 13 mini', expectedQuestion: 'How long does iPhone 13 mini battery replacement usually take?' },
      { slug: 'iphone-6s', model: 'iPhone 6S', expectedQuestion: 'How long does iPhone 6S battery replacement usually take?' },
      { slug: 'iphone-6s-plus', model: 'iPhone 6S Plus', expectedQuestion: 'How long does iPhone 6S Plus battery replacement usually take?' },
      { slug: 'iphone-14-pro-max', model: 'iPhone 14 Pro Max', expectedQuestion: 'How long does iPhone 14 Pro Max battery replacement usually take?' },
    ];

    for (const { slug, model, expectedQuestion } of testCases) {
      fetchRepairCatalog.mockResolvedValue({
        brands: [{
          category: 'phone',
          brand: 'iPhone',
          slug: 'iphone',
          models: [{
            model,
            slug,
            repairTypes: [{
              name: 'Battery Replacement',
              slug: 'battery-replacement',
              price: 0,
              variants: [{ quality_grade: 'Standard', price: 149 }],
            }],
          }],
        }],
      });

      const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: slug, 'repair-type': 'battery-replacement' })) });
      const html = renderToStaticMarkup(page);
      const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
      const timingFaqs = faqs.filter((entry) => /how long/i.test(entry.question));

      expect(timingFaqs).toHaveLength(1);
      expect(timingFaqs[0].question).toBe(expectedQuestion);
      expect(timingFaqs[0].answer).toContain('around 30 minutes');
      expect(html).not.toMatch(/same-day|same day|immediate repair|while you wait/i);
    }
  });

  it('deduplicates charging port timing FAQs with connector-aware questions across USB-C and Lightning models', async () => {
    const testCases = [
      { slug: 'iphone-15-pro', model: 'iPhone 15 Pro', expectedQuestion: 'How long does iPhone 15 Pro USB-C port replacement usually take?' },
      { slug: 'iphone-16', model: 'iPhone 16', expectedQuestion: 'How long does iPhone 16 USB-C port replacement usually take?' },
      { slug: 'iphone-13', model: 'iPhone 13', expectedQuestion: 'How long does iPhone 13 charging port replacement usually take?' },
      { slug: 'iphone-12-mini', model: 'iPhone 12 mini', expectedQuestion: 'How long does iPhone 12 mini charging port replacement usually take?' },
      { slug: 'iphone-13-mini', model: 'iPhone 13 mini', expectedQuestion: 'How long does iPhone 13 mini charging port replacement usually take?' },
      { slug: 'iphone-6s', model: 'iPhone 6S', expectedQuestion: 'How long does iPhone 6S charging port replacement usually take?' },
      { slug: 'iphone-6s-plus', model: 'iPhone 6S Plus', expectedQuestion: 'How long does iPhone 6S Plus charging port replacement usually take?' },
    ];

    for (const { slug, model, expectedQuestion } of testCases) {
      fetchRepairCatalog.mockResolvedValue({
        brands: [{
          category: 'phone',
          brand: 'iPhone',
          slug: 'iphone',
          models: [{
            model,
            slug,
            repairTypes: [{
              name: 'Charging Port Replacement',
              slug: 'charging-port-replacement',
              price: 0,
              variants: [{ quality_grade: 'Standard', price: 149 }],
            }],
          }],
        }],
      });

      const page = await RepairServicePage({ params: Promise.resolve(params({ brand: 'iphone', model: slug, 'repair-type': 'charging-port-replacement' })) });
      const html = renderToStaticMarkup(page);
      const faqs = findElementByType(page, FaqAccordionComponent)?.props.faqs as Array<{ question: string; answer: string }>;
      const timingFaqs = faqs.filter((entry) => /how long/i.test(entry.question));

      expect(timingFaqs).toHaveLength(1);
      expect(timingFaqs[0].question).toBe(expectedQuestion);
      expect(timingFaqs[0].answer).toContain('around 30 minutes');
      expect(html).not.toMatch(/same-day|same day|immediate repair|while you wait/i);
    }
  });
});
