"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/ReviewsSection.module.css";
import {
  staticFallbackGoogleReviewsPayload,
  type GoogleReviewsPayload,
  type PublicGoogleReview,
} from "@/lib/reviewsData";

function GoogleLogo() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function StarRating() {
  return (
    <span className={styles.stars} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg key={index} aria-hidden="true" viewBox="0 0 20 20">
          <path d="M10 1.55l2.52 5.11 5.64.82-4.08 3.98.96 5.62L10 14.43l-5.04 2.65.96-5.62-4.08-3.98 5.64-.82L10 1.55z" />
        </svg>
      ))}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isPublicGoogleReview(value: unknown): value is PublicGoogleReview {
  if (!value || typeof value !== "object") {
    return false;
  }

  const review = value as Partial<PublicGoogleReview>;

  return (
    typeof review.id === "string" &&
    typeof review.authorName === "string" &&
    review.rating === 5 &&
    typeof review.text === "string" &&
    typeof review.relativeTimeDescription === "string"
  );
}

function isGoogleReviewsPayload(value: unknown): value is GoogleReviewsPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<GoogleReviewsPayload>;

  return (
    Array.isArray(payload.reviews) &&
    payload.reviews.length > 0 &&
    payload.reviews.every(isPublicGoogleReview) &&
    typeof payload.aggregateRating?.ratingValue === "string" &&
    typeof payload.aggregateRating.reviewCount === "string"
  );
}

function buildLocalBusinessSchema(payload: GoogleReviewsPayload) {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": "https://alimobile.com.au/#localbusiness",
    name: "Ali Mobile & Repair",
    image: "https://alimobile.com.au/logo.png",
    url: "https://alimobile.com.au",
    telephone: "+61481058514",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ringwood Square Shopping Centre Kiosk C1, Seymour St",
      addressLocality: "Ringwood",
      addressRegion: "VIC",
      postalCode: "3134",
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -37.81534,
      longitude: 145.22851,
    },
    ...(payload.aggregateRating.ratingValue && payload.aggregateRating.reviewCount ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: payload.aggregateRating.ratingValue,
        reviewCount: payload.aggregateRating.reviewCount,
        bestRating: "5",
        worstRating: "1",
      }
    } : {}),
    review: payload.reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.authorName,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: review.text,
      datePublished: review.publishTime,
    })),
  };
}

function ReviewCard({ review }: { review: PublicGoogleReview }) {
  return (
    <article className={styles.card} aria-label={`${review.authorName} 5-star Google review`}>
      <div>
        <div className={styles.topline}>
          <StarRating />
          <span className={styles.googleMark}>
            <GoogleLogo />
          </span>
        </div>
        <p className={styles.reviewText}>{review.text}</p>
      </div>

      <footer className={styles.footer}>
        <span className={styles.avatar} aria-hidden="true">
          {getInitials(review.authorName)}
        </span>
        <div>
          <p className={styles.author}>{review.authorName}</p>
          <p className={styles.time}>{review.relativeTimeDescription}</p>
        </div>
      </footer>
    </article>
  );
}

export default function ReviewsSection() {
  const [payload, setPayload] = useState<GoogleReviewsPayload>(staticFallbackGoogleReviewsPayload);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      try {
        const response = await fetch("/api/google-reviews", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const nextPayload = (await response.json()) as unknown;

        if (isGoogleReviewsPayload(nextPayload)) {
          setPayload(nextPayload);
        }
      } catch {
        // The section already has safe 5-star fallback content rendered.
      }
    }

    loadReviews();

    return () => controller.abort();
  }, []);

  const marqueeReviews = useMemo(
    () => payload.reviews,
    [payload.reviews]
  );
  const localBusinessSchema = useMemo(() => buildLocalBusinessSchema(payload), [payload]);

  return (
    <section className={`${styles.section} homepage-reviews-section`} aria-labelledby="reviews-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Google Reviews</span>
          <h2 id="reviews-heading" className={styles.title}>
            Customer Reviews
          </h2>
          {payload.aggregateRating.ratingValue && payload.aggregateRating.reviewCount ? (
            <div className={styles.summary} aria-label={`${payload.aggregateRating.ratingValue} out of 5 from ${payload.aggregateRating.reviewCount} reviews`}>
              <StarRating />
              <span>{payload.aggregateRating.ratingValue} rating</span>
              <span className={styles.summaryDot} aria-hidden="true" />
              <span>{payload.aggregateRating.reviewCount} reviews</span>
            </div>
          ) : (
            <div className={styles.summary} aria-label="See our latest Google reviews">
              <StarRating />
              <span>See our latest Google reviews</span>
            </div>
          )}
        </header>

        <div className={styles.stage} aria-label="5-star customer review marquee">
          <div className={styles.marquee}>
            {marqueeReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </div>
        </div>

        <div className={styles.cta}>
          <a
            className={styles.ctaLink}
            href="https://www.google.com/search?q=Ali+Mobile+%26+Repair+Ringwood+reviews"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read more on Google
          </a>
        </div>
      </div>
    </section>
  );
}
