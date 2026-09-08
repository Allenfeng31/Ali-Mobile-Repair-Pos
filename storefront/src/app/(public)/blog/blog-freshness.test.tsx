import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getSortedPostsDataMock } = vi.hoisted(() => ({ getSortedPostsDataMock: vi.fn() }));

vi.mock("@/lib/blog", () => ({ getSortedPostsData: getSortedPostsDataMock }));

import BlogPage from "./page";

describe("Blog archive freshness presentation", () => {
  it("shows a genuine later update without duplicating matching publication and update dates", async () => {
    getSortedPostsDataMock.mockResolvedValue([
      {
        slug: "how-much-does-samsung-galaxy-s-screen-replacement-cost-australia",
        title: "How Much Does Samsung Galaxy S Screen Replacement Cost in Australia?",
        date: "2026-09-08",
        updated_at: "2026-09-08",
        description: "Samsung guide.",
        image: "/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp",
      },
      {
        slug: "how-much-does-iphone-screen-repair-cost-australia",
        title: "How Much Does iPhone Screen Repair Cost in Australia?",
        date: "2026-07-29",
        updated_at: "2026-09-07",
        description: "iPhone guide.",
        image: "/images/blog/iphone-screen-repair-cost/iphone-screen-comparison.jpg",
      },
    ]);

    const html = renderToStaticMarkup(await BlogPage());

    expect(html).toContain("Published 8 Sep");
    expect(html).not.toContain("Updated 8 Sep");
    expect(html).toContain("Published 29 Jul");
    expect(html).toContain("Updated 7 Sep");
  });
});
