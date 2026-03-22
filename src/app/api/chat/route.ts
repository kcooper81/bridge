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
    const { messages, model, provider, conversationId, compareOnly, thinking } = body;

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
        if (convError || !conv?.id) {
          console.error("Failed to create conversation:", convError);
          return new Response(JSON.stringify({ error: "Failed to create conversation" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        convId = conv.id;
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

    // Load user custom instructions
    let userInstructionsPrompt: string | null = null;
    {
      const { data: instrRow } = await db
        .from("chat_user_instructions")
        .select("role_description, tone, expertise_level, custom_context, is_active")
        .eq("user_id", user.id)
        .eq("org_id", profile.org_id)
        .single();
      if (instrRow?.is_active) {
        const parts: string[] = [];
        if (instrRow.role_description) parts.push(`Role: ${instrRow.role_description}`);
        if (instrRow.tone) parts.push(`Tone: ${instrRow.tone}`);
        if (instrRow.expertise_level) parts.push(`Expertise level: ${instrRow.expertise_level}`);
        if (instrRow.custom_context) parts.push(`Additional context: ${instrRow.custom_context}`);
        if (parts.length > 0) {
          userInstructionsPrompt = `The user has set the following custom instructions for how you should respond:\n${parts.join("\n")}`;
        }
      }
    }

    // Load user memories
    let userMemories: Array<{ fact: string; category: string }> | null = null;
    {
      const { data: memories } = await db
        .from("chat_user_memory")
        .select("fact, category")
        .eq("user_id", user.id)
        .eq("org_id", profile.org_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (memories?.length) userMemories = memories;
    }

    // Build system messages (order: org prompt → user instructions → user memories → preset prompt → file context → admin data)
    const systemMessages: Array<{ role: "system"; content: string }> = [];
    if (orgSystemPrompt) {
      systemMessages.push({ role: "system", content: orgSystemPrompt });
    }
    if (userInstructionsPrompt) {
      systemMessages.push({ role: "system", content: userInstructionsPrompt });
    }
    if (userMemories?.length) {
      const memoryText = userMemories.map(m => `- ${m.fact}`).join("\n");
      systemMessages.push({
        role: "system",
        content: `The following facts are remembered about the user from previous conversations:\n${memoryText}\n\nUse this context naturally. Don't mention that you "remember" unless asked.`,
      });
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

    // Build provider-specific options for extended thinking
    // Anthropic: enables explicit thinking blocks (streamed as reasoning-delta)
    // OpenAI: o1/o3/o3-mini reason internally — no separate API param, reasoning not exposed
    // Google: no extended thinking support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const providerOptions: any = {};
    if (thinking && (provider || "openai") === "anthropic") {
      providerOptions.anthropic = {
        thinking: { type: "enabled", budgetTokens: 10000 },
      };
    }

    const result = streamText({
      model: aiModel,
      messages: [...systemMessages, ...aiMessages],
      ...(Object.keys(providerOptions).length > 0 ? { providerOptions } : {}),
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

    // Build a custom stream that includes thinking content (if present) and text
    const encoder = new TextEncoder();
    const redactionsPrefix = streamRedactions
      ? `__REDACTIONS__${JSON.stringify({ items: streamRedactions, redactedContent: lastUserMessage?.content || "" })}__\n`
      : "";
    const convPrefix = convId ? `${redactionsPrefix}__CONV_ID__${convId}__\n` : "";

    // Use fullStream to capture reasoning-delta parts alongside text-delta
    const fullStream = result.fullStream;
    let reasoningBuffer = "";
    let reasoningSent = false;

    const wrappedStream = new ReadableStream({
      async start(controller) {
        if (convPrefix) {
          controller.enqueue(encoder.encode(convPrefix));
        }
        try {
          for await (const part of fullStream) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = part as any;
            if (part.type === "reasoning-delta" && thinking) {
              reasoningBuffer += p.text ?? p.textDelta ?? p.delta ?? "";
            } else if (part.type === "text-delta") {
              // Before sending first text chunk, send accumulated thinking content
              if (thinking && reasoningBuffer && !reasoningSent) {
                controller.enqueue(encoder.encode(`__THINKING__${reasoningBuffer}__END_THINKING__\n`));
                reasoningSent = true;
              }
              controller.enqueue(encoder.encode(p.text ?? p.textDelta ?? p.delta ?? ""));
            }
          }
          // If we got reasoning but no text followed, still send it
          if (thinking && reasoningBuffer && !reasoningSent) {
            controller.enqueue(encoder.encode(`__THINKING__${reasoningBuffer}__END_THINKING__\n`));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(wrappedStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
