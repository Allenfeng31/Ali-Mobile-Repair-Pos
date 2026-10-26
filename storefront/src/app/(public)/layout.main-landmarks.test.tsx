/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchRepairCatalog, getSortedPostsData, getPostData } = vi.hoisted(() => ({
  fetchRepairCatalog: vi.fn(),
  getSortedPostsData: vi.fn(),
  getPostData: vi.fn(),
}));

vi.mock("../ClientChatWidget", () => ({ default: () => null }));
vi.mock("../Header", () => ({ default: () => null }));
vi.mock("@/components/analytics/CustomerInteractionTracker", () => ({ default: () => null }));
vi.mock("@/context/CartContext", () => ({
  CartProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/PageTransition", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/SocialIcon", () => ({ default: () => <svg aria-hidden="true" /> }));
vi.mock("@/components/BlogImage", () => ({ BlogImage: () => <span data-blog-image="true" /> }));
vi.mock("@/components/analytics/LocationAnalyticsTracker", () => ({ default: () => null }));
vi.mock("@/components/locations/ChineseServiceCta", () => ({ default: () => null }));
vi.mock("@/components/locations/LocationBrandRepairLinks", () => ({ default: () => <div data-location-brand-links="true" /> }));
vi.mock("next/image", () => ({ default: () => <span data-next-image="true" /> }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("@/lib/api", () => ({ fetchRepairCatalog }));
vi.mock("@/lib/blog", () => ({
  getSortedPostsData,
  getPostData,
  isRemovedBlogSlug: () => false,
}));

import PublicLayout from "./layout";
import AboutUsPage from "./about-us/page";
import BlogPage from "./blog/page";
import BlogPostPage from "./blog/[slug]/page";
import LocationPage from "./locations/[suburb]/page";
import WaterDamagePage from "./repairs/water-damage/page";

const catalog = {
  brands: [
    { category: "phone", brand: "iPhone", slug: "iphone", models: [] },
    { category: "phone", brand: "Samsung", slug: "samsung", models: [] },
    { category: "phone", brand: "Google Pixel", slug: "google-pixel", models: [] },
    { category: "phone", brand: "OPPO", slug: "oppo", models: [] },
    { category: "tablet", brand: "iPad", slug: "ipad", models: [] },
  ],
};

function expectSingleMain(page: ReactNode, heading: RegExp) {
  const result = render(<PublicLayout>{page}</PublicLayout>);

  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();

  result.unmount();
}

describe("PublicLayout main-landmark composition", () => {
  beforeEach(() => {
    fetchRepairCatalog.mockResolvedValue(catalog);
    getSortedPostsData.mockResolvedValue([{
      slug: "sample-repair-guide",
      title: "Sample Repair Guide",
      date: "2026-10-01",
      description: "A current repair guide.",
    }]);
    getPostData.mockResolvedValue({
      slug: "sample-repair-guide",
      title: "Sample Repair Guide",
      date: "2026-10-01",
      description: "A current repair guide.",
      contentHtml: "<p>Article body.</p>",
      source: "markdown",
    });
  });

  it("keeps Water Damage, About, Location and Blog detail content inside the sole layout main", async () => {
    expectSingleMain(<WaterDamagePage />, /Phone Water Damage Assessment & Cleaning/i);
    expectSingleMain(<AboutUsPage />, /About Ali Mobile & Repair/i);
    expectSingleMain(await LocationPage({ params: Promise.resolve({ suburb: "ringwood" }) }), /Visit Ali Mobile & Repair in Ringwood Square/i);
    expectSingleMain(await BlogPostPage({ params: Promise.resolve({ slug: "sample-repair-guide" }) }), /Sample Repair Guide/i);
  });

  it("keeps both Blog archive branches inside the sole layout main", async () => {
    expectSingleMain(await BlogPage(), /Field notes from the repair bench/i);

    getSortedPostsData.mockResolvedValue([]);
    expectSingleMain(await BlogPage(), /No Articles Found/i);
  });
});
