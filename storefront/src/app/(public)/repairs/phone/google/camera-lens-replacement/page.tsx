import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";
import { getGooglePixelHardwareConfig } from "@/lib/seo/content/google-pixel/config";

const PAGE_PATH = "/repairs/phone/google/camera-lens-replacement";
const PAGE_TITLE = "Google Pixel Camera Lens Replacement in Ringwood | Ali Mobile";
const PAGE_DESCRIPTION = "Google Pixel outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $50 starting price.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

export default async function GoogleCameraLensReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find((entry) => entry.category === "phone" && entry.slug === "google-pixel");
  const models = buildCameraLensModelOptions((brand?.models ?? []).filter((model) => getGooglePixelHardwareConfig(model.slug)).map((model) => ({
    brand: "Google Pixel",
    brandSlug: "google-pixel",
    model: model.model,
    modelSlug: model.slug,
  })));

  return (
    <CameraLensLandingPage
      brandName="Google Pixel"
      brandSlug="google-pixel"
      title="Google Pixel Camera Lens Replacement"
      intro="Camera lens glass replacement for supported Google Pixel models at Ali Mobile & Repair in Ringwood. Starting from $50, with final fitment confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
      showSharedRepairControls
    />
  );
}
