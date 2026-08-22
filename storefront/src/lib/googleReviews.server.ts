import {
  createFallbackGoogleReviewsPayload,
  fallbackAggregateRating,
  fallbackFiveStarReviews,
  type GoogleReviewsPayload,
  type PublicGoogleReview,
} from "@/lib/reviewsData";
import { unstable_cache } from "next/cache";

const GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const GOOGLE_PLACES_LEGACY_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";
const GOOGLE_REVIEWS_TIMEOUT_MS = 3500;
const MIN_REVIEW_COUNT = 6;
export const GOOGLE_REVIEWS_REVALIDATE_SECONDS = 86400;
export const GOOGLE_REVIEWS_FALLBACK_REVALIDATE_SECONDS = 300;
export const GOOGLE_REVIEWS_CACHE_TAG = "google-reviews";
export const GOOGLE_REVIEWS_CACHE_KEY = "google-reviews-v2";

type GoogleReviewsApi = "legacy" | "new" | "configuration" | "all";
type GoogleReviewsFailureKind = `http-${number}` | "invalid-response" | "no-valid-reviews" | "network" | "timeout" | "missing-configuration";

class GoogleReviewsUpstreamError extends Error {
  constructor(
    readonly api: GoogleReviewsApi,
    readonly kind: GoogleReviewsFailureKind
  ) {
    super(`${api}:${kind}`);
  }
}

interface GooglePlaceReviewText {
  text?: string;
  languageCode?: string;
}

interface GooglePlaceAuthor {
  displayName?: string;
}

interface GooglePlaceReview {
  name?: string;
  rating?: number;
  text?: GooglePlaceReviewText;
  authorAttribution?: GooglePlaceAuthor;
  relativePublishTimeDescription?: string;
  publishTime?: string;
}

interface GooglePlaceDetailsResponse {
  id?: string;
  displayName?: GooglePlaceReviewText;
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReview[];
}

interface GoogleLegacyReview {
  author_name?: string;
  rating?: number;
  relative_time_description?: string;
  text?: string;
  time?: number;
}

interface GoogleLegacyPlaceDetailsResponse {
  status?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: GoogleLegacyReview[];
  };
}

function getGooglePlacesConfig() {
  return {
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
    placeId: process.env.GOOGLE_PLACE_ID || process.env.GOOGLE_BUSINESS_PLACE_ID,
  };
}

function logGoogleReviewsFailure(api: GoogleReviewsApi, kind: GoogleReviewsFailureKind) {
  console.warn(`[google-reviews] ${api} ${kind}`);
}

function getGoogleReviewsFailureKind(error: unknown): GoogleReviewsFailureKind {
  if (error instanceof GoogleReviewsUpstreamError) return error.kind;
  if (error instanceof Error && error.name === "AbortError") return "timeout";
  return "network";
}

