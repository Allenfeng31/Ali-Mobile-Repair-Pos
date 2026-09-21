import { fetchRepairCatalog } from '@/lib/api';
import VirtualPhoneRepairLandingPage from '@/components/services/VirtualPhoneRepairLandingPage';
import {
  buildGenericPeripheralRepairHierarchyModels,
  resolveGenericPeripheralRepairHierarchySelection,
} from '@/lib/genericPeripheralRepairHierarchy';
import { createVirtualPhoneRepairMetadata } from '@/lib/virtualPhoneRepairRoute';

const PAGE_PATH = '/repairs/phone/earpiece-speaker-replacement';
const GENERIC_EXCLUDED_BRANDS = new Set(['iphone', 'apple', 'samsung', 'google-pixel', 'oppo']);

export const metadata = createVirtualPhoneRepairMetadata('other', 'earpiece-speaker-replacement');

type EarpieceSearchParams = Readonly<{
  brand?: string | readonly string[];
  model?: string | readonly string[];
  service?: string | readonly string[];
}>;

export default async function Page({ searchParams }: { searchParams: Promise<EarpieceSearchParams> }) {
  const catalog = await fetchRepairCatalog();
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && !GENERIC_EXCLUDED_BRANDS.has(brand.slug))
    .flatMap((brand) => brand.models.map((model) => ({
      canonicalBrandSlug: brand.slug,
      modelSlug: model.slug,
      displayBrand: brand.brand,
      displayModel: model.model,
      repair: model.repairTypes.find((repair) => repair.slug === 'earpiece-speaker-replacement'),
    })))
    .sort((left, right) => left.displayBrand.localeCompare(right.displayBrand, undefined, { sensitivity: 'base' })
      || left.displayModel.localeCompare(right.displayModel, undefined, { numeric: true, sensitivity: 'base' }));
  const bookingService = 'Earpiece Speaker Replacement';
  const hierarchyModels = buildGenericPeripheralRepairHierarchyModels({ repairSlug: 'earpiece-speaker-replacement', bookingService, candidates });
  const selection = resolveGenericPeripheralRepairHierarchySelection({ repairSlug: 'earpiece-speaker-replacement', bookingService, candidates, query: await searchParams });

  return <VirtualPhoneRepairLandingPage
    repairSlug="earpiece-speaker-replacement"
    canonicalPath={PAGE_PATH}
    models={candidates.map(({ displayBrand, canonicalBrandSlug, displayModel, modelSlug }) => ({ brand: displayBrand, brandSlug: canonicalBrandSlug, model: displayModel, modelSlug }))}
    isGeneric
    hierarchy={{ models: hierarchyModels, ...selection }}
  />;
}
