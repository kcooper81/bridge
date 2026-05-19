import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * GET /api/audit/events
 *
 * List audit_events for the caller's org. Admin/manager only.
 *
 * Query params:
 *   - limit: max rows (default 200, hard cap 1000)
 *   - cursor: ISO timestamp; returns events with created_at < cursor
 *   - action: filter to a single action string
 *   - actor: filter to a single actor_id
 *   - q: text search across actor_email, target_label, action
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });
  if (!["admin", "manager"].includes(profile.role)) {
    return NextResponse.json({ error: "Admin or manager access required" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(sp.get("limit") || "200", 10) || 200, 1000);
  const cursor = sp.get("cursor");
  const action = sp.get("action");
  const actor = sp.get("actor");
  const q = (sp.get("q") || "").trim();

  let query = db
    .from("audit_events")
    .select("id, action, actor_id, actor_email, actor_name, target_type, target_id, target_label, before, after, metadata, ip, user_agent, created_at")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) query = query.lt("created_at", cursor);
  if (action) query = query.eq("action", action);
  if (actor) query = query.eq("actor_id", actor);
  if (q) {
    // ilike across the three text columns
    const like = `%${q}%`;
    query = query.or(`actor_email.ilike.${like},target_label.ilike.${like},action.ilike.${like}`);
  }

  const { data, error: qErr } = await query;
  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  return NextResponse.json({
    events: data || [],
    nextCursor: data && data.length === limit ? data[data.length - 1].created_at : null,
  });
}
