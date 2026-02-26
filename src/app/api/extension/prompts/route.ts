import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { trackExtensionActivity } from "../track-activity";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// GET /api/extension/prompts — Chrome extension fetches user's prompts
export async function GET(request: NextRequest) {
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

    const extVersion = request.headers.get("x-extension-version");
    trackExtensionActivity(db, user.id, extVersion);

    const rl = await checkRateLimit(limiters.prompts, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const templatesOnly = searchParams.get("templates") === "true";
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    let q = db
      .from("prompts")
      .select("id, title, content, description, tags, tone, is_template, template_variables, usage_count, folder_id, department_id")
      .eq("org_id", profile.org_id)
      .eq("status", "approved")
      .order("usage_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (templatesOnly) {
      q = q.eq("is_template", true);
    }

    // Server-side search — use parameterized filters (not string interpolation)
    if (query) {
      const sanitized = query.replace(/[%_]/g, "\\$&");
      const pattern = `%${sanitized}%`;
      q = q.or(`title.ilike.${pattern},description.ilike.${pattern}`);
    }

    const { data: prompts, error } = await q;

    if (error) {
      console.error("Extension prompts error:", error);
      return withCors(NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 }), request);
    }

    return withCors(NextResponse.json({
      prompts: prompts || [],
      pagination: { limit, offset, hasMore: (prompts?.length || 0) === limit },
    }), request);
  } catch (error) {
    console.error("Extension prompts error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
