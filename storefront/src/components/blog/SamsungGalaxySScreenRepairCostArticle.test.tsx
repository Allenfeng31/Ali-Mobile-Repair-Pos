import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SamsungGalaxySScreenRepairCostArticle } from "./SamsungGalaxySScreenRepairCostArticle";

const articleSource = readFileSync(
  resolve(process.cwd(), "src/components/blog/SamsungGalaxySScreenRepairCostArticle.tsx"),
  "utf8",
);
const articleStyles = readFileSync(
  resolve(process.cwd(), "src/components/blog/SamsungGalaxySScreenRepairCostArticle.module.css"),
  "utf8",
);

describe("SamsungGalaxySScreenRepairCostArticle", () => {
  it("renders the complete static price table and its customer-facing option contract", () => {
    const html = renderToStaticMarkup(<SamsungGalaxySScreenRepairCostArticle />);

    expect(html).toContain("Samsung Galaxy S screen replacement prices");
    expect(html).toContain("Samsung Service Pack + Frame");
    expect(html).toContain("Aftermarket Display + Frame");
    expect(html).toContain("Galaxy S26 Ultra");
    expect(html).toContain("Galaxy S20 FE");
    expect(html).toContain('aria-label="Galaxy S26 Ultra, Aftermarket Display + Frame, —"');
    expect(html).toContain('aria-label="Galaxy S25 Ultra, Aftermarket Display + Frame, $340"');
    expect((html.match(/<tbody>/g) ?? [])).toHaveLength(1);
    expect((html.match(/<tr>/g) ?? []).length).toBeGreaterThanOrEqual(26);
    expect(html).toContain("Ali Mobile does not currently list an aftermarket display + frame option for that exact model.");
    expect(html).toContain("8 September 2026");
  });

  it("keeps first-party observations bounded and does not promise water, biometric, S Pen, or refresh outcomes", () => {
    const html = renderToStaticMarkup(<SamsungGalaxySScreenRepairCostArticle />);

    expect(html).toContain("In our repair experience");
    expect(html).toContain("does not restore factory water resistance");
    expect(html).toContain("does not intentionally erase customer data");
    expect(html).not.toMatch(/restored IP68|waterproof again|all aftermarket screens are 60Hz|fingerprint always fails|S Pen always fails/i);
  });

  it("renders real Galaxy S before-and-after screen repair examples with accessible local WebP evidence", () => {
    const html = renderToStaticMarkup(<SamsungGalaxySScreenRepairCostArticle />);

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
    const html = renderToStaticMarkup(<SamsungGalaxySScreenRepairCostArticle />);

    expect(html).toContain("In this guide");
    [
      "#samsung-price-table-heading",
      "#comparison-heading",
      "#frame-heading",
      "#real-repair-examples-heading",
      "#samsung-screen-faq-heading",
    ].forEach((href) => expect(html).toContain(`href=\"${href}\"`));
    expect(html.indexOf("When is an aftermarket screen worth considering?")).toBeLessThan(
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

  it("uses only static article data and no runtime catalogue or POS price reader", () => {
    expect(articleSource).toContain('from "@/data/samsungGalaxySScreenRepairCost"');
    expect(articleSource).not.toMatch(/fetchRepairCatalog|fetchPOSInventory|supabase|\bfetch\s*\(/);
  });
});
