import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";
import { getOppoModelConfig } from "@/lib/seo/content/oppo/shared";

const PAGE_PATH = "/repairs/phone/oppo/camera-lens-replacement";
const PAGE_TITLE = "OPPO Camera Lens Replacement in Ringwood | Ali Mobile";
const PAGE_DESCRIPTION = "OPPO outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $50 repair.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

export default async function OppoCameraLensReplacementPage() {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find((entry) => entry.category === "phone" && entry.slug === "oppo");
  const models = buildCameraLensModelOptions((brand?.models ?? []).filter((model) => getOppoModelConfig(model.slug)).map((model) => ({
    brand: "OPPO",
    brandSlug: "oppo",
    model: model.model,
    modelSlug: model.slug,
  })));

  return (
    <CameraLensLandingPage
      brandName="OPPO"
      brandSlug="oppo"
      title="OPPO Camera Lens Replacement"
      intro="Camera lens glass replacement for supported OPPO models at Ali Mobile & Repair in Ringwood. The listed service is $50, with final fitment confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
      showSharedRepairControls
    />
  );
}
