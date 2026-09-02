import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const fetchRepairDetailInitialResults = vi.hoisted(() => vi.fn());
const RepairResultsMatchingSection = vi.hoisted(() => vi.fn(() => null));
const notFound = vi.hoisted(() => vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND_TEST');
}));

vi.mock('@/lib/api', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/lib/api')>()), fetchRepairCatalog }));
vi.mock('@/lib/repair-results.server', () => ({ fetchRepairDetailInitialResults }));
vi.mock('@/components/repair-results/RepairResultsMatchingSection', () => ({ default: RepairResultsMatchingSection }));
vi.mock('next/navigation', () => ({ notFound, permanentRedirect: vi.fn() }));

import RepairServicePage from './page';

const params = (overrides: Record<string, string> = {}) => ({ category: 'phone', brand: 'motorola', model: 'moto-g24', 'repair-type': 'screen-replacement', ...overrides });
const active = { category: 'phone', brand: 'Motorola', slug: 'motorola', models: [{ model: 'Moto G24', slug: 'moto-g24', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', price: 149, variants: [] }] }] };
const activeModelWithoutScreenRepair = {
  ...active,
  models: [{ ...active.models[0], repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] }] }],
};
const retired = { lifecycle: 'retired' as const, category: 'phone', brand: 'Motorola', brandSlug: 'motorola', model: 'Moto G24', modelSlug: 'moto-g24', repair: { name: 'Screen Replacement', slug: 'screen-replacement', price: 149, sourceType: 'real' as const } };

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
  });

  it('returns normal page data for an active repair', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });
    await expect(RepairServicePage({ params: Promise.resolve(params()) })).resolves.toBeTruthy();
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

  it('keeps a renamed old tombstone renderable while the new active identity works', async () => {
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
    await expect(RepairServicePage({ params: Promise.resolve(params({ model: 'moto-g24-5g' })) })).resolves.toBeTruthy();
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

  it('leaves the matching module unseeded when the server reader has no result', async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: [active] });

    const page = await RepairServicePage({ params: Promise.resolve(params()) });
    const matchingElement = findElementByType(page, RepairResultsMatchingSection);

    expect(matchingElement?.props.initialResults).toBeUndefined();
  });
});
