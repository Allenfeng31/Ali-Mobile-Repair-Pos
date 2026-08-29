import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';

import {
  checksumPublicRepairCatalogue,
  hydratePublicRepairCatalogueSnapshot,
  serializePublicRepairCatalogue,
  type BrandEntry,
  type PublicRepairCataloguePayload,
  type StoredPublicRepairCatalogueSnapshot,
} from './publicRepairCataloguePolicy';

function hash(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function brands(origin?: 'pos') {
  return ['phone', 'tablet', 'laptop', 'watch'].map((category) => ({
    category, brand: `${category} Brand`, slug: `${category}-brand`, icon: 'icon', models: [{
      model: `${category} Model`, slug: `${category}-model`, repairTypes: [{
        slug: 'screen-replacement', name: 'Screen Replacement', price: 123,
        ...(origin ? { repairOrigin: origin } : {}),
      }],
    }],
  })) as BrandEntry[];
}

function snapshot(schemaVersion: number, payload: PublicRepairCataloguePayload, checksum: string): StoredPublicRepairCatalogueSnapshot {
  return {
    schemaVersion, payload, checksum,
    fetchedAt: '2026-08-29T00:00:00.000Z', validatedAt: '2026-08-29T01:00:00.000Z',
    inventoryRowCount: 4, publicModelCount: 4, publicRepairCount: 4,
  };
}

describe('versioned public repair catalogue snapshot contract', () => {
  const originalLocaleCompare = String.prototype.localeCompare;

  afterEach(() => {
    String.prototype.localeCompare = originalLocaleCompare;
  });

  it('validates persisted pre-Origin v1 arrays without using locale comparison, then normalizes unknown legacy origin', () => {
    const payload = { brands: brands() };
    const legacy = snapshot(1, payload, hash(payload));
    String.prototype.localeCompare = () => { throw new Error('locale ordering must not be used'); };

    const hydrated = hydratePublicRepairCatalogueSnapshot(legacy);

    expect(hydrated.brands[0].models[0].repairTypes[0].repairOrigin).toBe('unknown-legacy');
  });

  it('validates a previous Origin v1 snapshot by persisted arrays and a v2 snapshot by deterministic canonical order', () => {
    const v1Payload = { brands: brands('pos') };
    expect(hydratePublicRepairCatalogueSnapshot(snapshot(1, v1Payload, hash(v1Payload))))
      .toMatchObject({ catalogueSource: 'last-known-good' });

    const v2Payload = serializePublicRepairCatalogue([...brands('pos')].reverse());
    expect(hydratePublicRepairCatalogueSnapshot(snapshot(2, v2Payload, checksumPublicRepairCatalogue(v2Payload))))
      .toMatchObject({ catalogueSource: 'last-known-good' });
  });

  it('rejects a schema-only downgrade or upgrade when arrays are already identical under both ordering rules', () => {
    const payload = serializePublicRepairCatalogue(brands('pos'));
    payload.retiredRepairs = [{
      lifecycle: 'retired', category: 'phone', brand: 'phone Brand', brandSlug: 'phone-brand',
      model: 'Old Phone', modelSlug: 'old-phone',
      repair: { slug: 'battery-replacement', name: 'Battery Replacement', price: 99, repairOrigin: 'pos' },
    }];
    const checksum = checksumPublicRepairCatalogue(payload);
    const v2 = snapshot(2, payload, checksum);

    expect(payload.brands).toEqual([...payload.brands].sort((left, right) => left.category < right.category ? -1 : left.category > right.category ? 1 : 0));
    expect(hydratePublicRepairCatalogueSnapshot(v2)).toMatchObject({ catalogueSource: 'last-known-good' });
    expect(() => hydratePublicRepairCatalogueSnapshot({ ...v2, schemaVersion: 1 })).toThrow('snapshot is invalid');

    const v1Payload = { brands: serializePublicRepairCatalogue(brands('pos')).brands };
    const v1 = snapshot(1, v1Payload, hash(v1Payload));
    expect(hydratePublicRepairCatalogueSnapshot(v1)).toMatchObject({ catalogueSource: 'last-known-good' });
    expect(() => hydratePublicRepairCatalogueSnapshot({ ...v1, schemaVersion: 2 })).toThrow('snapshot is invalid');
  });

  it('fails closed for corrupt previous/current data, array-order tampering, mixed origin and schema downgrade attempts', () => {
    const v1Payload = { brands: brands('pos') };
    const previous = snapshot(1, v1Payload, hash(v1Payload));
    const reorderedPrevious = structuredClone(previous);
    reorderedPrevious.payload.brands.reverse();

    const v2Payload = serializePublicRepairCatalogue(brands('pos'));
    const current = snapshot(2, v2Payload, checksumPublicRepairCatalogue(v2Payload));
    const corruptCurrent = structuredClone(current);
    corruptCurrent.payload.brands[0].models[0].repairTypes[0].price = 999;
    const mixed = structuredClone(current);
    delete mixed.payload.brands[0].models[0].repairTypes[0].repairOrigin;
    const downgrade = snapshot(2, { brands: brands() }, hash({ brands: brands() }));

    for (const invalid of [reorderedPrevious, corruptCurrent, mixed, downgrade, { ...current, schemaVersion: 3 }]) {
      expect(() => hydratePublicRepairCatalogueSnapshot(invalid)).toThrow('snapshot is invalid');
    }
  });

  it('rejects count mismatches and preserves retired records in its checksum validation', () => {
    const payload = serializePublicRepairCatalogue(brands('pos'));
    payload.retiredRepairs = [{
      lifecycle: 'retired', category: 'phone', brand: 'phone Brand', brandSlug: 'phone-brand',
      model: 'Old Phone', modelSlug: 'old-phone',
      repair: { slug: 'battery-replacement', name: 'Battery Replacement', price: 99, repairOrigin: 'pos' },
    }];
    const valid = snapshot(2, payload, checksumPublicRepairCatalogue(payload));
    expect(hydratePublicRepairCatalogueSnapshot(valid).retiredRepairs).toHaveLength(1);
    expect(() => hydratePublicRepairCatalogueSnapshot({ ...valid, publicRepairCount: 5 })).toThrow('counts do not match');
  });
});
