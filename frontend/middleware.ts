import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which top-level routes should be considered protected.
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/settings", "/protected"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals, static files, and API routes to pass through.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Only run guard for configured protected prefixes.
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();

  // Simple auth check: look for a cookie named `token` (stub).
  const token = req.cookies.get("token")?.value;
  if (token) return NextResponse.next();

  // Not authenticated -> redirect to /login and preserve original path in `from` query.
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Apply middleware only to protected route patterns for efficiency.
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/protected/:path*",
  ],
};
