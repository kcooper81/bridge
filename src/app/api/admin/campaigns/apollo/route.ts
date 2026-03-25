import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

const APOLLO_API_BASE = "https://api.apollo.io/api/v1";

function getApolloKey(): string | null {
  return process.env.APOLLO_API_KEY || null;
}

/**
 * POST — Search Apollo for prospects or enrich+import them.
 *
 * Body:
 *   action: "search" | "enrich_and_import"
 *
 *   For "search":
 *     person_titles?: string[]
 *     person_seniorities?: string[]
 *     person_locations?: string[]
 *     organization_num_employees_ranges?: string[]
 *     q_keywords?: string
 *     per_page?: number (1-100)
 *     page?: number
 *
 *   For "enrich_and_import":
 *     prospects: Array<{ id: string; first_name: string; last_name: string; organization_name: string }>
 *     list_name?: string — audience list to add contacts to
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apiKey = getApolloKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Apollo API key not configured. Set APOLLO_API_KEY in environment variables." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { action } = body;

  if (action === "search") {
    return handleSearch(apiKey, body);
  }

  if (action === "enrich_and_import") {
    return handleEnrichAndImport(apiKey, body, auth.userId);
  }

  return NextResponse.json({ error: "Invalid action. Use 'search' or 'enrich_and_import'" }, { status: 400 });
}

/**
 * GET — Check Apollo API status and credit balance.
 */
