import { existsSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getPostData, getSortedPostsData } from "@/lib/blog";

import BlogIndexPage from "../page";
import BlogArticlePage, { generateMetadata } from "./page";

const slug = "when-should-you-replace-iphone-battery";
const params = Promise.resolve({ slug });
const imagePath = "/images/blog/iphone-battery-replacement-repair-assistant.webp";
const imageAlt = "iPhone showing Battery Health beside a replacement battery on a repair workbench";

describe("iPhone battery health blog route", () => {
  it("uses the new article frontmatter, indexable canonical and publication date", async () => {
    const post = await getPostData(slug);
    const metadata = await generateMetadata({ params });
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));

    expect(post.source).toBe("markdown");
    expect(post.date).toBe("2026-10-08");
    expect(post.updated_at).toBeUndefined();
    expect(post.image).toBe(imagePath);
    expect(post.cover_image_alt).toBe(imageAlt);
    expect(existsSync(path.join(process.cwd(), "public", imagePath.slice(1)))).toBe(true);
    expect(metadata.title).toBe("When Should You Replace Your iPhone Battery? | Ali Mobile");
    expect(metadata.description).toContain("80% Battery Health");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(metadata.robots).toBeUndefined();
    expect(html).toContain("<h1 id=\"article-title\">When Should You Replace Your iPhone Battery? Battery Health &amp; Repair Assistant Explained</h1>");
    expect(html).toContain("Published 8 October 2026");
    expect(html).not.toContain("Updated 8 October 2026");
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"datePublished":"2026-10-08"');
    expect(html).toContain('"dateModified":"2026-10-08"');
    expect(html).toContain(`alt="${imageAlt}"`);
    expect(html).toContain("iphone-battery-replacement-repair-assistant.webp");
    expect(html).toContain(`"image":["https://www.alimobile.com.au${imagePath}"]`);
  });

  it("shows the local image rather than a placeholder on the blog index card", async () => {
    const posts = await getSortedPostsData();
    expect(posts.find((post) => post.slug === slug)?.image).toBe(imagePath);

    const html = renderToStaticMarkup(await BlogIndexPage());
    expect(html).toContain(`href="/blog/${slug}"`);
    expect(html).toContain(`alt="${imageAlt}"`);
    expect(html).toContain("iphone-battery-replacement-repair-assistant.webp");
  });

  it("renders the answer, semantic comparison table and qualified workshop evidence in initial HTML", async () => {
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));

    expect(html).toContain("You do not need to wait for exactly 80% Battery Health");
    expect(html).toContain("<table");
    expect(html).toContain("Apple supports Battery Repair Assistant");
    expect(html).toContain("Ali Mobile workshop-tested with current replacement setup");
    for (const model of ["12", "13", "14", "15", "16", "17"]) {
      expect(html).toContain(`iPhone ${model}</th><td>Yes</td><td>Yes</td>`);
    }
    expect(html).toMatch(/iPhone SE \(3rd generation\).*?Not claimed/);
    expect(html).toMatch(/iPhone 18 and later.*?Not claimed/);
    expect(html).toContain("iPhone 12 through iPhone 17 repairs");
    expect(html).toContain("Completing Apple Repair Assistant configuration does not mean Apple certified, approved or endorsed an aftermarket replacement battery.");
    expect(html).toContain("Genuine</strong> means the repair was completed using genuine Apple parts and processes");
    expect(html).toContain("Used</strong> means a part was already used or installed in another iPhone");
    expect(html).toContain("Unknown</strong> can have several causes");
    expect(html).toContain("Finish Repair</strong> means applicable repair configuration has not yet been completed");
    expect(html).toContain("iOS has displayed <strong>Used</strong> after successful Repair Assistant configuration");
    expect(html).toContain("On tested iPhone 15-series and later devices, iOS has reported 100% Maximum Capacity and 0 cycles");
    expect(html).toContain("not a guarantee for every repair or future iOS version");
    expect(html).toContain("screen-and-battery repairs where both parts configured successfully");
    expect(html).toContain("do not yet have enough repeat cases");
    expect(html).toContain("6 months</strong>, subject to the applicable warranty terms. This is in addition to rights that may apply under the");
    expect(html).toContain("Ali Mobile is an independent repair business and is not affiliated with or endorsed by Apple.");
    expect(html).toContain("around 30 minutes");
    expect(html).toContain("does not usually require the iPhone to be erased");
    expect(html).toContain("cannot be promised to retain the same factory water-resistance rating");
    expect(html).toContain('href="/repairs/battery-replacement"');
    expect(html).not.toMatch(/same.day|while.you.wait|immediate repair/i);
    expect(html).not.toMatch(/\$\d+/);
  });
});
