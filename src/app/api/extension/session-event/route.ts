import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = await checkRateLimit(limiters.sessionEvent, ip);
    if (!rl.success) return rl.response;

    const body = await request.json();
    const { userId, event } = body;

    // Validate
    if (typeof userId !== "string" || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (event !== "session_lost") {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const db = createServiceClient();
    await db
      .from("profiles")
      .update({ extension_status: "session_lost" })
      .eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
