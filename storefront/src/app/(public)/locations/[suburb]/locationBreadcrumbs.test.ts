import { describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { SERVICE_AREAS } from "@/data/serviceAreas";

import { buildLocationBreadcrumbItems } from "./locationBreadcrumbs";

vi.mock("@/lib/api", () => ({
  fetchRepairCatalog: vi.fn().mockResolvedValue({ brands: [] }),
}));

const baseUrl = "https://www.alimobile.com.au";

describe("location breadcrumbs", () => {
  it("uses Home and the canonical current location for every configured page", () => {
    for (const area of SERVICE_AREAS) {
      const canonicalUrl = `${baseUrl}/locations/${area.slug}`;
      const items = buildLocationBreadcrumbItems(baseUrl, area);

      expect(items).toHaveLength(2);
      expect(items.map((item) => item.position)).toEqual([1, 2]);
      expect(new Set(items.map((item) => item.position)).size).toBe(items.length);
      expect(items[0]).toEqual({
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      });
      expect(items[1]).toEqual({
        "@type": "ListItem",
        position: 2,
        name: area.name,
        item: canonicalUrl,
      });
      expect(items.some((item) => item.item === `${baseUrl}/locations`)).toBe(false);
    }
  });

  it("keeps every configured location canonical URL in the sitemap", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    for (const area of SERVICE_AREAS) {
      expect(urls).toContain(`${baseUrl}/locations/${area.slug}`);
    }
  });
});
