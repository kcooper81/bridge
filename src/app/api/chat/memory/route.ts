import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { createAIModel } from "@/lib/ai/providers";
import { decrypt } from "@/lib/crypto";

/** Safe regex test with a length limit to prevent ReDoS */
function safeRegexTest(pattern: string, flags: string, content: string): boolean {
  try {
    const limited = content.length > 10000 ? content.slice(0, 10000) : content;
    return new RegExp(pattern, flags).test(limited);
  } catch {
    return false;
  }
}

/** Map of provider → cheapest model to use for memory extraction */
const EXTRACTION_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
  google: "gemini-2.5-flash",
};

/** GET — load user's active memories */
export async function GET() {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ memories: [] });

  const { data: memories } = await db
    .from("chat_user_memory")
    .select("id, fact, category, dlp_status, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("org_id", profile.org_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ memories: memories || [] });
}

/** POST — extract memories from a conversation */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { conversationId, messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length < 4) {
    return NextResponse.json({ extracted: 0 });
  }

  // Load existing memories for deduplication
  const { data: existingMemories } = await db
    .from("chat_user_memory")
    .select("id, fact, category")
    .eq("user_id", user.id)
    .eq("org_id", profile.org_id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const existing = existingMemories || [];

  // Find a provider API key (prefer the org's first active provider)
  const { data: providerKeys } = await db
    .from("ai_provider_keys")
    .select("provider, encrypted_api_key")
    .eq("org_id", profile.org_id)
    .eq("is_active", true)
    .limit(5);

  if (!providerKeys || providerKeys.length === 0) {
    return NextResponse.json({ error: "No API key configured" }, { status: 400 });
  }

  // Pick the provider and its cheapest model
  const providerKey = providerKeys[0];
  const extractionModel = EXTRACTION_MODELS[providerKey.provider] || "gpt-4o-mini";

  let apiKey: string;
  try {
    apiKey = decrypt(providerKey.encrypted_api_key);
  } catch {
    return NextResponse.json({ error: "Failed to decrypt API key" }, { status: 500 });
  }

  // Build conversation summary for extraction
  const conversationText = messages
    .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
    .slice(-20) // Last 20 messages max
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const existingFactsList = existing.map((m) => `- [${m.category}] ${m.fact}`).join("\n");

  const extractionPrompt = `Extract key facts about the user from this conversation that would be useful to remember in future conversations. Return as a JSON array of objects with "fact" and "category" fields. Categories: preference, context, project, expertise, style. Only extract genuinely useful facts. Maximum 5 facts per conversation.

${existing.length > 0 ? `\nExisting remembered facts (do NOT duplicate these, but if a new fact contradicts an existing one, include a "replaces" field with the exact old fact text):\n${existingFactsList}\n` : ""}

Conversation:
${conversationText}

Respond with ONLY a JSON array, no other text. Example:
[{"fact": "Prefers TypeScript over JavaScript", "category": "preference"}]

If there are no useful facts to extract, respond with an empty array: []`;

  try {
    const aiModel = createAIModel(providerKey.provider, extractionModel, apiKey);
    const result = await generateText({
      model: aiModel,
      messages: [{ role: "user", content: extractionPrompt }],
    });

    // Parse the extracted facts
    const responseText = result.text.trim();
    // Try to extract JSON array from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ extracted: 0 });
    }

    let facts: Array<{ fact: string; category: string; replaces?: string }>;
    try {
      facts = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ extracted: 0 });
    }

    if (!Array.isArray(facts) || facts.length === 0) {
      return NextResponse.json({ extracted: 0 });
    }

    // Limit to 5 facts
    facts = facts.slice(0, 5);

    // Load DLP rules for scanning facts
    const [rulesResult, termsResult] = await Promise.all([
      db.from("security_rules")
        .select("name, pattern, pattern_type, category, severity")
        .eq("org_id", profile.org_id)
        .eq("is_active", true)
        .is("team_id", null),
      db.from("sensitive_terms")
        .select("term, term_type, category, severity")
        .eq("org_id", profile.org_id)
        .eq("is_active", true)
        .is("team_id", null),
    ]);

    // Check org guardrails setting
    const { data: orgData } = await db
      .from("organizations")
      .select("settings")
      .eq("id", profile.org_id)
      .single();
    const orgSettings = (orgData?.settings || {}) as Record<string, unknown>;
    const guardrailsEnabled = orgSettings.guardrails_enabled !== false;

    let extracted = 0;

    for (const factObj of facts) {
      if (!factObj.fact || typeof factObj.fact !== "string") continue;

      const fact = factObj.fact.slice(0, 500);
      const category = ["preference", "context", "project", "expertise", "style"].includes(factObj.category)
        ? factObj.category
        : "general";

      // DLP scan the fact
      let dlpStatus = "clean";
      let dlpFlags: Array<{ rule: string; category: string; severity: string }> = [];
      let scannedFact = fact;

      if (guardrailsEnabled) {
        const violations: Array<{ ruleName: string; category: string; severity: string; pattern?: string; patternType?: string }> = [];

        for (const rule of rulesResult.data || []) {
          if (safeRegexTest(rule.pattern, "i", fact)) {
            violations.push({ ruleName: rule.name, category: rule.category, severity: rule.severity, pattern: rule.pattern, patternType: "regex" });
          }
        }

        for (const term of termsResult.data || []) {
          const content = fact.toLowerCase();
          if (term.term_type === "keyword" || term.term_type === "exact") {
            if (content.includes(term.term.toLowerCase())) {
              violations.push({ ruleName: `Sensitive term: "${term.term}"`, category: term.category, severity: term.severity });
            }
          } else if (term.term_type === "regex") {
            if (safeRegexTest(term.term, "i", fact)) {
              violations.push({ ruleName: `Pattern: "${term.term}"`, category: term.category, severity: term.severity });
            }
          }
        }

        const hasBlock = violations.some((v) => v.severity === "block");
        const redactViolations = violations.filter((v) => v.severity === "redact");

        if (hasBlock) {
          // Skip this fact entirely — blocked by DLP
          dlpStatus = "blocked";
          dlpFlags = violations.map((v) => ({ rule: v.ruleName, category: v.category, severity: v.severity }));
          // Still insert for audit trail but marked as blocked
          await db.from("chat_user_memory").insert({
            user_id: user.id,
            org_id: profile.org_id,
            fact: "[BLOCKED]",
            category,
            source_conversation_id: conversationId || null,
            is_active: false,
            dlp_status: dlpStatus,
            dlp_flags: dlpFlags,
          });
          continue;
        }

        if (redactViolations.length > 0) {
          dlpStatus = "redacted";
          dlpFlags = violations.map((v) => ({ rule: v.ruleName, category: v.category, severity: v.severity }));
          // Apply redactions to the fact text
          let redactedFact = fact;
          for (const v of redactViolations) {
            const matchedRule = (rulesResult.data || []).find((r) => r.name === v.ruleName);
            const matchedTerm = (termsResult.data || []).find((t) => v.ruleName === `Sensitive term: "${t.term}"`);
            const categoryLabel = (v.category || "SENSITIVE").toUpperCase().replace(/[^A-Z_]/g, "_");
            const replacement = `[${categoryLabel}]`;

            if (matchedRule) {
              try {
                redactedFact = redactedFact.replace(new RegExp(matchedRule.pattern, "gi"), replacement);
              } catch { /* invalid regex */ }
            } else if (matchedTerm) {
              const termRegex = new RegExp(matchedTerm.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
              redactedFact = redactedFact.replace(termRegex, replacement);
            }
          }
          scannedFact = redactedFact;
        }
      }

      // Handle replacements — deactivate old fact if this one replaces it
      if (factObj.replaces && typeof factObj.replaces === "string") {
        const oldFact = existing.find((e) => e.fact === factObj.replaces);
        if (oldFact) {
          await db.from("chat_user_memory")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("id", oldFact.id);
        }
      }

      // Insert the new fact
      await db.from("chat_user_memory").insert({
        user_id: user.id,
        org_id: profile.org_id,
        fact: scannedFact,
        category,
        source_conversation_id: conversationId || null,
        is_active: true,
        dlp_status: dlpStatus,
        dlp_flags: dlpFlags,
      });

      extracted++;
    }

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("Memory extraction error:", err);
    return NextResponse.json({ extracted: 0 });
  }
}

