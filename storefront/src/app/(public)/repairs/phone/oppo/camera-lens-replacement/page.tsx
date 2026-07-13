import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";

const PAGE_PATH = "/repairs/phone/oppo/camera-lens-replacement";

export const metadata: Metadata = {
  title: "OPPO Camera Lens Replacement in Ringwood | Ali Mobile",
  description: "OPPO outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $50 repair.",
  alternates: { canonical: PAGE_PATH },
};

export default async function OppoCameraLensReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find((entry) => entry.category === "phone" && entry.slug === "oppo");
  const models = buildCameraLensModelOptions((brand?.models ?? []).map((model) => ({
    brand: "OPPO",
    brandSlug: "oppo",
    model: model.model,
    modelSlug: model.slug,
  })));

  return (
    <CameraLensLandingPage
      brandName="OPPO"
      brandSlug="oppo"
      title="OPPO Camera Lens Replacement in Ringwood"
      intro="Camera lens glass replacement for supported OPPO models at Ali Mobile & Repair in Ringwood. The listed service is $50, with final fitment confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
    />
  );
}
