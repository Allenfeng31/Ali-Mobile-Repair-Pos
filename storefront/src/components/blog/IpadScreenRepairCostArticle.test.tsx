import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildIpadScreenRepairPriceTable } from "@/data/ipadScreenRepairCost";
import { IpadScreenRepairCostArticle } from "./IpadScreenRepairCostArticle";

const priceTable = buildIpadScreenRepairPriceTable({
  fetchedAt: "2026-11-14T01:00:00.000Z",
  brands: [{
    category: "tablet",
    slug: "ipad",
    models: [
      {
        model: "iPad 11th Generation",
        slug: "ipad-11th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 149,
          repairOrigin: "pos",
          variants: [{ quality_grade: "Genuine", price: 149 }],
        }],
      },
      {
        model: "iPad Air 5th Generation",
        slug: "ipad-air-5th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 0,
          repairOrigin: "pos",
          variants: [{ quality_grade: "Premium", price: 429 }],
        }],
      },
      {
        model: "iPad Pro 13-inch M4",
        slug: "ipad-pro-13-inch-m4",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 0,
          repairOrigin: "pos",
        }],
      },
    ],
  }],
});

describe("IpadScreenRepairCostArticle", () => {
  it("server-renders separate glass/digitiser and full-display pricing scopes", () => {
    const html = renderToStaticMarkup(<IpadScreenRepairCostArticle priceTable={priceTable} />);

    expect(html).toContain("Standard iPad glass and digitiser prices");
    expect(html).toContain("iPad Air, mini and Pro full display prices");
    expect(html).toContain("iPad 11th Generation");
    expect(html).toContain("Screen replacement from $149");
    expect(html).toContain("iPad Air 5th Generation");
    expect(html).toContain("Screen replacement from $429");
    expect(html).toContain("Quote Required");
    expect(html).not.toContain("Standard</");
    expect(html).not.toContain("Genuine</");
    expect(html).toContain("does not include LCD replacement");
    expect(html).toContain("Glass &amp; Digitiser Only — LCD Not Included");
    expect(html).toContain("OLED and LCD are different display technologies");
    expect(html).toContain('href="/repairs/tablet/ipad/ipad-11th-generation/screen-replacement"');
    expect(html).toContain("Catalogue snapshot refreshed 14 November 2026.");
    expect(html).not.toContain("</strong>models");
  });

  it("covers required symptoms, safe frame work, internal links and FAQs", () => {
    const html = renderToStaticMarkup(<IpadScreenRepairCostArticle priceTable={priceTable} />);
    const css = readFileSync(
      resolve(process.cwd(), "src/components/blog/IpadScreenRepairCostArticle.module.css"),
      "utf8",
    );

    for (const phrase of [
      "cracked glass",
      "black screen",
      "touch not working",
      "ghost touch",
      "flickering",
      "lines",
      "black spots",
      "screen lifting",
    ]) expect(html.toLowerCase()).toContain(phrase);

    expect(html).toContain("display output, touch response and frame condition");
    expect(html).toContain("carefully realign minor distortion");
    expect(html).toContain("cannot always be corrected safely");
    expect(html).toContain("replacement screen is not kept under pressure");
    expect(html).toContain('href="/repairs/tablet/ipad"');
    expect(html).toContain('href="/repairs/screen-replacement"');
    expect(html).toContain('href="/book-repair"');
    expect(html.match(/<details/g)).toHaveLength(9);
    expect(html).toContain("Most straightforward iPad screen repairs can take approximately one hour");
    expect(html).toContain("This does not limit rights under Australian Consumer Law");
    expect(html).toContain("Real iPad Screen Repairs at Ali Mobile");
    expect(html.match(/<figure>/g)).toHaveLength(6);
    expect(html.match(/loading="lazy"/g)).toHaveLength(6);
    for (const model of ["iPad 7th Generation", "iPad 9th Generation", "iPad Pro 10.5-inch"]) {
      expect(html).toContain(model);
    }
    expect(css).toContain("@media (max-width: 720px)");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr) auto");
  });

  it("shows a safe catalogue-unavailable state without fixed fallback prices", () => {
    const html = renderToStaticMarkup(<IpadScreenRepairCostArticle priceTable={null} />);
    expect(html).toContain("Current iPad prices are temporarily unavailable");
    expect(html).not.toContain("$149");
  });
});
