import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

async function verifySuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  return (
    profile?.is_super_admin === true ||
    SUPER_ADMIN_EMAILS.includes(user.email || "")
  );
}

export async function GET() {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();

  const { data: tickets, error } = await db
    .from("feedback")
    .select("id, type, subject, message, status, priority, user_id, org_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin tickets fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }

  // Resolve user emails and org names
  const userIds = Array.from(
    new Set((tickets || []).map((t) => t.user_id).filter(Boolean) as string[])
  );
  const orgIds = Array.from(
    new Set((tickets || []).map((t) => t.org_id).filter(Boolean) as string[])
  );

  const [usersRes, orgsRes] = await Promise.all([
    userIds.length > 0
      ? db.from("profiles").select("id, email").in("id", userIds)
      : { data: [] },
    orgIds.length > 0
      ? db.from("organizations").select("id, name").in("id", orgIds)
      : { data: [] },
  ]);

  const userMap = new Map(
    (usersRes.data || []).map((u: { id: string; email: string }) => [u.id, u.email])
  );
  const orgMap = new Map(
    (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
  );

  const enriched = (tickets || []).map((t) => ({
    id: t.id,
    type: t.type,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority || "normal",
    user_email: t.user_id ? userMap.get(t.user_id) || null : null,
    org_name: t.org_id ? orgMap.get(t.org_id) || null : null,
    created_at: t.created_at,
  }));

  return NextResponse.json({ tickets: enriched });
}

export async function PATCH(request: NextRequest) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const validStatuses = ["new", "in_progress", "resolved", "closed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = createServiceClient();
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();

  const { error } = await db.from("feedback").update(updates).eq("id", id);

  if (error) {
    console.error("Admin ticket update error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
