import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import type { PlanTier } from "@/lib/types";

const FREE_PROVIDERS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "live.com",
  "me.com",
  "mail.com",
  "ymail.com",
]);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ joined: false }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ joined: false }, { status: 401 });
    }

    // Get user profile + email domain
    const { data: profile } = await db
      .from("profiles")
      .select("id, org_id, email, role")
      .eq("id", user.id)
      .single();

    if (!profile?.email || !profile.org_id) {
      return NextResponse.json({ joined: false });
    }

    const emailDomain = profile.email.split("@")[1]?.toLowerCase();
    if (!emailDomain || FREE_PROVIDERS.has(emailDomain)) {
      return NextResponse.json({ joined: false });
    }

    // Find orgs with matching domain + auto_join_domain enabled
    const { data: matchingOrgs } = await db
      .from("organizations")
      .select("id, plan")
      .eq("domain", emailDomain)
      .filter("settings->>auto_join_domain", "eq", "true")
      .neq("id", profile.org_id)
      .limit(2);

    if (!matchingOrgs || matchingOrgs.length !== 1) {
      // No match or ambiguous — do nothing
      return NextResponse.json({ joined: false });
    }

    const targetOrg = matchingOrgs[0];

    // Plan gate: domain_auto_join requires Team+
    const targetPlan = (targetOrg.plan || "free") as PlanTier;
    if (!PLAN_LIMITS[targetPlan]?.domain_auto_join) {
      return NextResponse.json({ joined: false });
    }

    // Verify user is in a solo personal org (member count = 1, plan = free)
    const { data: currentOrg } = await db
      .from("organizations")
      .select("id, plan")
      .eq("id", profile.org_id)
      .single();

    if (!currentOrg || currentOrg.plan !== "free") {
      return NextResponse.json({ joined: false });
    }

    const { count: orgMemberCount } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("org_id", profile.org_id);

    if ((orgMemberCount || 0) > 1) {
      return NextResponse.json({ joined: false });
    }

    // Check seat limits on target org
    const orgPlan = (targetOrg.plan || "free") as PlanTier;
    const limits = PLAN_LIMITS[orgPlan] || PLAN_LIMITS.free;

    if (limits.max_members !== -1) {
      const { count: targetMemberCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", targetOrg.id);

      if ((targetMemberCount || 0) >= limits.max_members) {
        return NextResponse.json({ joined: false });
      }
    }

    // Migrate: clean up solo org, move user to target org
    const oldOrgId = profile.org_id;

    await Promise.all([
      db.from("prompts").delete().eq("org_id", oldOrgId),
      db.from("folders").delete().eq("org_id", oldOrgId),
      db.from("teams").delete().eq("org_id", oldOrgId),
      db.from("standards").delete().eq("org_id", oldOrgId),
      db.from("invites").delete().eq("org_id", oldOrgId),
    ]);

    // Update profile to target org as member
    await db
      .from("profiles")
      .update({ org_id: targetOrg.id, role: "member" })
      .eq("id", profile.id);

    // Delete the orphaned org
    await db.from("organizations").delete().eq("id", oldOrgId);

    return NextResponse.json({ joined: true });
  } catch (error) {
    console.error("Domain join error:", error);
    return NextResponse.json({ joined: false });
  }
}
