import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { CustomUser } from './lib/types';

// Define path mappings for redirects
const API_REDIRECTS = {
  '/api/onboarding': '/api/job-seeker/onboarding',
};

// Define path mappings for page redirects
const PAGE_REDIRECTS = {
  '/onboarding': '/job-seeker/onboarding',
  '/employer-onboarding': '/employer/onboarding',
  '/profile': '/job-seeker/profile',
  '/': 'job-seeker/dashboard'
};

// Define routes that should bypass session revalidation
// to prevent unnecessary redirects and session validation
const SESSION_PERSISTENCE_ROUTES = [
  '/job-seeker/profile'
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  console.log(`Middleware: Processing ${pathname}`);

  // Skip middleware for static files and images
  if (
    pathname.includes('/_next') || 
    pathname.includes('/favicon.ico') ||
    pathname.endsWith('.svg') ||
    pathname.includes('/images/')
  ) {
    return NextResponse.next();
  }

  // Skip middleware for employer onboarding API endpoints
  if (
    pathname.startsWith('/api/employer/onboarding') ||
    pathname.startsWith('/api/employer/check-onboarding')
  ) {
    console.log(`Middleware: Allowing access to employer onboarding API: ${pathname}`);
    return NextResponse.next();
  }

  // Handle path redirects first (from app/middleware.ts)
  // Check for API redirects
  for (const [oldPath, newPath] of Object.entries(API_REDIRECTS)) {
    if (pathname.startsWith(oldPath)) {
      const newUrl = pathname.replace(oldPath, newPath);
      url.pathname = newUrl;
      console.log(`Middleware: Redirecting API path ${pathname} to ${newUrl}`);
      return NextResponse.redirect(url);
    }
  }

  // Check for page redirects
  for (const [oldPath, newPath] of Object.entries(PAGE_REDIRECTS)) {
    if (pathname === oldPath || pathname.startsWith(`${oldPath}/`)) {
      const newUrl = pathname.replace(oldPath, newPath);
      url.pathname = newUrl;
      console.log(`Middleware: Redirecting page path ${pathname} to ${newUrl}`);
      return NextResponse.redirect(url);
    }
  }

  try {
    const session = await auth();
    
    // Public routes - accessible to everyone
    const publicRoutes = [
      '/auth/signin', 
      '/auth/signup', 
      '/', 
      '/careers',
      '/about'
    ];

    // Allow access to all public routes and their subpaths
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      console.log(`Middleware: Public route ${pathname}, allowing access`);
      return NextResponse.next();
    }

    // Special handling for profile page to prevent auth loops
    if (SESSION_PERSISTENCE_ROUTES.some(route => pathname.startsWith(route))) {
      // If user is already authenticated, allow access immediately
      if (session?.user) {
        console.log(`Middleware: User authenticated for persistence route ${pathname}, allowing access`);
        return NextResponse.next();
      }
      
      // Only redirect unauthenticated users with callback
      const callbackUrl = encodeURIComponent(pathname);
      console.log(`Middleware: Unauthenticated for persistence route, redirecting to login with callbackUrl=${callbackUrl}`);
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
    }

    // Check if user is authenticated for all other protected routes
    if (!session?.user) {
      console.log(`Middleware: No authenticated user, redirecting to signin`);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const user = session.user as CustomUser;
    const userType = user.userType;
    
    console.log(`Middleware: User authenticated, type: ${userType}, email: ${user.email}`);

    // Check if the user is a job seeker
    if (userType === 'job_seeker') {
      const { onboardingCompleted, onboardingRedirectTo } = session.user as {
        onboardingCompleted: boolean;
        onboardingRedirectTo: string;
      };
      
      // Allow access to job seeker onboarding routes and API endpoints
      if (
        pathname.startsWith('/job-seeker/onboarding') ||
        pathname.startsWith('/api/job-seeker/onboarding') ||
        pathname.startsWith('/api/job-seeker/check-onboarding')
      ) {
        console.log(`Middleware: Job seeker accessing onboarding route, allowing access`);
        return NextResponse.next();
      }
      
      // Check onboarding status for job seekers when accessing non-onboarding routes
      if (!onboardingCompleted) {
        console.log(`Middleware: Job seeker onboarding incomplete, redirecting to ${onboardingRedirectTo}`);
        return NextResponse.redirect(new URL(onboardingRedirectTo, request.url));
      }
      
      console.log(`Middleware: Job seeker onboarding complete, allowing access to ${pathname}`);
    }

    // Special handling for the root route when user is already logged in
    if (pathname === '/' && userType) {
      if (userType === 'employer') {
        // For employers, redirect to employer page
        return NextResponse.redirect(new URL('/employer', request.url));
      } else if (userType === 'job_seeker') {
        const { onboardingCompleted, onboardingRedirectTo } = session.user as {
          onboardingCompleted: boolean;
          onboardingRedirectTo: string;
        };
        
        if (!onboardingCompleted) {
          // If onboarding is not complete, redirect to the appropriate step
          return NextResponse.redirect(new URL(onboardingRedirectTo, request.url));
        }
        
        // If onboarding is complete, redirect to dashboard
        return NextResponse.redirect(new URL('/job-seeker/dashboard', request.url));
      }
    }

    // Job seeker specific routes
    if (pathname.startsWith('/job-seeker') && userType !== 'job_seeker') {
      console.log(`Middleware: Non-job-seeker attempting to access job seeker route, redirecting`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Employer specific routes
    if (pathname.startsWith('/employer') && userType !== 'employer') {
      console.log(`Middleware: Non-employer attempting to access employer route, redirecting`);
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Always allow access to employer onboarding when authenticated as employer
    // The client-side logic in the page will handle navigation between steps
    if (pathname.startsWith('/employer/onboarding/') && userType === 'employer') {
      console.log(`Middleware: Employer accessing onboarding, allowing access`);
      return NextResponse.next();
    }

    // Special handling for profile pages to preserve session
    if (pathname.startsWith('/job-seeker/profile') && userType === 'job_seeker') {
      console.log(`Middleware: Job seeker accessing profile, preserving session`);
      return NextResponse.next();
    }

    console.log(`Middleware: Access granted to ${pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Unhandled error:', error);
    // Default behavior on unhandled errors is to allow access and let the page handle errors
    return NextResponse.next();
  }
}

// Don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Match all paths except specific exclusions
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$|images).*)',
    
    // Include specific paths for redirects
    '/api/onboarding/:path*',
    '/onboarding/:path*',
    '/employer-onboarding/:path*',
  ]
};
