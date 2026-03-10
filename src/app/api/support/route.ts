import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { notifyAdminsOfNewTicket } from "@/lib/notify-admins";
import { sendAutoAck } from "@/lib/auto-ack";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (prefer x-real-ip set by Vercel, not spoofable)
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = await checkRateLimit(limiters.support, ip);
    if (!rl.success) return rl.response;

    const body = await request.json();
    const { name, email, type, subject, message, screenshots } = body;

    // Strip newlines from name and subject to prevent email header injection
    const safeName = typeof name === "string" ? name.replace(/[\r\n]+/g, " ").trim() : name;
    const safeSubject = typeof subject === "string" ? subject.replace(/[\r\n]+/g, " ").trim() : subject;

    // Validate required fields
    if (!safeName || !email || !safeSubject || !message) {
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
    const validTypes = ["feedback", "bug", "feature", "sales"];
    const ticketType = validTypes.includes(type) ? type : "feedback";

    const db = createServiceClient();

    // Validate screenshots: limit count and total size
    const MAX_SCREENSHOTS = 5;
    const MAX_TOTAL_SCREENSHOT_SIZE = 10 * 1024 * 1024; // 10 MB total
    const screenshotList = Array.isArray(screenshots) ? screenshots : [];

    if (screenshotList.length > MAX_SCREENSHOTS) {
      return NextResponse.json(
        { error: `Too many screenshots. Maximum is ${MAX_SCREENSHOTS}.` },
        { status: 400 }
      );
    }

    let totalScreenshotSize = 0;
    for (const s of screenshotList) {
      if (s?.dataUrl && typeof s.dataUrl === "string") {
        totalScreenshotSize += s.dataUrl.length;
      }
    }
    if (totalScreenshotSize > MAX_TOTAL_SCREENSHOT_SIZE) {
      return NextResponse.json(
        { error: "Screenshots are too large. Please reduce file sizes and try again." },
        { status: 400 }
      );
    }

    // Build message body — append screenshot data URLs if provided
    let cleanMessage = message;
    if (screenshotList.length > 0) {
      cleanMessage += `\n\n--- Screenshots (${screenshotList.length}) ---`;
      for (const s of screenshotList) {
        if (s?.name && s?.dataUrl) {
          cleanMessage += `\n[${s.name}]\n${s.dataUrl}`;
        }
      }
    }

    const inboxEmail = ticketType === "sales"
      ? "sales@teamprompt.app"
      : "support@teamprompt.app";

    const { data: inserted, error: insertError } = await db.from("feedback").insert({
      user_id: null,
      org_id: null,
      type: ticketType,
      subject: `[${safeName}] ${safeSubject}`,
      message: cleanMessage,
      sender_email: email,
      sender_name: safeName,
      status: "new",
      priority: "normal",
      inbox_email: inboxEmail,
    }).select("id").single();

    if (insertError) {
      console.error("Support form insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit your message. Please try again." },
        { status: 500 }
      );
    }

    // Notify admins via email + send auto-ack to customer (non-blocking)
    if (inserted) {
      notifyAdminsOfNewTicket({
        subject: `[${safeName}] ${safeSubject}`,
        senderEmail: email,
        type: ticketType,
        message,
        ticketId: inserted.id,
      });
      sendAutoAck({
        recipientEmail: email,
        recipientName: safeName,
        ticketId: inserted.id,
        subject: `[${safeName}] ${safeSubject}`,
        inboxEmail,
      });
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
