import { APPLE_WATCH_STANDARD_TURNAROUND_MINUTES } from "@/lib/seo/content/apple-watch";

export type RepairCategoryTimingCategory = "phone" | "tablet" | "laptop" | "watch";
type RepairCategoryTimingContext = "homepage" | "hub";

const REPAIR_CATEGORY_TIMING: Record<RepairCategoryTimingCategory, {
  duration: string | number;
  unit: "minutes" | "hours";
  approximate?: boolean;
}> = {
  phone: { duration: "15–60", unit: "minutes" },
  tablet: { duration: "1–2", unit: "hours" },
  laptop: { duration: "1–2", unit: "hours" },
  watch: { duration: APPLE_WATCH_STANDARD_TURNAROUND_MINUTES, unit: "minutes", approximate: true },
};

export const PHONE_REPAIR_TIMING_QUALIFICATION =
  "This range applies to many common iPhone repairs. Actual timing depends on the model, repair type, diagnosis, parts availability and workshop workload. Complex, board-level or liquid-damage repairs may take longer.";

export const TABLET_STANDARD_REPAIR_TIMING =
  "Many standard tablet repairs take around 1 hour. Timing depends on the model, repair type, diagnosis and parts availability.";

export const TABLET_STANDARD_REPAIR_TIME_LABEL = "Around 1 Hour";

export const SAMSUNG_PHONE_REPAIR_TIMING_QUALIFICATION =
  "For many common Samsung repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.";

export const GOOGLE_PIXEL_PHONE_REPAIR_TIMING_QUALIFICATION =
  "For many common Google Pixel repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.";

export function getRepairCategoryTimingLabel(
  category: RepairCategoryTimingCategory,
  context: RepairCategoryTimingContext,
): string {
  if (category === "tablet") {
    return TABLET_STANDARD_REPAIR_TIME_LABEL;
  }

  const { duration, unit, approximate } = REPAIR_CATEGORY_TIMING[category];

  if (context === "homepage") {
    return `${approximate ? "around " : ""}${duration} ${unit === "minutes" ? "min" : "hours"}`;
  }

  if (approximate) {
    return `around ${duration} min`;
  }

  return `${duration} ${unit === "minutes" ? "Minutes" : "Hours"}`;
}
