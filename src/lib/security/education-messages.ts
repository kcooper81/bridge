/**
 * Educational messages shown when TeamPrompt blocks or warns on a DLP violation.
 * Each category has a "why" (risk explanation) and "fix" (what to do instead).
 */

export interface EducationMessage {
  why: string;
  fix: string;
}

const CATEGORY_EDUCATION: Record<string, EducationMessage> = {
  pii: {
    why: "Personal identifiable information (PII) like names, dates of birth, or Social Security numbers can be stored by AI providers and potentially exposed in data breaches.",
    fix: "Remove or replace personal details with generic placeholders before sending. For example, use '[Employee Name]' instead of the actual name.",
  },
  credentials: {
    why: "Passwords and login credentials sent to AI tools could be logged, cached, or included in training data — giving anyone with access a way into your systems.",
    fix: "Never paste real credentials into AI. Use placeholder text like '[PASSWORD]' if you need to reference one in a prompt.",
  },
  api_keys: {
    why: "API keys grant direct access to your services and cloud infrastructure. Once exposed, they can be used to read data, run up costs, or compromise systems.",
    fix: "Revoke and rotate any API key you may have already shared. Use '[API_KEY]' as a placeholder in prompts.",
  },
  secrets: {
    why: "Secrets like tokens, private keys, and connection strings provide access to databases, APIs, and internal systems. AI tools may retain these in logs.",
    fix: "Remove the secret from your message. If you need to discuss configuration, describe the format without including the actual value.",
  },
  health: {
    why: "Protected Health Information (PHI) is regulated under HIPAA. Sharing patient data with AI tools could result in compliance violations and legal liability.",
    fix: "De-identify the data first — remove patient names, dates, record numbers, and facility names. Use '[PATIENT]' style placeholders.",
  },
  financial: {
    why: "Financial data like account numbers, credit cards, and transaction details are regulated under PCI-DSS and other frameworks. Exposure could lead to fraud.",
    fix: "Use masked values (e.g., '****1234') or remove financial details entirely before sending to AI.",
  },
  internal_terms: {
    why: "Internal project names, code names, and proprietary terms could reveal strategic plans or confidential business information to external AI services.",
    fix: "Use generic descriptions instead of internal names. For example, 'the new product launch' instead of the actual project code name.",
  },
  internal: {
    why: "This content contains internal information that could expose company operations, infrastructure, or business strategy if shared externally.",
    fix: "Rewrite the prompt without internal specifics, or use the sanitized version with placeholders.",
  },
  custom: {
    why: "This content matches a custom policy defined by your organization's security team. It has been flagged as sensitive for your specific business context.",
    fix: "Review your organization's AI usage policy or contact your admin for guidance on how to rephrase this prompt safely.",
  },
};

const DEFAULT_EDUCATION: EducationMessage = {
  why: "This content was flagged by your organization's security policies as potentially sensitive.",
  fix: "Remove the flagged content and try again, or use the sanitized version if available.",
};

/** Get the educational message for a violation category */
export function getEducationMessage(category: string): EducationMessage {
  return CATEGORY_EDUCATION[category] || DEFAULT_EDUCATION;
}

/** Build a full educational context string for a violation */
export function buildViolationExplanation(
  ruleName: string,
  category: string,
  severity: string,
): string {
  const edu = getEducationMessage(category);
  const action = severity === "block" ? "blocked" : severity === "redact" ? "auto-redacted" : "flagged";
  return `${ruleName} was ${action}. ${edu.why} ${edu.fix}`;
}
