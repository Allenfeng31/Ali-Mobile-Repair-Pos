import { NextRequest, NextResponse } from "next/server";
import { getLocalRepairInventoryFixture, isLocalRepairCatalogueOnly } from '@/lib/localRepairCatalogueFixture';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

async function handleProxyRequest(request: NextRequest, params: { path: string[] }) {
  try {
    const path = params.path.join('/');
    if (isLocalRepairCatalogueOnly()) {
      if (path === 'inventory') return NextResponse.json(getLocalRepairInventoryFixture());
      if (path === 'quality-tiers') return NextResponse.json([]);
      if (path === 'store-configs') {
        return NextResponse.json({ multi_discount_tier_2: 0.1, multi_discount_tier_3: 0.15 });
      }
      return NextResponse.json({ error: 'Proxy endpoint unavailable in local-only mode.' }, { status: 503 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_POS_API_URL || "https://api.alimobile.com.au";
    
    const searchParams = request.nextUrl.search;
    const targetUrl = `${backendUrl}/api/${path}${searchParams}`;

    const headers = new Headers(request.headers);
    headers.set("host", new URL(targetUrl).host);
    
    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      options.body = body;
    }

    const response = await fetch(targetUrl, options);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Internal Server Proxy Error", details: error instanceof Error ? error.message : 'Unknown proxy error' },
      { status: 500 }
    );
  }
}
