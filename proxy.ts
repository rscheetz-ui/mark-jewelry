import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Initialize the Supabase Edge Scanner with the updated getAll/setAll signature
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Update the incoming request cookies
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          
          // 2. Refresh the response object so it carries the new state
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          
          // 3. Update the outgoing response cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Ping the vault to securely verify the auth token on the server
  const { data: { user } } = await supabase.auth.getUser();

  // If trying to access the vault without a token -> send to login
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If already authenticated and trying to log in again -> send to the admin hub
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};