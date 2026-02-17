import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";

export async function OPTIONS() { return handleOptions(); }

// POST /api/extension/log — Log a conversation from the Chrome extension
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }));
    }

    const body = await request.json();
    const { ai_tool, prompt_text, prompt_id, response_text, guardrail_flags, action, metadata } = body;

    if (!ai_tool || !prompt_text) {
      return withCors(NextResponse.json(
        { error: "ai_tool and prompt_text are required" },
        { status: 400 }
      ));
    }

    const validActions = ["sent", "blocked", "warned"];
    if (action && !validActions.includes(action)) {
      return withCors(NextResponse.json({ error: "Invalid action" }, { status: 400 }));
    }

    const { data: log, error: insertError } = await db
      .from("conversation_logs")
      .insert({
        org_id: profile.org_id,
        user_id: user.id,
        ai_tool,
        prompt_text,
        prompt_id: prompt_id || null,
        response_text: response_text || null,
        guardrail_flags: guardrail_flags || [],
        action: action || "sent",
        metadata: metadata || {},
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert conversation log error:", insertError);
      return withCors(NextResponse.json(
        { error: "Failed to log conversation" },
        { status: 500 }
      ));
    }

    // Also increment usage if a prompt_id was provided
    if (prompt_id && action !== "blocked") {
      await db.rpc("increment_usage_count", { prompt_id });
    }

    return withCors(NextResponse.json({ success: true, logId: log.id, created_at: log.created_at }));
  } catch (error) {
    console.error("Extension log error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }));
  }
}
