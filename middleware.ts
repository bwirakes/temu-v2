import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Extend the session type to include userType
interface CustomUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userType?: 'job_seeker' | 'employer';
}

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const { pathname } = request.nextUrl;

    console.log(`Middleware: Processing ${pathname}`);
    
    // Public routes - accessible to everyone
    const publicRoutes = ['/auth/signin', '/auth/signup', '/', '/api/test/users'];
    if (publicRoutes.includes(pathname)) {
      console.log(`Middleware: Public route ${pathname}, allowing access`);
      return NextResponse.next();
    }

    // Check if user is authenticated
    if (!session?.user) {
      console.log(`Middleware: No authenticated user, redirecting to signin`);
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const user = session.user as CustomUser;
    const userType = user.userType;
    
    console.log(`Middleware: User authenticated, type: ${userType}, email: ${user.email}`);

    // Special handling for the root route when user is already logged in
    if (pathname === '/' && userType) {
      if (userType === 'employer') {
        // For employers, redirect to employer page which will check onboarding status
        return NextResponse.redirect(new URL('/employer', request.url));
      } else if (userType === 'job_seeker') {
        // Job seekers go to their dashboard
        return NextResponse.redirect(new URL('/job-seeker', request.url));
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
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
};
