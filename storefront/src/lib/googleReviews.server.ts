import {
  createFallbackGoogleReviewsPayload,
  fallbackAggregateRating,
  fallbackFiveStarReviews,
  type GoogleReviewsPayload,
  type PublicGoogleReview,
} from "@/lib/reviewsData";

const GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const GOOGLE_REVIEWS_TIMEOUT_MS = 3500;
const MIN_REVIEW_COUNT = 6;

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

function getGooglePlacesConfig() {
  return {
    apiKey: process.env.GOOGLE_PLACES_API_KEY,
    placeId: process.env.GOOGLE_PLACE_ID || process.env.GOOGLE_BUSINESS_PLACE_ID,
  };
}

function toPublicReview(review: GooglePlaceReview, index: number): PublicGoogleReview | null {
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

function mergeWithFallback(liveReviews: PublicGoogleReview[]) {
  const seen = new Set(liveReviews.map((review) => review.id));
  const fallbackFill = fallbackFiveStarReviews.filter((review) => !seen.has(review.id));

  return [...liveReviews, ...fallbackFill].slice(0, Math.max(MIN_REVIEW_COUNT, liveReviews.length));
}

export async function getGoogleReviews(): Promise<GoogleReviewsPayload> {
  const { apiKey, placeId } = getGooglePlacesConfig();

  if (!apiKey || !placeId) {
    return createFallbackGoogleReviewsPayload();
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_REVIEWS_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GOOGLE_PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=en`,
      {
        cache: "no-store",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews",
        },
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`);
    }

    const place = (await response.json()) as GooglePlaceDetailsResponse;
    const liveFiveStarReviews = (place.reviews ?? [])
      .map(toPublicReview)
      .filter((review): review is PublicGoogleReview => review !== null);

    if (liveFiveStarReviews.length === 0) {
      return createFallbackGoogleReviewsPayload();
    }

    const reviews = mergeWithFallback(liveFiveStarReviews);

    return {
      reviews,
      aggregateRating: {
        ratingValue:
          typeof place.rating === "number"
            ? place.rating.toFixed(1)
            : fallbackAggregateRating.ratingValue,
        reviewCount:
          typeof place.userRatingCount === "number"
            ? String(place.userRatingCount)
            : fallbackAggregateRating.reviewCount,
      },
      source: liveFiveStarReviews.length >= MIN_REVIEW_COUNT ? "google" : "google-partial-fallback",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return createFallbackGoogleReviewsPayload();
  } finally {
    clearTimeout(timeout);
  }
}
