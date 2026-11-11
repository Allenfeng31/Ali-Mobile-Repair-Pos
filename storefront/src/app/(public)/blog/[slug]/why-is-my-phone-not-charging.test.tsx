import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getPostData } from "@/lib/blog";

import BlogArticlePage, { generateMetadata } from "./page";

const slug = "why-is-my-phone-not-charging";
const params = Promise.resolve({ slug });
const imagePath = "/images/blog/why-is-my-phone-not-charging.webp";
const imageAlt = "Phone on a repair bench while a technician inspects a dusty charging port";

describe("phone not charging blog route", () => {
  it("uses indexable article metadata, accurate dates and the optimised local image", async () => {
    const post = await getPostData(slug);
    const metadata = await generateMetadata({ params });
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));

    expect(post.source).toBe("markdown");
    expect(post.date).toBe("2026-11-11");
    expect(post.updated_at).toBeUndefined();
    expect(post.image).toBe(imagePath);
    expect(post.cover_image_alt).toBe(imageAlt);
    expect(existsSync(path.join(process.cwd(), "public", imagePath.slice(1)))).toBe(true);
    expect(metadata.title).toBe("Phone Not Charging? Common Causes & Fixes | Ali Mobile");
    expect(metadata.description).toContain("safe checks");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(metadata.robots).toBeUndefined();
    expect(JSON.stringify(metadata.openGraph)).toContain('"type":"article"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"publishedTime":"2026-11-11"');
    expect(JSON.stringify(metadata.openGraph)).toContain('"modifiedTime":"2026-11-11"');
    expect(html).toContain("Published 11 November 2026");
    expect(html).not.toContain("Updated 11 November 2026");
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('"datePublished":"2026-11-11"');
    expect(html).toContain('"dateModified":"2026-11-11"');
    expect(html).toContain(`alt="${imageAlt}"`);
    expect(html).toContain(imagePath);
  });

  it("renders the answer-first guide, repair process, comparison table and FAQs in server HTML", async () => {
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain("A phone that will not charge does not automatically need a charging port replacement");
    expect(html).toContain("Professional charging port deep cleaning");
    expect(html).toContain("Charging port repair or replacement");
    expect(html).toContain("Clean first");
    expect(html).toContain("Repair if needed");
    expect(html).toContain("6-month standard repair warranty");
    expect(html).toContain("<table");
    expect(html).toContain("Possible causes");
    expect(html).toContain("Wireless charging works but wired charging does not");
    expect(html.match(/<details/g)).toHaveLength(10);
    expect(html).not.toContain('"@type":"FAQPage"');
  });

  it("keeps safety advice, service claims and internal links qualified", async () => {
    const html = renderToStaticMarkup(await BlogArticlePage({ params }));
    const css = readFileSync(
      path.join(process.cwd(), "src/components/blog/PhoneNotChargingArticle.module.css"),
      "utf8",
    );

    expect(html).toContain("Do not insert a pin, metal tool or other object into the charging port");
    expect(html).toContain("about 30–60 minutes when the fault is confirmed and the correct part is available");
    expect(html).toContain("Deep cleaning alone is not a replacement-part repair");
    expect(html).toContain('href="/repairs/charging-port-replacement"');
    expect(html).toContain('href="/repairs/battery-replacement"');
    expect(html).toContain('href="/repairs/water-damage"');
    expect(html).toContain('href="/repairs/phone"');
    expect(html).toContain('href="/book-repair"');
    expect(html).toContain("support.apple.com/en-au/108805");
    expect(html).toContain("samsung.com/au/support/mobile-devices");
    expect(html).toContain("support.google.com/pixelphone/answer/7167687");
    expect(html).not.toMatch(/\$\d+/);
    expect(css).toContain("@media (max-width: 720px)");
    expect(css).not.toContain("overflow-x: auto");
  });
});
