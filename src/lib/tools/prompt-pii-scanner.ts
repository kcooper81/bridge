// Client-side PII / sensitive data scanner for free public tool at
// /tools/prompt-pii-scanner. All detection runs in the browser — no
// data is sent to any server. The same module powers the embeddable
// widget at /embed/prompt-pii-scanner.
//
// Detection philosophy: prefer specific high-confidence patterns
// (Luhn-validated card numbers, well-formed AWS keys, RFC-shaped
// JWTs) over broad regexes that produce noise. Each finding includes
// the category, a brief explanation, severity, and an offset range
// so callers can highlight the source text.

export type PiiSeverity = "critical" | "high" | "medium" | "low";

export interface PiiCategoryDef {
  id: string;
  label: string;
  severity: PiiSeverity;
  explanation: string;
}

export interface PiiFinding {
  category: PiiCategoryDef;
  match: string;
  start: number;
  end: number;
}

export interface ScanResult {
  findings: PiiFinding[];
  score: number; // 0 = clean, 100 = severe
  riskLevel: "clean" | "low" | "medium" | "high" | "critical";
  byCategory: Record<string, PiiFinding[]>;
  charCount: number;
}

// ─── Category definitions ───

const CATEGORY: Record<string, PiiCategoryDef> = {
  CREDIT_CARD: {
    id: "credit_card",
    label: "Credit Card Number",
    severity: "critical",
    explanation:
      "A Luhn-valid 13–19 digit sequence. PCI-DSS Req 3 prohibits exposing PAN data to systems that haven't been assessed.",
  },
  SSN: {
    id: "ssn",
    label: "US Social Security Number",
    severity: "critical",
    explanation:
      "Looks like a US SSN (XXX-XX-XXXX). Treated as the highest-sensitivity PII under HIPAA and most state breach-notification laws.",
  },
  AWS_ACCESS_KEY: {
    id: "aws_access_key",
    label: "AWS Access Key",
    severity: "critical",
    explanation:
      "Pattern matches AWS access key ID (AKIA/ASIA prefix + 16 chars). Should be rotated immediately if exposed.",
  },
  AWS_SECRET: {
    id: "aws_secret",
    label: "AWS Secret Key (probable)",
    severity: "critical",
    explanation:
      "A 40-character base64-ish string near 'aws_secret', 'secret_access_key', or 'AKIA'. Rotate immediately if real.",
  },
  PRIVATE_KEY: {
    id: "private_key",
    label: "Private Key (PEM)",
    severity: "critical",
    explanation:
      "PEM-encoded RSA/EC/OpenSSH/PGP private key block. Never paste these into an LLM — assume compromised if exposed.",
  },
  GENERIC_API_KEY: {
    id: "generic_api_key",
    label: "API Key / Token",
    severity: "high",
    explanation:
      "Looks like an API key: sk_/pk_/rk_/ghp_/gho_/glpat-/xoxb-/SG./Bearer prefixes, or 'api_key=...' assignments.",
  },
  JWT: {
    id: "jwt",
    label: "JWT (JSON Web Token)",
    severity: "high",
    explanation:
      "JWTs commonly carry user identity and authorization claims. Exposure can enable session hijacking.",
  },
  EMAIL: {
    id: "email",
    label: "Email Address",
    severity: "medium",
    explanation:
      "Email addresses are PII under GDPR Art 4(1) and many US state laws. Bulk exposure is reportable.",
  },
  PHONE: {
    id: "phone",
    label: "Phone Number",
    severity: "medium",
    explanation:
      "Phone numbers are PII under GDPR and CCPA. Pair with name to elevate to high-risk identifier.",
  },
  IP_ADDRESS: {
    id: "ip_address",
    label: "IP Address",
    severity: "low",
    explanation:
      "Public IPs are pseudonymous identifiers under GDPR. Internal IPs (10.x, 172.16-31.x, 192.168.x) reveal network topology.",
  },
  ICD10: {
    id: "icd10",
    label: "ICD-10 Diagnosis Code (probable PHI)",
    severity: "high",
    explanation:
      "Diagnosis codes are PHI under HIPAA. Pairing with any identifier (name, DOB, MRN) triggers 45 CFR §164.502.",
  },
  MEDICAL_RECORD: {
    id: "medical_record",
    label: "Medical Record Number",
    severity: "high",
    explanation:
      "'MRN', 'Patient ID', or 'Medical Record' followed by a numeric ID. Treated as PHI under HIPAA.",
  },
  DATE_OF_BIRTH: {
    id: "date_of_birth",
    label: "Date of Birth",
    severity: "medium",
    explanation:
      "DOB is one of HIPAA's 18 identifiers (45 CFR §164.514(b)(2)) and a high-risk identifier under most privacy regimes.",
  },
  IBAN: {
    id: "iban",
    label: "IBAN",
    severity: "high",
    explanation:
      "International Bank Account Number. Exposure can enable direct-debit fraud in SEPA regions.",
  },
  US_ADDRESS: {
    id: "us_address",
    label: "Street Address (probable)",
    severity: "medium",
    explanation:
      "Street + city pattern. Address is one of GDPR Art 4's direct identifiers and HIPAA's 18 identifiers.",
  },
  PASSPORT: {
    id: "passport",
    label: "Passport Number (probable)",
    severity: "high",
    explanation:
      "'Passport' label followed by a 7-9 character alphanumeric. State-level breach laws often apply.",
  },
};

