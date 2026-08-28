import { describe, expect, it } from 'vitest';

import { transformPOSToCatalog } from './api';
import { withAppleWatchChargingRepairOption } from './seo/content/apple-watch';
import {
  checksumPublicRepairCatalogue,
  mergeMissingPublicRepairEntries,
  resolvePublicRepairCatalogue,
  serializePublicRepairCatalogue,
  type BrandEntry,
  type StoredPublicRepairCatalogueSnapshot,
} from './publicRepairCataloguePolicy';
import { withVirtualCameraLensRepairOption } from './virtualCameraLens';
import { withVirtualPhoneRepairOptions } from './virtualPhoneRepairs';

/**
 * Literal payload and checksum from the pre-Origin serializer. It deliberately
 * does not call the current serializer, which adds `repairOrigin`.
 */
const LEGACY_SNAPSHOT: StoredPublicRepairCatalogueSnapshot = {
  payload: {
    brands: ['laptop', 'phone', 'tablet', 'watch'].map((category) => ({
      category,
      brand: `${category} brand`,
      slug: `${category}-brand`,
      icon: 'icon',
      models: [{
        model: `${category} model`,
        slug: `${category}-model`,
        repairTypes: [{
          slug: 'screen-replacement',
          name: 'Screen Replacement',
          price: 149,
          sourceType: 'real' as const,
        }],
      }],
    })),
  },
  // sha256(JSON.stringify(the exact pre-Origin canonical payload above))
  checksum: 'fcee1d42c1020ee5c067d375620d589f0cdc74bc2aed17d7a975b907eccb6cd1',
  fetchedAt: '2026-08-01T00:00:00.000Z',
  validatedAt: '2026-08-28T00:00:00.000Z',
  inventoryRowCount: 4,
  publicModelCount: 4,
  publicRepairCount: 4,
};

function repair(brands: ReturnType<typeof transformPOSToCatalog>, slug: string) {
  return brands[0].models[0].repairTypes.find((entry) => entry.slug === slug);
}

function brandWith(origin?: string): BrandEntry[] {
  return [{
    category: 'phone',
    brand: 'Motorola',
    slug: 'motorola',
    icon: 'phone',
    models: [{
      model: 'Moto G04',
      slug: 'moto-g04',
      repairTypes: [{
        slug: 'screen-replacement',
        name: 'Screen Replacement',
        price: 149,
        sourceType: 'real',
        ...(origin ? { repairOrigin: origin as never } : {}),
      }],
    }],
  }];
}

function completeBrands(origin: string): BrandEntry[] {
  return ['phone', 'tablet', 'laptop', 'watch'].map((category) => ({
    category,
    brand: `${category} brand`,
    slug: `${category}-brand`,
    icon: 'icon',
    models: [{
      model: `${category} model`,
      slug: `${category}-model`,
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 149, repairOrigin: origin as never },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 99, repairOrigin: origin as never },
      ],
    }],
  }));
}

function readSnapshot(snapshot: StoredPublicRepairCatalogueSnapshot) {
  return resolvePublicRepairCatalogue({
    mode: 'production' as const,
    fetchLiveInventory: async () => {
      throw new Error('A valid snapshot should be used before live POS is fetched.');
    },
    transformLiveInventory: () => completeBrands('pos'),
    readSnapshot: async () => snapshot,
    writeSnapshot: async () => {},
    createDevelopmentFallback: () => completeBrands('synthetic-backfill'),
    now: () => new Date('2026-08-28T00:00:01.000Z'),
  });
}

