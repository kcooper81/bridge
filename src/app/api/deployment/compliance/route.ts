import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { AI_TOOL_DOMAINS } from "@/lib/cloudflare-gateway";

/**
 * GET /api/deployment/compliance
 *
 * Returns the org's deployment policy for the extension to check compliance.
 * Called by the extension on startup to verify:
 * - Whether it should be force-installed
 * - Which domains should be blocked/allowed
 * - Expected enforcement level
 *
 * Also accepts POST from the extension to report device compliance status.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

    // Get org settings
    const { data: org } = await db
      .from("organizations")
      .select("settings")
      .eq("id", profile.org_id)
      .single();

    const settings = (org?.settings || {}) as Record<string, unknown>;
    const policyEnabled = settings.allow_external_ai_tools === false;
    const approvedTools = (settings.approved_ai_tools as string[]) || ["chatgpt", "claude", "gemini", "copilot", "perplexity"];
    const deploymentLevel = (settings.deployment_enforcement_level as string) || null;

    // Build blocked/allowed domain lists
    const blockedDomains: string[] = [];
    const allowedDomains: string[] = [];

    if (policyEnabled) {
      for (const tool of AI_TOOL_DOMAINS) {
        if (approvedTools.includes(tool.id)) {
          allowedDomains.push(...tool.domains);
        } else {
          blockedDomains.push(...tool.domains);
        }
      }
    }

    return NextResponse.json({
      policyEnabled,
      deploymentLevel,
      approvedTools,
      blockedDomains,
      allowedDomains,
      extensionId: "hpdekjimndbhdkebpedfgaceohplbpil",
      lastPolicyUpdate: settings.last_tool_policy_update || null,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/deployment/compliance
 *
 * Extension reports its deployment status (is it force-installed, is incognito blocked, etc.)
 * This data powers the compliance dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const forceInstalled = typeof body.forceInstalled === "boolean" ? body.forceInstalled : null;
    const incognitoBlocked = typeof body.incognitoBlocked === "boolean" ? body.incognitoBlocked : null;
    const devToolsBlocked = typeof body.devToolsBlocked === "boolean" ? body.devToolsBlocked : null;
    const extensionVersion = typeof body.extensionVersion === "string" ? body.extensionVersion : null;
    const browserName = typeof body.browserName === "string" ? body.browserName : null;
    const browserVersion = typeof body.browserVersion === "string" ? body.browserVersion : null;
    const managedBy = typeof body.managedBy === "string" ? body.managedBy : null;

    // Store compliance report
    // Using conversation_logs as a lightweight store — could be a dedicated table later
    try {
      await db.from("conversation_logs").insert({
        org_id: profile.org_id,
        user_id: user.id,
        ai_tool: "system",
        action: "sent",
        prompt_text: `Extension compliance report: force_installed=${forceInstalled}, incognito_blocked=${incognitoBlocked}, dev_tools_blocked=${devToolsBlocked}`,
        risk_score: 0,
        metadata: {
          type: "deployment_compliance",
          forceInstalled,
          incognitoBlocked,
          devToolsBlocked,
          extensionVersion,
          browserName,
          browserVersion,
          managedBy,
          reportedAt: new Date().toISOString(),
        },
      });
    } catch {
      // Non-critical — don't fail the request
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
