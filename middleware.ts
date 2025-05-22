import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { CustomUser } from './lib/types';

// Simple path mappings for redirects
const SIMPLE_REDIRECTS: Record<string, string> = {
  '/onboarding': '/job-seeker/onboarding',
  '/employer-onboarding': '/employer/onboarding',
  '/profile': '/job-seeker/profile',
  '/api/onboarding': '/api/job-seeker/onboarding',
};

// Auth-related routes that should never be redirected
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signout',
  '/auth/signup',
  '/auth/error',
  '/auth/verify-request',
];

// Public routes - accessible to everyone
const PUBLIC_ROUTES = [
  '/auth/signin', 
  '/auth/signup', 
  '/careers',
  '/about',
  '/login',
  '/job-application',
  '/job-seeker/job-application'  // Add the job-seeker path explicitly
];

// Routes that should completely bypass middleware
const BYPASS_ROUTES = [
  // API routes - bypass all API routes to avoid performance issues
  '/api/',
  // Static assets
  '/_next',
  '/favicon.ico',
  '.svg',
  '/images/',
  // Completely bypass all job application routes to prevent redirect loops
  '/job-application/',
  '/job-seeker/job-application/',
  // Add employer job posting routes to bypass middleware
  '/employer/job-posting/',
  // Add employer applicants routes to bypass middleware
  '/employer/applicants/',
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // ##########################################
  // CRITICAL PERFORMANCE OPTIMIZATION: 
  // IMMEDIATELY BYPASS ALL API ROUTES AND STATIC ASSETS
  // This ensures routes like /api/auth/apply are never redirected
  // ##########################################
  if (shouldBypassMiddleware(pathname)) {
    return NextResponse.next();
  }

  // ##########################################
  // SIMPLIFIED JOB APPLICATION FLOW:
  // Don't interfere with the job application flow at all,
  // let the pages handle their own auth checks
  // ##########################################
  if (
    pathname.startsWith('/job-application/') || 
    pathname.startsWith('/job-seeker/job-application/') ||
    pathname === '/job-application' ||
    pathname === '/job-seeker/job-application'
  ) {
    return NextResponse.next();
  }

  // ##########################################
  // SIMPLE PATH REDIRECTS
  // ##########################################
  // Handle simple path redirects before any authentication checks
  const redirectPath = getSimpleRedirectPath(pathname);
  if (redirectPath) {
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  // ##########################################
  // PUBLIC ROUTES CHECK
  // ##########################################
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ##########################################
  // ADMIN ROUTE PROTECTION
  // ##########################################
  if (pathname.startsWith('/admin')) {
    try {
      // Get the session with auth data
      const session = await auth();
      
      // If no user is logged in or the user is not the admin, redirect to signin
      if (!session?.user || session.user.email !== 'brandon.r.wirakesuma@gmail.com') {
        // Redirect to signin page with callback URL
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signinUrl);
      }
      
      // Allow access for admin
      return NextResponse.next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      // On error, redirect to homepage
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ##########################################
  // AUTHENTICATION CHECK
  // ##########################################
  try {
    // Get the session with auth data
    const session = await auth();

    // No user is logged in - redirect to signin
    if (!session?.user) {
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/careers', request.url));
      }
      
      // Preserve the original URL as a callbackUrl parameter
      const signinUrl = new URL('/auth/signin', request.url);
      // Only add callbackUrl if the current path isn't already /auth/signin
      if (pathname !== '/auth/signin') {
        signinUrl.searchParams.set('callbackUrl', pathname);
      }
      return NextResponse.redirect(signinUrl);
    }

    // User is authenticated - extract user type
    const user = session.user as CustomUser;
    const userType = user.userType;
    
    // ##########################################
    // USER TYPE BASED REDIRECTIONS & ACCESS CONTROL
    // ##########################################
    const userDashboard = userType === 'job_seeker' ? '/job-seeker/dashboard' : '/employer/dashboard';
    const otherUserTypePrefix = userType === 'job_seeker' ? '/employer' : '/job-seeker';
    
    // Prevent accessing the wrong user type's area
    if (pathname.startsWith(otherUserTypePrefix) && 
        !pathname.startsWith(`${otherUserTypePrefix}/onboarding/success`) && 
        !(userType === 'employer' && (
          pathname.startsWith('/employer/job-posting') || 
          pathname.startsWith('/employer/applicants')
        ))) { // Allow employers to access job posting and applicants
      console.log(`Redirecting user with type ${userType} from ${pathname} to /`);
      return NextResponse.redirect(new URL('/', request.url)); // Redirect to homepage, which will then redirect to correct dashboard
    }

    // Redirect root path to the appropriate dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL(userDashboard, request.url));
    }
    
    // Redirect /job-seeker base route to its dashboard
    if (pathname === '/job-seeker') {
      return NextResponse.redirect(new URL(`/job-seeker/dashboard`, request.url));
    }
    
    // Redirect /employer base route to its dashboard
    if (pathname === '/employer') {
      return NextResponse.redirect(new URL(`/employer/dashboard`, request.url));
    }

    // Allow access for all other paths if user type matches or it's a shared authenticated path
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, default to allowing access
    return NextResponse.next();
  }
}

// ##########################################
// HELPER FUNCTIONS (SIMPLIFIED)
// ##########################################

/**
 * CRITICAL OPTIMIZATION: Fast check to immediately bypass middleware
 */
function shouldBypassMiddleware(pathname: string): boolean {
  // First check for API routes (most important for performance)
  if (pathname.startsWith('/api/')) {
    return true;
  }
  
  // MOST IMPORTANT: Job application routes bypass middleware
  if (
    pathname.startsWith('/job-application/') || 
    pathname.startsWith('/job-seeker/job-application/') ||
    pathname === '/job-application' ||
    pathname === '/job-seeker/job-application'
  ) {
    return true;
  }
  
  // Bypass employer job posting routes to prevent redirect loops
  if (
    pathname === '/employer/job-posting' || 
    pathname.startsWith('/employer/job-posting/') ||
    pathname === '/employer/applicants' ||
    pathname.startsWith('/employer/applicants/')
  ) {
    return true;
  }
  
  // Check AUTH_ROUTES
  for (const route of AUTH_ROUTES) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return true;
    }
  }
  
  // Check bypass routes
  for (const route of BYPASS_ROUTES) {
    if (
      pathname === route || 
      pathname.startsWith(route) || 
      (route.includes('.') && pathname.endsWith(route))
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Checks if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`)
  );
}

/**
 * Get simple path redirect if applicable
 */
function getSimpleRedirectPath(pathname: string): string | null {
  for (const [oldPath, newPath] of Object.entries(SIMPLE_REDIRECTS)) {
    if (pathname === oldPath || pathname.startsWith(`${oldPath}/`)) {
      return pathname.replace(oldPath, newPath);
    }
  }
  return null;
}

// Middleware matcher configuration
export const config = {
  matcher: [
    // Basic routes
    '/',
    '/job-seeker',
    '/employer',
    '/employer/:path*',
    '/api/onboarding/:path*',
    '/onboarding/:path*',
    '/employer-onboarding/:path*',
    // Admin routes
    '/admin',
    '/admin/:path*'
  ]
};
