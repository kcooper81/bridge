import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { handleOptions, withCors } from "../cors";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { trackExtensionActivity } from "../track-activity";

export async function OPTIONS(request: NextRequest) { return handleOptions(request); }

// POST /api/extension/log — Log a conversation from the Chrome extension
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

    const extVersion = request.headers.get("x-extension-version");
    trackExtensionActivity(db, user.id, extVersion);

    const rl = await checkRateLimit(limiters.log, user.id);
    if (!rl.success) return withCors(rl.response, request);

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return withCors(NextResponse.json({ error: "No organization" }, { status: 403 }), request);
    }

    // Check if activity logging is disabled at the org level
    const { data: orgRow } = await db
      .from("organizations")
      .select("settings")
      .eq("id", profile.org_id)
      .single();
    const orgSettings = (orgRow?.settings || {}) as Record<string, unknown>;

    const body = await request.json();
    const { ai_tool, prompt_text, prompt_id, response_text, guardrail_flags, action, metadata, risk_score } = body;

    if (!ai_tool || typeof ai_tool !== "string" || !prompt_text || typeof prompt_text !== "string") {
      return withCors(NextResponse.json(
        { error: "ai_tool and prompt_text are required strings" },
        { status: 400 }
      ), request);
    }

    const validActions = ["sent", "blocked", "warned"];
    if (action && !validActions.includes(action)) {
      return withCors(NextResponse.json({ error: "Invalid action" }, { status: 400 }), request);
    }

    if (guardrail_flags && !Array.isArray(guardrail_flags)) {
      return withCors(NextResponse.json({ error: "guardrail_flags must be an array" }, { status: 400 }), request);
    }

    if (metadata && (typeof metadata !== "object" || Array.isArray(metadata))) {
      return withCors(NextResponse.json({ error: "metadata must be an object" }, { status: 400 }), request);
    }

    // Limit metadata size to prevent storage bloat
    if (metadata && JSON.stringify(metadata).length > 10000) {
      return withCors(NextResponse.json({ error: "metadata too large" }, { status: 400 }), request);
    }

    // If activity logging is disabled, skip the insert but still increment usage
    if (orgSettings.activity_logging_enabled === false) {
      if (prompt_id && action !== "blocked") {
        await db.rpc("increment_usage_count", { prompt_id });
      }
      return withCors(NextResponse.json({ success: true, skipped: true }), request);
    }

    // Determine logging mode: "metadata_only" (default) or "full"
    const logMode = orgSettings.activity_log_mode || "metadata_only";
    const storePromptText = logMode === "full";

    const { data: log, error: insertError } = await db
      .from("conversation_logs")
      .insert({
        org_id: profile.org_id,
        user_id: user.id,
        ai_tool,
        prompt_text: storePromptText ? prompt_text : "",
        prompt_id: prompt_id || null,
        response_text: storePromptText ? (response_text || null) : null,
        guardrail_flags: guardrail_flags || [],
        action: action || "sent",
        risk_score: typeof risk_score === "number" ? Math.min(100, Math.max(0, Math.round(risk_score))) : 0,
        metadata: metadata || {},
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert conversation log error:", insertError);
      return withCors(NextResponse.json(
        { error: "Failed to log conversation" },
        { status: 500 }
      ), request);
    }

    // Also increment usage if a prompt_id was provided
    if (prompt_id && action !== "blocked") {
      await db.rpc("increment_usage_count", { prompt_id });
    }

    return withCors(NextResponse.json({ success: true, logId: log.id, created_at: log.created_at }), request);
  } catch (error) {
    console.error("Extension log error:", error);
    return withCors(NextResponse.json({ error: "Internal server error" }, { status: 500 }), request);
  }
}
