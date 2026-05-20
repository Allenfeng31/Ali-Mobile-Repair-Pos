import { NextResponse } from "next/server";

import { getGoogleReviews } from "@/lib/googleReviews.server";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getGoogleReviews();

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
