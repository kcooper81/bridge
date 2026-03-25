import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

const PDL_API_BASE = "https://api.peopledatalabs.com/v5";
const HUNTER_API_BASE = "https://api.hunter.io/v2";

function getPdlKey(): string | null {
  return process.env.PDL_API_KEY || null;
}

function getHunterKey(): string | null {
  return process.env.HUNTER_API_KEY || null;
}

/**
 * POST — Search PDL for prospects matching ICP, optionally enrich via Hunter.io
 *
 * Body:
 *   action: "search" | "enrich_and_import"
 *
 *   For "search":
 *     job_title_role?: string (e.g. "information technology")
 *     job_title_levels?: string[] (e.g. ["director", "vp", "c_suite"])
 *     job_title?: string (free-text title search)
 *     location_country?: string
 *     location_region?: string
 *     company_size_min?: number
 *     company_size_max?: number
 *     industry?: string
 *     size?: number (1-100, default 10)
 *     scroll_token?: string (for pagination)
 *
 *   For "enrich_and_import":
 *     prospects: Array<{ first_name, last_name, company_domain, company_name }>
 *     list_name?: string
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pdlKey = getPdlKey();
  if (!pdlKey) {
    return NextResponse.json(
      { error: "PDL API key not configured. Set PDL_API_KEY in environment variables." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { action } = body;

  if (action === "search") {
    return handleSearch(pdlKey, body);
  }

  if (action === "enrich_and_import") {
    return handleEnrichAndImport(body, auth.userId);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/**
 * GET — Check PDL + Hunter status
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pdlKey = getPdlKey();
  const hunterKey = getHunterKey();

  const result: Record<string, unknown> = {
    pdl_configured: !!pdlKey,
    hunter_configured: !!hunterKey,
  };

  // Verify PDL key
  if (pdlKey) {
    try {
      const res = await fetch(`${PDL_API_BASE}/person/search`, {
        method: "POST",
        headers: { "X-Api-Key": pdlKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          size: 1,
          query: { bool: { must: [{ term: { job_title_levels: "director" } }] } },
        }),
      });
      result.pdl_valid = res.ok;
      if (res.ok) {
        const data = await res.json();
        result.pdl_total_available = data.total || 0;
      }
    } catch {
      result.pdl_valid = false;
    }
  }

  return NextResponse.json(result);
}

// ─── PDL Person Search ───

async function handleSearch(apiKey: string, body: Record<string, unknown>) {
  const {
    job_title_role,
    job_title_levels,
    job_title,
    location_country,
    location_region,
    company_size_min,
    company_size_max,
    industry,
    size = 10,
    scroll_token,
  } = body;

  // Build Elasticsearch DSL query
  const must: Record<string, unknown>[] = [];

  if (job_title_role && typeof job_title_role === "string") {
    must.push({ term: { job_title_role: job_title_role.toLowerCase() } });
  }

  if (Array.isArray(job_title_levels) && job_title_levels.length > 0) {
    // Use "terms" (OR) for seniority levels — person matches ANY of the selected levels
    must.push({ terms: { job_title_levels: job_title_levels.map((level) => String(level).toLowerCase()) } });
  }

  if (job_title && typeof job_title === "string") {
    must.push({ match: { job_title: job_title } });
  }

  if (location_country && typeof location_country === "string") {
    must.push({ term: { location_country: location_country.toLowerCase() } });
  }

  if (location_region && typeof location_region === "string") {
    must.push({ term: { location_region: location_region.toLowerCase() } });
  }

  if (company_size_min || company_size_max) {
    const range: Record<string, number> = {};
    if (company_size_min) range.gte = Number(company_size_min);
    if (company_size_max) range.lte = Number(company_size_max);
    must.push({ range: { job_company_employee_count: range } });
  }

  if (industry && typeof industry === "string") {
    must.push({ term: { job_company_industry: industry.toLowerCase() } });
  }

  if (must.length === 0) {
    return NextResponse.json({ error: "At least one search filter is required" }, { status: 400 });
  }

  const searchBody: Record<string, unknown> = {
    size: Math.min(Number(size), 100),
    query: { bool: { must } },
  };

  if (scroll_token && typeof scroll_token === "string") {
    searchBody.scroll_token = scroll_token;
  }

  try {
    console.log("PDL search query:", JSON.stringify(searchBody, null, 2));
    const res = await fetch(`${PDL_API_BASE}/person/search`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("PDL search error:", res.status, errText);
      let errMsg = `PDL search failed (${res.status})`;
      try {
        const errData = JSON.parse(errText);
        errMsg = errData.error?.message || errData.message || errData.error?.type || errMsg;
      } catch { /* not JSON */ }
      return NextResponse.json(
        { error: errMsg, debug: { query: searchBody } },
        { status: res.status }
      );
    }

    const data = await res.json();

    const people = (data.data || []).map((p: Record<string, unknown>) => ({
      id: p.id || "",
      full_name: p.full_name || "",
      first_name: p.first_name || "",
      last_name: p.last_name || "",
      job_title: p.job_title || "",
      job_title_role: p.job_title_role || "",
      job_title_levels: p.job_title_levels || [],
      company_name: p.job_company_name || "",
      company_domain: p.job_company_website || "",
      company_size: p.job_company_size || "",
      company_industry: p.job_company_industry || "",
      company_employee_count: p.job_company_employee_count || null,
      location_country: p.location_country || "",
      location_region: p.location_region || "",
      location_locality: p.location_locality || "",
      linkedin_url: p.linkedin_url || "",
      has_email: p.emails === true || (Array.isArray(p.emails) && p.emails.length > 0),
    }));

    return NextResponse.json({
      people,
      total: data.total || 0,
      scroll_token: data.scroll_token || null,
      credits_used: people.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach PDL API" }, { status: 502 });
  }
}

