import { describe, expect, it } from "vitest";

import {
  buildGooglePixelScreenRepairPriceTable,
  GOOGLE_PIXEL_SCREEN_REPAIR_COST_SLUG,
} from "./googlePixelScreenRepairCost";

function catalogue() {
  return {
    fetchedAt: "2026-11-26T01:00:00.000Z",
    brands: [
      {
        category: "phone",
        brand: "Google Pixel",
        slug: "google-pixel",
        models: [
          {
            model: "Pixel 10 Pro Fold",
            slug: "pixel-10-pro-fold",
            repairTypes: [{
              slug: "screen-replacement",
              price: 470,
              variants: [{ quality_grade: "Genuine", price: 470 }],
            }],
          },
          {
            model: "Pixel 10 Pro",
            slug: "pixel-10-pro",
            repairTypes: [{
              slug: "screen-replacement",
              price: 270,
              variants: [
                { quality_grade: "Genuine", price: 290 },
                { quality_grade: "Premium", price: 270 },
              ],
            }],
          },
          {
            model: "Pixel 9 Pro Fold",
            slug: "pixel-9-pro-fold",
            repairTypes: [{
              slug: "screen-replacement",
              price: 270,
              variants: [{ quality_grade: "Genuine", price: 270 }],
            }],
          },
          {
            model: "Pixel 9 Pro XL",
            slug: "pixel-9-pro-xl",
            repairTypes: [{
              slug: "screen-replacement",
              price: 370,
              variants: [{ quality_grade: "Premium", price: 370 }],
            }],
          },
          {
            model: "Pixel 6a",
            slug: "pixel-6a",
            repairTypes: [{
              slug: "screen-replacement",
              price: 250,
              variants: [{ quality_grade: "Standard", price: 250 }],
            }],
          },
          {
            model: "Pixel 3a",
            slug: "pixel-3a",
            repairTypes: [{
              slug: "screen-replacement",
              price: 0,
              variants: [{ quality_grade: "Standard", price: 0 }],
            }],
          },
          {
            model: "Pixel 8",
            slug: "pixel-8",
            repairTypes: [{
              slug: "battery-replacement",
              price: 120,
              variants: [{ quality_grade: "Genuine", price: 120 }],
            }],
          },
        ],
      },
      {
        category: "phone",
        brand: "Google",
        slug: "google",
        models: [{
          model: "Pixel Alias",
          slug: "pixel-alias",
          repairTypes: [{
            slug: "screen-replacement",
            price: 99,
            variants: [{ quality_grade: "Standard", price: 99 }],
          }],
        }],
      },
    ],
  };
}

describe("Google Pixel screen repair cost table", () => {
  it("uses exact Pixel screen rows, keeps grades separate and excludes Fold prices", () => {
    const table = buildGooglePixelScreenRepairPriceTable(catalogue());

    expect(GOOGLE_PIXEL_SCREEN_REPAIR_COST_SLUG).toBe("google-pixel-screen-repair-cost-australia");
    expect(table.fetchedAt).toBe("2026-11-26T01:00:00.000Z");
    expect(table.foldModels).toEqual([
      { model: "Pixel 10 Pro Fold", slug: "pixel-10-pro-fold" },
      { model: "Pixel 9 Pro Fold", slug: "pixel-9-pro-fold" },
    ]);
    expect(table.rows.map((row) => row.slug)).toEqual([
      "pixel-10-pro",
      "pixel-9-pro-xl",
      "pixel-6a",
      "pixel-3a",
    ]);
    expect(table.rows[0]).toMatchObject({
      model: "Pixel 10 Pro",
      prices: { Genuine: 290, Premium: 270 },
      quoteTiers: [],
    });
    expect(table.rows[1]).toMatchObject({ prices: { Premium: 370 } });
    expect(table.rows[2]).toMatchObject({ prices: { Standard: 250 } });
    expect(table.rows[3]).toMatchObject({ prices: {}, quoteTiers: ["Standard"] });
    expect(table.range).toEqual({ min: 250, max: 370 });
    expect(JSON.stringify(table)).not.toContain("470");
    expect(JSON.stringify(table)).not.toContain('"model":"Pixel Alias"');
    expect(JSON.stringify(table)).not.toContain('"model":"Pixel 8"');
  });

  it("rejects invalid variant prices without turning them into a zero-dollar offer", () => {
    const input = catalogue();
    const pixel10 = input.brands[0]!.models[1]!;
    pixel10.repairTypes[0]!.variants = [
      { quality_grade: "Genuine", price: Number.NaN },
      { quality_grade: "Premium", price: -10 },
    ];
    pixel10.repairTypes[0]!.price = 0;

    const table = buildGooglePixelScreenRepairPriceTable(input);
    const row = table.rows.find((candidate) => candidate.slug === "pixel-10-pro");

    expect(row).toMatchObject({ prices: {}, quoteTiers: ["Genuine", "Premium"] });
    expect(table.range).toEqual({ min: 250, max: 370 });
  });
});
