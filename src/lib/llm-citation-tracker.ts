// Server-only helper for measuring whether TeamPrompt appears in
// LLM-generated answers (Perplexity, OpenAI, Anthropic, Gemini) for our
// top target queries. Run by the weekly seo-digest cron; results stored
// in llm_citation_checks and surfaced in the Monday digest.
//
// Provider selection:
// - Perplexity is the priority — explicitly returns structured citations,
//   so we get exact URL match without parsing model output for mentions.
// - OpenAI (gpt-4o-search-preview / responses with web_search tool) is
//   second priority. We parse `search_results` if returned, else scan the
//   answer text for "teamprompt.app".
// - Anthropic web search tool is most expensive — left as an extension
//   point.
//
// API keys come from env (PERPLEXITY_API_KEY, OPENAI_API_KEY) since this
// is platform-level SEO instrumentation, not per-tenant feature.

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_KEY = process.env.OPENAI_SEO_KEY || process.env.OPENAI_API_KEY;
const SITE_HOST = "teamprompt.app";

export interface CitationResult {
  query: string;
  provider: "perplexity" | "openai" | "anthropic" | "gemini";
  cited: boolean;
  citationUrl: string | null;
  citationRank: number | null;
  mentionedInAnswer: boolean;
  answerSnippet: string;
  sourceUrls: string[];
  error?: string;
}

// ─── Provider: Perplexity ───

interface PerplexityCitation {
  url?: string;
  title?: string;
}

