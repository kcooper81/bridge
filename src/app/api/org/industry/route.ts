import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { INDUSTRY_SEED_PROMPTS } from "@/lib/seed-defaults";

const VALID_INDUSTRIES = [
  "healthcare",
  "finance",
  "technology",
  "legal",
  "education",
  "marketing",
  "other",
];

/**
 * POST /api/org/industry
 *
 * Sets the organization's industry and seeds industry-specific prompts.
 * Can be called again to change industry (re-seeds if few prompts exist).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();

    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await db
      .from("profiles")
      .select("id, org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Only admins can set industry" }, { status: 403 });
    }

    const body = await request.json();
    const { industry } = body;

    if (!industry || !VALID_INDUSTRIES.includes(industry)) {
      return NextResponse.json({ error: "Invalid industry", valid: VALID_INDUSTRIES }, { status: 400 });
    }

    // Update org industry (use settings JSONB as fallback if column doesn't exist)
    const { error: updateError } = await db
      .from("organizations")
      .update({ industry })
      .eq("id", profile.org_id);

    if (updateError) {
      if (updateError.message?.includes("industry")) {
        // Industry column doesn't exist — migration 074 not run. Continue with seeding anyway.
        console.warn("Industry column not found — run migration 074:", updateError.message);
      } else {
        console.error("Failed to update org industry:", updateError);
        return NextResponse.json({ error: "Failed to update industry" }, { status: 500 });
      }
    }

    // Seed industry prompts if the industry has specific prompts defined
    // Only seed if org has <= 5 prompts (default seed + maybe a few user-created)
    if (industry !== "other" && INDUSTRY_SEED_PROMPTS[industry]) {
      const { count: promptCount } = await db
        .from("prompts")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id);

      if ((promptCount ?? 0) <= 5) {
        const prompts = INDUSTRY_SEED_PROMPTS[industry];

        // Check if these exact prompts already exist (by title) to avoid duplicates
        const titles = prompts.map((p) => p.title);
        const { data: existing } = await db
          .from("prompts")
          .select("title")
          .eq("org_id", profile.org_id)
          .in("title", titles);

        const existingTitles = new Set((existing || []).map((e: { title: string }) => e.title));
        const newPrompts = prompts.filter((p) => !existingTitles.has(p.title));

        if (newPrompts.length > 0) {
          const { error: insertError } = await db.from("prompts").insert(
            newPrompts.map((p) => ({
              org_id: profile.org_id,
              owner_id: user.id,
              title: p.title,
              content: p.content,
              description: p.description,
              tags: p.tags,
              tone: p.tone,
              status: "approved",
              version: 1,
              is_template: p.is_template,
              template_variables: p.template_variables,
            }))
          );

          if (insertError) {
            console.error("Failed to seed industry prompts:", insertError);
            // Don't fail the whole request — industry was set, prompts just didn't seed
          }
        }
      }
    }

    return NextResponse.json({ success: true, industry, message: "Industry set successfully" });
  } catch (error) {
    console.error("Set industry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