/** DELETE — soft-delete a specific memory or bulk delete */
export async function DELETE(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const ids: string[] = body.ids || (body.id ? [body.id] : []);

  if (ids.length === 0) {
    // Clear all memories
    if (body.clearAll) {
      await db.from("chat_user_memory")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("org_id", profile.org_id)
        .eq("is_active", true);
      return NextResponse.json({ deleted: true });
    }
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Verify ownership and soft-delete
  const { error } = await db.from("chat_user_memory")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("org_id", profile.org_id)
    .in("id", ids);

  if (error) {
    console.error("Failed to delete memories:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}

/** PUT — edit a memory fact */
export async function PUT(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { id, fact } = body;

  if (!id || !fact || typeof fact !== "string") {
    return NextResponse.json({ error: "ID and fact are required" }, { status: 400 });
  }

  const cleanFact = fact.slice(0, 500);

  // DLP scan the edited fact
  const [rulesResult, termsResult] = await Promise.all([
    db.from("security_rules")
      .select("name, pattern, category, severity")
      .eq("org_id", profile.org_id)
      .eq("is_active", true)
      .is("team_id", null),
    db.from("sensitive_terms")
      .select("term, term_type, category, severity")
      .eq("org_id", profile.org_id)
      .eq("is_active", true)
      .is("team_id", null),
  ]);

  const { data: orgData } = await db
    .from("organizations")
    .select("settings")
    .eq("id", profile.org_id)
    .single();
  const orgSettings = (orgData?.settings || {}) as Record<string, unknown>;

  if (orgSettings.guardrails_enabled !== false) {
    for (const rule of rulesResult.data || []) {
      if (safeRegexTest(rule.pattern, "i", cleanFact) && rule.severity === "block") {
        return NextResponse.json({ error: "Memory contains blocked content" }, { status: 400 });
      }
    }
    for (const term of termsResult.data || []) {
      if (term.severity === "block") {
        const content = cleanFact.toLowerCase();
        if ((term.term_type === "keyword" || term.term_type === "exact") && content.includes(term.term.toLowerCase())) {
          return NextResponse.json({ error: "Memory contains blocked content" }, { status: 400 });
        }
        if (term.term_type === "regex" && safeRegexTest(term.term, "i", cleanFact)) {
          return NextResponse.json({ error: "Memory contains blocked content" }, { status: 400 });
        }
      }
    }
  }

  const { data, error } = await db.from("chat_user_memory")
    .update({ fact: cleanFact, dlp_status: "clean", dlp_flags: [], updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("org_id", profile.org_id)
    .select("id, fact, category, dlp_status, created_at, updated_at")
    .single();

  if (error) {
    console.error("Failed to update memory:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ memory: data });
}
