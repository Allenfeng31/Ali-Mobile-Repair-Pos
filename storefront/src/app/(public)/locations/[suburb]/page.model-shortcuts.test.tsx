/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import LocationPage from "./page";

const { fetchRepairCatalog } = vi.hoisted(() => ({
  fetchRepairCatalog: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  fetchRepairCatalog,
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

const catalogueBrands = [
  { category: "phone", brand: "iPhone", slug: "iphone", models: [{ slug: "iphone-15", model: "iPhone 15", repairTypes: [] }] },
  { category: "phone", brand: "Samsung", slug: "samsung", models: [{ slug: "galaxy-s24", model: "Galaxy S24", repairTypes: [] }] },
  { category: "phone", brand: "Google Pixel", slug: "google-pixel", models: [{ slug: "pixel-8", model: "Pixel 8", repairTypes: [] }] },
  { category: "phone", brand: "OPPO", slug: "oppo", models: [{ slug: "find-x8", model: "Find X8", repairTypes: [] }] },
  { category: "tablet", brand: "iPad", slug: "ipad", models: [{ slug: "ipad-9th-generation", model: "iPad 9th Generation", repairTypes: [] }] },
  { category: "laptop", brand: "MacBook", slug: "macbook", models: [{ slug: "macbook-pro-13-m1-2020", model: "MacBook Pro 13 M1 2020", repairTypes: [] }] },
];

const removedModelNames = [
  "iPhone 15 Pro Max",
  "iPhone 13",
  "Galaxy S24 Ultra",
  "Galaxy S23 Ultra",
  "iPad 9th Generation",
  "MacBook Pro 13 M1 2020",
];

const removedModelHrefs = [
  "/repairs/phone/iphone/iphone-15-pro-max",
  "/repairs/phone/iphone/iphone-13",
  "/repairs/phone/samsung/galaxy-s24-ultra",
  "/repairs/phone/samsung/galaxy-s23-ultra",
  "/repairs/tablet/ipad/ipad-9th-generation",
  "/repairs/laptop/macbook/macbook-pro-13-m1-2020",
];

async function renderLocation(suburb: string) {
  fetchRepairCatalog.mockResolvedValue({ brands: catalogueBrands });
  return renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb }) }));
}

describe("Location Page Model Shortcuts", () => {
  it.each([
    ["ringwood", "/locations/ringwood-east"],
    ["croydon", "/locations/heathmont"],
  ])("does not render fixed model shortcuts for %s while retaining adjacent navigation", async (suburb, nearbyHref) => {
    const markup = await renderLocation(suburb);

    expect(markup).not.toContain("Model shortcuts");
    expect(markup).not.toContain("Popular device models we repair");

    for (const name of removedModelNames) expect(markup).not.toContain(name);
    for (const href of removedModelHrefs) expect(markup).not.toContain(`href=\"${href}\"`);

    expect(markup).toContain('href="/repairs/phone/iphone"');
    expect(markup).toContain('href="/repairs/phone/samsung"');
    expect(markup).toContain('href="/repairs/tablet/ipad"');
    expect(markup).toContain('href="/repairs/laptop/macbook"');
    expect(markup).toContain('href="/repairs/screen-replacement"');
    expect(markup).toContain('href="/repairs/battery-replacement"');
    expect(markup).toContain(`href=\"${nearbyHref}\"`);
  });
});
