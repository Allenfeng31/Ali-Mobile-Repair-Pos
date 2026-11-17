import { describe, expect, it } from "vitest";

import { buildPhoneScreenBrandPriceTable } from "./phoneScreenBlackArticle";

const screen = (
  price: number,
  options: Partial<{
    repairOrigin: string;
    sourceType: "real" | "virtual" | "diagnostic";
    variants: Array<{ quality_grade: string; price: number }>;
  }> = {},
) => ({
  slug: "screen-replacement",
  price,
  repairOrigin: "pos",
  ...options,
});

describe("buildPhoneScreenBrandPriceTable", () => {
  it("builds four compact ranges from valid public POS screen prices", () => {
    const table = buildPhoneScreenBrandPriceTable({
      fetchedAt: "2026-11-17T01:00:00Z",
      brands: [
        { category: "phone", slug: "iphone", models: [
          { repairTypes: [screen(199, { variants: [{ quality_grade: "Standard", price: 149 }, { quality_grade: "Premium", price: 299 }] })] },
          { repairTypes: [screen(399)] },
        ] },
        { category: "phone", slug: "samsung", models: [{ repairTypes: [screen(180)] }] },
        { category: "phone", slug: "google-pixel", models: [{ repairTypes: [screen(220)] }] },
        { category: "phone", slug: "oppo", models: [{ repairTypes: [screen(160)] }] },
      ],
    });

    expect(table.rows).toEqual([
      { brand: "Apple iPhone", href: "/repairs/phone/iphone", range: { min: 149, max: 399 } },
      { brand: "Samsung Galaxy", href: "/repairs/phone/samsung", range: { min: 180, max: 180 } },
      { brand: "Google Pixel", href: "/repairs/phone/google", range: { min: 220, max: 220 } },
      { brand: "OPPO", href: "/repairs/phone/oppo", range: { min: 160, max: 160 } },
    ]);
  });

  it("excludes quote-only, non-POS, virtual, diagnostic and unrelated repair rows", () => {
    const table = buildPhoneScreenBrandPriceTable({
      brands: [
        { category: "phone", slug: "iphone", models: [
          { repairTypes: [screen(0)] },
          { repairTypes: [screen(100, { repairOrigin: "synthetic-core" })] },
          { repairTypes: [screen(120, { sourceType: "virtual" })] },
          { repairTypes: [screen(130, { sourceType: "diagnostic" })] },
          { repairTypes: [{ slug: "battery-replacement", price: 99, repairOrigin: "pos" }] },
        ] },
      ],
    });

    expect(table.rows).toEqual([]);
  });
});
