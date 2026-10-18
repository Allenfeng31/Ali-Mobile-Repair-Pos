import { describe, expect, it } from "vitest";

import {
  getMacBookModelCodeLabel,
  getMacBookModelCodes,
  getMacBookModelMetaDescription,
  getMacBookModelMetaTitle,
} from "./macbookModelHubPresentation";

const standardRepairs = [
  { slug: "screen-replacement", price: 300 },
  { slug: "battery-replacement", price: 150 },
  { slug: "charging-port-replacement", price: 0, repairOrigin: "pos" as const },
];

describe("MacBook Model Hub presentation", () => {
  it.each([
    ["MacBook Air M3 13-inch 2024", "A3113"],
    ["MacBook Air M3 15-inch 2024", "A3114"],
    ["MacBook Air M2 13-inch 2022", "A2681"],
    ["MacBook Air M2 15-inch 2023", "A2941"],
    ["MacBook Air 13-inch 2014-2017", "A1466"],
    ["MacBook Air 13-inch 2018-2020", "A1932 / A2179"],
    ["MacBook Air 11-inch 2014-2015", "A1465"],
    ["MacBook Air 13-inch M1 2020", "A2337"],
    ["MacBook Pro 14/16-inch M3 Pro/Max 2024", "A2992 / A2991"],
    ["MacBook Pro 13-inch M2 2022", "A2686"],
    ["MacBook Pro 14/16-inch M2 Pro/Max 2023", "A2779 / A2780"],
    ["MacBook Pro 16-inch 2019", "A2141"],
    ["MacBook Pro 15-inch 2014-2015", "A1398"],
    ["MacBook Pro 15-inch 2016-2017", "A1707"],
    ["MacBook Pro 13-inch 2014-2015", "A1502"],
    ["MacBook Pro 13-inch 2016-2017", "A1706 / A1708"],
    ["MacBook Pro 13-inch 2018-2020", "A1989 / A2251"],
    ["MacBook Pro 13-inch M1 2020", "A2338"],
    ["MacBook Pro 14/16-inch M1 Pro/Max 2021", "A2442 / A2485"],
    ["MacBook 12-inch 2015-2019", "A1534"],
  ])("keeps the verified catalogue A-number identity for %s", (modelName, modelCode) => {
    const codes = getMacBookModelCodes(modelCode);

    expect(getMacBookModelCodeLabel(modelCode)).toBe(`Model${codes.length === 1 ? "" : "s"} ${codes.join(" / ")}`);
    expect(getMacBookModelMetaTitle(modelName, modelCode)).toBe(`${modelName} ${codes.join(" / ")} Repair | Ali Mobile`);
  });

  it("uses published repairs and quote-only services without inventing a price or turnaround", () => {
    expect(getMacBookModelMetaDescription("MacBook Air M3 13-inch 2024", "A3113", standardRepairs)).toBe(
      "MacBook Air M3 13-inch 2024, model A3113. Screen and battery repairs, plus charging repair quote. View options and quotes. 6-month warranty on eligible repairs. Call 0481 058 514.",
    );
  });

  it("describes a listed Quote on Request repair as a repair quote, not an assessment", () => {
    expect(getMacBookModelMetaDescription("MacBook Air M2 13-inch 2022", "A2681", [
      { slug: "screen-replacement", price: 0, repairOrigin: "pos" },
    ])).toContain("Screen repair quote.");
  });

  it("reserves assessment wording for diagnosis-led services", () => {
    expect(getMacBookModelMetaDescription("MacBook Air M2 13-inch 2022", "A2681", [
      { slug: "charging-port-replacement", price: 0, sourceType: "diagnostic", repairOrigin: "diagnostic" },
    ])).toContain("Repair assessments and quotes.");
  });

  it("uses assessment and quote language when no primary service has a published price", () => {
    expect(getMacBookModelMetaDescription("MacBook 12-inch 2015-2019", "A1534", [
      { slug: "screen-replacement", price: 0 },
      { slug: "battery-replacement", price: 0 },
    ])).toContain("Repair assessments and quotes.");
  });

  it("does not infer an A-number when the catalogue has none", () => {
    expect(getMacBookModelCodeLabel(undefined)).toBeNull();
    expect(getMacBookModelMetaTitle("MacBook Unknown")).toBe("MacBook Unknown Repair | Ali Mobile");
  });
});
