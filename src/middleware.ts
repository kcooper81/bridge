import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/features",
  "/security",
  "/enterprise",
  "/industries",
  "/media",
  "/blog",
  "/use-cases",
  "/comparisons",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(request: NextRequest) {
  // AUTH-DEBUG: init server-side logging
  authDebug.initServer(request);
  authDebug.log("middleware", `processing ${request.method} ${request.nextUrl.pathname}`);

  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  authDebug.log("middleware", "user resolved", user ? { id: user.id, email: user.email } : null);

  // Authenticated users on auth pages → redirect to vault
  if (user && isAuthRoute(pathname)) {
    authDebug.log("middleware", "redirect: auth page → /vault (user is authenticated)");
    const url = request.nextUrl.clone();
    url.pathname = "/vault";
    url.search = "";
    const resp = NextResponse.redirect(url);
    authDebug.attachToResponse(resp); // AUTH-DEBUG
    return resp;
  }

  // Unauthenticated users on protected pages → redirect to login
  if (
    !user &&
    !isPublicRoute(pathname) &&
    !isAuthRoute(pathname) &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/invite") &&
    !pathname.startsWith("/extension/")
  ) {
    const fullPath = pathname + request.nextUrl.search;
    authDebug.log("middleware", `redirect: protected → /login (no user)`, { redirect: fullPath });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", fullPath);
    const resp = NextResponse.redirect(url);
    authDebug.attachToResponse(resp); // AUTH-DEBUG
    return resp;
  }

  authDebug.log("middleware", "passthrough", { pathname });
  authDebug.attachToResponse(supabaseResponse); // AUTH-DEBUG

  // ─── Security Headers ───
  setSecurityHeaders(supabaseResponse);

  return supabaseResponse;
}

function setSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Enable XSS filter (legacy browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Enforce HTTPS
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  // Permissions Policy — disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co",
      "frame-src https://js.stripe.com https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
