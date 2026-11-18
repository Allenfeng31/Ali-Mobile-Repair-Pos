import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SamsungGalaxySScreenRepairCostArticle } from "./SamsungGalaxySScreenRepairCostArticle";
import type { SamsungGalaxySScreenRepairPriceTable } from "@/data/samsungGalaxySScreenRepairCost";

const articleSource = readFileSync(
  resolve(process.cwd(), "src/components/blog/SamsungGalaxySScreenRepairCostArticle.tsx"),
  "utf8",
);
const articleStyles = readFileSync(
  resolve(process.cwd(), "src/components/blog/SamsungGalaxySScreenRepairCostArticle.module.css"),
  "utf8",
);

const currentPriceTable: SamsungGalaxySScreenRepairPriceTable = {
  columns: ["Genuine", "Premium"],
  fetchedAt: "2026-11-18T01:00:00.000Z",
  rows: [
    { model: "Galaxy S26 Ultra", prices: { Genuine: 490 }, quoteTiers: [] },
    { model: "Galaxy S25 Ultra", prices: { Genuine: 420, Premium: 320 }, quoteTiers: [] },
    { model: "Galaxy S24 Ultra", prices: { Genuine: 399, Premium: 320 }, quoteTiers: [] },
    { model: "Galaxy S23 Ultra", prices: { Genuine: 390, Premium: 298 }, quoteTiers: [] },
    { model: "Galaxy S23", prices: { Genuine: 290 }, quoteTiers: [] },
    { model: "Galaxy S22 Ultra", prices: { Genuine: 390, Premium: 298 }, quoteTiers: [] },
    { model: "Galaxy S20 FE", prices: { Genuine: 190 }, quoteTiers: [] },
  ],
};

function renderArticle(priceTable: SamsungGalaxySScreenRepairPriceTable | null = currentPriceTable) {
  return renderToStaticMarkup(<SamsungGalaxySScreenRepairCostArticle priceTable={priceTable} />);
}

