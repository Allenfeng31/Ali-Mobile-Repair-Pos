import { fetchRepairCatalog } from '@/lib/api';
import VirtualPhoneRepairLandingPage from '@/components/services/VirtualPhoneRepairLandingPage';
import {
  buildGenericPeripheralRepairHierarchyModels,
  resolveGenericPeripheralRepairHierarchySelection,
} from '@/lib/genericPeripheralRepairHierarchy';
import { createVirtualPhoneRepairMetadata } from '@/lib/virtualPhoneRepairRoute';

const PAGE_PATH = '/repairs/phone/volume-button-replacement';
const GENERIC_EXCLUDED_BRANDS = new Set(['iphone', 'apple', 'samsung', 'google-pixel', 'oppo']);

export const metadata = createVirtualPhoneRepairMetadata('other', 'volume-button-replacement');

type VolumeButtonSearchParams = Readonly<{
  brand?: string | readonly string[];
  model?: string | readonly string[];
  service?: string | readonly string[];
}>;

export default async function Page({ searchParams }: { searchParams: Promise<VolumeButtonSearchParams> }) {
  const catalog = await fetchRepairCatalog();
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && !GENERIC_EXCLUDED_BRANDS.has(brand.slug))
    .flatMap((brand) => brand.models.map((model) => ({
      canonicalBrandSlug: brand.slug,
      modelSlug: model.slug,
      displayBrand: brand.brand,
      displayModel: model.model,
      repair: model.repairTypes.find((repair) => repair.slug === 'volume-button-replacement'),
    })))
    .sort((left, right) => left.displayBrand.localeCompare(right.displayBrand, undefined, { sensitivity: 'base' })
      || left.displayModel.localeCompare(right.displayModel, undefined, { numeric: true, sensitivity: 'base' }));
  const bookingService = 'Volume Button Replacement';
  const hierarchyModels = buildGenericPeripheralRepairHierarchyModels({ repairSlug: 'volume-button-replacement', bookingService, candidates });
  const selection = resolveGenericPeripheralRepairHierarchySelection({ repairSlug: 'volume-button-replacement', bookingService, candidates, query: await searchParams });

  return <VirtualPhoneRepairLandingPage
    repairSlug="volume-button-replacement"
    canonicalPath={PAGE_PATH}
    models={candidates.map(({ displayBrand, canonicalBrandSlug, displayModel, modelSlug }) => ({ brand: displayBrand, brandSlug: canonicalBrandSlug, model: displayModel, modelSlug }))}
    isGeneric
    hierarchy={{ models: hierarchyModels, ...selection }}
  />;
}
