type MacBookRepairOption = Readonly<{
  slug: string;
  price: number;
  variants?: ReadonlyArray<Readonly<{ price: number }>>;
  sourceType?: "real" | "virtual" | "diagnostic";
  repairOrigin?: "pos" | "synthetic-core" | "synthetic-backfill" | "virtual" | "diagnostic" | "unknown-legacy";
}>;

const MACBOOK_A_NUMBER_PATTERN = /^A\d{4}$/i;

const REPAIR_SLUGS = {
  screen: new Set(["screen-replacement", "screen-repair"]),
  battery: new Set(["battery-replacement", "battery-service", "battery-repair"]),
  charging: new Set(["charging-port-replacement", "charging-port-repair", "charging-repair", "charging-port"]),
} as const;

function isPublishedPrice(repair: MacBookRepairOption) {
  return repair.price > 0 || repair.variants?.some((variant) => variant.price > 0) === true;
}

function isDiagnosticOnly(repair: MacBookRepairOption) {
  return repair.sourceType === "diagnostic" || repair.repairOrigin === "diagnostic";
}

function isQuoteLedPublishedRepair(repair: MacBookRepairOption) {
  return repair.repairOrigin === "pos" && !isDiagnosticOnly(repair);
}

function hasRepair(
  repairs: readonly MacBookRepairOption[],
  repairSlugs: ReadonlySet<string>,
  publishedOnly: boolean,
) {
  return repairs.some((repair) => repairSlugs.has(repair.slug) && (!publishedOnly || isPublishedPrice(repair)));
}

export function getMacBookModelCodes(modelCode?: string) {
  if (!modelCode) return [];

  return Array.from(
    new Set(
      (modelCode.match(/\bA\d{4}\b/gi) ?? [])
        .map((code) => code.toUpperCase())
        .filter((code) => MACBOOK_A_NUMBER_PATTERN.test(code)),
    ),
  );
}

export function getMacBookModelCodeLabel(modelCode?: string) {
  const modelCodes = getMacBookModelCodes(modelCode);
  if (modelCodes.length === 0) return null;

  return `${modelCodes.length === 1 ? "Model" : "Models"} ${modelCodes.join(" / ")}`;
}

export function getMacBookModelMetaTitle(modelName: string, modelCode?: string) {
  const modelCodes = getMacBookModelCodes(modelCode);
  const codeSuffix = modelCodes.length > 0 ? ` ${modelCodes.join(" / ")}` : "";

  return `${modelName}${codeSuffix} Repair | Ali Mobile`;
}

function getMacBookRepairSummary(repairs: readonly MacBookRepairOption[]) {
  const hasPublishedScreen = hasRepair(repairs, REPAIR_SLUGS.screen, true);
  const hasPublishedBattery = hasRepair(repairs, REPAIR_SLUGS.battery, true);
  const hasPublishedCharging = hasRepair(repairs, REPAIR_SLUGS.charging, true);
  const hasQuotedScreen = repairs.some((repair) => REPAIR_SLUGS.screen.has(repair.slug) && !isPublishedPrice(repair) && isQuoteLedPublishedRepair(repair));
  const hasQuotedBattery = repairs.some((repair) => REPAIR_SLUGS.battery.has(repair.slug) && !isPublishedPrice(repair) && isQuoteLedPublishedRepair(repair));
  const hasQuotedCharging = repairs.some((repair) => REPAIR_SLUGS.charging.has(repair.slug) && !isPublishedPrice(repair) && isQuoteLedPublishedRepair(repair));
  const hasDiagnosticScreen = repairs.some((repair) => REPAIR_SLUGS.screen.has(repair.slug) && isDiagnosticOnly(repair));
  const hasDiagnosticBattery = repairs.some((repair) => REPAIR_SLUGS.battery.has(repair.slug) && isDiagnosticOnly(repair));
  const hasDiagnosticCharging = repairs.some((repair) => REPAIR_SLUGS.charging.has(repair.slug) && isDiagnosticOnly(repair));

  if (
    !hasPublishedScreen && !hasPublishedBattery && !hasPublishedCharging
    && !hasQuotedScreen && !hasQuotedBattery && !hasQuotedCharging
  ) {
    return "Repair assessments and quotes.";
  }

  const publishedServices = [
    hasPublishedScreen ? "screen" : null,
    hasPublishedBattery ? "battery" : null,
    hasPublishedCharging ? "charging" : null,
  ].filter((service): service is string => Boolean(service));
  const quotedServices = [
    !hasPublishedScreen && hasQuotedScreen ? "screen" : null,
    !hasPublishedBattery && hasQuotedBattery ? "battery" : null,
    !hasPublishedCharging && hasQuotedCharging ? "charging" : null,
  ].filter((service): service is string => Boolean(service));
  const assessmentServices = [
    !hasPublishedScreen && !hasQuotedScreen && hasDiagnosticScreen ? "screen" : null,
    !hasPublishedBattery && !hasQuotedBattery && hasDiagnosticBattery ? "battery" : null,
    !hasPublishedCharging && !hasQuotedCharging && hasDiagnosticCharging ? "charging" : null,
  ].filter((service): service is string => Boolean(service));

  const joinServices = (services: readonly string[]) =>
    services.length === 1
      ? services[0]!
      : services.length === 2
        ? `${services[0]} and ${services[1]}`
        : `${services.slice(0, -1).join(", ")} and ${services.at(-1)}`;

  const clauses: string[] = [];
  if (publishedServices.length > 0) {
    clauses.push(`${joinServices(publishedServices)} repair${publishedServices.length === 1 ? "" : "s"}`);
  }
  if (quotedServices.length > 0) {
    clauses.push(`${joinServices(quotedServices)} repair quote${quotedServices.length === 1 ? "" : "s"}`);
  }
  if (assessmentServices.length > 0) {
    clauses.push(`${joinServices(assessmentServices)} assessment${assessmentServices.length === 1 ? "" : "s"}`);
  }

  const summary = clauses.length === 1 ? clauses[0]! : `${clauses[0]}, plus ${clauses.slice(1).join(" and ")}`;
  return `${summary[0]?.toUpperCase()}${summary.slice(1)}.`;
}

export function getMacBookModelMetaDescription(
  modelName: string,
  modelCode: string | undefined,
  repairs: readonly MacBookRepairOption[],
) {
  const modelCodes = getMacBookModelCodes(modelCode);
  const identity = modelCodes.length > 0
    ? `${modelName}, ${modelCodes.length === 1 ? "model" : "models"} ${modelCodes.join(" / ")}.`
    : `${modelName}.`;

  return `${identity} ${getMacBookRepairSummary(repairs)} View options and quotes. 6-month warranty on eligible repairs. Call 0481 058 514.`;
}
