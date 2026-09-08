import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SamsungGalaxySScreenRepairCostArticle } from "./SamsungGalaxySScreenRepairCostArticle";

const articleSource = readFileSync(
  resolve(process.cwd(), "src/components/blog/SamsungGalaxySScreenRepairCostArticle.tsx"),
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

  it("uses only static article data and no runtime catalogue or POS price reader", () => {
    expect(articleSource).toContain('from "@/data/samsungGalaxySScreenRepairCost"');
    expect(articleSource).not.toMatch(/fetchRepairCatalog|fetchPOSInventory|supabase|\bfetch\s*\(/);
  });
});
