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

    // Fetch channels from Slack
    const res = await fetch(
      "https://slack.com/api/conversations.list?types=public_channel,private_channel&exclude_archived=true&limit=200",
      { headers: { Authorization: `Bearer ${integration.access_token}` } }
    );

    const data = await res.json();
    if (!data.ok) {
      console.error("Slack channels.list error:", data.error);
      return NextResponse.json({ error: data.error || "Failed to list channels" }, { status: 500 });
    }

    const channels = (data.channels || []).map((ch: { id: string; name: string; is_private: boolean }) => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
    }));

    return NextResponse.json({ channels });
  } catch (error) {
    console.error("Slack channels error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
