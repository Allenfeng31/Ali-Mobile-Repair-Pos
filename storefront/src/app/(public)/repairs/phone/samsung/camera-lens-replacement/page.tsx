import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";

const PAGE_PATH = "/repairs/phone/samsung/camera-lens-replacement";

export const metadata: Metadata = {
  title: "Samsung Camera Lens Replacement in Ringwood | Ali Mobile",
  description: "Samsung outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $50 repair.",
  alternates: { canonical: PAGE_PATH },
};

export default async function SamsungCameraLensReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find((entry) => entry.category === "phone" && entry.slug === "samsung");
  const models = buildCameraLensModelOptions((brand?.models ?? []).map((model) => ({
    brand: "Samsung",
    brandSlug: "samsung",
    model: model.model,
    modelSlug: model.slug,
  })));

  return (
    <CameraLensLandingPage
      brandName="Samsung"
      brandSlug="samsung"
      title="Samsung Camera Lens Replacement in Ringwood"
      intro="Camera lens glass replacement for supported Samsung models at Ali Mobile & Repair in Ringwood. The listed service is $50, with final fitment confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
    />
  );
}
