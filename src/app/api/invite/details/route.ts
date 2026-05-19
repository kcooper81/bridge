import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: invite, error } = await db
    .from("invites")
    .select("email, role, status, org_id, invited_by, expires_at, organizations(name)")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const orgData = invite.organizations as unknown as { name: string } | null;

  // Look up inviter's display name (not email) so the invite page can say
  // "Alex Chen invited you" instead of "undefined" or "A team member".
  let invitedBy: string | null = null;
  if (invite.invited_by) {
    const { data: inviter } = await db
      .from("profiles")
      .select("name, email")
      .eq("id", invite.invited_by)
      .maybeSingle();
    if (inviter) {
      invitedBy = inviter.name || (inviter.email ? inviter.email.split("@")[0] : null);
    }
  }

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    status: invite.status,
    orgName: orgData?.name || "a team",
    invitedBy,
    expired: new Date(invite.expires_at) < new Date(),
  });
}
