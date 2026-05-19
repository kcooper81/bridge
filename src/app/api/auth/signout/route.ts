import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

function siteHost(): string {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "";
  }
}

/**
 * Sign out endpoint — POST only with same-origin enforcement so a remote
 * page can't log the user out via a drive-by `<img src>` request. The
 * previous GET handler had no CSRF protection at all, making forced
 * sign-out trivial. Same-site cookies help but don't make this safe on
 * their own.
 *
 * GET is kept as a thin no-op that redirects to /login WITHOUT terminating
 * the session, so any existing bookmark/link that points to GET /api/auth/signout
 * doesn't 405. Callers that actually want to sign out must POST.
 */
async function performSignOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

function isSameOrigin(req: NextRequest): boolean {
  const expected = siteHost();
  if (!expected) return false;
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (origin) {
    try {
      return new URL(origin).host === expected;
    } catch {
      return false;
    }
  }
  if (referer) {
    try {
      return new URL(referer).host === expected;
    } catch {
      return false;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await performSignOut();
  return NextResponse.json({ success: true });
}

export async function GET() {
  // Legacy GET — does NOT sign out; just bounces to /login. Sign-out
  // requires a POST from the same origin.
  return NextResponse.redirect(`${SITE_URL}/login`);
}
