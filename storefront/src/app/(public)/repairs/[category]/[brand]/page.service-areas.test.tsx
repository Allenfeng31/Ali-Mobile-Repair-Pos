/**
 * @vitest-environment jsdom
 */
import { cleanup, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import BrandHubPage, { generateMetadata } from "./page";

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
      {
        category: "tablet",
        slug: "lenovo",
        brand: "Lenovo",
        models: [{ slug: "tab-p12", model: "Lenovo Tab P12", repairTypes: [] }],
      },
      {
        category: "laptop",
        slug: "macbook",
        brand: "MacBook",
        models: [{ slug: "macbook-air-m2", model: "MacBook Air M2", repairTypes: [] }],
      },
      {
        category: "watch",
        slug: "apple",
        brand: "Apple Watch",
        models: [{ slug: "apple-watch-series-9", model: "Apple Watch Series 9", repairTypes: [] }],
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
    expect(heroCards[0]?.textContent).toContain("Indicative AUD prices. Z Fold and Z Flip models excluded.");
    expect(heroCards[1]?.textContent).toContain("Typical Repair Time: 15–60 Minutes");
    expect(heroCards[1]?.textContent).toContain("For many common Samsung repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.");
    expect(heroCards[2]?.textContent).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your Samsung phone before starting any repair work.");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: AUD $129–$490");
    expect(pricingFaq?.textContent).toContain("Select your model for exact pricing or a quote.");
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

  it("renders Pixel-only owner-reviewed pricing, shared timing and warranty facts in matching hero and FAQ content", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: "google-pixel" }) });
    const ssrHtml = renderToStaticMarkup(pageElement);
    const { container } = render(pageElement);
    const hero = container.querySelector(".repair-tech-hero");
    const heroCards = Array.from(hero?.querySelectorAll(".repair-hero-brand-proof-card") || []);
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How much does a Google Pixel repair cost?"
    ));
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How long can a Google Pixel repair take?"
    ));
    const warrantyFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "Do Google Pixel repairs include a warranty?"
    ));

    expect(heroCards).toHaveLength(3);
    expect(heroCards[0]?.textContent).toContain("Google Pixel Repair Pricing");
    expect(heroCards[0]?.textContent).toContain("Screen Replacement: AUD $129–$450");
    expect(heroCards[0]?.textContent).toContain("Battery Replacement: AUD $65–$179");
    expect(heroCards[0]?.textContent).toContain("Charging Port Repair: AUD $65–$179");
    expect(heroCards[0]?.textContent).toContain("Indicative AUD prices for supported Google Pixel models, including Pixel Fold. Prices vary by model and repair options. Select your model for exact pricing or a quote.");
    expect(heroCards[1]?.textContent).toContain("Typical Repair Time: 15–60 Minutes");
    expect(heroCards[1]?.textContent).toContain("For many common Google Pixel repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.");
    expect(heroCards[2]?.textContent).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your Pixel before starting any repair work.");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: AUD $129–$450");
    expect(pricingFaq?.textContent).toContain("Pixel Fold");
    expect(pricingFaq?.textContent).toContain("Quote on Request");
    expect(timingFaq?.textContent).toContain("15–60 Minutes");
    expect(timingFaq?.textContent).toContain("Foldable and complex repairs may take longer.");
    expect(warrantyFaq?.textContent).toContain("Completed standard repairs include a 6-month warranty covering the replacement part and labour.");
    expect(warrantyFaq?.textContent).toContain("The service has no warranty.");
    expect(container.querySelector('a[href="/book-repair"]')?.textContent).toContain("Book a Repair");
    expect(container.textContent).not.toContain("live pricing");
    expect(container.textContent).not.toContain("Live Quote");
    expect(ssrHtml).toContain("Screen Replacement: AUD $129–$450");
    expect(ssrHtml).toContain("For many common Google Pixel repairs. Timing depends on model, parts availability and diagnosis. Foldable and complex repairs may take longer.");
    expect(ssrHtml).toContain("We check compatible parts, confirm repair pricing and explain expected timing for your Pixel before starting any repair work.");
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

  it("keeps Pixel owner-reviewed price rows off iPhone, Samsung, OPPO and secondary Brand Hubs", async () => {
    for (const brandSlug of ["iphone", "samsung", "oppo", secondaryPhoneBrands[0][0]]) {
      const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: brandSlug }) });
      const { container, unmount } = render(pageElement);

      expect(container.textContent).not.toContain("Screen Replacement: AUD $129–$450");
      expect(container.textContent).not.toContain("Battery Replacement: AUD $65–$179");
      expect(container.textContent).not.toContain("Charging Port Repair: AUD $65–$179");

      unmount();
    }
  });

  it("renders OPPO owner-reviewed pricing, timing and opening hours without a live-pricing promise", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: "oppo" }) });
    const { container } = render(pageElement);
    const heroCards = Array.from(container.querySelectorAll(".repair-tech-hero .repair-hero-brand-proof-card"));
    const pricingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "OPPO Repair Pricing");
    const timingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "OPPO Repair Time");
    const hoursCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Opening Hours");
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How much does an OPPO phone repair cost?");
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How long can an OPPO repair take?");

    expect(heroCards).toHaveLength(3);
    expect(pricingCard?.textContent).toContain("Screen Replacement: $129–$320");
    expect(pricingCard?.textContent).toContain("Battery Replacement: $79–$149");
    expect(pricingCard?.textContent).toContain("Charging Port Repair: $70–$149");
    expect(pricingCard?.textContent).toContain("Indicative AUD prices for applicable models. Select your exact OPPO model for available pricing or a quote.");
    expect(timingCard?.textContent).toContain("30–45 Minutes");
    expect(timingCard?.textContent).toContain("Many standard repairs take 30–45 minutes. Timing depends on the repair type, diagnosis and parts availability.");
    expect(hoursCard?.textContent).toContain("Monday–Saturday: 9:00am–5:00pm");
    expect(hoursCard?.textContent).toContain("Sunday: Closed");
    expect(hoursCard?.textContent).toContain("Walk-ins are welcome.");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: $129–$320; Battery Replacement: $79–$149; Charging Port Repair: $70–$149.");
    expect(timingFaq?.textContent).toContain("Many standard repairs take 30–45 minutes. Timing depends on the repair type, diagnosis and parts availability.");
    expect(container.textContent).not.toContain("Oppo Repairs from $79");
    expect(container.textContent).not.toContain("live pricing");
    expect(container.textContent).toContain("Completed standard repairs include a 6-month warranty covering the replacement part and labour.");
    expect(container.textContent).toContain("The service has no warranty.");
    expect(container.querySelector('a[href="/repairs/phone/oppo/oppo-test-model"]')).not.toBeNull();
  });

  it("keeps secondary phone pricing FAQs factual without a live-pricing promise", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "phone", brand: secondaryPhoneBrands[0][0] }) });
    const { container } = render(pageElement);

    expect(container.textContent).not.toContain("live pricing");
    expect(container.textContent).toContain("Choose your model to check available repair pricing or request a quote.");
  });

  it("uses one Call Us phone link for every Brand Hub Hero secondary CTA", async () => {
    const cases = [
      { category: "phone", brand: "iphone", primary: "Choose your iPhone model", secondary: "Call Us", href: "tel:0481058514" },
      { category: "phone", brand: "samsung", primary: "View model option", secondary: "Call Us", href: "tel:0481058514" },
      { category: "phone", brand: "google-pixel", primary: "View model option", secondary: "Call Us", href: "tel:0481058514" },
      { category: "phone", brand: "oppo", primary: "Choose your OPPO model", secondary: "Call Us", href: "tel:0481058514" },
      { category: "phone", brand: secondaryPhoneBrands[0][0], primary: "View model option", secondary: "Call Us", href: "tel:0481058514" },
      { category: "tablet", brand: "ipad", primary: "Choose your iPad model", secondary: "Call Us", href: "tel:0481058514" },
      { category: "tablet", brand: "samsung", primary: "Choose your Samsung tablet model", secondary: "Call Us", href: "tel:0481058514" },
      { category: "tablet", brand: "lenovo", primary: "Choose your Lenovo tablet model", secondary: "Call Us", href: "tel:0481058514" },
      { category: "laptop", brand: "macbook", primary: "Choose your MacBook model", secondary: "Call Us", href: "tel:0481058514" },
      { category: "watch", brand: "apple", primary: "View model option", secondary: "Call Us", href: "tel:0481058514" },
    ];

    for (const testCase of cases) {
      const pageElement = await BrandHubPage({ params: Promise.resolve(testCase) });
      const { container, unmount } = render(pageElement);
      const hero = container.querySelector(".repair-tech-hero");
      const primary = hero?.querySelector<HTMLAnchorElement>(".repair-primary-action");
      const secondary = hero?.querySelector<HTMLAnchorElement>(".repair-secondary-action");

      expect(primary?.textContent).toContain(testCase.primary);
      expect(primary?.getAttribute("href")).toBe("#models-list");
      expect(secondary?.textContent).toContain(testCase.secondary);
      expect(secondary?.getAttribute("href")).toBe(testCase.href);
      expect(secondary?.getAttribute("aria-label")).toBeNull();
      expect(hero?.textContent).not.toContain("Live Quote");
      expect(hero?.textContent).not.toContain("Get a repair quote");
      expect(hero?.textContent).not.toContain("Book a Repair");

      unmount();
    }
  });

  it("keeps Apple Watch commercial facts on the Apple Watch Brand Hub", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ category: "watch", brand: "apple" }) });
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "watch", brand: "apple" }) });
    const ssrHtml = renderToStaticMarkup(pageElement);
    const { container } = render(pageElement);
    const heroCards = Array.from(container.querySelectorAll(".repair-tech-hero .repair-hero-brand-proof-card"));
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How much does Apple Watch repair cost?"
    ));
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "How long does Apple Watch repair take?"
    ));
    const warrantyFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => (
      item.querySelector("summary")?.textContent === "Do Apple Watch repairs include warranty?"
    ));

    expect(metadata.title).toBe("Apple Watch Repair | Screen, Battery & Diagnostics | Ali Mobile");
    expect(metadata.description).toBe("Apple Watch screen repairs from $150 and battery replacements from $90. Many standard repairs take around 45 minutes. 6-month warranty on eligible repairs.");
    expect(heroCards).toHaveLength(3);
    expect(heroCards[0]?.textContent).toContain("Apple Watch Repair Pricing");
    expect(heroCards[0]?.textContent).toContain("Selected Apple Watch screen repairs start from $150 and selected battery replacements from $90.");
    expect(heroCards[1]?.textContent).toContain("Water-damage repairs are excluded.");
    expect(heroCards[2]?.textContent).toContain("Typical Repair Time: around 45 minutes");
    expect(heroCards[2]?.textContent).toContain("Complex repairs or work requiring parts ordering may take longer.");
    expect(pricingFaq?.textContent).toContain("Selected Apple Watch screen repairs start from $150 and selected battery replacements from $90.");
    expect(timingFaq?.textContent).toContain("Many standard Apple Watch repairs take around 45 minutes.");
    expect(timingFaq?.textContent).not.toContain("1-2 days");
    expect(warrantyFaq?.textContent).toContain("Water-damage repairs are excluded.");
    expect(ssrHtml).toContain("Selected Apple Watch screen repairs start from $150 and selected battery replacements from $90.");
    expect(ssrHtml).toContain('href="/repairs/watch/apple/apple-watch-series-9"');
  });

  it("renders the owner-reviewed iPad pricing, timing and opening-hours cards", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "ipad" }) });
    const { container } = render(pageElement);

    expectApprovedLocalCards(container);
    const heroCards = Array.from(container.querySelectorAll(".repair-tech-hero .repair-hero-brand-proof-card"));
    const pricingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "iPad Repair Pricing");
    const timingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "iPad Repair Time");
    const hoursCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Opening Hours");
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How much does an iPad repair cost?");
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How long can an iPad repair take?");

    expect(heroCards).toHaveLength(3);
    expect(pricingCard?.textContent).toContain("Screen Replacement: $99–$420");
    expect(pricingCard?.textContent).toContain("Battery Replacement: $100–$190");
    expect(pricingCard?.textContent).toContain("Charging Port Repair: $120–$179");
    expect(pricingCard?.querySelectorAll("li")).toHaveLength(3);
    expect(pricingCard?.textContent).toContain("Indicative AUD prices for applicable models. Select your exact iPad model for available pricing or a quote.");
    expect(timingCard?.textContent).toContain("Around 1 Hour");
    expect(timingCard?.textContent).toContain("Many standard repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.");
    expect(hoursCard?.textContent).toContain("Monday–Saturday: 9:00am–5:00pm");
    expect(hoursCard?.textContent).toContain("Sunday: Closed");
    expect(hoursCard?.textContent).toContain("Walk-ins are welcome.");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: $99–$420; Battery Replacement: $100–$190; Charging Port Repair: $120–$179.");
    expect(timingFaq?.textContent).toContain("Many standard repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.");
    const heroIntroduction = Array.from(container.querySelectorAll(".repair-tech-hero-copy > p"));
    expect(heroIntroduction).toHaveLength(2);
    expect(heroIntroduction[0]?.textContent).toBe("Cracked iPad screen, battery problems or charging issues? We repair supported iPad, iPad Air, iPad mini and iPad Pro models.");
    expect(heroIntroduction[1]?.textContent).toBe("Choose your model to check repair options and pricing, or request a quote. Walk-ins are welcome at our Ringwood store.");
    expect(container.textContent).toContain("How much does an iPad repair cost?");
    expect(container.textContent).toContain("How long can an iPad repair take?");
    expect(container.textContent).not.toMatch(/iPad Repairs from \$50|45 minutes|same[ -]day|while you wait|immediate|instant/i);
  });

  it("keeps iPad owner-reviewed pricing off other Brand Hubs", async () => {
    for (const [category, brand] of [["phone", "iphone"], ["tablet", "samsung"], ["tablet", "lenovo"], ["laptop", "macbook"], ["watch", "apple"]] as const) {
      const pageElement = await BrandHubPage({ params: Promise.resolve({ category, brand }) });
      const { container, unmount } = render(pageElement);

      expect(container.textContent).not.toContain("Screen Replacement: $99–$420");
      expect(container.textContent).not.toContain("Battery Replacement: $100–$190");
      expect(container.textContent).not.toContain("Charging Port Repair: $120–$179");

      unmount();
    }
  });

  it("renders Samsung tablet owner-reviewed pricing, timing and opening hours while preserving the warranty FAQ", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "samsung" }) });
    const { container } = render(pageElement);
    const heroCards = Array.from(container.querySelectorAll(".repair-tech-hero .repair-hero-brand-proof-card"));
    const pricingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Samsung Tablet Repair Pricing");
    const timingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Samsung Tablet Repair Time");
    const hoursCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Opening Hours");
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How much does Samsung tablet repair cost?");
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How long can a Samsung tablet repair take?");
    const warrantyFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "What warranty applies to Samsung tablet repair?");

    expect(container.textContent).toContain("Samsung Tablet Repair");
    expect(heroCards).toHaveLength(3);
    expect(pricingCard?.textContent).toContain("Galaxy Tab A Screen Replacement: $139–$220");
    expect(pricingCard?.textContent).toContain("Galaxy Tab S Screen Replacement: $180–$450");
    expect(pricingCard?.textContent).toContain("Battery Replacement: $90–$179");
    expect(pricingCard?.textContent).toContain("Charging Port Repair: $89–$150");
    expect(pricingCard?.textContent).toContain("Galaxy Tab Active and other Samsung tablets may need a model-specific price or Quote on Request.");
    expect(timingCard?.textContent).toContain("Around 1 Hour");
    expect(timingCard?.textContent).toContain("Many standard Samsung Tablet repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.");
    expect(hoursCard?.textContent).toContain("Monday–Saturday: 9:00am–5:00pm");
    expect(hoursCard?.textContent).toContain("Sunday: Closed");
    expect(pricingFaq?.textContent).toContain("Galaxy Tab A Screen Replacement: $139–$220; Galaxy Tab S Screen Replacement: $180–$450; Battery Replacement: $90–$179; Charging Port Repair: $89–$150.");
    expect(timingFaq?.textContent).toContain("Many standard Samsung Tablet repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.");
    expect(warrantyFaq?.textContent).toContain("Completed standard repairs include a 6-month warranty covering the replacement part and labour.");
    expect(warrantyFaq?.textContent).toContain("The service has no warranty.");
    expect(container.textContent).toContain("Samsung tablet repair in Ringwood for cracked screens, battery problems and charging issues.");
    expect(container.textContent).not.toMatch(/from \$50|45 minutes|same[ -]day|while you wait|immediate/i);
    expect(container.querySelector('a[href="/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205"]')).not.toBeNull();
  });

  it("renders Lenovo tablet owner-reviewed pricing, timing and opening hours", async () => {
    const pageElement = await BrandHubPage({ params: Promise.resolve({ category: "tablet", brand: "lenovo" }) });
    const { container } = render(pageElement);
    const heroCards = Array.from(container.querySelectorAll(".repair-tech-hero .repair-hero-brand-proof-card"));
    const pricingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Lenovo Tablet Repair Pricing");
    const timingCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Lenovo Tablet Repair Time");
    const hoursCard = heroCards.find((card) => card.querySelector("h2")?.textContent === "Opening Hours");
    const pricingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How much does Lenovo tablet repair cost?");
    const timingFaq = Array.from(container.querySelectorAll(".faq-item")).find((item) => item.querySelector("summary")?.textContent === "How long can a Lenovo tablet repair take?");

    expect(container.textContent).toContain("Lenovo Tablet Repair");
    expect(heroCards).toHaveLength(3);
    expect(pricingCard?.textContent).toContain("Screen Replacement: $120–$240");
    expect(pricingCard?.textContent).toContain("Battery Replacement: $89–$149");
    expect(pricingCard?.textContent).toContain("Charging Port Repair: $79–$150");
    expect(timingCard?.textContent).toContain("Around 1 Hour");
    expect(timingCard?.textContent).toContain("Many standard Lenovo tablet repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.");
    expect(hoursCard?.textContent).toContain("Monday–Saturday: 9:00am–5:00pm");
    expect(hoursCard?.textContent).toContain("Sunday: Closed");
    expect(pricingFaq?.textContent).toContain("Screen Replacement: $120–$240; Battery Replacement: $89–$149; Charging Port Repair: $79–$150.");
    expect(timingFaq?.textContent).toContain("Many standard Lenovo tablet repairs take around 1 hour. Timing depends on the repair type, diagnosis and parts availability.");
    expect(container.textContent).toContain("Lenovo tablet repair in Ringwood for cracked screens, battery problems and charging issues.");
    expect(container.textContent).not.toMatch(/Lenovo Tablet Repairs from \$50|from \$50|same[ -]day|while you wait|immediate/i);
  });

  it("uses owner-reviewed tablet pricing and authoritative opening hours in metadata", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ category: "tablet", brand: "ipad" }) })).resolves.toMatchObject({
      description: "iPad repair in Ringwood. Screen $99–$420, battery $100–$190, charging $120–$179 (indicative). Around 1 hour for many repairs. Open Mon–Sat 9am–5pm.",
    });
    await expect(generateMetadata({ params: Promise.resolve({ category: "tablet", brand: "samsung" }) })).resolves.toMatchObject({
      description: "Samsung tablet repair in Ringwood. Galaxy Tab A screens $139–$220; Tab S screens $180–$450; battery $90–$179; charging $89–$150 (indicative). Open Mon–Sat 9am–5pm.",
    });
    await expect(generateMetadata({ params: Promise.resolve({ category: "tablet", brand: "lenovo" }) })).resolves.toMatchObject({
      description: "Lenovo tablet repair in Ringwood. Screen $120–$240, battery $89–$149, charging $79–$150 (indicative). Open Mon–Sat 9am–5pm.",
    });
  });

  it("uses owner-reviewed OPPO pricing, timing and opening hours in metadata", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ category: "phone", brand: "oppo" }) })).resolves.toMatchObject({
      description: "OPPO phone repair in Ringwood. Screen $129–$320, battery $79–$149, charging $70–$149 (indicative). Repairs often take 30–45 min. Open Mon–Sat 9am–5pm.",
    });
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
