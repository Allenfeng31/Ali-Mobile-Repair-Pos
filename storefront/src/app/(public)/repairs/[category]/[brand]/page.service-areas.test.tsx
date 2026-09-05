/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BrandHubPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  notFound: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  fetchBrandModels: vi.fn().mockResolvedValue({ brand: { brand: "iPhone" } }),
  fetchRepairCatalog: vi.fn().mockResolvedValue({
    brands: [
      {
        category: "phone",
        slug: "iphone",
        models: [{ slug: "iphone-15", model: "iPhone 15", repairTypes: [] }],
      },
      {
        category: "tablet",
        slug: "ipad",
        models: [{ slug: "ipad-pro-11", model: "iPad Pro 11", repairTypes: [] }],
      },
    ],
  }),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
});

const approvedAreaSlugs = [
  "ringwood-east",
  "heathmont",
  "mitcham",
  "croydon",
] as const;

const approvedAreaNames = [
  "Ringwood East",
  "Heathmont",
  "Mitcham",
  "Croydon",
] as const;

const excludedAreaSlugs = [
  "ringwood",
  "ringwood-north",
  "nunawading",
  "boxhill",
  "glenwaverley",
  "wantirna",
] as const;

afterEach(() => {
  cleanup();
});

function expectApprovedLocalCards(container: HTMLElement) {
  const cards = Array.from(container.querySelectorAll<HTMLAnchorElement>(".iphone-service-area-link"));

  expect(cards).toHaveLength(4);
  expect(cards.map((card) => card.getAttribute("href"))).toEqual(
    approvedAreaSlugs.map((slug) => `/locations/${slug}`),
  );
  expect(cards.map((card) => card.querySelector("h3")?.textContent)).toEqual(
    approvedAreaNames.map((name) => `${name} repair information`),
  );
  expect(container.textContent).not.toContain("Show more suburbs");

  for (const card of cards) {
    expect(card.getAttribute("style") ?? "").not.toMatch(/display\s*:\s*none/i);
    expect(card.getAttribute("aria-hidden")).toBeNull();
    expect(card.getAttribute("tabindex")).toBeNull();
  }

  for (const slug of excludedAreaSlugs) {
    expect(cards.find((card) => card.getAttribute("href") === `/locations/${slug}`)).toBeUndefined();
  }
}

describe("Phone and tablet Brand Hub local service areas", () => {
  it("renders only the approved four local cards for the iPhone Brand Hub without changing its service schema area source", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: "iphone" }) });
    const { container } = render(pageElement);

    expectApprovedLocalCards(container);

    const serviceSchema = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((script) => JSON.parse(script.textContent || "{}"))
      .find((schema) => schema["@id"] === "https://www.alimobile.com.au/repairs/phone/iphone#service");

    expect(serviceSchema?.areaServed.map((area: { name: string }) => area.name)).toEqual([
      "Ringwood East, VIC",
      "Heathmont, VIC",
      "Mitcham, VIC",
      "Croydon, VIC",
      "Ringwood North, VIC",
      "Nunawading, VIC",
    ]);
  });

  it("renders only the approved four local cards for the iPad Brand Hub", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "ipad" }) });
    const { container } = render(pageElement);

    expectApprovedLocalCards(container);
  });
});
