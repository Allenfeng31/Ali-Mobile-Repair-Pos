import { NextResponse } from "next/server";

import { getGoogleReviews, GOOGLE_REVIEWS_REVALIDATE_SECONDS } from "@/lib/googleReviews.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getGoogleReviews();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${GOOGLE_REVIEWS_REVALIDATE_SECONDS}, stale-while-revalidate=604800`,
    },
  });
}
