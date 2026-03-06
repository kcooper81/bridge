import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { notifyAdminsOfNewTicket } from "@/lib/notify-admins";
import { sendAutoAck } from "@/lib/auto-ack";

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
    const validTypes = ["feedback", "bug", "feature", "sales"];
    const ticketType = validTypes.includes(type) ? type : "feedback";

    const db = createServiceClient();

    // Build message body — append screenshot data URLs if provided
    let cleanMessage = message;
    const screenshotList = Array.isArray(screenshots) ? screenshots : [];
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
      subject: `[${name}] ${subject}`,
      message: cleanMessage,
      sender_email: email,
      sender_name: name,
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
        subject: `[${name}] ${subject}`,
        senderEmail: email,
        type: ticketType,
        message,
        ticketId: inserted.id,
      });
      sendAutoAck({
        recipientEmail: email,
        recipientName: name,
        ticketId: inserted.id,
        subject: `[${name}] ${subject}`,
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
