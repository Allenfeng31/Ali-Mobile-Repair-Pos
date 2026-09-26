import { fetchRepairCatalog } from '@/lib/api';
import VirtualPhoneRepairLandingPage from '@/components/services/VirtualPhoneRepairLandingPage';
import {
  buildGenericPeripheralRepairHierarchyModels,
  resolveGenericPeripheralRepairHierarchySelection,
} from '@/lib/genericPeripheralRepairHierarchy';
import { createVirtualPhoneRepairMetadata } from '@/lib/virtualPhoneRepairRoute';
import { fetchSharedRepairPageResultSeeds } from '@/lib/repair-results.server';

const PAGE_PATH = '/repairs/phone/loudspeaker-replacement';
const GENERIC_EXCLUDED_BRANDS = new Set(['iphone', 'apple', 'samsung', 'google-pixel', 'oppo']);

export const metadata = createVirtualPhoneRepairMetadata("other", "loudspeaker-replacement");

type LoudspeakerSearchParams = Readonly<{
  brand?: string | readonly string[];
  model?: string | readonly string[];
  service?: string | readonly string[];
}>;

export default async function Page({ searchParams }: { searchParams: Promise<LoudspeakerSearchParams> }) {
  const catalog = await fetchRepairCatalog();
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && !GENERIC_EXCLUDED_BRANDS.has(brand.slug))
    .flatMap((brand) => brand.models.map((model) => ({
      canonicalBrandSlug: brand.slug,
      modelSlug: model.slug,
      displayBrand: brand.brand,
      displayModel: model.model,
      repair: model.repairTypes.find((repair) => repair.slug === 'loudspeaker-replacement'),
    })))
    .sort((left, right) => left.displayBrand.localeCompare(right.displayBrand, undefined, { sensitivity: 'base' })
      || left.displayModel.localeCompare(right.displayModel, undefined, { numeric: true, sensitivity: 'base' }));
  const bookingService = 'Loudspeaker Replacement';
  const hierarchyModels = buildGenericPeripheralRepairHierarchyModels({ repairSlug: 'loudspeaker-replacement', bookingService, candidates });
  const selection = resolveGenericPeripheralRepairHierarchySelection({ repairSlug: 'loudspeaker-replacement', bookingService, candidates, query: await searchParams });
  const initialResults = Array.from(new Map((await Promise.all(Array.from(new Set(candidates.map((candidate) => candidate.canonicalBrandSlug))).map((brandSlug) => fetchSharedRepairPageResultSeeds({
    category: 'phone', brandSlug, repairTypeSlug: 'loudspeaker-replacement',
    selectedModelSlug: selection.selectedBrandSlug === brandSlug ? selection.selectedModelSlug : null,
  })))).flat().map((result) => [result.id, result])).values());

  return <VirtualPhoneRepairLandingPage
    repairSlug="loudspeaker-replacement"
    canonicalPath={PAGE_PATH}
    models={candidates.map(({ displayBrand, canonicalBrandSlug, displayModel, modelSlug }) => ({ brand: displayBrand, brandSlug: canonicalBrandSlug, model: displayModel, modelSlug }))}
    isGeneric
    initialResults={initialResults}
    hierarchy={{ models: hierarchyModels, ...selection }}
  />;
}
