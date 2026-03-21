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
    .select("email, role, status, org_id, expires_at, organizations(name)")
    .eq("token", token)
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const orgData = invite.organizations as unknown as { name: string } | null;

  // Only return minimal info needed to display the invite page
  // Don't expose inviter details or internal IDs
  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    status: invite.status,
    orgName: orgData?.name || "a team",
    expired: new Date(invite.expires_at) < new Date(),
  });
}
