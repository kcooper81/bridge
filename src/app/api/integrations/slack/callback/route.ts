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
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=missing_params`);
    }

    // Decode and validate state
    let userId: string;
    let nonce: string;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
      userId = decoded.userId;
      nonce = decoded.nonce;
      if (!userId || !nonce) throw new Error("Invalid state");
    } catch {
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=invalid_state`);
    }

    // Validate CSRF nonce
    const cookieNonce = request.cookies.get("slack_oauth_nonce")?.value;
    if (!cookieNonce || cookieNonce !== nonce) {
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=invalid_nonce`);
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const redirectUri = `${siteUrl}/api/integrations/slack/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=not_configured`);
    }

    // Exchange code for bot token
    const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.ok) {
      console.error("Slack token exchange failed:", tokenData.error);
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=token_exchange_failed`);
    }

    const botToken = tokenData.access_token;
    const teamId = tokenData.team?.id;
    const teamName = tokenData.team?.name;

    // Look up the user's profile
    const db = createServiceClient();
    const { data: profile } = await db
      .from("profiles")
      .select("id, org_id, role, is_super_admin")
      .eq("id", userId)
      .single();

    if (!profile?.org_id) {
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=no_org`);
    }

    const isAdmin = profile.is_super_admin || profile.role === "admin";
    if (!isAdmin) {
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=not_admin`);
    }

    // Upsert workspace integration (bot tokens don't expire)
    const { error: upsertError } = await db.from("workspace_integrations").upsert(
      {
        org_id: profile.org_id,
        provider: "slack",
        access_token: botToken,
        refresh_token: null,
        token_expires_at: null,
        admin_email: teamName || teamId,
        connected_by: profile.id,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "org_id,provider" }
    );

    if (upsertError) {
      console.error("Upsert Slack integration failed:", upsertError);
      return NextResponse.redirect(`${siteUrl}/settings/integrations?error=save_failed`);
    }

    // Create default slack_config
    await db.from("slack_config").upsert(
      {
        org_id: profile.org_id,
        slack_team_id: teamId,
        slack_team_name: teamName,
        notify_dlp_violations: true,
        notify_prompt_submissions: true,
        notify_weekly_digest: true,
      },
      { onConflict: "org_id" }
    );

    const response = NextResponse.redirect(`${siteUrl}/settings/integrations?connected=slack`);
    response.cookies.delete("slack_oauth_nonce");
    return response;
  } catch (error) {
    console.error("Slack callback error:", error);
    return NextResponse.redirect(`${siteUrl}/settings/integrations?error=callback_failed`);
  }
}
