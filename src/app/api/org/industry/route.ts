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
 * Only seeds if the org has <= 1 existing prompts (the default seed).
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

    // Get user's profile + org
    const { data: profile } = await db
      .from("profiles")
      .select("id, org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    if (profile.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can set industry" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { industry } = body;

    if (!industry || !VALID_INDUSTRIES.includes(industry)) {
      return NextResponse.json(
        { error: "Invalid industry", valid: VALID_INDUSTRIES },
        { status: 400 }
      );
    }

    // Update org industry
    const { error: updateError } = await db
      .from("organizations")
      .update({ industry })
      .eq("id", profile.org_id);

    if (updateError) {
      console.error("Failed to update org industry:", updateError);
      return NextResponse.json(
        { error: "Failed to update industry" },
        { status: 500 }
      );
    }

    // Only seed industry prompts (NOT guidelines/rules — those are already seeded)
    // Only if org has <= 1 prompt (the default seed) and industry has prompts defined
    if (industry !== "other" && INDUSTRY_SEED_PROMPTS[industry]) {
      const { count: promptCount } = await db
        .from("prompts")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profile.org_id);

      if ((promptCount ?? 0) <= 1) {
        // Insert only the industry-specific prompts, not full seedOrgDefaults
        const prompts = INDUSTRY_SEED_PROMPTS[industry];
        await db.from("prompts").insert(
          prompts.map((p) => ({
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
      }
    }

    return NextResponse.json({ success: true, industry });
  } catch (error) {
    console.error("Set industry error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
