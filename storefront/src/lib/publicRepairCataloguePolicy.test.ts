import { describe, expect, it, vi } from 'vitest';

import { parseItem } from './inventoryUtils';
import { formatScopedRepairPriceLabel } from './scopedRepairPriceLabel';
import {
  createSharedPublicRepairCatalogueLoader,
  mergeMissingPublicRepairEntries,
  resolvePublicRepairCatalogue,
  runBoundedPublicCatalogueAttempts,
  serializePublicRepairCatalogue,
  type BrandEntry,
  type StoredPublicRepairCatalogueSnapshot,
} from './publicRepairCataloguePolicy';

const now = () => new Date('2026-07-16T00:00:00.000Z');

function completeBrands(repairsPerModel = 2): BrandEntry[] {
  return ['phone', 'tablet', 'laptop', 'watch'].map((category) => ({
    category,
    brand: `${category} brand`,
    slug: `${category}-brand`,
    icon: 'icon',
    models: [{
      model: `${category} model`,
      slug: `${category}-model`,
      repairTypes: Array.from({ length: repairsPerModel }, (_, index) => ({
        slug: `repair-${index + 1}`,
        name: `Repair ${index + 1}`,
        price: index === 0 ? 0 : 99,
        sourceType: 'real' as const,
      })),
    }],
  }));
}

function snapshotFor(brands: BrandEntry[]): StoredPublicRepairCatalogueSnapshot {
  const payload = serializePublicRepairCatalogue(brands);
  const repairs = brands.reduce((total, brand) => total + brand.models.reduce((sum, model) => sum + model.repairTypes.length, 0), 0);
  return {
    payload,
    checksum: 'placeholder',
    fetchedAt: now().toISOString(),
    validatedAt: now().toISOString(),
    inventoryRowCount: repairs,
    publicModelCount: brands.length,
    publicRepairCount: repairs,
  };
}

function stale(snapshot: StoredPublicRepairCatalogueSnapshot) {
  return { ...snapshot, validatedAt: '2026-07-08T00:00:00.000Z' };
}

async function resolveWith({
  inventory = [1],
  brands = completeBrands(),
  snapshot = null as StoredPublicRepairCatalogueSnapshot | null,
  fetchLiveInventory = async () => inventory,
  warnings = [] as string[],
}: {
  inventory?: number[];
  brands?: BrandEntry[];
  snapshot?: StoredPublicRepairCatalogueSnapshot | null;
  fetchLiveInventory?: () => Promise<number[]>;
  warnings?: string[];
}) {
  let stored = snapshot;
  const writes: StoredPublicRepairCatalogueSnapshot[] = [];
  const catalog = await resolvePublicRepairCatalogue({
    mode: 'production',
    fetchLiveInventory,
    transformLiveInventory: () => brands,
    readSnapshot: async () => stored,
    writeSnapshot: async (next) => {
      writes.push(next);
      stored = next;
    },
    createDevelopmentFallback: completeBrands,
    now,
    onWarning: (message) => warnings.push(message),
  });
  return { catalog, writes, warnings, stored };
}