async function checkPerplexity(query: string): Promise<CitationResult> {
  const base: Omit<CitationResult, "cited" | "mentionedInAnswer" | "answerSnippet" | "sourceUrls" | "citationUrl" | "citationRank"> = {
    query,
    provider: "perplexity",
  };

  if (!PERPLEXITY_KEY) {
    return {
      ...base,
      cited: false,
      citationUrl: null,
      citationRank: null,
      mentionedInAnswer: false,
      answerSnippet: "",
      sourceUrls: [],
      error: "PERPLEXITY_API_KEY not configured",
    };
  }

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [{ role: "user", content: query }],
        return_citations: true,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return {
        ...base,
        cited: false,
        citationUrl: null,
        citationRank: null,
        mentionedInAnswer: false,
        answerSnippet: "",
        sourceUrls: [],
        error: `Perplexity HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      citations?: (string | PerplexityCitation)[];
    };

    const answer = data.choices?.[0]?.message?.content || "";
    const citations = (data.citations || []).map((c) =>
      typeof c === "string" ? c : c.url || "",
    ).filter(Boolean);

    let citationRank: number | null = null;
    let citationUrl: string | null = null;
    citations.forEach((url, i) => {
      if (citationRank == null && url.includes(SITE_HOST)) {
        citationRank = i + 1;
        citationUrl = url;
      }
    });

    return {
      ...base,
      cited: citationRank !== null,
      citationUrl,
      citationRank,
      mentionedInAnswer: answer.toLowerCase().includes("teamprompt"),
      answerSnippet: answer.slice(0, 400),
      sourceUrls: citations,
    };
  } catch (err) {
    return {
      ...base,
      cited: false,
      citationUrl: null,
      citationRank: null,
      mentionedInAnswer: false,
      answerSnippet: "",
      sourceUrls: [],
      error: (err as Error).message,
    };
  }
}

// ─── Provider: OpenAI (gpt-4o with web_search tool) ───

async function checkOpenAI(query: string): Promise<CitationResult> {
  const base: Omit<CitationResult, "cited" | "mentionedInAnswer" | "answerSnippet" | "sourceUrls" | "citationUrl" | "citationRank"> = {
    query,
    provider: "openai",
  };

  if (!OPENAI_KEY) {
    return {
      ...base,
      cited: false,
      citationUrl: null,
      citationRank: null,
      mentionedInAnswer: false,
      answerSnippet: "",
      sourceUrls: [],
      error: "OPENAI_SEO_KEY not configured",
    };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: query,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!res.ok) {
      return {
        ...base,
        cited: false,
        citationUrl: null,
        citationRank: null,
        mentionedInAnswer: false,
        answerSnippet: "",
        sourceUrls: [],
        error: `OpenAI HTTP ${res.status}`,
      };
    }

    const data = (await res.json()) as Record<string, unknown>;

    // Extract answer text — Responses API returns an `output` array.
    let answerText = "";
    const output = (data.output as unknown[]) || [];
    for (const item of output) {
      const i = item as Record<string, unknown>;
      if (i.type === "message") {
        const content = (i.content as unknown[]) || [];
        for (const c of content) {
          const cc = c as Record<string, unknown>;
          if (cc.type === "output_text" && typeof cc.text === "string") {
            answerText += cc.text;
          }
        }
      }
    }

    // Extract URLs cited via annotations.
    const sourceUrls: string[] = [];
    for (const item of output) {
      const i = item as Record<string, unknown>;
      const content = (i.content as unknown[]) || [];
      for (const c of content) {
        const cc = c as Record<string, unknown>;
        const annotations = (cc.annotations as Array<Record<string, unknown>>) || [];
        for (const a of annotations) {
          const url = typeof a.url === "string" ? a.url : null;
          if (url && !sourceUrls.includes(url)) sourceUrls.push(url);
        }
      }
    }

    let citationRank: number | null = null;
    let citationUrl: string | null = null;
    sourceUrls.forEach((url, i) => {
      if (citationRank == null && url.includes(SITE_HOST)) {
        citationRank = i + 1;
        citationUrl = url;
      }
    });

    return {
      ...base,
      cited: citationRank !== null,
      citationUrl,
      citationRank,
      mentionedInAnswer: answerText.toLowerCase().includes("teamprompt"),
      answerSnippet: answerText.slice(0, 400),
      sourceUrls,
    };
  } catch (err) {
    return {
      ...base,
      cited: false,
      citationUrl: null,
      citationRank: null,
      mentionedInAnswer: false,
      answerSnippet: "",
      sourceUrls: [],
      error: (err as Error).message,
    };
  }
}

// ─── Public API ───

/** Default query list — the AIO targets we care about most. */
export const DEFAULT_TRACKED_QUERIES = [
  "what is prompt DLP",
  "best AI data loss prevention tool",
  "how to prevent data leaks to ChatGPT",
  "shadow AI detection",
  "ChatGPT enterprise audit logs",
  "HIPAA compliance for AI tools",
  "prompt injection defense OWASP",
  "team prompt library software",
  "SOC 2 compliance AI",
  "AI governance framework",
  "Nightfall alternative",
  "Microsoft Purview alternative for AI",
];

export async function runCitationChecks(
  queries: string[] = DEFAULT_TRACKED_QUERIES,
): Promise<CitationResult[]> {
  const results: CitationResult[] = [];

  // Run one provider at a time per query to stay inside rate limits.
  for (const query of queries) {
    const [perplexity, openai] = await Promise.all([
      checkPerplexity(query),
      checkOpenAI(query),
    ]);
    results.push(perplexity, openai);
  }

  await persistResults(results);
  return results;
}

async function persistResults(results: CitationResult[]) {
  if (results.length === 0) return;
  const db = createServiceClient();
  const rows = results.map((r) => ({
    query: r.query,
    provider: r.provider,
    cited: r.cited,
    citation_url: r.citationUrl,
    citation_rank: r.citationRank,
    mentioned_in_answer: r.mentionedInAnswer,
    answer_snippet: r.answerSnippet,
    source_urls: r.sourceUrls,
    error: r.error || null,
    checked_at: new Date().toISOString(),
  }));
  const { error } = await db.from("llm_citation_checks").insert(rows);
  if (error) {
    console.error("[llm-citation-tracker] persist failed", error);
  }
}

export async function getLatestResults(): Promise<CitationResult[]> {
  const db = createServiceClient();
  // Latest check per (query, provider).
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("llm_citation_checks")
    .select("query, provider, cited, citation_url, citation_rank, mentioned_in_answer, answer_snippet, source_urls, error, checked_at")
    .gte("checked_at", since)
    .order("checked_at", { ascending: false });
  if (!data) return [];
  type Row = {
    query: string;
    provider: string;
    cited: boolean;
    citation_url: string | null;
    citation_rank: number | null;
    mentioned_in_answer: boolean;
    answer_snippet: string;
    source_urls: string[];
    error: string | null;
    checked_at: string;
  };
  const seen = new Set<string>();
  const out: CitationResult[] = [];
  for (const r of data as Row[]) {
    const key = `${r.query}::${r.provider}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      query: r.query,
      provider: r.provider as CitationResult["provider"],
      cited: r.cited,
      citationUrl: r.citation_url,
      citationRank: r.citation_rank,
      mentionedInAnswer: r.mentioned_in_answer,
      answerSnippet: r.answer_snippet,
      sourceUrls: r.source_urls,
      error: r.error || undefined,
    });
  }
  return out;
}
