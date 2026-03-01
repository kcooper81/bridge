import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { SuperAdminRole } from "@/lib/constants";

/** Only full super_admin role users can manage admins (not support) */
async function verifySuperAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const emailIsAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin, super_admin_role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_super_admin === true || emailIsAdmin;
  if (!isAdmin) return false;

  // Support role cannot manage admins
  if (profile?.super_admin_role === "support" && !emailIsAdmin) return false;

  return true;
}

/** GET — list all admin/support users */
export async function GET() {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();

  const { data: admins, error } = await db
    .from("profiles")
    .select("id, email, name, is_super_admin, super_admin_role, created_at")
    .or("is_super_admin.eq.true,super_admin_role.not.is.null")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 });
  }

  return NextResponse.json({ admins: admins || [] });
}

/** POST — add user as super_admin or support */
export async function POST(request: NextRequest) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role } = body as { email?: string; role?: SuperAdminRole };

  if (!email || !role) {
    return NextResponse.json(
      { error: "email and role are required" },
      { status: 400 }
    );
  }

  const validRoles: SuperAdminRole[] = ["super_admin", "support"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const db = createServiceClient();

  // Find user by email
  const { data: profile, error: findErr } = await db
    .from("profiles")
    .select("id, email, is_super_admin, super_admin_role")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (findErr) {
    console.error("Admin user lookup error:", findErr);
    return NextResponse.json({ error: "Failed to find user" }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json(
      { error: "No user found with that email. They must sign up first." },
      { status: 404 }
    );
  }

  const updates: Record<string, unknown> = {
    super_admin_role: role,
    updated_at: new Date().toISOString(),
  };

  if (role === "super_admin") {
    updates.is_super_admin = true;
  }

  const { error: updateErr } = await db
    .from("profiles")
    .update(updates)
    .eq("id", profile.id);

  if (updateErr) {
    console.error("Admin user update error:", updateErr);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DELETE — remove admin role from a user */
export async function DELETE(request: NextRequest) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const db = createServiceClient();

  // Don't allow removing yourself
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === userId) {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 }
    );
  }

  // Don't allow removing users whose email is in the hardcoded list
  const { data: targetProfile } = await db
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (targetProfile && SUPER_ADMIN_EMAILS.includes(targetProfile.email)) {
    return NextResponse.json(
      { error: "Cannot remove a hardcoded super admin" },
      { status: 400 }
    );
  }

  const { error } = await db
    .from("profiles")
    .update({
      is_super_admin: false,
      super_admin_role: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Admin user removal error:", error);
    return NextResponse.json({ error: "Failed to remove admin role" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
