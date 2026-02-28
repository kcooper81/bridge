import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, targetUserId } = body as {
      email?: string;
      targetUserId?: string;
    };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Get the requesting user's profile
    const { data: callerProfile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!callerProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Determine whose email we're changing
    const changingOwnEmail = !targetUserId || targetUserId === user.id;
    const effectiveUserId = changingOwnEmail ? user.id : targetUserId;

    if (!changingOwnEmail) {
      // Only admins can change other users' emails
      if (callerProfile.role !== "admin") {
        return NextResponse.json(
          { error: "Only admins can change other members' email addresses" },
          { status: 403 }
        );
      }

      // Verify target is in the same org
      const { data: targetProfile } = await db
        .from("profiles")
        .select("org_id, role")
        .eq("id", effectiveUserId)
        .single();

      if (!targetProfile || targetProfile.org_id !== callerProfile.org_id) {
        return NextResponse.json(
          { error: "Member not found in your organization" },
          { status: 404 }
        );
      }

      // Admins cannot change other admins' emails
      if (targetProfile.role === "admin") {
        return NextResponse.json(
          { error: "Cannot change another admin's email address" },
          { status: 403 }
        );
      }
    }

    // Update email in Supabase Auth
    const { error: updateError } = await db.auth.admin.updateUserById(
      effectiveUserId,
      { email: trimmedEmail }
    );

    if (updateError) {
      // Handle duplicate email
      if (updateError.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "This email address is already in use" },
          { status: 409 }
        );
      }
      console.error("Email update error:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update email" },
        { status: 500 }
      );
    }

    // Sync profile table
    await db
      .from("profiles")
      .update({ email: trimmedEmail, updated_at: new Date().toISOString() })
      .eq("id", effectiveUserId);

    return NextResponse.json({
      success: true,
      message: changingOwnEmail
        ? "Email updated. Check your new email for a confirmation link."
        : "Member email updated successfully.",
    });
  } catch (error) {
    console.error("Email change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
