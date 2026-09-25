import type { Metadata } from 'next';
import { fetchRepairCatalog } from '@/lib/api';
import { fetchSharedRepairPageResultSeeds } from '@/lib/repair-results.server';
import CameraModuleRepairLandingPage, { type CameraModuleRepairLandingConfig } from '@/components/services/CameraModuleRepairLandingPage';
import { compareDeterministicStrings } from '@/lib/deterministicStrings';
import {
  buildCameraModuleRepairHierarchyModels,
  resolveCameraModuleRepairHierarchySelection,
} from '@/lib/cameraModuleRepairHierarchy';

const PAGE_PATH = '/repairs/phone/back-camera-replacement';
const GENERIC_EXCLUDED_BRANDS = new Set(['iphone', 'apple', 'samsung', 'google-pixel', 'oppo']);

export const metadata: Metadata = {
  title: 'Phone Back Camera Repair Melbourne | Ali Mobile',
  description: 'Back camera repair and replacement in Melbourne for blurry, shaking or unfocused cameras. Choose your model or request a Custom Quote before work begins.',
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Phone Back Camera Repair Melbourne | Ali Mobile',
    description: 'Back camera repair and replacement in Melbourne for blurry, shaking or unfocused cameras. Choose your model or request a Custom Quote before work begins.',
    url: PAGE_PATH,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Phone Back Camera Repair Melbourne | Ali Mobile',
    description: 'Back camera repair and replacement in Melbourne for blurry, shaking or unfocused cameras. Choose your model or request a Custom Quote before work begins.',
  },
};

const config: CameraModuleRepairLandingConfig = {
  repairSlug: 'back-camera-replacement',
  bookingService: 'Back Camera Replacement',
  title: 'Phone Back Camera Repair & Replacement',
  description: 'Back camera module repair for the supported models shown below. We confirm the fault, suitable repair and quote before approved work begins.',
  eyebrow: 'Back camera module assessment',
  symptoms: ['Rear camera not opening or a black preview', 'Blurry photos or focus failure', 'Shaking, vibration or stabilisation symptoms', 'One rear lens or zoom level not working', 'Cracked or damaged outer camera glass'],
  distinctionTitle: 'Back camera module or camera lens glass?',
  distinctionBody: 'Back camera module faults can cause focus failure, shaking, a black preview or blurred images. Cracked outer lens glass with normal photos is a separate camera lens glass repair; we inspect the device before confirming the right path.',
  inspectionBody: 'We check camera output, focus behaviour, housing, connectors and whether impact or liquid exposure points to another internal fault. We only recommend module replacement when it suits the diagnosis; OIS, board and liquid-damage outcomes cannot be guaranteed.',
  relatedHref: '/repairs/phone/camera-lens-replacement',
  relatedLabel: 'Camera lens glass repair',
};

type BackCameraSearchParams = Readonly<{
  brand?: string | readonly string[];
  model?: string | readonly string[];
  service?: string | readonly string[];
}>;

export default async function BackCameraReplacementPage({
  searchParams,
}: {
  searchParams: Promise<BackCameraSearchParams>;
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
