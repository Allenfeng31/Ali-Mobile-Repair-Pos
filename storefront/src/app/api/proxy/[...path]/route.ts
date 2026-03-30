import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, await params);
}

async function handleProxyRequest(request: NextRequest, params: { path: string[] }) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_POS_API_URL || "http://localhost:5173";
    const path = params.path.join("/");
    
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Proxy Error", details: error.message },
      { status: 500 }
    );
  }
}
