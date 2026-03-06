import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import { submitToIndexNow, getAllSitemapUrls } from "@/lib/seo/indexnow";

async function verifySuperAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  if (SUPER_ADMIN_EMAILS.includes(user.email || "")) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_super_admin === true;
}

/** GET — read auto-submit setting */
export async function GET() {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = createServiceClient();
  const { data } = await db
    .from("platform_settings")
    .select("value")
    .eq("key", "indexnow_auto_submit")
    .maybeSingle();

  return NextResponse.json({ autoSubmit: data?.value === "true" });
}

/** POST — manually submit URLs to IndexNow */
export async function POST(request: Request) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  let urls: string[] = [];

  if (body.submitAll) {
    urls = getAllSitemapUrls();
  } else if (body.urls && Array.isArray(body.urls)) {
    urls = body.urls;
  } else {
    return NextResponse.json({ error: "Provide urls array or submitAll: true" }, { status: 400 });
  }

  const result = await submitToIndexNow(urls);
  return NextResponse.json(result);
}

/** PATCH — toggle auto-submit setting */
export async function PATCH(request: NextRequest) {
  const isAdmin = await verifySuperAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { autoSubmit } = await request.json();
  const db = createServiceClient();

  await db
    .from("platform_settings")
    .upsert(
      { key: "indexnow_auto_submit", value: String(!!autoSubmit), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  return NextResponse.json({ autoSubmit: !!autoSubmit });
}
