import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ fetchRepairCatalog }));

import PostDetail, { generateMetadata } from "./page";

const slug = "how-much-does-ipad-screen-repair-cost-australia";
const params = Promise.resolve({ slug });
const catalogue = {
  fetchedAt: "2026-11-14T01:00:00.000Z",
  blogPriceFreshness: {
    [slug]: { fingerprint: "a".repeat(64), priceChangedAt: "2026-11-16T03:00:00Z" },
  },
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
          variants: [{ quality_grade: "Genuine", price: 149, is_recommended: true }],
        }],
      },
      {
        model: "iPad Air 5th Generation",
        slug: "ipad-air-5th-generation",
        repairTypes: [{
          slug: "screen-replacement",
          name: "Screen Replacement",
          price: 429,
          repairOrigin: "pos",
        }],
      },
    ],
  }],
};

beforeEach(() => {
  fetchRepairCatalog.mockReset();
  fetchRepairCatalog.mockResolvedValue(catalogue);
});

describe("iPad screen repair cost Blog route", () => {
  it("publishes canonical metadata and one server-rendered BlogPosting", async () => {
    const metadata = await generateMetadata({ params });
    const html = renderToStaticMarkup(await PostDetail({ params }));

    expect(metadata.title).toBe("iPad Screen Repair Cost Australia: Glass vs LCD | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(JSON.stringify(metadata.openGraph)).toContain('"type":"article"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-16T03:00:00Z"');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("How Much Does iPad Screen Repair Cost? Glass vs LCD Explained");
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"datePublished":"2026-11-14"');
    expect(html).toContain('"dateModified":"2026-11-16T03:00:00Z"');
    expect(html).toContain("Updated 16 November 2026");
    expect(JSON.stringify(metadata.openGraph)).toContain("ipad-screen-repair-hero-before-after.webp");
    expect(html).toContain('"image":["https://www.alimobile.com.au/images/blog/ipad-screen-repair-cost/ipad-screen-repair-hero-before-after.webp"]');
    expect(html).toContain("Approx. 1 Hour Repair");
    expect(html).toContain("6-Month Warranty");
  });

  it("renders POS prices, real links and repair scope in raw SSR HTML", async () => {
    const html = renderToStaticMarkup(await PostDetail({ params }));

    expect(html).toContain("iPad 11th Generation");
    expect(html).toContain("Screen replacement from $149");
    expect(html).toContain("iPad Air 5th Generation");
    expect(html).toContain("Screen replacement from $429");
    expect(html).toContain("Glass &amp; digitiser");
    expect(html).toContain("Full display assembly");
    expect(html).toContain('href="/repairs/tablet/ipad/ipad-11th-generation/screen-replacement"');
    expect(html).toContain('href="/repairs/tablet/ipad"');
    expect(html).toContain('href="/book-repair"');
  });

  it("keeps the dedicated page server-only with an accurately described illustration", () => {
    const articleSource = readFileSync(
      resolve(process.cwd(), "src/components/blog/IpadScreenRepairCostArticle.tsx"),
      "utf8",
    );
    const markdown = readFileSync(
      resolve(process.cwd(), `src/content/blog/${slug}.md`),
      "utf8",
    );
    const css = readFileSync(
      resolve(process.cwd(), "src/components/blog/IpadScreenRepairCostArticle.module.css"),
      "utf8",
    );
    const routeCss = readFileSync(
      resolve(process.cwd(), "src/app/(public)/blog/[slug]/BlogPost.module.css"),
      "utf8",
    );

    expect(articleSource).not.toContain('"use client"');
    expect(articleSource).not.toContain("fetch(");
    expect(markdown).toMatch(/^image:.*ipad-screen-repair-hero-before-after.webp/m);
    expect(markdown).toContain("not a real repair result");
    expect(css).toContain("@media (max-width: 720px)");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr) auto");
    expect(routeCss).toContain(".ipadCostHero");
    expect(routeCss).toContain(".ipadHeroFacts");
  });
});
