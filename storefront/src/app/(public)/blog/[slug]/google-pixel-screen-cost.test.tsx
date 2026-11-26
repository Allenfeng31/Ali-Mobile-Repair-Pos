import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ fetchRepairCatalog }));

import PostDetail, { generateMetadata } from "./page";

const slug = "google-pixel-screen-repair-cost-australia";
const params = Promise.resolve({ slug });
const catalogue = {
  fetchedAt: "2026-11-26T01:00:00.000Z",
  blogPriceFreshness: {
    [slug]: { fingerprint: "f".repeat(64), priceChangedAt: null },
  },
  brands: [{
    category: "phone",
    brand: "Google Pixel",
    slug: "google-pixel",
    models: [
      {
        model: "Pixel 9 Pro Fold",
        slug: "pixel-9-pro-fold",
        repairTypes: [{ slug: "screen-replacement", price: 470, variants: [{ quality_grade: "Genuine", price: 470 }] }],
      },
      {
        model: "Pixel 7 Pro",
        slug: "pixel-7-pro",
        repairTypes: [{ slug: "screen-replacement", price: 320, variants: [{ quality_grade: "Genuine", price: 320 }] }],
      },
      {
        model: "Pixel 7",
        slug: "pixel-7",
        repairTypes: [{ slug: "screen-replacement", price: 270, variants: [
          { quality_grade: "Genuine", price: 270 },
          { quality_grade: "Premium", price: 240 },
        ] }],
      },
      {
        model: "Pixel 3a",
        slug: "pixel-3a",
        repairTypes: [{ slug: "screen-replacement", price: 0, variants: [{ quality_grade: "Standard", price: 0 }] }],
      },
    ],
  }],
};

beforeEach(() => {
  fetchRepairCatalog.mockReset();
  fetchRepairCatalog.mockResolvedValue(catalogue);
});

describe("Google Pixel screen repair cost Blog route", () => {
  it("publishes canonical metadata and one server-rendered BlogPosting", async () => {
    const metadata = await generateMetadata({ params });
    const html = renderToStaticMarkup(await PostDetail({ params }));

    expect(metadata.title).toBe("Google Pixel Screen Repair Cost Australia | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(JSON.stringify(metadata.openGraph)).toContain('"type":"article"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"publishedTime":"2026-11-26"');
    expect(JSON.stringify(metadata.twitter)).toContain('"card":"summary_large_image"');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("How Much Does Google Pixel Screen Repair Cost in Australia?");
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"datePublished":"2026-11-26"');
    expect(html).toContain('"dateModified":"2026-11-26"');
    expect(html).not.toContain('"@type":"FAQPage"');
  });

  it("renders exact catalogue grades, Quote and canonical detail links in raw HTML", async () => {
    const html = renderToStaticMarkup(await PostDetail({ params }));

    expect(html).toContain('aria-label="Pixel 7, Genuine, $270"');
    expect(html).toContain('aria-label="Pixel 7, Premium, $240"');
    expect(html).toContain('aria-label="Pixel 3a, Standard, Quote"');
    expect(html).toContain('href="/repairs/phone/google-pixel/pixel-7/screen-replacement"');
    expect(html).toContain('href="/repairs/phone/google-pixel/pixel-7-pro/screen-replacement"');
    expect(html).toContain("prices range from <strong>$240 to $320</strong>");
    expect(html).not.toContain("$470");
    expect(html).not.toMatch(/aria-label="[^"]+, \$0"/);
  });

  it("fails safely without fixed fallback prices when the catalogue request fails", async () => {
    fetchRepairCatalog.mockRejectedValueOnce(new Error("catalogue unavailable"));

    const html = renderToStaticMarkup(await PostDetail({ params }));

    expect(html).toContain("Current fixed Google Pixel screen prices are temporarily unavailable");
    expect(html).not.toContain("<table");
    expect(html).not.toMatch(/\$(160|240|270|320|370|470)/);
  });

  it("keeps the article server-only and metadata in one Markdown source", () => {
    const articleSource = readFileSync(
      resolve(process.cwd(), "src/components/blog/GooglePixelScreenRepairCostArticle.tsx"),
      "utf8",
    );
    const markdown = readFileSync(resolve(process.cwd(), `src/content/blog/${slug}.md`), "utf8");

    expect(articleSource).not.toContain('"use client"');
    expect(articleSource).not.toMatch(/\bfetch\s*\(/);
    expect(markdown).toContain("seo_title: 'Google Pixel Screen Repair Cost Australia | Ali Mobile'");
    expect(markdown).toContain("updated_at: '2026-11-26'");
    expect(markdown).toContain("d1f43583-ff07-4530-8a75-d0332792d8cd/before");
  });
});
