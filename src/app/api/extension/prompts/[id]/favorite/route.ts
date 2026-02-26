import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../../../cors";

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// PATCH /api/extension/prompts/[id]/favorite — toggle is_favorite
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Get user's org
    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    // Fetch current favorite state (ensure prompt belongs to user's org)
    const { data: prompt, error: fetchError } = await db
      .from("prompts")
      .select("id, is_favorite")
      .eq("id", id)
      .eq("org_id", profile.org_id)
      .single();

    if (fetchError || !prompt) {
      return withCors(NextResponse.json({ error: "Prompt not found" }, { status: 404 }), request);
    }

    // Toggle
    const newValue = !prompt.is_favorite;
    const { error: updateError } = await db
      .from("prompts")
      .update({ is_favorite: newValue })
      .eq("id", id);

    if (updateError) {
      return withCors(NextResponse.json({ error: "Failed to update" }, { status: 500 }), request);
    }

    return withCors(NextResponse.json({ is_favorite: newValue }), request);
  } catch (error) {
    console.error("Extension favorite toggle error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
