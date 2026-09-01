import type { Metadata } from 'next';
import { fetchRepairCatalog } from '@/lib/api';
import CameraModuleRepairLandingPage, { type CameraModuleRepairLandingConfig } from '@/components/services/CameraModuleRepairLandingPage';
import { compareDeterministicStrings } from '@/lib/deterministicStrings';

const PAGE_PATH = '/repairs/phone/back-camera-replacement';

export const metadata: Metadata = {
  title: 'Phone Back Camera Replacement in Ringwood | Ali Mobile',
  description: 'Back camera module assessment for blurry photos, focus faults, shaking cameras and black previews. We inspect the device before confirming a repair quote.',
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Phone Back Camera Replacement in Ringwood | Ali Mobile',
    description: 'Back camera module assessment for blurry photos, focus faults, shaking cameras and black previews. We inspect the device before confirming a repair quote.',
    url: PAGE_PATH,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Phone Back Camera Replacement in Ringwood | Ali Mobile',
    description: 'Back camera module assessment for blurry photos, focus faults, shaking cameras and black previews. We inspect the device before confirming a repair quote.',
  },
};

const config: CameraModuleRepairLandingConfig = {
  repairSlug: 'back-camera-replacement',
  bookingService: 'Back Camera Replacement',
  title: 'Phone Back Camera Replacement in Ringwood',
  description: 'Assessment-led rear camera module repair for supported non-iPhone phones. We confirm the fault, repair scope and quote after inspection.',
  eyebrow: 'Back camera module assessment',
  symptoms: ['Rear camera not opening or a black preview', 'Blurry photos or focus failure', 'Shaking, vibration or stabilisation symptoms', 'Camera damage after a drop or moisture exposure', 'Back camera module assessment or replacement'],
  distinctionTitle: 'Back camera module or camera lens glass?',
  distinctionBody: 'Back camera module faults can cause focus failure, shaking, a black preview or blurred images. Cracked outer lens glass with normal photos is a separate camera lens glass repair; we inspect the device before confirming the right path.',
  inspectionBody: 'We check camera output, focus behaviour, housing condition, connectors and liquid or board damage before confirming whether a rear camera module repair is suitable. OIS, board and liquid damage outcomes cannot be guaranteed.',
  relatedHref: '/repairs/phone/camera-lens-replacement',
  relatedLabel: 'Camera lens glass repair',
};

export default async function BackCameraReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && brand.slug !== 'iphone' && brand.slug !== 'apple')
    .flatMap((brand) => brand.models
      .filter((model) => model.repairTypes.some((repair) => repair.slug === config.repairSlug))
      .map((model) => ({ canonicalBrandSlug: brand.slug, modelSlug: model.slug, displayBrand: brand.brand, displayModel: model.model })))
    .sort((left, right) => compareDeterministicStrings(`${left.canonicalBrandSlug}/${left.modelSlug}`, `${right.canonicalBrandSlug}/${right.modelSlug}`));

  return <CameraModuleRepairLandingPage config={config} canonicalPath={PAGE_PATH} candidates={candidates} />;
}
