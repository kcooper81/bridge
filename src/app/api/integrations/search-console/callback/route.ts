import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(`${baseUrl}/admin/content?error=auth_failed`);
  }

  let userId: string;
  let nonce: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    userId = decoded.userId;
    nonce = decoded.nonce;
    if (!userId || !nonce) throw new Error("Missing userId or nonce in state");
  } catch {
    return NextResponse.redirect(`${baseUrl}/admin/content?error=invalid_state`);
  }

  // Validate CSRF nonce against the cookie set during the connect step
  const cookieNonce = request.cookies.get("sc_oauth_nonce")?.value;
  if (!cookieNonce || cookieNonce !== nonce) {
    return NextResponse.redirect(`${baseUrl}/admin/content?error=invalid_nonce`);
  }

  // Verify the user has super admin privileges (same check as connect route)
  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("is_super_admin, email")
    .eq("id", userId)
    .single();

  if (!profile?.is_super_admin && !SUPER_ADMIN_EMAILS.includes(profile?.email || "")) {
    return NextResponse.redirect(`${baseUrl}/admin/content?error=not_admin`);
  }

  const redirectUri = `${baseUrl}/api/integrations/search-console/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("Search Console token exchange failed:", await tokenRes.text());
    return NextResponse.redirect(`${baseUrl}/admin/content?error=token_failed`);
  }

  const tokens = await tokenRes.json();

  const { error: dbError } = await db
    .from("platform_integrations")
    .upsert(
      {
        provider: "google_search_console",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
        connected_by: userId,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "provider" }
    );

  if (dbError) {
    console.error("Failed to save Search Console tokens:", dbError);
    return NextResponse.redirect(`${baseUrl}/admin/content?error=save_failed`);
  }

  const response = NextResponse.redirect(`${baseUrl}/admin/content?connected=true`);
  // Clear the nonce cookie after successful use
  response.cookies.delete("sc_oauth_nonce");
  return response;
}
