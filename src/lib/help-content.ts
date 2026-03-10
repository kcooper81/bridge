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
  Import,
} from "lucide-react";

// ─── Types ───

export interface HelpArticle {
  q: string;
  a: string;
  /** Optional keywords to boost search relevance beyond q + a text */
  keywords?: string[];
  /** URL-safe slug derived from the question */
  slug: string;
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

// ─── Slug helper ───

/** Strips common question prefixes and kebab-cases the remainder. */
export function generateSlug(question: string): string {
  return question
    .replace(/^(how do i |how does |how do |what is the |what is |what are the |what are |what does |what's the |what's |where can i |where do i |can i |does |is there a |is there |do i )/i, "")
    .replace(/\?$/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Overview ───

export const HELP_OVERVIEW = {
  title: "Help & Documentation",
  subtitle:
    "Everything you need to get the most out of TeamPrompt — from first setup to advanced security rules.",
  description: [
    "TeamPrompt is a collaborative prompt management platform that helps teams standardize, secure, and scale their AI usage. Your workspace is the central hub where prompts are created, reviewed, and shared across your organization.",
    "The browser extension connects TeamPrompt to the AI tools your team already uses — ChatGPT, Claude, Gemini, Copilot, and Perplexity — so prompts are always one click away. Security rules run in real-time, scanning outbound messages for sensitive data before they reach any AI model.",
    "Use the categories below to find answers, or search for a specific topic.",
  ],
};

// ─── Documentation Categories ───

type RawCategory = Omit<HelpCategory, "articles"> & { articles: Omit<HelpArticle, "slug">[] };

const _RAW_CATEGORIES: RawCategory[] = [
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
        a: "Go to the Team page from the sidebar. Click \"Invite Member,\" enter their email address, and choose a role — Admin, Manager, or Member. They'll receive an email with a link to join your workspace.\n\nFor larger teams, use \"Import Members\" to upload a CSV with multiple invites at once. You can also connect Google Workspace from Settings → Integrations to sync your directory and invite users directly.\n\nAdmins can customize the invite email with a welcome message in Settings → Organization → Invite Email. If your organization has a domain set, you can enable auto-join so new users with matching email addresses join automatically — no invite required.",
        keywords: ["invite", "add member", "email", "onboarding", "bulk import", "csv", "auto-join"],
      },
      {
        q: "How do I install the browser extension?",
        a: "Visit the extension store for your browser — Chrome Web Store, Firefox Add-ons, or Edge Add-ons — and search for \"TeamPrompt,\" or click the install banner in your dashboard (it detects your browser automatically). After installing, click the TeamPrompt icon in your toolbar and sign in with your account. Your prompts, settings, and security rules sync automatically.",
        keywords: ["chrome", "firefox", "edge", "extension", "install", "browser", "addon"],
      },
      {
        q: "How do I create my first prompt?",
        a: "Click \"New Prompt\" from the Prompt Library. Give it a title, write your prompt content (use {{variables}} for dynamic fields), add optional tags and a description, then save. It's immediately available to your team and in the extension.",
        keywords: ["new prompt", "create", "write", "template"],
      },
      {
        q: "What are the user roles?",
        a: "Admin: full access including billing, settings, team management, and security rule configuration. Manager: can manage prompts, approve content, and view the activity log. Member: can use approved prompts, create drafts, and view shared content. All roles can use the browser extension.",
        keywords: ["roles", "permissions", "admin", "manager", "member", "access"],
      },
      {
        q: "How does the approval workflow work?",
        a: "New prompts can be saved as drafts (visible only to you) or submitted for review. Submitted prompts appear in the \"Pending\" queue. Admins and managers review them and approve or reject with feedback. Approved prompts become available to the entire team.",
        keywords: ["approval", "review", "pending", "draft", "workflow"],
      },
      {
        q: "How do I use the approval queue?",
        a: "The Approval Queue (accessible from the sidebar for Admins and Managers) is a dedicated dashboard showing all pending items that need review — including submitted prompts and suggested security rules. Each item shows the author, submission date, and content preview. You can approve or reject with one click, and optionally add feedback. The sidebar badge shows the current count of pending items so you always know when reviews are waiting.",
        keywords: ["approval queue", "approvals", "pending", "review", "dashboard", "approve", "reject"],
      },
    ],
  },
  {
    id: "prompt-library",
    icon: Archive,
    title: "Prompt Library",
    description: "Create, organize, and manage your team's prompt library.",
    articles: [
      {
        q: "How do I create and edit prompts?",
        a: "Click \"New Prompt\" in the library. Fill in the title, content, description, and optional tags. To edit an existing prompt, click it to open the detail view, make your changes, and save. Version history is maintained automatically so you can track changes over time.",
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
        a: "Approved prompts are automatically visible to everyone in your workspace — in both the web app and the browser extension. You can organize prompts into categories or share a direct link to any prompt.",
        keywords: ["share", "team", "visible", "access"],
      },
      {
        q: "Can I import existing prompts?",
        a: "Yes. Go to Import/Export in the sidebar. You can import prompts from a JSON or CSV file. The importer maps your columns to TeamPrompt fields and lets you preview before confirming. Bulk export is also available for backup or migration.",
        keywords: ["import", "export", "csv", "json", "migrate", "backup"],
      },
      {
        q: "How do I compare prompt versions?",
        a: "Open any prompt and click the version history icon. You'll see a timeline of all changes. Select any two versions to view a side-by-side diff — additions are highlighted in green, deletions in red, and unchanged text is shown in context. You can also restore any previous version with one click.",
        keywords: ["version", "diff", "compare", "history", "changes", "restore"],
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
        a: "Yes. TeamPrompt ships with a library of default guidelines covering common needs — professional writing, coding standards, customer support tone, marketing voice, and executive communication. Install them with one click from the Templates page and customize to fit your team.",
        keywords: ["default", "pre-built", "install", "library", "template"],
      },
      {
        q: "What's the difference between guidelines and security rules?",
        a: "Guidelines define quality standards (tone, format, best practices) and are advisory. Security rules detect sensitive data and can block or warn in real-time. Guidelines live on the Guidelines page; security rules live on the Security page under Intelligence.",
        keywords: ["difference", "guidelines", "security rules", "security", "quality"],
      },
    ],
  },
  {
    id: "security-rules",
    icon: Shield,
    title: "AI Security Rules & DLP",
    description: "Protect sensitive data with real-time scanning before it reaches AI tools.",
    articles: [
      {
        q: "What is DLP scanning?",
        a: "Data Loss Prevention (DLP) scanning analyzes text in real-time before it reaches AI tools. The browser extension intercepts outbound messages, sends them to your workspace's security rules engine, and blocks or warns if sensitive patterns are detected. This is your safety net against accidentally sharing confidential data with AI.",
        keywords: ["dlp", "scanning", "data loss prevention", "security", "sensitive"],
      },
      {
        q: "What patterns are detected by default?",
        a: "Built-in rules detect AWS keys, GitHub tokens, Stripe keys, OpenAI API keys, database connection strings, OAuth tokens, Slack tokens, and common credentials like passwords. These rules use regex patterns and are active out of the box when security rules are enabled.",
        keywords: ["patterns", "default rules", "api keys", "credentials", "built-in"],
      },
      {
        q: "How do I create custom security rules?",
        a: "Go to the Security Rules page (under Intelligence in the sidebar). Click \"New Rule\" and define a name, description, pattern (regex, exact match, or glob), category, and severity level (block or warn). Custom rules run alongside the built-in detections.",
        keywords: ["custom rule", "create", "regex", "pattern", "new rule"],
      },
      {
        q: "What's the difference between Block and Warn?",
        a: "Block severity prevents the message from being sent to the AI tool entirely — the extension stops the submission and shows an overlay explaining what was detected. Warn severity shows an alert but lets the user proceed after acknowledging the warning. All violations are logged to the activity log for audit.",
        keywords: ["block", "warn", "severity", "action", "prevent"],
      },
      {
        q: "How does the extension enforce security rules?",
        a: "When you press Enter in a supported AI tool, the extension intercepts the submission, sends the message text to your workspace's scan API, and waits for the result. If a block-level violation is found, the message is prevented from sending. If a warning is found, a banner appears. The floating shield indicator shows scanning status in real-time.",
        keywords: ["extension", "enforce", "intercept", "real-time", "shield"],
      },
      {
        q: "Where can I see violation history?",
        a: "All violations are logged automatically. View them on the Activity Log page (under Intelligence in the sidebar), in the Security Rules page's Violations tab, or in the extension's Shield tab. Each entry shows the rule that triggered, the redacted matched text, and the action taken. The Violations table is sortable by date, user, policy, detection type, and action taken.",
        keywords: ["violations", "history", "log", "audit", "activity"],
      },
      {
        q: "What do the guardrail stats show?",
        a: "The Security Rules page displays four stat cards at the top:\n\n• **Active / Inactive Policies** — how many of your rules are currently enabled vs. disabled.\n• **Violations** — total violation count with a week-over-week trend indicator showing whether violations are increasing or decreasing.\n• **Block Rate** — the percentage of violations that resulted in a hard block (vs. warning).\n• **Top Triggered Rule** — the most frequently triggered rule by name, or a prompt to install packs if no violations exist yet.\n\nThese stats give admins and managers an at-a-glance view of guardrail effectiveness.",
        keywords: ["guardrail stats", "statistics", "block rate", "trend", "top triggered", "active policies"],
      },
      {
        q: "How do I enable security rules for the first time?",
        a: "Go to the Security Rules page and click \"Enable Default Rules\" to install the built-in security patterns. They're active immediately. You can also open the extension's Shield tab and enable them from there. Once active, the extension's shield indicator turns green on AI pages.",
        keywords: ["enable", "setup", "first time", "activate", "default rules"],
      },
      {
        q: "What are admin security settings?",
        a: "Admin security settings are org-level controls that govern how the browser extension behaves for all members. Admins can configure these from Settings → Security. The 6 settings are:\n\n• **Require Sign-in for Extension** (default: on) — Users must sign in before the extension activates.\n• **Allow All AI Tools** (default: on, Team+) — When disabled, the extension only works on approved AI platforms.\n• **Enable DLP Security Rules** (default: on) — Master switch for all guardrail scanning. Turning this off disables all DLP checks org-wide.\n• **Allow Warning Override** (default: on, Team+) — When disabled, warning-level detections are treated as hard blocks. Users cannot proceed past any guardrail detection.\n• **Auto-Redact Sensitive Data** (default: off, Team+) — Automatically replaces detected sensitive data with {{PLACEHOLDER}} tokens instead of blocking.\n• **Activity Logging** (default: on, Team+) — Logs all AI interactions to the Activity Log. Disabling stops recording but still tracks usage counts.\n\nSome settings are plan-gated and require a Team or Business plan. Changes take effect immediately for all members.",
        keywords: ["admin security", "security settings", "extension controls", "org settings", "security rules toggle", "activity logging", "auto-redact", "override"],
      },
      {
        q: "What are compliance policy packs?",
        a: "Compliance policy packs are pre-built bundles of security rules designed for specific regulatory frameworks. TeamPrompt includes 19 packs across 8 industry categories:\n\n• **Healthcare**: HIPAA (protected health information), HITECH (health IT enforcement)\n• **Education**: FERPA (student data privacy)\n• **Finance & Banking**: PCI-DSS (payment card data), GLBA (financial privacy), SOX (financial reporting controls)\n• **Privacy & Consumer**: GDPR (EU personal data), CCPA (California consumer privacy), COPPA (children's online privacy), FTC/Retail (consumer data practices), General PII (common personally identifiable information)\n• **Government & Defense**: NIST 800-171 (controlled unclassified information), FedRAMP (federal cloud security), CJIS (criminal justice information), ITAR (defense trade controls)\n• **Insurance**: NAIC (insurance data security model law)\n• **Real Estate & Legal**: RESPA/TILA (mortgage and lending disclosures), Legal Privilege (attorney-client and litigation hold)\n• **Technology & Operations**: SOC 2 (service organization controls)\n\nInstall any pack with one click from the Security Rules page — all relevant rules activate immediately. You can customize or extend any pack after installation.",
        keywords: ["compliance", "policy packs", "hipaa", "gdpr", "pci-dss", "ccpa", "soc2", "regulatory", "ferpa", "glba", "nist", "fedramp", "cjis", "itar", "coppa", "hitech", "sox", "naic", "respa", "tila", "legal privilege"],
      },
      {
        q: "How do I browse and install compliance packs?",
        a: "On the Security Rules page (Policies tab), click \"Browse All Packs\" to open the compliance pack browser. Packs are organized by industry category — Healthcare, Education, Finance, Privacy, Government, Insurance, Real Estate & Legal, and Technology. Each pack shows its name, description, number of rules, and whether it's already installed. Click \"Install\" to add all rules from a pack. Installed packs show a green checkmark. You can install multiple packs — rules from different packs work together seamlessly.",
        keywords: ["browse packs", "install pack", "compliance browser", "industry packs", "add pack"],
      },
      {
        q: "How do I filter policies by compliance pack?",
        a: "Once you've installed one or more compliance packs, a \"Pack\" filter dropdown appears on the Policies tab. Use it to filter rules by their source pack (e.g., show only HIPAA rules), show rules with no pack (custom rules), or view all rules. This makes it easy to audit which rules came from which framework.",
        keywords: ["filter pack", "pack filter", "source pack", "compliance filter", "policy filter"],
      },
      {
        q: "How do I sort the policies and violations tables?",
        a: "Both the Policies and Violations tables have sortable columns. Click any column header to sort by that column — click again to reverse the direction. The arrow icon indicates the current sort. Policies can be sorted by name, source pack, scope, category, severity, or active status. Violations can be sorted by date, user, policy name, detection type, or action taken.",
        keywords: ["sort", "sortable", "table sort", "column sort", "order", "policies table", "violations table"],
      },
      {
        q: "How does auto-sanitization work?",
        a: "Auto-sanitization automatically replaces detected sensitive data with safe placeholder tokens (like {{PATIENT_NAME}} or {{SSN}}) before the prompt reaches an AI tool. When a guardrail rule detects sensitive content, instead of just blocking or warning, the sanitization option replaces the matched text with a descriptive {{PLACEHOLDER}} token. The original prompt structure and intent are preserved while removing the actual sensitive data. Sanitized prompts are logged in the audit trail with both the original detection and the replacement applied.",
        keywords: ["auto-sanitization", "sanitize", "placeholder", "token", "replace", "sensitive data"],
      },
      {
        q: "How do I suggest a security rule?",
        a: "Members can suggest new security rules from the Security Rules page by clicking \"Suggest Rule.\" Fill in the rule name, description, pattern, and category. The suggestion is submitted to the approval queue where admins and managers can review, approve, or reject it. Approved suggestions become active security rules. You'll be notified when your suggestion is reviewed.",
        keywords: ["suggest", "rule suggestion", "propose", "new rule", "request"],
      },
      {
        q: "How do I generate rules with AI?",
        a: "Admins and managers can use AI to generate guardrail rules automatically. First, connect an API key in Guardrails → Detection tab — either OpenAI or Anthropic (Claude) is supported. Then click the \"AI Generate\" button on the Policies tab. Describe what sensitive data you want to protect in plain English (e.g., \"Block our internal project names: Falcon, Titan, and Aurora\"). The AI will generate one or more rules with appropriate patterns, categories, and severity levels. Review the generated rules, select the ones you want, and click Create to add them. If you haven't connected an API key yet, the modal will prompt you to set one up in Detection settings.",
        keywords: ["ai generate", "ai rules", "generate rules", "openai", "anthropic", "claude", "automatic", "detection settings", "api key"],
      },
    ],
  },
  {
    id: "extension",
    icon: Chrome,
    title: "Browser Extension",
    description: "Insert prompts and enforce security rules directly in ChatGPT, Claude, and more.",
    articles: [
      {
        q: "Which AI tools are supported?",
        a: "The extension works with ChatGPT (chat.openai.com & chatgpt.com), Claude (claude.ai), Google Gemini, Microsoft Copilot, and Perplexity. It detects these tools automatically when you visit them.",
        keywords: ["supported", "ai tools", "chatgpt", "claude", "gemini", "copilot", "perplexity"],
      },
      {
        q: "How do I install and sign in?",
        a: "Install from your browser's extension store — Chrome Web Store, Firefox Add-ons, or Edge Add-ons (search \"TeamPrompt\"). You can also visit teamprompt.app/extensions for direct links. Click the TeamPrompt icon in your browser toolbar and sign in with your email/password, Google, or GitHub account. Your prompts and guardrail settings sync automatically from your workspace.",
        keywords: ["install", "sign in", "login", "chrome", "firefox", "edge", "setup"],
      },
      {
        q: "How do I insert prompts into AI tools?",
        a: "Open any supported AI tool. Click the TeamPrompt extension icon (or open the side panel). Browse or search your prompts. Click \"Insert\" to place the prompt directly into the AI tool's input field. For templates, fill in the variable fields first, then insert.",
        keywords: ["insert", "paste", "use prompt", "input", "fill"],
      },
      {
        q: "What does the shield indicator mean?",
        a: "The floating shield in the bottom-left corner of AI pages shows TeamPrompt's monitoring status. Green shield = security rules are active with rules enabled. Amber shield = no rules configured yet. Gray = not signed in. When you send a message, the shield briefly shows \"Scanning...\" while checking for violations.",
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
      {
        q: "What are extension inactive alerts?",
        a: "When a team member's browser extension has been inactive for over 24 hours, all admins and managers in the organization receive an in-app notification and email alert. This helps you stay aware of members who may have disabled or uninstalled the extension. Alerts are sent at most once per member every 7 days to avoid spam.",
        keywords: ["inactive alert", "extension inactive", "notification", "email alert", "disabled extension", "uninstalled"],
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
        a: "Navigate to the Team page from the sidebar. Click \"Invite Member\" to send email invitations — choose a role and optionally assign them to a team. Use \"Import Members\" for bulk CSV invites, or connect Google Workspace from Settings → Integrations to sync your directory.\n\nFrom the Team page you can change individual roles via the dropdown, use checkboxes to select multiple members for bulk role changes, view extension status, toggle guardrail shields, or remove members. Admins can also customize the welcome message that appears in all invite emails from Settings → Organization.",
        keywords: ["invite", "manage", "add", "remove", "members", "bulk", "import"],
      },
      {
        q: "How do teams (sub-groups) work?",
        a: "Teams are sub-groups within your organization — for departments, projects, or functional groups. Create and manage teams using the \"Manage Teams\" button on the Team page (admin only), which opens a modal listing all teams with options to create, edit, or delete. Filter the member list by team using the filter chips. Guidelines and security rules can be scoped to specific teams for targeted content and policies.",
        keywords: ["teams", "sub-groups", "departments", "organize", "assign", "manage teams"],
      },
      {
        q: "How do I change someone's role?",
        a: "On the Team page, find the member in the Members list. Use the role dropdown next to their name to change between Admin, Manager, and Member. The change takes effect immediately. Note: you can't demote the last remaining admin.\n\nTo change roles for multiple people at once, use the checkboxes to select members, then pick a role from the bulk action bar and click Apply.",
        keywords: ["change role", "promote", "demote", "permissions", "bulk role"],
      },
      {
        q: "How do I remove a member?",
        a: "On the Team page, hover over the member's row and click the remove button. Confirm the action. Their access is revoked immediately. Content they created (prompts) remains in the workspace.",
        keywords: ["remove", "delete", "deactivate", "revoke"],
      },
      {
        q: "Can I see who has the extension installed?",
        a: "Yes. The Team page shows an extension status badge next to each member — indicating whether they have the extension installed, when it was last active, and which version they're running.",
        keywords: ["extension status", "installed", "active", "version"],
      },
      {
        q: "How do I change roles for multiple members at once?",
        a: "On the Team page, admins can use the checkboxes next to each member to select multiple people. A bulk action bar appears showing the number selected, a role picker, and an Apply button. Choose the target role and click Apply to update everyone at once. Use the header checkbox to select or deselect all visible members (excluding yourself). The system prevents you from demoting the last remaining admin.",
        keywords: ["bulk role", "bulk assign", "multiple members", "batch", "select all", "checkbox"],
      },
      {
        q: "How do I customize the invite welcome email?",
        a: "Go to Settings → Organization and scroll to the \"Invite Email\" card (admin only). Enter a custom welcome message — up to 500 characters — that will appear as a styled quote at the top of every invite email your organization sends, including both individual and bulk invites. This is a great way to add a personal greeting or explain how your team uses TeamPrompt.",
        keywords: ["welcome message", "invite email", "custom email", "onboarding message", "invite customization"],
      },
      {
        q: "What is domain-based auto-join?",
        a: "Domain-based auto-join lets new users automatically join your organization when they sign up with a matching email domain. For example, if your org domain is \"acme.com\" and auto-join is enabled, anyone who signs up with an @acme.com email will be added as a member automatically — no invite needed.\n\nTo enable it: go to Settings → Organization, set your domain in the Organization Details card, then toggle \"Auto-Join by Domain\" in the Preferences card. Free email providers (Gmail, Yahoo, Outlook, etc.) are excluded to prevent accidental matches. The user must be in a solo personal workspace to be eligible for auto-join.",
        keywords: ["auto-join", "domain", "automatic", "signup", "onboarding", "no invite"],
      },
      {
        q: "How do I connect Google Workspace to sync my directory?",
        a: "Go to Settings → Organization → Integrations and click \"Connect\" on the Google Workspace card. You'll be redirected to Google to authorize TeamPrompt to read your directory (users and groups). After authorizing, you're redirected back and the card shows \"Connected\" with the admin email used.\n\nClick \"Sync Now\" to fetch your directory. TeamPrompt pulls all active users (up to 2,000) and groups, filters out anyone who's already a member, and opens the bulk import preview so you can review and send invites. You can sync as often as you like — only new users appear each time.\n\nTo disconnect, click the unplug icon on the Google Workspace card. This revokes the token and removes the connection. Already-synced members are not affected.",
        keywords: ["google workspace", "directory sync", "google admin", "import users", "google groups", "integration", "connect google"],
      },
      {
        q: "How does the org chart view work?",
        a: "Toggle between table and org chart view using the icons in the Team page toolbar. The org chart displays your teams as visual cards with member avatars, roles, and team counts. Click any team card to drill into a detailed team view showing all members with their roles. From the detail view, admins can edit the team name/description or delete the team using the buttons in the header. Members not assigned to any team appear in an 'Unassigned' card. Use the \"Manage Teams\" button to create, edit, or delete teams from a centralized modal.",
        keywords: ["org chart", "organization chart", "team view", "visual", "cards", "toggle view", "team detail"],
      },
      {
        q: "How do I add an existing member to another team?",
        a: "Click 'Invite Member', type their email — the modal will detect they're already in your org and switch to an 'Add to Team' mode. Select the team and click 'Add to Team'. You can also add members from the team detail view by double-clicking a team filter chip or clicking a team card in org chart view.",
        keywords: ["add member", "existing member", "another team", "add to team", "move team"],
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
        a: "Analytics provides an overview of your workspace's AI usage — total interactions, most-used prompts, active users, interactions by AI tool, prompt effectiveness metrics, and guardrail activity.\n\nThe effectiveness view shows rating distributions, average scores, and trends over time so you can see which prompts actually deliver results.\n\nThe **Guardrail Activity** section (visible to admins and managers when violations exist) shows total blocks and warnings, block rate percentage, number of flagged users, a bar chart of most-triggered rules by severity, and a per-member violation breakdown table. Use it to understand adoption patterns, identify security risks, and track compliance.",
        keywords: ["analytics", "dashboard", "metrics", "usage", "stats", "effectiveness", "ratings", "guardrail activity", "violations", "blocks", "warnings"],
      },
      {
        q: "What guardrail data appears on the dashboard?",
        a: "For admins and managers, the dashboard shows a Guardrail Activity widget when violations have been recorded. It displays blocks and warnings for the current week, total blocks, number of flagged users, and the top 3 most-triggered rules with severity badges and hit counts. Click the widget to navigate to the full Guardrails page for detailed analysis.",
        keywords: ["dashboard", "guardrail widget", "guardrail summary", "blocks", "warnings", "admin dashboard"],
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
        a: "On the Import/Export page, choose what to export — prompts, activity logs, or all data. Select JSON or CSV format and download. Exports include all metadata like tags, descriptions, and timestamps.",
        keywords: ["export", "download", "backup", "data"],
      },
      {
        q: "Can I migrate from another tool?",
        a: "Yes. If your prompts are in a spreadsheet or another tool that exports CSV/JSON, you can import them directly. The column mapper handles different field names. For custom migrations, contact support.",
        keywords: ["migrate", "switch", "transfer", "another tool"],
      },
      {
        q: "What are template packs?",
        a: "Template packs are curated collections of prompt templates bundled together for a specific use case or workflow. TeamPrompt includes built-in packs for common scenarios like customer support, sales outreach, and content creation. You can also create custom packs by selecting prompts and exporting them as a named pack. Template packs can be shared across organizations or imported from JSON files.",
        keywords: ["template packs", "packs", "bundles", "collections", "curated", "built-in"],
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
        a: "Free: 1 member and 25 prompts with core features. Pro ($9/mo): unlimited prompts, 1 member, analytics, and all 14 guidelines. Team ($7/user/mo): up to 50 members, custom security rules, audit log, and import/export. Business ($12/user/mo): up to 500 members, unlimited guidelines, priority support, and SLA guarantee. See the pricing page for full details.",
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
        a: "Only if your workspace has activity logging enabled. Logged interactions are stored in your workspace's database and are visible only to admins and managers via the Activity Log. You can disable logging or configure retention policies from the Security Rules settings.",
        keywords: ["logging", "store", "text", "privacy", "retention", "interactions"],
      },
    ],
  },
];

/** Categories with slugs computed from article questions. */
export const HELP_CATEGORIES: HelpCategory[] = _RAW_CATEGORIES.map((cat) => ({
  ...cat,
  articles: cat.articles.map((article) => ({
    ...article,
    slug: generateSlug(article.q),
  })),
}));

// ─── Lookup helpers ───

export function getCategoryById(id: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((c) => c.id === id);
}

export function getArticleBySlug(
  categoryId: string,
  slug: string,
): { category: HelpCategory; article: HelpArticle } | undefined {
  const category = getCategoryById(categoryId);
  if (!category) return undefined;
  const article = category.articles.find((a) => a.slug === slug);
  if (!article) return undefined;
  return { category, article };
}

// ─── FAQs (for public page structured data + summary section) ───

export const HELP_FAQS: FAQ[] = [
  {
    question: "Is TeamPrompt free to use?",
    answer:
      "Yes. The free plan includes 1 member, 25 prompts, and core features like the browser extension. Paid plans unlock higher limits and advanced features like data protection, analytics, and compliance packs.",
  },
  {
    question: "Which AI tools does the browser extension support?",
    answer:
      "ChatGPT, Claude, Google Gemini, Microsoft Copilot, and Perplexity. The extension lets you insert prompts directly into any of these tools with one click and scans outbound messages for sensitive data.",
  },
  {
    question: "Can I use TeamPrompt without the browser extension?",
    answer:
      "Absolutely. The web app works on its own for managing prompts, guidelines, and team settings. The extension adds the convenience of prompt insertion and real-time DLP scanning directly inside AI tools.",
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
