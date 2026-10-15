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

export function getRepairCategoryTimingLabel(
  category: RepairCategoryTimingCategory,
  context: RepairCategoryTimingContext,
): string {
  const { duration, unit, approximate } = REPAIR_CATEGORY_TIMING[category];

  if (context === "homepage") {
    return `${approximate ? "around " : ""}${duration} ${unit === "minutes" ? "min" : "hours"}`;
  }

  return `${duration} ${unit === "minutes" ? "Minutes" : "Hours"}`;
}
