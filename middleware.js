// middleware.js - Enhanced with proper onboarding handling
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public paths that don't require auth
    const publicPaths = ['/auth/signin', '/auth/signup', '/'];
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Allow access to onboarding page always (for users completing onboarding)
    if (path === '/onboarding') {
      // If already onboarded, redirect to dashboard
      if (token.isOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // For protected routes, check if onboarding is complete
    const protectedPaths = ['/dashboard', '/products/add'];
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

    if (isProtectedPath && !token.isOnboarded) {
      // User needs to complete onboarding first
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public paths are always authorized
        if (path === '/' || path.startsWith('/auth/')) {
          return true;
        }
        
        // For other paths, require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/add',
    '/onboarding',
    '/auth/:path*',
  ],
};