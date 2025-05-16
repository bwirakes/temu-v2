import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define path mappings for redirects
const API_REDIRECTS = {
  '/api/onboarding': '/api/job-seeker/onboarding',
  '/api/cv': '/api/job-seeker/cv',
  '/api/employer/onboard': '/api/employer/onboarding',
};

// Define path mappings for page redirects
const PAGE_REDIRECTS = {
  '/onboarding': '/job-seeker/onboarding',
  '/cv-builder': '/job-seeker/cv-builder',
  '/employer-onboarding': '/employer/onboarding',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Check for API redirects
  for (const [oldPath, newPath] of Object.entries(API_REDIRECTS)) {
    if (pathname.startsWith(oldPath)) {
      const newUrl = pathname.replace(oldPath, newPath);
      url.pathname = newUrl;
      return NextResponse.redirect(url);
    }
  }

  // Check for page redirects
  for (const [oldPath, newPath] of Object.entries(PAGE_REDIRECTS)) {
    if (pathname === oldPath || pathname.startsWith(`${oldPath}/`)) {
      const newUrl = pathname.replace(oldPath, newPath);
      url.pathname = newUrl;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match API paths
    '/api/onboarding/:path*',
    '/api/cv/:path*',
    '/api/employer/onboard/:path*',
    // Match page paths
    '/onboarding/:path*',
    '/cv-builder/:path*',
    '/employer-onboarding/:path*',
  ],
}; 