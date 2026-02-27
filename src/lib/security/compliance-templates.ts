/**
 * Pre-built compliance templates for common regulatory frameworks
 * These can be installed by admins to quickly enable compliance-focused detection
 */

import type { SecurityCategory, SecurityPatternType, SecuritySeverity } from "@/lib/types";

export interface ComplianceRule {
  name: string;
  description: string;
  pattern: string;
  pattern_type: SecurityPatternType;
  category: SecurityCategory;
  severity: SecuritySeverity;
  /** Example input that this rule would catch — useful for testing */
  example: string;
}

export interface ComplianceTemplate {
  id: string;
  name: string;
  description: string;
  framework: "hipaa" | "gdpr" | "pci_dss" | "ccpa" | "sox" | "soc2" | "general";
  rules: ComplianceRule[];
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
        example: "Patient MRN: A12345678 was admitted on Monday",
      },
      {
        name: "Health Insurance ID",
        description: "Detects health insurance member IDs",
        pattern: "\\b(?:member|policy|insurance)\\s*(?:ID|#|number)[:\\s]*[A-Z0-9]{8,15}\\b",
        pattern_type: "regex",
        category: "health",
        severity: "block",
        example: "Member ID: XYZ123456789 for Blue Cross plan",
      },
      {
        name: "Diagnosis Code (ICD)",
        description: "Detects ICD-10 diagnosis codes",
        pattern: "\\b[A-Z]\\d{2}(?:\\.\\d{1,4})?\\b",
        pattern_type: "regex",
        category: "health",
        severity: "warn",
        example: "Diagnosis code J45.20 indicates moderate asthma",
      },
      {
        name: "Drug/Prescription Names",
        description: "Detects prescription drug references with dosage",
        pattern: "\\b(?:prescribed|taking|medication)[:\\s]+[A-Za-z]+\\s+\\d+\\s*(?:mg|ml|mcg)\\b",
        pattern_type: "regex",
        category: "health",
        severity: "warn",
        example: "Patient is taking Metformin 500 mg twice daily",
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
        example: "Please charge card 4111111111111111 for the order",
      },
      {
        name: "Credit Card Number (Mastercard)",
        description: "Detects Mastercard numbers",
        pattern: "\\b5[1-5][0-9]{14}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Customer's Mastercard is 5425233430109903",
      },
      {
        name: "Credit Card Number (Amex)",
        description: "Detects American Express card numbers",
        pattern: "\\b3[47][0-9]{13}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Amex card ending 378282246310005 was declined",
      },
      {
        name: "CVV/CVC Code",
        description: "Detects card verification codes",
        pattern: "\\b(?:CVV|CVC|CVV2|CVC2)[:\\s]*\\d{3,4}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "The CVV is 742 on the back of the card",
      },
      {
        name: "Card Expiration Date",
        description: "Detects card expiration dates",
        pattern: "\\b(?:exp(?:iry|iration)?)[:\\s]*(?:0[1-9]|1[0-2])[/\\-](?:\\d{2}|\\d{4})\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
        example: "Card expiry 09/2027, please update before then",
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
        example: "Her national ID: AB12345678 is on file",
      },
      {
        name: "EU Passport Number",
        description: "Detects European passport numbers",
        pattern: "\\b(?:passport)[:\\s#]*[A-Z]{1,2}[0-9]{6,9}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Passport #L987654321 expires next year",
      },
      {
        name: "IBAN (International Bank Account)",
        description: "Detects IBAN numbers",
        pattern: "\\b[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}(?:[A-Z0-9]?){0,16}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Wire to IBAN DE89370400440532013000 by Friday",
      },
      {
        name: "EU VAT Number",
        description: "Detects EU VAT identification numbers",
        pattern: "\\b(?:VAT)[:\\s]*[A-Z]{2}[A-Z0-9]{8,12}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Invoice VAT: DE123456789 for Acme GmbH",
      },
      {
        name: "Date of Birth",
        description: "Detects date of birth patterns",
        pattern: "\\b(?:DOB|D\\.O\\.B\\.|date of birth|born)[:\\s]*\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{2,4}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Date of birth: 15/03/1990, verified in system",
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
        example: "License number B1234567 was used for verification",
      },
      {
        name: "Social Security Number",
        description: "Detects US SSN patterns",
        pattern: "\\b\\d{3}[\\-\\s]?\\d{2}[\\-\\s]?\\d{4}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "SSN on file is 123-45-6789 for this applicant",
      },
      {
        name: "US Phone Number",
        description: "Detects US phone numbers",
        pattern: "\\b(?:\\+1[-.\\s]?)?\\(?[2-9]\\d{2}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Contact the client at (415) 555-0198 for follow-up",
      },
      {
        name: "Physical Address",
        description: "Detects US street addresses",
        pattern: "\\b\\d{1,5}\\s+[A-Za-z]+\\s+(?:St(?:reet)?|Ave(?:nue)?|Blvd|Dr(?:ive)?|Ln|Rd|Way)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Ship to 742 Evergreen Ave, Springfield IL 62704",
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
        example: "Send the report to jane.doe@acmecorp.com today",
      },
      {
        name: "Phone Number (International)",
        description: "Detects international phone numbers",
        pattern: "\\b\\+[1-9]\\d{1,14}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Call the vendor at +442071234567 for pricing",
      },
      {
        name: "IP Address",
        description: "Detects IPv4 addresses",
        pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "The production server is running on 192.168.1.42",
      },
      {
        name: "Geolocation Coordinates",
        description: "Detects GPS coordinates",
        pattern: "\\b[-+]?(?:[1-8]?\\d(?:\\.\\d+)?|90(?:\\.0+)?)[,\\s]+[-+]?(?:180(?:\\.0+)?|(?:1[0-7]\\d|[1-9]?\\d)(?:\\.\\d+)?)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Office is located at 37.7749, -122.4194 in SF",
      },
    ],
  },
  {
    id: "soc2",
    name: "SOC 2 Compliance",
    description: "Service Organization Control 2 — Protects access logs, encryption details, audit trails, and system configurations",
    framework: "soc2",
    rules: [
      {
        name: "Access Log Entry",
        description: "Detects access log patterns with timestamps and user identifiers",
        pattern: "\\b(?:access|auth)\\s*log[:\\s]+.*(?:user|uid|login)[:\\s=]+[A-Za-z0-9._@-]+",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "access log: 2026-02-27 user=admin@corp.io logged in from VPN",
      },
      {
        name: "Encryption Key Reference",
        description: "Detects encryption key material or references",
        pattern: "\\b(?:AES|RSA|HMAC|encryption)[\\s_-]*(?:key|secret|cert)[:\\s=]+[A-Za-z0-9+/=]{16,}",
        pattern_type: "regex",
        category: "secrets",
        severity: "block",
        example: "AES key: dGhpcyBpcyBhIHNlY3JldCBrZXkgZm9yIGVuYw==",
      },
      {
        name: "Audit Trail Data",
        description: "Detects audit trail entries with action and actor details",
        pattern: "\\b(?:audit|trail)[:\\s]+.*(?:action|event)[:\\s=]+\\w+.*(?:actor|by|user)[:\\s=]+",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "audit: action=delete_record by user=jsmith at 14:32",
      },
      {
        name: "System Configuration",
        description: "Detects system config details like connection strings and environment variables",
        pattern: "\\b(?:DATABASE_URL|REDIS_URL|SMTP_HOST|DB_PASSWORD|CONNECTION_STRING)[\\s=:]+\\S+",
        pattern_type: "regex",
        category: "secrets",
        severity: "block",
        example: "DATABASE_URL=postgres://admin:s3cret@db.internal:5432/prod",
      },
      {
        name: "Internal IP / Hostname",
        description: "Detects internal network addresses and hostnames",
        pattern: "\\b(?:10|172\\.(?:1[6-9]|2\\d|3[01])|192\\.168)\\.\\d{1,3}\\.\\d{1,3}\\b|\\b[a-z0-9-]+\\.internal(?:\\.[a-z]+)?\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Connect to api-gateway.internal.corp on 10.0.3.55",
      },
      {
        name: "Service Account Credentials",
        description: "Detects service account or IAM credentials",
        pattern: "\\b(?:service[_-]?account|iam[_-]?role|client[_-]?secret)[:\\s=]+[A-Za-z0-9+/=_-]{12,}",
        pattern_type: "regex",
        category: "credentials",
        severity: "block",
        example: "client_secret=aB3dEfGhIjKlMnOpQrStUv_xYz012345",
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
