import { describe, expect, it, vi } from "vitest";

const getGoogleReviews = vi.hoisted(() => vi.fn());

vi.mock("@/lib/googleReviews.server", () => ({
  getGoogleReviews,
  GOOGLE_REVIEWS_REVALIDATE_SECONDS: 86400,
}));

import { GET } from "./route";

describe("GET /api/google-reviews", () => {
  it("publishes a 24-hour shared-cache response without the former 10-minute TTL", async () => {
    getGoogleReviews.mockResolvedValue({ reviews: [], aggregateRating: { ratingValue: "", reviewCount: "" } });

    const response = await GET();
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("s-maxage=86400");
    expect(cacheControl).toContain("stale-while-revalidate=604800");
    expect(cacheControl).not.toContain("s-maxage=600");
  });
});
