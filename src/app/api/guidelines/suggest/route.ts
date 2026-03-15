import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { logServiceError } from "@/lib/log-error";

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, is_super_admin, name, email")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return null;

  return {
    userId: user.id,
    orgId: profile.org_id,
    role: profile.is_super_admin ? "admin" : profile.role,
    name: profile.name || profile.email || "A team member",
  };
}

// POST — submit a guideline suggestion (any authenticated org member)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit by user ID
    const rl = await checkRateLimit(limiters.guidelineSuggest, auth.userId);
    if (!rl.success) return rl.response;

    const body = await request.json();
    const { name, category, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "name and description are required" },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    // Get admins/managers for this org to notify them
    const { data: admins } = await db
      .from("profiles")
      .select("id")
      .eq("org_id", auth.orgId)
      .in("role", ["admin", "manager"]);

    if (admins && admins.length > 0) {
      const notificationRows = admins.map((admin) => ({
        user_id: admin.id,
        org_id: auth.orgId,
        type: "system" as const,
        title: "Guideline Suggestion",
        message: `${auth.name} suggested a new guideline: "${name.trim()}"${category ? ` (${category.trim()})` : ""} — ${description.trim()}`,
        metadata: {
          suggestion_type: "guideline",
          suggested_by: auth.userId,
          suggested_by_name: auth.name,
          guideline_name: name.trim(),
          guideline_category: category?.trim() || "general",
          guideline_description: description.trim(),
        },
      }));

      const { error: insertError } = await db
        .from("notifications")
        .insert(notificationRows);

      if (insertError) {
        console.error("Guideline suggestion notification insert error:", insertError);
        logServiceError("supabase", insertError, {
          url: "guidelines/suggest",
          metadata: { action: "insert-notification" },
        });
        return NextResponse.json(
          { error: "Failed to submit suggestion" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Guideline suggestion POST error:", error);
    logServiceError("app", error, { url: "guidelines/suggest" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
