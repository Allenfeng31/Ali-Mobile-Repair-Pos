import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getPostDataMock } = vi.hoisted(() => ({ getPostDataMock: vi.fn() }));

vi.mock("@/lib/blog", () => ({
  getPostData: getPostDataMock,
  isRemovedBlogSlug: vi.fn(() => false),
}));

import BlogArticlePage, { generateMetadata } from "./page";

const slug = "how-much-does-samsung-galaxy-s-screen-replacement-cost-australia";

describe("Samsung Galaxy S screen cost blog route", () => {
  it("uses static article metadata and SSR content without consulting a stale blog record", async () => {
    getPostDataMock.mockRejectedValue(new Error("stale blog source should not be read"));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });
    const html = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug }) }));

    expect(getPostDataMock).not.toHaveBeenCalled();
    expect(metadata.title).toBe("How Much Does Samsung Galaxy S Screen Replacement Cost in Australia? | Ali Mobile");
    expect(metadata.alternates?.canonical).toBe(`/blog/${slug}`);
    expect(JSON.stringify(metadata.openGraph?.images)).toContain("samsung-galaxy-s-screen-replacement-cost-guide.webp");
    expect(JSON.stringify(metadata.twitter?.images)).toContain("samsung-galaxy-s-screen-replacement-cost-guide.webp");
    expect(html).toContain('"datePublished":"2026-09-08"');
    expect(html).toContain('"dateModified":"2026-09-08"');
    expect(html).toContain('"image":["https://www.alimobile.com.au/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp"]');
    expect(html).not.toContain("Updated 8 September 2026");
    expect(html).toContain("Samsung Galaxy S screen replacement prices");
    expect(html).toContain("Galaxy S26 Ultra");
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
      updated_at: "2026-09-07",
    });

    const html = renderToStaticMarkup(await BlogArticlePage({
      params: Promise.resolve({ slug: "how-much-does-iphone-screen-repair-cost-australia" }),
    }));

    expect(html).toContain("Published 29 July 2026");
    expect(html).toContain("Updated 7 September 2026");
    expect(html).toContain('"datePublished":"2026-07-29"');
    expect(html).toContain('"dateModified":"2026-09-07"');
  });
});
