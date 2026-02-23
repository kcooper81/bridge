/**
 * Pre-built compliance templates for common regulatory frameworks
 * These can be installed by admins to quickly enable compliance-focused detection
 */

import type { SecurityCategory, SecurityPatternType, SecuritySeverity } from "@/lib/types";

export interface ComplianceTemplate {
  id: string;
  name: string;
  description: string;
  framework: "hipaa" | "gdpr" | "pci_dss" | "ccpa" | "sox" | "general";
  rules: Array<{
    name: string;
    description: string;
    pattern: string;
    pattern_type: SecurityPatternType;
    category: SecurityCategory;
    severity: SecuritySeverity;
  }>;
}

export const COMPLIANCE_TEMPLATES: ComplianceTemplate[] = [
  {
    id: "hipaa",
    name: "HIPAA Compliance",
    description: "Health Insurance Portability and Accountability Act - Protects PHI and medical information",
    framework: "hipaa",
    rules: [
      {
        name: "Medical Record Number",
        description: "Detects medical record number patterns",
        pattern: "\\b(?:MRN|medical record)[:\\s#]*[A-Z0-9]{6,12}\\b",
        pattern_type: "regex",
        category: "health",
        severity: "block",
      },
      {
        name: "Health Insurance ID",
        description: "Detects health insurance member IDs",
        pattern: "\\b(?:member|policy|insurance)\\s*(?:ID|#|number)[:\\s]*[A-Z0-9]{8,15}\\b",
        pattern_type: "regex",
        category: "health",
        severity: "block",
      },
      {
        name: "Diagnosis Code (ICD)",
        description: "Detects ICD-10 diagnosis codes",
        pattern: "\\b[A-Z]\\d{2}(?:\\.\\d{1,4})?\\b",
        pattern_type: "regex",
        category: "health",
        severity: "warn",
      },
      {
        name: "Drug/Prescription Names",
        description: "Detects prescription drug references with dosage",
        pattern: "\\b(?:prescribed|taking|medication)[:\\s]+[A-Za-z]+\\s+\\d+\\s*(?:mg|ml|mcg)\\b",
        pattern_type: "regex",
        category: "health",
        severity: "warn",
      },
    ],
  },
  {
    id: "pci_dss",
    name: "PCI-DSS Compliance",
    description: "Payment Card Industry Data Security Standard - Protects cardholder data",
    framework: "pci_dss",
    rules: [
      {
        name: "Credit Card Number (Visa)",
        description: "Detects Visa card numbers",
        pattern: "\\b4[0-9]{12}(?:[0-9]{3})?\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
      },
      {
        name: "Credit Card Number (Mastercard)",
        description: "Detects Mastercard numbers",
        pattern: "\\b5[1-5][0-9]{14}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
      },
      {
        name: "Credit Card Number (Amex)",
        description: "Detects American Express card numbers",
        pattern: "\\b3[47][0-9]{13}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
      },
      {
        name: "CVV/CVC Code",
        description: "Detects card verification codes",
        pattern: "\\b(?:CVV|CVC|CVV2|CVC2)[:\\s]*\\d{3,4}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
      },
      {
        name: "Card Expiration Date",
        description: "Detects card expiration dates",
        pattern: "\\b(?:exp(?:iry|iration)?)[:\\s]*(?:0[1-9]|1[0-2])[/\\-](?:\\d{2}|\\d{4})\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
      },
    ],
  },
  {
    id: "gdpr",
    name: "GDPR Compliance",
    description: "General Data Protection Regulation - Protects EU personal data",
    framework: "gdpr",
    rules: [
      {
        name: "EU National ID",
        description: "Detects European national ID patterns",
        pattern: "\\b(?:national\\s*ID|ID\\s*number)[:\\s]*[A-Z0-9]{6,12}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
      },
      {
        name: "EU Passport Number",
        description: "Detects European passport numbers",
        pattern: "\\b(?:passport)[:\\s#]*[A-Z]{1,2}[0-9]{6,9}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
      },
      {
        name: "IBAN (International Bank Account)",
        description: "Detects IBAN numbers",
        pattern: "\\b[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}(?:[A-Z0-9]?){0,16}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
      },
      {
        name: "EU VAT Number",
        description: "Detects EU VAT identification numbers",
        pattern: "\\b(?:VAT)[:\\s]*[A-Z]{2}[A-Z0-9]{8,12}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
      {
        name: "Date of Birth",
        description: "Detects date of birth patterns",
        pattern: "\\b(?:DOB|D\\.O\\.B\\.|date of birth|born)[:\\s]*\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{2,4}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
    ],
  },
  {
    id: "ccpa",
    name: "CCPA Compliance",
    description: "California Consumer Privacy Act - Protects California resident data",
    framework: "ccpa",
    rules: [
      {
        name: "California Driver License",
        description: "Detects California driver license numbers",
        pattern: "\\b[A-Z]\\d{7}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
      },
      {
        name: "Social Security Number",
        description: "Detects US SSN patterns",
        pattern: "\\b\\d{3}[\\-\\s]?\\d{2}[\\-\\s]?\\d{4}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
      },
      {
        name: "US Phone Number",
        description: "Detects US phone numbers",
        pattern: "\\b(?:\\+1[-.\\s]?)?\\(?[2-9]\\d{2}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
      {
        name: "Physical Address",
        description: "Detects US street addresses",
        pattern: "\\b\\d{1,5}\\s+[A-Za-z]+\\s+(?:St(?:reet)?|Ave(?:nue)?|Blvd|Dr(?:ive)?|Ln|Rd|Way)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
    ],
  },
  {
    id: "general_pii",
    name: "General PII Protection",
    description: "Common personally identifiable information patterns",
    framework: "general",
    rules: [
      {
        name: "Email Address",
        description: "Detects email addresses",
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
      {
        name: "Phone Number (International)",
        description: "Detects international phone numbers",
        pattern: "\\b\\+[1-9]\\d{1,14}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
      {
        name: "IP Address",
        description: "Detects IPv4 addresses",
        pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
      },
      {
        name: "Geolocation Coordinates",
        description: "Detects GPS coordinates",
        pattern: "\\b[-+]?(?:[1-8]?\\d(?:\\.\\d+)?|90(?:\\.0+)?)[,\\s]+[-+]?(?:180(?:\\.0+)?|(?:1[0-7]\\d|[1-9]?\\d)(?:\\.\\d+)?)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
      },
    ],
  },
];

/**
 * Get compliance template by ID
 */
export function getComplianceTemplate(id: string): ComplianceTemplate | undefined {
  return COMPLIANCE_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get all templates for a specific framework
 */
export function getTemplatesByFramework(framework: ComplianceTemplate["framework"]): ComplianceTemplate[] {
  return COMPLIANCE_TEMPLATES.filter((t) => t.framework === framework);
}
