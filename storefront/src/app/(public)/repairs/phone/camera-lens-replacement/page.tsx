import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import CameraLensLandingPage, { resolveCameraLensSelectedDevice } from "@/components/services/CameraLensLandingPage";
import { buildCameraLensModelOptions } from "@/lib/virtualCameraLens";
import { fetchSharedRepairPageResultSeeds } from "@/lib/repair-results.server";

const PAGE_PATH = "/repairs/phone/camera-lens-replacement";
const EXCLUDED_BRANDS = new Set(["iphone", "samsung", "google-pixel", "oppo"]);
const PAGE_TITLE = "Phone Camera Lens Replacement in Ringwood | Ali Mobile";
const PAGE_DESCRIPTION = "Eligible external phone camera lens glass replacement is $50 in Ringwood. Camera-module, housing or additional damage requires assessment and a separate quote.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_PATH },
  twitter: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
};

export default async function GenericCameraLensReplacementPage({ searchParams }: { searchParams: Promise<{ brand?: string | string[]; model?: string | string[]; service?: string | string[] }> }) {
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
  const selection = resolveCameraLensSelectedDevice({ route: { scope: "global" }, models, query: await searchParams });
  const selectedBrandSlug = selection.selectedDevice?.selectedDevice.brandSlug ?? null;
  const initialResults = selectedBrandSlug && selection.selectedModelSlug
    ? await fetchSharedRepairPageResultSeeds({
        category: 'phone',
        brandSlug: selectedBrandSlug,
        repairTypeSlug: 'camera-lens-replacement',
        selectedModelSlug: selection.selectedModelSlug,
      })
    : [];

  return (
    <CameraLensLandingPage
      title="Phone Camera Lens Replacement in Ringwood"
      intro={PAGE_DESCRIPTION}
      canonicalPath={PAGE_PATH}
      models={models}
      isGeneric
      selectedDevice={selection.selectedDevice}
      initialResults={initialResults}
      selectedModelSlug={selection.selectedModelSlug}
    />
  );
}
