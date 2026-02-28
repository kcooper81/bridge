import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = await checkRateLimit(limiters.support, ip);
    if (!rl.success) return rl.response;

    const body = await request.json();
    const { name, email, type, subject, message, screenshots } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["feedback", "bug", "feature"];
    const ticketType = validTypes.includes(type) ? type : "feedback";

    const db = createServiceClient();

    // Build message body — append screenshot data URLs if provided
    let fullMessage = `From: ${name} <${email}>\n\n${message}`;
    const screenshotList = Array.isArray(screenshots) ? screenshots : [];
    if (screenshotList.length > 0) {
      fullMessage += `\n\n--- Screenshots (${screenshotList.length}) ---`;
      for (const s of screenshotList) {
        if (s?.name && s?.dataUrl) {
          fullMessage += `\n[${s.name}]\n${s.dataUrl}`;
        }
      }
    }

    const { error: insertError } = await db.from("feedback").insert({
      user_id: null,
      org_id: null,
      type: ticketType,
      subject: `[${name}] ${subject}`,
      message: fullMessage,
      status: "new",
      priority: "normal",
    });

    if (insertError) {
      console.error("Support form insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit your message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
