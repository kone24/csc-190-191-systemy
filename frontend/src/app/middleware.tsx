import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add protected routes here
export const config = {
  matcher: ['/settings/:path*'],
};

// Redirect to login if no session cookie is present
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (request.cookies.has('session')) {
    return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.SearchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
}