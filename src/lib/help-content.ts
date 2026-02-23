// Shared help content — used by both the public /help page and the in-app help modal.

import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  Archive,
  BookOpen,
  Shield,
  Chrome,
  Users,
  CreditCard,
  Lock,
  BarChart3,
  FolderOpen,
  Import,
} from "lucide-react";

// ─── Types ───

export interface HelpArticle {
  q: string;
  a: string;
  /** Optional keywords to boost search relevance beyond q + a text */
  keywords?: string[];
}

export interface HelpCategory {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  articles: HelpArticle[];
}

export interface FAQ {
  question: string;
  answer: string;
}

// ─── Overview ───

export const HELP_OVERVIEW = {
  title: "Help & Documentation",
  subtitle:
    "Everything you need to get the most out of TeamPrompt — from first setup to advanced guardrails.",
  description: [
    "TeamPrompt is a collaborative prompt management platform that helps teams standardize, secure, and scale their AI usage. Your workspace is the central hub where prompts are created, reviewed, and shared across your organization.",
    "The browser extension connects TeamPrompt to the AI tools your team already uses — ChatGPT, Claude, Gemini, Copilot, and Perplexity — so prompts are always one click away. Guardrails run in real-time, scanning outbound messages for sensitive data before they reach any AI model.",
    "Use the categories below to find answers, or search for a specific topic.",
  ],
};

