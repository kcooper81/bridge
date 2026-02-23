import type { SecurityCategory, SecurityPatternType, SecuritySeverity } from "@/lib/types";

interface DefaultRule {
  name: string;
  description: string;
  pattern: string;
  pattern_type: SecurityPatternType;
  category: SecurityCategory;
  severity: SecuritySeverity;
  is_active: boolean;
}

export const DEFAULT_SECURITY_RULES: DefaultRule[] = [
  // API Keys
  {
    name: "AWS Access Key",
    description: "Detects AWS access key IDs",
    pattern: "AKIA[0-9A-Z]{16}",
    pattern_type: "regex",
    category: "api_keys",
    severity: "block",
    is_active: true,
  },
  {
    name: "GitHub Token",
    description: "Detects GitHub personal access tokens",
    pattern: "gh[ps]_[A-Za-z0-9_]{36,}",
    pattern_type: "regex",
    category: "api_keys",
    severity: "block",
    is_active: true,
  },
  {
    name: "Stripe Secret Key",
    description: "Detects Stripe secret API keys",
    pattern: "sk_(test|live)_[A-Za-z0-9]{20,}",
    pattern_type: "regex",
    category: "api_keys",
    severity: "block",
    is_active: true,
  },
  {
    name: "OpenAI API Key",
    description: "Detects OpenAI API keys",
    pattern: "sk-[A-Za-z0-9]{20,}",
    pattern_type: "regex",
    category: "api_keys",
    severity: "block",
    is_active: true,
  },
  {
    name: "Slack Token",
    description: "Detects Slack bot and user tokens",
    pattern: "xox[bpras]-[A-Za-z0-9-]+",
    pattern_type: "regex",
    category: "api_keys",
    severity: "block",
    is_active: true,
  },
  {
    name: "Generic API Key Header",
    description: "Detects common API key patterns in headers",
    pattern: "(api[_-]?key|apikey|api[_-]?secret)\\s*[:=]\\s*['\"]?[A-Za-z0-9_\\-]{16,}",
    pattern_type: "regex",
    category: "api_keys",
    severity: "warn",
    is_active: true,
  },

  // Credentials
  {
    name: "Password in Text",
    description: "Detects password assignments or declarations",
    pattern: "(password|passwd|pwd)\\s*[:=]\\s*['\"]?[^\\s'\"]{4,}",
    pattern_type: "regex",
    category: "credentials",
    severity: "block",
    is_active: true,
  },
  {
    name: "Connection String",
    description: "Detects database connection strings",
    pattern: "(mongodb|postgres|mysql|redis)://[^\\s]+",
    pattern_type: "regex",
    category: "credentials",
    severity: "block",
    is_active: true,
  },
  {
    name: "Private Key Block",
    description: "Detects PEM private key headers",
    pattern: "-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----",
    pattern_type: "regex",
    category: "credentials",
    severity: "block",
    is_active: true,
  },
  {
    name: "Bearer Token",
    description: "Detects Bearer authorization tokens",
    pattern: "Bearer\\s+[A-Za-z0-9_\\-\\.]{20,}",
    pattern_type: "regex",
    category: "credentials",
    severity: "warn",
    is_active: true,
  },

  // PII
  {
    name: "Social Security Number",
    description: "Detects US SSN patterns",
    pattern: "\\b\\d{3}-\\d{2}-\\d{4}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "Credit Card Number",
    description: "Detects common credit card number patterns",
    pattern: "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "Email Address",
    description: "Detects email addresses in prompt content",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    pattern_type: "regex",
    category: "pii",
    severity: "warn",
    is_active: false,
  },

  // Secrets
  {
    name: "JWT Token",
    description: "Detects JSON Web Tokens",
    pattern: "eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}",
    pattern_type: "regex",
    category: "secrets",
    severity: "block",
    is_active: true,
  },
  {
    name: "Webhook URL",
    description: "Detects webhook URLs that may contain secrets",
    pattern: "https?://[^\\s]*webhook[^\\s]*",
    pattern_type: "regex",
    category: "secrets",
    severity: "warn",
    is_active: false,
  },
];

