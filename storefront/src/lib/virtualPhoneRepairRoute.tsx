import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import VirtualPhoneRepairLandingPage from "@/components/services/VirtualPhoneRepairLandingPage";
import {
  buildVirtualPhoneRepairModelOptions,
  getVirtualPhoneRepair,
  type VirtualPhoneRepairSlug,
} from "@/lib/virtualPhoneRepairs";

type VirtualPhoneRepairRouteBrand = "samsung" | "google" | "oppo" | "other";

const BRAND_CONFIG = {
  samsung: { brandName: "Samsung", catalogSlug: "samsung", routeSegment: "samsung" },
  google: { brandName: "Google Pixel", catalogSlug: "google-pixel", routeSegment: "google" },
  oppo: { brandName: "OPPO", catalogSlug: "oppo", routeSegment: "oppo" },
} as const;
const GENERIC_EXCLUDED_BRANDS = new Set(["iphone", "apple", "samsung", "google-pixel", "oppo"]);

export function createVirtualPhoneRepairMetadata(brand: VirtualPhoneRepairRouteBrand, repairSlug: VirtualPhoneRepairSlug): Metadata {
  const repair = getVirtualPhoneRepair(repairSlug)!;
  const config = brand === "other" ? null : BRAND_CONFIG[brand];
  const label = config?.brandName ?? "Phone";
  const canonical = `/repairs/phone/${config ? `${config.routeSegment}/` : ""}${repair.slug}`;

  return {
    title: `${label} ${repair.name} in Ringwood | Ali Mobile`,
    description: `${label} ${repair.name.toLowerCase()} in Ringwood for common symptoms. Starting from $50, with inspection and a clear quote before work begins.`,
    alternates: { canonical },
  };
}

interface VirtualPhoneRepairRoutePageProps {
  brand: VirtualPhoneRepairRouteBrand;
  repairSlug: VirtualPhoneRepairSlug;
}

export default async function VirtualPhoneRepairRoutePage({ brand, repairSlug }: VirtualPhoneRepairRoutePageProps) {
  const repair = getVirtualPhoneRepair(repairSlug)!;
  const catalog = await fetchRepairCatalog();
  const config = brand === "other" ? null : BRAND_CONFIG[brand];
  const models = buildVirtualPhoneRepairModelOptions(
    (config
      ? (catalog.brands.find((entry) => entry.category === "phone" && entry.slug === config.catalogSlug)?.models ?? []).map((model) => ({
          brand: config.brandName,
          brandSlug: config.catalogSlug,
          model: model.model,
          modelSlug: model.slug,
        }))
      : catalog.brands
          .filter((entry) => entry.category === "phone" && !GENERIC_EXCLUDED_BRANDS.has(entry.slug))
          .flatMap((entry) => entry.models.map((model) => ({ brand: entry.brand, brandSlug: entry.slug, model: model.model, modelSlug: model.slug })))
    )
  );
  const canonicalPath = `/repairs/phone/${config ? `${config.routeSegment}/` : ""}${repair.slug}`;

  return <VirtualPhoneRepairLandingPage brandName={config?.brandName} brandSlug={config?.catalogSlug} repairSlug={repair.slug} canonicalPath={canonicalPath} models={models} isGeneric={!config} />;
}
