import type { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";
import VirtualPhoneRepairLandingPage from "@/components/services/VirtualPhoneRepairLandingPage";
import {
  buildVirtualPhoneRepairModelOptions,
  getVirtualPhoneRepair,
  type VirtualPhoneRepairSlug,
} from "@/lib/virtualPhoneRepairs";
import { buildSharedRepairPageCandidates, buildSharedRepairPageSupportedModels, getSharedRepairCandidatePriceLabel, type SharedRepairPageV2PricingStrategy, type SharedRepairPageV2QuickAnswers } from '@/lib/sharedRepairPageV2';
import { fetchSharedRepairPageResultSeeds } from '@/lib/repair-results.server';
import { getSharedRepairBookingHref } from '@/lib/sharedRepairBooking';
import { resolveSharedRepairContext } from '@/lib/sharedRepairContext';
import type { SharedRepairSelectedDeviceViewModel } from '@/components/services/SharedRepairSelectedDevice';
import { SAMSUNG_SHARED_REPAIR_CONTENT } from '@/data/samsungSharedRepairContent';
import { GOOGLE_PIXEL_SHARED_REPAIR_CONTENT } from '@/data/googlePixelSharedRepairContent';
import { OPPO_SHARED_REPAIR_CONTENT } from '@/data/oppoSharedRepairContent';

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

type BrandSharedPageV2Config = Readonly<{
  quickAnswers: SharedRepairPageV2QuickAnswers;
}>;

const CONSERVATIVE_SHARED_REPAIR_QUICK_ANSWERS: SharedRepairPageV2QuickAnswers = Object.freeze({
  repairTime: 'Contact us to confirm repair time.',
  partsSameDay: 'Call to confirm parts availability.',
  warranty: 'Warranty applies to eligible standard repairs and the completed repair scope.',
});

export const GOOGLE_PIXEL_SHARED_PAGE_V2_CONFIG: Readonly<Partial<Record<VirtualPhoneRepairSlug, BrandSharedPageV2Config>>> = Object.freeze({
  'loudspeaker-replacement': Object.freeze({
    quickAnswers: Object.freeze({
      repairTime: '30–60 minutes',
      partsSameDay: 'Call to confirm parts availability and same-day repair. Parts usually need to be ordered 1 day in advance.',
      warranty: '6 months warranty',
    }),
  }),
  'earpiece-speaker-replacement': Object.freeze({
    quickAnswers: CONSERVATIVE_SHARED_REPAIR_QUICK_ANSWERS,
  }),
  'power-button-replacement': Object.freeze({
    quickAnswers: CONSERVATIVE_SHARED_REPAIR_QUICK_ANSWERS,
  }),
  'volume-button-replacement': Object.freeze({
    quickAnswers: CONSERVATIVE_SHARED_REPAIR_QUICK_ANSWERS,
  }),
});

export function getGooglePixelSharedPageV2Config(repairSlug: VirtualPhoneRepairSlug) {
  return GOOGLE_PIXEL_SHARED_PAGE_V2_CONFIG[repairSlug] ?? null;
}

function getBrandSharedPageV2Config(brand: VirtualPhoneRepairRouteBrand, repairSlug: VirtualPhoneRepairSlug) {
  if (brand === 'google') return getGooglePixelSharedPageV2Config(repairSlug);
  if (brand === 'samsung' || brand === 'oppo') {
    return { quickAnswers: CONSERVATIVE_SHARED_REPAIR_QUICK_ANSWERS } satisfies BrandSharedPageV2Config;
  }
  return null;
}

export function createVirtualPhoneRepairMetadata(brand: VirtualPhoneRepairRouteBrand, repairSlug: VirtualPhoneRepairSlug): Metadata {
  const repair = getVirtualPhoneRepair(repairSlug)!;
  const config = brand === "other" ? null : BRAND_CONFIG[brand];
  const label = config?.brandName ?? "Phone";
  const canonical = `/repairs/phone/${config ? `${config.routeSegment}/` : ""}${repair.slug}`;
  const samsungContent = brand === 'samsung' ? SAMSUNG_SHARED_REPAIR_CONTENT[repairSlug] : null;
  const googlePixelContent = brand === 'google' ? GOOGLE_PIXEL_SHARED_REPAIR_CONTENT[repairSlug] : null;
  const oppoContent = brand === 'oppo' ? OPPO_SHARED_REPAIR_CONTENT[repairSlug] : null;
  const brandContent = samsungContent ?? googlePixelContent ?? oppoContent;
  const title = brandContent?.title ?? (config ? `${label} ${repair.name} in Ringwood | Ali Mobile` : `${label} ${repair.name} Melbourne | Ali Mobile`);
  const isBrandSharedPageV2 = Boolean(getBrandSharedPageV2Config(brand, repairSlug));
  const description = brandContent?.metadataDescription ?? (!config
    ? `${label} ${repair.name.toLowerCase()} in Melbourne. Choose a supported model for current repair options and an inspection-led quote before work begins.`
    : isBrandSharedPageV2
    ? `${label} ${repair.name.toLowerCase()} in Ringwood with model-specific pricing, inspection and a clear quote before work begins.`
    : `${label} ${repair.name.toLowerCase()} in Ringwood for common symptoms. Starting from $50, with inspection and a clear quote before work begins.`);

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
  query?: Readonly<{
    brand?: string | readonly string[];
    model?: string | readonly string[];
    service?: string | readonly string[];
  }>;
}

export type VirtualPhoneRepairRouteQuery = NonNullable<VirtualPhoneRepairRoutePageProps['query']>;

export function resolveBrandSharedPageV2Selection({
  brand,
  repairSlug,
  repairName,
  supportedModels,
  query,
}: {
  brand: Exclude<VirtualPhoneRepairRouteBrand, 'other'>;
  repairSlug: VirtualPhoneRepairSlug;
  repairName: string;
  supportedModels: ReturnType<typeof buildSharedRepairPageSupportedModels>;
  query: VirtualPhoneRepairRouteQuery;
}) {
  const config = BRAND_CONFIG[brand];
  const context = resolveSharedRepairContext({
    route: { scope: 'brand', canonicalBrandSlug: config.catalogSlug, routeBrandSegment: config.routeSegment },
    repairSlug,
    bookingService: repairName,
    query,
    candidates: supportedModels.map((model) => ({
      canonicalBrandSlug: model.canonicalBrandSlug,
      modelSlug: model.modelSlug,
      displayBrand: model.brand,
      displayModel: model.model,
    })),
  });
  const selectedModelSlug = context.reason === 'model-context' ? context.modelSlug : null;
  const selectedDevice = context.reason === 'model-context'
    && context.canonicalBrandSlug
    && context.modelSlug
    && context.displayBrand
    && context.displayModel
    ? {
        selectedDevice: {
          brand: context.displayBrand,
          brandSlug: context.canonicalBrandSlug,
          model: context.displayModel,
          modelSlug: context.modelSlug,
        },
        selectedRepair: { name: repairName, serviceSlug: repairSlug },
        booking: {
          href: getSharedRepairBookingHref({
            repairName,
            repairSlug,
            selectedModel: {
              brand: context.displayBrand,
              brandSlug: context.canonicalBrandSlug,
              model: context.displayModel,
              modelSlug: context.modelSlug,
            },
          }),
          isAvailable: true,
        },
      } satisfies SharedRepairSelectedDeviceViewModel
    : null;

  return { context, selectedModelSlug, selectedDevice };
}

export function resolveGooglePixelSharedPageV2Selection(input: Omit<Parameters<typeof resolveBrandSharedPageV2Selection>[0], 'brand'>) {
  return resolveBrandSharedPageV2Selection({ ...input, brand: 'google' });
}

export default async function VirtualPhoneRepairRoutePage({ brand, repairSlug, query = {} }: VirtualPhoneRepairRoutePageProps) {
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
  const models = buildVirtualPhoneRepairModelOptions(candidateModels);
  const sharedPageV2Config = getBrandSharedPageV2Config(brand, repairSlug);
  const sharedPageV2SupportedModels = sharedPageV2Config
    ? buildSharedRepairPageSupportedModels({
        brands: catalog.brands,
        canonicalBrandSlug: config!.catalogSlug,
        repairSlug,
      })
    : [];
  const sharedPageV2Candidates = sharedPageV2Config
    ? buildSharedRepairPageCandidates({
        brands: catalog.brands,
        canonicalBrandSlug: config!.catalogSlug,
        repairSlug,
      })
    : [];
  const sharedPageV2Selection = sharedPageV2Config && config
    ? resolveBrandSharedPageV2Selection({ brand: brand as Exclude<VirtualPhoneRepairRouteBrand, 'other'>, repairSlug, repairName: repair.name, supportedModels: sharedPageV2SupportedModels, query })
    : null;
  const selectedSharedPageV2ModelSlug = sharedPageV2Selection?.selectedModelSlug ?? null;
  const sharedPageV2Results = sharedPageV2Config
    ? await fetchSharedRepairPageResultSeeds({
        category: 'phone',
        brandSlug: config!.catalogSlug,
        repairTypeSlug: repairSlug,
        selectedModelSlug: selectedSharedPageV2ModelSlug,
      })
    : [];
  const sharedPageV2PricingStrategy: SharedRepairPageV2PricingStrategy = { mode: 'pos-derived' };
  const selectedPriceCandidate = sharedPageV2Candidates.find((candidate) => candidate.modelSlug === selectedSharedPageV2ModelSlug);
  const selectedSharedPageV2Device = sharedPageV2Selection?.selectedDevice
    ? {
        ...sharedPageV2Selection.selectedDevice,
        priceLabel: selectedPriceCandidate ? getSharedRepairCandidatePriceLabel(selectedPriceCandidate) : 'Quote on Request',
      }
    : null;
  const canonicalPath = `/repairs/phone/${config ? `${config.routeSegment}/` : ""}${repair.slug}`;

  const sharedContent = brand === "samsung" ? SAMSUNG_REPAIR_CONTENT[repairSlug] : brand === "google" ? GOOGLE_PIXEL_REPAIR_CONTENT[repairSlug] : brand === "oppo" ? OPPO_REPAIR_CONTENT[repairSlug] : undefined;
  return <VirtualPhoneRepairLandingPage brandName={config?.brandName} brandSlug={config?.catalogSlug} repairSlug={repair.slug} canonicalPath={canonicalPath} models={models} isGeneric={!config} sharedContent={sharedContent} sharedPageV2={sharedPageV2Config ? { supportedModels: sharedPageV2SupportedModels, priceCandidates: sharedPageV2Candidates, initialResults: sharedPageV2Results ?? [], selectedModelSlug: selectedSharedPageV2ModelSlug, quickAnswers: sharedPageV2Config.quickAnswers, pricingStrategy: sharedPageV2PricingStrategy } : undefined} hierarchy={selectedSharedPageV2Device ? { models: [], selectedBrandSlug: config?.catalogSlug ?? null, selectedModelSlug: selectedSharedPageV2ModelSlug, selectedDevice: selectedSharedPageV2Device } : undefined} />;
}
