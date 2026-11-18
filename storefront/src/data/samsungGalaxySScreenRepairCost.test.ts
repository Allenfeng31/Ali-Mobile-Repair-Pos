import { describe, expect, it } from "vitest";

import {
  buildSamsungGalaxySScreenRepairPriceTable,
  SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA,
  SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG,
} from "./samsungGalaxySScreenRepairCost";
import { getPostData } from "@/lib/blog";

const expectedRows = [
  { model: "Galaxy S26 Ultra", prices: { Genuine: 490 }, quoteTiers: [] },
  { model: "Galaxy S26+", prices: { Genuine: 430 }, quoteTiers: [] },
  { model: "Galaxy S26", prices: { Genuine: 370 }, quoteTiers: [] },
  { model: "Galaxy S25 Ultra", prices: { Genuine: 420, Premium: 320 }, quoteTiers: [] },
  { model: "Galaxy S25+", prices: { Genuine: 360 }, quoteTiers: [] },
  { model: "Galaxy S25", prices: { Genuine: 330 }, quoteTiers: [] },
  { model: "Galaxy S24 Ultra", prices: { Genuine: 399, Premium: 320 }, quoteTiers: [] },
  { model: "Galaxy S24+", prices: { Genuine: 340 }, quoteTiers: [] },
  { model: "Galaxy S24", prices: { Genuine: 310 }, quoteTiers: [] },
  { model: "Galaxy S24 FE", prices: { Genuine: 240 }, quoteTiers: [] },
  { model: "Galaxy S23 Ultra", prices: { Genuine: 390, Premium: 298 }, quoteTiers: [] },
  { model: "Galaxy S23+", prices: { Genuine: 290 }, quoteTiers: [] },
  { model: "Galaxy S23", prices: { Genuine: 290 }, quoteTiers: [] },
  { model: "Galaxy S23 FE", prices: { Genuine: 240 }, quoteTiers: [] },
  { model: "Galaxy S22 Ultra", prices: { Genuine: 390, Premium: 298 }, quoteTiers: [] },
  { model: "Galaxy S22+", prices: { Genuine: 270 }, quoteTiers: [] },
  { model: "Galaxy S22", prices: { Genuine: 290 }, quoteTiers: [] },
  { model: "Galaxy S21 Ultra", prices: { Genuine: 350 }, quoteTiers: [] },
  { model: "Galaxy S21+", prices: { Genuine: 260 }, quoteTiers: [] },
  { model: "Galaxy S21", prices: { Genuine: 240 }, quoteTiers: [] },
  { model: "Galaxy S21 FE", prices: { Genuine: 230 }, quoteTiers: [] },
  { model: "Galaxy S20 Ultra", prices: { Genuine: 330 }, quoteTiers: [] },
  { model: "Galaxy S20+", prices: { Genuine: 290 }, quoteTiers: [] },
  { model: "Galaxy S20", prices: { Genuine: 250 }, quoteTiers: [] },
  { model: "Galaxy S20 FE", prices: { Genuine: 190 }, quoteTiers: [] },
] as const;

function modelSlug(model: string) {
  return model.toLowerCase().replace(/\+/g, "-plus").replace(/\s+/g, "-");
}

function catalogueFromExpectedRows() {
  return {
    fetchedAt: "2026-11-18T01:00:00.000Z",
    brands: [{
      category: "phone",
      slug: "samsung",
      models: expectedRows.map((row) => ({
        model: row.model,
        slug: modelSlug(row.model),
        repairTypes: [{
          slug: "screen-replacement",
          price: Math.min(...Object.values(row.prices)),
          variants: Object.entries(row.prices).map(([quality_grade, price]) => ({ quality_grade, price })),
        }],
      })),
    }],
  };
}