describe('repair catalogue origin tracing', () => {
  it('marks a direct POS repair as pos and core additions without duplicating it', () => {
    const catalog = transformPOSToCatalog([
      { id: 1, name: 'Moto G04 Screen Repair', model: 'P Motorola||Moto G04', category: 'Screen Repair', price: 149 },
    ]);

    expect(repair(catalog, 'screen-replacement')).toMatchObject({ repairOrigin: 'pos' });
    expect(catalog[0].models[0].repairTypes.filter((entry) => entry.slug === 'screen-replacement')).toHaveLength(1);
    expect(repair(catalog, 'battery-replacement')).toMatchObject({ repairOrigin: 'synthetic-core' });
    expect(repair(catalog, 'charging-port-replacement')).toMatchObject({ repairOrigin: 'synthetic-core' });
    expect(repair(catalog, 'water-damage-repair')).toMatchObject({ repairOrigin: 'synthetic-core' });
  });

  it('marks conditional Samsung back glass as synthetic-backfill', () => {
    const catalog = transformPOSToCatalog([
      { id: 1, name: 'Galaxy S24 Screen Repair', model: 'P Samsung||Galaxy S24', category: 'Screen Repair', price: 199 },
    ]);

    expect(repair(catalog, 'back-glass-replacement')).toMatchObject({ repairOrigin: 'synthetic-backfill' });
  });

  it('keeps UI-only options virtual and the Apple Watch charging path diagnostic', () => {
    expect(withVirtualPhoneRepairOptions([], 'phone', 'samsung')).toEqual(
      expect.arrayContaining([expect.objectContaining({ repairOrigin: 'virtual' })]),
    );
    expect(withVirtualCameraLensRepairOption([], 'phone', 'samsung')).toEqual(
      expect.arrayContaining([expect.objectContaining({ repairOrigin: 'virtual' })]),
    );
    expect(withAppleWatchChargingRepairOption([], 'watch', 'apple', 'apple-watch-series-3-38mm')).toEqual(
      expect.arrayContaining([expect.objectContaining({ repairOrigin: 'diagnostic' })]),
    );
  });

  it('normalizes an old snapshot to unknown-legacy and preserves every origin through serialization', () => {
    const oldSnapshot = serializePublicRepairCatalogue(brandWith());
    expect(oldSnapshot.brands[0].models[0].repairTypes[0].repairOrigin).toBe('unknown-legacy');

    for (const origin of ['pos', 'synthetic-core', 'synthetic-backfill', 'diagnostic', 'unknown-legacy', 'virtual'] as const) {
      const payload = serializePublicRepairCatalogue(brandWith(origin));
      expect(payload.brands[0].models[0].repairTypes[0].repairOrigin).toBe(origin);
    }
  });

  it('accepts a real pre-Origin snapshot only after validating its historical checksum representation', async () => {
    expect(JSON.stringify(LEGACY_SNAPSHOT.payload)).not.toContain('repairOrigin');

    const catalog = await readSnapshot(LEGACY_SNAPSHOT);

    expect(catalog.catalogueSource).toBe('last-known-good');
    expect(catalog.brands.every((brand) => brand.models.every((model) => model.repairTypes.every(
      (entry) => entry.repairOrigin === 'unknown-legacy',
    )))).toBe(true);
  });

  it('rejects a corrupt legacy snapshot instead of accepting it through compatibility handling', async () => {
    const corrupt = structuredClone(LEGACY_SNAPSHOT);
    corrupt.payload.brands[0].models[0].repairTypes[0].price = 999;

    await expect(readSnapshot(corrupt)).rejects.toThrow('Last-known-good public repair catalogue snapshot is invalid.');
  });

  it('accepts a valid current snapshot and rejects a corrupt current snapshot', async () => {
    const payload = serializePublicRepairCatalogue(completeBrands('pos'));
    const current: StoredPublicRepairCatalogueSnapshot = {
      ...LEGACY_SNAPSHOT,
      payload,
      checksum: checksumPublicRepairCatalogue(payload),
      inventoryRowCount: 8,
      publicRepairCount: 8,
    };
    await expect(readSnapshot(current)).resolves.toMatchObject({ catalogueSource: 'last-known-good' });

    const corrupt = structuredClone(current);
    corrupt.payload.brands[0].models[0].repairTypes[0].slug = 'changed-repair';
    await expect(readSnapshot(corrupt)).rejects.toThrow('Last-known-good public repair catalogue snapshot is invalid.');
  });

  it('fails closed for mixed origin snapshots', async () => {
    const mixed = structuredClone(LEGACY_SNAPSHOT);
    mixed.payload.brands[0].models[0].repairTypes[0].repairOrigin = 'unknown-legacy';

    await expect(readSnapshot(mixed)).rejects.toThrow('Last-known-good public repair catalogue snapshot is invalid.');
  });

  it('upgrades a validated legacy snapshot to the current checksum representation without guessing pos', async () => {
    let written: StoredPublicRepairCatalogueSnapshot | null = null;
    await resolvePublicRepairCatalogue({
      mode: 'production',
      fetchLiveInventory: async () => [1],
      transformLiveInventory: () => LEGACY_SNAPSHOT.payload.brands,
      readSnapshot: async () => LEGACY_SNAPSHOT,
      writeSnapshot: async (snapshot) => { written = snapshot; },
      createDevelopmentFallback: () => completeBrands('synthetic-backfill'),
      forceRefresh: true,
      now: () => new Date('2026-08-28T00:00:01.000Z'),
    });

    expect(written).not.toBeNull();
    expect(JSON.stringify(written!.payload)).toContain('repairOrigin');
    expect(written!.checksum).toBe(checksumPublicRepairCatalogue(written!.payload));
    await expect(readSnapshot(written!)).resolves.toMatchObject({ catalogueSource: 'last-known-good' });
    expect(written!.payload.brands[0].models[0].repairTypes[0].repairOrigin).toBe('unknown-legacy');
  });

  it('uses the live entry origin for an exact replacement and preserves origin for a retained missing entry', () => {
    const livePos = mergeMissingPublicRepairEntries(brandWith('unknown-legacy'), brandWith('pos'));
    expect(livePos.brands[0].models[0].repairTypes[0].repairOrigin).toBe('pos');

    const liveSynthetic = mergeMissingPublicRepairEntries(brandWith('pos'), brandWith('synthetic-core'));
    expect(liveSynthetic.brands[0].models[0].repairTypes[0].repairOrigin).toBe('synthetic-core');

    const retained = mergeMissingPublicRepairEntries(brandWith('pos'), [{ ...brandWith('pos')[0], models: [] }]);
    expect(retained.brands[0].models[0].repairTypes[0].repairOrigin).toBe('pos');
  });

  it('preserves the retired repair origin in the tombstone without changing active retention rules', async () => {
    let stored: StoredPublicRepairCatalogueSnapshot | null = null;
    const now = () => new Date('2026-08-28T00:00:00.000Z');
    const first = await resolvePublicRepairCatalogue({
      mode: 'production',
      fetchLiveInventory: async () => [1],
      transformLiveInventory: () => completeBrands('pos'),
      readSnapshot: async () => stored,
      writeSnapshot: async (snapshot) => { stored = snapshot; },
      createDevelopmentFallback: () => completeBrands('synthetic-backfill'),
      now,
    });
    const next = completeBrands('synthetic-core');
    next[0].models[0].repairTypes = [next[0].models[0].repairTypes[1]];
    const second = await resolvePublicRepairCatalogue({
      mode: 'production',
      fetchLiveInventory: async () => [1],
      transformLiveInventory: () => next,
      readSnapshot: async () => stored,
      writeSnapshot: async (snapshot) => { stored = snapshot; },
      createDevelopmentFallback: () => completeBrands('synthetic-backfill'),
      isExplicitRetirement: (category, _brand, _model, repairSlug) => category === 'phone' && repairSlug === 'screen-replacement',
      forceRefresh: true,
      now,
    });

    expect(first.brands.find((brand) => brand.category === 'phone')?.models[0].repairTypes[0].repairOrigin).toBe('pos');
    expect(second.retiredRepairs).toEqual(expect.arrayContaining([
      expect.objectContaining({ repair: expect.objectContaining({ repairOrigin: 'pos' }) }),
    ]));
    expect(second.brands.find((brand) => brand.category === 'phone')?.models[0].repairTypes).toEqual([
      expect.objectContaining({ slug: 'battery-replacement', repairOrigin: 'synthetic-core' }),
    ]);
  });
});
