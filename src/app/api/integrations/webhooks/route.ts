import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { emitAuditEvent } from "@/lib/audit-events";

const ALLOWED_EVENTS = new Set(["violation", "audit"]);

async function getAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role, email")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return { error: NextResponse.json({ error: "No organization" }, { status: 400 }) };
  if (profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }
  return { db, user, orgId: profile.org_id, email: profile.email };
}

export async function GET(req: NextRequest) {
  const ctx = await getAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { db, orgId } = ctx;
  const { data } = await db
    .from("webhook_destinations")
    .select("id, name, url, events, enabled, created_at, last_delivery_at, last_delivery_status, last_delivery_error")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  return NextResponse.json({ destinations: data || [] });
}

export async function POST(req: NextRequest) {
  const ctx = await getAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { db, user, orgId, email } = ctx;

  const body = await req.json();
  const { name, url, events } = body as { name?: string; url?: string; events?: string[] };

  if (!name || !url) return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Webhook URL must use HTTPS" }, { status: 400 });
  }
  const eventsClean = Array.isArray(events) && events.length > 0
    ? events.filter((e) => ALLOWED_EVENTS.has(e))
    : ["violation", "audit"];

  const secret = randomBytes(24).toString("base64url");

  const { data, error } = await db
    .from("webhook_destinations")
    .insert({
      org_id: orgId,
      name: name.slice(0, 80),
      url,
      events: eventsClean,
      secret,
      created_by: user.id,
    })
    .select("id, name, url, events, enabled, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await emitAuditEvent({
    orgId,
    actorId: user.id,
    actorEmail: email ?? null,
    action: "integration.connect",
    targetType: "webhook",
    targetId: data.id,
    targetLabel: name,
    metadata: { url, events: eventsClean },
    request: req,
  });

  // Return the secret ONCE on creation — store it client-side; we never
  // return it again on subsequent GETs.
  return NextResponse.json({ destination: data, secret });
}

export async function DELETE(req: NextRequest) {
  const ctx = await getAdmin(req);
  if ("error" in ctx) return ctx.error;
  const { db, user, orgId, email } = ctx;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data: dest } = await db
    .from("webhook_destinations")
    .select("name")
    .eq("id", id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!dest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.from("webhook_destinations").delete().eq("id", id).eq("org_id", orgId);

  await emitAuditEvent({
    orgId,
    actorId: user.id,
    actorEmail: email ?? null,
    action: "integration.disconnect",
    targetType: "webhook",
    targetId: id,
    targetLabel: dest.name,
    request: req,
  });

  return NextResponse.json({ success: true });
}
