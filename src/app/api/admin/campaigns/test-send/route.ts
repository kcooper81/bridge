import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { Resend } from "resend";

/** POST — send a test email for a campaign draft */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
  }

  const { to, subject, html, from } = await request.json();

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: from || "TeamPrompt <hello@teamprompt.app>",
      to,
      subject: `[TEST] ${subject}`,
      html,
    });

    if (error) {
      console.error("Test send failed:", error);
      return NextResponse.json({ error: error.message || "Failed to send test email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Test send error:", err);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
