import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint is deprecated and has been replaced by the standard NextAuth.js
 * /api/auth/session endpoint. We're keeping this route to avoid breaking existing
 * client code, but internally it now redirects to the standard endpoint.
 */
export async function GET(req: NextRequest) {
  console.log('Deprecated refresh-session endpoint called, redirecting to standard NextAuth session endpoint');
  
  // Extract any query parameters
  const url = new URL('/api/auth/session', req.url);
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  
  // Set cache control headers to ensure a fresh token
  const headers = new Headers({
    'Cache-Control': 'no-store, must-revalidate, max-age=0',
  });
  
  return NextResponse.redirect(url, { headers });
}

/**
 * POST method is kept for backwards compatibility, but now redirects to GET
 * which in turn redirects to the standard NextAuth.js session endpoint
 */
export async function POST(req: NextRequest) {
  console.log('Deprecated refresh-session POST endpoint called, redirecting to GET handler');
  
  // Extract the timestamp or add one if not present
  const url = new URL('/api/auth/refresh-session', req.url);
  if (!url.searchParams.has('t')) {
    url.searchParams.append('t', Date.now().toString());
  }
  
  // Set cache control headers to ensure a fresh token
  const headers = new Headers({
    'Cache-Control': 'no-store, must-revalidate, max-age=0',
  });
  
  return NextResponse.redirect(url, { headers });
} 