// Server-only: compute and look up content embeddings for AI-driven
// internal linking. The weekly cron rebuilds any stale embeddings;
// renderers query getRelatedBySimilarity(slug) to populate the
// "Related from the blog" section on blog/[slug] and /solutions/[slug].

import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { BLOG_POSTS, type BlogPost } from "@/lib/blog-posts";
import { allSeoPages, INDEXED_SOLUTION_SLUGS, isIndexableSolution } from "@/lib/seo-pages/data";

const OPENAI_KEY = process.env.OPENAI_SEO_KEY || process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-3-small";

export type ContentKind = "blog" | "solutions" | "security" | "tool" | "about";

export interface EmbeddingRow {
  slug: string;
  kind: ContentKind;
  title: string;
  description: string | null;
  embedding: number[];
  source_hash: string;
  computed_at: string;
}

interface IndexableItem {
  slug: string;
  kind: ContentKind;
  title: string;
  description: string;
  sourceText: string;
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

// ─── Build the indexable corpus ───

function blogToItem(p: BlogPost): IndexableItem {
  // Use title + description + tldr + first ~1000 chars of content for the
  // embedding. We want enough signal for similarity but not so much that
  // every blog clusters with every other.
  const text = [
    p.title,
    p.description,
    p.tldr || "",
    (p.faqs || []).map((f) => `${f.q} ${f.a}`).join(" "),
    p.content.slice(0, 1000),
  ].join("\n");
  return {
    slug: p.slug,
    kind: "blog",
    title: p.title,
    description: p.description,
    sourceText: text,
  };
}

export async function buildCorpus(): Promise<IndexableItem[]> {
  const items: IndexableItem[] = [];

  // Blog posts
  for (const p of BLOG_POSTS) items.push(blogToItem(p));

  // Indexable /solutions/* pages
  for (const p of allSeoPages) {
    if (!isIndexableSolution(p.slug)) continue;
    const faqText = (p.faqs || []).map((f) => `${f.question} ${f.answer}`).join(" ");
    const text = [p.hero.headline, p.hero.subtitle, p.meta.description, faqText].join("\n");
    items.push({
      slug: p.slug,
      kind: "solutions",
      title: p.hero.headline,
      description: p.meta.description,
      sourceText: text,
    });
  }

  // Fixed entries for the OWASP hub and the free tool — they're not in
  // either of the dynamic sources but are key linking targets.
  items.push({
    slug: "owasp-llm-top-10",
    kind: "security",
    title: "OWASP LLM Top 10 (2025) — operational guide",
    description:
      "How to detect, block, and log each of the OWASP LLM Top 10 risks in a real chat workflow. Beyond definitions.",
    sourceText:
      "OWASP LLM Top 10 operational guide for production AI systems. Detect block log compliance mappings prompt injection sensitive information disclosure supply chain data and model poisoning improper output handling excessive agency system prompt leakage vector embedding weaknesses misinformation unbounded consumption.",
  });
  items.push({
    slug: "prompt-pii-scanner",
    kind: "tool",
    title: "Prompt PII Scanner — free client-side tool",
    description: "Paste any prompt and instantly see what PII, PHI, credentials, or financial data it contains. Runs entirely in the browser.",
    sourceText:
      "Free prompt PII scanner client-side browser detection credit card SSN AWS access key PEM private key JWT API key Stripe key GitHub token IBAN ICD-10 PHI medical record number date of birth email phone IP address auto-redact embed widget.",
  });

  return items;
}

// ─── Embedding API ───

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!OPENAI_KEY) throw new Error("OPENAI_SEO_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: texts }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI embeddings HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = (await res.json()) as { data: { embedding: number[] }[] };
  return data.data.map((d) => d.embedding);
}

// ─── Recompute (only what changed) ───

export interface RecomputeStats {
  total: number;
  unchanged: number;
  recomputed: number;
  errors: string[];
}

