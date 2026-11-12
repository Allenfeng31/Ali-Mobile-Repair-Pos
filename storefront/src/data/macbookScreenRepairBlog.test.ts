import { describe, expect, it } from "vitest";

import { buildMacbookAirScreenRepairPriceTable } from "./macbookScreenRepairBlog";

const catalogue: Parameters<typeof buildMacbookAirScreenRepairPriceTable>[0] = {
  fetchedAt: "2026-11-12T01:00:00.000Z",
  brands: [
    {
      category: "laptop",
      slug: "macbook",
      models: [
        {
          model: "MacBook Air M2 13-inch 2022",
          slug: "macbook-air-m2-13-2022",
          repairTypes: [
            { slug: "screen-replacement", price: 549, repairOrigin: "pos" },
            { slug: "battery-replacement", price: 199, repairOrigin: "pos" },
          ],
        },
        {
          model: "MacBook Air M3 13-inch 2024",
          slug: "macbook-air-m3-13-2024",
          repairTypes: [{
            slug: "screen-replacement",
            price: 0,
            repairOrigin: "pos",
            variants: [
              { quality_grade: "Standard", price: 599 },
              { quality_grade: "Premium", price: 699 },
              { quality_grade: "Unavailable", price: 0 },
            ],
          }],
        },
        {
          model: "MacBook Air 13-inch M1 2020",
          slug: "macbook-air-13-m1-2020",
          repairTypes: [{ slug: "screen-replacement", price: 0, repairOrigin: "pos" }],
        },
        {
          model: "MacBook Air synthetic model",
          slug: "macbook-air-synthetic",
          repairTypes: [{ slug: "screen-replacement", price: 999, repairOrigin: "synthetic-backfill" }],
        },
        {
          model: "MacBook Air virtual model",
          slug: "macbook-air-virtual",
          repairTypes: [{
            slug: "screen-replacement",
            price: 899,
            repairOrigin: "virtual",
            sourceType: "virtual",
          }],
        },
        {
          model: "MacBook Pro 14-inch M3 2023",
          slug: "macbook-pro-14-m3-2023",
          repairTypes: [{ slug: "screen-replacement", price: 1099, repairOrigin: "pos" }],
        },
      ],
    },
  ],
};

describe("MacBook Air blog price table", () => {
  it("keeps only public POS MacBook Air screen prices and explicit POS quote rows", () => {
    const table = buildMacbookAirScreenRepairPriceTable(catalogue);

    expect(table.rows.map((row) => row.model)).toEqual([
      "MacBook Air M3 13-inch 2024",
      "MacBook Air M2 13-inch 2022",
      "MacBook Air 13-inch M1 2020",
    ]);
    expect(table.columns).toEqual(["Standard", "Premium", "Current price", "Unavailable"]);
    expect(table.rows[0]?.prices).toEqual({ Standard: 599, Premium: 699 });
    expect(table.rows[0]?.quoteTiers).toEqual(["Unavailable"]);
    expect(table.rows[1]?.prices).toEqual({ "Current price": 549 });
    expect(table.rows[2]?.prices).toEqual({});
    expect(table.rows[2]?.quoteTiers).toEqual(["Current price"]);
    expect(JSON.stringify(table)).not.toContain("1099");
    expect(JSON.stringify(table)).not.toContain("999");
    expect(JSON.stringify(table)).not.toContain("899");
  });

  it("does not turn invalid or unavailable catalogue values into public dollar amounts", () => {
    const table = buildMacbookAirScreenRepairPriceTable(catalogue);
    const publishedPrices = table.rows.flatMap((row) => Object.values(row.prices));

    expect(publishedPrices.every((price) => Number.isFinite(price) && price > 0)).toBe(true);
    expect(table.fetchedAt).toBe("2026-11-12T01:00:00.000Z");
  });

  it("changes displayed prices only when the underlying POS price changes", () => {
    const refreshedWithoutPriceChange = {
      ...catalogue,
      fetchedAt: "2026-11-13T01:00:00.000Z",
    };
    const changedCatalogue = structuredClone(refreshedWithoutPriceChange);
    changedCatalogue.brands[0]!.models[0]!.repairTypes[0]!.price = 579;

    const original = buildMacbookAirScreenRepairPriceTable(catalogue);
    const refreshed = buildMacbookAirScreenRepairPriceTable(refreshedWithoutPriceChange);
    const changed = buildMacbookAirScreenRepairPriceTable(changedCatalogue);

    expect(refreshed.rows).toEqual(original.rows);
    expect(refreshed.fetchedAt).not.toBe(original.fetchedAt);
    expect(changed.rows).not.toEqual(original.rows);
    expect(changed.rows.find((row) => row.model === "MacBook Air M2 13-inch 2022")?.prices)
      .toEqual({ "Current price": 579 });
  });
});
