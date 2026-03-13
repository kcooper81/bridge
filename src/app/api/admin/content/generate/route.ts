import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { logServiceError } from "@/lib/log-error";

/** Server-side HTML sanitizer — strips scripts, event handlers, and dangerous elements */
function sanitizeContent(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/<link\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript\s*:/gi, "");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { pipelineId, autoPublish } = await request.json();
  if (!pipelineId) {
    return NextResponse.json({ error: "pipelineId required" }, { status: 400 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured in environment variables" },
      { status: 503 }
    );
  }

  const db = createServiceClient();

  const { data: item } = await db
    .from("content_pipeline")
    .select("*")
    .eq("id", pipelineId)
    .single();

  if (!item) {
    return NextResponse.json({ error: "Pipeline item not found" }, { status: 404 });
  }

  // Delete any previous draft for this pipeline item
  await db.from("blog_posts").delete().eq("pipeline_id", pipelineId);

  // Generate blog post with Claude
  const keywords = item.target_keywords?.join(", ") || "";

  const prompt = `Write a complete, SEO-optimized blog post for TeamPrompt, a B2B SaaS platform that helps teams manage, share, and secure their AI prompts across ChatGPT, Claude, Gemini, Copilot, and Perplexity.

Title idea: ${item.title}
Target keywords: ${keywords}
${item.source_query ? `Based on search query: "${item.source_query}"` : ""}
${item.notes ? `Notes: ${item.notes}` : ""}

Requirements:
- 800-1200 words of original, practical content
- HTML formatting only: <h2> for sections, <p> for paragraphs, <ul>/<li> for lists, <strong> for emphasis
- Do NOT include <h1> (page template handles it)
- 4-6 sections with clear <h2> headings
- Actionable advice, not generic fluff
- Include specific examples and real tips
- Mention TeamPrompt naturally where relevant, not promotional
- Professional audience: team leads, managers, IT admins
- If the topic relates to a specific industry, include industry-specific examples

Respond with ONLY valid JSON (no markdown fences):
{
  "title": "polished SEO title",
  "description": "150-160 char meta description",
  "content": "<h2>Section</h2><p>Content...</p>...",
  "category": "guide",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "imageSearchTerm": "professional team workplace"
}

category must be one of: guide, insight, comparison, tutorial`;

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!claudeRes.ok) {
    const err = await claudeRes.text();
    console.error("Claude API error:", claudeRes.status, err);
    logServiceError("app", new Error(`Claude API ${claudeRes.status}: ${err}`), { url: "admin/content/generate", metadata: { provider: "anthropic", status: claudeRes.status } });
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }

  const claudeData = await claudeRes.json();
  const rawText = claudeData.content?.[0]?.text || "";

  let generated: {
    title: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
    imageSearchTerm: string;
  };
  try {
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    generated = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Claude response:", rawText.slice(0, 500));
    logServiceError("app", new Error("Failed to parse Claude response"), { url: "admin/content/generate", metadata: { provider: "anthropic", responsePreview: rawText.slice(0, 200) } });
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  // Search Unsplash for cover image
  let coverImage =
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop";
  let coverImageAlt = generated.title;

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  if (unsplashKey && generated.imageSearchTerm) {
    try {
      const uRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(generated.imageSearchTerm)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      );
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.results?.[0]) {
          const photo = uData.results[0];
          coverImage = `${photo.urls.raw}&w=1200&q=80&auto=format&fit=crop`;
          coverImageAlt = photo.alt_description || generated.title;
        }
      }
    } catch {
      // Keep default image
    }
  }

  const baseSlug = slugify(generated.title || item.title);

  // Avoid duplicate slugs
  const { data: existing } = await db
    .from("blog_posts")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();

  const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  const postStatus = autoPublish ? "published" : "draft";
  const pipelineStatus = autoPublish ? "published" : "review";

  const { data: blogPost, error: insertError } = await db
    .from("blog_posts")
    .insert({
      slug,
      title: generated.title || item.title,
      description: generated.description || "",
      content: sanitizeContent(generated.content),
      category: generated.category || "guide",
      tags: generated.tags || item.target_keywords || [],
      reading_time: estimateReadingTime(generated.content),
      cover_image: coverImage,
      cover_image_alt: coverImageAlt,
      status: postStatus,
      pipeline_id: pipelineId,
      published_at: new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (insertError) {
    console.error("Blog post insert error:", insertError);
    logServiceError("supabase", insertError, { url: "admin/content/generate", metadata: { action: "blog-post-insert" } });
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }

  // Update pipeline status
  await db
    .from("content_pipeline")
    .update({ status: pipelineStatus, updated_at: new Date().toISOString() })
    .eq("id", pipelineId);

  return NextResponse.json({ blogPost, autoPublished: !!autoPublish });
}
