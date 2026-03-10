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
  framework: "hipaa" | "gdpr" | "pci_dss" | "ccpa" | "sox" | "soc2" | "general" | "ferpa" | "glba" | "nist" | "fedramp" | "naic" | "itar" | "cjis" | "coppa" | "ftc";
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
  // ─── Education ───
  {
    id: "ferpa",
    name: "FERPA Compliance",
    description: "Family Educational Rights and Privacy Act — Protects student education records and PII",
    framework: "ferpa",
    rules: [
      {
        name: "Student ID Number",
        description: "Detects student ID or enrollment numbers",
        pattern: "\\b(?:student|enrollment|pupil)\\s*(?:ID|#|number)[:\\s]*[A-Z0-9]{5,12}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Student ID: STU2024-78432 was flagged for academic hold",
      },
      {
        name: "Grade/GPA Record",
        description: "Detects GPA and grade records with student identifiers",
        pattern: "\\b(?:GPA|grade|transcript)[:\\s]+\\d\\.\\d{1,2}\\b|\\b(?:grade)[:\\s]+[A-F][+-]?\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Student GPA: 3.85, Dean's list eligible this semester",
      },
      {
        name: "Financial Aid Information",
        description: "Detects financial aid and FAFSA-related data",
        pattern: "\\b(?:FAFSA|financial\\s*aid|Pell\\s*Grant|scholarship)\\s*(?:ID|amount|award)?[:\\s]*\\$?[\\d,]+(?:\\.\\d{2})?\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "FAFSA: $12,500 awarded, Pell Grant amount $3,200",
      },
      {
        name: "Disciplinary Record",
        description: "Detects student disciplinary action references",
        pattern: "\\b(?:disciplinary|suspension|expulsion|probation)\\s*(?:record|action|hearing|notice)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Disciplinary record shows suspension hearing on 3/15",
      },
      {
        name: "Parent/Guardian PII",
        description: "Detects parent or guardian personal information in education context",
        pattern: "\\b(?:parent|guardian|mother|father)[:\\s]+[A-Z][a-z]+\\s+[A-Z][a-z]+.*(?:phone|email|address|SSN)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Parent: Jane Smith, phone 555-0123, emergency contact",
      },
    ],
  },

  // ─── Finance & Banking ───
  {
    id: "glba",
    name: "GLBA Compliance",
    description: "Gramm-Leach-Bliley Act — Protects consumers' nonpublic personal financial information",
    framework: "glba",
    rules: [
      {
        name: "Bank Account Number",
        description: "Detects bank account numbers",
        pattern: "\\b(?:account|acct)\\s*(?:#|number|no\\.?)?[:\\s]*\\d{8,17}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Wire to account #1234567890123 at Chase Bank",
      },
      {
        name: "Routing Number (ABA)",
        description: "Detects ABA routing transit numbers",
        pattern: "\\b(?:routing|ABA|transit)\\s*(?:#|number|no\\.?)?[:\\s]*\\d{9}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Routing number: 021000021 for JPMorgan Chase",
      },
      {
        name: "Loan/Mortgage Reference",
        description: "Detects loan and mortgage account references",
        pattern: "\\b(?:loan|mortgage)\\s*(?:#|number|ID|ref)[:\\s]*[A-Z0-9]{6,15}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Mortgage #LN20240315789 balance is $245,000",
      },
      {
        name: "Credit Score",
        description: "Detects credit score references",
        pattern: "\\b(?:credit\\s*score|FICO|TransUnion|Equifax|Experian)[:\\s]*\\d{3}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
        example: "FICO score: 742, approved for premium card",
      },
      {
        name: "Tax ID / EIN",
        description: "Detects employer identification numbers and tax IDs",
        pattern: "\\b(?:EIN|TIN|tax\\s*ID)[:\\s]*\\d{2}[\\-\\s]?\\d{7}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Company EIN: 12-3456789 filed quarterly return",
      },
    ],
  },

  // ─── Government / Federal ───
  {
    id: "nist_800_171",
    name: "NIST 800-171 / CUI",
    description: "National Institute of Standards and Technology — Protects Controlled Unclassified Information (CUI)",
    framework: "nist",
    rules: [
      {
        name: "CUI Marking",
        description: "Detects CUI markings and controlled distribution statements",
        pattern: "\\b(?:CUI|CONTROLLED|FOUO|FOR OFFICIAL USE ONLY|NOFORN|DISTRIBUTION\\s+(?:A|B|C|D|E|F))\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "CUI // SP-PRVCY - CONTROLLED, NOFORN distribution",
      },
      {
        name: "Federal Contract Number",
        description: "Detects federal contract and grant numbers",
        pattern: "\\b(?:contract|grant|PIID|award)\\s*(?:#|number)?[:\\s]*[A-Z0-9]{2,4}[\\-][A-Z0-9]{4,}[\\-][A-Z0-9]+\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Contract #FA8750-21-C-0502 was awarded to Acme Corp",
      },
      {
        name: "Classification Markings",
        description: "Detects classification and sensitivity markings",
        pattern: "\\b(?:TOP SECRET|SECRET|CONFIDENTIAL|UNCLASSIFIED)(?:\\/\\/[A-Z]+)*\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "SECRET//NOFORN - This document contains classified info",
      },
      {
        name: "Government System Identifier",
        description: "Detects government system names and identifiers",
        pattern: "\\b(?:SIPR|NIPR|JWICS|SIPRNet|NIPRNet|CAC)\\s*(?:access|token|network|cert)?\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "Access via SIPRNet required for this document",
      },
      {
        name: "CAGE / DUNS Code",
        description: "Detects CAGE codes and DUNS numbers used in government contracting",
        pattern: "\\b(?:CAGE|DUNS|UEI)[:\\s]*[A-Z0-9]{5,13}\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Contractor CAGE: 1ABC2, DUNS: 123456789",
      },
    ],
  },
  {
    id: "fedramp",
    name: "FedRAMP Compliance",
    description: "Federal Risk and Authorization Management Program — Protects cloud service data for federal agencies",
    framework: "fedramp",
    rules: [
      {
        name: "FedRAMP Authorization ID",
        description: "Detects FedRAMP package and authorization identifiers",
        pattern: "\\b(?:FedRAMP|FR)\\s*(?:ID|auth|package|ATO)[:\\s]*[A-Z0-9\\-]{6,20}\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "FedRAMP auth: FR-2024-ATO-0042 for cloud service",
      },
      {
        name: "POAM / Risk Finding",
        description: "Detects Plan of Action and Milestones entries",
        pattern: "\\b(?:POA&?M|POAM|risk\\s*finding)\\s*(?:#|ID)?[:\\s]*[A-Z0-9\\-]{3,15}\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "POAM: RF-2024-007, remediation due by Q2",
      },
      {
        name: "Cloud Infrastructure Detail",
        description: "Detects AWS/Azure/GCP account IDs and resource identifiers",
        pattern: "\\b(?:arn:aws|projects/[a-z\\-]+/|subscriptions/[a-f0-9\\-]{36})\\b|\\b(?:aws_access_key_id|aws_secret_access_key)[\\s=:]+\\S+",
        pattern_type: "regex",
        category: "secrets",
        severity: "block",
        example: "arn:aws:iam::123456789012:role/FedRAMP-Admin",
      },
      {
        name: "Boundary Diagram Reference",
        description: "Detects system boundary and network architecture references",
        pattern: "\\b(?:system\\s*boundary|authorization\\s*boundary|data\\s*flow)\\s*(?:diagram|doc|SSP)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Refer to system boundary diagram SSP-v3.2 section 9",
      },
    ],
  },

  // ─── Insurance ───
  {
    id: "naic",
    name: "NAIC Model Law",
    description: "National Association of Insurance Commissioners — Protects insurance consumer data and policyholder information",
    framework: "naic",
    rules: [
      {
        name: "Insurance Policy Number",
        description: "Detects insurance policy identifiers",
        pattern: "\\b(?:policy|POL)\\s*(?:#|number|no\\.?)?[:\\s]*[A-Z]{2,4}[\\-]?\\d{6,12}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Policy #HO-2024567890 for homeowner coverage",
      },
      {
        name: "Claims Number",
        description: "Detects insurance claim reference numbers",
        pattern: "\\b(?:claim|CLM)\\s*(?:#|number|no\\.?)?[:\\s]*[A-Z0-9]{6,15}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Claim #CLM20240315A opened for water damage",
      },
      {
        name: "Beneficiary Information",
        description: "Detects beneficiary names with policy context",
        pattern: "\\b(?:beneficiary|insured|policyholder)[:\\s]+[A-Z][a-z]+\\s+[A-Z][a-z]+\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Primary beneficiary: John Smith, 60% allocation",
      },
      {
        name: "Premium / Coverage Amount",
        description: "Detects insurance premium and coverage dollar amounts with context",
        pattern: "\\b(?:premium|deductible|coverage|limit|payout)[:\\s]*\\$[\\d,]+(?:\\.\\d{2})?\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
        example: "Annual premium: $2,450.00, deductible: $1,000",
      },
    ],
  },

  // ─── Defense / Exports ───
  {
    id: "itar",
    name: "ITAR Compliance",
    description: "International Traffic in Arms Regulations — Controls export of defense articles and services",
    framework: "itar",
    rules: [
      {
        name: "ITAR Marking",
        description: "Detects ITAR export control markings",
        pattern: "\\b(?:ITAR|USML|EAR99|ECCN|export\\s*controlled?)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "ITAR controlled — do not share with foreign nationals",
      },
      {
        name: "USML Category Reference",
        description: "Detects US Munitions List category references",
        pattern: "\\bUSML\\s*(?:Category|Cat\\.?)\\s*(?:I{1,3}|IV|V|VI{0,3}|IX|X{1,3}|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "This falls under USML Category XI — military electronics",
      },
      {
        name: "Defense Article Technical Data",
        description: "Detects references to defense technical data packages",
        pattern: "\\b(?:technical\\s*data\\s*package|TDP|defense\\s*article)\\s*(?:#|ref)?[:\\s]*[A-Z0-9\\-]+\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "TDP: MIL-STD-1553B-REV3 for avionics interface",
      },
      {
        name: "ECCN Classification",
        description: "Detects Export Control Classification Numbers",
        pattern: "\\bECCN[:\\s]*\\d[A-E]\\d{3}(?:\\.[a-z])?\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Classified under ECCN 3A001.a for microprocessors",
      },
    ],
  },

  // ─── Law Enforcement ───
  {
    id: "cjis",
    name: "CJIS Security Policy",
    description: "Criminal Justice Information Services — Protects criminal history and law enforcement data",
    framework: "cjis",
    rules: [
      {
        name: "Criminal Record / Rap Sheet",
        description: "Detects criminal history record references",
        pattern: "\\b(?:rap\\s*sheet|criminal\\s*(?:history|record)|arrest\\s*record|booking\\s*(?:#|number))\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Criminal history record shows prior arrest in 2019",
      },
      {
        name: "NCIC Number",
        description: "Detects NCIC (National Crime Information Center) identifiers",
        pattern: "\\b(?:NCIC|NIC|ORI)[:\\s]*[A-Z0-9]{7,10}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "NCIC: W123456789, flagged in wanted persons file",
      },
      {
        name: "FBI Number",
        description: "Detects FBI identification numbers",
        pattern: "\\b(?:FBI)\\s*(?:#|number|no\\.?)?[:\\s]*\\d{6,9}[A-Z]?\\d?\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "FBI #: 123456A7 on file for background check",
      },
      {
        name: "Fingerprint / Biometric ID",
        description: "Detects fingerprint and biometric identifiers",
        pattern: "\\b(?:fingerprint|biometric|AFIS)\\s*(?:ID|#|record|match)[:\\s]*[A-Z0-9\\-]{5,15}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "AFIS match: FP-2024-00892 confirmed identity",
      },
    ],
  },

  // ─── Children's Privacy ───
  {
    id: "coppa",
    name: "COPPA Compliance",
    description: "Children's Online Privacy Protection Act — Protects personal information of children under 13",
    framework: "coppa",
    rules: [
      {
        name: "Child Age Identifier",
        description: "Detects age references for minors in data context",
        pattern: "\\b(?:age|born|DOB)[:\\s]*(?:[1-9]|1[0-2])\\s*(?:years?\\s*old|yo|y\\.o\\.)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "User age: 9 years old, requires parental consent",
      },
      {
        name: "Parental Consent Record",
        description: "Detects parental consent and COPPA verification references",
        pattern: "\\b(?:parental\\s*consent|COPPA\\s*(?:consent|verification)|verifiable\\s*consent)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Parental consent received on 2/15, COPPA verification complete",
      },
      {
        name: "Minor's School Name",
        description: "Detects school names combined with student context",
        pattern: "\\b(?:school|elementary|middle\\s*school|kindergarten)[:\\s]+[A-Z][A-Za-z\\s]+(?:School|Academy|Elementary)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Enrolled at Lincoln Elementary School, grade 3",
      },
      {
        name: "Screen Name / Username (Minor)",
        description: "Detects usernames or screen names in child-data context",
        pattern: "\\b(?:screen\\s*name|username|gamer\\s*tag|display\\s*name)[:\\s]+\\S+.*(?:child|minor|under\\s*13)\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "block",
        example: "Screen name: CoolKid99, flagged as under 13 account",
      },
    ],
  },

  // ─── Retail / E-Commerce ───
  {
    id: "ftc_retail",
    name: "FTC / Retail Data Protection",
    description: "Federal Trade Commission guidelines — Protects consumer purchase history, loyalty data, and personal shopping information",
    framework: "ftc",
    rules: [
      {
        name: "Loyalty / Rewards Number",
        description: "Detects loyalty program and rewards account numbers",
        pattern: "\\b(?:loyalty|rewards?|membership)\\s*(?:#|number|ID|acct)[:\\s]*[A-Z0-9]{6,15}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Rewards #: LOYAL-8834572 has 12,500 points balance",
      },
      {
        name: "Purchase / Order Data",
        description: "Detects order numbers combined with personal information",
        pattern: "\\b(?:order|purchase|transaction)\\s*(?:#|number|ID)[:\\s]*[A-Z0-9\\-]{6,20}\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Order #ORD-2024-0315-7842 shipped to home address",
      },
      {
        name: "Payment Token / Stored Card",
        description: "Detects payment tokens and stored card references",
        pattern: "\\b(?:payment\\s*token|stored\\s*card|card\\s*on\\s*file|token)[:\\s]*(?:tok_|pm_|card_)[A-Za-z0-9]{10,30}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Payment token: tok_1MqR8e2eZvKYlo2C for recurring charge",
      },
      {
        name: "Shipping / Billing Address",
        description: "Detects shipping and billing address patterns",
        pattern: "\\b(?:ship(?:ping)?|billing?)\\s*(?:address|addr\\.?)[:\\s]+\\d{1,5}\\s+[A-Za-z]",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Shipping address: 742 Maple Drive, Portland OR 97201",
      },
    ],
  },

  // ─── Healthcare Extended ───
  {
    id: "hitech",
    name: "HITECH Act",
    description: "Health Information Technology for Economic and Clinical Health — Extends HIPAA protections for electronic health records",
    framework: "hipaa",
    rules: [
      {
        name: "EHR System Identifier",
        description: "Detects Electronic Health Record system identifiers and patient chart numbers",
        pattern: "\\b(?:EHR|EMR|chart)\\s*(?:#|number|ID)[:\\s]*[A-Z0-9]{6,15}\\b",
        pattern_type: "regex",
        category: "health",
        severity: "block",
        example: "EHR #: CHT20240315 shows allergy to penicillin",
      },
      {
        name: "Lab Result with Patient Context",
        description: "Detects lab test results with identifiable context",
        pattern: "\\b(?:lab\\s*result|test\\s*result|pathology)\\s*(?:#|ID)?[:\\s].*(?:positive|negative|abnormal|normal)\\b",
        pattern_type: "regex",
        category: "health",
        severity: "block",
        example: "Lab result #LR-5589: glucose test — abnormal, 280 mg/dL",
      },
      {
        name: "Provider NPI Number",
        description: "Detects National Provider Identifier numbers",
        pattern: "\\b(?:NPI)[:\\s]*\\d{10}\\b",
        pattern_type: "regex",
        category: "health",
        severity: "warn",
        example: "Referring physician NPI: 1234567890, Dr. Smith",
      },
      {
        name: "Health Plan Beneficiary Number",
        description: "Detects Medicare/Medicaid beneficiary numbers",
        pattern: "\\b(?:MBI|Medicare|Medicaid)\\s*(?:#|ID|beneficiary)?[:\\s]*[A-Z0-9]{11,12}\\b",
        pattern_type: "regex",
        category: "health",
        severity: "block",
        example: "Medicare MBI: 1EG4-TE5-MK72 for Part B coverage",
      },
    ],
  },

  // ─── SOX (Sarbanes-Oxley) ───
  {
    id: "sox",
    name: "SOX Compliance",
    description: "Sarbanes-Oxley Act — Protects financial reporting data and internal controls documentation",
    framework: "sox",
    rules: [
      {
        name: "Financial Statement Data",
        description: "Detects unreleased financial figures and reporting data",
        pattern: "\\b(?:revenue|net\\s*income|EBITDA|earnings|quarterly\\s*results)[:\\s]*\\$[\\d,]+(?:\\.\\d{2})?\\s*(?:million|billion|M|B|K)?\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Q3 revenue: $45.2 million, net income $8.1M pre-release",
      },
      {
        name: "Internal Audit Finding",
        description: "Detects internal audit findings and control deficiency reports",
        pattern: "\\b(?:material\\s*weakness|significant\\s*deficiency|control\\s*deficiency|audit\\s*finding)\\s*(?:#|ref)?[:\\s]*[A-Z0-9\\-]*\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "Material weakness MW-2024-03 in revenue recognition process",
      },
      {
        name: "Board / Committee Minutes",
        description: "Detects references to confidential board meeting content",
        pattern: "\\b(?:board\\s*(?:meeting|minutes|resolution)|audit\\s*committee|compensation\\s*committee)\\s*(?:minutes|notes|agenda|resolution)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Board meeting minutes from 3/10 discuss acquisition terms",
      },
      {
        name: "SEC Filing Draft",
        description: "Detects draft SEC filing references",
        pattern: "\\b(?:10-K|10-Q|8-K|S-1|proxy\\s*statement)\\s*(?:draft|filing|amendment)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "10-K draft filing pending legal review before submission",
      },
    ],
  },

  // ─── Real Estate ───
  {
    id: "respa_tila",
    name: "RESPA / TILA (Real Estate)",
    description: "Real Estate Settlement Procedures Act & Truth in Lending Act — Protects mortgage and settlement data",
    framework: "glba",
    rules: [
      {
        name: "Closing Disclosure Data",
        description: "Detects closing disclosure and settlement statement information",
        pattern: "\\b(?:closing\\s*disclosure|settlement\\s*statement|HUD-1|CD\\s*form)\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
        example: "Closing disclosure shows APR of 6.875% on 30yr fixed",
      },
      {
        name: "Property Address with Financial",
        description: "Detects property addresses combined with financial terms",
        pattern: "\\b(?:property|parcel|lot)\\s*(?:address|#)?[:\\s]+\\d{1,5}\\s+[A-Za-z]+.*(?:appraisal|assessed|lien|mortgage)\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
        example: "Property: 123 Oak St, appraisal value $385,000",
      },
      {
        name: "Title / Escrow Number",
        description: "Detects title and escrow reference numbers",
        pattern: "\\b(?:title|escrow)\\s*(?:#|number|order|ref)[:\\s]*[A-Z0-9\\-]{6,15}\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "warn",
        example: "Escrow #: ESC-2024-88573, closing scheduled 3/28",
      },
    ],
  },

  // ─── Legal / Attorney-Client ───
  {
    id: "legal_privilege",
    name: "Legal Privilege Protection",
    description: "Protects attorney-client privileged communications, case files, and legal hold data",
    framework: "general",
    rules: [
      {
        name: "Attorney-Client Privilege Marking",
        description: "Detects privilege markings on legal communications",
        pattern: "\\b(?:ATTORNEY[\\-\\s]CLIENT\\s*PRIVIL|PRIVILEGED|WORK\\s*PRODUCT|LITIGATION\\s*HOLD)\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "block",
        example: "ATTORNEY-CLIENT PRIVILEGED — do not forward or disclose",
      },
      {
        name: "Case / Matter Number",
        description: "Detects legal case and matter reference numbers",
        pattern: "\\b(?:case|matter|docket)\\s*(?:#|number|no\\.?)[:\\s]*[A-Z0-9\\-]{4,20}\\b",
        pattern_type: "regex",
        category: "internal",
        severity: "warn",
        example: "Matter #LIT-2024-0042, discovery deadline approaching",
      },
      {
        name: "Settlement Amount",
        description: "Detects settlement and judgment dollar amounts",
        pattern: "\\b(?:settlement|judgment|verdict|damages)\\s*(?:amount|offer)?[:\\s]*\\$[\\d,]+(?:\\.\\d{2})?\\b",
        pattern_type: "regex",
        category: "financial",
        severity: "block",
        example: "Settlement offer: $1,250,000 pending board approval",
      },
      {
        name: "Opposing Counsel / Party Info",
        description: "Detects opposing party and counsel references",
        pattern: "\\b(?:opposing\\s*counsel|plaintiff|defendant|co-defendant)[:\\s]+[A-Z][a-z]+\\s+[A-Z][a-z]+\\b",
        pattern_type: "regex",
        category: "pii",
        severity: "warn",
        example: "Opposing counsel: Robert Chen of Baker & Associates",
      },
    ],
  },
];

