import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
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

    // Rate limit by user ID
    const rl = await checkRateLimit(limiters.deprovision, user.id);
    if (!rl.success) return rl.response;

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (
      !profile?.org_id ||
      (profile.role !== "admin" && !profile.is_super_admin)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userIds } = await request.json();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "userIds required" },
        { status: 400 }
      );
    }

    // Only remove users who belong to this org AND were synced from directory
    const { data: targets } = await db
      .from("profiles")
      .select("id, email, name")
      .eq("org_id", profile.org_id)
      .eq("directory_sync_source", "google_workspace")
      .in("id", userIds);

    if (!targets || targets.length === 0) {
      return NextResponse.json(
        { error: "No valid users to deprovision" },
        { status: 400 }
      );
    }

    const targetIds = targets.map((t) => t.id);

    // Remove from all teams
    await db.from("team_members").delete().in("user_id", targetIds);

    // Remove from org (set org_id to null, clear sync source)
    await db
      .from("profiles")
      .update({ org_id: null, directory_sync_source: null, role: "member" })
      .in("id", targetIds);

    return NextResponse.json({
      deprovisioned: targets.map((t) => ({
        id: t.id,
        email: t.email,
        name: t.name,
      })),
      count: targets.length,
    });
  } catch (error) {
    console.error("Deprovision error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