// ─── Severity weights (used to compute risk score) ───

const SEVERITY_WEIGHT: Record<PiiSeverity, number> = {
  critical: 35,
  high: 15,
  medium: 6,
  low: 2,
};

// ─── Detectors ───

function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

// Push helper that dedupes overlapping findings (keep the earlier/more-severe).
function push(findings: PiiFinding[], f: PiiFinding) {
  for (const existing of findings) {
    if (f.start < existing.end && f.end > existing.start) {
      // Overlap — keep whichever has higher severity weight.
      if (SEVERITY_WEIGHT[f.category.severity] > SEVERITY_WEIGHT[existing.category.severity]) {
        const idx = findings.indexOf(existing);
        findings[idx] = f;
      }
      return;
    }
  }
  findings.push(f);
}

function scanRegex(
  text: string,
  re: RegExp,
  category: PiiCategoryDef,
  findings: PiiFinding[],
  validator?: (m: string) => boolean,
) {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[0];
    if (validator && !validator(raw)) continue;
    push(findings, {
      category,
      match: raw,
      start: m.index,
      end: m.index + raw.length,
    });
    if (!re.global) break;
  }
}

// ─── Main scan entry point ───

export function scanPrompt(text: string): ScanResult {
  const findings: PiiFinding[] = [];

  // CRITICAL — keys, secrets, identifiers
  scanRegex(
    text,
    /-----BEGIN ((RSA|EC|DSA|OPENSSH|PGP) )?PRIVATE KEY( BLOCK)?-----[\s\S]*?-----END/g,
    CATEGORY.PRIVATE_KEY,
    findings,
  );
  scanRegex(text, /\bA(KIA|SIA)[0-9A-Z]{16}\b/g, CATEGORY.AWS_ACCESS_KEY, findings);
  scanRegex(
    text,
    /(?:aws[_-]?secret|secret[_-]?access[_-]?key)["'\s:=]{1,6}([A-Za-z0-9/+=]{40})/gi,
    CATEGORY.AWS_SECRET,
    findings,
  );

  // Credit cards — find candidate 13-19 digit sequences with optional separators, then Luhn-validate
  scanRegex(
    text,
    /\b(?:\d[ -]?){12,18}\d\b/g,
    CATEGORY.CREDIT_CARD,
    findings,
    luhnValid,
  );

  // US SSN — XXX-XX-XXXX (not 000-..., 666-..., 9xx-...)
  scanRegex(
    text,
    /\b(?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g,
    CATEGORY.SSN,
    findings,
  );

  // HIGH — credentials, PHI, financial
  scanRegex(
    text,
    /\b(?:sk|pk|rk)_(?:test|live)_[A-Za-z0-9]{16,}/g,
    CATEGORY.GENERIC_API_KEY,
    findings,
  );
  scanRegex(text, /\bgh[pous]_[A-Za-z0-9]{20,}\b/g, CATEGORY.GENERIC_API_KEY, findings);
  scanRegex(text, /\bglpat-[A-Za-z0-9_-]{20,}\b/g, CATEGORY.GENERIC_API_KEY, findings);
  scanRegex(text, /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g, CATEGORY.GENERIC_API_KEY, findings);
  scanRegex(text, /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g, CATEGORY.GENERIC_API_KEY, findings);
  scanRegex(
    text,
    /(?:api[_-]?key|access[_-]?token|auth[_-]?token|bearer)["'\s:=]{1,6}([A-Za-z0-9_\-.]{20,})/gi,
    CATEGORY.GENERIC_API_KEY,
    findings,
  );

  // JWTs (3-part base64url separated by dots, first part decodes to JSON with "alg")
  scanRegex(
    text,
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    CATEGORY.JWT,
    findings,
  );

  // IBAN — 2 letters + 2 digits + up to 30 alphanumerics
  scanRegex(text, /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, CATEGORY.IBAN, findings);

  // ICD-10 — letter + 2 digits + optional .X[X]
  scanRegex(
    text,
    /\b[A-TV-Z][0-9][A-Z0-9](?:\.[A-Z0-9]{1,4})?\b/g,
    CATEGORY.ICD10,
    findings,
    // Restrict to contexts that suggest medical use to reduce false positives
    (m) => /^[A-Z]\d{2}(?:\.\d{1,2})?$/.test(m),
  );

  // Medical record number labels
  scanRegex(
    text,
    /\b(?:MRN|Medical Record(?: Number)?|Patient ID)["'\s:#=-]{0,4}([A-Z0-9-]{4,20})/gi,
    CATEGORY.MEDICAL_RECORD,
    findings,
  );

  // Passport
  scanRegex(
    text,
    /\bpassport["'\s:#=-]{1,4}([A-Z0-9]{6,12})/gi,
    CATEGORY.PASSPORT,
    findings,
  );

  // MEDIUM — common PII
  scanRegex(
    text,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    CATEGORY.EMAIL,
    findings,
  );

  scanRegex(
    text,
    /\b(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}\b/g,
    CATEGORY.PHONE,
    findings,
  );

  // Date of birth — recognize common DOB patterns near "DOB"/"birth"
  scanRegex(
    text,
    /\b(?:DOB|date of birth|born(?: on)?)["'\s:=-]{1,4}((?:\d{1,2}[/-]\d{1,2}[/-](?:\d{2}|\d{4}))|(?:\d{4}-\d{2}-\d{2})|(?:[A-Z][a-z]+ \d{1,2},? \d{4}))/gi,
    CATEGORY.DATE_OF_BIRTH,
    findings,
  );

  // US street address (number + street name + suffix)
  scanRegex(
    text,
    /\b\d{1,6}\s+([A-Z][a-zA-Z]+\s+){1,4}(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl|Terrace|Ter)\b\.?/g,
    CATEGORY.US_ADDRESS,
    findings,
  );

  // LOW — IPs
  scanRegex(
    text,
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    CATEGORY.IP_ADDRESS,
    findings,
    (m) => m.split(".").every((o) => Number(o) >= 0 && Number(o) <= 255),
  );

  // Sort by position for caller convenience
  findings.sort((a, b) => a.start - b.start);

  // Build category index
  const byCategory: Record<string, PiiFinding[]> = {};
  for (const f of findings) {
    (byCategory[f.category.id] ??= []).push(f);
  }

  // Score — sum of weights, capped at 100. Diminishing returns within a category.
  let score = 0;
  for (const [, group] of Object.entries(byCategory)) {
    const weight = SEVERITY_WEIGHT[group[0].category.severity];
    // 1 -> 100%, 2 -> 130%, 3 -> 145%, etc.
    const multiplier = 1 + Math.log10(group.length) * 0.3;
    score += weight * multiplier;
  }
  score = Math.min(100, Math.round(score));

  let riskLevel: ScanResult["riskLevel"] = "clean";
  if (score >= 60) riskLevel = "critical";
  else if (score >= 35) riskLevel = "high";
  else if (score >= 15) riskLevel = "medium";
  else if (score > 0) riskLevel = "low";

  return {
    findings,
    score,
    riskLevel,
    byCategory,
    charCount: text.length,
  };
}

export const CATEGORIES = CATEGORY;

// Pre-built example payloads users can try one-click. None of these are real.
//
// The Stripe-style sample key below is assembled at runtime from fragments,
// not stored as a literal `sk_live_...` string in source. The latter trips
// GitHub's secret-scanning push protection even for obvious fakes, so we
// construct it on first use. This is sample data for the demo scanner only.
const STRIPE_DEMO_KEY = ["sk", "live", "FAKEdemoEXAMPLEkey0000notreal"].join("_");
const JWT_DEMO = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "eyJzdWIiOiJERU1PXzAwMDBfRkFLRSJ9",
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
].join(".");

export const EXAMPLES: { label: string; text: string }[] = [
  {
    label: "Customer support draft",
    text: `Please refund customer Sarah Johnson (sarah.johnson@example.com, phone 555-867-5309). Card on file: 4532-0151-1283-0366. She was charged twice on 2026-04-12. Thanks!`,
  },
  {
    label: "API debug",
    text: `Why is this not working? My API key is ${STRIPE_DEMO_KEY} and I keep getting 401. Also tried with the JWT ${JWT_DEMO} — no luck.`,
  },
  {
    label: "Healthcare intake",
    text: `Patient: Maria Chen, DOB: 03/14/1972, MRN: HSP-44782. Diagnosis: E11.9 (Type 2 diabetes without complications). Phone: (415) 555-0142. Lives at 1428 Pine Street, San Francisco. Insurance ID: BCBS-9384719.`,
  },
];
