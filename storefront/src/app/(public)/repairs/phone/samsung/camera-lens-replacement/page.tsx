import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";

const PAGE_PATH = "/repairs/phone/samsung/camera-lens-replacement";
const PAGE_TITLE = "Samsung Camera Lens Replacement in Ringwood | Ali Mobile";
const PAGE_DESCRIPTION = "Samsung outer camera lens glass replacement in Ringwood. We inspect model fitment before confirming the listed $50 repair.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH, type: "website" },
  twitter: { card: "summary_large_image", title: PAGE_TITLE, description: PAGE_DESCRIPTION },
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
      title="Samsung Camera Lens Replacement"
      intro="Camera lens glass replacement for supported Samsung models at Ali Mobile & Repair in Ringwood. The listed service is $50, with final fitment confirmed after inspection."
      canonicalPath={PAGE_PATH}
      models={models}
    />
  );
}
