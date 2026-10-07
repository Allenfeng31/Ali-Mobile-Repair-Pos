import { describe, expect, it } from "vitest";

import {
  buildIphoneScreenRepairPriceTable,
  IPHONE_SCREEN_REPAIR_COST_EDITORIAL_METADATA,
  IPHONE_SCREEN_REPAIR_COST_SLUG,
  SCREEN_OPTION_SAMPLE,
  SCREEN_OPTION_SAMPLE_TOTAL,
} from "./iphoneScreenRepairCost";
import { getPostData } from "@/lib/blog";

const currentCatalogue = {
  fetchedAt: "2026-10-08T01:23:00.000Z",
  brands: [{
    category: "phone",
    slug: "iphone",
    models: [
      {
        model: "iPhone 15 Pro",
        repairTypes: [{
          slug: "screen-replacement",
          price: 170,
          variants: [
            { quality_grade: "Standard", price: 170 },
            { quality_grade: "Premium", price: 230 },
            { quality_grade: "Genuine", price: 390 },
          ],
        }],
      },
      {
        model: "iPhone 16 Pro Max",
        repairTypes: [{
          slug: "screen-replacement",
          price: 190,
          variants: [
            { quality_grade: "Standard", price: 190 },
            { quality_grade: "Premium", price: 270 },
            { quality_grade: "Genuine", price: 540 },
          ],
        }],
      },
      {
        model: "iPhone 14 Pro",
        repairTypes: [{
          slug: "screen-replacement",
          price: 170,
          variants: [
            { quality_grade: "Standard", price: 170 },
            { quality_grade: "Premium", price: 220 },
            { quality_grade: "Genuine", price: 290 },
          ],
        }],
      },
      {
        model: "iPhone 13",
        repairTypes: [{
          slug: "screen-replacement",
          price: 129,
          variants: [
            { quality_grade: "Standard", price: 129 },
            { quality_grade: "Premium", price: 169 },
            { quality_grade: "Genuine", price: 240 },
          ],
        }],
      },
      {
        model: "iPhone 12",
        repairTypes: [{
          slug: "screen-replacement",
          price: 129,
          variants: [
            { quality_grade: "Standard", price: 129 },
            { quality_grade: "Premium", price: 169 },
            { quality_grade: "Genuine", price: 199 },
          ],
        }],
      },
      {
        model: "iPhone 11",
        repairTypes: [{
          slug: "screen-replacement",
          price: 120,
          variants: [
            { quality_grade: "Standard", price: 120 },
            { quality_grade: "Genuine", price: 150 },
          ],
        }],
      },
      {
        model: "iPhone 17 Pro Max",
        repairTypes: [{
          slug: "screen-replacement",
          price: 190,
          variants: [
            { quality_grade: "Standard", price: 190 },
            { quality_grade: "Premium", price: 299 },
            { quality_grade: "Genuine", price: 570 },
          ],
        }],
      },
      {
        model: "iPhone 8",
        repairTypes: [{
          slug: "screen-replacement",
          price: 85,
          variants: [{ quality_grade: "Genuine", price: 85 }],
        }],
      },
      {
        model: "iPhone 14",
        repairTypes: [{ slug: "screen-replacement", price: 150, variants: [] }],
      },
      {
        model: "iPhone 18",
        repairTypes: [{
          slug: "screen-replacement",
          price: 0,
          variants: [{ quality_grade: "Premium", price: 0 }],
        }],
      },
      {
        model: "iPhone 16",
        repairTypes: [{ slug: "battery-replacement", price: 90, variants: [] }],
      },
    ],
  }],
};

describe("iPhone screen repair cost article data", () => {
  it("derives active iPhone screen rows, actual tier labels, and the price range from the catalogue", () => {
    const table = buildIphoneScreenRepairPriceTable(currentCatalogue);

    expect(table.columns).toEqual(["Standard", "Premium", "Genuine", "Current price"]);
    expect(table.rows.map((row) => row.model)).toEqual(["iPhone 18", "iPhone 17 Pro Max", "iPhone 16 Pro Max", "iPhone 15 Pro", "iPhone 14 Pro", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone 8"]);
    expect(table.rows.find((row) => row.model === "iPhone 17 Pro Max")?.prices).toEqual({ Standard: 190, Premium: 299, Genuine: 570 });
    expect(table.rows.find((row) => row.model === "iPhone 15 Pro")?.prices).toEqual({ Standard: 170, Premium: 230, Genuine: 390 });
    expect(table.rows.find((row) => row.model === "iPhone 14")?.prices).toEqual({ "Current price": 150 });
    expect(table.range).toEqual({ min: 85, max: 570 });
    expect(table.fetchedAt).toBe("2026-10-08T01:23:00.000Z");
  });

  it("preserves the resolved Storefront prices for the eight representative iPhone models", () => {
    const pricesByModel = Object.fromEntries(
      buildIphoneScreenRepairPriceTable(currentCatalogue).rows.map((row) => [row.model, row.prices]),
    );

    expect(pricesByModel).toMatchObject({
      "iPhone 17 Pro Max": { Standard: 190, Premium: 299, Genuine: 570 },
      "iPhone 16 Pro Max": { Standard: 190, Premium: 270, Genuine: 540 },
      "iPhone 15 Pro": { Standard: 170, Premium: 230, Genuine: 390 },
      "iPhone 14 Pro": { Standard: 170, Premium: 220, Genuine: 290 },
      "iPhone 13": { Standard: 129, Premium: 169, Genuine: 240 },
      "iPhone 12": { Standard: 129, Premium: 169, Genuine: 199 },
      "iPhone 11": { Standard: 120, Genuine: 150 },
      "iPhone 8": { Genuine: 85 },
    });
  });

  it("keeps missing catalogue tiers absent and renders zero-price variants as a quote state without inventing $0", () => {
    const table = buildIphoneScreenRepairPriceTable(currentCatalogue);
    const iphone8 = table.rows.find((row) => row.model === "iPhone 8");
    const iphone18 = table.rows.find((row) => row.model === "iPhone 18");

    expect(iphone8?.prices).toEqual({ Genuine: 85 });
    expect(iphone8?.quoteTiers).toEqual([]);
    expect(iphone18?.prices).toEqual({});
    expect(iphone18?.quoteTiers).toEqual(["Premium"]);
    expect(JSON.stringify(table)).not.toContain('"Premium":0');
  });

  it("keeps editorial evidence separate from live price data", async () => {
    const post = await getPostData(IPHONE_SCREEN_REPAIR_COST_SLUG);

    expect(post.title).toBe("How Much Does iPhone Screen Repair Cost in Australia?");
    expect(post.hero_intro).not.toMatch(/\$\d+/);
    expect(post.date).toBe("2026-07-29");
    expect(post.updated_at).toBe("2026-10-08");
    expect(IPHONE_SCREEN_REPAIR_COST_EDITORIAL_METADATA).toEqual({
      datePublished: "2026-07-29",
      dateModified: "2026-10-08",
    });
  });

  it("keeps the supplied customer-choice sample accessible and internally consistent", () => {
    expect(SCREEN_OPTION_SAMPLE).toEqual([
      { name: "Soft OLED", customers: 74, colour: "#2563eb", summary: "Most frequently selected balance of display quality and price." },
      { name: "LCD / In-cell", customers: 19, colour: "#0891b2", summary: "Selected mainly where keeping the repair cost lower was the priority." },
      { name: "Original Screen", customers: 7, colour: "#a16207", summary: "Selected by customers prioritising the original screen option." },
    ]);
    expect(SCREEN_OPTION_SAMPLE_TOTAL).toBe(100);
  });
});
