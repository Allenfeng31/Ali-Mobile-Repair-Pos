import { afterEach, describe, expect, it, vi } from 'vitest';

const readCurrentPublicRepairCatalogueSnapshot = vi.hoisted(() => vi.fn());
const writeCurrentPublicRepairCatalogueSnapshot = vi.hoisted(() => vi.fn());

vi.mock('./publicRepairCatalogueSnapshot.server', () => ({
  readCurrentPublicRepairCatalogueSnapshot,
  writeCurrentPublicRepairCatalogueSnapshot,
}));

import { fetchRepairCatalog } from './api';
import {
  checksumPublicRepairCatalogue,
  serializePublicRepairCatalogue,
} from './publicRepairCataloguePolicy';

const originalLocalOnly = process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
const originalReadOnlySnapshot = process.env.ALI_MOBILE_READ_ONLY_SNAPSHOT_CATALOG;
const originalLocalSnapshotOnly = process.env.ALI_MOBILE_LOCAL_SNAPSHOT_ONLY;
const originalNodeEnv = process.env.NODE_ENV;
const mutableEnvironment = process.env as Record<string, string | undefined>;

function restoreEnvironment() {
  if (originalLocalOnly === undefined) delete process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
  else process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = originalLocalOnly;

  if (originalReadOnlySnapshot === undefined) delete process.env.ALI_MOBILE_READ_ONLY_SNAPSHOT_CATALOG;
  else process.env.ALI_MOBILE_READ_ONLY_SNAPSHOT_CATALOG = originalReadOnlySnapshot;

  if (originalLocalSnapshotOnly === undefined) delete process.env.ALI_MOBILE_LOCAL_SNAPSHOT_ONLY;
  else process.env.ALI_MOBILE_LOCAL_SNAPSHOT_ONLY = originalLocalSnapshotOnly;

  mutableEnvironment.NODE_ENV = originalNodeEnv;
}

