import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { IphoneScreenRepairCostArticle } from "./IphoneScreenRepairCostArticle";
import { buildIphoneScreenRepairPriceTable } from "@/data/iphoneScreenRepairCost";

const articleSource = readFileSync(resolve(process.cwd(), "src/components/blog/IphoneScreenRepairCostArticle.tsx"), "utf8");
const articleStyles = readFileSync(resolve(process.cwd(), "src/components/blog/IphoneScreenRepairCostArticle.module.css"), "utf8");
const priceTable = buildIphoneScreenRepairPriceTable({
  fetchedAt: "2026-10-08T01:23:00.000Z",
  brands: [{
    category: "phone",
    slug: "iphone",
    models: [
      { model: "iPhone 18", repairTypes: [{ slug: "screen-replacement", price: 0, variants: [{ quality_grade: "Premium", price: 0 }] }] },
      { model: "iPhone 17 Pro Max", repairTypes: [{ slug: "screen-replacement", price: 190, variants: [{ quality_grade: "Standard", price: 190 }, { quality_grade: "Premium", price: 299 }, { quality_grade: "Genuine", price: 570 }] }] },
      { model: "iPhone 15 Pro", repairTypes: [{ slug: "screen-replacement", price: 170, variants: [{ quality_grade: "Standard", price: 170 }, { quality_grade: "Premium", price: 230 }, { quality_grade: "Genuine", price: 390 }] }] },
      { model: "iPhone 14 Pro", repairTypes: [{ slug: "screen-replacement", price: 170, variants: [{ quality_grade: "Standard", price: 170 }, { quality_grade: "Premium", price: 220 }, { quality_grade: "Genuine", price: 290 }] }] },
      { model: "iPhone 13", repairTypes: [{ slug: "screen-replacement", price: 129, variants: [{ quality_grade: "Standard", price: 129 }, { quality_grade: "Premium", price: 169 }, { quality_grade: "Genuine", price: 240 }] }] },
      { model: "iPhone 12", repairTypes: [{ slug: "screen-replacement", price: 129, variants: [{ quality_grade: "Standard", price: 129 }, { quality_grade: "Premium", price: 169 }, { quality_grade: "Genuine", price: 199 }] }] },
      { model: "iPhone 11", repairTypes: [{ slug: "screen-replacement", price: 120, variants: [{ quality_grade: "Standard", price: 120 }, { quality_grade: "Genuine", price: 150 }] }] },
      { model: "iPhone 8", repairTypes: [{ slug: "screen-replacement", price: 85, variants: [{ quality_grade: "Genuine", price: 85 }] }] },
    ],
  }],
});

describe("IphoneScreenRepairCostArticle", () => {
  it("renders the accessible price, image and sample evidence", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle priceTable={priceTable} />);

    expect(html).toContain("Current Ali Mobile iPhone screen replacement prices by model and available repair grade");
    expect(html).toContain("current iPhone screen replacement prices range from $85 to $570");
    expect(html).toContain("Catalogue snapshot refreshed 8 October 2026.");
    expect(html).toContain("Prices may change as parts pricing changes.");
    expect(html).not.toContain("$599");
    expect(html).not.toContain("Prices checked");
    expect(html).toContain("<details");
    expect(html).toContain("<summary>View iPhone 13 and older screen repair prices</summary>");
    expect(html).not.toContain("<details open");
    const detailsStart = html.indexOf("<details");
    const currentTable = html.slice(0, detailsStart);
    const olderTable = html.slice(detailsStart, html.indexOf("</details>", detailsStart));
    expect(currentTable).toContain("iPhone 17 Pro Max");
    expect(currentTable).toContain("iPhone 15 Pro");
    expect(currentTable).toContain("iPhone 14 Pro");
    expect(currentTable).not.toContain("iPhone 13</th>");
    expect(olderTable).toContain('aria-label="iPhone 13, Standard, $129"');
    expect(olderTable).toContain('aria-label="iPhone 12, Premium, $169"');
    expect(olderTable).toContain('aria-label="iPhone 11, Genuine, $150"');
    expect(olderTable).toContain('aria-label="iPhone 8, Genuine, $85"');
    expect(html).toContain("Side-by-side comparison of LCD in-cell, Soft OLED and Original iPhone screens");
    expect(html).toContain("LCD in-cell replacement screen fitted to an iPhone");
    expect(html).toContain("Soft OLED replacement screen fitted to an iPhone");
    expect(html).toContain("Original iPhone screen used for display comparison");
    expect(html).toContain("What 100 iPhone screen repair customers chose");
    expect(html).toContain("74 customers");
    expect(html).toContain("74% of the sample");
    expect(html).toContain("19 customers");
    expect(html).toContain("19% of the sample");
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
    expect(html).not.toContain("7 September 2026");
    expect(html).not.toContain("29 July 2026");
  });

  it("uses the single price data source in one responsive table rendering", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle priceTable={priceTable} />);

    expect(articleSource).toContain('from "@/data/iphoneScreenRepairCost"');
    expect(articleSource).toContain("priceTable?.rows.filter");
    expect(articleSource).toContain("rows.map");
    expect(articleSource).not.toMatch(/\bfetch\s*\(/);
    expect(articleSource).not.toContain("useState");
    expect(articleSource).not.toMatch(/userAgent|crawler|bot/i);
    expect(articleSource).not.toMatch(/\$\d+/);
    priceTable.rows.forEach(({ model }) => {
      expect(html.match(new RegExp(`>${model}</th>`, "g")) ?? []).toHaveLength(1);
    });
  });

  it("keeps each price cell labelled for the mobile card layout", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle priceTable={priceTable} />);

    expect(html).toContain('aria-label="iPhone 17 Pro Max, Standard, $190"');
    expect(html).toContain('aria-label="iPhone 17 Pro Max, Premium, $299"');
    expect(html).toContain('aria-label="iPhone 17 Pro Max, Genuine, $570"');
    expect(html).toContain('aria-label="iPhone 18, Premium, Quote"');
    expect(html).toContain('aria-hidden="true">Standard</span>');
    expect(html).toContain('aria-hidden="true">Premium</span>');
    expect(html).toContain('aria-hidden="true">Genuine</span>');
    expect(articleStyles).toContain("@media (max-width: 640px)");
    expect(articleStyles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
  });

  it("keeps one semantic comparison table with labelled mobile values", () => {
    const html = renderToStaticMarkup(<IphoneScreenRepairCostArticle priceTable={priceTable} />);
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
