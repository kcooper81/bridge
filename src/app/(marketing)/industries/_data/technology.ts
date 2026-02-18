import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "technology",
  industry: "Technology",
  headline: "Stop developers from leaking secrets into AI",
  subtitle:
    "Your engineers paste code, API keys, and config files into AI tools every day. TeamPrompt catches the sensitive parts.",
  compliance: ["Secret Detection", "Audit Logging", "Access Control"],
  painPoints: [
    {
      title: "Developers paste API keys and secrets into AI tools",
      description:
        "AWS access keys, database credentials, and private tokens get copied into ChatGPT and Copilot daily. One leaked key can compromise your entire infrastructure.",
    },
    {
      title: "Proprietary source code leaves the building",
      description:
        "Engineers paste internal algorithms, architecture patterns, and business logic into AI prompts with no visibility into what intellectual property is walking out the door.",
    },
    {
      title: "No centralized prompt knowledge base",
      description:
        "Every developer writes the same debugging, code review, and refactoring prompts from scratch. Tribal knowledge stays siloed in individual browser histories.",
    },
  ],
  features: [
    {
      icon: "ShieldAlert",
      title: "Secret & API Key Detection",
      description:
        "Automatically detect AWS keys, GitHub tokens, database connection strings, private keys, and other secret patterns before they reach any AI model. Block or warn in real time.",
    },
    {
      icon: "Chrome",
      title: "Chrome Extension with Inline Scanning",
      description:
        "TeamPrompt's browser extension scans prompts directly in ChatGPT, Claude, and other AI interfaces. Developers get instant feedback without leaving their workflow.",
    },
    {
      icon: "ArrowDownUp",
      title: "Import & Export Prompt Packs",
      description:
        "Share curated prompt packs across teams — debugging templates, code review checklists, architecture prompts. Import community packs or export your own for new hires.",
    },
    {
      icon: "GitBranch",
      title: "Engineering Team Workspaces",
      description:
        "Organize prompts by team (backend, frontend, DevOps, SRE) with role-based access. Each team maintains their own library while admins keep global oversight.",
    },
  ],
  mockupVariant: "guardrails",
  mockupItems: [
    { title: "AWS Access Key (AKIA...)", badge: "Blocked" },
    { title: "GitHub Token (ghp_...)", badge: "Blocked" },
    { title: "Database Connection String", badge: "Blocked" },
    { title: "Internal Project Name", badge: "Warning" },
  ],
  mockupAlert: {
    type: "block",
    message: "3 secrets detected — submission blocked",
  },
  mockupUser: { name: "Alex Dev", initials: "AD" },
  stats: [
    { value: "15+", label: "Built-in secret patterns" },
    { value: "5", label: "AI tools monitored" },
    { value: "< 200ms", label: "Scan latency per prompt" },
  ],
  faqs: [
    {
      question: "What types of secrets does TeamPrompt detect?",
      answer:
        "TeamPrompt ships with 15 built-in detection patterns covering AWS access keys, GitHub tokens, Slack tokens, database connection strings, private keys, JWT tokens, Stripe API keys, and more. You can also create custom patterns using regex, exact match, or glob syntax to catch organization-specific secrets.",
    },
    {
      question: "Does TeamPrompt work with Copilot and other code-focused AI tools?",
      answer:
        "TeamPrompt's Chrome extension works with browser-based AI tools including ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. It scans prompts and inserts from your team's library directly in these interfaces.",
    },
    {
      question: "Can we set different guardrail policies for different engineering teams?",
      answer:
        "Absolutely. Admins can create team-specific policies. For example, your DevOps team might have stricter rules around infrastructure credentials, while your frontend team has different patterns for client-side API keys. Each policy can be set to block, warn, or log-only depending on your security posture.",
    },
    {
      question: "How does TeamPrompt integrate with our existing security stack?",
      answer:
        "TeamPrompt provides a full audit log of all AI interactions that can be exported for review. Integrations with SIEM tools, webhooks, and SSO/SCIM provisioning are on our roadmap. Contact our team to discuss your specific security stack requirements.",
    },
  ],
  cta: {
    headline: "Your developers are pasting secrets into AI right now.",
    gradientText: "Catch them before it's too late.",
    subtitle:
      "Deploy TeamPrompt across your engineering org in under 5 minutes.",
  },
};