export async function recomputeEmbeddings(): Promise<RecomputeStats> {
  const corpus = await buildCorpus();
  const db = createServiceClient();

  const { data: existing } = await db
    .from("content_embeddings")
    .select("slug, source_hash");
  const existingMap = new Map<string, string>(
    ((existing as { slug: string; source_hash: string }[] | null) || []).map((r) => [r.slug, r.source_hash]),
  );

  const stats: RecomputeStats = { total: corpus.length, unchanged: 0, recomputed: 0, errors: [] };
  const toRecompute: IndexableItem[] = [];
  for (const item of corpus) {
    const hash = sha256(item.sourceText);
    if (existingMap.get(item.slug) === hash) {
      stats.unchanged++;
    } else {
      toRecompute.push(item);
    }
  }

  // Batch embedding calls — 50 at a time stays well inside the 8k-input limit.
  const BATCH = 50;
  for (let i = 0; i < toRecompute.length; i += BATCH) {
    const batch = toRecompute.slice(i, i + BATCH);
    try {
      const embeddings = await embedBatch(batch.map((b) => b.sourceText));
      const rows = batch.map((b, j) => ({
        slug: b.slug,
        kind: b.kind,
        title: b.title,
        description: b.description,
        embedding: embeddings[j],
        source_hash: sha256(b.sourceText),
        computed_at: new Date().toISOString(),
      }));
      const { error } = await db
        .from("content_embeddings")
        .upsert(rows, { onConflict: "slug" });
      if (error) {
        stats.errors.push(`batch ${i}: ${error.message}`);
      } else {
        stats.recomputed += batch.length;
      }
    } catch (err) {
      stats.errors.push(`batch ${i}: ${(err as Error).message}`);
    }
  }

  // Prune: remove embeddings for content that's no longer in the corpus.
  const currentSlugs = new Set(corpus.map((c) => c.slug));
  const stale = Array.from(existingMap.keys()).filter((s) => !currentSlugs.has(s));
  if (stale.length > 0) {
    await db.from("content_embeddings").delete().in("slug", stale);
  }

  return stats;
}

// ─── Similarity lookup ───

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let aN = 0;
  let bN = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aN += a[i] * a[i];
    bN += b[i] * b[i];
  }
  return dot / (Math.sqrt(aN) * Math.sqrt(bN) + 1e-9);
}

export interface RelatedItem {
  slug: string;
  kind: ContentKind;
  title: string;
  description: string | null;
  href: string;
  score: number;
}

function hrefFor(kind: ContentKind, slug: string): string {
  switch (kind) {
    case "blog": return `/blog/${slug}`;
    case "solutions": return `/solutions/${slug}`;
    case "security":
      // The only security hub right now lives at /security/owasp-llm-top-10
      return slug === "owasp-llm-top-10" ? "/security/owasp-llm-top-10" : `/security/${slug}`;
    case "tool":
      return slug === "prompt-pii-scanner" ? "/tools/prompt-pii-scanner" : `/tools/${slug}`;
    case "about": return "/about";
  }
}

/**
 * Return the top-N most semantically similar OTHER content pieces to the
 * given slug. Used by blog/[slug] and /solutions/[slug] renderers to
 * populate the "Related" section beneath the manually-curated relatedSlugs.
 *
 * Falls back gracefully if the embeddings table is empty (e.g. before the
 * first recompute) — returns an empty array, callers should render their
 * existing manual-related fallback.
 */
export async function getRelatedBySimilarity(slug: string, limit = 4): Promise<RelatedItem[]> {
  const db = createServiceClient();
  const { data: rows } = await db
    .from("content_embeddings")
    .select("slug, kind, title, description, embedding");
  if (!rows || rows.length === 0) return [];

  type Row = { slug: string; kind: ContentKind; title: string; description: string | null; embedding: number[] };
  const all = rows as Row[];
  const target = all.find((r) => r.slug === slug);
  if (!target) return [];

  const scored = all
    .filter((r) => r.slug !== slug)
    .map((r) => ({
      slug: r.slug,
      kind: r.kind,
      title: r.title,
      description: r.description,
      score: cosine(target.embedding, r.embedding),
      href: hrefFor(r.kind, r.slug),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Drop very-low-similarity matches (< 0.45 cosine in 1536-dim space is
  // usually noise rather than a meaningful semantic link).
  return scored.filter((r) => r.score >= 0.45);
}
