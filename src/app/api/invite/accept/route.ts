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

    const { token: inviteToken } = await request.json();
    if (!inviteToken) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Look up invite
    const { data: invite, error: inviteError } = await db
      .from("invites")
      .select("*")
      .eq("token", inviteToken)
      .eq("status", "pending")
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 404 }
      );
    }

    // Verify invite email matches authenticated user
    if (invite.email !== user.email) {
      return NextResponse.json(
        { error: "This invite was sent to a different email" },
        { status: 403 }
      );
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      await db
        .from("invites")
        .update({ status: "expired" })
        .eq("id", invite.id);
      return NextResponse.json(
        { error: "This invite has expired" },
        { status: 410 }
      );
    }

    // Update user's profile with org and role
    await db
      .from("profiles")
      .update({
        org_id: invite.org_id,
        role: invite.role,
      })
      .eq("id", user.id);

    // Mark invite as accepted
    await db
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    return NextResponse.json({ success: true, orgId: invite.org_id });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
