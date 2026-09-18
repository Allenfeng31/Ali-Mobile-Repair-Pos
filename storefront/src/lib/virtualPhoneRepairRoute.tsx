import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import VirtualPhoneRepairLandingPage from "@/components/services/VirtualPhoneRepairLandingPage";
import {
  buildVirtualPhoneRepairModelOptions,
  getVirtualPhoneRepair,
  type VirtualPhoneRepairSlug,
} from "@/lib/virtualPhoneRepairs";
import { getGooglePixelHardwareConfig } from "@/lib/seo/content/google-pixel/config";
import { getOppoModelConfig } from "@/lib/seo/content/oppo/shared";
import { buildSharedRepairPageCandidates, buildSharedRepairPageSupportedModels } from '@/lib/sharedRepairPageV2';
import { fetchSharedRepairPageResultSeeds } from '@/lib/repair-results.server';
import type { SharedRepairPageV2QuickAnswers } from '@/components/services/SharedRepairPageV2BookingControls';

const SAMSUNG_REPAIR_CONTENT: Record<VirtualPhoneRepairSlug, { diagnosis: string; testing: string }> = {
  "loudspeaker-replacement": {
    diagnosis: "Loudspeaker handles ringtone, media and speakerphone audio. Low, distorted or silent output can also relate to blockage, liquid exposure, settings, connections or another hardware fault, so we check the likely cause before recommending a replacement.",
    testing: "After suitable repair, we check media audio, ringtone, speakerphone output and whether distortion or rattle remains.",
  },
  "earpiece-speaker-replacement": {
    diagnosis: "Earpiece speaker is used for ordinary calls near your ear, unlike the loudspeaker used for media, ringtones and speakerphone. Quiet or unclear call audio can also relate to mesh blockage, liquid exposure, software, connections or another hardware issue.",
    testing: "After suitable repair, we check in-call audio, clarity, distortion and the basic functions affected by the repair work.",
  },
  "power-button-replacement": {
    diagnosis: "A power-button symptom can come from the button cap, frame alignment, internal flex, connection, software or another power-related fault. A phone that will not turn on does not automatically need a power-button replacement, so we separate button behaviour from battery, charging and board-level no-power symptoms first.",
    testing: "After suitable repair, we check press response, lock and wake behaviour, power-button function and the basic functions affected by the repair work.",
  },
  "volume-button-replacement": {
    diagnosis: "Volume-button symptoms can come from the external button, frame alignment, internal flex, connection, settings or software. Unusual volume changes do not automatically mean the button needs replacement, so we check physical response alongside settings behaviour first.",
    testing: "After suitable repair, we check volume up, volume down, physical response, on-screen volume response and the basic functions affected by the repair work.",
  },
};

const GOOGLE_PIXEL_REPAIR_CONTENT: Record<VirtualPhoneRepairSlug, { diagnosis: string; testing: string }> = {
  "loudspeaker-replacement": { diagnosis: "Media, ringtone and speakerphone audio can be affected by a blocked grille, settings, liquid exposure, connections or another hardware fault, so we inspect the likely cause before recommending a replacement.", testing: "After suitable repair, we test ringtone, media and speakerphone output for volume, clarity and distortion." },
  "earpiece-speaker-replacement": { diagnosis: "The earpiece is for call audio near your ear and differs from the loudspeaker used for media and speakerphone. We check mesh blockage, call-audio symptoms, connections and other likely causes first.", testing: "After suitable repair, we test in-call audio, clarity and distortion alongside the affected functions." },
  "power-button-replacement": { diagnosis: "A power-button symptom may involve the external button, frame alignment, internal flex, connection, software or another power fault. A no-power phone does not automatically need a button replacement.", testing: "After suitable repair, we test press response, lock and wake behaviour and affected functions; diagnosis determines whether a no-power symptom has another cause." },
  "volume-button-replacement": { diagnosis: "Volume-button symptoms may involve the external buttons, frame alignment, internal flex, settings or software. We assess physical response and on-screen volume behaviour before confirming a repair.", testing: "After suitable repair, we test volume up, volume down, physical response and on-screen volume behaviour." },
};

const OPPO_REPAIR_CONTENT: Record<VirtualPhoneRepairSlug, { diagnosis: string; testing: string }> = {
  "loudspeaker-replacement": { diagnosis: "Media, ringtone and speakerphone audio can be affected by a blocked grille, settings, liquid exposure, connections or another hardware fault, so we inspect the likely cause before recommending a replacement.", testing: "After suitable repair, we test ringtone, media and speakerphone output for volume, clarity and distortion." },
  "earpiece-speaker-replacement": { diagnosis: "The earpiece is for call audio near your ear and differs from the loudspeaker used for media and speakerphone. We check mesh blockage, call-audio symptoms, connections and other likely causes first.", testing: "After suitable repair, we test in-call audio, clarity and distortion alongside the affected functions." },
  "power-button-replacement": { diagnosis: "A power-button symptom may involve the external button, frame alignment, internal flex, connection, software or another power fault. A no-power phone does not automatically need a button replacement.", testing: "After suitable repair, we test press response, lock and wake behaviour and affected functions; diagnosis determines whether a no-power symptom has another cause." },
  "volume-button-replacement": { diagnosis: "Volume-button symptoms may involve the external buttons, frame alignment, internal flex, settings or software. We assess physical response and on-screen volume behaviour before confirming a repair.", testing: "After suitable repair, we test volume up, volume down, physical response and on-screen volume behaviour." },
};

type VirtualPhoneRepairRouteBrand = "samsung" | "google" | "oppo" | "other";

