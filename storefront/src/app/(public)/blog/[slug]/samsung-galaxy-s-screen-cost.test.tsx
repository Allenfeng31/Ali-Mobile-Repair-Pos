import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getPostDataMock, fetchRepairCatalogMock } = vi.hoisted(() => ({ getPostDataMock: vi.fn(), fetchRepairCatalogMock: vi.fn() }));

vi.mock("@/lib/blog", () => ({
  getPostData: getPostDataMock,
  isRemovedBlogSlug: vi.fn(() => false),
}));

vi.mock("@/lib/api", () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import BlogArticlePage, { generateMetadata } from "./page";

const slug = "how-much-does-samsung-galaxy-s-screen-replacement-cost-australia";

function samsungCatalogue(genuineS24UltraPrice = 399) {
  return {
    fetchedAt: "2026-11-18T01:00:00.000Z",
    blogPriceFreshness: {
      [slug]: { fingerprint: "a".repeat(64), priceChangedAt: "2026-11-18T01:00:00.000Z" as string | null },
    },
    brands: [{
      category: "phone",
      slug: "samsung",
      models: [
        { model: "Galaxy S25 Ultra", slug: "galaxy-s25-ultra", repairTypes: [{ slug: "screen-replacement", price: 320, variants: [
          { quality_grade: "Genuine", price: 420 }, { quality_grade: "Premium", price: 320 },
        ] }] },
        { model: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra", repairTypes: [{ slug: "screen-replacement", price: 320, variants: [
          { quality_grade: "Genuine", price: genuineS24UltraPrice }, { quality_grade: "Premium", price: 320 },
        ] }] },
        { model: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra", repairTypes: [{ slug: "screen-replacement", price: 298, variants: [
          { quality_grade: "Genuine", price: 390 }, { quality_grade: "Premium", price: 298 },
        ] }] },
        { model: "Galaxy S23", slug: "galaxy-s23", repairTypes: [{ slug: "screen-replacement", price: 290, variants: [
          { quality_grade: "Genuine", price: 290 },
        ] }] },
      ],
    }],
  };
}

beforeEach(() => {
  getPostDataMock.mockReset();
  fetchRepairCatalogMock.mockReset();
  fetchRepairCatalogMock.mockResolvedValue(samsungCatalogue());
});

