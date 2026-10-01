import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage, { resolveCameraLensSelectedDevice } from "@/components/services/CameraLensLandingPage";
import { fetchSharedRepairPageResultSeeds } from "@/lib/repair-results.server";
import { buildSharedRepairPageCandidates, buildSharedRepairPageSupportedModels } from "@/lib/sharedRepairPageV2";
import { getCameraLensPrice } from "@/lib/virtualCameraLens";
import { OPPO_CAMERA_LENS_CONTENT } from '@/data/oppoSharedRepairContent';

const PAGE_PATH = "/repairs/phone/oppo/camera-lens-replacement";
const PAGE_TITLE = OPPO_CAMERA_LENS_CONTENT.title;
const PAGE_DESCRIPTION = OPPO_CAMERA_LENS_CONTENT.metadataDescription;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

export default async function OppoCameraLensReplacementPage({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
  const catalog = await fetchRepairCatalog();
  const models = buildSharedRepairPageSupportedModels({ brands: catalog.brands, canonicalBrandSlug: "oppo", repairSlug: "camera-lens-replacement" });
  const priceCandidates = buildSharedRepairPageCandidates({ brands: catalog.brands, canonicalBrandSlug: "oppo", repairSlug: "camera-lens-replacement" });
  const selection = resolveCameraLensSelectedDevice({
    route: { scope: "brand", canonicalBrandSlug: "oppo", routeBrandSegment: "oppo" },
    models,
    query: await searchParams,
  });
  const initialResults = await fetchSharedRepairPageResultSeeds({ category: "phone", brandSlug: "oppo", repairTypeSlug: "camera-lens-replacement", selectedModelSlug: selection.selectedModelSlug });

  return (
    <CameraLensLandingPage
      brandName="OPPO"
      brandSlug="oppo"
      title="OPPO Camera Lens Replacement"
      intro={OPPO_CAMERA_LENS_CONTENT.intro}
      canonicalPath={PAGE_PATH}
      models={models}
      selectedDevice={selection.selectedDevice}
      sharedPageV2={{
        supportedModels: models,
        priceCandidates,
        initialResults: initialResults ?? [],
        selectedModelSlug: selection.selectedModelSlug,
        quickAnswers: { repairTime: "Contact us to confirm repair time.", partsSameDay: "Call to confirm parts availability.", warranty: "Warranty applies to eligible standard repairs and the completed repair scope." },
        pricingStrategy: { mode: "fixed", fixedPrice: getCameraLensPrice("OPPO") },
      }}
    />
  );
}
