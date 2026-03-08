import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

async function verifySuperAdmin() {
  const db = createServiceClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_super_admin || SUPER_ADMIN_EMAILS.includes(user.email || "")
    ? user
    : null;
}

async function getValidToken(db: ReturnType<typeof createServiceClient>) {
  const { data } = await db
    .from("platform_integrations")
    .select("*")
    .eq("provider", "google_search_console")
    .single();

  if (!data) return null;

  // Refresh if expired (5 min buffer)
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

    if (!res.ok) {
      console.error("Token refresh failed:", await res.text());
      return null;
    }

    const tokens = await res.json();
    await db
      .from("platform_integrations")
      .update({
        access_token: tokens.access_token,
        token_expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
      })
      .eq("provider", "google_search_console");

    return { token: tokens.access_token, siteUrl: data.site_url };
  }

  return { token: data.access_token, siteUrl: data.site_url };
}

/**
 * GET /api/admin/search-console?dimension=query|page&days=28
 */
export async function GET(request: NextRequest) {
  const user = await verifySuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const dimension = searchParams.get("dimension") || "query";
  const days = parseInt(searchParams.get("days") || "28");

  const db = createServiceClient();
  const auth = await getValidToken(db);

  if (!auth || !auth.siteUrl) {
    return NextResponse.json(
      { error: "Search Console not connected or no site selected" },
      { status: 400 }
    );
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const body = {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    dimensions: [dimension],
    type: "web",
    rowLimit: 200,
    dataState: "all",
  };

  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(auth.siteUrl)}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Search Console API error:", res.status, errText);
    return NextResponse.json({ error: "API request failed" }, { status: 502 });
  }

  const data = await res.json();

  const rows = (data.rows || []).map((row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
    key: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));

  return NextResponse.json({ rows });
}
