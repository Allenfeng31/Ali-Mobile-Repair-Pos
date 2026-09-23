import { afterEach, describe, expect, it, vi } from 'vitest';

const readCurrentPublicRepairCatalogueSnapshot = vi.hoisted(() => vi.fn());
const writeCurrentPublicRepairCatalogueSnapshot = vi.hoisted(() => vi.fn());

vi.mock('./publicRepairCatalogueSnapshot.server', () => ({
  readCurrentPublicRepairCatalogueSnapshot,
  writeCurrentPublicRepairCatalogueSnapshot,
}));

import { fetchRepairCatalog } from './api';

const originalLocalOnly = process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
const originalNodeEnv = process.env.NODE_ENV;
const mutableEnvironment = process.env as Record<string, string | undefined>;

function restoreEnvironment() {
  if (originalLocalOnly === undefined) delete process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
  else process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = originalLocalOnly;
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
});
