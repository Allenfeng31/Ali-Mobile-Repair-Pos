/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { getServiceAreaBySlug } from "@/data/serviceAreas";
import LocationPage, { generateMetadata } from "./page";

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

  expect(cards).toHaveLength(5);
  expect(cards.map((card) => card.getAttribute("href"))).toEqual(expectedHrefs);
  expect(gridMarkup).not.toContain("Show more brand repairs");
  expect(gridMarkup).not.toMatch(/display\s*:\s*none/i);
  expect(cards.some((card) => card.getAttribute("aria-hidden") === "true")).toBe(false);
  expect(cards.some((card) => card.getAttribute("tabindex") === "-1")).toBe(false);
  expect(gridMarkup).not.toContain("Xiaomi Phone Repair");
  expect(gridMarkup).not.toContain("Lenovo Tablet Repair");
  expect(gridMarkup).not.toContain("Dell Repair");
  expect(gridMarkup).not.toContain("MacBook Repair");
}

describe("Location Page Brand Grid", () => {
  it.each([
    ["nunawading", "Phone & iPhone Repair Near Nunawading | Ali Mobile Ringwood", "Phone & iPhone Repair Near Nunawading"],
    ["mitcham", "Phone & iPhone Repair Near Mitcham | Ali Mobile", "Phone & iPhone Repair Near Mitcham"],
    ["glenwaverley", "Phone & iPhone Repair Near Glen Waverley & Syndal | Ali Mobile", "Phone & iPhone Repair Near Glen Waverley and Syndal"],
    ["heathmont", "Phone & iPhone Repair Near Heathmont | Ali Mobile Ringwood", "Phone & iPhone Repair Near Heathmont"],
    ["ringwood", "Visit Ali Mobile & Repair in Ringwood Square", "Visit Ali Mobile & Repair in Ringwood Square"],
  ])("keeps %s metadata and H1 aligned to its phone-first or visit-first role", async (suburb, title, heading) => {
    fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands });

    const metadata = await generateMetadata({ params: Promise.resolve({ suburb }) });
    const markup = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb }) }));
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(metadata.title).toBe(title);
    expect(document.getElementById("location-heading")?.textContent).toBe(heading);
  });

  it.each(["ringwood", "croydon"])("renders only the six featured catalogue Brand Hubs for %s", async (suburb) => {
    fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands });

    const markup = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb }) }));

    expectFeaturedBrandGrid(markup);
  });

  it("omits a missing featured brand without fabricating it or appending non-featured catalogue brands", async () => {
    fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands.filter((brand) => brand.slug !== "oppo") });

    const markup = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb: "ringwood-east" }) }));
    const { cards, markup: gridMarkup } = getBrandGrid(markup);

    expect(cards).toHaveLength(4);
    expect(cards.map((card) => card.getAttribute("href"))).toEqual(expectedHrefs.filter((href) => href !== "/repairs/phone/oppo"));
    expect(gridMarkup).not.toContain("OPPO Phone Repair");
    expect(gridMarkup).not.toContain("Xiaomi Phone Repair");
    expect(gridMarkup).not.toContain("Lenovo Tablet Repair");
    expect(gridMarkup).not.toContain("Dell Repair");
  });

  it.each(["nunawading", "boxhill", "wantirna", "bayswater", "burwood", "lilydale"])("renders a secondary MacBook link-out for %s", async (suburb) => {
    fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands });

    const markup = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb }) }));
    const document = new DOMParser().parseFromString(markup, "text/html");

    expect(document.querySelector('a[href="/repairs/laptop/macbook"]')).not.toBeNull();
  });

  it("keeps the six corrected suburb scenarios phone-first without repeated local repair phrases", () => {
    for (const suburb of ["nunawading", "boxhill", "wantirna", "bayswater", "burwood", "lilydale"]) {
      const area = getServiceAreaBySlug(suburb);
      const scenario = JSON.stringify(area?.customScenarioSection);

      expect(scenario).not.toMatch(/laptop|MacBook repair near|phone repair near|iPhone repair near|mobile repair near/i);
    }

    expect(getServiceAreaBySlug("bayswater")?.customScenarioSection?.title).toBe("Phone, iPhone and tablet assessment near Bayswater");
    expect(getServiceAreaBySlug("burwood")?.customScenarioSection?.title).toBe("Phone, iPhone and tablet assessment near Burwood");
  });
});