export async function GET() {
  const auth = await verifyAdminAccess();
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apiKey = getApolloKey();
  if (!apiKey) {
    return NextResponse.json({ configured: false });
  }

  try {
    // Apollo doesn't have a dedicated credits endpoint on free tier,
    // so we do a minimal search to verify the key works
    const res = await fetch(`${APOLLO_API_BASE}/mixed_people/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ per_page: 1, page: 1, person_titles: ["CEO"] }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json({
        configured: true,
        valid: false,
        error: errData.message || `Apollo API returned ${res.status}`,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      configured: true,
      valid: true,
      total_results: data.pagination?.total_entries || 0,
    });
  } catch {
    return NextResponse.json({ configured: true, valid: false, error: "Failed to reach Apollo API" });
  }
}

// ─── Search (free, no credits) ───

async function handleSearch(apiKey: string, body: Record<string, unknown>) {
  const {
    person_titles,
    person_seniorities,
    person_locations,
    organization_locations,
    organization_num_employees_ranges,
    q_keywords,
    per_page = 25,
    page = 1,
  } = body;

  const searchBody: Record<string, unknown> = {
    per_page: Math.min(Number(per_page), 100),
    page: Number(page),
  };

  if (Array.isArray(person_titles) && person_titles.length > 0) {
    searchBody.person_titles = person_titles;
  }
  if (Array.isArray(person_seniorities) && person_seniorities.length > 0) {
    searchBody.person_seniorities = person_seniorities;
  }
  if (Array.isArray(person_locations) && person_locations.length > 0) {
    searchBody.person_locations = person_locations;
  }
  if (Array.isArray(organization_locations) && organization_locations.length > 0) {
    searchBody.organization_locations = organization_locations;
  }
  if (Array.isArray(organization_num_employees_ranges) && organization_num_employees_ranges.length > 0) {
    searchBody.organization_num_employees_ranges = organization_num_employees_ranges;
  }
  if (q_keywords && typeof q_keywords === "string") {
    searchBody.q_keywords = q_keywords;
  }

  try {
    const res = await fetch(`${APOLLO_API_BASE}/mixed_people/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(searchBody),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || `Apollo search failed (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Map to a clean response (search doesn't return emails)
    const people = (data.people || []).map((p: Record<string, unknown>) => ({
      apollo_id: p.id,
      first_name: p.first_name || "",
      last_name: p.last_name || "",
      title: p.title || "",
      headline: p.headline || "",
      seniority: p.seniority || "",
      city: p.city || "",
      state: p.state || "",
      country: p.country || "",
      linkedin_url: p.linkedin_url || "",
      photo_url: p.photo_url || "",
      organization_name: (p.organization as Record<string, unknown>)?.name || "",
      organization_website: (p.organization as Record<string, unknown>)?.website_url || "",
      organization_industry: (p.organization as Record<string, unknown>)?.industry || "",
      organization_size: (p.organization as Record<string, unknown>)?.estimated_num_employees || null,
    }));

    return NextResponse.json({
      people,
      pagination: {
        page: data.pagination?.page || 1,
        per_page: data.pagination?.per_page || 25,
        total_entries: data.pagination?.total_entries || 0,
        total_pages: data.pagination?.total_pages || 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach Apollo API" }, { status: 502 });
  }
}

// ─── Enrich + Import (costs credits) ───

async function handleEnrichAndImport(
  apiKey: string,
  body: Record<string, unknown>,
  userId: string
) {
  const { prospects, list_name } = body;

  if (!Array.isArray(prospects) || prospects.length === 0) {
    return NextResponse.json({ error: "prospects array required" }, { status: 400 });
  }

  if (prospects.length > 100) {
    return NextResponse.json({ error: "Maximum 100 prospects per batch" }, { status: 400 });
  }

  const enriched: Array<{
    email: string;
    first_name: string;
    last_name: string;
    company: string;
    title: string;
  }> = [];
  const failed: string[] = [];

  // Enrich in batches of 10 (Apollo bulk_match limit)
  const batchSize = 10;
  for (let i = 0; i < prospects.length; i += batchSize) {
    const batch = prospects.slice(i, i + batchSize) as Array<{
      id?: string;
      first_name: string;
      last_name: string;
      organization_name: string;
      linkedin_url?: string;
    }>;

    try {
      const res = await fetch(`${APOLLO_API_BASE}/people/bulk_match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          details: batch.map((p) => ({
            first_name: p.first_name,
            last_name: p.last_name,
            organization_name: p.organization_name,
            ...(p.linkedin_url ? { linkedin_url: p.linkedin_url } : {}),
          })),
        }),
      });

      if (!res.ok) {
        // If bulk fails, try individual enrichment
        for (const p of batch) {
          try {
            const singleRes = await fetch(`${APOLLO_API_BASE}/people/match`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "x-api-key": apiKey,
              },
              body: JSON.stringify({
                first_name: p.first_name,
                last_name: p.last_name,
                organization_name: p.organization_name,
                ...(p.linkedin_url ? { linkedin_url: p.linkedin_url } : {}),
              }),
            });

            if (singleRes.ok) {
              const singleData = await singleRes.json();
              const person = singleData.person;
              if (person?.email) {
                enriched.push({
                  email: person.email,
                  first_name: person.first_name || p.first_name,
                  last_name: person.last_name || p.last_name,
                  company: person.organization?.name || p.organization_name,
                  title: person.title || "",
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
        }
        continue;
      }

      const data = await res.json();
      const matches = data.matches || [];

      for (let j = 0; j < batch.length; j++) {
        const person = matches[j];
        if (person?.email) {
          enriched.push({
            email: person.email,
            first_name: person.first_name || batch[j].first_name,
            last_name: person.last_name || batch[j].last_name,
            company: person.organization?.name || batch[j].organization_name,
            title: person.title || "",
          });
        } else {
          failed.push(`${batch[j].first_name} ${batch[j].last_name}`);
        }
      }
    } catch {
      for (const p of batch) {
        failed.push(`${p.first_name} ${p.last_name}`);
      }
    }
  }

  if (enriched.length === 0) {
    return NextResponse.json({
      imported: 0,
      failed: failed.length,
      failed_names: failed,
      error: "No emails found for any prospects",
    });
  }

  // Import into campaign_contacts
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
    console.error("Apollo import upsert error:", upsertError);
    return NextResponse.json({ error: "Failed to save contacts" }, { status: 500 });
  }

  // Optionally add to audience list
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
          description: `Apollo.io import — ${new Date().toLocaleDateString()}`,
          created_by: userId,
        })
        .select("id")
        .single();
      if (newList) listId = newList.id;
    }

    if (listId) {
      const emails = enriched.map((c) => c.email.toLowerCase());
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
    imported: enriched.length,
    failed: failed.length,
    failed_names: failed,
    list_id: listId,
    contacts: enriched,
  });
}
