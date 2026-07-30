import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { IphoneScreenRepairCostArticle } from "./IphoneScreenRepairCostArticle";
import { IPHONE_SCREEN_REPAIR_PRICES } from "@/data/iphoneScreenRepairCost";

const articleSource = readFileSync(resolve(process.cwd(), "src/components/blog/IphoneScreenRepairCostArticle.tsx"), "utf8");
const articleStyles = readFileSync(resolve(process.cwd(), "src/components/blog/IphoneScreenRepairCostArticle.module.css"), "utf8");

describe("IphoneScreenRepairCostArticle", () => {
  it("renders the accessible price, image and sample evidence", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle />);

    expect(html).toContain("Current Ali Mobile iPhone screen replacement prices by model and screen option");
    expect(html).toContain("<details");
    expect(html).toContain("More iPhone models (13)");
    expect(html).toContain("Earlier iPhone screen replacement prices by model and screen option");
    expect(html.indexOf("iPhone 11")).toBeLessThan(html.indexOf("<details"));
    expect(html.indexOf("iPhone XS Max")).toBeGreaterThan(html.indexOf("<details"));
    expect(html).toContain("Not currently listed online. Contact us to confirm current screen options.");
    expect(html).toContain("Side-by-side comparison of LCD in-cell, Soft OLED and Original iPhone screens");
    expect(html).toContain("LCD in-cell replacement screen fitted to an iPhone");
    expect(html).toContain("Soft OLED replacement screen fitted to an iPhone");
    expect(html).toContain("Original iPhone screen used for display comparison");
    expect(html).toContain("What 100 iPhone screen repair customers chose");
    expect(html).toContain("72 customers");
    expect(html).toContain("72% of the sample");
    expect(html).toContain("21 customers");
    expect(html).toContain("21% of the sample");
    expect(html).toContain("7 customers");
    expect(html).toContain("7% of the sample");
    expect(html).toContain("not an Australia-wide market survey");
    expect(html).toContain("True Tone requires a compatible display and correct repair programming");
    expect(html).toContain("✓ Supported*");
    expect(html).toContain("Does not reproduce 120Hz ProMotion on models originally equipped with it.");
    expect(html).not.toContain("closest");
    expect(html).not.toContain("Apple Official Cert");
    expect(html).not.toContain("Apple Certified");
    expect(html).not.toContain("Apple-authorised");
  });

  it("uses the single price data source in one responsive table rendering", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle />);

    expect(articleSource).toContain('from "@/data/iphoneScreenRepairCost"');
    expect(articleSource).toContain("CURRENT_IPHONE_SCREEN_REPAIR_PRICES");
    expect(articleSource).toContain("OLDER_IPHONE_SCREEN_REPAIR_PRICES");
    expect(articleSource).toContain("rows.map");
    expect(articleSource).not.toMatch(/\bfetch\s*\(/);
    expect(articleSource).not.toMatch(/\$\d+/);
    expect(IPHONE_SCREEN_REPAIR_PRICES).toHaveLength(44);
    IPHONE_SCREEN_REPAIR_PRICES.forEach(({ model }) => {
      expect(html.match(new RegExp(`>${model}</th>`, "g")) ?? []).toHaveLength(1);
    });
  });

  it("keeps each price cell labelled for the mobile card layout", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle />);

    expect(html).toContain('aria-label="iPhone 17 Pro Max, LCD / In-cell, $190"');
    expect(html).toContain('aria-label="iPhone 17 Pro Max, Soft OLED, $320"');
    expect(html).toContain('aria-label="iPhone 17 Pro Max, Original, $599"');
    expect(html).toContain('aria-hidden="true">LCD / In-cell</span>');
    expect(html).toContain('aria-hidden="true">Soft OLED</span>');
    expect(html).toContain('aria-hidden="true">Original</span>');
    expect(articleStyles).toContain("@media (max-width: 640px)");
    expect(articleStyles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
  });

  it("keeps one semantic comparison table with labelled mobile values", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle />);
    const comparisonTableStart = html.indexOf("How the three public screen options differ");
    const comparisonTable = html.slice(comparisonTableStart, html.indexOf("</table>", comparisonTableStart));
    const comparisonRows = comparisonTable.match(/<tr><th scope="row">[\s\S]*?<\/tr>/g) ?? [];
    const expectedMobileLabels = ["LCD / In-cell", "Soft OLED", "Original Screen"];

    expect(comparisonTableStart).toBeGreaterThan(-1);
    expect((html.match(/How the three public screen options differ/g) ?? [])).toHaveLength(1);
    expect(articleSource.match(/<table className=\{styles\.comparisonTable\}>/g) ?? []).toHaveLength(1);
    expect((comparisonTable.match(/<tr>/g) ?? [])).toHaveLength(9);
    expect((comparisonTable.match(/<th scope="col">/g) ?? [])).toHaveLength(4);
    expect(comparisonRows).toHaveLength(8);
    comparisonRows.forEach((row) => {
      expect((row.match(/<td/g) ?? [])).toHaveLength(3);
      expect(Array.from(row.matchAll(/aria-hidden="true">([^<]+)<\/span>/g), ([, label]) => label)).toEqual(expectedMobileLabels);
    });
    expect((comparisonTable.match(/>LCD \/ In-cell<\/span>/g) ?? [])).toHaveLength(8);
    expect((comparisonTable.match(/>Soft OLED<\/span>/g) ?? [])).toHaveLength(8);
    expect((comparisonTable.match(/>Original Screen<\/span>/g) ?? [])).toHaveLength(8);
    expect(articleSource).toContain("SCREEN_OPTION_COLUMNS.map");
    expect(articleSource).toContain("{column.label}");
    expect(articleSource).not.toContain("SCREEN_OPTION_LABELS");
    expect(comparisonTable).toContain("★★★★★");
    expect(comparisonTable).toContain("△ Depends");
    expect(comparisonTable).toContain("Original display technology");
    expect(articleStyles).toContain(".comparisonTableScroll { overflow: visible");
    expect(articleStyles).toContain(".comparisonTable tbody tr { display: grid");
    expect(articleStyles).toContain("grid-template-columns: minmax(105px, 38%) minmax(0, 1fr)");
    expect(articleStyles).toContain("grid-template-columns: minmax(92px, 36%) minmax(0, 1fr)");
  });
});
