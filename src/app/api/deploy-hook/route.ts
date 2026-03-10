import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { submitToIndexNow, getAllSitemapUrls } from "@/lib/seo/indexnow";

/**
 * POST /api/deploy-hook — called by Vercel deploy hook after each deploy.
 * If auto-submit is enabled, submits all sitemap URLs to IndexNow.
 *
 * Vercel setup: Project Settings → Git → Deploy Hooks → add URL:
 *   https://teamprompt.app/api/deploy-hook?secret=YOUR_DEPLOY_HOOK_SECRET
 */
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.DEPLOY_HOOK_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Deploy hook not configured" }, { status: 401 });
  }

  // Check Authorization header first, fall back to query param
  const authHeader = request.headers.get("authorization");
  const headerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;
  const querySecret = request.nextUrl.searchParams.get("secret");
  const providedSecret = headerSecret || querySecret;

  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Check if auto-submit is enabled
  const db = createServiceClient();
  const { data } = await db
    .from("platform_settings")
    .select("value")
    .eq("key", "indexnow_auto_submit")
    .maybeSingle();

  if (data?.value !== "true") {
    return NextResponse.json({ skipped: true, message: "Auto-submit disabled" });
  }

  // Submit all sitemap URLs
  const urls = getAllSitemapUrls();
  const result = await submitToIndexNow(urls);

  console.log(`[deploy-hook] IndexNow auto-submit: ${result.urlCount} URLs, status ${result.statusCode}`);

  return NextResponse.json(result);
}
