import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchRepairCatalog } from "@/lib/api";
import { getPostData } from "@/lib/blog";

vi.mock("@/lib/api", () => ({ fetchRepairCatalog: vi.fn() }));

const { default: BlogArticlePage, generateMetadata } = await import("./page");

const slug = "macbook-screen-repair-ringwood";
const params = Promise.resolve({ slug });

const catalogFixture = {
  fetchedAt: "2026-11-12T01:00:00.000Z",
  brands: [{
    category: "laptop",
    slug: "macbook",
    models: [
      {
        model: "MacBook Air M2 13-inch 2022",
        slug: "macbook-air-m2-13-2022",
        repairTypes: [{ slug: "screen-replacement", price: 549, repairOrigin: "pos" }],
      },
      {
        model: "MacBook Air virtual model",
        slug: "macbook-air-virtual",
        repairTypes: [{ slug: "screen-replacement", price: 1, repairOrigin: "virtual", sourceType: "virtual" }],
      },
      {
        model: "MacBook Pro 14-inch M3 2023",
        slug: "macbook-pro-14-m3-2023",
        repairTypes: [{ slug: "screen-replacement", price: 1099, repairOrigin: "pos" }],
      },
    ],
  }],
};

beforeEach(() => {
  vi.mocked(fetchRepairCatalog).mockResolvedValue(catalogFixture as Awaited<ReturnType<typeof fetchRepairCatalog>>);
});

describe("MacBook screen repair blog route", () => {
  it("keeps one canonical article with accurate organisation and article metadata", async () => {
    const post = await getPostData(slug);
    const metadata = await generateMetadata({ params });
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));

    expect(post.date).toBe("2026-07-07");
    expect(post.updated_at).toBe("2026-11-12");
    expect(post.author_name).toBe("Ali Mobile & Repair");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(JSON.stringify(metadata.openGraph)).toContain('"type":"article"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-12"');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"@type":"Organization"');
    expect(html).toContain('"datePublished":"2026-07-07"');
    expect(html).toContain('"dateModified":"2026-11-12"');
  });

  it("server-renders the live MacBook Air price table and excludes MacBook Pro and virtual prices", async () => {
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));

    expect(html).toContain("MacBook Air M2 13-inch 2022");
    expect(html).toContain("$549");
    expect(html).not.toContain("$1,099");
    expect(html).not.toContain("MacBook Air virtual model");
    expect(html).toContain('href="/repairs/laptop/macbook#models-list"');
    expect(html).toContain("View MacBook Pro screen repair prices");
  });

  it("updates a changed POS price without inventing a price-change date from catalogue refresh time", async () => {
    const refreshedFixture = structuredClone(catalogFixture);
    refreshedFixture.fetchedAt = "2026-11-13T01:00:00.000Z";
    refreshedFixture.brands[0]!.models[0]!.repairTypes[0]!.price = 579;
    vi.mocked(fetchRepairCatalog).mockResolvedValueOnce(
      refreshedFixture as Awaited<ReturnType<typeof fetchRepairCatalog>>,
    );

    const html = renderToStaticMarkup(await BlogArticlePage({ params }));
    const metadata = await generateMetadata({ params });

    expect(html).toContain("$579");
    expect(html).not.toContain("$549");
    expect(html).toContain('"dateModified":"2026-11-12"');
    expect(html).not.toContain("Prices last updated");
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-12"');
  });

  it("renders the answer-first guide, repair evidence, safety advice, links and ten FAQs", async () => {
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));
    const css = readFileSync(
      path.join(process.cwd(), "src/components/blog/MacbookScreenRepairArticle.module.css"),
      "utf8",
    );
    const expectedImages = [
      "/images/blog/macbook-screen-repair/a2337-before.webp",
      "/images/blog/macbook-screen-repair/a2337-after.webp",
      "/images/blog/macbook-screen-repair/notch-model-before.webp",
      "/images/blog/macbook-screen-repair/notch-model-after.webp",
    ];

    expect(html).toContain("Can a broken MacBook screen be repaired?");
    expect(html).toContain("Model-specific prices below");
    expect(html).toContain("complete display assembly");
    expect(html).toContain("about one hour once the correct part is available");
    expect(html).toContain("6-month parts and labour warranty");
    expect(html).toContain("does not offer glass-only MacBook screen replacement");
    expect(html).toContain("Stop using the MacBook");
    expect(html).toContain("support.apple.com/en-au/102767");
    expect(html).toContain('href="/repairs/laptop/macbook"');
    expect(html).toContain('href="/book-repair"');
    expect(html.match(/<details/g)).toHaveLength(10);
    expect(html).toContain("How much does MacBook Pro screen replacement cost?");
    expect(html).toContain("Will I lose my files during screen replacement?");
    expect(html).toContain("Do I need to book before visiting?");
    expect(html).toContain("What if my MacBook screen is black but not cracked?");
    for (const image of expectedImages) {
      expect(html).toContain(encodeURIComponent(image));
      expect(existsSync(path.join(process.cwd(), "public", image.slice(1)))).toBe(true);
    }
    expect(css).toContain("@media (max-width: 720px)");
    expect(css).toContain("content: attr(data-label)");
  });
});
