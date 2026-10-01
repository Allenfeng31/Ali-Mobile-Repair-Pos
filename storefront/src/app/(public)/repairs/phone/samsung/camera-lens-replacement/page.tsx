import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage, { resolveCameraLensSelectedDevice } from "@/components/services/CameraLensLandingPage";
import { fetchSharedRepairPageResultSeeds } from "@/lib/repair-results.server";
import { buildSharedRepairPageCandidates, buildSharedRepairPageSupportedModels } from "@/lib/sharedRepairPageV2";
import { getCameraLensPrice } from "@/lib/virtualCameraLens";
import { SAMSUNG_CAMERA_LENS_CONTENT } from "@/data/samsungSharedRepairContent";

const PAGE_PATH = "/repairs/phone/samsung/camera-lens-replacement";
const PAGE_TITLE = SAMSUNG_CAMERA_LENS_CONTENT.title;
const PAGE_DESCRIPTION = SAMSUNG_CAMERA_LENS_CONTENT.metadataDescription;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

export default async function SamsungCameraLensReplacementPage({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
  const catalog = await fetchRepairCatalog();
  const models = buildSharedRepairPageSupportedModels({ brands: catalog.brands, canonicalBrandSlug: "samsung", repairSlug: "camera-lens-replacement" });
  const priceCandidates = buildSharedRepairPageCandidates({ brands: catalog.brands, canonicalBrandSlug: "samsung", repairSlug: "camera-lens-replacement" });
  const selection = resolveCameraLensSelectedDevice({
    route: { scope: "brand", canonicalBrandSlug: "samsung", routeBrandSegment: "samsung" },
    models,
    query: await searchParams,
  });
  const initialResults = await fetchSharedRepairPageResultSeeds({ category: "phone", brandSlug: "samsung", repairTypeSlug: "camera-lens-replacement", selectedModelSlug: selection.selectedModelSlug });

  return (
    <CameraLensLandingPage
      brandName="Samsung"
      brandSlug="samsung"
      title="Samsung Camera Lens Replacement"
      intro={SAMSUNG_CAMERA_LENS_CONTENT.intro}
      canonicalPath={PAGE_PATH}
      models={models}
      selectedDevice={selection.selectedDevice}
      sharedPageV2={{
        supportedModels: models,
        priceCandidates,
        initialResults: initialResults ?? [],
        selectedModelSlug: selection.selectedModelSlug,
        quickAnswers: { repairTime: "Contact us to confirm repair time.", partsSameDay: "Call to confirm parts availability.", warranty: "Warranty applies to eligible standard repairs and the completed repair scope." },
        pricingStrategy: { mode: "fixed", fixedPrice: getCameraLensPrice("Samsung") },
      }}
    />
  );
}
