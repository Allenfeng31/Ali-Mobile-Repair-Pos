import { describe, expect, it } from "vitest";

import {
  buildIpadScreenRepairPriceTable,
  IPAD_SCREEN_REPAIR_COST_SLUG,
} from "./ipadScreenRepairCost";

const fixture = {
  fetchedAt: "2026-11-14T01:00:00.000Z",
  brands: [{
    category: "tablet",
    slug: "ipad",
    models: [
      {
        model: "iPad 11th Generation",
        slug: "ipad-11th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 149,
          repairOrigin: "pos",
          variants: [{ quality_grade: "Genuine", price: 149 }],
        }],
      },
      {
        model: "iPad 5th Generation",
        slug: "ipad-5th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 110,
          repairOrigin: "pos",
          variants: [{ quality_grade: "Standard", price: 110 }],
        }],
      },
      {
        model: "iPad Air 5th Generation",
        slug: "ipad-air-5th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 0,
          repairOrigin: "pos",
          variants: [{ quality_grade: "Premium", price: 429 }],
        }],
      },
      {
        model: "iPad mini 6th Generation",
        slug: "ipad-mini-6th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 0,
          repairOrigin: "pos",
          variants: [{ quality_grade: "Standard", price: 0 }],
        }],
      },
      {
        model: "iPad Pro 13-inch M4",
        slug: "ipad-pro-13-inch-m4",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 799,
          repairOrigin: "pos",
        }],
      },
      {
        model: "iPad Air synthetic",
        slug: "ipad-air-synthetic",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 1,
          repairOrigin: "synthetic-backfill",
        }],
      },
      {
        model: "Legacy iPad 4",
        slug: "legacy-ipad-4",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 99,
          repairOrigin: "pos",
        }],
      },
    ],
  }],
};

describe("iPad screen repair Blog price table", () => {
  it("uses only eligible POS screen rows and separates repair scope", () => {
    const table = buildIpadScreenRepairPriceTable(fixture);

    expect(IPAD_SCREEN_REPAIR_COST_SLUG).toBe("how-much-does-ipad-screen-repair-cost-australia");
    expect(table.rows.map((row) => row.model)).toEqual([
      "iPad 11th Generation",
      "iPad 5th Generation",
      "iPad Air 5th Generation",
      "iPad mini 6th Generation",
      "iPad Pro 13-inch M4",
    ]);
    expect(table.rows.slice(0, 2).every((row) => row.scope === "glass-digitiser")).toBe(true);
    expect(table.rows.slice(2).every((row) => row.scope === "full-display")).toBe(true);
    expect(table.rows.some((row) => row.model === "iPad Air synthetic")).toBe(false);
    expect(table.rows.some((row) => row.model === "Legacy iPad 4")).toBe(false);
  });

  it("reduces catalogue grades to one visible from-price or explicit Quote state", () => {
    const table = buildIpadScreenRepairPriceTable(fixture);
    const standard = table.rows.find((row) => row.model === "iPad 11th Generation");
    const quote = table.rows.find((row) => row.model === "iPad mini 6th Generation");
    const baseOnly = table.rows.find((row) => row.model === "iPad Pro 13-inch M4");

    expect(standard).toMatchObject({ price: 149, isQuote: false });
    expect(quote).toMatchObject({ price: null, isQuote: true });
    expect(baseOnly).toMatchObject({ price: 799, isQuote: false });
    expect(table).not.toHaveProperty("columns");
  });
});
