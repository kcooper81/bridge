import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { notifyAdminsOfNewTicket } from "@/lib/notify-admins";
import { sendAutoAck } from "@/lib/auto-ack";

/**
 * POST /api/contact
 *
 * Public lead-capture / contact form entry-point. Mirrors /api/support but
 * defaults `type` to "sales" and tolerates the slim payload that
 * <LeadCaptureForm /> emits (just an email + canned message). The
 * marketing form POSTed to this URL since launch; before this handler
 * existed, every submission silently 404'd and the form swallowed the
 * error to show success — so every inbound lead from /pricing,
 * /extensions, and other surfaces was lost.
 *
 * Spam protection: honeypot field `website` must be empty. Bots that
 * fill every input fail; humans (and password managers) leave it alone.
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rl = await checkRateLimit(limiters.support, ip);
    if (!rl.success) return rl.response;

    const body = await request.json();
    const { name, email, type, subject, message, website } = body;

    // Honeypot — if filled, pretend success but drop the submission. This
    // is the standard low-friction anti-spam pattern; bots filling every
    // input get silently 200'd while real users sail through.
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const safeName = typeof name === "string"
      ? name.replace(/[\r\n]+/g, " ").trim()
      : "";
    const safeSubject = typeof subject === "string"
      ? subject.replace(/[\r\n]+/g, " ").trim()
      : "Website Lead Capture";
    const safeMessage = typeof message === "string"
      ? message
      : "Lead capture form submission — requesting demo/info.";

    const validTypes = ["feedback", "bug", "feature", "sales"];
    const ticketType = validTypes.includes(type) ? type : "sales";

    const db = createServiceClient();
    const inboxEmail = ticketType === "sales"
      ? "sales@teamprompt.app"
      : "support@teamprompt.app";

    const { data: inserted, error: insertError } = await db.from("feedback").insert({
      user_id: null,
      org_id: null,
      type: ticketType,
      subject: safeName ? `[${safeName}] ${safeSubject}` : safeSubject,
      message: safeMessage,
      sender_email: email,
      sender_name: safeName || null,
      status: "new",
      priority: "normal",
      inbox_email: inboxEmail,
    }).select("id").single();

    if (insertError) {
      console.error("Lead form insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit your message. Please try again." }, { status: 500 });
    }

    if (inserted) {
      notifyAdminsOfNewTicket({
        subject: safeName ? `[${safeName}] ${safeSubject}` : safeSubject,
        senderEmail: email,
        type: ticketType,
        message: safeMessage,
        ticketId: inserted.id,
      });
      sendAutoAck({
        recipientEmail: email,
        recipientName: safeName || "there",
        ticketId: inserted.id,
        subject: safeName ? `[${safeName}] ${safeSubject}` : safeSubject,
        inboxEmail,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead form error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
