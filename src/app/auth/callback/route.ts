import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/server";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG

function sanitizeRedirect(next: string | null): string {
  if (!next) return "/home";
  // Only allow relative paths — block protocol-relative URLs and external redirects
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/home";
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
      // Check if this is a fresh account that needs onboarding
      let finalNext = next;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const svc = createServiceClient();
          const { data: profile } = await svc
            .from("profiles")
            .select("org_id")
            .eq("id", authUser.id)
            .single();

          if (profile?.org_id) {
            const { data: org } = await svc
              .from("organizations")
              .select("name, industry")
              .eq("id", profile.org_id)
              .single();

            // Fresh account: no industry set and still has default org name
            if (org && !org.industry && org.name?.includes("'s Org")) {
              finalNext = "/home";
              authDebug.log("callback", "fresh account detected, redirecting to /home for onboarding");
            }
          }
        }
      } catch {
        // Don't block auth flow if org check fails
        authDebug.error("callback", "org check failed, using default redirect");
      }

      // Pass auth tracking params to the destination so the client can fire GA4/LinkedIn events
      const authEvent = searchParams.get("auth_event");
      const authMethod = searchParams.get("auth_method");
      if (authEvent && authMethod) {
        const redirectUrl = new URL(`${origin}${finalNext}`);
        redirectUrl.searchParams.set("auth_event", authEvent);
        redirectUrl.searchParams.set("auth_method", authMethod);
        const trackingResponse = NextResponse.redirect(redirectUrl.toString());
        // Copy cookies from the supabase response
        supabaseResponse.cookies.getAll().forEach(({ name: n, value: v }) => {
          trackingResponse.cookies.set(n, v);
        });
        authDebug.log("callback", "code exchange success with tracking, redirecting to", redirectUrl.toString());
        authDebug.attachToResponse(trackingResponse); // AUTH-DEBUG
        return trackingResponse;
      }

      if (finalNext !== next) {
        const onboardingResponse = NextResponse.redirect(`${origin}${finalNext}`);
        supabaseResponse.cookies.getAll().forEach(({ name: n, value: v }) => {
          onboardingResponse.cookies.set(n, v);
        });
        authDebug.log("callback", "redirecting fresh account to", finalNext);
        authDebug.attachToResponse(onboardingResponse);
        return onboardingResponse;
      }

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
