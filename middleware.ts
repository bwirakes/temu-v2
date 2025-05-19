import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { CustomUser } from './lib/types';
import { getOnboardingStatus } from './lib/auth-helpers';

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
  '/auth/verify-request'
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

  console.log(`Middleware: Processing ${pathname}`);

  // Skip middleware for excluded paths
  if (
    SKIP_ONBOARDING_CHECK_ROUTES.some(route => pathname.includes(route)) ||
    AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`)) ||
    PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`)) ||
    EXCLUDED_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  // Handle path redirects (API and page redirects)
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
    
    console.log(`Middleware: User authenticated, type: ${userType}, email: ${user.email}, onboarding completed: ${onboardingCompleted}`);

    // Handle root path for authenticated users
    if (pathname === '/') {
      const dashboardPath = userType === 'job_seeker' ? '/job-seeker/dashboard' : '/employer/dashboard';
      
      if (onboardingCompleted) {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      } else {
        const onboardingStatus = await getOnboardingStatus(user.id, userType);
        const redirectPath = onboardingStatus.redirectTo || DEFAULT_PATHS[userType];
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    // Handle user type specific paths
    const userPrefix = userType === 'job_seeker' ? '/job-seeker' : '/employer';
    const isAccessingOnboarding = pathname.startsWith(`${userPrefix}/onboarding`);
    const isAccessingWrongUserType = 
      (userType === 'job_seeker' && pathname.startsWith('/employer')) || 
      (userType === 'employer' && pathname.startsWith('/job-seeker'));
    
    // Prevent accessing wrong user type routes
    if (isAccessingWrongUserType) {
      console.log(`Middleware: ${userType} attempting to access wrong user type route, redirecting`);
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Allow access to onboarding routes regardless of completion status
    if (isAccessingOnboarding) {
      // If onboarding is already completed, redirect to dashboard
      if (onboardingCompleted && !pathname.includes('/konfirmasi')) {
        console.log(`Middleware: ${userType} already completed onboarding, redirecting to dashboard`);
        return NextResponse.redirect(new URL(`${userPrefix}/dashboard`, request.url));
      }
      return NextResponse.next();
    }
    
    // For non-onboarding routes, check if onboarding is completed
    if (!onboardingCompleted) {
      const onboardingStatus = await getOnboardingStatus(user.id, userType);
      const redirectPath = onboardingStatus.redirectTo || DEFAULT_PATHS[userType];
      console.log(`Middleware: ${userType} onboarding incomplete, redirecting to ${redirectPath}`);
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

// Don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Basic routes we want the middleware to handle
    '/',
    '/job-seeker/:path*',
    '/employer/:path*',
    '/api/onboarding/:path*',
    '/onboarding/:path*',
    '/employer-onboarding/:path*',
  ]
};
