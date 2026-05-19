import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/auth/resend-verification
 *
 * Re-send the signup confirmation email to a given address. Used by the
 * signup success screen and the login "email not verified" error state.
 * Rate-limited by IP to prevent abuse; same limit bucket as the
 * forgot-password flow.
 */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const rl = await checkRateLimit(limiters.forgotPassword, ip);
  if (!rl.success) return rl.response;

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const db = createServiceClient();
  const { error } = await db.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app"}/auth/callback`,
    },
  });

  // Don't leak whether the email exists / is already verified. Always 200
  // so a bot can't probe for valid emails via this endpoint.
  if (error) {
    console.log("Resend verification non-fatal error:", error.message);
  }
  return NextResponse.json({ success: true });
}
