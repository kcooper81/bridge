/**
 * Data Classification Levels
 * Industry-standard classification system for sensitive data
 * Based on NIST 800-53 and ISO 27001 frameworks
 */

export type ClassificationLevel = "public" | "internal" | "confidential" | "restricted";

export interface ClassificationConfig {
  level: ClassificationLevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  defaultAction: "allow" | "warn" | "block";
  examples: string[];
}

export const CLASSIFICATION_LEVELS: Record<ClassificationLevel, ClassificationConfig> = {
  public: {
    level: "public",
    label: "Public",
    description: "Information that can be freely shared externally",
    color: "text-green-600",
    bgColor: "bg-green-100",
    defaultAction: "allow",
    examples: [
      "Marketing materials",
      "Public website content",
      "Press releases",
      "Published research",
    ],
  },
  internal: {
    level: "internal",
    label: "Internal",
    description: "Information for internal use only, not for external sharing",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    defaultAction: "warn",
    examples: [
      "Internal memos",
      "Project documentation",
      "Meeting notes",
      "Internal policies",
    ],
  },
  confidential: {
    level: "confidential",
    label: "Confidential",
    description: "Sensitive business information requiring protection",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    defaultAction: "warn",
    examples: [
      "Financial reports",
      "Customer lists",
      "Strategic plans",
      "Employee records",
    ],
  },
  restricted: {
    level: "restricted",
    label: "Restricted",
    description: "Highly sensitive data requiring strict access controls",
    color: "text-red-600",
    bgColor: "bg-red-100",
    defaultAction: "block",
    examples: [
      "Trade secrets",
      "PII/PHI data",
      "Credentials & keys",
      "Legal privileged info",
    ],
  },
};

/**
 * Map security categories to default classification levels
 */
export const CATEGORY_TO_CLASSIFICATION: Record<string, ClassificationLevel> = {
  api_keys: "restricted",
  credentials: "restricted",
  secrets: "restricted",
  pii: "restricted",
  health: "restricted",
  financial: "confidential",
  internal: "internal",
  internal_terms: "confidential",
  custom: "confidential",
};

/**
 * Get classification level for a security category
 */
export function getClassificationForCategory(category: string): ClassificationLevel {
  return CATEGORY_TO_CLASSIFICATION[category] || "internal";
}

/**
 * Get classification config
 */
export function getClassificationConfig(level: ClassificationLevel): ClassificationConfig {
  return CLASSIFICATION_LEVELS[level];
}

/**
 * Compare classification levels (higher = more sensitive)
 */
export function compareClassificationLevels(a: ClassificationLevel, b: ClassificationLevel): number {
  const order: ClassificationLevel[] = ["public", "internal", "confidential", "restricted"];
  return order.indexOf(a) - order.indexOf(b);
}

/**
 * Check if a classification level requires blocking
 */
export function shouldBlockByClassification(level: ClassificationLevel): boolean {
  return CLASSIFICATION_LEVELS[level].defaultAction === "block";
}
