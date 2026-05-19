import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** GET — list Slack channels for the channel picker */
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
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }

    const isAdmin = profile.is_super_admin || profile.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // Load bot token
    const { data: integration } = await db
      .from("workspace_integrations")
      .select("access_token")
      .eq("org_id", profile.org_id)
      .eq("provider", "slack")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: "Slack not connected" }, { status: 400 });
    }

    // Fetch all channels from Slack, paginating until cursor empties or we
    // hit a safety cap. The previous single page of 200 silently lost the
    // long tail in workspaces with >200 channels (common at 100+ companies).
    const HARD_CAP = 2000;
    const PER_PAGE = 200;
    type SlackChannel = { id: string; name: string; is_private: boolean };
    const channels: SlackChannel[] = [];
    let cursor: string | undefined;
    let pages = 0;
    do {
      const url = new URL("https://slack.com/api/conversations.list");
      url.searchParams.set("types", "public_channel,private_channel");
      url.searchParams.set("exclude_archived", "true");
      url.searchParams.set("limit", String(PER_PAGE));
      if (cursor) url.searchParams.set("cursor", cursor);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${integration.access_token}` },
      });
      const data = await res.json();
      if (!data.ok) {
        console.error("Slack channels.list error:", data.error);
        return NextResponse.json({ error: data.error || "Failed to list channels" }, { status: 500 });
      }
      channels.push(...((data.channels || []) as SlackChannel[]));
      cursor = data.response_metadata?.next_cursor;
      pages++;
      if (channels.length >= HARD_CAP) break;
    } while (cursor && cursor.length > 0 && pages < 20);

    const out = channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
    }));

    return NextResponse.json({ channels: out, truncated: channels.length >= HARD_CAP });
  } catch (error) {
    console.error("Slack channels error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