describe('local-only repair catalogue mode', () => {
  afterEach(() => {
    restoreEnvironment();
    vi.unstubAllGlobals();
    readCurrentPublicRepairCatalogueSnapshot.mockReset();
    writeCurrentPublicRepairCatalogueSnapshot.mockReset();
  });

  it('returns the local fixture before every remote catalogue boundary', async () => {
    process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    mutableEnvironment.NODE_ENV = 'development';
    readCurrentPublicRepairCatalogueSnapshot.mockRejectedValue(new Error('snapshot must not run'));
    const remoteFetch = vi.fn(() => { throw new Error('POS must not run'); });
    vi.stubGlobal('fetch', remoteFetch);

    const catalogue = await fetchRepairCatalog();

    expect(catalogue.catalogueSource).toBe('development-fallback');
    expect(catalogue.brands.find((brand) => brand.slug === 'huawei')?.models).toContainEqual(expect.objectContaining({ slug: 'p30' }));
    expect(catalogue.brands.find((brand) => brand.slug === 'asus')?.models).toContainEqual(expect.objectContaining({ slug: 'rog-phone-5' }));
    expect(readCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
    expect(writeCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
    expect(remoteFetch).not.toHaveBeenCalled();
  });

  it('rejects local-only configuration in production before any remote fallback', async () => {
    process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    mutableEnvironment.NODE_ENV = 'production';
    const remoteFetch = vi.fn(() => { throw new Error('POS must not run'); });
    vi.stubGlobal('fetch', remoteFetch);

    await expect(fetchRepairCatalog()).rejects.toThrow('ALI_MOBILE_LOCAL_CATALOG_ONLY cannot be enabled in production');

    expect(readCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
    expect(writeCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
    expect(remoteFetch).not.toHaveBeenCalled();
  });

  it('preserves the existing resolver path when local-only mode is disabled', async () => {
    delete process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
    mutableEnvironment.NODE_ENV = 'test';
    readCurrentPublicRepairCatalogueSnapshot.mockResolvedValue(null);
    const remoteFetch = vi.fn(() => { throw new Error('POS should not be configured in this test'); });
    vi.stubGlobal('fetch', remoteFetch);

    const catalogue = await fetchRepairCatalog();

    expect(readCurrentPublicRepairCatalogueSnapshot).toHaveBeenCalledTimes(1);
    expect(catalogue.catalogueSource).toBe('development-fallback');
    expect(remoteFetch).not.toHaveBeenCalled();
  });

  describe('read-only snapshot catalogue mode', () => {
    const sampleBrands = [
      {
        category: 'phone',
        brand: 'Apple',
        slug: 'apple',
        icon: '📱',
        models: [
          {
            model: 'iPhone 15',
            slug: 'iphone-15',
            repairTypes: [
              { slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'synthetic-core' as const },
            ],
          },
        ],
      },
      {
        category: 'tablet',
        brand: 'iPad',
        slug: 'ipad',
        icon: '📱',
        models: [
          {
            model: 'iPad Pro',
            slug: 'ipad-pro',
            repairTypes: [
              { slug: 'screen-replacement', name: 'Screen Replacement', price: 299, repairOrigin: 'synthetic-core' as const },
            ],
          },
        ],
      },
      {
        category: 'laptop',
        brand: 'MacBook',
        slug: 'macbook',
        icon: '💻',
        models: [
          {
            model: 'MacBook Air',
            slug: 'macbook-air',
            repairTypes: [
              { slug: 'screen-replacement', name: 'Screen Replacement', price: 399, repairOrigin: 'synthetic-core' as const },
            ],
          },
        ],
      },
      {
        category: 'watch',
        brand: 'Apple Watch',
        slug: 'apple-watch',
        icon: '⌚',
        models: [
          {
            model: 'Apple Watch Series 9',
            slug: 'apple-watch-series-9',
            repairTypes: [
              { slug: 'screen-replacement', name: 'Screen Replacement', price: 149, repairOrigin: 'synthetic-core' as const },
            ],
          },
        ],
      },
    ];
    const samplePayload = serializePublicRepairCatalogue(sampleBrands);
    const sampleSnapshot = {
      schemaVersion: 2,
      payload: samplePayload,
      checksum: checksumPublicRepairCatalogue(samplePayload),
      fetchedAt: '2026-07-16T00:00:00.000Z',
      validatedAt: '2026-07-16T00:00:00.000Z',
      inventoryRowCount: 4,
      publicModelCount: 4,
      publicRepairCount: 4,
    };

    it('reads the snapshot directly and overrides ALI_MOBILE_LOCAL_CATALOG_ONLY=true', async () => {
      process.env.ALI_MOBILE_READ_ONLY_SNAPSHOT_CATALOG = 'true';
      process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
      mutableEnvironment.NODE_ENV = 'development';
      readCurrentPublicRepairCatalogueSnapshot.mockResolvedValue(sampleSnapshot);
      const remoteFetch = vi.fn(() => { throw new Error('POS must not run'); });
      vi.stubGlobal('fetch', remoteFetch);

      const catalogue = await fetchRepairCatalog();

      expect(readCurrentPublicRepairCatalogueSnapshot).toHaveBeenCalledTimes(1);
      expect(catalogue.catalogueSource).toBe('last-known-good');
      expect(catalogue.brands.find((brand) => brand.slug === 'apple')?.models).toContainEqual(expect.objectContaining({ slug: 'iphone-15' }));
      // Ensure synthetic fixture's Huawei model is absent
      expect(catalogue.brands.find((brand) => brand.slug === 'huawei')).toBeUndefined();
      expect(writeCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
      expect(remoteFetch).not.toHaveBeenCalled();
    });

    it('rejects read-only snapshot mode in production before doing work', async () => {
      process.env.ALI_MOBILE_READ_ONLY_SNAPSHOT_CATALOG = 'true';
      mutableEnvironment.NODE_ENV = 'production';
      const remoteFetch = vi.fn(() => { throw new Error('POS must not run'); });
      vi.stubGlobal('fetch', remoteFetch);

      await expect(fetchRepairCatalog()).rejects.toThrow('Local read-only snapshot catalogue mode cannot be enabled in production.');

      expect(readCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
      expect(writeCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
      expect(remoteFetch).not.toHaveBeenCalled();
    });

    it('fails closed when snapshot is missing in snapshot-only mode', async () => {
      process.env.ALI_MOBILE_READ_ONLY_SNAPSHOT_CATALOG = 'true';
      mutableEnvironment.NODE_ENV = 'development';
      readCurrentPublicRepairCatalogueSnapshot.mockResolvedValue(null);
      const remoteFetch = vi.fn(() => { throw new Error('POS must not run'); });
      vi.stubGlobal('fetch', remoteFetch);

      await expect(fetchRepairCatalog()).rejects.toThrow('Snapshot-only catalogue resolution failed: durable snapshot not found in storage.');

      expect(writeCurrentPublicRepairCatalogueSnapshot).not.toHaveBeenCalled();
      expect(remoteFetch).not.toHaveBeenCalled();
    });
  });
});
