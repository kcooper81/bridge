import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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

    // Decode user ID from state
    let userId: string;
    try {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8")
      );
      userId = decoded.userId;
      if (!userId) throw new Error("No userId in state");
    } catch {
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

    // Look up the user's profile using the ID from state
    const db = createServiceClient();
    const { data: profile } = await db
      .from("profiles")
      .select("id, org_id, role, is_super_admin")
      .eq("id", userId)
      .single();

    if (!profile?.org_id) {
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
    const { error: upsertError } = await db.from("workspace_integrations").upsert(
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

    if (upsertError) {
      console.error("Upsert workspace integration failed:", upsertError);
      return NextResponse.redirect(
        `${siteUrl}/settings/integrations?error=save_failed`
      );
    }

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
