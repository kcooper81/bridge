import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/org/ensure
 *
 * Fallback for when the handle_new_user trigger fails silently.
 * If the authenticated user has no org_id, creates a personal org
 * and makes them admin — exactly what the trigger would have done.
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

    // Check current profile
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id, org_id, name, email")
      .eq("id", user.id)
      .single();

    // If profile already has an org, nothing to do
    if (profile?.org_id) {
      return NextResponse.json({ orgId: profile.org_id, created: false });
    }

    // Derive user info (same logic as the trigger)
    const userEmail = user.email || user.user_metadata?.email || "";
    const userName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.preferred_username ||
      profile?.name ||
      userEmail.split("@")[0] ||
      "My Organization";

    const domain = userEmail.split("@")[1] || "";

    // Create a personal org
    const { data: org, error: orgError } = await db
      .from("organizations")
      .insert({
        name: `${userName}'s Org`,
        domain,
        plan: "free",
      })
      .select("id")
      .single();

    if (orgError || !org) {
      console.error("Failed to create org:", orgError);
      return NextResponse.json(
        { error: "Failed to create organization" },
        { status: 500 }
      );
    }

    if (profileError || !profile) {
      // Profile doesn't exist at all — create it
      const { error: insertError } = await db.from("profiles").insert({
        id: user.id,
        email: userEmail,
        name: userName,
        avatar_url:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          "",
        role: "admin",
        org_id: org.id,
      });

      if (insertError) {
        console.error("Failed to create profile:", insertError);
        return NextResponse.json(
          { error: "Failed to create profile" },
          { status: 500 }
        );
      }
    } else {
      // Profile exists but no org — update it
      const { error: updateError } = await db
        .from("profiles")
        .update({ org_id: org.id, role: "admin" })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }
    }

    // Seed a sample prompt so the vault isn't empty
    await db.from("prompts").insert({
      org_id: org.id,
      owner_id: user.id,
      title: "Weekly Status Update",
      content:
        "Summarize my progress this week in a clear, professional format.\n\n" +
        "**What I accomplished:**\n{{accomplishments}}\n\n" +
        "**Blockers or challenges:**\n{{blockers}}\n\n" +
        "**Plan for next week:**\n{{next_week_plan}}\n\n" +
        "Keep the tone concise and action-oriented. Use bullet points where appropriate.",
      description:
        "A template for writing weekly status updates. Fill in the variables and paste into any AI tool.",
      tags: ["productivity", "template", "weekly-update"],
      status: "approved",
      tone: "professional",
      version: 1,
      is_template: true,
      template_variables: ["accomplishments", "blockers", "next_week_plan"],
    });

    return NextResponse.json({ orgId: org.id, created: true });
  } catch (error) {
    console.error("Ensure org error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
