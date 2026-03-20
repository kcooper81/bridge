import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { createAIModel } from "@/lib/ai/providers";
import { decrypt } from "@/lib/crypto";
import { notifyDlpViolation } from "@/lib/slack/notify";

/** Safe regex test with a length limit to prevent ReDoS on long content */
function safeRegexTest(pattern: string, flags: string, content: string): boolean {
  try {
    // Limit content length to prevent catastrophic backtracking
    const limited = content.length > 10000 ? content.slice(0, 10000) : content;
    return new RegExp(pattern, flags).test(limited);
  } catch {
    return false;
  }
}

/**
 * POST /api/chat — stream a chat message through DLP scan + AI provider.
 * Uses cookie-based auth (dashboard route, not extension).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = createClient();
    const db = createServiceClient();

    // Auth via cookie session
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await db
      .from("profiles")
      .select("org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: "No organization" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { messages, model, provider, conversationId, compareOnly } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the latest user message for DLP scanning
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    let streamRedactions: Array<{original: string; replacement: string; category: string}> | null = null;

    // Load org settings (needed for DLP + system prompt)
    const { data: orgData } = await db
      .from("organizations")
      .select("settings")
      .eq("id", profile.org_id)
      .single();
    const orgSettings = (orgData?.settings || {}) as Record<string, unknown>;

    if (lastUserMessage && !compareOnly) {
      // Run DLP scan on the user's message
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

      // Skip scan if guardrails disabled
      if (orgSettings.guardrails_enabled !== false) {
        const violations: Array<{ ruleName: string; category: string; severity: string }> = [];

        // Check security rules
        for (const rule of rulesResult.data || []) {
          if (safeRegexTest(rule.pattern, "i", lastUserMessage.content)) {
            violations.push({ ruleName: rule.name, category: rule.category, severity: rule.severity });
          }
        }

        // Check sensitive terms
        for (const term of termsResult.data || []) {
          const content = lastUserMessage.content.toLowerCase();
          if (term.term_type === "keyword" || term.term_type === "exact") {
            if (content.includes(term.term.toLowerCase())) {
              violations.push({ ruleName: `Sensitive term: "${term.term}"`, category: term.category, severity: term.severity });
            }
          } else if (term.term_type === "regex") {
            if (safeRegexTest(term.term, "i", lastUserMessage.content)) {
              violations.push({ ruleName: `Pattern: "${term.term}"`, category: term.category, severity: term.severity });
            }
          }
        }

        const blockViolations = violations.filter((v) => v.severity === "block");
        const redactViolations = violations.filter((v) => v.severity === "redact");
        const overrideDisabled = orgSettings.allow_guardrail_override === false;

        const hasBlock = blockViolations.length > 0 || (overrideDisabled && violations.some((v) => v.severity === "warn"));

        if (hasBlock) {
          // Log blocked event to conversation_logs (fire-and-forget)
          try {
            await db.from("conversation_logs").insert({
              org_id: profile.org_id,
              user_id: user.id,
              ai_tool: "teamprompt_chat",
              action: "blocked",
              metadata: { violations: violations.map((v) => ({ rule: v.ruleName, category: v.category, severity: v.severity })) },
            });
          } catch { /* non-critical */ }

          // Fire Slack notification (fire-and-forget)
          if (violations.length > 0) {
            const top = violations[0];
            notifyDlpViolation(profile.org_id, {
              ruleName: violations.length === 1 ? top.ruleName : `${top.ruleName} (+${violations.length - 1} more)`,
              category: top.category,
              severity: top.severity,
              userEmail: user.email || undefined,
              aiTool: "teamprompt_chat",
            }).catch(() => {});
          }

          return new Response(JSON.stringify({
            blocked: true,
            violations: violations.map((v) => ({
              ruleName: v.ruleName,
              category: v.category,
              severity: v.severity,
            })),
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Apply redactions to message content if redact violations exist
        if (redactViolations.length > 0 && lastUserMessage) {
          let redactedContent = lastUserMessage.content;
          const redactionsList: Array<{original: string; replacement: string; category: string}> = [];

          for (const v of redactViolations) {
            const matchedRule = (rulesResult.data || []).find((r) => r.name === v.ruleName);
            const matchedTerm = (termsResult.data || []).find((t) => v.ruleName === `Sensitive term: "${t.term}"`);

            const categoryLabel = (v.category || "SENSITIVE").toUpperCase().replace(/[^A-Z_]/g, "_");
            const replacement = `[${categoryLabel}]`;

            if (matchedRule) {
              try {
                const regex = new RegExp(matchedRule.pattern, "gi");
                const matches = redactedContent.match(regex);
                if (matches) {
                  for (const match of matches) {
                    redactionsList.push({ original: match.slice(0, 3) + "***", replacement, category: v.category });
                  }
                  redactedContent = redactedContent.replace(regex, replacement);
                }
              } catch { /* invalid regex — skip */ }
            } else if (matchedTerm) {
              const termRegex = new RegExp(matchedTerm.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
              const matches = redactedContent.match(termRegex);
              if (matches) {
                for (const match of matches) {
                  redactionsList.push({ original: match.slice(0, 3) + "***", replacement, category: v.category });
                }
                redactedContent = redactedContent.replace(termRegex, replacement);
              }
            }
          }

          // Use redacted content for the AI
          lastUserMessage.content = redactedContent;

          // Store redactions + redacted content for stream prefix
          if (redactionsList.length > 0) {
            streamRedactions = redactionsList;
          }
        }
      }
    }

    // Load provider API key
    const { data: providerKey } = await db
      .from("ai_provider_keys")
      .select("encrypted_api_key, model_whitelist")
      .eq("org_id", profile.org_id)
      .eq("provider", provider || "openai")
      .eq("is_active", true)
      .maybeSingle();

    if (!providerKey) {
      return new Response(JSON.stringify({ error: `No API key configured for ${provider || "openai"}. Ask your admin to add one in Settings → AI Providers.` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check model whitelist
    const selectedModel = model || "gpt-4o-mini";
    if (providerKey.model_whitelist?.length > 0 && !providerKey.model_whitelist.includes(selectedModel)) {
      return new Response(JSON.stringify({ error: `Model ${selectedModel} is not allowed. Contact your admin.` }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Decrypt API key
    let apiKey: string;
    try {
      apiKey = decrypt(providerKey.encrypted_api_key);
    } catch {
      return new Response(JSON.stringify({ error: "Failed to decrypt API key. It may need to be re-entered." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create/update conversation (skip for compare-only requests)
    let convId = conversationId;
    if (!compareOnly) {
      if (!convId) {
        const { data: conv, error: convError } = await db
          .from("chat_conversations")
          .insert({
            org_id: profile.org_id,
            user_id: user.id,
            title: (lastUserMessage?.content || "New conversation").slice(0, 100),
            model: selectedModel,
            provider: provider || "openai",
          })
          .select("id")
          .single();
        if (convError) {
          console.error("Failed to create conversation:", convError);
        }
        convId = conv?.id;
      }

      // Save user message
      if (convId && lastUserMessage) {
        await db.from("chat_messages").insert({
          conversation_id: convId,
          role: "user",
          content: lastUserMessage.content,
          model: selectedModel,
        });
      }
    }

    // Load org system prompt if set
    const orgSystemPrompt = orgSettings.ai_system_prompt as string | undefined;

    // Check for injected context
    const adminContext = body.adminContext as string | undefined;
    const presetSystemPrompt = body.presetSystemPrompt as string | undefined;
    const rawFileContext = body.fileContext as string | undefined;
    const fileContext = rawFileContext && rawFileContext.length > 200000
      ? rawFileContext.slice(0, 200000) + "\n\n[File content truncated at 200,000 characters]"
      : rawFileContext;

    // Stream AI response
    const aiModel = createAIModel(provider || "openai", selectedModel, apiKey);

    // Build system messages (order: org prompt → preset prompt → file context → admin data)
    const systemMessages: Array<{ role: "system"; content: string }> = [];
    if (orgSystemPrompt) {
      systemMessages.push({ role: "system", content: orgSystemPrompt });
    }
    if (presetSystemPrompt) {
      systemMessages.push({ role: "system", content: presetSystemPrompt });
    }
    if (fileContext) {
      systemMessages.push({
        role: "system",
        content: `The user has uploaded the following file(s). Use this content to answer their question:\n\n${fileContext}`,
      });
    }
    if (adminContext) {
      systemMessages.push({
        role: "system",
        content: `The following is real data from the organization's database. Use it to answer the user's question accurately.\n\n${adminContext}`,
      });
    }

    // Build messages with multimodal support
    const aiMessages = messages.map((m: { role: string; content: string; images?: string[] }) => {
      if (m.images?.length && m.role === "user") {
        // Multimodal message with images
        return {
          role: m.role as "user",
          content: [
            ...m.images.map((img: string) => ({
              type: "image" as const,
              image: img,
            })),
            { type: "text" as const, text: m.content || "What's in this image?" },
          ],
        };
      }
      return {
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      };
    });

    const result = streamText({
      model: aiModel,
      messages: [...systemMessages, ...aiMessages],
      onFinish: async ({ text, usage }) => {
        // Save assistant message (skip for compare-only)
        if (convId && !compareOnly) {
          try {
            await db.from("chat_messages").insert({
              conversation_id: convId,
              role: "assistant",
              content: text,
              model: selectedModel,
              tokens_used: (usage?.totalTokens) || 0,
            });
            await db.from("chat_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", convId);
          } catch (e) { console.error("Failed to save assistant message:", e); }
        }

        // Log to conversation_logs for audit (skip for compare-only)
        if (!compareOnly) {
          try {
            await db.from("conversation_logs").insert({
              org_id: profile.org_id,
              user_id: user.id,
              ai_tool: "teamprompt_chat",
              action: "sent",
              metadata: { model: selectedModel, provider: provider || "openai", tokens: usage?.totalTokens || 0 },
            });
          } catch { /* non-critical */ }
        }
      },
    });

    const textStream = result.toTextStreamResponse();

    // Wrap the stream to prepend conversation ID (and optional redactions) as first lines
    if (convId && textStream.body) {
      const reader = textStream.body.getReader();
      const encoder = new TextEncoder();
      const redactionsPrefix = streamRedactions
        ? `__REDACTIONS__${JSON.stringify({ items: streamRedactions, redactedContent: lastUserMessage?.content || "" })}__\n`
        : "";
      const prefix = encoder.encode(`${redactionsPrefix}__CONV_ID__${convId}__\n`);
      let prefixSent = false;

      const wrappedStream = new ReadableStream({
        async pull(controller) {
          if (!prefixSent) {
            controller.enqueue(prefix);
            prefixSent = true;
          }
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        },
      });

      return new Response(wrappedStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return textStream;
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
