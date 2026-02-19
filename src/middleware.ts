import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Authenticated users on auth pages → redirect to vault
  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/vault";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Unauthenticated users on protected pages → redirect to login
  if (
    !user &&
    !isPublicRoute(pathname) &&
    !isAuthRoute(pathname) &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/invite")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const fullPath = pathname + request.nextUrl.search;
    url.searchParams.set("redirect", fullPath);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
