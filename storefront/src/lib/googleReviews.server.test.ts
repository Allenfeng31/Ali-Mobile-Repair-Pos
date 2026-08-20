/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const unstableCache = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ unstable_cache: unstableCache }));

function createDataCache() {
  return (reader: (...args: string[]) => Promise<unknown>, _key: string[], options: { revalidate: number }) => {
    let cached: unknown;
    let expiresAt = 0;
    let inFlight: Promise<unknown> | undefined;

    return async (...args: string[]) => {
      if (cached !== undefined && Date.now() < expiresAt) return cached;
      if (!inFlight) {
        inFlight = reader(...args).then((value) => {
          cached = value;
          expiresAt = Date.now() + options.revalidate * 1000;
          return value;
        }).finally(() => {
          inFlight = undefined;
        });
      }
      return inFlight;
    };
  };
}

async function loadGoogleReviews() {
  vi.resetModules();
  return import("./googleReviews.server");
}

function legacySuccessResponse() {
  return new Response(JSON.stringify({
    status: "OK",
    result: {
      rating: 4.8,
      user_ratings_total: 127,
      reviews: [{
        author_name: "Google Customer",
        rating: 5,
        text: "Excellent repair service.",
        relative_time_description: "a week ago",
        time: 1760000000,
      }],
    },
  }), { status: 200 });
}

describe("Google Places review cache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T00:00:00.000Z"));
    unstableCache.mockReset().mockImplementation(createDataCache());
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "test-key");
    vi.stubEnv("GOOGLE_PLACE_ID", "test-place");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("uses a 24-hour tagged Data Cache and shares one upstream request within that TTL", async () => {
    const fetchMock = vi.fn().mockImplementation(legacySuccessResponse);
    vi.stubGlobal("fetch", fetchMock);
    const { getGoogleReviews, GOOGLE_REVIEWS_CACHE_TAG, GOOGLE_REVIEWS_REVALIDATE_SECONDS } = await loadGoogleReviews();

    const [first, second] = await Promise.all([getGoogleReviews(), getGoogleReviews()]);

    expect(first.aggregateRating).toEqual({ ratingValue: "4.8", reviewCount: "127" });
    expect(first.reviews).toEqual(expect.arrayContaining([
      expect.objectContaining({ authorName: "Google Customer", rating: 5 }),
    ]));
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(unstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      [GOOGLE_REVIEWS_CACHE_TAG],
      { revalidate: 86400, tags: [GOOGLE_REVIEWS_CACHE_TAG] }
    );
    expect(GOOGLE_REVIEWS_REVALIDATE_SECONDS).toBe(86400);
  });

  it("permits one refreshed upstream read after the 24-hour cache lifetime", async () => {
    const fetchMock = vi.fn().mockImplementation(legacySuccessResponse);
    vi.stubGlobal("fetch", fetchMock);
    const { getGoogleReviews } = await loadGoogleReviews();

    await getGoogleReviews();
    await vi.advanceTimersByTimeAsync(86400 * 1000 - 1);
    await getGoogleReviews();
    await vi.advanceTimersByTimeAsync(1);
    await getGoogleReviews();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps rating, userRatingCount, and reviews from the current Places API response", async () => {
    vi.stubGlobal("fetch", vi.fn((url: string) => {
      if (url.startsWith("https://maps.googleapis.com")) {
        return Promise.resolve(new Response(JSON.stringify({ status: "ZERO_RESULTS" }), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({
        rating: 4.9,
        userRatingCount: 314,
        reviews: [{
          name: "places/reviews/current",
          rating: 5,
          text: { text: "Fast and careful repair." },
          authorAttribution: { displayName: "Current API Customer" },
          relativePublishTimeDescription: "2 days ago",
        }],
      }), { status: 200 }));
    }));
    const { getGoogleReviews } = await loadGoogleReviews();

    const payload = await getGoogleReviews();

    expect(payload.aggregateRating).toEqual({ ratingValue: "4.9", reviewCount: "314" });
    expect(payload.reviews).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "places/reviews/current", authorName: "Current API Customer" }),
    ]));
  });

  it("uses the existing fallback with an empty aggregate rating after Places failures", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockRejectedValueOnce(new TypeError("network unavailable")));
    const { getGoogleReviews } = await loadGoogleReviews();

    const payload = await getGoogleReviews();

    expect(payload).toMatchObject({ source: "fallback", aggregateRating: { ratingValue: "", reviewCount: "" } });
    expect(payload.reviews.length).toBeGreaterThan(0);
  });

  it("returns the existing fallback without a Google request when configuration is absent", async () => {
    vi.stubEnv("GOOGLE_PLACES_API_KEY", "");
    vi.stubEnv("GOOGLE_PLACE_ID", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { getGoogleReviews } = await loadGoogleReviews();

    await expect(getGoogleReviews()).resolves.toMatchObject({
      source: "fallback",
      aggregateRating: { ratingValue: "", reviewCount: "" },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
