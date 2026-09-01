export async function GET() {
  return new Response(
    "Repair status tracking is temporarily unavailable. We will contact you by SMS when your repair is ready.",
    {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 404,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
