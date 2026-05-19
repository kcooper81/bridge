import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const DEFAULT_PREFS = {
  email: {
    violation_block: true,
    violation_warn: false,
    member_changes: true,
    billing: true,
  },
  in_app: {
    violation_block: true,
    violation_warn: true,
    member_changes: true,
    billing: true,
  },
  weekly_digest: true,
};

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;
  return { db, userId: user.id };
}

export async function GET(req: NextRequest) {
  const ctx = await getUser(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await ctx.db
    .from("profiles")
    .select("notification_preferences")
    .eq("id", ctx.userId)
    .single();
  const prefs = data?.notification_preferences || DEFAULT_PREFS;
  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(req: NextRequest) {
  const ctx = await getUser(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const incoming = body.preferences as Record<string, unknown> | undefined;
  if (!incoming || typeof incoming !== "object") {
    return NextResponse.json({ error: "preferences object required" }, { status: 400 });
  }

  // Shallow-merge with current so partial updates work.
  const { data: current } = await ctx.db
    .from("profiles")
    .select("notification_preferences")
    .eq("id", ctx.userId)
    .single();
  const merged = {
    ...(current?.notification_preferences || DEFAULT_PREFS),
    ...incoming,
  };

  const { error } = await ctx.db
    .from("profiles")
    .update({ notification_preferences: merged })
    .eq("id", ctx.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ preferences: merged });
}
