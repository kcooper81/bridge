import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return null;

  return {
    userId: user.id,
    orgId: profile.org_id,
    role: profile.is_super_admin ? "admin" : profile.role,
  };
}

// POST — submit a rule/policy suggestion (any authenticated org member)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, severity } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "name and description are required" },
        { status: 400 }
      );
    }

    if (severity && !["block", "warn"].includes(severity)) {
      return NextResponse.json(
        { error: "severity must be 'block' or 'warn'" },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    // Get the user's first team (if any) to auto-associate
    const { data: teamMembership } = await db
      .from("team_members")
      .select("team_id")
      .eq("user_id", auth.userId)
      .limit(1)
      .maybeSingle();

    const { data: suggestion, error } = await db
      .from("rule_suggestions")
      .insert({
        org_id: auth.orgId,
        team_id: teamMembership?.team_id ?? null,
        suggested_by: auth.userId,
        name,
        description,
        category: category || "custom",
        severity: severity || "warn",
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, id: suggestion.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Rule suggestion POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET — list pending rule suggestions for the org (admin/manager only)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (auth.role !== "admin" && auth.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = createServiceClient();

    const { data, error } = await db
      .from("rule_suggestions")
      .select("*")
      .eq("org_id", auth.orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with suggester names
    const userIds = Array.from(
      new Set((data || []).map((r) => r.suggested_by).filter(Boolean))
    );
    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id, name, email")
        .in("id", userIds);
      userMap = Object.fromEntries(
        (profiles || []).map((p) => [p.id, p.name || p.email || "Unknown"])
      );
    }

    const enriched = (data || []).map((r) => ({
      ...r,
      suggester_name: userMap[r.suggested_by] || "Unknown",
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Rule suggestion GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
