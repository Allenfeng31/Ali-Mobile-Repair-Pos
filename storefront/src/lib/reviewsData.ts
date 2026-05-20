export type ReviewsPayloadSource = "google" | "google-partial-fallback" | "fallback";

export interface PublicGoogleReview {
  id: string;
  authorName: string;
  rating: 5;
  text: string;
  relativeTimeDescription: string;
  publishTime?: string;
}

export interface ReviewAggregateRating {
  ratingValue: string;
  reviewCount: string;
}

export interface GoogleReviewsPayload {
  reviews: PublicGoogleReview[];
  aggregateRating: ReviewAggregateRating;
  source: ReviewsPayloadSource;
  updatedAt: string;
}

export const fallbackAggregateRating: ReviewAggregateRating = {
  ratingValue: "4.9",
  reviewCount: "150",
};

export const fallbackFiveStarReviews: PublicGoogleReview[] = [
  {
    id: "fallback-bbqs-r-us",
    authorName: "BBQs-R-US",
    rating: 5,
    text: "Allen replaced my screen within an hour. Very honest and polite, great rate, and easily the best repair experience I have had.",
    relativeTimeDescription: "Local Google review",
  },
  {
    id: "fallback-janine-b",
    authorName: "Janine B",
    rating: 5,
    text: "Dropped my Samsung tablet in for a battery replacement. It was finished on time and works like a new one now. Highly recommended.",
    relativeTimeDescription: "Local Google review",
  },
  {
    id: "fallback-bumzigan-yebet",
    authorName: "Bumzigan Yebet",
    rating: 5,
    text: "Great service, very helpful and friendly. Highly recommend Ali Mobile & Repair for phone repairs in Ringwood.",
    relativeTimeDescription: "Local Google review",
  },
  {
    id: "fallback-john-williamson",
    authorName: "John Williamson",
    rating: 5,
    text: "Extremely friendly and competent. Fixed all my little issues and I basically have a new phone again. Thanks.",
    relativeTimeDescription: "Local Google review",
  },
  {
    id: "fallback-nina-meow",
    authorName: "Nina Meow",
    rating: 5,
    text: "I have used Ali Mobile several times. He has always been helpful, prompt, and fairly priced. Very pleased to have gone to him.",
    relativeTimeDescription: "Local Google review",
  },
  {
    id: "fallback-ringwood-customer",
    authorName: "Ringwood Customer",
    rating: 5,
    text: "Clear quote, fast turnaround, and the phone came back spotless. The repair felt careful, premium, and genuinely trustworthy.",
    relativeTimeDescription: "Local Google review",
  },
];

export const staticFallbackGoogleReviewsPayload: GoogleReviewsPayload = {
  reviews: fallbackFiveStarReviews,
  aggregateRating: fallbackAggregateRating,
  source: "fallback",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export function createFallbackGoogleReviewsPayload(): GoogleReviewsPayload {
  return {
    ...staticFallbackGoogleReviewsPayload,
    reviews: [...fallbackFiveStarReviews],
    aggregateRating: { ...fallbackAggregateRating },
    updatedAt: new Date().toISOString(),
  };
}
