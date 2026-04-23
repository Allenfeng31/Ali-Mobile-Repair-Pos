import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Update session and get initial response
  const response = await updateSession(request);

  const url = request.nextUrl;
  const path = url.pathname;
  
  // Define POS restricted routes
  const isPosRoute = path.startsWith('/dashboard') || path === '/login' || path.startsWith('/pos');

  if (isPosRoute) {
    // Basic Supabase auth check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Managed in updateSession, but required for type safety
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Auth check: Unauthenticated and not on the login page -> redirect to login
    if (!user && path !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. SEO Defense: Intercept response to inject X-Robots-Tag directly into HTTP Headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
    return response;
  }

  return response;
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
