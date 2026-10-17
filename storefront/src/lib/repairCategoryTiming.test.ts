import { describe, expect, it } from "vitest";

import { getRepairCategoryTimingLabel, TABLET_STANDARD_REPAIR_TIMING } from "./repairCategoryTiming";

describe("getRepairCategoryTimingLabel", () => {
  it("uses the category timing authority for the homepage and repair hub", () => {
    expect(getRepairCategoryTimingLabel("phone", "homepage")).toBe("15–60 min");
    expect(getRepairCategoryTimingLabel("tablet", "homepage")).toBe("1–2 hours");
    expect(getRepairCategoryTimingLabel("laptop", "homepage")).toBe("1–2 hours");
    expect(getRepairCategoryTimingLabel("watch", "homepage")).toBe("around 45 min");

    expect(getRepairCategoryTimingLabel("phone", "hub")).toBe("15–60 Minutes");
    expect(getRepairCategoryTimingLabel("tablet", "hub")).toBe("1–2 Hours");
    expect(getRepairCategoryTimingLabel("laptop", "hub")).toBe("1–2 Hours");
    expect(getRepairCategoryTimingLabel("watch", "hub")).toBe("around 45 min");
  });

  it("keeps the owner-approved standard-tablet timing qualified and separate from the broad category range", () => {
    expect(TABLET_STANDARD_REPAIR_TIMING).toBe(
      "Many standard tablet repairs take around 1 hour. Timing depends on the model, repair type, diagnosis and parts availability.",
    );
    expect(getRepairCategoryTimingLabel("tablet", "hub")).toBe("1–2 Hours");
  });
});
