export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  highlights: string[];
  details?: string;
  badge?: "new" | "fix" | "improvement";
}

export const APP_VERSION = "1.3.0";

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "1.3.0",
    date: "2026-02-27",
    title: "Compliance Packs, Auto-Sanitization & More",
    highlights: [
      "One-click compliance policy packs (HIPAA, GDPR, PCI-DSS, CCPA, SOC 2, General PII)",
      "Auto-sanitization replaces sensitive data with safe {{PLACEHOLDER}} tokens",
      "Prompt effectiveness analytics with rating distribution",
      "Dedicated approval queue for pending prompts and rule suggestions",
      "Version diff view — compare any two versions side by side",
    ],
    badge: "new",
  },
  {
    version: "1.2.0",
    date: "2026-01-15",
    title: "Template Packs & Import Improvements",
    highlights: [
      "Built-in template packs for common workflows",
      "Improved CSV/JSON import with column mapping",
      "Bulk export with metadata preservation",
      "Template variable default values",
    ],
    badge: "improvement",
  },
  {
    version: "1.1.0",
    date: "2025-12-10",
    title: "Browser Extension & Guardrails",
    highlights: [
      "Chrome extension with side panel support",
      "Real-time DLP scanning on outbound prompts",
      "15 built-in security patterns",
      "Activity logging and audit trail",
    ],
    badge: "new",
  },
  {
    version: "1.0.0",
    date: "2025-11-01",
    title: "Initial Release",
    highlights: [
      "Shared prompt vault with search and tags",
      "Quality guidelines with 14 built-in templates",
      "Team management with Admin, Manager, and Member roles",
      "Analytics dashboard with usage tracking",
    ],
    badge: "new",
  },
];