// ─── Documentation Categories ───

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    icon: Rocket,
    title: "Getting Started",
    description: "Set up your workspace, invite your team, and start using TeamPrompt in minutes.",
    articles: [
      {
        q: "How do I create a workspace?",
        a: "Sign up at teamprompt.app/signup. An organization is created automatically for your account. Name it, invite your team, and you're ready to go — the whole process takes under two minutes.",
        keywords: ["signup", "register", "new account", "organization"],
      },
      {
        q: "How do I invite my team?",
        a: "Go to the Team page from the sidebar (or Settings → Organization for naming). Click \"Invite Member,\" enter their email address, and choose a role — Admin, Manager, or Member. They'll receive an email with a link to join your workspace.",
        keywords: ["invite", "add member", "email", "onboarding"],
      },
      {
        q: "How do I install the browser extension?",
        a: "Visit the Chrome Web Store and search for \"TeamPrompt,\" or click the install banner in your dashboard. After installing, click the TeamPrompt icon in your toolbar and sign in with your account. Your prompts, settings, and guardrails sync automatically.",
        keywords: ["chrome", "extension", "install", "browser", "addon"],
      },
      {
        q: "How do I create my first prompt?",
        a: "Click \"New Prompt\" from the Prompt Vault. Give it a title, write your prompt content (use {{variables}} for dynamic fields), add optional tags and a description, then save. It's immediately available to your team and in the extension.",
        keywords: ["new prompt", "create", "write", "template"],
      },
      {
        q: "What are the user roles?",
        a: "Admin: full access including billing, settings, team management, and guardrails configuration. Manager: can manage prompts, collections, approve content, and view the activity log. Member: can use approved prompts, create drafts, and view shared content. All roles can use the browser extension.",
        keywords: ["roles", "permissions", "admin", "manager", "member", "access"],
      },
      {
        q: "How does the approval workflow work?",
        a: "New prompts can be saved as drafts (visible only to you) or submitted for review. Submitted prompts appear in the \"Pending\" queue. Admins and managers review them and approve or reject with feedback. Approved prompts become available to the entire team.",
        keywords: ["approval", "review", "pending", "draft", "workflow"],
      },
    ],
  },
  {
    id: "prompt-vault",
    icon: Archive,
    title: "Prompt Vault",
    description: "Create, organize, and manage your team's prompt library.",
    articles: [
      {
        q: "How do I create and edit prompts?",
        a: "Click \"New Prompt\" in the vault. Fill in the title, content, description, and optional tags. To edit an existing prompt, click it to open the detail view, make your changes, and save. Version history is maintained automatically so you can track changes over time.",
        keywords: ["create", "edit", "modify", "update", "prompt"],
      },
      {
        q: "What are prompt templates?",
        a: "Templates are prompts with dynamic variables wrapped in double curly braces — like {{company_name}}, {{tone}}, or {{context}}. When someone uses a template (in the app or extension), they fill in the blanks to customize the prompt for their specific need. Templates are great for standardizing common workflows.",
        keywords: ["template", "variables", "dynamic", "curly braces", "placeholders"],
      },
      {
        q: "How do tags and filtering work?",
        a: "Add tags like \"marketing,\" \"support,\" or \"onboarding\" when creating prompts. In the vault, use the filter bar to narrow results by tag, status, or author. In the extension, the search bar matches against title, description, and tags for quick access.",
        keywords: ["tags", "filter", "search", "organize", "find"],
      },
      {
        q: "What is the prompt approval workflow?",
        a: "Prompts follow a draft → pending → approved lifecycle. Drafts are private to the author. Submitting a prompt moves it to \"pending\" where admins and managers can review it. Approved prompts appear in the shared vault and extension. Rejected prompts return to draft with feedback.",
        keywords: ["approval", "workflow", "pending", "draft", "review", "reject"],
      },
      {
        q: "How do I share prompts with my team?",
        a: "Approved prompts are automatically visible to everyone in your workspace — in both the web app and the browser extension. You can also add prompts to collections for better organization or share a direct link to any prompt.",
        keywords: ["share", "team", "visible", "access"],
      },
      {
        q: "Can I import existing prompts?",
        a: "Yes. Go to Import/Export in the sidebar. You can import prompts from a JSON or CSV file. The importer maps your columns to TeamPrompt fields and lets you preview before confirming. Bulk export is also available for backup or migration.",
        keywords: ["import", "export", "csv", "json", "migrate", "backup"],
      },
    ],
  },
  {
    id: "collections",
    icon: FolderOpen,
    title: "Collections",
    description: "Organize prompts into curated groups for projects, teams, or workflows.",
    articles: [
      {
        q: "How do collections work?",
        a: "Collections are curated groups of prompts organized around a theme, project, or workflow. Create a collection, give it a name and description, then add prompts to it. Collections can be scoped to the whole organization or specific teams. Think of them as playlists for your prompts.",
        keywords: ["collection", "group", "organize", "folder"],
      },
      {
        q: "How do I create a collection?",
        a: "Go to the Collections page in the sidebar. Click \"New Collection,\" name it, add an optional description, and choose visibility (org-wide or team-specific). Then add prompts by browsing the vault or searching.",
        keywords: ["create", "new collection", "add"],
      },
      {
        q: "Can I share collections with specific teams?",
        a: "Yes. When creating or editing a collection, set its visibility to a specific team. Only members of that team will see it. Org-wide collections are visible to everyone.",
        keywords: ["share", "team", "visibility", "scope"],
      },
    ],
  },
  {
    id: "guidelines",
    icon: BookOpen,
    title: "Quality Guidelines",
    description: "Define standards for how your team interacts with AI tools.",
    articles: [
      {
        q: "What are quality guidelines?",
        a: "Quality guidelines define your team's standards for AI interactions — things like tone of voice, required disclaimers, formatting preferences, or domain-specific rules. They help ensure consistent, high-quality outputs across your organization.",
        keywords: ["guidelines", "standards", "quality", "rules", "tone"],
      },
      {
        q: "How do I create guidelines?",
        a: "Go to the Guidelines page from the sidebar. Click \"New Guideline\" and define a name, description, category, and the specific rules it contains. Guidelines can be suggestions or enforced requirements depending on your configuration.",
        keywords: ["create", "new guideline", "add", "configure"],
      },
      {
        q: "Can I install pre-built guidelines?",
        a: "Yes. TeamPrompt ships with a library of default guidelines covering common needs — professional writing, coding standards, customer support tone, marketing voice, and executive communication. Install them with one click from the Library page and customize to fit your team.",
        keywords: ["default", "pre-built", "install", "library", "template"],
      },
      {
        q: "What's the difference between guidelines and guardrails?",
        a: "Guidelines define quality standards (tone, format, best practices) and are advisory. Guardrails are security rules that detect sensitive data and can block or warn in real-time. Guidelines live on the Guidelines page; guardrails live on the Guardrails page under Intelligence.",
        keywords: ["difference", "guidelines", "guardrails", "security", "quality"],
      },
    ],
  },
  {
    id: "guardrails",
    icon: Shield,
    title: "AI Guardrails & DLP",
    description: "Protect sensitive data with real-time scanning before it reaches AI tools.",
    articles: [
      {
        q: "What is DLP scanning?",
        a: "Data Loss Prevention (DLP) scanning analyzes text in real-time before it reaches AI tools. The browser extension intercepts outbound messages, sends them to your workspace's security rules engine, and blocks or warns if sensitive patterns are detected. This is your safety net against accidentally sharing confidential data with AI.",
        keywords: ["dlp", "scanning", "data loss prevention", "security", "sensitive"],
      },
      {
        q: "What patterns are detected by default?",
        a: "Built-in rules detect AWS keys, GitHub tokens, Stripe keys, OpenAI API keys, database connection strings, OAuth tokens, Slack tokens, and common credentials like passwords. These rules use regex patterns and are active out of the box when guardrails are enabled.",
        keywords: ["patterns", "default rules", "api keys", "credentials", "built-in"],
      },
      {
        q: "How do I create custom security rules?",
        a: "Go to the Guardrails page (under Intelligence in the sidebar). Click \"New Rule\" and define a name, description, pattern (regex, exact match, or glob), category, and severity level (block or warn). Custom rules run alongside the built-in detections.",
        keywords: ["custom rule", "create", "regex", "pattern", "new rule"],
      },
      {
        q: "What's the difference between Block and Warn?",
        a: "Block severity prevents the message from being sent to the AI tool entirely — the extension stops the submission and shows an overlay explaining what was detected. Warn severity shows an alert but lets the user proceed after acknowledging the warning. All violations are logged to the activity log for audit.",
        keywords: ["block", "warn", "severity", "action", "prevent"],
      },
      {
        q: "How does the extension enforce guardrails?",
        a: "When you press Enter in a supported AI tool, the extension intercepts the submission, sends the message text to your workspace's scan API, and waits for the result. If a block-level violation is found, the message is prevented from sending. If a warning is found, a banner appears. The floating shield indicator shows scanning status in real-time.",
        keywords: ["extension", "enforce", "intercept", "real-time", "shield"],
      },
      {
        q: "Where can I see violation history?",
        a: "All violations are logged automatically. View them on the Activity Log page (under Intelligence in the sidebar), in the Guardrails page's recent violations section, or in the extension's Shield tab. Each entry shows the rule that triggered, the redacted matched text, and the action taken.",
        keywords: ["violations", "history", "log", "audit", "activity"],
      },
      {
        q: "How do I enable guardrails for the first time?",
        a: "Go to the Guardrails page and click \"Enable Default Rules\" to install the built-in security patterns. They're active immediately. You can also open the extension's Shield tab and enable them from there. Once active, the extension's shield indicator turns green on AI pages.",
        keywords: ["enable", "setup", "first time", "activate", "default rules"],
      },
    ],
  },
  {
    id: "extension",
    icon: Chrome,
    title: "Browser Extension",
    description: "Insert prompts and enforce guardrails directly in ChatGPT, Claude, and more.",
    articles: [
      {
        q: "Which AI tools are supported?",
        a: "The extension works with ChatGPT (chat.openai.com & chatgpt.com), Claude (claude.ai), Google Gemini, Microsoft Copilot, and Perplexity. It detects these tools automatically when you visit them.",
        keywords: ["supported", "ai tools", "chatgpt", "claude", "gemini", "copilot", "perplexity"],
      },
      {
        q: "How do I install and sign in?",
        a: "Install from the Chrome Web Store (search \"TeamPrompt\"). Click the TeamPrompt icon in your browser toolbar and sign in with your email/password, Google, or GitHub account. Your prompts, collections, and guardrail settings sync automatically from your workspace.",
        keywords: ["install", "sign in", "login", "chrome", "setup"],
      },
      {
        q: "How do I insert prompts into AI tools?",
        a: "Open any supported AI tool. Click the TeamPrompt extension icon (or open the side panel). Browse or search your prompts. Click \"Insert\" to place the prompt directly into the AI tool's input field. For templates, fill in the variable fields first, then insert.",
        keywords: ["insert", "paste", "use prompt", "input", "fill"],
      },
      {
        q: "What does the shield indicator mean?",
        a: "The floating shield in the bottom-left corner of AI pages shows TeamPrompt's monitoring status. Green shield = guardrails are active with rules enabled. Amber shield = no rules configured yet. Gray = not signed in. When you send a message, the shield briefly shows \"Scanning...\" while checking for violations.",
        keywords: ["shield", "indicator", "status", "monitoring", "green", "amber"],
      },
      {
        q: "Does the extension work offline?",
        a: "The extension requires an internet connection to sync prompts and run DLP scans (rules are evaluated server-side for security). If you're offline, prompt insertion still works with cached data, but guardrail scanning is skipped.",
        keywords: ["offline", "connection", "cache", "network"],
      },
      {
        q: "How do I use the side panel?",
        a: "On Chrome and Edge, click the TeamPrompt icon and select \"Open in side panel.\" The side panel stays open alongside the AI tool, giving you persistent access to your prompt library without switching tabs. It includes the same search, insert, and Shield features.",
        keywords: ["side panel", "sidebar", "persistent", "chrome", "edge"],
      },
    ],
  },
  {
    id: "team-management",
    icon: Users,
    title: "Team Management",
    description: "Invite members, assign roles, and organize your team.",
    articles: [
      {
        q: "How do I invite and manage members?",
        a: "Navigate to the Team page from the sidebar. Click \"Invite Member\" to send email invitations — choose a role and optionally assign them to a team. From the same page, you can change roles, view extension status, or remove members.",
        keywords: ["invite", "manage", "add", "remove", "members"],
      },
      {
        q: "How do teams (sub-groups) work?",
        a: "Teams are sub-groups within your organization — for departments, projects, or functional groups. Create teams on the Team page, then assign members. Collections and guidelines can be scoped to specific teams for targeted content.",
        keywords: ["teams", "sub-groups", "departments", "organize", "assign"],
      },
      {
        q: "How do I change someone's role?",
        a: "On the Team page, find the member in the Members list. Use the role dropdown next to their name to change between Admin, Manager, and Member. The change takes effect immediately. Note: you can't demote the last remaining admin.",
        keywords: ["change role", "promote", "demote", "permissions"],
      },
      {
        q: "How do I remove a member?",
        a: "On the Team page, hover over the member's row and click the remove button. Confirm the action. Their access is revoked immediately. Content they created (prompts, collections) remains in the workspace.",
        keywords: ["remove", "delete", "deactivate", "revoke"],
      },
      {
        q: "Can I see who has the extension installed?",
        a: "Yes. The Team page shows an extension status badge next to each member — indicating whether they have the extension installed, when it was last active, and which version they're running.",
        keywords: ["extension status", "installed", "active", "version"],
      },
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics & Activity",
    description: "Track AI usage, security events, and team activity.",
    articles: [
      {
        q: "What does the Analytics page show?",
        a: "Analytics provides an overview of your workspace's AI usage — total interactions, most-used prompts, active users, interactions by AI tool, and guardrail statistics. Use it to understand adoption patterns and identify opportunities.",
        keywords: ["analytics", "dashboard", "metrics", "usage", "stats"],
      },
      {
        q: "What is the Activity Log?",
        a: "The Activity Log records every AI interaction captured by the extension — which tool was used, what was sent (or blocked), timestamps, and the user. It's your audit trail for compliance and security review.",
        keywords: ["activity log", "audit", "history", "interactions", "compliance"],
      },
      {
        q: "Can I export activity data?",
        a: "Yes. Use the Import/Export page to export activity logs, prompts, and other data. Export formats include JSON and CSV for integration with your existing reporting tools.",
        keywords: ["export", "download", "csv", "json", "report"],
      },
    ],
  },
  {
    id: "import-export",
    icon: Import,
    title: "Import & Export",
    description: "Migrate data in and out of TeamPrompt.",
    articles: [
      {
        q: "How do I import prompts?",
        a: "Go to Import/Export in the sidebar. Upload a JSON or CSV file containing your prompts. The importer maps your columns to TeamPrompt fields (title, content, tags, etc.) and lets you preview before confirming the import.",
        keywords: ["import", "upload", "csv", "json", "migrate"],
      },
      {
        q: "How do I export my data?",
        a: "On the Import/Export page, choose what to export — prompts, collections, activity logs, or all data. Select JSON or CSV format and download. Exports include all metadata like tags, descriptions, and timestamps.",
        keywords: ["export", "download", "backup", "data"],
      },
      {
        q: "Can I migrate from another tool?",
        a: "Yes. If your prompts are in a spreadsheet or another tool that exports CSV/JSON, you can import them directly. The column mapper handles different field names. For custom migrations, contact support.",
        keywords: ["migrate", "switch", "transfer", "another tool"],
      },
    ],
  },
  {
    id: "billing",
    icon: CreditCard,
    title: "Billing & Plans",
    description: "Manage your subscription, understand plan limits, and handle payments.",
    articles: [
      {
        q: "What plans are available?",
        a: "Free: up to 5 members and 50 prompts with core features. Team ($12/user/mo): up to 25 members with guardrails, analytics, and priority support. Business ($24/user/mo): up to 500 members with full audit logging, SSO, and dedicated support. See the pricing page for full details.",
        keywords: ["plans", "pricing", "free", "team", "business", "cost"],
      },
      {
        q: "How do I upgrade or downgrade?",
        a: "Go to Settings → Plan & Usage tab and click \"Manage Subscription,\" or visit the Billing page from the sidebar menu. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period.",
        keywords: ["upgrade", "downgrade", "change plan", "subscription"],
      },
      {
        q: "Is there a free trial?",
        a: "Yes. All paid plans come with a 14-day free trial. No credit card required to start. At the end of the trial, your workspace moves to the free plan unless you subscribe. No data is lost.",
        keywords: ["trial", "free trial", "14 days", "no credit card"],
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings → Plan & Usage and click \"Manage Subscription.\" Cancel anytime — your workspace stays active through the end of the billing period. All data is preserved, and you can resubscribe later.",
        keywords: ["cancel", "unsubscribe", "stop", "end subscription"],
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards through Stripe. Enterprise customers can arrange invoice-based billing. Contact support for custom payment arrangements.",
        keywords: ["payment", "credit card", "stripe", "invoice"],
      },
    ],
  },
  {
    id: "account-security",
    icon: Lock,
    title: "Account & Security",
    description: "Manage your account, passwords, and data privacy.",
    articles: [
      {
        q: "How do I reset my password?",
        a: "Click \"Forgot Password\" on the login page and enter your email. You'll receive a link to set a new password. If you're already signed in, go to Settings → Profile to update your password.",
        keywords: ["password", "reset", "forgot", "change password"],
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → the Danger Zone at the bottom. Click \"Delete Account.\" This permanently removes your profile and personal data. If you're the only admin of a workspace, you'll need to promote another member to admin first.",
        keywords: ["delete account", "remove", "permanent", "deactivate"],
      },
      {
        q: "How is my data stored and protected?",
        a: "All data is stored in Supabase (backed by PostgreSQL) with row-level security policies ensuring users only access their own organization's data. Data is encrypted in transit via TLS. We do not sell or share your data with third parties. The extension communicates exclusively with your workspace's API.",
        keywords: ["data", "privacy", "security", "encryption", "storage", "supabase"],
      },
      {
        q: "Does TeamPrompt store the text I send to AI tools?",
        a: "Only if your workspace has activity logging enabled. Logged interactions are stored in your workspace's database and are visible only to admins and managers via the Activity Log. You can disable logging or configure retention policies from the Guardrails settings.",
        keywords: ["logging", "store", "text", "privacy", "retention", "interactions"],
      },
    ],
  },
];

