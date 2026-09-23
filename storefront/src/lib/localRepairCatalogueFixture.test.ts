import { afterEach, describe, expect, it } from 'vitest';

import LoudspeakerPage from '../app/(public)/repairs/phone/loudspeaker-replacement/page';
import VolumeButtonPage from '../app/(public)/repairs/phone/volume-button-replacement/page';
import { getLocalRepairCatalogueFixture } from './localRepairCatalogueFixture';
import { resolveModelHubRepairPageMode } from './modelHubRepairPageMode';
import { validatePublicRepairCatalogue } from './publicRepairCataloguePolicy';
import { resolveSharedRepairContext } from './sharedRepairContext';

const originalLocalOnly = process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
const originalNodeEnv = process.env.NODE_ENV;
const mutableEnvironment = process.env as Record<string, string | undefined>;

type GenericSharedPageProps = {
  models: Array<{ brand: string; brandSlug: string; model: string; modelSlug: string }>;
  hierarchy: { selectedDevice: unknown };
};

type SharedRepairPage = typeof LoudspeakerPage | typeof VolumeButtonPage;

function restoreEnvironment() {
  if (originalLocalOnly === undefined) delete process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY;
  else process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = originalLocalOnly;
  mutableEnvironment.NODE_ENV = originalNodeEnv;
}

async function resolveFixtureModelHubToSharedPage({
  brandSlug,
  modelSlug,
  repairSlug,
  bookingService,
  page,
}: {
  brandSlug: string;
  modelSlug: string;
  repairSlug: 'loudspeaker-replacement' | 'volume-button-replacement';
  bookingService: string;
  page: SharedRepairPage;
}) {
  const catalogue = getLocalRepairCatalogueFixture();
  const brand = catalogue.brands.find((entry) => entry.category === 'phone' && entry.slug === brandSlug);
  const model = brand?.models.find((entry) => entry.slug === modelSlug);
  expect(brand).toBeDefined();
  expect(model).toBeDefined();

  const modelHubResolution = resolveModelHubRepairPageMode({
    category: 'phone',
    brandSlug,
    modelSlug,
    catalogueSource: catalogue.catalogueSource,
    repairTypes: model!.repairTypes,
  });
  const href = modelHubResolution.options.find((repair) => repair.slug === repairSlug)?.href;
  expect(href).toBeDefined();

  const generatedUrl = new URL(href!, 'https://local.test');
  const query = {
    brand: generatedUrl.searchParams.get('brand') ?? undefined,
    model: generatedUrl.searchParams.get('model') ?? undefined,
  };
  expect(query.brand).toBeTruthy();
  expect(query.model).toBeTruthy();

  const element = await page({ searchParams: Promise.resolve(query) });
  const props = element.props as GenericSharedPageProps;
  const context = resolveSharedRepairContext({
    route: { scope: 'global' },
    repairSlug,
    bookingService,
    query,
    candidates: props.models.map((candidate) => ({
      canonicalBrandSlug: candidate.brandSlug,
      displayBrand: candidate.brand,
      modelSlug: candidate.modelSlug,
      displayModel: candidate.model,
    })),
  });

  return { href: href!, query, context, selectedDevice: props.hierarchy.selectedDevice };
}

describe('local repair catalogue fixture', () => {
  afterEach(restoreEnvironment);

  it('is a valid deterministic catalogue with the required selected-device QA models', () => {
    const catalogue = getLocalRepairCatalogueFixture();

    expect(validatePublicRepairCatalogue({ brands: catalogue.brands })).toBeNull();
    expect(catalogue.brands.find((brand) => brand.slug === 'huawei')?.models).toContainEqual(expect.objectContaining({ model: 'P30', slug: 'p30' }));
    expect(catalogue.brands.find((brand) => brand.slug === 'asus')?.models).toContainEqual(expect.objectContaining({ model: 'ROG Phone 5', slug: 'rog-phone-5' }));
  });

  it('carries Huawei P30 Model Hub shared href identities through the production generic routes', async () => {
    process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    mutableEnvironment.NODE_ENV = 'development';

    const loudspeaker = await resolveFixtureModelHubToSharedPage({
      brandSlug: 'huawei', modelSlug: 'p30', repairSlug: 'loudspeaker-replacement',
      bookingService: 'Loudspeaker Replacement', page: LoudspeakerPage,
    });
    expect(loudspeaker.href).toBe('/repairs/phone/loudspeaker-replacement?brand=huawei&model=p30');
    expect(loudspeaker.query).toEqual({ brand: 'huawei', model: 'p30' });
    expect(loudspeaker.context).toMatchObject({
      isValid: true, canonicalBrandSlug: 'huawei', modelSlug: 'p30', displayBrand: 'Huawei', displayModel: 'P30',
    });
    expect(loudspeaker.selectedDevice).toMatchObject({ selectedDevice: { brandSlug: 'huawei', modelSlug: 'p30' } });

    const volume = await resolveFixtureModelHubToSharedPage({
      brandSlug: 'huawei', modelSlug: 'p30', repairSlug: 'volume-button-replacement',
      bookingService: 'Volume Button Replacement', page: VolumeButtonPage,
    });
    expect(volume.href).toBe('/repairs/phone/volume-button-replacement?brand=huawei&model=p30');
    expect(volume.context).toMatchObject({ isValid: true, canonicalBrandSlug: 'huawei', modelSlug: 'p30' });
  });

  it('carries Asus ROG Phone 5 Model Hub Loudspeaker identity through the same production seam', async () => {
    process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY = 'true';
    mutableEnvironment.NODE_ENV = 'development';

    const result = await resolveFixtureModelHubToSharedPage({
      brandSlug: 'asus', modelSlug: 'rog-phone-5', repairSlug: 'loudspeaker-replacement',
      bookingService: 'Loudspeaker Replacement', page: LoudspeakerPage,
    });

    expect(result.href).toBe('/repairs/phone/loudspeaker-replacement?brand=asus&model=rog-phone-5');
    expect(result.query).toEqual({ brand: 'asus', model: 'rog-phone-5' });
    expect(result.context).toMatchObject({
      isValid: true, canonicalBrandSlug: 'asus', modelSlug: 'rog-phone-5', displayBrand: 'Asus', displayModel: 'ROG Phone 5',
    });
    expect(result.selectedDevice).toMatchObject({ selectedDevice: { brandSlug: 'asus', modelSlug: 'rog-phone-5' } });
  });
});
