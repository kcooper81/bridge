import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/** PATCH — update Slack notification config */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body.channelId !== undefined) {
      updates.notification_channel_id = body.channelId;
      updates.notification_channel_name = body.channelName || null;
    }
    if (body.notifyDlp !== undefined) updates.notify_dlp_violations = body.notifyDlp;
    if (body.notifyPromptSubmissions !== undefined) updates.notify_prompt_submissions = body.notifyPromptSubmissions;
    if (body.notifyWeeklyDigest !== undefined) updates.notify_weekly_digest = body.notifyWeeklyDigest;

    const { error } = await db
      .from("slack_config")
      .update(updates)
      .eq("org_id", profile.org_id);

    if (error) {
      console.error("Slack config update error:", error);
      return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack config error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
