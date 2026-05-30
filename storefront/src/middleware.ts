import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Update session and get initial response
  const response = await updateSession(request);

  const url = request.nextUrl;
  const path = url.pathname;
  const host = request.headers.get('host') || '';
  
  // ==========================================
  // STEALTH DOMAIN LOGIC (pos. / api.)
  // ==========================================
  const isSubdomain = host.includes('pos.alimobile.com.au') || host.includes('api.alimobile.com.au');
  
  if (isSubdomain) {
    let isAuthorized = false;

    // 1. WHITELIST: Open routes for customers
    if (path === '/feedback' || path === '/portal') {
      isAuthorized = true;
    }

    // 2. BACKDOOR: Query Param Gate & Cookie Session
    const gatekey = url.searchParams.get('gatekey');
    const secretKey = process.env.ADMIN_SYNC_SECRET || 'alimobile-stealth-key';
    const stealthCookie = request.cookies.get('pos_device_ticket')?.value;

    if (gatekey === secretKey) {
      // Issue secure cookie and strip the query param to hide it
      url.searchParams.delete('gatekey');
      const stealthResponse = NextResponse.redirect(url);
      stealthResponse.cookies.set('pos_device_ticket', secretKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 315360000 // 10 years for permanent POS device authorization
      });
      return stealthResponse;
    }

    if (stealthCookie === secretKey) {
      isAuthorized = true;
    }

    // 3. API INTERNAL BYPASS: Allow Backend Cron/Webhooks with Bearer Token
    const authHeader = request.headers.get('authorization');
    if (host.includes('api.alimobile.com.au') && authHeader === `Bearer ${secretKey}`) {
      isAuthorized = true;
    }

    // 4. STEALTH 404 BLOCK
    if (!isAuthorized) {
      // Force Next.js to render a 404 by rewriting to a non-existent path
      url.pathname = '/__stealth_404_blackhole__';
      const blockResponse = NextResponse.rewrite(url);
      blockResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
      return blockResponse;
    }
  }

  // Define POS restricted routes (for main domain or authorized subdomain traffic)
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
