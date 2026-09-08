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
    expect(html).toContain('"datePublished":"2026-09-08"');
    expect(html).toContain('"dateModified":"2026-09-08"');
    expect(html).toContain("Samsung Galaxy S screen replacement prices");
    expect(html).toContain("Galaxy S26 Ultra");
  });
});