describe("Samsung Galaxy S screen repair cost article data", () => {
  it("maps all 25 published models to the current Genuine and Premium POS prices", () => {
    const table = buildSamsungGalaxySScreenRepairPriceTable(catalogueFromExpectedRows());

    expect(table.columns).toEqual(["Genuine", "Premium"]);
    expect(table.fetchedAt).toBe("2026-11-18T01:00:00.000Z");
    expect(table.rows).toEqual(expectedRows);
    expect(table.rows.find((row) => row.model === "Galaxy S25 Ultra")?.prices).toEqual({ Genuine: 420, Premium: 320 });
    expect(table.rows.find((row) => row.model === "Galaxy S24 Ultra")?.prices).toEqual({ Genuine: 399, Premium: 320 });
    expect(table.rows.find((row) => row.model === "Galaxy S23 Ultra")?.prices).toEqual({ Genuine: 390, Premium: 298 });
    expect(table.rows.find((row) => row.model === "Galaxy S23")?.prices).toEqual({ Genuine: 290 });
  });

  it("reflects a later POS price without a source-code price fallback", () => {
    const catalogue = catalogueFromExpectedRows();
    const s24Ultra = catalogue.brands[0]!.models.find((model) => model.model === "Galaxy S24 Ultra")!;
    s24Ultra.repairTypes[0]!.variants.find((variant) => variant.quality_grade === "Genuine")!.price = 409;

    expect(buildSamsungGalaxySScreenRepairPriceTable(catalogue).rows
      .find((row) => row.model === "Galaxy S24 Ultra")?.prices.Genuine).toBe(409);
  });

  it("does not alias retired Service Pack and Aftermarket labels into the canonical tiers", () => {
    const catalogue = {
      brands: [{
        category: "phone",
        slug: "samsung",
        models: [{
          model: "Galaxy S24 Ultra",
          slug: "galaxy-s24-ultra",
          repairTypes: [{
            slug: "screen-replacement",
            price: 320,
            variants: [
              { quality_grade: "Service Pack", price: 399 },
              { quality_grade: "Aftermarket", price: 320 },
            ],
          }],
        }],
      }],
    };

    const oldLabels = buildSamsungGalaxySScreenRepairPriceTable(catalogue).rows
      .find((row) => row.model === "Galaxy S24 Ultra");
    expect(oldLabels).toMatchObject({ prices: {}, quoteTiers: [] });

    catalogue.brands[0]!.models[0]!.repairTypes[0]!.variants[0]!.quality_grade = "Genuine";
    catalogue.brands[0]!.models[0]!.repairTypes[0]!.variants[1]!.quality_grade = "Premium";
    const currentLabels = buildSamsungGalaxySScreenRepairPriceTable(catalogue).rows
      .find((row) => row.model === "Galaxy S24 Ultra");
    expect(currentLabels).toMatchObject({ prices: { Genuine: 399, Premium: 320 }, quoteTiers: [] });
  });

  it("distinguishes quote-required and unavailable grades without ever emitting $0", () => {
    const catalogue = {
      brands: [{
        category: "phone",
        slug: "samsung",
        models: [{
          model: "Galaxy S25 Ultra",
          slug: "galaxy-s25-ultra",
          repairTypes: [{
            slug: "screen-replacement",
            price: 0,
            variants: [{ quality_grade: "Genuine", price: 0 }],
          }],
        }],
      }],
    };

    const row = buildSamsungGalaxySScreenRepairPriceTable(catalogue).rows
      .find((candidate) => candidate.model === "Galaxy S25 Ultra");
    expect(row).toEqual({ model: "Galaxy S25 Ultra", prices: {}, quoteTiers: ["Genuine"] });
    expect(JSON.stringify(row)).not.toContain(":0");
  });

  it("uses current tier terminology in article metadata", () => {
    expect(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description).toMatch(/Genuine.*Premium/i);
    expect(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.heroIntro).toMatch(/Genuine.*Premium/i);
    expect(JSON.stringify(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA)).not.toMatch(/Service Pack|Aftermarket Display \+ Frame/i);
  });

  it("keeps the article image metadata and genuine editorial date", async () => {
    expect(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA).toMatchObject({
      image: "/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp",
      coverImageAlt: "Samsung Galaxy S phones on a repair bench showing a damaged display, working display and screen assembly",
    });

    const post = await getPostData(SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG);
    expect(post.date).toBe("2026-09-08");
    expect(post.updated_at).toBe("2026-11-18");
  });
});
