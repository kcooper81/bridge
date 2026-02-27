import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { trackExtensionActivity } from "../track-activity";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// POST /api/extension/prompts — Create a new prompt from the extension
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);
    }

    const rl = await checkRateLimit(limiters.prompts, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    const body = await request.json();
    const { title, content, description, tags, folder_id, department_id, tone } = body;

    if (!title?.trim() || !content?.trim()) {
      return withCors(NextResponse.json({ error: "Title and content are required" }, { status: 400 }), request);
    }

    // Determine approval status:
    // - Org admins → always approved
    // - Team admin (manager) of the selected team → approved
    // - Everyone else → draft (pending review)
    const orgRole = profile.is_super_admin ? "admin" : profile.role;
    let status = "draft";

    if (orgRole === "admin") {
      status = "approved";
    } else if (orgRole === "manager") {
      status = "approved";
    } else if (department_id) {
      // Check if user is admin of the target team
      const { data: membership } = await db
        .from("team_members")
        .select("role")
        .eq("team_id", department_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membership?.role === "admin") {
        status = "approved";
      }
    }

    const insertRow = {
      org_id: profile.org_id,
      owner_id: user.id,
      title: title.trim(),
      content: content.trim(),
      description: description?.trim() || null,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      folder_id: folder_id || null,
      department_id: department_id || null,
      tone: tone || "professional",
      status,
      is_template: false,
      version: 1,
    };

    let { data: prompt, error } = await db
      .from("prompts")
      .insert(insertRow)
      .select("id, title, status")
      .single();

    // If department_id FK fails (team UUID vs departments table mismatch),
    // retry without department_id so the prompt still gets created.
    if (error && department_id) {
      const { data: retryData, error: retryError } = await db
        .from("prompts")
        .insert({ ...insertRow, department_id: null })
        .select("id, title, status")
        .single();
      if (!retryError) {
        prompt = retryData;
        error = null;
      }
    }

    if (error) {
      console.error("Extension create prompt error:", error);
      return withCors(NextResponse.json({ error: "Failed to create prompt" }, { status: 500 }), request);
    }

    return withCors(NextResponse.json({ success: true, prompt }, { status: 201 }), request);
  } catch (error) {
    console.error("Extension create prompt error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}

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
    const sortRecent = searchParams.get("sort") === "recent";
    const favoritesOnly = searchParams.get("favorites") === "true";
    const folderId = searchParams.get("folderId") || "";
    const tagsParam = searchParams.get("tags") || "";
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT
    );
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    let q = db
      .from("prompts")
      .select("id, title, content, description, tags, tone, is_template, template_variables, usage_count, folder_id, department_id, is_favorite, last_used_at")
      .eq("org_id", profile.org_id)
      .eq("status", "approved");

    if (sortRecent) {
      q = q.order("last_used_at", { ascending: false, nullsFirst: false });
    } else {
      q = q.order("usage_count", { ascending: false });
    }

    q = q.range(offset, offset + limit - 1);

    if (templatesOnly) {
      q = q.eq("is_template", true);
    }

    if (favoritesOnly) {
      q = q.eq("is_favorite", true);
    }

    if (folderId === "unfiled") {
      q = q.is("folder_id", null);
    } else if (folderId) {
      q = q.eq("folder_id", folderId);
    }

    // Tag filter — show prompts that have ANY of the selected tags
    if (tagsParam) {
      const tags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length > 0) {
        q = q.overlaps("tags", tags);
      }
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
