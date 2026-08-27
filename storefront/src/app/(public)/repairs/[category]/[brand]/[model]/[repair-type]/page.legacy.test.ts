import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
const notFound = vi.hoisted(() => vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND_TEST');
}));

vi.mock('@/lib/api', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/lib/api')>()), fetchRepairCatalog }));
vi.mock('next/navigation', () => ({ notFound, permanentRedirect: vi.fn() }));

import RepairServicePage from './page';

const params = (overrides: Record<string, string> = {}) => ({ category: 'phone', brand: 'motorola', model: 'moto-g24', 'repair-type': 'screen-replacement', ...overrides });
const active = { category: 'phone', brand: 'Motorola', slug: 'motorola', models: [{ model: 'Moto G24', slug: 'moto-g24', repairTypes: [{ name: 'Screen Replacement', slug: 'screen-replacement', price: 149, variants: [] }] }] };
const activeModelWithoutScreenRepair = {
  ...active,
  models: [{ ...active.models[0], repairTypes: [{ name: 'Battery Replacement', slug: 'battery-replacement', price: 99, variants: [] }] }],
};
const retired = { lifecycle: 'retired' as const, category: 'phone', brand: 'Motorola', brandSlug: 'motorola', model: 'Moto G24', modelSlug: 'moto-g24', repair: { name: 'Screen Replacement', slug: 'screen-replacement', price: 149, sourceType: 'real' as const } };

describe('Repair Detail active and legacy page-data resolution', () => {
  afterEach(() => {
    fetchRepairCatalog.mockReset();
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
});
