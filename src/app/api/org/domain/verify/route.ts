import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { promises as dns } from "node:dns";
import { createServiceClient } from "@/lib/supabase/server";
import { isBlockedAutoJoinDomain } from "@/lib/domain-blocklist";
import { emitAuditEvent } from "@/lib/audit-events";

// Domain verification for org auto-join.
//
// GET  → returns current verification state (token, instructions, verified)
// POST { action: "init" }  → generates a verification token and persists it
// POST { action: "check" } → does a DNS TXT lookup and marks verified on match

async function getAdminContext(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const token = authHeader.replace("Bearer ", "");
  const db = createServiceClient();
  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await db
    .from("profiles")
    .select("id, org_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return { error: NextResponse.json({ error: "No organization" }, { status: 400 }) };
  if (profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  const { data: org } = await db
    .from("organizations")
    .select("id, domain, domain_verified_at, domain_verification_token")
    .eq("id", profile.org_id)
    .single();
  if (!org) return { error: NextResponse.json({ error: "Org not found" }, { status: 404 }) };

  return { db, user, profile, org };
}

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if ("error" in ctx) return ctx.error;
  const { org } = ctx;
  return NextResponse.json({
    domain: org.domain,
    verified: !!org.domain_verified_at,
    verifiedAt: org.domain_verified_at,
    token: org.domain_verification_token,
    blocked: org.domain ? isBlockedAutoJoinDomain(org.domain) : false,
    instructions: org.domain_verification_token && org.domain
      ? {
          host: `_teamprompt-verify.${org.domain}`,
          type: "TXT",
          value: `tp-verify=${org.domain_verification_token}`,
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if ("error" in ctx) return ctx.error;
  const { db, user, org } = ctx;

  const body = await req.json().catch(() => ({}));
  const action = body.action;

  if (!org.domain) {
    return NextResponse.json({ error: "Set a domain on the organization first." }, { status: 400 });
  }
  if (isBlockedAutoJoinDomain(org.domain)) {
    return NextResponse.json(
      { error: `${org.domain} is a public webmail or disposable-email domain and can't be used for auto-join.` },
      { status: 400 },
    );
  }

  if (action === "init") {
    const token = randomBytes(18).toString("base64url");
    const { error } = await db
      .from("organizations")
      .update({
        domain_verification_token: token,
        // Reset verified state — a re-init means the admin wants to re-verify.
        domain_verified_at: null,
      })
      .eq("id", org.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      token,
      instructions: {
        host: `_teamprompt-verify.${org.domain}`,
        type: "TXT",
        value: `tp-verify=${token}`,
      },
    });
  }

  if (action === "check") {
    if (!org.domain_verification_token) {
      return NextResponse.json({ error: "Run init first to generate a token." }, { status: 400 });
    }
    const host = `_teamprompt-verify.${org.domain}`;
    let records: string[][] = [];
    try {
      records = await dns.resolveTxt(host);
    } catch (err) {
      const code = (err as { code?: string }).code;
      const msg =
        code === "ENOTFOUND" || code === "ENODATA"
          ? `No TXT record found at ${host}. DNS may take up to 24h to propagate.`
          : `DNS lookup failed: ${(err as Error).message}`;
      return NextResponse.json({ verified: false, error: msg }, { status: 400 });
    }

    const flat = records.map((r) => r.join("")).map((s) => s.trim());
    const expected = `tp-verify=${org.domain_verification_token}`;
    if (!flat.includes(expected)) {
      return NextResponse.json(
        {
          verified: false,
          error: `Expected TXT value not found. Add a TXT record at ${host} with value: ${expected}`,
          found: flat,
        },
        { status: 400 },
      );
    }

    const verifiedAt = new Date().toISOString();
    const { error } = await db
      .from("organizations")
      .update({ domain_verified_at: verifiedAt })
      .eq("id", org.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await emitAuditEvent({
      orgId: org.id,
      actorId: user.id,
      actorEmail: user.email ?? null,
      action: "auto_join_domain.verify",
      targetType: "organization",
      targetId: org.id,
      targetLabel: org.domain,
      metadata: { host, verifiedAt },
      request: req,
    });

    return NextResponse.json({ verified: true, verifiedAt });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
