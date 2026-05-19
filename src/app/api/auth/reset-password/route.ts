import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/reset-password
 *
 * Update the caller's password — but ONLY when the current session was
 * minted via a password-recovery token (i.e. the user clicked an email
 * recovery link and the session's `amr` reflects that). Without this
 * server-side check, any authenticated user landing on /reset-password
 * could update their own password through the bare client-side
 * `supabase.auth.updateUser({ password })` call (which doesn't validate
 * how the session was obtained). That made the recovery-event check on
 * the page presentational only — closed in this handler.
 *
 * Returns 401 if not signed in, 403 if the session isn't a recovery
 * session (or is too old), 400 on weak password, 200 on success.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Session must have been obtained via a recovery flow. Supabase represents
  // this in the JWT's `amr` (Authentication Method References) claim. The
  // claim is an array like [{ method: "recovery", timestamp: 1717... }];
  // we accept the session only if the most-recent recovery entry is within
  // the last 10 minutes (Supabase's default recovery-token lifetime).
  const amr = (user as { amr?: Array<{ method: string; timestamp: number }> }).amr ?? [];
  const recovery = amr.find((entry) => entry.method === "recovery");
  if (!recovery) {
    return NextResponse.json(
      { error: "This session is not a password-recovery session." },
      { status: 403 },
    );
  }
  const ageSec = Date.now() / 1000 - recovery.timestamp;
  if (ageSec > 10 * 60) {
    return NextResponse.json(
      { error: "Recovery session has expired. Request a new reset link." },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  const password = body.password;
  if (typeof password !== "string" || password.length < 10) {
    return NextResponse.json(
      { error: "Password must be at least 10 characters." },
      { status: 400 },
    );
  }

  // Update via service-role admin API so we don't rely on the client
  // session for the write either — service role has audit guarantees.
  const admin = createServiceClient();
  const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, { password });
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // After password change, sign all other sessions out for safety.
  await admin.auth.admin.signOut(user.id, "others");

  return NextResponse.json({ success: true });
}
