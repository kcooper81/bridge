import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/**
 * GET — return audience segments (plan-based counts from our DB).
 * These are logical segments we use when syncing contacts to Resend.
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();

  // Get total user count
  const { count: totalUsers } = await db
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .not("email", "is", null);

  // Get plan-based counts
  const { data: subs } = await db
    .from("subscriptions")
    .select("plan, org_id");

  const planOrgMap: Record<string, string[]> = {};
  for (const sub of subs || []) {
    if (!planOrgMap[sub.plan]) planOrgMap[sub.plan] = [];
    planOrgMap[sub.plan].push(sub.org_id);
  }

  // Count members per plan
  const segments: Array<{ name: string; label: string; count: number }> = [
    { name: "all", label: "All Users", count: totalUsers || 0 },
  ];

  for (const [plan, orgIds] of Object.entries(planOrgMap)) {
    if (orgIds.length === 0) continue;
    const { count } = await db
      .from("org_members")
      .select("*", { count: "exact", head: true })
      .in("org_id", orgIds);

    segments.push({
      name: plan,
      label: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Users`,
      count: count || 0,
    });
  }

  return NextResponse.json({ segments });
}
