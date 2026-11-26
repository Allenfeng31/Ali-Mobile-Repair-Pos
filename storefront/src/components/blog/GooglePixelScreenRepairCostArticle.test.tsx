import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { GooglePixelScreenRepairPriceTable } from "@/data/googlePixelScreenRepairCost";
import { GooglePixelScreenRepairCostArticle } from "./GooglePixelScreenRepairCostArticle";

const styles = readFileSync(
  resolve(process.cwd(), "src/components/blog/GooglePixelScreenRepairCostArticle.module.css"),
  "utf8",
);

const priceTable: GooglePixelScreenRepairPriceTable = {
  fetchedAt: "2026-11-26T01:00:00.000Z",
  range: { min: 160, max: 370 },
  foldModels: [
    { model: "Pixel 10 Pro Fold", slug: "pixel-10-pro-fold" },
    { model: "Pixel 9 Pro Fold", slug: "pixel-9-pro-fold" },
  ],
  rows: [
    { model: "Pixel 10 Pro", slug: "pixel-10-pro", prices: { Genuine: 290, Premium: 270 }, quoteTiers: [] },
    { model: "Pixel 9 Pro XL", slug: "pixel-9-pro-xl", prices: { Premium: 370 }, quoteTiers: [] },
    { model: "Pixel 7 Pro", slug: "pixel-7-pro", prices: { Genuine: 320 }, quoteTiers: [] },
    { model: "Pixel 7", slug: "pixel-7", prices: { Genuine: 270 }, quoteTiers: [] },
    { model: "Pixel 6a", slug: "pixel-6a", prices: { Standard: 250 }, quoteTiers: [] },
    { model: "Pixel 3", slug: "pixel-3", prices: { Genuine: 160 }, quoteTiers: [] },
    { model: "Pixel 3a", slug: "pixel-3a", prices: {}, quoteTiers: ["Standard"] },
  ],
};

function renderArticle(table: GooglePixelScreenRepairPriceTable | null = priceTable) {
  return renderToStaticMarkup(<GooglePixelScreenRepairCostArticle priceTable={table} />);
}

describe("Google Pixel screen repair cost article", () => {
  it("renders a dynamic non-Fold price range and exact model options", () => {
    const html = renderArticle();
    const document = new DOMParser().parseFromString(html, "text/html");

    expect(document.body.textContent).toContain("prices range from $160 to $370");
    expect(html).toContain('aria-label="Pixel 10 Pro, Genuine, $290"');
    expect(html).toContain('aria-label="Pixel 10 Pro, Premium, $270"');
    expect(html).toContain('aria-label="Pixel 3a, Standard, Quote"');
    expect(html).not.toMatch(/aria-label="[^"]+, \$0"/);
    expect(html).not.toContain("$470");
    expect(html).not.toContain('aria-label="Pixel 10 Pro Fold');
    expect(html).toContain("Fold screen repair needs a component check");
  });

  it("links every displayed model to its canonical screen detail and folds older models", () => {
    const html = renderArticle();
    const document = new DOMParser().parseFromString(html, "text/html");

    expect(document.querySelector('a[href="/repairs/phone/google-pixel/pixel-7/screen-replacement"]')).not.toBeNull();
    expect(document.querySelector('a[href="/repairs/phone/google-pixel/pixel-7-pro/screen-replacement"]')).not.toBeNull();
    expect(document.querySelector('details[data-legacy-prices="true"] summary')?.textContent).toContain("Pixel 6 and earlier");
    expect(document.querySelector('details[data-legacy-prices="true"]')?.textContent).toContain("Pixel 3a");
    expect(document.querySelector('a[href*="pixel-10-pro-fold/screen-replacement"]')).toBeNull();
  });

  it("uses the approved internal links and bounded Pixel-specific guidance", () => {
    const html = renderArticle();

    [
      "/repairs/phone/google-pixel",
      "/repairs/screen-replacement",
      "/blog/phone-screen-black-but-still-on",
      "/book-repair",
      "https://pixelrepair.withgoogle.com/",
      "https://support.google.com/pixelphone/answer/14257407?hl=en-AU",
      "https://support.google.com/pixelphone/answer/14266732?hl=en-AU",
    ].forEach((href) => expect(html).toContain(`href="${href}"`));
    expect(html).toContain("Genuine, Premium and Standard are the quality-grade names");
    expect(html).toContain("does not restore the factory IP rating");
    expect(html).toContain("6-month warranty on the fitted part and workmanship");
    expect(html).not.toMatch(/same-day service|30.?60 minutes|premium AMOLED/i);
  });

  it("renders two verified public Pixel repair results without exposing customer content", () => {
    const html = renderArticle();
    const document = new DOMParser().parseFromString(html, "text/html");
    const imageSources = Array.from(document.querySelectorAll("img"))
      .map((image) => decodeURIComponent(image.getAttribute("src") ?? ""));

    expect(html).toContain("Real Google Pixel screen repair results");
    expect(html).toContain("Pixel 7");
    expect(html).toContain("Pixel 9");
    expect(imageSources.some((src) => src.includes("ab30828f-1c1b-4b95-96ec-e6613eb84bb6/before"))).toBe(true);
    expect(imageSources.some((src) => src.includes("ab30828f-1c1b-4b95-96ec-e6613eb84bb6/after"))).toBe(true);
    expect(imageSources.some((src) => src.includes("d1f43583-ff07-4530-8a75-d0332792d8cd/before"))).toBe(true);
    expect(imageSources.some((src) => src.includes("d1f43583-ff07-4530-8a75-d0332792d8cd/after"))).toBe(true);
    expect((html.match(/width="1600"/g) ?? [])).toHaveLength(4);
    expect((html.match(/height="2133"/g) ?? [])).toHaveLength(4);
  });

  it("provides nine accessible FAQs and a safe unavailable state", () => {
    const html = renderArticle();
    expect((html.match(/<details/g) ?? [])).toHaveLength(10);
    expect(html).toContain("Google Pixel screen replacement FAQs");

    const unavailable = renderArticle(null);
    expect(unavailable).toContain("Current fixed Google Pixel screen prices are temporarily unavailable");
    expect(unavailable).not.toContain("<table");
    expect(unavailable).not.toMatch(/\$(160|250|270|290|320|370|470)/);
  });

  it("uses 390px price cards and a single-column repair layout at 768px", () => {
    expect(styles).toContain("@media (max-width: 640px)");
    expect(styles).toContain("@media (max-width: 768px)");
    expect(styles).toContain("display: block");
    expect(styles).toContain("content: attr(data-label)");
    expect(styles).toMatch(/@media \(max-width: 768px\)[\s\S]*?\.photoPair\s*{[\s\S]*?grid-template-columns:\s*1fr/);
    expect(styles).not.toMatch(/min-width:\s*(610|680)px/);
    expect(styles).toContain("overflow-wrap: anywhere");
  });
});
