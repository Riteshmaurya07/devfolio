import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, api routes, and next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // 1. Unauthenticated users trying to access protected routes
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Authenticated users
  if (token) {
    try {
      // Decode JWT payload (Edge runtime compatible)
      const payloadBase64 = token.split('.')[1];
      const payloadString = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadString);
      
      const isOnboarded = payload.is_onboarded === true;

      // 2a. Logged in users shouldn't access auth pages
      if (authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(isOnboarded ? '/dashboard' : '/onboarding', request.url));
      }

      // 2b. Force onboarding
      if (!isOnboarded && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // 2c. Fully onboarded users shouldn't access onboarding again
      if (isOnboarded && pathname === '/onboarding') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (e) {
      // If token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
