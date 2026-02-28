import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=missing_params`
      );
    }

    // Validate CSRF state
    const cookieStore = await cookies();
    const savedState = cookieStore.get("google_oauth_state")?.value;
    cookieStore.delete("google_oauth_state");

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=invalid_state`
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${siteUrl}/api/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=not_configured`
      );
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token exchange failed:", err);
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get admin email from userinfo
    const userinfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const userinfo = await userinfoRes.json();
    const adminEmail = userinfo.email;

    // Identify the user — we need their org_id
    // The user must be logged in and have a Supabase session cookie
    const db = createServiceClient();

    // Try to get the user from the session cookie
    const supabaseCookie = request.cookies.getAll().find((c) =>
      c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    // Fallback: try to find the profile by Google admin email
    const { data: matchingProfiles } = await db
      .from("profiles")
      .select("id, org_id, role, is_super_admin")
      .eq("email", adminEmail)
      .limit(1);

    const profile = matchingProfiles?.[0];
    if (!profile?.org_id) {
      // If we can't identify the org via email match, redirect with error
      if (!supabaseCookie) {
        return NextResponse.redirect(
          `${siteUrl}/settings/integrations?error=no_session`
        );
      }
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=no_org`
      );
    }

    const isAdmin = profile.is_super_admin || profile.role === "admin";
    if (!isAdmin) {
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=not_admin`
      );
    }

    // Calculate token expiry
    const tokenExpiresAt = new Date(
      Date.now() + (expires_in || 3600) * 1000
    ).toISOString();

    // Upsert workspace integration
    await db.from("workspace_integrations").upsert(
      {
        org_id: profile.org_id,
        provider: "google_workspace",
        access_token,
        refresh_token: refresh_token || null,
        token_expires_at: tokenExpiresAt,
        admin_email: adminEmail,
        connected_by: profile.id,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "org_id,provider" }
    );

    return NextResponse.redirect(
      `${siteUrl}/settings/integrations?connected=google`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      `${siteUrl}/settings/integrations?error=callback_failed`
    );
  }
}
