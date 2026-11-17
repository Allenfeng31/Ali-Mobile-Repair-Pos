import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ fetchRepairCatalog }));

import PostDetail, { generateMetadata } from "./page";

const slug = "phone-screen-black-but-still-on";
const params = Promise.resolve({ slug });
const catalogue = {
  fetchedAt: "2026-11-17T01:00:00Z",
  blogPriceFreshness: {
    [slug]: { fingerprint: "a".repeat(64), priceChangedAt: "2026-11-18T03:00:00Z" },
  },
  brands: [
    { category: "phone", slug: "iphone", models: [{ repairTypes: [{ slug: "screen-replacement", price: 149, repairOrigin: "pos" }] }] },
    { category: "phone", slug: "samsung", models: [{ repairTypes: [{ slug: "screen-replacement", price: 179, repairOrigin: "pos" }] }] },
    { category: "phone", slug: "google-pixel", models: [{ repairTypes: [{ slug: "screen-replacement", price: 199, repairOrigin: "pos" }] }] },
    { category: "phone", slug: "oppo", models: [{ repairTypes: [{ slug: "screen-replacement", price: 159, repairOrigin: "pos" }] }] },
  ],
};

beforeEach(() => {
  fetchRepairCatalog.mockReset();
  fetchRepairCatalog.mockResolvedValue(catalogue);
});

describe("black-screen phone Blog route", () => {
  it("publishes canonical article metadata and synchronises the catalogue date", async () => {
    const metadata = await generateMetadata({ params });
    const html = renderToStaticMarkup(await PostDetail({ params }));

    expect(metadata.title).toBe("Phone Screen Black but Still On? Causes & Checks | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(metadata.robots).toBeUndefined();
    expect(JSON.stringify(metadata.openGraph)).toContain('"type":"article"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-18T03:00:00Z"');
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("Why Is My Phone Screen Black but Still On?");
    expect(html).toContain("Causes, Checks &amp; Screen Repair Advice");
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"datePublished":"2026-11-17"');
    expect(html).toContain('"dateModified":"2026-11-18T03:00:00Z"');
    expect(html).toContain("Updated 18 November 2026");
  });

  it("keeps article text, links and dynamic ranges in raw server HTML", async () => {
    const html = renderToStaticMarkup(await PostDetail({ params }));
    expect(html).toContain("How Ali Mobile diagnoses a no-display phone");
    expect(html).toContain("Samsung Galaxy A15");
    expect(html).toContain("Google Pixel 7");
    expect(html).toContain("iPhone 17");
    expect(html).toContain("Apple iPhone");
    expect(html).toContain('href="/repairs/phone/samsung"');
    expect(html).toContain('href="/book-repair"');
    expect(html).toContain('href="tel:0481058514"');
  });

  it("uses only local optimised images and a server component", () => {
    const article = readFileSync(resolve(process.cwd(), "src/components/blog/PhoneScreenBlackArticle.tsx"), "utf8");
    const markdown = readFileSync(resolve(process.cwd(), `src/content/blog/${slug}.md`), "utf8");
    expect(article).not.toContain('"use client"');
    expect(markdown).toContain("phone-screen-black-but-still-on-cover.webp");
    expect(existsSync(resolve(process.cwd(), "public/images/blog/phone-screen-black/phone-screen-black-but-still-on-cover.webp"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "public/images/blog/phone-screen-black/ali-mobile-no-display-diagnostic-process.webp"))).toBe(true);
  });
});
