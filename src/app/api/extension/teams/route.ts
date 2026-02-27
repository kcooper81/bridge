import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// GET /api/extension/teams — Fetch user's teams with their role in each
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const rl = await checkRateLimit(limiters.prompts, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    // Fetch teams for the org
    const { data: teams, error: teamsError } = await db
      .from("teams")
      .select("id, name, icon, color")
      .eq("org_id", profile.org_id)
      .order("name", { ascending: true });

    if (teamsError) {
      return withCors(NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 }), request);
    }

    // Fetch user's team memberships with roles
    const { data: memberships } = await db
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id);

    const membershipMap: Record<string, string> = {};
    for (const m of memberships || []) {
      membershipMap[m.team_id] = m.role;
    }

    const orgRole = profile.is_super_admin ? "admin" : profile.role;

    const result = (teams || []).map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      team_role: membershipMap[t.id] || null,
      is_member: !!membershipMap[t.id],
    }));

    return withCors(NextResponse.json({
      teams: result,
      org_role: orgRole,
    }), request);
  } catch (error) {
    console.error("Extension teams error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
