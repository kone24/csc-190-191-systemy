import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

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

  // Handle redirect after login.
  const token = req.cookies.get("access_token")?.value; // cookie from Nest backend
  const isLoginPage = pathname === "/login";

  // If user is already logged in and goes to /login -> redirect to dashboard.
  if(token && isLoginPage) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // Only run guard for configured protected prefixes.
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();

  // // Simple auth check: look for a cookie named `token` (stub).
  // const token = req.cookies.get("token")?.value;
  // if (token) return NextResponse.next();

  // No cookie and route is protected -> redirect to /login and preserve original path in `from` query.
  if(!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated or unprotected -> continue.
  return NextResponse.next();
}

export const config = {
  // Apply middleware only to protected route patterns for efficiency.
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/protected/:path*",
  ],
};
