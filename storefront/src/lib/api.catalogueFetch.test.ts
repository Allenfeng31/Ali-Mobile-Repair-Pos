import { describe, expect, it, vi } from 'vitest';

import {
  createPublicRepairCatalogueReader,
  transformPOSToCatalog,
  fetchPOSInventory,
  PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG,
  selectModelRepairTypesFromCatalogue,
  type RepairCatalog,
} from './api';
import { PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS } from './publicRepairCataloguePolicy';

const successfulResponse = () => ({ ok: true, json: async () => [] });

describe('POS inventory cache boundary', () => {
  it('keeps durable catalogue provenance when selecting one Model Hub repair list', () => {
    const catalog: RepairCatalog = {
      source: 'pos',
      catalogueSource: 'last-known-good',
      fetchedAt: '2026-09-01T00:00:00.000Z',
      validatedAt: '2026-09-01T00:00:00.000Z',
      checksum: 'test',
      inventoryRowCount: 1,
      publicModelCount: 1,
      publicRepairCount: 1,
      brands: [{
        category: 'phone',
        slug: 'oppo',
        brand: 'OPPO',
        icon: 'phone',
        models: [{
          slug: 'find-x8-pro',
          model: 'Find X8 Pro',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }],
        }],
      }],
    };

    const result = selectModelRepairTypesFromCatalogue(catalog, 'phone', 'oppo', 'find-x8-pro');

    expect(result).toMatchObject({
      brand: 'OPPO',
      model: 'Find X8 Pro',
      catalogueSource: 'last-known-good',
      repairTypes: [{ slug: 'screen-replacement', repairOrigin: 'pos' }],
    });
    expect(result?.brandModels).toBe(catalog.brands[0]!.models);
  });

  it('removes only explicit lifecycle retirements from active catalogue surfaces', () => {
    expect(transformPOSToCatalog([{ id: 1, name: 'Moto G24 Screen Replacement', model: 'P Motorola||Moto G24', category: 'Screen Replacement', price: 149, hidden: true }])).toEqual([]);
    expect(transformPOSToCatalog([{ id: 1, name: 'Moto G24 Screen Replacement', model: 'P Motorola||Moto G24', category: 'Screen Replacement', price: 149 }])).not.toEqual([]);
  });
  it('does not keep a warm module-level catalogue result after a refresh changes the durable source', async () => {
    let current = 'old';
    const reader = createPublicRepairCatalogueReader(async () => ({ marker: current } as never));
    expect(await reader()).toEqual({ marker: 'old' });
    current = 'new';
    expect(await reader()).toEqual({ marker: 'new' });
  });
  it('uses the catalogue tag and 7-day Data Cache policy for normal catalogue reads', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(successfulResponse());
    await fetchPOSInventory({ baseUrl: 'https://pos.example', fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith('https://pos.example/api/inventory', expect.objectContaining({
      next: {
        revalidate: PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS,
        tags: [PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG],
      },
    }));
    expect(fetchImpl.mock.calls[0][1]).not.toHaveProperty('cache');
  });

  it('uses a no-store live request for forced refreshes without Next cache options or timestamp keys', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(successfulResponse());
    await fetchPOSInventory({ forceLive: true, baseUrl: 'https://pos.example', fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith('https://pos.example/api/inventory', expect.objectContaining({ cache: 'no-store' }));
    expect(fetchImpl.mock.calls[0][1]).not.toHaveProperty('next');
    expect(fetchImpl.mock.calls[0][0]).not.toContain('?');
  });
});