// ─── Smart Detection Patterns ───
// These are suggested patterns that admins can enable
export const SMART_DETECTION_RULES: DefaultRule[] = [
  // Phone Numbers
  {
    name: "US Phone Number",
    description: "Detects US phone numbers in various formats",
    pattern: "\\b(?:\\+1[-.\\s]?)?\\(?[2-9]\\d{2}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "warn",
    is_active: false,
  },
  {
    name: "International Phone Number",
    description: "Detects international phone numbers with country codes",
    pattern: "\\b\\+[1-9]\\d{1,14}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "warn",
    is_active: false,
  },

  // Network & Infrastructure
  {
    name: "IPv4 Address",
    description: "Detects IPv4 addresses that may reveal infrastructure",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    pattern_type: "regex",
    category: "internal",
    severity: "warn",
    is_active: false,
  },
  {
    name: "Private IP Range",
    description: "Detects private/internal IP addresses (10.x, 192.168.x, 172.16-31.x)",
    pattern: "\\b(?:10\\.\\d{1,3}|192\\.168|172\\.(?:1[6-9]|2[0-9]|3[01]))\\.\\d{1,3}\\.\\d{1,3}\\b",
    pattern_type: "regex",
    category: "internal",
    severity: "block",
    is_active: false,
  },
  {
    name: "Internal Domain",
    description: "Detects internal/corporate domain names",
    pattern: "\\b[\\w-]+\\.(?:internal|local|corp|lan|intranet|private)\\b",
    pattern_type: "regex",
    category: "internal",
    severity: "block",
    is_active: false,
  },
  {
    name: "MAC Address",
    description: "Detects hardware MAC addresses",
    pattern: "\\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\\b",
    pattern_type: "regex",
    category: "internal",
    severity: "warn",
    is_active: false,
  },

  // File System
  {
    name: "Windows File Path",
    description: "Detects Windows file system paths",
    pattern: "[A-Za-z]:\\\\(?:[^\\\\/:*?\"<>|\\r\\n]+\\\\)*[^\\\\/:*?\"<>|\\r\\n]*",
    pattern_type: "regex",
    category: "internal",
    severity: "warn",
    is_active: false,
  },
  {
    name: "Unix File Path",
    description: "Detects Unix/Linux file system paths",
    pattern: "(?:/(?:home|var|etc|usr|opt|tmp|root)/)[\\w./-]+",
    pattern_type: "regex",
    category: "internal",
    severity: "warn",
    is_active: false,
  },

  // Additional PII
  {
    name: "Date of Birth",
    description: "Detects date of birth patterns",
    pattern: "\\b(?:DOB|D\\.O\\.B\\.|date of birth|born on)[:\\s]*\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "warn",
    is_active: false,
  },
  {
    name: "Passport Number",
    description: "Detects passport number patterns",
    pattern: "\\b(?:passport[:\\s#]*)?[A-Z]{1,2}[0-9]{6,9}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "Driver License",
    description: "Detects driver license number patterns",
    pattern: "\\b(?:DL|driver'?s?\\s*license)[:\\s#]*[A-Z0-9]{5,15}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "Bank Account Number",
    description: "Detects bank account number patterns",
    pattern: "\\b(?:account|acct)[:\\s#]*\\d{8,17}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "Routing Number",
    description: "Detects US bank routing numbers (9 digits)",
    pattern: "\\b(?:routing|ABA)[:\\s#]*\\d{9}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "IBAN",
    description: "Detects International Bank Account Numbers",
    pattern: "\\b[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}(?:[A-Z0-9]?){0,16}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },

  // Medical/Health
  {
    name: "Medical Record Number",
    description: "Detects medical record number patterns",
    pattern: "\\b(?:MRN|medical record)[:\\s#]*[A-Z0-9]{6,12}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },
  {
    name: "Health Insurance ID",
    description: "Detects health insurance ID patterns",
    pattern: "\\b(?:member|policy|insurance)\\s*(?:ID|#|number)[:\\s]*[A-Z0-9]{8,15}\\b",
    pattern_type: "regex",
    category: "pii",
    severity: "block",
    is_active: false,
  },

  // URLs with credentials
  {
    name: "URL with Credentials",
    description: "Detects URLs containing embedded usernames/passwords",
    pattern: "https?://[^:]+:[^@]+@[^\\s]+",
    pattern_type: "regex",
    category: "credentials",
    severity: "block",
    is_active: false,
  },

  // Code/Config patterns
  {
    name: "Environment Variable",
    description: "Detects environment variable assignments with sensitive names",
    pattern: "(?:export\\s+)?(?:DB_|API_|SECRET_|PRIVATE_|AUTH_)[A-Z_]+=.+",
    pattern_type: "regex",
    category: "secrets",
    severity: "warn",
    is_active: false,
  },
  {
    name: "Base64 Encoded Secret",
    description: "Detects long Base64 strings that may be encoded secrets",
    pattern: "(?:[A-Za-z0-9+/]{40,})={0,2}",
    pattern_type: "regex",
    category: "secrets",
    severity: "warn",
    is_active: false,
  },
];

// All available rules combined
export const ALL_AVAILABLE_RULES = [...DEFAULT_SECURITY_RULES, ...SMART_DETECTION_RULES];
