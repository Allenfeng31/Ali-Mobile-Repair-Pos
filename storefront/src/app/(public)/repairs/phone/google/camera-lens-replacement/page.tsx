import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage, { resolveCameraLensSelectedDevice } from "@/components/services/CameraLensLandingPage";
import { fetchSharedRepairPageResultSeeds } from "@/lib/repair-results.server";
import { buildSharedRepairPageCandidates, buildSharedRepairPageSupportedModels } from "@/lib/sharedRepairPageV2";
import { getCameraLensPrice } from "@/lib/virtualCameraLens";

const PAGE_PATH = "/repairs/phone/google/camera-lens-replacement";
const PAGE_TITLE = "Google Pixel Camera Lens Replacement in Ringwood | Ali Mobile";
const GOOGLE_CAMERA_LENS_FIXED_PRICE = getCameraLensPrice("Google Pixel");
const PAGE_DESCRIPTION = `Google Pixel outer camera lens glass replacement in Ringwood for $${GOOGLE_CAMERA_LENS_FIXED_PRICE}. We inspect model fitment before work begins.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

export default async function GoogleCameraLensReplacementPage({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
  const catalog = await fetchRepairCatalog();
  const supportedModels = buildSharedRepairPageSupportedModels({
    brands: catalog.brands,
    canonicalBrandSlug: "google-pixel",
    repairSlug: "camera-lens-replacement",
  });
  const priceCandidates = buildSharedRepairPageCandidates({
    brands: catalog.brands,
    canonicalBrandSlug: "google-pixel",
    repairSlug: "camera-lens-replacement",
  });
  const selection = resolveCameraLensSelectedDevice({
    route: { scope: "brand", canonicalBrandSlug: "google-pixel", routeBrandSegment: "google" },
    models: supportedModels,
    query: await searchParams,
  });
  const selectedModelSlug = selection.selectedModelSlug;
  const initialResults = await fetchSharedRepairPageResultSeeds({
    category: "phone",
    brandSlug: "google-pixel",
    repairTypeSlug: "camera-lens-replacement",
    selectedModelSlug,
  });

  return (
    <CameraLensLandingPage
      brandName="Google Pixel"
      brandSlug="google-pixel"
      title="Google Pixel Camera Lens Replacement"
      intro="Camera lens glass replacement for supported Google Pixel models at Ali Mobile & Repair in Ringwood. We inspect model fitment before confirming the suitable repair path."
      canonicalPath={PAGE_PATH}
      models={supportedModels}
      selectedDevice={selection.selectedDevice}
      sharedPageV2={{
        supportedModels,
        priceCandidates,
        initialResults,
        selectedModelSlug,
        quickAnswers: {
          repairTime: "Contact us to confirm repair time.",
          partsSameDay: "Call to confirm parts availability.",
          warranty: "Warranty applies to eligible standard repairs and the completed repair scope.",
        },
        pricingStrategy: { mode: "fixed", fixedPrice: GOOGLE_CAMERA_LENS_FIXED_PRICE },
      }}
    />
  );
}
