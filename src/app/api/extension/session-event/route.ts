import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (prefer x-real-ip set by Vercel, not spoofable)
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = await checkRateLimit(limiters.sessionEvent, ip);
    if (!rl.success) return rl.response;

    // Authenticate the request
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

    const body = await request.json();
    const { userId, event } = body;

    // Validate
    if (typeof userId !== "string" || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }
    if (event !== "session_lost") {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    // Ensure the authenticated user matches the userId in the request body
    if (user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .from("profiles")
      .update({ last_extension_active: new Date().toISOString() })
      .eq("id", userId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
