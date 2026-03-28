/**
 * LLM-based topic classification for DLP scanning.
 * Uses the org's configured AI provider to classify prompts against admin-defined topics.
 */

import type { SecuritySettings } from "@/lib/types";

export interface TopicMatch {
  topic: string;
  confidence: number; // 0-1
  severity: "block" | "warn";
  explanation: string;
}

/**
 * Classify a prompt against admin-defined sensitive topics using an LLM.
 * Returns matching topics with confidence scores.
 */
export async function classifyTopics(
  content: string,
  topics: string[],
  settings: SecuritySettings
): Promise<TopicMatch[]> {
  if (!settings.ai_detection_enabled) return [];
  if (!settings.ai_api_key) return [];
  if (topics.length === 0) return [];

  // Truncate content to avoid huge API calls
  const truncated = content.slice(0, 4000);

  const systemPrompt = `You are a data loss prevention classifier. Analyze the user's text and determine if it contains or discusses any of the following sensitive topics. For each topic that matches, return a JSON object with the topic name, a confidence score (0.0-1.0), a severity ("block" for high-risk data, "warn" for moderate risk), and a brief explanation.

Sensitive topics to check:
${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Respond ONLY with a JSON array. If no topics match, return [].
Example: [{"topic":"patient health information","confidence":0.95,"severity":"block","explanation":"Contains a patient name and diagnosis"}]`;

  try {
    const provider = settings.ai_detection_provider;

    if (provider === "openai") {
      return await callOpenAI(settings.ai_api_key, systemPrompt, truncated);
    } else if (provider === "anthropic") {
      return await callAnthropic(settings.ai_api_key, systemPrompt, truncated);
    }

    return [];
  } catch (error) {
    console.error("Topic classification error:", error);
    return [];
  }
}

async function callOpenAI(apiKey: string, systemPrompt: string, content: string): Promise<TopicMatch[]> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
      temperature: 0,
      max_tokens: 500,
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "[]";
  return parseResponse(text);
}

async function callAnthropic(apiKey: string, systemPrompt: string, content: string): Promise<TopicMatch[]> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const text = data.content?.[0]?.text || "[]";
  return parseResponse(text);
}

function parseResponse(text: string): TopicMatch[] {
  try {
    // Extract JSON array from response (LLM may wrap in markdown)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    const items = parsed.filter(
      (item: unknown): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null &&
        "topic" in item &&
        "confidence" in item
    );

    return items
      .map((item) => ({
        topic: String(item.topic),
        confidence: Number(item.confidence) || 0,
        severity: item.severity === "block" ? "block" as const : "warn" as const,
        explanation: String(item.explanation || ""),
      }))
      .filter((item) => item.confidence >= 0.7); // Only high-confidence matches
  } catch {
    return [];
  }
}
