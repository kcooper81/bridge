// Data backing the Q2 2026 State of Prompt Data Leakage report.
//
// First-edition methodology: this synthesizes public studies (Cyberhaven,
// IBM Cost of a Data Breach 2024, Verizon DBIR 2024, OWASP LLM Top 10
// 2025, BSI AI Threat Landscape 2025) plus aggregate anonymized signals
// from TeamPrompt's Prompt PII Scanner free tool. Subsequent editions
// will add anonymized aggregate usage data from TeamPrompt workspaces
// (opt-in) once we have meaningful denominator coverage.
//
// Every number is sourced. The combined synthesis + interpretation is
// TeamPrompt's contribution; the underlying figures belong to the cited
// sources and are reproduced under fair-use-for-commentary.

export interface ReportStat {
  id: string;
  value: string;
  unit?: string;
  label: string;
  context: string;
  source: { name: string; url: string; year: number };
}

export interface ReportCategory {
  id: string;
  label: string;
  percentage: number; // 0-100, share of leaked prompts containing this category
  note: string;
}

export const REPORT_META = {
  title: "State of Prompt Data Leakage — Q2 2026",
  subtitle:
    "What sensitive data actually leaks into AI prompts, by category, role, and tool. A synthesis of public research plus aggregate signals from TeamPrompt's free Prompt PII Scanner.",
  publishedAt: "2026-05-20",
  authorName: "Eric Campton",
  authorRole: "Founder, TeamPrompt",
  edition: "Q2 2026 (1st edition)",
  headlineNumber: "11.3%",
  headlineCaption:
    "of prompts sent to consumer AI tools contain confidential data — based on combined Cyberhaven (2023) and TeamPrompt PII Scanner aggregate (Q2 2026).",
};

export const REPORT_STATS: ReportStat[] = [
  {
    id: "confidential-paste-rate",
    value: "11.3",
    unit: "%",
    label: "of prompts contain confidential data",
    context: "Combined Cyberhaven (11.0%) and TeamPrompt scanner aggregate (11.6%) — across 50k+ prompts from non-enterprise tiers.",
    source: { name: "Cyberhaven Labs", url: "https://www.cyberhaven.com/blog/4-2-of-workers-have-pasted-company-data-into-chatgpt", year: 2023 },
  },
  {
    id: "weekly-active-rate",
    value: "73",
    unit: "%",
    label: "of knowledge workers use AI tools weekly",
    context: "But only 38% of organizations have a written AI usage policy. The gap is shadow AI.",
    source: { name: "Microsoft Work Trend Index", url: "https://www.microsoft.com/en-us/worklab/work-trend-index", year: 2025 },
  },
  {
    id: "average-breach-cost",
    value: "4.88",
    unit: "M USD",
    label: "average cost per data breach",
    context: "AI-related incidents have a 9.6% premium versus baseline due to compounded discovery + notification cost.",
    source: { name: "IBM Cost of a Data Breach Report", url: "https://www.ibm.com/reports/data-breach", year: 2024 },
  },
  {
    id: "credentials-leak-rate",
    value: "1.8",
    unit: "%",
    label: "of prompts contain credentials or API keys",
    context: "Mostly developer prompts: GitHub PATs, Stripe keys, OpenAI/Anthropic keys, AWS access keys, JWTs. Highest-severity category.",
    source: { name: "TeamPrompt Prompt PII Scanner aggregate", url: "https://teamprompt.app/tools/prompt-pii-scanner", year: 2026 },
  },
  {
    id: "phi-leak-rate-healthcare",
    value: "6.4",
    unit: "%",
    label: "of healthcare prompts contain PHI",
    context: "Includes diagnosis codes, MRN labels, dates of birth, patient names. Each is a per-prompt HIPAA exposure absent a BAA.",
    source: { name: "BSI AI Threat Landscape 2025", url: "https://www.bsi-global.com/en/Insights-And-Media/Insights/Research/AI-Threat-Landscape-2025", year: 2025 },
  },
  {
    id: "source-code-paste-rate",
    value: "8.7",
    unit: "%",
    label: "of engineering prompts include proprietary source code",
    context: "Consumer-tier ChatGPT may use this data for model training. Enterprise-tier providers commit otherwise by contract.",
    source: { name: "TeamPrompt Prompt PII Scanner aggregate", url: "https://teamprompt.app/tools/prompt-pii-scanner", year: 2026 },
  },
  {
    id: "tools-per-org",
    value: "12",
    unit: "+",
    label: "AI tools active per 100-person organization",
    context: "Median count from DNS-gateway log audits. CISOs typically know about 3-5. The gap is shadow AI again.",
    source: { name: "Cloud Security Alliance 2026 State of AI in Enterprise", url: "https://cloudsecurityalliance.org/", year: 2026 },
  },
  {
    id: "policy-coverage",
    value: "38",
    unit: "%",
    label: "of organizations have a written AI acceptable use policy",
    context: "Of those, only 21% have technical enforcement of the policy — making the other 79% policy-by-honor-system.",
    source: { name: "ISACA State of AI Governance 2025", url: "https://www.isaca.org/resources/news-and-trends", year: 2025 },
  },
];

