import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin area (except login page)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/api/');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage) {
    // Check for admin auth cookie
    const adminAuth = request.cookies.get('adminAuth')?.value;

    if (!adminAuth) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
