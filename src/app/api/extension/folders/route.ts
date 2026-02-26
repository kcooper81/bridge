import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// GET /api/extension/folders — Chrome extension fetches org folders with prompt counts
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

    // Fetch folders for this org
    const { data: folders, error: foldersError } = await db
      .from("folders")
      .select("id, name, icon, color")
      .eq("org_id", profile.org_id)
      .order("name", { ascending: true });

    if (foldersError) {
      console.error("Extension folders error:", foldersError);
      return withCors(NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 }), request);
    }

    // Count prompts per folder
    const folderIds = (folders || []).map((f) => f.id);
    const folderCounts: Record<string, number> = {};

    if (folderIds.length > 0) {
      const { data: counts } = await db
        .from("prompts")
        .select("folder_id")
        .eq("org_id", profile.org_id)
        .eq("status", "approved")
        .in("folder_id", folderIds);

      if (counts) {
        for (const row of counts) {
          if (row.folder_id) {
            folderCounts[row.folder_id] = (folderCounts[row.folder_id] || 0) + 1;
          }
        }
      }
    }

    // Count unfiled prompts (folder_id IS NULL)
    const { count: unfiledCount } = await db
      .from("prompts")
      .select("id", { count: "exact", head: true })
      .eq("org_id", profile.org_id)
      .eq("status", "approved")
      .is("folder_id", null);

    // Collect distinct tags from all approved prompts in the org
    const { data: tagRows } = await db
      .from("prompts")
      .select("tags")
      .eq("org_id", profile.org_id)
      .eq("status", "approved")
      .not("tags", "eq", "{}");

    const tagSet = new Set<string>();
    if (tagRows) {
      for (const row of tagRows) {
        if (Array.isArray(row.tags)) {
          for (const t of row.tags) {
            if (t) tagSet.add(t);
          }
        }
      }
    }
    const tags = Array.from(tagSet).sort();

    const result = (folders || []).map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      color: f.color,
      prompt_count: folderCounts[f.id] || 0,
    }));

    return withCors(NextResponse.json({
      folders: result,
      unfiled_count: unfiledCount || 0,
      tags,
    }), request);
  } catch (error) {
    console.error("Extension folders error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
