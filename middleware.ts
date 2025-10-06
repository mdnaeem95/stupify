import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY! // ✅ FIXED!

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    }
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('❌ Middleware auth error:', error.message)
  }

  const path = request.nextUrl.pathname
  console.log(`🔒 Middleware check: ${path} | User: ${user ? '✅' : '❌'}`)

  // Protected routes - require authentication
  if (path.startsWith('/chat')) {
    if (!user) {
      console.log('⚠️ Redirecting to login - no authenticated user')
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Auth routes - redirect to chat if already logged in
  if (path.startsWith('/login') || path.startsWith('/signup')) {
    if (user) {
      console.log('✅ User already logged in, redirecting to /chat')
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/chat/:path*', '/login', '/signup'],
};