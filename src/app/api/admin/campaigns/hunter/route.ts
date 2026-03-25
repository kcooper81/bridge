import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

const HUNTER_API_BASE = "https://api.hunter.io/v2";

function getHunterKey(): string | null {
  return process.env.HUNTER_API_KEY || null;
}

/**
 * POST — Search Hunter.io for emails at a company or find specific emails.
 *
 * Body:
 *   action: "domain_search" | "import_results"
 *
 *   For "domain_search":
 *     domain?: string (e.g. "stripe.com")
 *     company?: string (e.g. "Stripe")
 *     department?: string (executive, it, finance, sales, marketing, etc.)
 *     seniority?: string (junior, senior, executive)
 *     limit?: number (1-100, default 10)
 *     offset?: number
 *
 *   For "import_results":
 *     contacts: Array<{ email, first_name, last_name, company, position }>
 *     list_name?: string
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apiKey = getHunterKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Hunter.io API key not configured. Set HUNTER_API_KEY in environment variables." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { action } = body;

  if (action === "domain_search") {
    return handleDomainSearch(apiKey, body);
  }

  if (action === "import_results") {
    return handleImportResults(body, auth.userId);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/**
 * GET — Check Hunter.io API status and remaining credits.
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apiKey = getHunterKey();
  if (!apiKey) {
    return NextResponse.json({ configured: false });
  }

  try {
    const res = await fetch(
      `${HUNTER_API_BASE}/account?api_key=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ configured: true, valid: false, error: `Hunter API returned ${res.status}` });
    }

    const data = await res.json();
    const account = data.data || {};
    return NextResponse.json({
      configured: true,
      valid: true,
      email: account.email,
      plan: account.plan_name,
      credits_used: account.calls?.used || 0,
      credits_available: account.calls?.available || 0,
    });
  } catch {
    return NextResponse.json({ configured: true, valid: false, error: "Failed to reach Hunter API" });
  }
}

// ─── Domain Search ───

async function handleDomainSearch(apiKey: string, body: Record<string, unknown>) {
  const { domain, company, department, seniority, limit = 10, offset = 0 } = body;

  if (!domain && !company) {
    return NextResponse.json({ error: "Either 'domain' or 'company' is required" }, { status: 400 });
  }

  const params = new URLSearchParams({ api_key: apiKey });
  if (domain) params.set("domain", String(domain));
  if (company) params.set("company", String(company));
  if (department) params.set("department", String(department));
  if (seniority) params.set("seniority", String(seniority));
  params.set("limit", String(Math.min(Number(limit), 100)));
  params.set("offset", String(Number(offset) || 0));

  try {
    const res = await fetch(`${HUNTER_API_BASE}/domain-search?${params}`);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.errors?.[0]?.details || `Hunter search failed (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const result = data.data || {};

    const emails = (result.emails || []).map((e: Record<string, unknown>) => ({
      email: e.value || "",
      type: e.type || "",
      confidence: e.confidence || 0,
      first_name: e.first_name || "",
      last_name: e.last_name || "",
      position: e.position || "",
      seniority: e.seniority || "",
      department: e.department || "",
      linkedin: e.linkedin || "",
      verified: (e.verification as Record<string, unknown>)?.status === "valid",
    }));

    return NextResponse.json({
      domain: result.domain || domain,
      company: result.organization || company,
      total_results: result.results || 0,
      emails,
      meta: data.meta || {},
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach Hunter API" }, { status: 502 });
  }
}

// ─── Import Results to Campaign Contacts ───

async function handleImportResults(body: Record<string, unknown>, userId: string) {
  const { contacts, list_name } = body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: "contacts array required" }, { status: 400 });
  }

  const valid = contacts
    .filter((c: Record<string, unknown>) => c.email && typeof c.email === "string")
    .map((c: Record<string, unknown>) => ({
      email: (c.email as string).toLowerCase(),
      first_name: String(c.first_name || ""),
      last_name: String(c.last_name || ""),
      company: String(c.company || ""),
    }));

  if (valid.length === 0) {
    return NextResponse.json({ error: "No valid contacts" }, { status: 400 });
  }

  const db = createServiceClient();

  const { error: upsertError } = await db
    .from("campaign_contacts")
    .upsert(
      valid.map((c) => ({
        ...c,
        source: "api" as const,
        imported_by: userId,
      })),
      { onConflict: "email" }
    );

  if (upsertError) {
    console.error("Hunter import error:", upsertError);
    return NextResponse.json({ error: "Failed to save contacts" }, { status: 500 });
  }

  let listId: string | null = null;
  if (typeof list_name === "string" && list_name.trim()) {
    const trimmedName = list_name.trim();

    const { data: existingList } = await db
      .from("audience_lists")
      .select("id")
      .eq("name", trimmedName)
      .maybeSingle();

    if (existingList) {
      listId = existingList.id;
    } else {
      const { data: newList } = await db
        .from("audience_lists")
        .insert({
          name: trimmedName,
          description: `Hunter.io import — ${new Date().toLocaleDateString()}`,
          created_by: userId,
        })
        .select("id")
        .single();
      if (newList) listId = newList.id;
    }

    if (listId) {
      const emails = valid.map((c) => c.email);
      const { data: contactRows } = await db
        .from("campaign_contacts")
        .select("id")
        .in("email", emails);

      if (contactRows && contactRows.length > 0) {
        await db
          .from("audience_list_contacts")
          .upsert(
            contactRows.map((c) => ({ list_id: listId!, contact_id: c.id })),
            { onConflict: "list_id,contact_id" }
          );

        const { count } = await db
          .from("audience_list_contacts")
          .select("*", { count: "exact", head: true })
          .eq("list_id", listId);

        await db
          .from("audience_lists")
          .update({ contact_count: count || 0, updated_at: new Date().toISOString() })
          .eq("id", listId);
      }
    }
  }

  return NextResponse.json({
    imported: valid.length,
    list_id: listId,
  });
}
