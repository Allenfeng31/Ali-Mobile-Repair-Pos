type AppleWatchRepairOption = Readonly<{
  slug: string;
  price: number;
  variants?: ReadonlyArray<Readonly<{ price: number }>>;
  sourceType?: "real" | "virtual" | "diagnostic";
  repairOrigin?: "pos" | "synthetic-core" | "synthetic-backfill" | "virtual" | "diagnostic" | "unknown-legacy";
}>;

const REPAIR_SLUGS = {
  screen: new Set(["screen-replacement", "screen-repair"]),
  battery: new Set(["battery-replacement", "battery-service", "battery-repair"]),
  charging: new Set(["charging-port-replacement", "charging-port-repair", "charging-port", "charging-repair"]),
} as const;

type RepairAvailability = "repair" | "quote" | "assessment";

function isPublishedPrice(repair: AppleWatchRepairOption) {
  return repair.price > 0 || repair.variants?.some((variant) => variant.price > 0) === true;
}

function isDiagnosticOnly(repair: AppleWatchRepairOption) {
  return repair.sourceType === "diagnostic" || repair.repairOrigin === "diagnostic";
}

function isQuoteLedRepair(repair: AppleWatchRepairOption) {
  if (isDiagnosticOnly(repair) || repair.repairOrigin === "unknown-legacy") return false;

  return repair.repairOrigin === "pos"
    || repair.repairOrigin === "synthetic-core"
    || repair.repairOrigin === "synthetic-backfill"
    || repair.sourceType === "real";
}

function getAvailability(
  repairs: readonly AppleWatchRepairOption[],
  repairSlugs: ReadonlySet<string>,
): RepairAvailability | null {
  const matching = repairs.filter((repair) => repairSlugs.has(repair.slug));

  if (matching.some((repair) => !isDiagnosticOnly(repair) && isPublishedPrice(repair))) return "repair";
  if (matching.some((repair) => !isPublishedPrice(repair) && isQuoteLedRepair(repair))) return "quote";
  if (matching.some(isDiagnosticOnly)) return "assessment";
  return null;
}

function joinServices(services: readonly string[]) {
  if (services.length === 1) return services[0]!;
  if (services.length === 2) return `${services[0]} and ${services[1]}`;
  return `${services.slice(0, -1).join(", ")} and ${services.at(-1)}`;
}

function getAppleWatchRepairSummary(repairs: readonly AppleWatchRepairOption[]) {
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

  if (services.length === 0) return "Repair assessments and quotes";
  return joinServices(services);
}

export function getAppleWatchModelMetaTitle(modelName: string) {
  return `${modelName} Repair | Ali Mobile`;
}

export function getAppleWatchModelMetaDescription(
  modelName: string,
  repairs: readonly AppleWatchRepairOption[],
) {
  return `${modelName} ${getAppleWatchRepairSummary(repairs)}. 6-month warranty on eligible repairs. Call 0481 058 514.`;
}
