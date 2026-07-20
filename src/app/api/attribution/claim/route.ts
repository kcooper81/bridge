import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ATTRIBUTION_COOKIE } from "@/lib/attribution";

const VALID_CHANNELS = ["organic_search", "paid_search", "social", "referral", "direct"];

/**
 * POST /api/attribution/claim
 *
 * Copies the first-touch attribution cookie onto the caller's profile. Called
 * once after auth lands (see AttributionClaim). Idempotent and write-once:
 * if the profile already has attribution, this is a no-op, so a returning
 * user logging in months later can't overwrite what produced their signup.
 *
 * The cookie is attacker-controllable, so everything is validated and clamped
 * before it touches the DB. Worst case someone poisons their own attribution
 * row, which is an analytics nuisance, not a security issue — but unbounded
 * JSON from a cookie should never reach storage.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = request.cookies.get(ATTRIBUTION_COOKIE)?.value;
    if (!raw) return NextResponse.json({ claimed: false, reason: "no_cookie" });

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ claimed: false, reason: "unparseable" });
    }

    const str = (v: unknown, max: number): string | null =>
      typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

    const landingPath = str(parsed.landing_path, 300);
    if (!landingPath || !landingPath.startsWith("/")) {
      return NextResponse.json({ claimed: false, reason: "invalid_landing_path" });
    }

    // Only keep known utm keys, and clamp each value.
    const utm: Record<string, string> = {};
    if (parsed.utm && typeof parsed.utm === "object") {
      for (const [k, v] of Object.entries(parsed.utm as Record<string, unknown>)) {
        if (["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"].includes(k)) {
          const val = str(v, 120);
          if (val) utm[k] = val;
        }
      }
    }

    const channel = str(parsed.channel, 20);
    const attribution = {
      landing_path: landingPath,
      referrer: str(parsed.referrer, 500),
      referrer_host: str(parsed.referrer_host, 253),
      channel: channel && VALID_CHANNELS.includes(channel) ? channel : "direct",
      utm,
      captured_at: str(parsed.captured_at, 40),
      claimed_at: new Date().toISOString(),
    };

    // Write-once. The `is null` predicate makes this safe under concurrent
    // calls — a second request updates zero rows rather than clobbering.
    const { data, error } = await db
      .from("profiles")
      .update({ signup_attribution: attribution })
      .eq("id", user.id)
      .is("signup_attribution", null)
      .select("id");

    if (error) {
      console.error("[attribution] update failed", error.message);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ claimed: (data?.length ?? 0) > 0 });
  } catch {
    // Attribution is analytics — never surface a failure to the user.
    return NextResponse.json({ claimed: false, reason: "error" });
  }
}
