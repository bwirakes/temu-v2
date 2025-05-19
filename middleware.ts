import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { CustomUser } from './lib/types';

// Define path mappings for API redirects
const API_REDIRECTS = {
  '/api/onboarding': '/api/job-seeker/onboarding',
};

// Define path mappings for page redirects
const PAGE_REDIRECTS = {
  '/onboarding': '/job-seeker/onboarding',
  '/employer-onboarding': '/employer/onboarding',
  '/profile': '/job-seeker/profile',
};

// Define routes that should bypass session revalidation
// to prevent unnecessary redirects and session validation
const SESSION_PERSISTENCE_ROUTES = [
  '/job-seeker/profile'
];

// Default onboarding paths if redirectTo is undefined
const DEFAULT_PATHS: Record<string, string> = {
  'job_seeker': '/job-seeker/onboarding/informasi-dasar',
  'employer': '/employer/onboarding/informasi-perusahaan'
};

// Auth-related routes that should never be redirected
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signout',
  '/auth/signup',
  '/auth/error',
  '/auth/verify-request',
  '/api/auth/session',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/signup',
  '/api/auth/callback',
  '/api/auth/apply'
];

// Public routes - accessible to everyone
const PUBLIC_ROUTES = [
  '/auth/signin', 
  '/auth/signup', 
  '/careers',
  '/about',
  '/login'
];

// Routes that should skip onboarding checks
const SKIP_ONBOARDING_CHECK_ROUTES = [
  '/api/employer/onboarding',
  '/api/employer/check-onboarding',
  '/api/job-seeker/onboarding',
  '/api/job-seeker/check-onboarding',
  '/api/job-seeker/onboarding/submit',
  '/api/upload',
  '/api/upload/',
  '/_next',
  '/favicon.ico',
  '.svg',
  '/images/'
];

// Add explicit statement to exclude /api/upload from middleware
export const EXCLUDED_PATHS = [
  '/api/upload'
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Skip logging in production to reduce overhead
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Middleware: Processing ${pathname}`);
  }

  // Fast path: Skip middleware for paths that never need auth checks
  // This prevents unnecessary session validation for static assets and API routes
  if (
    SKIP_ONBOARDING_CHECK_ROUTES.some(route => pathname.includes(route)) ||
    AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`)) ||
    PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`)) ||
    EXCLUDED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  // Handle path redirects (API and page redirects) before auth checks
  // This prevents unnecessary session validation for simple path mappings
  for (const [oldPath, newPath] of Object.entries(API_REDIRECTS)) {
    if (pathname.startsWith(oldPath)) {
      url.pathname = pathname.replace(oldPath, newPath);
      return NextResponse.redirect(url);
    }
  }

  for (const [oldPath, newPath] of Object.entries(PAGE_REDIRECTS)) {
    if (pathname === oldPath || pathname.startsWith(`${oldPath}/`)) {
      url.pathname = pathname.replace(oldPath, newPath);
      return NextResponse.redirect(url);
    }
  }

  try {
    // Get the session with auth data - this is cached so it's quite efficient
    const session = await auth();

    // No user is logged in - redirect to signin except for public routes
    if (!session?.user) {
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/careers', request.url));
      }
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const user = session.user as CustomUser;
    const userType = user.userType;
    const onboardingCompleted = user.onboardingCompleted === true;
    const onboardingRedirectTo = user.onboardingRedirectTo;
    
    // Only log in development to reduce overhead
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Middleware: User authenticated, type: ${userType}, email: ${user.email}, onboarding completed: ${onboardingCompleted}`);
    }

    // CASE 1: Root path for authenticated users
    if (pathname === '/') {
      const dashboardPath = userType === 'job_seeker' ? '/job-seeker/dashboard' : '/employer/dashboard';
      
      if (onboardingCompleted) {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      } else {
        // Use onboardingRedirectTo from session if available, otherwise fallback to default
        const redirectPath = onboardingRedirectTo || DEFAULT_PATHS[userType];
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
    
    // CASE 2: Handle /job-seeker and /employer base routes that should never directly render
    if (pathname === '/job-seeker' || pathname === '/employer') {
      if (onboardingCompleted) {
        const dashboardPath = `${pathname}/dashboard`;
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      } else {
        const redirectPath = onboardingRedirectTo || DEFAULT_PATHS[userType];
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // CASE 3: Handle user type specific paths
    const userPrefix = userType === 'job_seeker' ? '/job-seeker' : '/employer';
    const isAccessingOnboarding = pathname.startsWith(`${userPrefix}/onboarding`);
    const isAccessingWrongUserType = 
      (userType === 'job_seeker' && pathname.startsWith('/employer')) || 
      (userType === 'employer' && pathname.startsWith('/job-seeker'));
    
    // Prevent accessing wrong user type routes
    if (isAccessingWrongUserType) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Handle onboarding routes
    if (isAccessingOnboarding) {
      // Special case: Once onboarding is completed, the user should still be able
      // to view the confirmation page (last step), but not edit previous steps
      const isKonfirmasiPage = pathname.includes('/konfirmasi') || pathname.includes('/ringkasan');
      
      // If onboarding is already completed and trying to access a non-confirmation step,
      // redirect to dashboard
      if (onboardingCompleted && !isKonfirmasiPage) {
        return NextResponse.redirect(new URL(`${userPrefix}/dashboard`, request.url));
      }
      
      // Otherwise, allow continuation to onboarding pages
      return NextResponse.next();
    }
    
    // For non-onboarding routes, check if onboarding is completed
    if (!onboardingCompleted) {
      // Use onboardingRedirectTo from session if available, otherwise fallback to default
      const redirectPath = onboardingRedirectTo || DEFAULT_PATHS[userType];
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Allow access for all other scenarios
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Unhandled error:', error);
    // Default behavior on unhandled errors is to allow access and let the page handle errors
    return NextResponse.next();
  }
}

// Expanded matcher to ensure we catch all relevant paths
export const config = {
  matcher: [
    // Basic routes we want the middleware to handle
    '/',
    '/job-seeker',
    '/employer',
    '/job-seeker/:path*',
    '/employer/:path*',
    '/api/onboarding/:path*',
    '/onboarding/:path*',
    '/employer-onboarding/:path*',
  ]
};
