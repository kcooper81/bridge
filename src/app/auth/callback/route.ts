import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG

function sanitizeRedirect(next: string | null): string {
  if (!next) return "/vault";
  // Only allow relative paths — block protocol-relative URLs and external redirects
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/vault";
}

export async function GET(request: NextRequest) {
  // AUTH-DEBUG: init server-side logging
  authDebug.initServer(request);

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirect(searchParams.get("next"));

  authDebug.log("callback", "received", { hasCode: !!code, next });

  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
            // AUTH-DEBUG: log cookies set on response
            authDebug.log("callback", "cookies set on response", cookiesToSet.map((c) => c.name));
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      authDebug.log("callback", "code exchange success, redirecting to", next);
      authDebug.attachToResponse(supabaseResponse); // AUTH-DEBUG
      return supabaseResponse;
    }

    authDebug.error("callback", "code exchange failed", { message: error.message, status: error.status });
  }

  // If something went wrong, redirect to login with error
  authDebug.error("callback", "falling through to error redirect");
  const errorResp = NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  authDebug.attachToResponse(errorResp); // AUTH-DEBUG
  return errorResp;
}
