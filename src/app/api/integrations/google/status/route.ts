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
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
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
      .select("admin_email, last_synced_at, connected_at")
      .eq("org_id", profile.org_id)
      .eq("provider", "google_workspace")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      adminEmail: integration.admin_email,
      lastSyncedAt: integration.last_synced_at,
      connectedAt: integration.connected_at,
    });
  } catch (error) {
    console.error("Google status error:", error);
    return NextResponse.json({ connected: false });
  }
}