const BRAND_CONFIG = {
  samsung: { brandName: "Samsung", catalogSlug: "samsung", routeSegment: "samsung" },
  google: { brandName: "Google Pixel", catalogSlug: "google-pixel", routeSegment: "google" },
  oppo: { brandName: "OPPO", catalogSlug: "oppo", routeSegment: "oppo" },
} as const;
const GENERIC_EXCLUDED_BRANDS = new Set(["iphone", "apple", "samsung", "google-pixel", "oppo"]);

type GooglePixelSharedPageV2Config = Readonly<{
  quickAnswers: SharedRepairPageV2QuickAnswers;
}>;

export const GOOGLE_PIXEL_SHARED_PAGE_V2_CONFIG: Readonly<Partial<Record<VirtualPhoneRepairSlug, GooglePixelSharedPageV2Config>>> = Object.freeze({
  'loudspeaker-replacement': Object.freeze({
    quickAnswers: Object.freeze({
      repairTime: '30–60 minutes',
      partsSameDay: 'Call to confirm parts availability and same-day repair. Parts usually need to be ordered 1 day in advance.',
      warranty: '6 months warranty',
    }),
  }),
  'earpiece-speaker-replacement': Object.freeze({
    quickAnswers: Object.freeze({
      repairTime: 'Contact us to confirm repair time.',
      partsSameDay: 'Call to confirm parts availability.',
      warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.',
    }),
  }),
});

export function getGooglePixelSharedPageV2Config(repairSlug: VirtualPhoneRepairSlug) {
  return GOOGLE_PIXEL_SHARED_PAGE_V2_CONFIG[repairSlug] ?? null;
}

export function createVirtualPhoneRepairMetadata(brand: VirtualPhoneRepairRouteBrand, repairSlug: VirtualPhoneRepairSlug): Metadata {
  const repair = getVirtualPhoneRepair(repairSlug)!;
  const config = brand === "other" ? null : BRAND_CONFIG[brand];
  const label = config?.brandName ?? "Phone";
  const canonical = `/repairs/phone/${config ? `${config.routeSegment}/` : ""}${repair.slug}`;
  const title = `${label} ${repair.name} in Ringwood | Ali Mobile`;
  const isGooglePixelSharedPageV2 = brand === 'google' && Boolean(getGooglePixelSharedPageV2Config(repairSlug));
  const description = isGooglePixelSharedPageV2
    ? `${label} ${repair.name.toLowerCase()} in Ringwood with model-specific pricing, inspection and a clear quote before work begins.`
    : `${label} ${repair.name.toLowerCase()} in Ringwood for common symptoms. Starting from $50, with inspection and a clear quote before work begins.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

interface VirtualPhoneRepairRoutePageProps {
  brand: VirtualPhoneRepairRouteBrand;
  repairSlug: VirtualPhoneRepairSlug;
  selectedModelSlug?: string | null;
}

export default async function VirtualPhoneRepairRoutePage({ brand, repairSlug, selectedModelSlug }: VirtualPhoneRepairRoutePageProps) {
  const repair = getVirtualPhoneRepair(repairSlug)!;
  const catalog = await fetchRepairCatalog();
  const config = brand === "other" ? null : BRAND_CONFIG[brand];
  const candidateModels =
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
    );
  const models = buildVirtualPhoneRepairModelOptions(candidateModels.filter((model) =>
    config?.catalogSlug === "google-pixel" ? Boolean(getGooglePixelHardwareConfig(model.modelSlug)) :
    config?.catalogSlug === "oppo" ? Boolean(getOppoModelConfig(model.modelSlug)) : true
  ));
  const sharedPageV2Config = brand === 'google' ? getGooglePixelSharedPageV2Config(repairSlug) : null;
  const sharedPageV2SupportedModels = sharedPageV2Config
    ? buildSharedRepairPageSupportedModels({
        brands: catalog.brands,
        canonicalBrandSlug: 'google-pixel',
        repairSlug,
      })
    : [];
  const sharedPageV2Candidates = sharedPageV2Config
    ? buildSharedRepairPageCandidates({
        brands: catalog.brands,
        canonicalBrandSlug: 'google-pixel',
        repairSlug,
      })
    : [];
  const selectedSharedPageV2ModelSlug = sharedPageV2SupportedModels.some((model) => model.modelSlug === selectedModelSlug)
    ? selectedModelSlug ?? null
    : null;
  const sharedPageV2Results = sharedPageV2Config
    ? await fetchSharedRepairPageResultSeeds({
        category: 'phone',
        brandSlug: 'google-pixel',
        repairTypeSlug: repairSlug,
        selectedModelSlug: selectedSharedPageV2ModelSlug,
      })
    : [];
  const canonicalPath = `/repairs/phone/${config ? `${config.routeSegment}/` : ""}${repair.slug}`;

  const sharedContent = brand === "samsung" ? SAMSUNG_REPAIR_CONTENT[repairSlug] : brand === "google" ? GOOGLE_PIXEL_REPAIR_CONTENT[repairSlug] : brand === "oppo" ? OPPO_REPAIR_CONTENT[repairSlug] : undefined;
  return <VirtualPhoneRepairLandingPage brandName={config?.brandName} brandSlug={config?.catalogSlug} repairSlug={repair.slug} canonicalPath={canonicalPath} models={models} isGeneric={!config} sharedContent={sharedContent} sharedPageV2={sharedPageV2Config ? { supportedModels: sharedPageV2SupportedModels, priceCandidates: sharedPageV2Candidates, initialResults: sharedPageV2Results, selectedModelSlug: selectedSharedPageV2ModelSlug, quickAnswers: sharedPageV2Config.quickAnswers } : undefined} />;
}
