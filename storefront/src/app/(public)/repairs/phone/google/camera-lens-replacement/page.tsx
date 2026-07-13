import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";

const PAGE_PATH = "/repairs/phone/google/camera-lens-replacement";

export const metadata: Metadata = {
  title: "Google Pixel Camera Lens Replacement in Ringwood | Ali Mobile",
  description: "Google Pixel outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $65 repair.",
  alternates: { canonical: PAGE_PATH },
};

export default async function GoogleCameraLensReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find((entry) => entry.category === "phone" && entry.slug === "google-pixel");
  const models = buildCameraLensModelOptions((brand?.models ?? []).map((model) => ({
    brand: "Google Pixel",
    brandSlug: "google-pixel",
    model: model.model,
    modelSlug: model.slug,
  })));

  return (
    <CameraLensLandingPage
      brandName="Google Pixel"
      brandSlug="google-pixel"
      title="Google Pixel Camera Lens Replacement in Ringwood"
      intro="Camera lens glass replacement for supported Google Pixel models at Ali Mobile & Repair in Ringwood. The listed service is $65, with final fitment confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
    />
  );
}
