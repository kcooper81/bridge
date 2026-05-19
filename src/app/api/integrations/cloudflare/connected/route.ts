import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getOrgSecrets } from "@/lib/organization-secrets";

/**
 * GET /api/integrations/cloudflare/connected
 *
 * Returns the connection status as a boolean only — no credentials are
 * ever serialised. Used by surfaces that want to show "Cloudflare synced"
 * badges to all org members (the full /api/integrations/cloudflare is
 * admin-gated because it returns the account_id and verification details).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ connected: false });
  }

  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return NextResponse.json({ connected: false });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ connected: false });

  const secrets = await getOrgSecrets(profile.org_id);
  return NextResponse.json({
    connected: !!(secrets.cloudflare_account_id && secrets.cloudflare_api_token),
  });
}
