import { beforeEach, describe, expect, it, vi } from "vitest";

const getGoogleReviews = vi.hoisted(() => vi.fn());

vi.mock("@/lib/googleReviews.server", () => ({
  getGoogleReviews,
  GOOGLE_REVIEWS_REVALIDATE_SECONDS: 86400,
  GOOGLE_REVIEWS_FALLBACK_REVALIDATE_SECONDS: 300,
}));

import { GET } from "./route";

describe("GET /api/google-reviews", () => {
  beforeEach(() => {
    getGoogleReviews.mockReset();
  });

  it.each(["google", "google-partial-fallback"])("publishes %s results with the 24-hour shared TTL", async (source) => {
    getGoogleReviews.mockResolvedValue({
      source,
      reviews: [],
      aggregateRating: { ratingValue: "4.9", reviewCount: "100" },
    });

    const response = await GET();
    const cacheControl = response.headers.get("Cache-Control");

    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("s-maxage=86400");
    expect(cacheControl).toContain("stale-while-revalidate=604800");
    expect(cacheControl).not.toContain("s-maxage=600");
  });

  it("short-caches fallback results without exposing error details", async () => {
    getGoogleReviews.mockResolvedValue({
      source: "fallback",
      reviews: [],
      aggregateRating: { ratingValue: "", reviewCount: "" },
    });

    const response = await GET();
    const cacheControl = response.headers.get("Cache-Control");
    const payload = await response.json();

    expect(cacheControl).toContain("s-maxage=300");
    expect(cacheControl).toContain("stale-while-revalidate=60");
    expect(cacheControl).not.toContain("s-maxage=86400");
    expect(payload.aggregateRating).toEqual({ ratingValue: "", reviewCount: "" });
    expect(payload).not.toHaveProperty("error");
    expect(JSON.stringify(payload)).not.toContain("test-key");
  });
});
