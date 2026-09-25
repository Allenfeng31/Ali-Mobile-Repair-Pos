import type { Metadata } from 'next';
import { fetchRepairCatalog } from '@/lib/api';
import { fetchSharedRepairPageResultSeeds } from '@/lib/repair-results.server';
import CameraModuleRepairLandingPage, { type CameraModuleRepairLandingConfig } from '@/components/services/CameraModuleRepairLandingPage';
import { compareDeterministicStrings } from '@/lib/deterministicStrings';
import {
  buildCameraModuleRepairHierarchyModels,
  resolveCameraModuleRepairHierarchySelection,
} from '@/lib/cameraModuleRepairHierarchy';

const PAGE_PATH = '/repairs/phone/front-camera-replacement';
const GENERIC_EXCLUDED_BRANDS = new Set(['iphone', 'apple', 'samsung', 'google-pixel', 'oppo']);

export const metadata: Metadata = {
  title: 'Phone Front Camera Repair Melbourne | Ali Mobile',
  description: 'Front camera repair and replacement in Melbourne for supported phones. Choose your model for an exact price, From price or Custom Quote before work begins.',
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Phone Front Camera Repair Melbourne | Ali Mobile',
    description: 'Front camera repair and replacement in Melbourne for supported phones. Choose your model for an exact price, From price or Custom Quote before work begins.',
    url: PAGE_PATH,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Phone Front Camera Repair Melbourne | Ali Mobile',
    description: 'Front camera repair and replacement in Melbourne for supported phones. Choose your model for an exact price, From price or Custom Quote before work begins.',
  },
};

const config: CameraModuleRepairLandingConfig = {
  repairSlug: 'front-camera-replacement',
  bookingService: 'Front Camera Replacement',
  title: 'Phone Front Camera Repair & Replacement',
  description: 'Front camera module repair for the supported models shown below. We confirm the fault, suitable repair and quote before approved work begins.',
  eyebrow: 'Front camera module assessment',
  symptoms: ['Blurry or poor-quality selfies', 'Front camera not opening or a black preview', 'Focus or exposure problems', 'Front camera preview flickering or freezing', 'Front camera working in one app but not another'],
  distinctionTitle: 'Front camera module, not screen or biometric repair',
  distinctionBody: 'A front camera module fault is different from a screen repair. On supported non-iPhone models, repair limited to the camera module does not normally affect standard face unlock, but it does not guarantee every biometric fault will be fixed. Sensors, calibration, connectors and other hardware can require separate assessment.',
  inspectionBody: 'We check camera behaviour, connectors and related components, including whether impact or liquid exposure points to another fault. We only recommend module replacement when it suits the diagnosis; the final quote depends on the model, inspection and parts availability.',
};

type FrontCameraSearchParams = Readonly<{
  brand?: string | readonly string[];
  model?: string | readonly string[];
  service?: string | readonly string[];
}>;

export default async function FrontCameraReplacementPage({
  searchParams,
}: {
  searchParams: Promise<FrontCameraSearchParams>;
}) {
  const catalog = await fetchRepairCatalog();
  const query = await searchParams;
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && !GENERIC_EXCLUDED_BRANDS.has(brand.slug))
    .flatMap((brand) => brand.models
      .flatMap((model) => {
        const repair = model.repairTypes.find((entry) => entry.slug === config.repairSlug);
        return [{ canonicalBrandSlug: brand.slug, modelSlug: model.slug, displayBrand: brand.brand, displayModel: model.model, repair }];
      }))
    .sort((left, right) => compareDeterministicStrings(`${left.canonicalBrandSlug}/${left.modelSlug}`, `${right.canonicalBrandSlug}/${right.modelSlug}`));

  const hierarchyModels = buildCameraModuleRepairHierarchyModels({
    repairSlug: config.repairSlug,
    bookingService: config.bookingService,
    candidates,
  });
  const selection = resolveCameraModuleRepairHierarchySelection({
    repairSlug: config.repairSlug,
    bookingService: config.bookingService,
    candidates,
    query,
  });
  const initialResults = Array.from(new Map((await Promise.all(Array.from(new Set(candidates.map((candidate) => candidate.canonicalBrandSlug))).map((brandSlug) => fetchSharedRepairPageResultSeeds({
    category: 'phone', brandSlug, repairTypeSlug: config.repairSlug,
    selectedModelSlug: selection.selectedBrandSlug === brandSlug ? selection.selectedModelSlug : null,
  })))).flat().map((result) => [result.id, result])).values());
  const landingCandidates = candidates.map((candidate) => ({
    canonicalBrandSlug: candidate.canonicalBrandSlug,
    modelSlug: candidate.modelSlug,
    displayBrand: candidate.displayBrand,
    displayModel: candidate.displayModel,
  }));

  return <CameraModuleRepairLandingPage
    config={config}
    canonicalPath={PAGE_PATH}
    candidates={landingCandidates}
    initialResults={initialResults}
    hierarchy={{ models: hierarchyModels, ...selection }}
  />;
}
