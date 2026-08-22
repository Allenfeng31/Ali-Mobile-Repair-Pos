import { NextResponse } from "next/server";

import {
  getGoogleReviews,
  GOOGLE_REVIEWS_FALLBACK_REVALIDATE_SECONDS,
  GOOGLE_REVIEWS_REVALIDATE_SECONDS,
} from "@/lib/googleReviews.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getGoogleReviews();
  const isGooglePayload = payload.source === "google" || payload.source === "google-partial-fallback";
  const revalidate = isGooglePayload
    ? GOOGLE_REVIEWS_REVALIDATE_SECONDS
    : GOOGLE_REVIEWS_FALLBACK_REVALIDATE_SECONDS;
  const staleWhileRevalidate = isGooglePayload ? 604800 : 60;

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}
