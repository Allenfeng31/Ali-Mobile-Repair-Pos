import type { AliMobileEnhancedIpadModelSlug } from "@/lib/seo/content/ipad/types";

type IpadRepairOption = Readonly<{
  slug: string;
  price: number;
  variants?: ReadonlyArray<Readonly<{ price: number }>>;
  sourceType?: "real" | "virtual" | "diagnostic";
  repairOrigin?: "pos" | "synthetic-core" | "synthetic-backfill" | "virtual" | "diagnostic" | "unknown-legacy";
}>;

const A_NUMBER_PATTERN = /^A\d{4}$/;

const REPAIR_SLUGS = {
  screen: new Set(["screen-replacement", "screen-repair"]),
  battery: new Set(["battery-replacement", "battery-service", "battery-repair"]),
  charging: new Set(["charging-port-replacement", "charging-port-repair", "charging-port", "charging-repair"]),
} as const;

type RepairAvailability = "repair" | "quote" | "assessment";

export const IPAD_MODEL_HUB_IDENTITIES: Readonly<Record<AliMobileEnhancedIpadModelSlug, readonly string[]>> = {
  "ipad-5th-generation": ["A1822", "A1823"],
  "ipad-6th-generation": ["A1893", "A1954"],
  "ipad-7th-generation": ["A2197", "A2200", "A2198"],
  "ipad-8th-generation": ["A2270", "A2428", "A2429", "A2430"],
  "ipad-9th-generation": ["A2602", "A2604", "A2603", "A2605"],
  "ipad-10th-generation": ["A2696", "A2757", "A2777", "A3162"],
  "ipad-11th-generation": ["A3354", "A3355", "A3356"],
  "ipad-air-3rd-generation": ["A2152", "A2123", "A2153", "A2154"],
  "ipad-air-4th-generation": ["A2316", "A2324", "A2325", "A2072"],
  "ipad-air-5th-generation": ["A2588", "A2589", "A2591"],
  "ipad-air-m2-11-inch": ["A2902", "A2903", "A2904"],
  "ipad-air-m2-13-inch": ["A2898", "A2899", "A2900"],
  "ipad-mini-5th-generation": ["A2133", "A2124", "A2126", "A2125"],
  "ipad-mini-6th-generation": ["A2567", "A2568", "A2569"],
  "ipad-mini-7th-generation": ["A2993", "A2995", "A2996"],
  "ipad-pro-11-inch-1st-generation": ["A1980", "A2013", "A1934", "A1979"],
  "ipad-pro-11-inch-2nd-generation": ["A2228", "A2068", "A2230", "A2231"],
  "ipad-pro-11-inch-3rd-generation": ["A2377", "A2459", "A2301", "A2460"],
  "ipad-pro-11-inch-4th-generation": ["A2759", "A2761", "A2435", "A2762"],
  "ipad-pro-11-inch-m4": ["A2836", "A2837", "A3006"],
  "ipad-pro-129-inch-3rd-generation": ["A1876", "A2014", "A1895", "A1983"],
  "ipad-pro-129-inch-4th-generation": ["A2229", "A2069", "A2232", "A2233"],
  "ipad-pro-129-inch-5th-generation": ["A2378", "A2461", "A2379", "A2462"],
  "ipad-pro-129-inch-6th-generation": ["A2436", "A2437", "A2764", "A2766"],
  "ipad-pro-13-inch-m4": ["A2925", "A2926", "A3007"],
};

export function getIpadModelNumbers(modelSlug: string): readonly string[] {
  return IPAD_MODEL_HUB_IDENTITIES[modelSlug as AliMobileEnhancedIpadModelSlug] ?? [];
}

export function getIpadModelNumberLabel(modelSlug: string) {
  const modelNumbers = getIpadModelNumbers(modelSlug);
  return modelNumbers.length > 0 ? `Model Numbers: ${modelNumbers.join(" · ")}` : null;
}

function isPublishedPrice(repair: IpadRepairOption) {
  return repair.price > 0 || repair.variants?.some((variant) => variant.price > 0) === true;
}

function isDiagnosticOnly(repair: IpadRepairOption) {
  return repair.sourceType === "diagnostic" || repair.repairOrigin === "diagnostic";
}

function isQuoteLedRepair(repair: IpadRepairOption) {
  if (isDiagnosticOnly(repair) || repair.repairOrigin === "unknown-legacy") return false;

  return repair.repairOrigin === "pos"
    || repair.repairOrigin === "synthetic-core"
    || repair.repairOrigin === "synthetic-backfill"
    || repair.sourceType === "real";
}

function getAvailability(repairs: readonly IpadRepairOption[], repairSlugs: ReadonlySet<string>): RepairAvailability | null {
  const matching = repairs.filter((repair) => repairSlugs.has(repair.slug));

  if (matching.some((repair) => !isDiagnosticOnly(repair) && isPublishedPrice(repair))) return "repair";
  if (matching.some((repair) => !isPublishedPrice(repair) && isQuoteLedRepair(repair))) return "quote";
  if (matching.some(isDiagnosticOnly)) return "assessment";
  return null;
}

function joinServices(services: readonly string[]) {
  if (services.length === 1) return services[0]!;
  if (services.length === 2) return `${services[0]} and ${services[1]}`;
  return `${services.slice(0, -1).join(", ")}, and ${services.at(-1)}`;
}

function getIpadRepairSummary(repairs: readonly IpadRepairOption[]) {
  const services = [
    ["screen", "screen repair", "screen repair quote", "screen assessment"] as const,
    ["battery", "battery replacement", "battery repair quote", "battery assessment"] as const,
    ["charging", "charging repair", "charging repair quote", "charging assessment"] as const,
  ].flatMap(([kind, repair, quote, assessment]) => {
    const availability = getAvailability(repairs, REPAIR_SLUGS[kind]);
    if (availability === "repair") return [repair];
    if (availability === "quote") return [quote];
    if (availability === "assessment") return [assessment];
    return [];
  });

  return services.length > 0 ? `${joinServices(services)} options` : "repair assessments and quotes";
}

export function getIpadModelMetaTitle(modelName: string) {
  return `${modelName} Repair | Ali Mobile`;
}

export function getIpadModelMetaDescription(modelName: string, repairs: readonly IpadRepairOption[]) {
  return `${modelName} ${getIpadRepairSummary(repairs)}. 6-month warranty on eligible repairs. Call 0481 058 514.`;
}

export function getIpadStartingPriceServiceLabel(
  startingPrice: number | null,
  matchingRepairs: ReadonlyArray<Readonly<{
    name: string;
    sourceType?: "real" | "virtual" | "diagnostic";
    repairOrigin?: string;
  }>>,
) {
  if (startingPrice === null || matchingRepairs.length === 0) return null;

  const publishedRepair = matchingRepairs.find((repair) =>
    repair.sourceType !== "virtual" && repair.repairOrigin !== "virtual",
  ) ?? matchingRepairs[0]!;

  return `Starting price applies to ${publishedRepair.name}`;
}

export function areIpadModelNumbersValid(modelNumbers: readonly string[]) {
  return modelNumbers.length > 0
    && modelNumbers.every((modelNumber) => A_NUMBER_PATTERN.test(modelNumber))
    && new Set(modelNumbers).size === modelNumbers.length;
}