describe("SamsungGalaxySScreenRepairCostArticle", () => {
  it("renders the catalogue-backed price table and its customer-facing option contract", () => {
    const html = renderArticle();

    expect(html).toContain("Samsung Galaxy S screen replacement prices");
    expect(html).toContain("Genuine");
    expect(html).toContain("Premium");
    expect(html).toContain("Galaxy S26 Ultra");
    expect(html).toContain("Galaxy S20 FE");
    expect(html).toContain('aria-label="Galaxy S26 Ultra, Premium, —"');
    expect(html).toContain('aria-label="Galaxy S25 Ultra, Genuine, $420"');
    expect(html).toContain('aria-label="Galaxy S25 Ultra, Premium, $320"');
    expect((html.match(/<tbody>/g) ?? [])).toHaveLength(1);
    expect((html.match(/<tr>/g) ?? []).length).toBe(8);
    expect(html).toContain("not currently listed in the online catalogue");
    expect(html).toContain("Catalogue snapshot refreshed 18 November 2026");
  });

  it("links only the verified priority models from their table row headings", () => {
    const html = renderArticle();
    const document = new DOMParser().parseFromString(html, "text/html");
    const table = document.querySelector("table");

    expect(table).not.toBeNull();

    const linkedModels = Array.from(table?.querySelectorAll<HTMLAnchorElement>('tbody th[scope="row"] a') ?? [])
      .map((link) => ({ model: link.textContent, href: link.getAttribute("href") }));

    expect(linkedModels).toEqual([
      {
        model: "Galaxy S24 Ultra",
        href: "/repairs/phone/samsung/galaxy-s24-ultra/screen-replacement",
      },
      {
        model: "Galaxy S23 Ultra",
        href: "/repairs/phone/samsung/galaxy-s23-ultra/screen-replacement",
      },
      {
        model: "Galaxy S22 Ultra",
        href: "/repairs/phone/samsung/galaxy-s22-ultra/screen-replacement",
      },
    ]);
    expect(table?.querySelector('a[href*="galaxy-s25-ultra"]')).toBeNull();
    expect(table?.querySelector('a[href*="galaxy-s24/screen-replacement"]')).toBeNull();
    expect(articleStyles).toContain(".modelLink");
    expect(articleStyles).toContain(".modelLink:focus-visible");
  });

  it("keeps first-party observations bounded and does not promise water, biometric, S Pen, or refresh outcomes", () => {
    const html = renderArticle();

    expect(html).toContain("In our repair experience");
    expect(html).toContain("does not restore factory water resistance");
    expect(html).toContain("does not intentionally erase customer data");
    expect(html).not.toMatch(/restored IP68|waterproof again|all aftermarket screens are 60Hz|fingerprint always fails|S Pen always fails/i);
  });

  it("renders real Galaxy S before-and-after screen repair examples with accessible local WebP evidence", () => {
    const html = renderArticle();

    expect(html).toContain("Real Samsung Screen Repair Examples");
    expect(html).toContain("Galaxy S22 Ultra");
    expect(html).toContain("Galaxy S24");
    expect(html).toContain("Galaxy S24 Ultra");
    expect((html.match(/>Before</g) ?? [])).toHaveLength(3);
    expect((html.match(/>After</g) ?? [])).toHaveLength(3);
    expect(html).toContain("Galaxy S22 Ultra before screen replacement showing a bright horizontal line and blacked-out lower display");
    expect(html).toContain("Galaxy S24 before screen replacement showing yellow banding and horizontal line damage");
    expect(html).toContain("Galaxy S24 Ultra before screen replacement showing green-line and white-block display damage");
    [
      "samsung-galaxy-s22-ultra-screen-replacement-before.webp",
      "samsung-galaxy-s22-ultra-screen-replacement-after.webp",
      "samsung-galaxy-s24-screen-replacement-before.webp",
      "samsung-galaxy-s24-screen-replacement-after.webp",
      "samsung-galaxy-s24-ultra-screen-replacement-before.webp",
      "samsung-galaxy-s24-ultra-screen-replacement-after.webp",
    ].forEach((filename) => expect(articleSource).toContain(`/images/blog/${filename}`));
    expect(articleSource).toContain('from "next/image"');
    expect(articleSource).not.toMatch(/priority|preload|fetchPriority/);
    expect(articleStyles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
    expect(articleStyles).toContain(".repairPair {\n    grid-template-columns: 1fr;");
  });

  it("keeps the guide navigation, decision order, and contextual repair links concise", () => {
    const html = renderArticle();

    expect(html).toContain("In this guide");
    [
      "#samsung-price-table-heading",
      "#comparison-heading",
      "#frame-heading",
      "#real-repair-examples-heading",
      "#samsung-screen-faq-heading",
    ].forEach((href) => expect(html).toContain(`href=\"${href}\"`));
    expect(html.indexOf("When is a Premium screen worth considering?")).toBeLessThan(
      html.indexOf("Why does the frame matter on a Samsung OLED repair?"),
    );
    [
      "/repairs/phone/samsung",
      "/repairs/screen-replacement",
      "/repairs/phone/samsung/galaxy-s22-ultra/screen-replacement",
      "/repairs/phone/samsung/galaxy-s24/screen-replacement",
      "/repairs/phone/samsung/galaxy-s24-ultra/screen-replacement",
      "/book-repair",
    ].forEach((href) => expect(html).toContain(`href=\"${href}\"`));
    expect((html.match(/<a href="\//g) ?? [])).toHaveLength(8);
    expect(articleStyles).toContain(".readingSection");
    expect(articleStyles).toContain(".wideSection");
  });

  it("keeps catalogue access in the server route rather than the article component", () => {
    expect(articleSource).toContain('from "@/data/samsungGalaxySScreenRepairCost"');
    expect(articleSource).not.toMatch(/fetchRepairCatalog|fetchPOSInventory|supabase|\bfetch\s*\(/);
  });

  it("keeps current tier names distinct while retaining qualified aftermarket guidance", () => {
    const html = renderArticle();

    expect(html).toContain("Genuine vs Premium");
    expect(html).toContain("Premium is the current catalogue tier name");
    expect(html).toContain("aftermarket");
    expect(html).not.toContain("Samsung Service Pack");
    expect(html).not.toContain("Aftermarket Display + Frame");
    expect(html).not.toContain("options in this guide are complete display + frame assemblies");
    expect(html).toContain("does not mean Ali Mobile is Samsung or an authorised Samsung Service Centre");
  });

  it("renders quote-required and unavailable states without inventing a zero price", () => {
    const html = renderArticle({
      columns: ["Genuine", "Premium"],
      fetchedAt: null,
      rows: [{ model: "Galaxy S25 Ultra", prices: {}, quoteTiers: ["Genuine"] }],
    });

    expect(html).toContain('aria-label="Galaxy S25 Ultra, Genuine, Quote"');
    expect(html).toContain('aria-label="Galaxy S25 Ultra, Premium, —"');
    expect(html).not.toContain("$0");
  });

  it("shows a catalogue-unavailable state without falling back to stale fixed prices", () => {
    const html = renderArticle(null);

    expect(html).toContain("Current fixed Samsung Galaxy S screen prices are not available");
    expect(html).not.toContain("<table");
    expect(html).not.toMatch(/\$(190|290|298|320|390|399|420|490)/);
  });
});
