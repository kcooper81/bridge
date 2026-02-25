// TeamPrompt — Shared Variable Utilities
// Used by prompt-modal, fill-template-modal, vault-api, and extension

import type { VariableConfig } from "@/lib/types";

/**
 * Extract `{{variable_name}}` tokens from prompt content.
 * Returns deduplicated names in order of first appearance.
 */
export function extractTemplateVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/^\{\{|\}\}$/g, "").trim());
  return Array.from(new Set(vars));
}

/**
 * Normalize the DB `template_variables` JSONB column.
 * Handles both legacy `string[]` format and new `VariableConfig[]` format.
 */
export function normalizeVariables(raw: unknown): VariableConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      return { name: item };
    }
    if (typeof item === "object" && item !== null && "name" in item) {
      return item as VariableConfig;
    }
    return { name: String(item) };
  });
}

/**
 * Convert snake_case to Title Case.
 * `"project_name"` → `"Project Name"`
 */
export function snakeToTitleCase(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Return the display label for a variable.
 * Uses explicit label if set, otherwise auto-generates title case from the name.
 */
export function getDisplayLabel(v: VariableConfig): string {
  return v.label?.trim() || snakeToTitleCase(v.name);
}

/**
 * Merge detected variable names with existing config metadata.
 * - Preserves user-edited labels, descriptions, and defaults for existing vars
 * - Adds new configs for newly detected vars
 * - Drops configs for variables no longer in content
 */
export function mergeVariablesWithMetadata(
  detectedNames: string[],
  existingConfigs: VariableConfig[]
): VariableConfig[] {
  const existingMap = new Map(existingConfigs.map((c) => [c.name, c]));
  return detectedNames.map((name) => existingMap.get(name) ?? { name });
}

/**
 * Replace all `{{key}}` tokens with their values.
 * Unmatched tokens are left as-is.
 */
export function fillTemplate(
  content: string,
  values: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
