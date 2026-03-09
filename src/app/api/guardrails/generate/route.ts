import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SecurityCategory, SecurityPatternType, SecuritySeverity } from "@/lib/types";

interface GeneratedRule {
  name: string;
  description: string;
  pattern: string;
  pattern_type: SecurityPatternType;
  category: SecurityCategory;
  severity: SecuritySeverity;
}

const SYSTEM_PROMPT = `You are a security rule generator for an AI DLP (Data Loss Prevention) system called TeamPrompt.

Given a natural language description of what sensitive data to protect, generate one or more security rules.

Each rule must have:
- name: Short descriptive name (e.g. "Internal Project Names")
- description: Brief explanation of what it detects
- pattern: The detection pattern (see pattern_type)
- pattern_type: One of "keywords", "exact", "regex", "glob"
  - "keywords": comma-separated words/phrases matched case-insensitively (simplest, best for lists of terms)
  - "exact": exact string match, case-insensitive (for specific codes or identifiers)
  - "regex": JavaScript-compatible regular expression (for structured formats like IDs, keys, numbers)
  - "glob": wildcard pattern using * (for prefix/suffix matching)
- category: One of "api_keys", "credentials", "pii", "secrets", "internal_terms", "internal", "financial", "health", "custom"
- severity: "block" (prevent sending) or "warn" (alert but allow)

Guidelines:
- Prefer "keywords" for simple word/phrase lists — it's the easiest for admins to understand and edit
- Use "regex" only when the data has a specific format (e.g. employee IDs like EMP-12345, phone numbers, account numbers)
- Generate multiple rules when the request covers different categories (e.g. "protect our company data" → separate rules for project names, internal terms, credentials)
- Make patterns specific enough to avoid false positives but broad enough to catch variations
- Default to "block" severity for credentials, API keys, and PII; use "warn" for internal terms unless the user says otherwise

Respond with a JSON array of rule objects. Nothing else — no markdown, no explanation, just the JSON array.`;

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("INVALID_KEY");
    if (response.status === 429) throw new Error("RATE_LIMITED");
    console.error("OpenAI API error:", err);
    throw new Error("PROVIDER_ERROR");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callAnthropic(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("INVALID_KEY");
    if (response.status === 429) throw new Error("RATE_LIMITED");
    console.error("Anthropic API error:", err);
    throw new Error("PROVIDER_ERROR");
  }

  const data = await response.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  return textBlock?.text?.trim() || "";
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's org and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id || (profile.role !== "admin" && profile.role !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get the org's security settings for AI API key
  const { data: org } = await supabase
    .from("organizations")
    .select("security_settings")
    .eq("id", profile.org_id)
    .single();

  const settings = org?.security_settings || {};
  const provider = settings.ai_detection_provider;
  const apiKey = settings.ai_api_key;

  if (!provider || !apiKey) {
    return NextResponse.json(
      { error: "NO_API_KEY" },
      { status: 400 }
    );
  }

  if (provider !== "openai" && provider !== "anthropic") {
    return NextResponse.json(
      { error: "AI rule generation requires an OpenAI or Anthropic API key. Update your provider in Detection settings." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { prompt } = body;

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const content = provider === "anthropic"
      ? await callAnthropic(apiKey, prompt.trim())
      : await callOpenAI(apiKey, prompt.trim());

    if (!content) {
      return NextResponse.json({ error: "AI returned an empty response. Try rephrasing." }, { status: 500 });
    }

    // Parse the JSON array — handle markdown code fences if present
    let cleaned = content;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let rules: GeneratedRule[];
    try {
      rules = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return NextResponse.json({ error: "AI returned invalid format. Try rephrasing." }, { status: 500 });
    }

    if (!Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json({ error: "AI didn't generate any rules. Try being more specific." }, { status: 500 });
    }

    // Validate and sanitize each rule
    const validCategories = new Set(["api_keys", "credentials", "pii", "secrets", "internal_terms", "internal", "financial", "health", "custom"]);
    const validPatternTypes = new Set(["keywords", "exact", "regex", "glob"]);
    const validSeverities = new Set(["block", "warn"]);

    const sanitized: GeneratedRule[] = rules.slice(0, 10).map((r) => ({
      name: String(r.name || "").slice(0, 100),
      description: String(r.description || "").slice(0, 500),
      pattern: String(r.pattern || ""),
      pattern_type: validPatternTypes.has(r.pattern_type) ? r.pattern_type : "keywords",
      category: validCategories.has(r.category) ? r.category : "custom",
      severity: validSeverities.has(r.severity) ? r.severity : "block",
    })).filter((r) => r.name && r.pattern);

    return NextResponse.json({ rules: sanitized });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "INVALID_KEY") {
      const providerName = provider === "anthropic" ? "Anthropic" : "OpenAI";
      return NextResponse.json({ error: `Invalid ${providerName} API key. Check your key in Detection settings.` }, { status: 400 });
    }
    if (message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Rate limit reached. Try again in a moment." }, { status: 429 });
    }
    console.error("AI rule generation error:", err);
    return NextResponse.json({ error: "Failed to connect to AI provider." }, { status: 500 });
  }
}
