import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

export async function DELETE() {
  try {
    const db = createServiceClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await db
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin && !SUPER_ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to revoke the token (best effort)
    const { data: integration } = await db
      .from("platform_integrations")
      .select("access_token")
      .eq("provider", "google_search_console")
      .single();

    if (integration?.access_token) {
      try {
        await fetch(
          `https://oauth2.googleapis.com/revoke?token=${integration.access_token}`,
          { method: "POST" }
        );
      } catch {
        // Best effort
      }
    }

    await db
      .from("platform_integrations")
      .delete()
      .eq("provider", "google_search_console");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Search Console disconnect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
