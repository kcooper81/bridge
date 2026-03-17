import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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
      return NextResponse.json({ connected: false });
    }

    const isAdmin = profile.is_super_admin || profile.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ connected: false });
    }

    const { data: integration } = await db
      .from("workspace_integrations")
      .select("connected_at")
      .eq("org_id", profile.org_id)
      .eq("provider", "slack")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    const { data: config } = await db
      .from("slack_config")
      .select("*")
      .eq("org_id", profile.org_id)
      .maybeSingle();

    return NextResponse.json({
      connected: true,
      teamName: config?.slack_team_name || null,
      channelId: config?.notification_channel_id || null,
      channelName: config?.notification_channel_name || null,
      notifyDlp: config?.notify_dlp_violations ?? true,
      notifyPromptSubmissions: config?.notify_prompt_submissions ?? true,
      notifyWeeklyDigest: config?.notify_weekly_digest ?? true,
      connectedAt: integration.connected_at,
    });
  } catch (error) {
    console.error("Slack status error:", error);
    return NextResponse.json({ connected: false });
  }
}
