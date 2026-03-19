import { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import { createAIModel } from "@/lib/ai/providers";
import { decrypt } from "@/lib/crypto";
import { notifyDlpViolation } from "@/lib/slack/notify";

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
    const { messages, model, provider, conversationId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the latest user message for DLP scanning
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");

    // Load org settings (needed for DLP + system prompt)
    const { data: orgData } = await db
      .from("organizations")
      .select("settings")
      .eq("id", profile.org_id)
      .single();
    const orgSettings = (orgData?.settings || {}) as Record<string, unknown>;

    if (lastUserMessage) {
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
          try {
            const regex = new RegExp(rule.pattern, "gi");
            if (regex.test(lastUserMessage.content)) {
              violations.push({ ruleName: rule.name, category: rule.category, severity: rule.severity });
            }
          } catch { /* invalid regex */ }
        }

        // Check sensitive terms
        for (const term of termsResult.data || []) {
          const content = lastUserMessage.content.toLowerCase();
          if (term.term_type === "keyword" || term.term_type === "exact") {
            if (content.includes(term.term.toLowerCase())) {
              violations.push({ ruleName: `Sensitive term: "${term.term}"`, category: term.category, severity: term.severity });
            }
          } else if (term.term_type === "regex") {
            try {
              if (new RegExp(term.term, "gi").test(lastUserMessage.content)) {
                violations.push({ ruleName: `Pattern: "${term.term}"`, category: term.category, severity: term.severity });
              }
            } catch { /* skip */ }
          }
        }

        const hasBlock = violations.some((v) => v.severity === "block");
        const overrideDisabled = orgSettings.allow_guardrail_override === false;

        if (hasBlock || (overrideDisabled && violations.length > 0)) {
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

    // Create/update conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv } = await db
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

    // Load org system prompt if set
    const orgSystemPrompt = orgSettings.ai_system_prompt as string | undefined;

    // Check for admin context injection (from slash commands)
    const adminContext = body.adminContext as string | undefined;

    // Stream AI response
    const aiModel = createAIModel(provider || "openai", selectedModel, apiKey);

    // Build system messages
    const systemMessages: Array<{ role: "system"; content: string }> = [];
    if (orgSystemPrompt) {
      systemMessages.push({ role: "system", content: orgSystemPrompt });
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
        // Save assistant message
        if (convId) {
          await db.from("chat_messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: text,
            model: selectedModel,
            tokens_used: (usage?.totalTokens) || 0,
          });

          // Update conversation timestamp
          await db.from("chat_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);
        }

        // Log to conversation_logs for audit
        try {
          await db.from("conversation_logs").insert({
            org_id: profile.org_id,
            user_id: user.id,
            ai_tool: "teamprompt_chat",
            action: "sent",
            metadata: { model: selectedModel, provider: provider || "openai", tokens: usage?.totalTokens || 0 },
          });
        } catch { /* non-critical */ }
      },
    });

    const textStream = result.toTextStreamResponse();

    // Wrap the stream to prepend conversation ID as first line
    if (convId) {
      const reader = textStream.body!.getReader();
      const encoder = new TextEncoder();
      const prefix = encoder.encode(`__CONV_ID__${convId}__\n`);
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