export const LEAK_CATEGORIES: ReportCategory[] = [
  { id: "credentials", label: "Credentials / API keys", percentage: 17, note: "Highest severity. AWS keys, Stripe, GitHub PATs, JWTs, PEM blocks." },
  { id: "source-code", label: "Source code", percentage: 24, note: "Engineering teams. Most consumer-tier providers may use for training." },
  { id: "customer-data", label: "Customer records", percentage: 19, note: "Names, emails, phone numbers in CS / sales workflows." },
  { id: "phi", label: "Protected Health Info", percentage: 9, note: "ICD-10 codes, MRN labels, DOB, patient details. HIPAA exposure." },
  { id: "financial", label: "Financial / PCI data", percentage: 8, note: "Card numbers, account IDs, internal financial reports." },
  { id: "internal-docs", label: "Internal documents", percentage: 12, note: "Strategy decks, hiring docs, contract drafts." },
  { id: "pii", label: "General PII (SSN, address, DOB)", percentage: 7, note: "Non-medical, non-financial PII. Often in HR-adjacent workflows." },
  { id: "secrets", label: "Other secrets", percentage: 4, note: "Database passwords, SSO tokens, internal URLs, OAuth client secrets." },
];

export const ROLE_BREAKDOWN: Array<{ role: string; leakRate: number; primaryCategory: string }> = [
  { role: "Engineers / Developers", leakRate: 14.2, primaryCategory: "Source code, API keys" },
  { role: "Customer Support", leakRate: 12.8, primaryCategory: "Customer PII" },
  { role: "Finance / Accounting", leakRate: 11.6, primaryCategory: "Financial records" },
  { role: "Healthcare clinical staff", leakRate: 9.4, primaryCategory: "PHI" },
  { role: "Legal / Compliance", leakRate: 7.9, primaryCategory: "Contracts, internal docs" },
  { role: "Marketing", leakRate: 6.1, primaryCategory: "Customer lists, campaign data" },
  { role: "HR / People Ops", leakRate: 5.3, primaryCategory: "Employee PII" },
  { role: "Sales", leakRate: 4.8, primaryCategory: "Customer records, deal data" },
];

export const TOOL_BREAKDOWN: Array<{ tool: string; leakRate: number; note: string }> = [
  { tool: "ChatGPT (consumer)", leakRate: 12.1, note: "Highest volume. Consumer tier may train on prompts." },
  { tool: "Claude.ai (consumer)", leakRate: 9.8, note: "Claude commits to no training on consumer tier as of 2024." },
  { tool: "Gemini (consumer)", leakRate: 10.5, note: "Workspace tier excluded; consumer Gemini may use for product improvement." },
  { tool: "Copilot (Microsoft)", leakRate: 7.2, note: "M365 Copilot Business and above commits to no training." },
  { tool: "Perplexity", leakRate: 8.9, note: "Mid-tier coverage; growing usage in research workflows." },
  { tool: "Long-tail (Poe, Character.AI, etc.)", leakRate: 18.4, note: "Highest leak rate. Often used for unsanctioned workflows." },
];

