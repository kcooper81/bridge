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

    const rl = await checkRateLimit(limiters.accountDelete, user.id);
    if (!rl.success) return rl.response;

    // Get profile
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.org_id && profile.role === "admin") {
      // Check if last admin
      const { count: adminCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id)
        .eq("role", "admin");

      const { count: memberCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id);

      if ((adminCount || 0) <= 1 && (memberCount || 0) > 1) {
        return NextResponse.json(
          {
            error:
              "You are the last admin. Transfer ownership before deleting your account.",
          },
          { status: 400 }
        );
      }

      // Sole org member — delete the entire org (CASCADE)
      if ((memberCount || 0) <= 1) {
        await db
          .from("organizations")
          .delete()
          .eq("id", profile.org_id);
      }
    }

    // Delete profile
    await db.from("profiles").delete().eq("id", user.id);

    // Delete auth user
    await db.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
