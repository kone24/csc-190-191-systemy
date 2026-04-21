import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Routes that require a valid session cookie to access.
// Note: middleware only checks cookie *presence* — JWT signature and expiry
// validation happens on the backend (NestJS JwtAuthGuard) which issues a
// fresh 20-min sliding token on every authenticated request.
const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect root "/" to "/login"
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allow Next.js internals, static files, and public assets to pass through.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;
  const isLoginPage = pathname === "/login";

  // Already logged in and going to /login → send to dashboard.
  if (token && isLoginPage) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // Check if the route is protected.
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();

  // No token on a protected route → redirect to /login, preserve destination.
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → continue.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
  ],
};
