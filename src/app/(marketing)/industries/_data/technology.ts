import type { IndustryPageData } from "./types";

export const industryData: IndustryPageData = {
  slug: "technology",
  industry: "Technology",
  headline: "Stop developers from leaking secrets into AI",
  subtitle:
    "Your engineers paste code, API keys, and config files into AI tools every day. TeamPrompt catches the sensitive parts.",
  compliance: ["SOC 2", "ISO 27001"],
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
        "Automatically detect AWS keys, GitHub tokens, database connection strings, private keys, and 40+ secret patterns before they reach any AI model. Block or warn in real time.",
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
    { value: "99.2%", label: "Secret detection accuracy" },
    { value: "47K+", label: "Secrets blocked this month" },
    { value: "< 200ms", label: "Scan latency per prompt" },
  ],
  faqs: [
    {
      question: "What types of secrets does TeamPrompt detect?",
      answer:
        "TeamPrompt detects over 40 secret patterns including AWS access keys, GitHub personal access tokens, GitLab tokens, Slack webhooks, database connection strings, private SSH keys, JWT tokens, Stripe API keys, and generic high-entropy strings that look like passwords or tokens. We continuously update detection patterns as new secret formats emerge.",
    },
    {
      question: "Does TeamPrompt work with Copilot and other code-focused AI tools?",
      answer:
        "Yes. TeamPrompt's Chrome extension works alongside ChatGPT, Claude, Gemini, and any browser-based AI tool. For IDE-integrated tools like Copilot, TeamPrompt provides a pre-commit scanning layer and a dedicated prompt interface that engineers can use for longer, more complex prompts before pasting results into their editor.",
    },
    {
      question: "Can we set different guardrail policies for different engineering teams?",
      answer:
        "Absolutely. Admins can create team-specific policies. For example, your DevOps team might have stricter rules around infrastructure credentials, while your frontend team has different patterns for client-side API keys. Each policy can be set to block, warn, or log-only depending on your security posture.",
    },
    {
      question: "How does TeamPrompt integrate with our existing security stack?",
      answer:
        "TeamPrompt exports audit logs via webhook, Slack, or direct API integration to your SIEM (Splunk, Datadog, etc.). Blocked secret events can trigger alerts in PagerDuty or Opsgenie. We also support SSO via SAML 2.0 and SCIM provisioning for automated user management from your identity provider.",
    },
  ],
  cta: {
    headline: "Your developers are pasting secrets into AI right now.",
    gradientText: "Catch them before it's too late.",
    subtitle:
      "Deploy TeamPrompt across your engineering org in under 5 minutes.",
  },
};
