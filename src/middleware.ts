import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-mfa"];

// Pages that REQUIRE auth. Everything not in this list (and not in
// AUTH_ROUTES / PUBLIC_ROUTES) falls through to Next.js, which will render
// the not-found page. The previous "deny everything not public" behavior
// turned a /typo into a /login redirect, hiding the 404 page entirely.
const PROTECTED_PREFIXES = [
  "/home",
  "/vault",
  "/chat",
  "/templates",
  "/approvals",
  "/guidelines",
  "/team",
  "/guardrails",
  "/activity",
  "/audit",
  "/analytics",
  "/settings",
  "/import-export",
  "/testing-guide",
  "/notifications",
  "/admin",
];
function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/features",
  "/security",
  "/enterprise",
  "/industries",
  "/media",
  "/privacy",
  "/terms",
  "/solutions",
  "/integrations",
  "/help",
  "/contact",
  "/changelog",
  "/extensions",
  "/blog",
  "/pitch",
  "/lp",
  "/compare",
  "/compliance",
  "/glossary",
  "/case-studies",
  "/about",
  "/tools",
  "/research",
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
  // IndexNow key verification file — serve at runtime so env var doesn't need build-time access
  const indexNowKey = process.env.INDEXNOW_API_KEY;
  if (indexNowKey && request.nextUrl.pathname === `/${indexNowKey}.txt`) {
    return new NextResponse(indexNowKey, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
    });
  }

  // www → non-www 301 redirect (SEO canonical)
  const host = request.headers.get("host") || "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace("www.", "");
    return NextResponse.redirect(url, 301);
  }

  // AUTH-DEBUG: init server-side logging
  authDebug.initServer(request);
  authDebug.log("middleware", `processing ${request.method} ${request.nextUrl.pathname}`);

  const { pathname } = request.nextUrl;

  // Public embed routes — allow cross-origin iframing so external sites can
  // embed the free tools. No auth check, relaxed frame-ancestors, no caching
  // of HTTPS headers beyond the standard set.
  if (pathname.startsWith("/embed/")) {
    const response = NextResponse.next({ request: { headers: request.headers } });
    setSecurityHeaders(response, { embeddable: true });
    return response;
  }

  // Skip expensive Supabase auth call for public marketing pages (faster landing page loads)
  if (isPublicRoute(pathname) && pathname !== "/") {
    authDebug.log("middleware", "fast-path: public route, skipping auth", { pathname });
    const response = NextResponse.next({ request: { headers: request.headers } });
    setSecurityHeaders(response);
    return response;
  }

  const { supabaseResponse, user, aal } = await updateSession(request);

  authDebug.log("middleware", "user resolved", user ? { id: user.id, email: user.email } : null);

  // Authenticated users on auth pages → redirect to home
  // Exception: allow /reset-password so recovery token exchange can complete
  if (user && isAuthRoute(pathname) && pathname !== "/reset-password") {
    authDebug.log("middleware", "redirect: auth page → /home (user is authenticated)");
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    const resp = NextResponse.redirect(url);
    authDebug.attachToResponse(resp); // AUTH-DEBUG
    return resp;
  }

  // Authenticated users on marketing landing page → redirect to home
  if (user && pathname === "/") {
    authDebug.log("middleware", "redirect: / → /home (user is authenticated)");
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    url.search = "";
    const resp = NextResponse.redirect(url);
    authDebug.attachToResponse(resp); // AUTH-DEBUG
    return resp;
  }

  // Pitch share token: allow investors to view /pitch pages with a valid token
  const isPitchShareValid =
    pathname.startsWith("/pitch") &&
    (() => {
      const shareToken = request.nextUrl.searchParams.get("share");
      const validToken = process.env.PITCH_SHARE_TOKEN;
      return !!(shareToken && validToken && shareToken === validToken);
    })();

  // Unauthenticated users on protected pages → redirect to login.
  // Note: we redirect only when the pathname matches a known protected
  // prefix. Unknown paths fall through to Next.js, which renders the
  // not-found page (otherwise typos turn into a confusing /login redirect).
  if (
    !user &&
    isProtectedRoute(pathname) &&
    !isPitchShareValid
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

  // Email verification: block unverified users from protected routes
  if (
    user &&
    !user.email_confirmed_at &&
    isProtectedRoute(pathname)
  ) {
    authDebug.log("middleware", "redirect: unverified email → /login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "email_not_verified");
    const resp = NextResponse.redirect(url);
    authDebug.attachToResponse(resp);
    return resp;
  }

  // MFA step-up: user has MFA enrolled but hasn't verified yet this session.
  //
  // Page routes redirect to /verify-mfa. API routes (which the previous
  // implementation exempted entirely — letting an enrolled-but-unverified
  // user call /api/* directly with their AAL1 token) now get a 403
  // forbidden response. The MFA-bypass-on-API-routes path was the largest
  // single auth issue from the review. /api/auth/* is exempted because
  // those are the endpoints that complete the AAL1→AAL2 step-up itself
  // (and signout). /api/extension/* is exempted because the extension
  // session lifecycle is handled separately.
  const needsMfaStepUp =
    user &&
    aal?.nextLevel === "aal2" &&
    aal?.currentLevel === "aal1" &&
    !isAuthRoute(pathname) &&
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/api/auth/") &&
    !pathname.startsWith("/api/extension/") &&
    !pathname.startsWith("/extension/");

  if (needsMfaStepUp) {
    if (pathname.startsWith("/api/")) {
      authDebug.log("middleware", "block: AAL1 → /api/* requires AAL2");
      const resp = NextResponse.json(
        { error: "MFA verification required", code: "mfa_required" },
        { status: 403 },
      );
      authDebug.attachToResponse(resp);
      return resp;
    }
    authDebug.log("middleware", "redirect: AAL1 → /verify-mfa (MFA required)");
    const url = request.nextUrl.clone();
    url.pathname = "/verify-mfa";
    url.searchParams.set("redirect", pathname + request.nextUrl.search);
    const resp = NextResponse.redirect(url);
    authDebug.attachToResponse(resp);
    return resp;
  }

  authDebug.log("middleware", "passthrough", { pathname });
  authDebug.attachToResponse(supabaseResponse); // AUTH-DEBUG

  // ─── Security Headers ───
  setSecurityHeaders(supabaseResponse);

  return supabaseResponse;
}

function setSecurityHeaders(
  response: NextResponse,
  options: { embeddable?: boolean } = {},
) {
  // Prevent clickjacking — unless the route is an explicit public embed.
  // For embed routes we drop X-Frame-Options entirely and use CSP
  // frame-ancestors instead (modern browsers honour CSP; X-Frame-Options
  // would override it with DENY).
  if (!options.embeddable) {
    response.headers.set("X-Frame-Options", "DENY");
  }
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
  const frameAncestors = options.embeddable ? "frame-ancestors *" : "frame-ancestors 'self'";
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.google.com https://*.googletagmanager.com https://*.doubleclick.net https://*.googleadservices.com https://snap.licdn.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://*.google.com https://*.google-analytics.com https://*.analytics.google.com https://*.doubleclick.net https://*.googleadservices.com https://images.unsplash.com https://px.ads.linkedin.com https://snap.licdn.com",
      "frame-src 'self' blob: https://js.stripe.com https://*.google.com https://*.doubleclick.net https://*.googleadservices.com",
      frameAncestors,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|llms(?:-full)?\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
