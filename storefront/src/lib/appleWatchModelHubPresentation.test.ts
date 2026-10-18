import { describe, expect, it } from "vitest";

import {
  getAppleWatchModelMetaDescription,
  getAppleWatchModelMetaTitle,
} from "./appleWatchModelHubPresentation";

describe("Apple Watch Model Hub presentation", () => {
  it("uses the exact Series and case size without a hardware identifier or price", () => {
    const title = getAppleWatchModelMetaTitle("Apple Watch Series 9 (41mm)");
    const description = getAppleWatchModelMetaDescription("Apple Watch Series 9 (41mm)", [
      { slug: "screen-replacement", price: 0, repairOrigin: "synthetic-core", sourceType: "real" },
      { slug: "battery-replacement", price: 120, repairOrigin: "pos" },
      { slug: "charging-repair", price: 0, repairOrigin: "diagnostic", sourceType: "diagnostic" },
    ]);

    expect(title).toBe("Apple Watch Series 9 (41mm) Repair | Ali Mobile");
    expect(description).toBe("Apple Watch Series 9 (41mm) screen repair quote, battery replacement and charging assessment. 6-month warranty on eligible repairs. Call 0481 058 514.");
    expect(`${title} ${description}`).not.toMatch(/\$\d|A\d{4}/);
  });

  it("keeps a genuine Quote on Request service distinct from a diagnosis-only assessment", () => {
    const description = getAppleWatchModelMetaDescription("Apple Watch Ultra 2 (49mm)", [
      { slug: "screen-replacement", price: 0, repairOrigin: "pos" },
      { slug: "charging-repair", price: 0, repairOrigin: "diagnostic", sourceType: "diagnostic" },
    ]);

    expect(description).toContain("screen repair quote");
    expect(description).toContain("charging assessment");
  });

  it("does not turn an unknown-provenance quote into a metadata promise", () => {
    const description = getAppleWatchModelMetaDescription("Apple Watch Series 7 (45mm)", [
      { slug: "battery-replacement", price: 90, repairOrigin: "pos" },
      { slug: "charging-port-replacement", price: 0, repairOrigin: "unknown-legacy", sourceType: "real" },
    ]);

    expect(description).toContain("battery replacement");
    expect(description).not.toContain("charging repair quote");
  });
});
