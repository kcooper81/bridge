import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** GET — load the current user's custom instructions */
export async function GET() {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ instructions: null });

  const { data } = await db
    .from("chat_user_instructions")
    .select("role_description, tone, expertise_level, custom_context, is_active")
    .eq("user_id", user.id)
    .eq("org_id", profile.org_id)
    .single();

  return NextResponse.json({ instructions: data || null });
}

/** PUT — upsert the current user's custom instructions */
export async function PUT(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const role_description = (body.role_description || "").slice(0, 500);
  const tone = (body.tone || "").slice(0, 50);
  const expertise_level = (body.expertise_level || "").slice(0, 50);
  const custom_context = (body.custom_context || "").slice(0, 2000);
  const is_active = body.is_active !== false;

  const { data, error } = await db
    .from("chat_user_instructions")
    .upsert(
      {
        user_id: user.id,
        org_id: profile.org_id,
        role_description,
        tone,
        expertise_level,
        custom_context,
        is_active,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,org_id" }
    )
    .select("role_description, tone, expertise_level, custom_context, is_active")
    .single();

  if (error) {
    console.error("Failed to upsert instructions:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ instructions: data });
}
