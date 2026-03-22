import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function createAIModel(provider: string, model: string, apiKey: string) {
  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export interface ProviderModel {
  id: string;
  label: string;
  contextWindow: number;
}

export interface ProviderInfo {
  id: string;
  label: string;
  models: ProviderModel[];
}

export const PROVIDER_MODELS: Record<string, ProviderInfo> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    models: [
      { id: "gpt-4o", label: "GPT-4o", contextWindow: 128000 },
      { id: "gpt-4o-mini", label: "GPT-4o Mini", contextWindow: 128000 },
      { id: "gpt-4.1", label: "GPT-4.1", contextWindow: 1047576 },
      { id: "gpt-4.1-mini", label: "GPT-4.1 Mini", contextWindow: 1047576 },
      { id: "o3-mini", label: "o3-mini", contextWindow: 128000 },
      { id: "o3", label: "o3", contextWindow: 200000 },
      { id: "o1", label: "o1", contextWindow: 200000 },
    ],
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    models: [
      { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", contextWindow: 200000 },
      { id: "claude-opus-4-20250514", label: "Claude Opus 4", contextWindow: 200000 },
      { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", contextWindow: 200000 },
    ],
  },
  google: {
    id: "google",
    label: "Google",
    models: [
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", contextWindow: 1048576 },
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", contextWindow: 1048576 },
    ],
  },
};

/** Get all available models for configured providers */
export function getAvailableModels(
  configuredProviders: Array<{ provider: string; model_whitelist: string[] }>
): Array<{ provider: string; providerLabel: string; model: string; modelLabel: string }> {
  const result: Array<{ provider: string; providerLabel: string; model: string; modelLabel: string }> = [];

  for (const config of configuredProviders) {
    const info = PROVIDER_MODELS[config.provider];
    if (!info) continue;

    const allowedModels = config.model_whitelist.length > 0
      ? info.models.filter((m) => config.model_whitelist.includes(m.id))
      : info.models;

    for (const model of allowedModels) {
      result.push({
        provider: config.provider,
        providerLabel: info.label,
        model: model.id,
        modelLabel: model.label,
      });
    }
  }

  return result;
}
