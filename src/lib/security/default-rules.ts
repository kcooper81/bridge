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