describe('public repair catalogue safety policy', () => {
  it('accepts a valid live catalogue and atomically writes a public snapshot', async () => {
    const { catalog, writes } = await resolveWith({});
    expect(catalog.catalogueSource).toBe('live-pos');
    expect(catalog.source).toBe('pos');
    expect(writes).toHaveLength(1);
    expect(writes[0].payload.brands).toHaveLength(4);
  });

  it('uses no more than three bounded live request attempts before accepting a success', async () => {
    let attempts = 0;
    const failures: number[] = [];
    const result = await runBoundedPublicCatalogueAttempts(async () => {
      attempts += 1;
      if (attempts < 3) throw new Error('temporary failure');
      return 'live';
    }, {
      maxAttempts: 3,
      backoffMilliseconds: [0, 0],
      wait: async () => undefined,
      onFailure: (attempt) => failures.push(attempt),
    });
    expect(result).toBe('live');
    expect(attempts).toBe(3);
    expect(failures).toEqual([1, 2]);
  });

  it('uses last-known-good data after live POS failure without using development fallback', async () => {
    const first = await resolveWith({});
    const second = await resolveWith({
      snapshot: stale(first.stored!),
      fetchLiveInventory: async () => { throw new Error('offline'); },
    });
    expect(second.catalog.catalogueSource).toBe('last-known-good');
    expect(second.catalog.publicRepairCount).toBe(first.catalog.publicRepairCount);
    expect(second.writes).toHaveLength(0);
  });

  it('does not request POS again while a validated snapshot is inside the 7-day safety refresh window', async () => {
    const first = await resolveWith({});
    const fetchLiveInventory = vi.fn(async () => [1]);
    const second = await resolveWith({ snapshot: first.stored, fetchLiveInventory });
    expect(second.catalog.catalogueSource).toBe('last-known-good');
    expect(fetchLiveInventory).not.toHaveBeenCalled();
  });

  it('forces a live candidate and snapshot write when an authenticated event bypasses the safety window', async () => {
    const first = await resolveWith({});
    const fetchLiveInventory = vi.fn(async () => [1]);
    let stored = first.stored!;
    const writes: StoredPublicRepairCatalogueSnapshot[] = [];
    const catalog = await resolvePublicRepairCatalogue({
      mode: 'production',
      fetchLiveInventory,
      transformLiveInventory: () => completeBrands(),
      readSnapshot: async () => stored,
      writeSnapshot: async (snapshot) => { writes.push(snapshot); stored = snapshot; },
      createDevelopmentFallback: completeBrands,
      forceRefresh: true,
      now,
    });
    expect(fetchLiveInventory).toHaveBeenCalledTimes(1);
    expect(writes).toHaveLength(1);
    expect(catalog.catalogueSource).toBe('live-pos');
  });

  it('blocks production when neither live POS nor a snapshot is available', async () => {
    await expect(resolveWith({ fetchLiveInventory: async () => { throw new Error('offline'); } }))
      .rejects.toThrow('Production build stopped');
  });

  it('rejects empty or malformed live catalogue results without overwriting the snapshot', async () => {
    const first = await resolveWith({});
    const second = await resolveWith({ snapshot: stale(first.stored!), inventory: [], brands: [] });
    expect(second.catalog.catalogueSource).toBe('last-known-good');
    expect(second.writes).toHaveLength(0);
  });

  it('rejects a catastrophic partial candidate instead of replacing a complete snapshot', async () => {
    const first = await resolveWith({ brands: completeBrands(4) });
    const partial = completeBrands(1).slice(0, 1);
    const second = await resolveWith({ snapshot: stale(first.stored!), brands: partial });
    expect(second.catalog.catalogueSource).toBe('last-known-good');
    expect(second.catalog.publicRepairCount).toBe(first.catalog.publicRepairCount);
    expect(second.writes).toHaveLength(0);
  });

  it('retains a single missing previously verified repair instead of retiring its route', async () => {
    const first = await resolveWith({ brands: completeBrands(2) });
    const candidate = completeBrands(2);
    candidate[0].models[0].repairTypes.pop();
    const second = await resolveWith({ snapshot: stale(first.stored!), brands: candidate });
    expect(second.catalog.catalogueSource).toBe('live-pos');
    expect(second.catalog.publicRepairCount).toBe(first.catalog.publicRepairCount);
    expect(second.warnings.some((message) => message.includes('Retained 1'))).toBe(true);
  });

  it('requires the explicit retirement mechanism before a missing route can be removed', () => {
    const previous = completeBrands(1);
    const candidate = completeBrands(1);
    candidate[0].models[0].repairTypes = [];
    const retained = mergeMissingPublicRepairEntries(previous, candidate);
    expect(retained.retainedMissingEntries).toBe(1);
    const retired = mergeMissingPublicRepairEntries(previous, candidate, () => true);
    expect(retired.retainedMissingEntries).toBe(0);
  });

  it('permits a server-only approved major-shrink override without enabling it by default', async () => {
    const first = await resolveWith({ brands: completeBrands(4) });
    const partial = completeBrands(1);
    const warnings: string[] = [];
    let stored = first.stored;
    const catalog = await resolvePublicRepairCatalogue({
      mode: 'production',
      fetchLiveInventory: async () => [1],
      transformLiveInventory: () => partial,
      readSnapshot: async () => stale(stored!),
      writeSnapshot: async (next) => { stored = next; },
      createDevelopmentFallback: completeBrands,
      allowMajorShrink: true,
      now,
      onWarning: (message) => warnings.push(message),
    });
    expect(catalog.catalogueSource).toBe('live-pos');
    expect(warnings.some((message) => message.includes('Retained'))).toBe(true);
  });

  it('uses development fallback only in explicit test mode and never writes it', async () => {
    const writes = vi.fn();
    const catalog = await resolvePublicRepairCatalogue({
      mode: 'test',
      fetchLiveInventory: async () => { throw new Error('offline'); },
      transformLiveInventory: () => [],
      readSnapshot: async () => null,
      writeSnapshot: writes,
      createDevelopmentFallback: completeBrands,
      now,
    });
    expect(catalog.catalogueSource).toBe('development-fallback');
    expect(writes).not.toHaveBeenCalled();
  });

  it('strips private inventory fields from the persisted serializer payload', () => {
    const payload = serializePublicRepairCatalogue([{ ...completeBrands(1)[0], models: [{
      ...completeBrands(1)[0].models[0],
      repairTypes: [{ ...completeBrands(1)[0].models[0].repairTypes[0], cost: 70, supplier: 'private' } as BrandEntry['models'][number]['repairTypes'][number]],
    }] }]);
    expect(JSON.stringify(payload)).not.toContain('cost');
    expect(JSON.stringify(payload)).not.toContain('supplier');
  });

  it('keeps null and zero priced real POS rows eligible with a zero public price', async () => {
    const zeroPrice = parseItem({ id: 1, name: 'iPhone 15 Screen Repair', model: 'P iPhone||iPhone 15', price: 0, category: 'repair' });
    const nullPrice = parseItem({ id: 2, name: 'iPhone 15 Battery Service', model: 'P iPhone||iPhone 15', price: null, category: 'repair' });
    const missingPrice = parseItem({ id: 3, name: 'iPhone 15 Charging Port', model: 'P iPhone||iPhone 15', category: 'repair' });
    expect(zeroPrice).toEqual(expect.objectContaining({ price: 0, sourceType: 'real' }));
    expect(nullPrice).toEqual(expect.objectContaining({ price: 0, sourceType: 'real' }));
    expect(missingPrice).toEqual(expect.objectContaining({ price: 0, sourceType: 'real' }));
    expect(formatScopedRepairPriceLabel('screen-replacement', 0, 'Quote on Request', 'real')).toBe('Quote on Request');
    expect(formatScopedRepairPriceLabel('screen-replacement', null, 'Quote on Request', 'real')).toBe('Quote on Request');
    expect(formatScopedRepairPriceLabel('screen-replacement', undefined, 'Quote on Request', 'real')).toBe('Quote on Request');
    const { catalog } = await resolveWith({ brands: completeBrands(1) });
    expect(catalog.brands.flatMap((brand) => brand.models).flatMap((model) => model.repairTypes)).toEqual(expect.arrayContaining([
      expect.objectContaining({ price: 0, sourceType: 'real' }),
    ]));
  });

  it('deduplicates concurrent catalogue consumers through one shared promise', async () => {
    let calls = 0;
    const load = createSharedPublicRepairCatalogueLoader(async () => {
      calls += 1;
      return 'catalogue';
    }, 86_400_000, () => 1);
    await expect(Promise.all([load(), load(), load()])).resolves.toEqual(['catalogue', 'catalogue', 'catalogue']);
    expect(calls).toBe(1);
  });

  it('does not retain an explicit retirement while still retaining an unannounced temporary missing entry', () => {
    const previous = completeBrands(1);
    const candidate = completeBrands(1);
    candidate[0].models[0].repairTypes = [];
    expect(mergeMissingPublicRepairEntries(previous, candidate, () => false).retainedMissingEntries).toBe(1);
    expect(mergeMissingPublicRepairEntries(previous, candidate, () => true).brands.find((brand) => brand.category === 'phone')?.models[0].repairTypes).toEqual([]);
  });
});
