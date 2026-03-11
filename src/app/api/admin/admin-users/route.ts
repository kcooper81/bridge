import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { SuperAdminRole } from "@/lib/constants";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — list all admin/support users */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = createServiceClient();

  const { data: admins, error } = await db
    .from("profiles")
    .select("id, email, name, is_super_admin, super_admin_role, support_allowed_pages, created_at")
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
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) {
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

/** PATCH — update support staff allowed pages */
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, allowedPages } = body as { userId?: string; allowedPages?: string[] };

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!Array.isArray(allowedPages)) {
    return NextResponse.json({ error: "allowedPages must be an array" }, { status: 400 });
  }

  const db = createServiceClient();

  // Verify the target user is a support user
  const { data: target } = await db
    .from("profiles")
    .select("super_admin_role")
    .eq("id", userId)
    .single();

  if (!target || target.super_admin_role !== "support") {
    return NextResponse.json({ error: "User is not a support staff member" }, { status: 400 });
  }

  const { error } = await db
    .from("profiles")
    .update({
      support_allowed_pages: allowedPages.length > 0 ? allowedPages : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Update allowed pages error:", error);
    return NextResponse.json({ error: "Failed to update allowed pages" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/** DELETE — remove admin role from a user */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const db = createServiceClient();

  // Don't allow removing yourself
  if (auth.userId === userId) {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 }
    );
  }

  // Don't allow removing users whose email is in the hardcoded list
  const { data: targetProfile } = await db
    .from("profiles")
    .select("email, is_super_admin")
    .eq("id", userId)
    .single();

  if (targetProfile && SUPER_ADMIN_EMAILS.includes(targetProfile.email)) {
    return NextResponse.json(
      { error: "Cannot remove a hardcoded super admin" },
      { status: 400 }
    );
  }

  // Don't allow removing the last super admin
  if (targetProfile?.is_super_admin) {
    const { count } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_super_admin", true);

    if ((count || 0) <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last super admin. Promote another user first." },
        { status: 400 }
      );
    }
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
