import { renderToStaticMarkup } from "react-dom/server";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchRepairCatalog, fetchModelRepairTypes, type RepairCatalog } from "@/lib/api";
import { getPostData, getSortedPostsData, type BlogPost } from "@/lib/blog";

vi.mock("next/link", () => ({
  default: ({ children, href, prefetch, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string; prefetch?: boolean }) => {
    void prefetch;
    return <a href={href} {...props}>{children}</a>;
  },
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => { throw new Error("NEXT_NOT_FOUND"); }),
  permanentRedirect: vi.fn(() => { throw new Error("NEXT_REDIRECT"); }),
}));
vi.mock("@/lib/api", () => ({
  fetchRepairCatalog: vi.fn(),
  fetchModelRepairTypes: vi.fn(),
}));
vi.mock("@/lib/blog", () => ({
  getPostData: vi.fn(),
  getSortedPostsData: vi.fn(),
  isRemovedBlogSlug: vi.fn(() => false),
}));
vi.mock("@/lib/repair-results", () => ({ fetchHubRepairResults: vi.fn().mockResolvedValue([]) }));
vi.mock("@/components/BlogImage", () => ({ BlogImage: () => <span data-blog-image="true" /> }));
vi.mock("@/components/BrandModelSearch", () => ({ default: () => null }));
vi.mock("@/components/repair-results/HubRepairResultsSection", () => ({ default: () => null }));
vi.mock("@/components/repair-results/RepairResultsMatchingSection", () => ({ default: () => null }));
vi.mock("@/components/FloatingJumpCTA", () => ({ default: () => null }));
vi.mock("@/components/BackButton", () => ({ default: () => null }));
vi.mock("@/components/services/RepairOptionsGrid", () => ({ default: () => null }));
vi.mock("@/components/services/RepairCTA", () => ({ default: () => null }));
vi.mock("@/components/ScrollReveal", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("@/components/analytics/LocationAnalyticsTracker", () => ({ default: () => null }));
vi.mock("@/components/locations/ChineseServiceCta", () => ({ default: () => null }));

const { default: BrandHubPage } = await import("./repairs/[category]/[brand]/page");
const { default: ModelHubPage } = await import("./repairs/[category]/[brand]/[model]/page");
const { default: LocationPage } = await import("./locations/[suburb]/page");
const { default: BlogPage } = await import("./blog/page");
const { default: BlogArticlePage } = await import("./blog/[slug]/page");

const catalog: RepairCatalog = {
  source: "fallback",
  catalogueSource: "development-fallback",
  fetchedAt: "2026-08-07T00:00:00.000Z",
  validatedAt: "2026-08-07T00:00:00.000Z",
  checksum: "warranty-template-test",
  inventoryRowCount: 3,
  publicModelCount: 3,
  publicRepairCount: 0,
  brands: [
    {
      category: "phone",
      slug: "iphone",
      brand: "iPhone",
      icon: "phone",
      models: [{ slug: "iphone-15", model: "iPhone 15", repairTypes: [] }],
    },
    {
      category: "phone",
      slug: "samsung",
      brand: "Samsung",
      icon: "phone",
      models: [{ slug: "galaxy-s24", model: "Galaxy S24", repairTypes: [] }],
    },
    {
      category: "laptop",
      slug: "macbook",
      brand: "MacBook",
      icon: "laptop",
      models: [{ slug: "macbook-air-m2", model: "MacBook Air M2", repairTypes: [] }],
    },
  ],
};

const phoneModel = {
  model: "iPhone 15",
  brand: "iPhone",
  repairTypes: [
    { slug: "screen-replacement", name: "Screen Replacement", price: 150 },
    { slug: "battery-replacement", name: "Battery Replacement", price: 100 },
  ],
};

const macBookModel = {
  model: "MacBook Air M2",
  brand: "MacBook",
  repairTypes: [{ slug: "screen-replacement", name: "Screen Replacement", price: 400 }],
};

const blogPost: BlogPost = {
  slug: "repair-warranty-guide",
  title: "Repair warranty guide",
  date: "2026-08-01",
  description: "Practical repair guidance.",
  contentHtml: "<p>Repair guidance without blanket warranty claims.</p>",
};

function expectNoLegacyWarranty(html: string) {
  expect(html).not.toContain("180-Day");
  expect(html).not.toContain("180 Day");
  expect(html).not.toContain("Comprehensive Warranty");
}

beforeEach(() => {
  vi.mocked(fetchRepairCatalog).mockResolvedValue(catalog);
  vi.mocked(fetchModelRepairTypes).mockImplementation(async (category, brand) => (
    category === "laptop" && brand === "macbook" ? macBookModel : phoneModel
  ) as Awaited<ReturnType<typeof fetchModelRepairTypes>>);
  vi.mocked(getSortedPostsData).mockResolvedValue([blogPost]);
  vi.mocked(getPostData).mockResolvedValue(blogPost);
});

describe("public warranty template regressions", () => {
  it.each(["iphone", "samsung"])("keeps the %s Brand Hub conditional and free of legacy warranty copy", async (brand) => {
    const html = renderToStaticMarkup(await BrandHubPage({ params: Promise.resolve({ category: "phone", brand }) }));

    expectNoLegacyWarranty(html);
    expect(html).toMatch(/warranty support on eligible repairs|warranty conditions and exclusions/i);
  });

  it.each([
    ["phone", "iphone", "iphone-15"],
    ["laptop", "macbook", "macbook-air-m2"],
  ])("keeps the %s Model Hub scoped to fitted parts and workmanship", async (category, brand, model) => {
    const html = renderToStaticMarkup(await ModelHubPage({ params: Promise.resolve({ category, brand, model }) }));

    expectNoLegacyWarranty(html);
    expect(html).toMatch(/eligible.*6-month warranty.*fitted part and workmanship|6-month warranty.*fitted part and workmanship/i);
    expect(html).not.toMatch(/whole[- ]device warranty/i);
  });

  it("keeps the Croydon Location template limited to standard-repair warranty support", async () => {
    const html = renderToStaticMarkup(await LocationPage({ params: Promise.resolve({ suburb: "croydon" }) }));

    expectNoLegacyWarranty(html);
    expect(html).toContain("Standard repairs include warranty support on parts and labour");
    expect(html).not.toContain("with a 6-month warranty");
  });

  it("keeps Blog index and article templates free of legacy warranty copy", async () => {
    const indexHtml = renderToStaticMarkup(await BlogPage());
    const articleHtml = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug: "repair-warranty-guide" }) }));

    expectNoLegacyWarranty(indexHtml);
    expectNoLegacyWarranty(articleHtml);
  });
});
