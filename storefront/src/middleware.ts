import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;
  
  // Define POS restricted routes
  const isPosRoute = path.startsWith('/dashboard') || path === '/login' || path.startsWith('/pos');

  // Basic auth check example (Replace 'auth_token' with your actual cookie)
  const token = request.cookies.get('auth_token')?.value;

  if (isPosRoute) {
    // 1. Auth check: Unauthenticated and not on the login page -> redirect to login
    if (!token && path !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. SEO Defense: Intercept response to inject X-Robots-Tag directly into HTTP Headers
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
    return response;
  }

  // Allow all (public) requests without modification
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all requests except those starting with:
     * 1. api (API routes)
     * 2. _next/static (static files)
     * 3. _next/image (image optimization routes)
     * 4. favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
