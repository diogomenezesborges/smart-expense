import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  console.log(`[MIDDLEWARE] ${request.method} ${request.url} - Start: ${new Date().toISOString()}`);
  
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  console.log(`[MIDDLEWARE] ${request.method} ${request.url} - Duration: ${duration}ms`);
  
  // Add performance headers
  response.headers.set('X-Response-Time', `${duration}ms`);
  response.headers.set('X-Debug-Timestamp', new Date().toISOString());
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}