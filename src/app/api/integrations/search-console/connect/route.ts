import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await db
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin && !SUPER_ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Super admin only" }, { status: 403 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

    if (!clientId) {
      return NextResponse.json({ error: "Google OAuth not configured" }, { status: 503 });
    }

    const nonce = randomBytes(16).toString("hex");
    const state = Buffer.from(
      JSON.stringify({ userId: user.id, nonce })
    ).toString("base64url");

    const redirectUri = `${siteUrl}/api/integrations/search-console/callback`;
    const scopes = [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state,
    });

    const response = NextResponse.json({
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });

    // Set nonce in httpOnly cookie so the callback can validate it (CSRF protection)
    response.cookies.set("sc_oauth_nonce", nonce, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/integrations/search-console/callback",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Search Console connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
