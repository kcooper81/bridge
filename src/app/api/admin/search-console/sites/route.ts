import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

async function getAccessToken(db: ReturnType<typeof createServiceClient>) {
  const { data } = await db
    .from("platform_integrations")
    .select("access_token, refresh_token, token_expires_at")
    .eq("provider", "google_search_console")
    .single();

  if (!data) return null;

  if (data.token_expires_at && Date.now() > data.token_expires_at - 300_000) {
    if (!data.refresh_token) return null;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: data.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;

    const tokens = await res.json();
    await db
      .from("platform_integrations")
      .update({
        access_token: tokens.access_token,
        token_expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
      })
      .eq("provider", "google_search_console");

    return tokens.access_token;
  }

  return data.access_token;
}

/** GET — list sites the connected account can access */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const token = await getAccessToken(db);

  if (!token) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 502 });
  }

  const data = await res.json();
  const sites = (data.siteEntry || []).map((s: { siteUrl: string; permissionLevel: string }) => ({
    siteUrl: s.siteUrl,
    permissionLevel: s.permissionLevel,
  }));

  return NextResponse.json({ sites });
}

/** POST — set the selected site */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { siteUrl } = await request.json();
  if (!siteUrl) {
    return NextResponse.json({ error: "siteUrl required" }, { status: 400 });
  }

  const db = createServiceClient();
  await db
    .from("platform_integrations")
    .update({ site_url: siteUrl })
    .eq("provider", "google_search_console");

  return NextResponse.json({ ok: true });
}
