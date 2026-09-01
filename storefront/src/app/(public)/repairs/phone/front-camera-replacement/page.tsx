import type { Metadata } from 'next';
import { fetchRepairCatalog } from '@/lib/api';
import CameraModuleRepairLandingPage, { type CameraModuleRepairLandingConfig } from '@/components/services/CameraModuleRepairLandingPage';
import { compareDeterministicStrings } from '@/lib/deterministicStrings';

const PAGE_PATH = '/repairs/phone/front-camera-replacement';

export const metadata: Metadata = {
  title: 'Phone Front Camera Replacement in Ringwood | Ali Mobile',
  description: 'Front camera module assessment for blurry selfies, black previews and focus faults. We inspect the model and issue before confirming a repair quote.',
  alternates: { canonical: PAGE_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Phone Front Camera Replacement in Ringwood | Ali Mobile',
    description: 'Front camera module assessment for blurry selfies, black previews and focus faults. We inspect the model and issue before confirming a repair quote.',
    url: PAGE_PATH,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Phone Front Camera Replacement in Ringwood | Ali Mobile',
    description: 'Front camera module assessment for blurry selfies, black previews and focus faults. We inspect the model and issue before confirming a repair quote.',
  },
};

const config: CameraModuleRepairLandingConfig = {
  repairSlug: 'front-camera-replacement',
  bookingService: 'Front Camera Replacement',
  title: 'Phone Front Camera Replacement in Ringwood',
  description: 'Assessment-led front camera module repair for supported non-iPhone phones. We confirm the fault, repair scope and quote after inspection.',
  eyebrow: 'Front camera module assessment',
  symptoms: ['Blurry or poor-quality selfies', 'Front camera not opening or a black preview', 'Focus or exposure problems', 'Camera damage after a drop or moisture exposure', 'Front camera module assessment or replacement'],
  distinctionTitle: 'Front camera module, not screen or biometric repair',
  distinctionBody: 'A front camera module fault is different from a screen repair. Camera repair does not guarantee Face ID, facial recognition or other biometric functions; related top-sensor, connector or board faults need separate assessment.',
  inspectionBody: 'We check the camera behaviour, connectors, liquid exposure and related components before confirming whether a module replacement is suitable. The final quote depends on inspection, model and parts availability.',
};

export default async function FrontCameraReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const candidates = catalog.brands
    .filter((brand) => brand.category === 'phone' && brand.slug !== 'iphone' && brand.slug !== 'apple')
    .flatMap((brand) => brand.models
      .filter((model) => model.repairTypes.some((repair) => repair.slug === config.repairSlug))
      .map((model) => ({ canonicalBrandSlug: brand.slug, modelSlug: model.slug, displayBrand: brand.brand, displayModel: model.model })))
    .sort((left, right) => compareDeterministicStrings(`${left.canonicalBrandSlug}/${left.modelSlug}`, `${right.canonicalBrandSlug}/${right.modelSlug}`));

  return <CameraModuleRepairLandingPage config={config} canonicalPath={PAGE_PATH} candidates={candidates} />;
}
