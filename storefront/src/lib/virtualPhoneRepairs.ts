import { displayBrand, slugify, type GroupedService, type ParsedItem } from "./inventoryUtils";
import type { RepairOption } from "./api";

export const VIRTUAL_PHONE_REPAIRS = [
  {
    slug: "loudspeaker-replacement",
    name: "Loudspeaker Replacement",
    eyebrow: "Phone loudspeaker repair",
    icon: "loudspeaker",
    summary: "Bottom speaker, ringtone and media audio diagnosis for supported phone models.",
    signs: "No ringtone or media sound, muffled output, crackling audio or low speaker volume.",
    diagnosis: "Debris, audio settings or software can resemble a speaker fault, so we inspect the speaker grille and device first.",
  },
  {
    slug: "earpiece-speaker-replacement",
    name: "Earpiece Speaker Replacement",
    eyebrow: "Call speaker repair",
    icon: "earpiece",
    summary: "Call-speaker diagnosis for supported phone models when voices are quiet or unclear.",
    signs: "Cannot hear callers clearly, low call volume, distorted call audio or a crackling earpiece.",
    diagnosis: "The earpiece sits near the top of the phone and is different from the loudspeaker used for media and ringtones; microphone or network issues can cause different symptoms.",
  },
  {
    slug: "power-button-replacement",
    name: "Power Button Replacement",
    eyebrow: "Phone power button repair",
    icon: "power",
    summary: "Inspection-led side power button repair for supported phone models.",
    signs: "A stuck or intermittent power button, a phone that will not wake, lock or respond reliably.",
    diagnosis: "Inspection may identify a button cap, internal flex, frame alignment or software cause before a repair path is confirmed.",
  },
  {
    slug: "volume-button-replacement",
    name: "Volume Button Replacement",
    eyebrow: "Phone volume button repair",
    icon: "volume",
    summary: "Inspection-led volume control repair for supported phone models.",
    signs: "Volume up or down not working, a stuck volume key, no button click or accidental volume changes.",
    diagnosis: "We inspect both volume buttons. Frame damage or an internal flex issue can require additional assessment before a quote is confirmed.",
  },
] as const;

export type VirtualPhoneRepairSlug = (typeof VIRTUAL_PHONE_REPAIRS)[number]["slug"];
export type VirtualPhoneRepair = (typeof VIRTUAL_PHONE_REPAIRS)[number];

export interface VirtualPhoneRepairModelOption {
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
}

function normalizeBrandSlug(brand: string) {
  const slug = slugify(displayBrand(brand));
  return slug === "google-pixel" || slug === "pixel" ? "google" : slug;
}

export function getVirtualPhoneRepair(slug: string): VirtualPhoneRepair | null {
  return VIRTUAL_PHONE_REPAIRS.find((repair) => repair.slug === slug) ?? null;
}

export function isVirtualPhoneRepairName(name: string) {
  return VIRTUAL_PHONE_REPAIRS.some((repair) => repair.name === name);
}

export function isEligibleVirtualPhoneRepairBrand(brand: string) {
  const slug = normalizeBrandSlug(brand);
  return slug !== "iphone" && slug !== "apple";
}

export function getVirtualPhoneRepairId(brand: string, model: string, repairSlug: VirtualPhoneRepairSlug) {
  const repairId = repairSlug.replace("-replacement", "");
  return `virtual-${repairId}-${normalizeBrandSlug(brand)}-${slugify(model)}`;
}

export function getVirtualPhoneRepairLandingHref(
  categorySlug: string,
  brandSlug: string,
  modelSlug: string,
  repairSlug: VirtualPhoneRepairSlug
) {
  const brand = normalizeBrandSlug(brandSlug);
  if (categorySlug !== "phone" || brand === "iphone" || brand === "apple") return null;

  if (brand === "samsung" || brand === "google" || brand === "oppo") {
    return `/repairs/phone/${brand}/${repairSlug}?model=${encodeURIComponent(modelSlug)}`;
  }

  return `/repairs/phone/${repairSlug}?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`;
}

export function withVirtualPhoneRepairOptions(repairTypes: RepairOption[], categorySlug: string, brand: string) {
  if (categorySlug !== "phone" || !isEligibleVirtualPhoneRepairBrand(brand)) return repairTypes;

  const existing = new Set(repairTypes.map((repair) => repair.slug));
  const virtualOptions = VIRTUAL_PHONE_REPAIRS
    .filter((repair) => !existing.has(repair.slug))
    .map((repair) => ({ slug: repair.slug, name: repair.name, price: 50, variants: [], sourceType: 'virtual' as const }));

  return virtualOptions.length > 0 ? [...repairTypes, ...virtualOptions] : repairTypes;
}

export function withVirtualPhoneRepairGroupedServices(
  services: GroupedService[],
  brand: string,
  model: string,
  category: string
) {
  if (category !== "phone" || !isEligibleVirtualPhoneRepairBrand(brand)) return services;

  const existing = new Set(services.map((service) => slugify(service.service)));
  const virtualServices = VIRTUAL_PHONE_REPAIRS
    .filter((repair) => !existing.has(repair.slug))
    .map((repair) => {
      const id = getVirtualPhoneRepairId(brand, model, repair.slug);
      return {
        id: `grouped-${id}`,
        service: repair.name,
        price: 50,
        variants: [
          {
            id,
            quality_grade: "Starting Price",
            price: 50,
            originalItem: {
              id,
              name: repair.name,
              model,
              brand,
              deviceModel: model,
              service: repair.name,
              price: 50,
              category,
              deviceType: "phone",
              quality_grade: "Starting Price",
              is_recommended: false,
              sourceType: 'virtual' as const,
            } as unknown as ParsedItem,
          },
        ],
      };
    });

  return virtualServices.length > 0 ? [...services, ...virtualServices] : services;
}

export function buildVirtualPhoneRepairModelOptions(models: VirtualPhoneRepairModelOption[]) {
  return models
    .filter((model) => isEligibleVirtualPhoneRepairBrand(model.brandSlug))
    .sort((left, right) =>
      left.brand.localeCompare(right.brand, undefined, { sensitivity: "base" }) ||
      left.model.localeCompare(right.model, undefined, { numeric: true, sensitivity: "base" })
    );
}