async function withIndependentGoogleTimeout<T>(
  api: Extract<GoogleReviewsApi, "legacy" | "new">,
  request: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_REVIEWS_TIMEOUT_MS);

  try {
    return await request(controller.signal);
  } catch (error) {
    if (controller.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw new GoogleReviewsUpstreamError(api, "timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function toPublicReviewFromNewApi(review: GooglePlaceReview, index: number): PublicGoogleReview | null {
  const text = review.text?.text?.trim();
  const authorName = review.authorAttribution?.displayName?.trim();

  if (review.rating !== 5 || !text || !authorName) {
    return null;
  }

  return {
    id: review.name || `google-review-${index}`,
    authorName,
    rating: 5,
    text,
    relativeTimeDescription: review.relativePublishTimeDescription || "Google review",
    publishTime: review.publishTime,
  };
}

function toPublicReviewFromLegacyApi(
  review: GoogleLegacyReview,
  index: number
): PublicGoogleReview | null {
  const text = review.text?.trim();
  const authorName = review.author_name?.trim();

  if (review.rating !== 5 || !text || !authorName) {
    return null;
  }

  const publishTime =
    typeof review.time === "number" ? new Date(review.time * 1000).toISOString() : undefined;

  return {
    id: `google-legacy-review-${review.time ?? index}-${authorName}`,
    authorName,
    rating: 5,
    text,
    relativeTimeDescription: review.relative_time_description || "Recent Google review",
    publishTime,
  };
}

function sortReviewsNewestFirst(reviews: PublicGoogleReview[]) {
  return [...reviews].sort((a, b) => {
    const aTime = a.publishTime ? new Date(a.publishTime).getTime() : 0;
    const bTime = b.publishTime ? new Date(b.publishTime).getTime() : 0;

    return bTime - aTime;
  });
}

function mergeWithFallback(liveReviews: PublicGoogleReview[]) {
  const newestLiveReviews = sortReviewsNewestFirst(liveReviews);
  const seen = new Set(newestLiveReviews.map((review) => review.id));
  const fallbackFill = fallbackFiveStarReviews.filter((review) => !seen.has(review.id));

  return [...newestLiveReviews, ...fallbackFill].slice(
    0,
    Math.max(MIN_REVIEW_COUNT, newestLiveReviews.length)
  );
}

async function fetchNewestLegacyReviews(
  apiKey: string,
  placeId: string,
  signal: AbortSignal
): Promise<GoogleReviewsPayload | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "rating,user_ratings_total,reviews",
    reviews_sort: "newest",
    language: "en",
    key: apiKey,
  });

  const response = await fetch(`${GOOGLE_PLACES_LEGACY_DETAILS_URL}?${params.toString()}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new GoogleReviewsUpstreamError("legacy", `http-${response.status}`);
  }

  const place = (await response.json()) as GoogleLegacyPlaceDetailsResponse;

  if (place.status !== "OK") {
    throw new GoogleReviewsUpstreamError("legacy", "invalid-response");
  }

  const liveFiveStarReviews = (place.result?.reviews ?? [])
    .map(toPublicReviewFromLegacyApi)
    .filter((review): review is PublicGoogleReview => review !== null);

  if (liveFiveStarReviews.length === 0) {
    return null;
  }

  const reviews = mergeWithFallback(liveFiveStarReviews);

  return {
    reviews,
    aggregateRating: {
      ratingValue:
        typeof place.result?.rating === "number"
          ? place.result.rating.toFixed(1)
          : fallbackAggregateRating.ratingValue,
      reviewCount:
        typeof place.result?.user_ratings_total === "number"
          ? String(place.result.user_ratings_total)
          : fallbackAggregateRating.reviewCount,
    },
    source: liveFiveStarReviews.length >= MIN_REVIEW_COUNT ? "google" : "google-partial-fallback",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchRelevantNewApiReviews(
  apiKey: string,
  placeId: string,
  signal: AbortSignal
): Promise<GoogleReviewsPayload | null> {
  const response = await fetch(
    `${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=en`,
    {
      cache: "no-store",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews",
      },
      signal,
    }
  );

  if (!response.ok) {
    throw new GoogleReviewsUpstreamError("new", `http-${response.status}`);
  }

  const place = (await response.json()) as GooglePlaceDetailsResponse;
  const liveFiveStarReviews = (place.reviews ?? [])
    .map(toPublicReviewFromNewApi)
    .filter((review): review is PublicGoogleReview => review !== null);

  if (liveFiveStarReviews.length === 0) {
    return null;
  }

  const reviews = mergeWithFallback(liveFiveStarReviews);

  return {
    reviews,
    aggregateRating: {
      ratingValue:
        typeof place.rating === "number" ? place.rating.toFixed(1) : fallbackAggregateRating.ratingValue,
      reviewCount:
        typeof place.userRatingCount === "number"
          ? String(place.userRatingCount)
          : fallbackAggregateRating.reviewCount,
    },
    source: liveFiveStarReviews.length >= MIN_REVIEW_COUNT ? "google" : "google-partial-fallback",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchGoogleReviews(apiKey: string, placeId: string): Promise<GoogleReviewsPayload> {
  try {
    const newestReviews = await withIndependentGoogleTimeout("legacy", (signal) =>
      fetchNewestLegacyReviews(apiKey, placeId, signal)
    );

    if (newestReviews) return newestReviews;
    logGoogleReviewsFailure("legacy", "no-valid-reviews");
  } catch (error) {
    logGoogleReviewsFailure("legacy", getGoogleReviewsFailureKind(error));
  }

  try {
    const relevantReviews = await withIndependentGoogleTimeout("new", (signal) =>
      fetchRelevantNewApiReviews(apiKey, placeId, signal)
    );

    if (relevantReviews) return relevantReviews;
    logGoogleReviewsFailure("new", "no-valid-reviews");
  } catch (error) {
    logGoogleReviewsFailure("new", getGoogleReviewsFailureKind(error));
  }

  throw new GoogleReviewsUpstreamError("all", "no-valid-reviews");
}

const getCachedGoogleReviews = unstable_cache(
  fetchGoogleReviews,
  [GOOGLE_REVIEWS_CACHE_KEY],
  {
    revalidate: GOOGLE_REVIEWS_REVALIDATE_SECONDS,
    tags: [GOOGLE_REVIEWS_CACHE_TAG],
  }
);

export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  const { apiKey, placeId } = getGooglePlacesConfig();

  if (!apiKey || !placeId) {
    logGoogleReviewsFailure("configuration", "missing-configuration");
    return createFallbackGoogleReviewsPayload();
  }

  try {
    return await getCachedGoogleReviews(apiKey, placeId);
  } catch (error) {
    logGoogleReviewsFailure("all", getGoogleReviewsFailureKind(error));
    return createFallbackGoogleReviewsPayload();
  }
}
