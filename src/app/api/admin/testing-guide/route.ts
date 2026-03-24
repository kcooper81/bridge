import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — load all shared testing guide state
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify super admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("testing_guide_state")
    .select("step_key, status, note, updated_by_email, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ steps: data || [] });
}

// PUT — upsert a single step (or batch of steps)
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  // Support batch upsert (for localStorage migration) or single step
  const steps: { step_key: string; status: string; note: string }[] =
    Array.isArray(body.steps) ? body.steps : [body];

  const rows = steps.map((s) => ({
    step_key: s.step_key,
    status: s.status || "untested",
    note: s.note || "",
    updated_by: user.id,
    updated_by_email: user.email || "",
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("testing_guide_state")
    .upsert(rows, { onConflict: "step_key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}

// DELETE — reset all (with confirmation in body)
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_super_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  if (body.confirm !== true) {
    return NextResponse.json({ error: "Must confirm reset" }, { status: 400 });
  }

  const { error } = await supabase
    .from("testing_guide_state")
    .delete()
    .neq("step_key", "__never_match__"); // delete all rows

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
