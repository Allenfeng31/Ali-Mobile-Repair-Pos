import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";

const PAGE_PATH = "/repairs/phone/camera-lens-replacement";
const EXCLUDED_BRANDS = new Set(["iphone", "samsung", "google-pixel", "oppo"]);

export const metadata: Metadata = {
  title: "Phone Camera Lens Replacement in Ringwood | Ali Mobile",
  description: "Outer phone camera lens glass replacement in Ringwood. We inspect the device and model fitment before providing a clear repair quote.",
  alternates: { canonical: PAGE_PATH },
};

export default async function GenericCameraLensReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const models = buildCameraLensModelOptions(
    catalog.brands
      .filter((brand) => brand.category === "phone" && !EXCLUDED_BRANDS.has(brand.slug))
      .flatMap((brand) =>
        brand.models.map((model) => ({
          brand: brand.brand,
          brandSlug: brand.slug,
          model: model.model,
          modelSlug: model.slug,
        }))
      )
  );

  return (
    <CameraLensLandingPage
      title="Phone Camera Lens Replacement in Ringwood"
      intro="Camera lens glass replacement for supported non-iPhone phone brands at Ali Mobile & Repair in Ringwood. Pricing is confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
      isGeneric
    />
  );
}
