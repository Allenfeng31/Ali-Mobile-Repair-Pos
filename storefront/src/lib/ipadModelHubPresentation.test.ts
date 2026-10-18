import { describe, expect, it } from "vitest";

import {
  areIpadModelNumbersValid,
  getIpadModelMetaDescription,
  getIpadModelMetaTitle,
  getIpadModelNumberLabel,
  getIpadModelNumbers,
  getIpadStartingPriceServiceLabel,
  IPAD_MODEL_HUB_IDENTITIES,
} from "./ipadModelHubPresentation";

const expectedIdentifiers = {
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
} as const;

describe("iPad Model Hub presentation", () => {
  it("contains the complete reviewed Apple identifier set for all 25 supported iPad routes", () => {
    expect(Object.keys(IPAD_MODEL_HUB_IDENTITIES)).toHaveLength(25);
    expect(IPAD_MODEL_HUB_IDENTITIES).toEqual(expectedIdentifiers);

    for (const [modelSlug, identifiers] of Object.entries(expectedIdentifiers)) {
      expect(getIpadModelNumbers(modelSlug)).toEqual(identifiers);
      expect(areIpadModelNumbersValid(identifiers)).toBe(true);
    }
  });

  it("fails closed for an unmapped route and uses a concise public identity label without variant labels", () => {
    expect(getIpadModelNumbers("unmapped-ipad")).toEqual([]);
    expect(getIpadModelNumberLabel("unmapped-ipad")).toBeNull();
    expect(getIpadModelNumberLabel("ipad-10th-generation"))
      .toBe("Model Numbers: A2696 · A2757 · A2777 · A3162");
  });

  it("uses iPad-only, catalogue-aware metadata without hardware codes or pricing", () => {
    const title = getIpadModelMetaTitle("iPad 10th Generation");
    const description = getIpadModelMetaDescription("iPad 10th Generation", [
      { slug: "screen-replacement", price: 149, repairOrigin: "pos" },
      { slug: "battery-replacement", price: 0, repairOrigin: "pos" },
      { slug: "charging-port-replacement", price: 0, repairOrigin: "diagnostic", sourceType: "diagnostic" },
    ]);

    expect(title).toBe("iPad 10th Generation Repair | Ali Mobile");
    expect(description).toBe("iPad 10th Generation screen repair, battery repair quote, and charging assessment options. 6-month warranty on eligible repairs. Call 0481 058 514.");
    expect(`${title} ${description}`).not.toMatch(/\$\d|A\d{4}/);
  });

  it("attributes a displayed generic starting price only to the supplied matching repair record", () => {
    expect(getIpadStartingPriceServiceLabel(90, [{ name: "Front Camera Replacement" }]))
      .toBe("Starting price applies to Front Camera Replacement");
    expect(getIpadStartingPriceServiceLabel(90, [
      { name: "Virtual Camera Service", sourceType: "virtual", repairOrigin: "virtual" },
      { name: "Back Camera Replacement", sourceType: "real", repairOrigin: "pos" },
    ])).toBe("Starting price applies to Back Camera Replacement");
    expect(getIpadStartingPriceServiceLabel(null, [])).toBeNull();
  });
});
