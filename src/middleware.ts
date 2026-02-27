import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin area (except login page)
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin' || pathname === '/admin/';

  if (isAdminRoute && !isLoginPage) {
    try {
      // Check for auth in cookies (localStorage can't be accessed in middleware)
      const adminAuth = request.cookies.get('adminAuth')?.value;

      if (!adminAuth) {
        // Redirect to login
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