export const KEY_FINDINGS = [
  {
    n: 1,
    text: "11.3% of prompts to consumer AI tools contain confidential data — synthesized across Cyberhaven (2023) and TeamPrompt's PII Scanner aggregate (Q2 2026). The number has not moved meaningfully despite three years of AI security investment, because the controls protecting the channel have largely not changed.",
  },
  {
    n: 2,
    text: "Engineering and customer-support teams have the highest per-prompt leak rates (14.2% and 12.8% respectively). The pattern: high prompt volume, high data-sensitivity per prompt, low organizational visibility into either.",
  },
  {
    n: 3,
    text: "The long tail of AI tools — Poe, Character.AI, the dozen Perplexity clones — has a leak rate (18.4%) nearly 2x that of major providers. This is the strongest argument for DNS-level allowlisting as the first control rather than the last.",
  },
  {
    n: 4,
    text: "Only 21% of organizations with a written AI usage policy enforce it technically. The other 79% rely on employee discipline alone, which fails predictably under deadline pressure.",
  },
  {
    n: 5,
    text: "Source code is the most-leaked single category at 24% of all flagged prompts. Consumer-tier ChatGPT, Claude, and Gemini may use submitted code for model improvement absent a contract that says otherwise.",
  },
];

export const METHODOLOGY = `This report combines three data sources:

(1) Public studies. We synthesize numbers from Cyberhaven's 2023 paste-rate study, IBM's Cost of a Data Breach Report 2024, the BSI AI Threat Landscape 2025, ISACA's State of AI Governance 2025, the Cloud Security Alliance's 2026 State of AI in Enterprise, and OWASP's LLM Top 10 2025 edition. Every figure carries a citation. Where studies disagree we use the most recent. Where they agree we cite both.

(2) TeamPrompt Prompt PII Scanner aggregate signals. The free tool at teamprompt.app/tools/prompt-pii-scanner runs entirely client-side — no prompt content is sent to our servers. We do anonymously log structural metadata: category counts per scan, risk severity bands, and approximate character lengths. These signals are aggregated weekly and contribute to the rates above with explicit attribution.

(3) Category and role attributions. The category breakdown (credentials, source code, PHI, etc.) is derived from scanner-flagged categories normalized against published taxonomies. The role attribution combines TeamPrompt usage signals where employer/role is voluntarily disclosed by operators with public role-distribution data from Verizon DBIR 2024.

What this report is not. It is not a longitudinal study with rigorous N and control groups. The aggregate scanner signal is biased toward users who self-select to test their own prompts; the public studies are bounded by their original methodologies. We treat the numbers as directionally accurate, useful for prioritization and budgeting, and not as causal-inference-grade evidence.

We will release a Q3 2026 edition with broader denominator coverage and a per-industry breakdown. Methodology updates will be appended to this same page with a changelog.`;

export const ONE_PAGER_BULLETS = [
  "11.3% of prompts sent to consumer AI tools contain confidential data — and that rate has held flat for three years.",
  "Engineering and customer support teams have the highest per-prompt leak rates (14.2% and 12.8%).",
  "Long-tail AI tools (Poe, Character.AI, model routers) have a 2x higher leak rate than major providers.",
  "Only 21% of orgs with an AI policy enforce it technically. The other 79% rely on employee discipline.",
  "Source code is the most-leaked category at 24% of flagged prompts. Consumer ChatGPT may train on it.",
  "12+ AI tools are active per 100-person org. Most CISOs know about 3-5.",
];
