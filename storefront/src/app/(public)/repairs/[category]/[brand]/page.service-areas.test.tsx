/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import BrandHubPage from "./page";

const secondaryPhoneBrands = vi.hoisted(() => [
  ["asus", "Asus"],
  ["htc", "HTC"],
  ["huawei", "Huawei"],
  ["lg", "LG"],
  ["microsoft", "Microsoft"],
  ["motorola", "Motorola"],
  ["nokia", "Nokia"],
  ["nothing", "Nothing"],
  ["oneplus", "OnePlus"],
  ["realme", "Realme"],
  ["sony", "Sony"],
  ["tcl", "TCL"],
  ["telstra", "Telstra"],
  ["vivo", "Vivo"],
  ["xiaomi", "Xiaomi"],
] as const);

const majorPhoneBrands = vi.hoisted(() => [
  ["samsung", "Samsung Galaxy"],
  ["google-pixel", "Google Pixel"],
  ["oppo", "OPPO"],
] as const);

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
      {
        category: "tablet",
        slug: "samsung",
        models: [{ slug: "galaxy-tab-a8-sm-x200-sm-x205", model: "Galaxy Tab A8", repairTypes: [] }],
      },
      ...majorPhoneBrands.map(([slug, brand]) => ({
        category: "phone",
        slug,
        brand,
        models: [{
          slug: `${slug}-test-model`,
          model: `${brand} Test Model`,
          repairTypes: [{ slug: "screen-replacement", name: "Screen Replacement", price: 129 }],
        }],
      })),
      ...secondaryPhoneBrands.map(([slug, brand]) => ({
        category: "phone",
        slug,
        brand,
        models: [{
          slug: slug === "motorola" ? "moto-g04" : `${slug}-test-model`,
          model: slug === "motorola" ? "Moto G04" : `${brand} Test Model`,
          repairTypes: slug === "motorola"
            ? [
                { slug: "screen-replacement", name: "Screen Replacement", price: 129 },
                { slug: "battery-replacement", name: "Battery Replacement", price: 75 },
              ]
            : [{ slug: "screen-replacement", name: "Screen Replacement", price: 0 }],
        }],
      })),
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

    expect(container.textContent).toContain("iPhone repair in Ringwood for common faults including damaged screens, battery problems, charging issues and back glass damage.");
    expect(container.textContent).toContain("Screen options and availability depend on the exact iPhone model and current parts supply.");
    expect(container.textContent).toContain("Parts and Service History or related messages can vary by iPhone model, part option, pairing and iOS behaviour.");
    expect(container.querySelectorAll('a[href="#models-list"]')).toHaveLength(5);

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
    expect(serviceSchema?.provider).toBeDefined();
    expect(serviceSchema?.provider).toMatchObject({
      "@id": "https://www.alimobile.com.au/#localbusiness",
    });
    expect(serviceSchema?.provider).not.toHaveProperty("name");
    expect(serviceSchema?.provider).not.toHaveProperty("telephone");
    expect(serviceSchema?.provider).not.toHaveProperty("address");
    expect(serviceSchema?.hasOfferCatalog?.['@type']).toBe('OfferCatalog');
    expect(serviceSchema?.hasOfferCatalog?.itemListElement).toEqual(
      expect.arrayContaining([expect.objectContaining({ '@type': 'Offer' })]),
    );
  });

  it("renders the approved iPhone pricing and timing facts only in the hero and matching FAQs", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: "iphone" }) });
    const ssrHtml = renderToStaticMarkup(pageElement);
    const { container } = render(pageElement);

    const hero = container.querySelector(".repair-tech-hero");
    const heroCards = Array.from(hero?.querySelectorAll(".repair-hero-brand-proof-card") || []);
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How much does an iPhone repair cost?"
    ));

    expect(container.querySelector("main")).toBeNull();
    expect(hero?.getAttribute("aria-labelledby")).toBe("category-repair-heading");
    expect(heroCards).toHaveLength(3);
    expect(heroCards[0]?.textContent).toContain("iPhone Repair Pricing");
    expect(heroCards[0]?.textContent).toContain("Screen Replacement: AUD $50–$540");
    expect(heroCards[0]?.textContent).toContain("Battery Replacement: AUD $45–$250");
    expect(heroCards[0]?.textContent).toContain("Charging Port Repair: AUD $50–$220");
    expect(heroCards[0]?.textContent).toContain("Indicative AUD prices vary by model and repair options. Select your model for exact pricing or a quote.");
    expect(heroCards[1]?.textContent).toContain("Typical Repair Time: 15–60 Minutes");
    expect(heroCards[1]?.textContent).toContain("For many common iPhone repairs. Timing depends on model, parts availability and diagnosis. Complex repairs may take longer.");
    expect(heroCards[2]?.textContent).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your iPhone before starting any repair work.");
    expect(ssrHtml).toContain("Screen Replacement: AUD $50–$540");
    expect(ssrHtml).toContain("Battery Replacement: AUD $45–$250");
    expect(ssrHtml).toContain("Charging Port Repair: AUD $50–$220");
    expect(ssrHtml).toContain("Indicative AUD prices vary by model and repair options. Select your model for exact pricing or a quote.");
    expect(ssrHtml).toContain("Typical Repair Time: 15–60 Minutes");
    expect(ssrHtml).toContain("For many common iPhone repairs. Timing depends on model, parts availability and diagnosis. Complex repairs may take longer.");
    expect(ssrHtml).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your iPhone before starting any repair work.");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: AUD $50–$540");
    expect(pricingFaq?.textContent).toContain("Quote on Request");
    expect(container.textContent).toContain("Completed standard repairs include a 6-month warranty covering the replacement part and labour.");
    expect(container.textContent).toContain("The service has no warranty.");
    expect(container.textContent?.match(/Screen Replacement: AUD \$50–\$540/g)).toHaveLength(2);
    expect(container.querySelector('input[aria-label="Search model name or model code"]')).not.toBeNull();
    expect(container.textContent).not.toContain("live pricing");
    expect(container.textContent).not.toContain("Price Guide");
  });

  it("renders Samsung-only owner-reviewed pricing, shared timing and warranty facts in matching hero and FAQ content", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: "samsung" }) });
    const ssrHtml = renderToStaticMarkup(pageElement);
    const { container } = render(pageElement);
    const hero = container.querySelector(".repair-tech-hero");
    const heroCards = Array.from(hero?.querySelectorAll(".repair-hero-brand-proof-card") || []);
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How much does a Samsung phone repair cost?"
    ));
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How long can a Samsung repair take?"
    ));
    const warrantyFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "Do Samsung phone repairs include a warranty?"
    ));

    expect(heroCards).toHaveLength(3);
    expect(heroCards[0]?.textContent).toContain("Samsung Repair Pricing");
    expect(heroCards[0]?.textContent).toContain("Screen Replacement: AUD $129–$490");
    expect(heroCards[0]?.textContent).toContain("Battery Replacement: AUD $60–$120");
    expect(heroCards[0]?.textContent).toContain("Charging Port Repair: AUD $60–$120");
    expect(heroCards[0]?.textContent).toContain("Indicative AUD prices for supported non-foldable Galaxy models. Excludes Z Fold and Z Flip. Select your model for exact pricing or a quote.");
    expect(heroCards[1]?.textContent).toContain("Typical Repair Time: 15–60 Minutes");
    expect(heroCards[1]?.textContent).toContain("For many common Samsung repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.");
    expect(heroCards[2]?.textContent).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your Samsung phone before starting any repair work.");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: AUD $129–$490");
    expect(pricingFaq?.textContent).toContain("Quote on Request");
    expect(timingFaq?.textContent).toContain("15–60 Minutes");
    expect(timingFaq?.textContent).toContain("For many common Samsung repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.");
    expect(warrantyFaq?.textContent).toContain("Completed standard repairs include a 6-month warranty covering the replacement part and labour.");
    expect(warrantyFaq?.textContent).toContain("The service has no warranty.");
    expect(container.textContent).not.toContain("live pricing");
    expect(ssrHtml).toContain("Screen Replacement: AUD $129–$490");
    expect(ssrHtml).toContain("For many common Samsung repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.");
    expect(ssrHtml).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your Samsung phone before starting any repair work.");
  });

  it("keeps the owner-reviewed iPhone price rows off Samsung, Pixel, OPPO and secondary Brand Hubs", async () => {
    for (const [brandSlug] of [...majorPhoneBrands, secondaryPhoneBrands[0]]) {
      const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: brandSlug }) });
      const { container, unmount } = render(pageElement);

      expect(container.textContent).not.toContain("Screen Replacement: AUD $50–$540");
      expect(container.textContent).not.toContain("Battery Replacement: AUD $45–$250");
      expect(container.textContent).not.toContain("Charging Port Repair: AUD $50–$220");
      expect(container.querySelector("main")).toBeNull();

      unmount();
    }
  });

  it("keeps Samsung owner-reviewed price rows off iPhone, Pixel, OPPO and secondary Brand Hubs", async () => {
    for (const brandSlug of ["iphone", ...majorPhoneBrands.filter(([slug]) => slug !== "samsung").map(([slug]) => slug), secondaryPhoneBrands[0][0]]) {
      const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: brandSlug }) });
      const { container, unmount } = render(pageElement);

      expect(container.textContent).not.toContain("Screen Replacement: AUD $129–$490");
      expect(container.textContent).not.toContain("Battery Replacement: AUD $60–$120");
      expect(container.textContent).not.toContain("Charging Port Repair: AUD $60–$120");

      unmount();
    }
  });

  it("renders only the approved four local cards for the iPad Brand Hub", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "ipad" }) });
    const { container } = render(pageElement);

    expectApprovedLocalCards(container);
    expect(container.textContent).toContain("Many standard iPad repairs are completed in around 1 hour.");
    expect(container.textContent).toContain("some charging port repairs may require additional time");
    expect(container.textContent).not.toMatch(/iPad Repairs from \$50|45 minutes|same[ -]day|while you wait|immediate|instant/i);
  });

  it("keeps Samsung Tablet pricing catalogue-safe and gives only the approved standard-repair timing guidance", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "samsung" }) });
    const { container } = render(pageElement);

    expect(container.textContent).toContain("Samsung Tablet Repair");
    expect(container.textContent).toContain("View Current Pricing by Model");
    expect(container.textContent).toContain("Around 1 Hour for Standard Repairs");
    expect(container.textContent).not.toMatch(/from \$50|45 minutes|same[ -]day|while you wait|immediate/i);
    expect(container.querySelector('a[href="/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205"]')).not.toBeNull();
  });

  it("keeps Lenovo Tablet pricing catalogue-safe and gives only the approved standard-repair timing guidance", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "lenovo" }) });
    const { container } = render(pageElement);

    expect(container.textContent).toContain("Lenovo Tablet Repair");
    expect(container.textContent).toContain("View Current Pricing by Model");
    expect(container.textContent).toContain("Around 1 Hour for Standard Repairs");
    expect(container.textContent).not.toMatch(/Lenovo Tablet Repairs from \$50|from \$50|same[ -]day|while you wait|immediate/i);
  });

  it('emits no unpriced Offer nodes for all 15 secondary-phone brand hubs', async () => {
    for (const [brandSlug] of secondaryPhoneBrands) {
      const pageElement = await BrandHubPage({ params: Promise.resolve({ category: 'phone', brand: brandSlug }) });
      const { container, unmount } = render(pageElement);
      const serviceSchema = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
        .map((script) => JSON.parse(script.textContent || '{}'))
        .find((schema) => schema['@id'] === `https://www.alimobile.com.au/repairs/phone/${brandSlug}#service`);
      const serializedSchema = JSON.stringify(serviceSchema);

      expect(serviceSchema?.['@type']).toBe('Service');
      expect(serializedSchema).not.toContain('"@type":"Offer"');
      expect(serviceSchema?.serviceType).toEqual(expect.arrayContaining([
        expect.stringMatching(/Repair/),
        expect.stringMatching(/screen/i),
        expect.stringMatching(/battery/i),
      ]));

      unmount();
    }
  });

  it('derives the Motorola brand minimum only from exact catalogue prices and keeps the other 14 brands quote-led', async () => {
    for (const [brandSlug, brandName] of secondaryPhoneBrands) {
      const pageElement = await BrandHubPage({ params: Promise.resolve({ category: 'phone', brand: brandSlug }) });
      const { container, unmount } = render(pageElement);

      if (brandSlug === 'motorola') {
        expect(container.textContent).toContain('Motorola Repairs from $75');
      } else {
        expect(container.textContent).toContain(`${brandName} Repair Pricing`);
        expect(container.textContent).not.toMatch(new RegExp(`${brandName} Repairs from \\$`));
      }

      unmount();
    }
  });
});
