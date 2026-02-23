import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { DEFAULT_SECURITY_RULES } from "@/lib/security/default-rules";

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// POST /api/extension/enable-shield — Install default security rules
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const rl = await checkRateLimit(limiters.securityStatus, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    const orgId = profile.org_id;

    // Check if rules already exist
    const { count } = await db
      .from("security_rules")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId);

    if (count && count > 0) {
      return withCors(NextResponse.json({
        installed: false,
        message: "Security rules already configured",
        ruleCount: count,
      }), request);
    }

    // Install active-by-default rules
    const activeRules = DEFAULT_SECURITY_RULES.filter((r) => r.is_active);

    const { error: insertError } = await db.from("security_rules").insert(
      activeRules.map((r) => ({
        org_id: orgId,
        name: r.name,
        description: r.description,
        pattern: r.pattern,
        pattern_type: r.pattern_type,
        category: r.category,
        severity: r.severity,
        is_active: true,
        is_built_in: true,
        created_by: user.id,
      }))
    );

    if (insertError) {
      console.error("Enable shield insert error:", insertError);
      return withCors(NextResponse.json({ error: "Failed to install rules" }, { status: 500 }), request);
    }

    return withCors(NextResponse.json({
      installed: true,
      ruleCount: activeRules.length,
    }), request);
  } catch (error) {
    console.error("Extension enable-shield error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
