import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const CODE_COUNT = 10;

function hashCode(code: string): string {
  return createHash("sha256").update(code.toUpperCase().replace(/-/g, "")).digest("hex");
}

function generateCode(): string {
  // 10 chars, base32-friendly alphabet (no 0/O/1/I), formatted XXXXX-XXXXX
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const raw = Array.from(randomBytes(10))
    .map((b) => alphabet[b % alphabet.length])
    .join("");
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

async function authedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/** GET — return whether the user has recovery codes (boolean only) */
export async function GET() {
  const user = await authedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServiceClient();
  const { count } = await db
    .from("mfa_recovery_codes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("used_at", null);
  return NextResponse.json({ remaining: count ?? 0 });
}

/** POST — generate a fresh set of 10 codes (invalidates the old set) */
export async function POST() {
  const user = await authedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = createServiceClient();

  // Wipe previous codes
  await db.from("mfa_recovery_codes").delete().eq("user_id", user.id);

  const codes = Array.from({ length: CODE_COUNT }, generateCode);
  const rows = codes.map((c) => ({ user_id: user.id, code_hash: hashCode(c) }));
  const { error } = await db.from("mfa_recovery_codes").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return the codes ONCE so the user can save them. We never return them again.
  return NextResponse.json({ codes });
}

/** PUT — verify (and consume) a recovery code in place of TOTP */
export async function PUT(req: NextRequest) {
  const user = await authedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const submitted = typeof body.code === "string" ? body.code : "";
  if (!submitted) return NextResponse.json({ error: "code required" }, { status: 400 });

  const hash = hashCode(submitted);
  const db = createServiceClient();
  const { data: match } = await db
    .from("mfa_recovery_codes")
    .select("id")
    .eq("user_id", user.id)
    .eq("code_hash", hash)
    .is("used_at", null)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ valid: false, error: "Invalid or already-used code" }, { status: 400 });
  }

  await db
    .from("mfa_recovery_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", match.id);

  return NextResponse.json({ valid: true });
}
