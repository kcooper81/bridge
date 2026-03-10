import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

/** GET — list all campaigns */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const { data, error } = await db
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Campaigns fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }

  return NextResponse.json({ campaigns: data || [] });
}

/** POST — create a new campaign draft */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, subject, from_email, body_html, segment_name } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
  }

  const db = createServiceClient();
  const { data, error } = await db
    .from("email_campaigns")
    .insert({
      name: name.trim(),
      subject: subject?.trim() || "",
      from_email: from_email?.trim() || "TeamPrompt <hello@teamprompt.app>",
      body_html: body_html || "",
      segment_name: segment_name || null,
      status: "draft",
      created_by: auth.userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Campaign create error:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }

  return NextResponse.json({ campaign: data });
}
