import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ connected: false });
    }

    const db = createServiceClient();
    const { data: profile } = await db
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin && !SUPER_ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data } = await db
      .from("platform_integrations")
      .select("site_url, connected_at")
      .eq("provider", "google_search_console")
      .single();

    return NextResponse.json({
      connected: !!data,
      site_url: data?.site_url || null,
      connected_at: data?.connected_at || null,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
