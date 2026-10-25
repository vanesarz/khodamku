import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('khodamku_token')?.value;
  const role = request.cookies.get('khodamku_role')?.value;

  const isAdminRoute = pathname.startsWith('/admin');
  const isPengamalRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/pemanggilan') ||
    pathname.startsWith('/riwayat') ||
    pathname.startsWith('/profil') ||
    pathname === '/katalog';

  const isLoginPage = pathname === '/login';

  // 1. If visiting /login while already authenticated, redirect to appropriate home
  if (isLoginPage && token) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 2. Protect Admin routes
  if (isAdminRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role !== 'admin') {
      // Non-admin trying to access admin area -> redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Protect Pengamal routes
  if (isPengamalRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If an Admin accesses Pengamal shortcuts, intelligently route them to Admin equivalents
    if (role === 'admin') {
      if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (pathname === '/pemanggilan') {
        return NextResponse.redirect(new URL('/admin/pemanggilan', request.url));
      }
      if (pathname === '/riwayat') {
        return NextResponse.redirect(new URL('/admin/buku-catatan-gaib', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
