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
import { getGooglePixelHardwareConfig } from '@/lib/seo/content/google-pixel/config';
import { getAliMobileEnhancedGooglePixelRepairType } from '@/lib/seo/content/google-pixel';

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

    await expect(RepairServicePage({ params: Promise.resolve(params({ brand: 'google-pixel', model: 'pixel-8-pro', 'repair-type': 'water-damage-repair' })) }))
      .resolves.toBeTruthy();
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

  it('leaves the matching module unseeded when the server reader has no result', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });

    const page = await RepairServicePage({ params: Promise.resolve(params()) });
    const matchingElement = findElementByType(page, RepairResultsMatchingSection);

    expect(matchingElement?.props.initialResults).toBeUndefined();
  });
});