describe("Samsung Galaxy S screen cost blog route", () => {
  it("uses the article date for metadata and SSR content", async () => {
    getPostDataMock.mockResolvedValue({ date: "2026-09-08", updated_at: "2026-09-08" });
    const catalogue = samsungCatalogue();
    catalogue.blogPriceFreshness[slug]!.priceChangedAt = null;
    fetchRepairCatalogMock.mockResolvedValue(catalogue);

    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    const html = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug }) }));

    expect(getPostDataMock).toHaveBeenCalledWith(slug);
    expect(metadata.title).toBe("How Much Does Samsung Galaxy S Screen Replacement Cost in Australia? | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(JSON.stringify(metadata.openGraph?.images)).toContain("samsung-galaxy-s-screen-replacement-cost-guide.webp");
    expect(JSON.stringify(metadata.twitter?.images)).toContain("samsung-galaxy-s-screen-replacement-cost-guide.webp");
    expect(html).toContain('"datePublished":"2026-09-08"');
    expect(html).toContain('"dateModified":"2026-09-08"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-09-08"');
    expect(html).toContain('"image":["https://www.alimobile.com.au/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp"]');
    expect(html).not.toContain("Updated 8 September 2026");
    expect(html).toContain("Samsung Galaxy S screen replacement prices");
    expect(html).toContain("Galaxy S26 Ultra");
    expect(html).toContain('aria-label="Galaxy S24 Ultra, Genuine, $399"');
  });

  it("shares a changed editorial date across visible copy, JSON-LD and Open Graph", async () => {
    getPostDataMock.mockResolvedValue({ date: "2026-09-08", updated_at: "2026-11-13" });
    const catalogue = samsungCatalogue();
    catalogue.blogPriceFreshness[slug]!.priceChangedAt = null;
    fetchRepairCatalogMock.mockResolvedValue(catalogue);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    const html = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug }) }));
    expect(html).toContain("Updated 13 November 2026");
    expect(html).toContain('"datePublished":"2026-09-08"');
    expect(html).toContain('"dateModified":"2026-11-13"');
    expect(html).toContain("Catalogue snapshot refreshed 18 November 2026");
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-13"');
  });

  it("renders a changed POS price and never falls back to the removed static amount", async () => {
    getPostDataMock.mockResolvedValue({ date: "2026-09-08", updated_at: "2026-11-18" });
    fetchRepairCatalogMock.mockResolvedValue(samsungCatalogue(409));

    const html = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug }) }));

    expect(html).toContain('aria-label="Galaxy S24 Ultra, Genuine, $409"');
    expect(html).not.toContain('aria-label="Galaxy S24 Ultra, Genuine, $420"');
  });

  it("uses price freshness for visible, JSON-LD and Open Graph modified dates", async () => {
    getPostDataMock.mockResolvedValue({ date: "2026-09-08", updated_at: "2026-11-17" });
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    const html = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug }) }));

    expect(html).toContain("Updated 18 November 2026");
    expect(html).toContain('"dateModified":"2026-11-18T01:00:00.000Z"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-18T01:00:00.000Z"');
  });

  it("shows no stale price table when the public catalogue is unavailable", async () => {
    getPostDataMock.mockResolvedValue({ date: "2026-09-08", updated_at: "2026-11-18" });
    fetchRepairCatalogMock.mockRejectedValue(new Error("catalogue unavailable"));

    const html = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug }) }));

    expect(html).toContain("Current fixed Samsung Galaxy S screen prices are not available");
    expect(html).not.toContain("<table");
    expect(html).not.toContain("$420");
  });

  it("shows an iPhone publication date and a distinct later update date without changing schema dates", async () => {
    getPostDataMock.mockResolvedValue({
      slug: "how-much-does-iphone-screen-repair-cost-australia",
      title: "How Much Does iPhone Screen Repair Cost in Australia?",
      date: "2026-07-29",
      description: "Static iPhone guide.",
      contentHtml: "",
      source: "markdown",
      author_name: "Ali Mobile & Repair",
      updated_at: "2026-10-08",
    });
    fetchRepairCatalogMock.mockResolvedValue({
      fetchedAt: "2026-10-08T01:23:00.000Z",
      blogPriceFreshness: {
        "how-much-does-iphone-screen-repair-cost-australia": {
          fingerprint: "b".repeat(64), priceChangedAt: "2026-11-14T03:00:00Z",
        },
      },
      brands: [{
        category: "phone",
        slug: "iphone",
        models: [{
          model: "iPhone 17 Pro Max",
          repairTypes: [{
            slug: "screen-replacement",
            price: 190,
            variants: [
              { quality_grade: "Standard", price: 190 },
              { quality_grade: "Premium", price: 299 },
              { quality_grade: "Genuine", price: 570 },
            ],
          }],
        }],
      }],
    });

    const html = renderToStaticMarkup(await BlogArticlePage({
      params: Promise.resolve({ slug: "how-much-does-iphone-screen-repair-cost-australia" }),
    }));

    expect(html).toContain("Published 29 July 2026");
    expect(html).toContain("Updated 14 November 2026");
    expect(html).toContain('"datePublished":"2026-07-29"');
    expect(html).toContain('"dateModified":"2026-11-14T03:00:00Z"');
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "how-much-does-iphone-screen-repair-cost-australia" }),
    });
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-14T03:00:00Z"');
    expect(fetchRepairCatalogMock).toHaveBeenCalledTimes(2);
    expect(html).toContain("current iPhone screen replacement prices range from $190 to $570");
    expect(html).toContain('aria-label="iPhone 17 Pro Max, Premium, $299"');
    expect(html).not.toContain("$599");
  });
});