/**
 * Industry groupings for the "Browse All Packs" UI
 */
export interface PackGroup {
  label: string;
  description: string;
  packIds: string[];
}

export const PACK_GROUPS: PackGroup[] = [
  { label: "Healthcare", description: "HIPAA, HITECH, and related health data protections", packIds: ["hipaa", "hitech"] },
  { label: "Education", description: "FERPA and student data privacy protections", packIds: ["ferpa"] },
  { label: "Finance & Banking", description: "GLBA, PCI-DSS, SOX and financial data protections", packIds: ["glba", "pci_dss", "sox"] },
  { label: "Privacy & Consumer", description: "GDPR, CCPA, COPPA, FTC consumer protections", packIds: ["gdpr", "ccpa", "coppa", "ftc_retail", "general_pii"] },
  { label: "Government & Defense", description: "NIST, FedRAMP, ITAR, CJIS, and federal requirements", packIds: ["nist_800_171", "fedramp", "itar", "cjis"] },
  { label: "Insurance", description: "NAIC model law and policyholder data", packIds: ["naic"] },
  { label: "Real Estate & Legal", description: "RESPA/TILA, attorney-client privilege", packIds: ["respa_tila", "legal_privilege"] },
  { label: "Technology & Operations", description: "SOC 2 controls and operational security", packIds: ["soc2"] },
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