// ─── FAQs (for public page structured data + summary section) ───

export const HELP_FAQS: FAQ[] = [
  {
    question: "Is TeamPrompt free to use?",
    answer:
      "Yes. The free plan includes up to 5 team members, 50 prompts, and core features like the browser extension. Paid plans unlock higher limits and advanced features like DLP guardrails and analytics.",
  },
  {
    question: "Which AI tools does the browser extension support?",
    answer:
      "ChatGPT, Claude, Google Gemini, Microsoft Copilot, and Perplexity. The extension lets you insert prompts directly into any of these tools with one click and scans outbound messages for sensitive data.",
  },
  {
    question: "Can I use TeamPrompt without the browser extension?",
    answer:
      "Absolutely. The web app works on its own for managing prompts, collections, guidelines, and team settings. The extension adds the convenience of prompt insertion and real-time DLP scanning directly inside AI tools.",
  },
  {
    question: "How does DLP scanning protect my data?",
    answer:
      "When you press Enter in a supported AI tool, the extension intercepts the message and checks it against your workspace's security rules. If sensitive patterns are detected (API keys, credentials, PII), the message is blocked or flagged with a warning — before it ever reaches the AI model.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the support form on the help page, or email us directly at support@teamprompt.app. We typically respond within one business day.",
  },
  {
    question: "Can I import and export prompts?",
    answer:
      "Yes. Use the Import/Export page to upload prompts from JSON or CSV files, or export your entire prompt library for backup and migration.",
  },
];

// ─── Search utility ───

export function searchHelpContent(query: string): { category: HelpCategory; article: HelpArticle }[] {
  if (!query.trim()) return [];

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: { category: HelpCategory; article: HelpArticle; score: number }[] = [];

  for (const category of HELP_CATEGORIES) {
    for (const article of category.articles) {
      const searchText = [
        article.q,
        article.a,
        category.title,
        ...(article.keywords || []),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (searchText.includes(term)) {
          score += 1;
          // Boost for question match
          if (article.q.toLowerCase().includes(term)) score += 2;
          // Boost for keyword match
          if (article.keywords?.some((k) => k.includes(term))) score += 1;
        }
      }

      if (score > 0) {
        results.push({ category, article, score });
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map(({ category, article }) => ({ category, article }));
}
