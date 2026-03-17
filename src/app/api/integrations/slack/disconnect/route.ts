import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function DELETE(request: NextRequest) {
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

    // Load integration to get token for revocation
    const { data: integration } = await db
      .from("workspace_integrations")
      .select("id, access_token")
      .eq("org_id", profile.org_id)
      .eq("provider", "slack")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ success: true });
    }

    // Revoke token at Slack (best effort)
    try {
      await fetch("https://slack.com/api/auth.revoke", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${integration.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch {
      // Non-fatal
    }

    // Delete integration and config
    await Promise.all([
      db.from("workspace_integrations").delete().eq("id", integration.id),
      db.from("slack_config").delete().eq("org_id", profile.org_id),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slack disconnect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
