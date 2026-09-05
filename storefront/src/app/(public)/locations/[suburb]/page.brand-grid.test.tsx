/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import LocationPage from "./page";

const catalogueBrands = [
  { category: "phone", brand: "iPhone", slug: "iphone", models: [{ slug: "iphone-15", model: "iPhone 15", repairTypes: [] }] },
  { category: "phone", brand: "Samsung", slug: "samsung", models: [{ slug: "galaxy-s24", model: "Galaxy S24", repairTypes: [] }] },
  { category: "phone", brand: "Google Pixel", slug: "google-pixel", models: [{ slug: "pixel-8", model: "Pixel 8", repairTypes: [] }] },
  { category: "phone", brand: "OPPO", slug: "oppo", models: [{ slug: "find-x8", model: "Find X8", repairTypes: [] }] },
  { category: "tablet", brand: "iPad", slug: "ipad", models: [{ slug: "ipad-9th-generation", model: "iPad 9th Generation", repairTypes: [] }] },
  { category: "laptop", brand: "MacBook", slug: "macbook", models: [{ slug: "macbook-pro-13-m1-2020", model: "MacBook Pro 13 M1 2020", repairTypes: [] }] },
  { category: "phone", brand: "Xiaomi", slug: "xiaomi", models: [{ slug: "xiaomi-14", model: "Xiaomi 14", repairTypes: [] }] },
  { category: "tablet", brand: "Lenovo", slug: "lenovo", models: [{ slug: "tab-p12", model: "Tab P12", repairTypes: [] }] },
  { category: "laptop", brand: "Dell", slug: "dell", models: [{ slug: "xps-13", model: "XPS 13", repairTypes: [] }] },
];

const { fetchRepairCatalog } = vi.hoisted(() => ({
  fetchRepairCatalog: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  fetchRepairCatalog,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

const expectedHrefs = [
  "/repairs/phone/iphone",
  "/repairs/phone/samsung",
  "/repairs/phone/google-pixel",
  "/repairs/phone/oppo",
  "/repairs/tablet/ipad",
  "/repairs/laptop/macbook",
] as const;

function getBrandGrid(markup: string) {
  const document = new DOMParser().parseFromString(markup, "text/html");
  const section = document.getElementById("location-brand-repairs-heading")?.closest("section");

  if (!section) throw new Error("Location Brand Grid section was not rendered.");

  return {
    markup: section.innerHTML,
    cards: Array.from(section.querySelectorAll<HTMLAnchorElement>("a.location-popular-card")),
  };
}

function expectFeaturedBrandGrid(markup: string) {
  const { cards, markup: gridMarkup } = getBrandGrid(markup);

  expect(cards).toHaveLength(6);
  expect(cards.map((card) => card.getAttribute("href"))).toEqual(expectedHrefs);
  expect(gridMarkup).not.toContain("Show more brand repairs");
  expect(gridMarkup).not.toMatch(/display\s*:\s*none/i);
  expect(cards.some((card) => card.getAttribute("aria-hidden") === "true")).toBe(false);
  expect(cards.some((card) => card.getAttribute("tabindex") === "-1")).toBe(false);
  expect(gridMarkup).not.toContain("Xiaomi Phone Repair");
  expect(gridMarkup).not.toContain("Lenovo Tablet Repair");
  expect(gridMarkup).not.toContain("Dell Repair");
}

describe("Location Page Brand Grid", () => {
  it.each(["ringwood", "croydon"])("renders only the six featured catalogue Brand Hubs for %s", async (suburb) => {
    fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands });

    const markup = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb }) }));

    expectFeaturedBrandGrid(markup);
  });

  it("omits a missing featured brand without fabricating it or appending non-featured catalogue brands", async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands.filter((brand) => brand.slug !== "oppo") });

    const markup = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb: "ringwood-east" }) }));
    const { cards, markup: gridMarkup } = getBrandGrid(markup);

    expect(cards).toHaveLength(5);
    expect(cards.map((card) => card.getAttribute("href"))).toEqual(expectedHrefs.filter((href) => href !== "/repairs/phone/oppo"));
    expect(gridMarkup).not.toContain("OPPO Phone Repair");
    expect(gridMarkup).not.toContain("Xiaomi Phone Repair");
    expect(gridMarkup).not.toContain("Lenovo Tablet Repair");
    expect(gridMarkup).not.toContain("Dell Repair");
  });
});