// ─── Enrich via Hunter + Import ───

async function handleEnrichAndImport(body: Record<string, unknown>, userId: string) {
  const { prospects, list_name } = body;
  const hunterKey = getHunterKey();

  if (!Array.isArray(prospects) || prospects.length === 0) {
    return NextResponse.json({ error: "prospects array required" }, { status: 400 });
  }

  if (prospects.length > 50) {
    return NextResponse.json({ error: "Maximum 50 prospects per batch" }, { status: 400 });
  }

  const enriched: Array<{
    email: string;
    first_name: string;
    last_name: string;
    company: string;
    title: string;
    confidence: number;
  }> = [];
  const failed: string[] = [];

  if (!hunterKey) {
    // No Hunter key — import without emails (just names/companies)
    for (const p of prospects as Array<Record<string, string>>) {
      failed.push(`${p.first_name} ${p.last_name} (no Hunter.io key for email lookup)`);
    }
    return NextResponse.json({
      imported: 0,
      failed: failed.length,
      failed_names: failed,
      error: "HUNTER_API_KEY not configured — cannot enrich emails. Add it to enable email lookup.",
    });
  }

  // Enrich each prospect via Hunter Email Finder
  for (const p of prospects as Array<Record<string, string>>) {
    const domain = p.company_domain?.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!domain && !p.company_name) {
      failed.push(`${p.first_name} ${p.last_name} (no domain)`);
      continue;
    }

    try {
      const params = new URLSearchParams({ api_key: hunterKey });
      if (domain) params.set("domain", domain);
      else params.set("company", p.company_name);
      params.set("first_name", p.first_name);
      params.set("last_name", p.last_name);

      const res = await fetch(`${HUNTER_API_BASE}/email-finder?${params}`);
      if (res.ok) {
        const data = await res.json();
        const found = data.data;
        if (found?.email) {
          enriched.push({
            email: found.email,
            first_name: p.first_name || found.first_name || "",
            last_name: p.last_name || found.last_name || "",
            company: p.company_name || "",
            title: p.job_title || found.position || "",
            confidence: found.score || 0,
          });
        } else {
          failed.push(`${p.first_name} ${p.last_name}`);
        }
      } else {
        failed.push(`${p.first_name} ${p.last_name}`);
      }
    } catch {
      failed.push(`${p.first_name} ${p.last_name}`);
    }

    // Rate limit: Hunter allows 15 req/sec, but be conservative
    await new Promise((r) => setTimeout(r, 200));
  }

  if (enriched.length === 0) {
    return NextResponse.json({
      imported: 0,
      failed: failed.length,
      failed_names: failed,
      error: "Could not find emails for any prospects",
    });
  }

  // Save to campaign_contacts
  const db = createServiceClient();

  const { error: upsertError } = await db
    .from("campaign_contacts")
    .upsert(
      enriched.map((c) => ({
        email: c.email.toLowerCase(),
        first_name: c.first_name,
        last_name: c.last_name,
        company: c.company,
        source: "api" as const,
        imported_by: userId,
      })),
      { onConflict: "email" }
    );

  if (upsertError) {
    console.error("PDL+Hunter import error:", upsertError);
    return NextResponse.json({ error: "Failed to save contacts" }, { status: 500 });
  }

  // Add to audience list
  let listId: string | null = null;
  if (typeof list_name === "string" && list_name.trim()) {
    const trimmedName = list_name.trim();
    const { data: existingList } = await db
      .from("audience_lists").select("id").eq("name", trimmedName).maybeSingle();

    if (existingList) {
      listId = existingList.id;
    } else {
      const { data: newList } = await db
        .from("audience_lists")
        .insert({ name: trimmedName, description: `PDL + Hunter.io import — ${new Date().toLocaleDateString()}`, created_by: userId })
        .select("id").single();
      if (newList) listId = newList.id;
    }

    if (listId) {
      const emails = enriched.map((c) => c.email.toLowerCase());
      const { data: contactRows } = await db.from("campaign_contacts").select("id").in("email", emails);

      if (contactRows && contactRows.length > 0) {
        await db.from("audience_list_contacts").upsert(
          contactRows.map((c) => ({ list_id: listId!, contact_id: c.id })),
          { onConflict: "list_id,contact_id" }
        );
        const { count } = await db.from("audience_list_contacts").select("*", { count: "exact", head: true }).eq("list_id", listId);
        await db.from("audience_lists").update({ contact_count: count || 0, updated_at: new Date().toISOString() }).eq("id", listId);
      }
    }
  }

  return NextResponse.json({
    imported: enriched.length,
    failed: failed.length,
    failed_names: failed,
    list_id: listId,
    contacts: enriched,
  });
}
