# TeamPrompt — Features Overview

> A simple, plain-English guide to every feature in TeamPrompt.
> Last updated: 2026-03-23

---

## Table of Contents

1. [AI Chat](#1-ai-chat)
2. [AI Memory System](#2-ai-memory-system)
3. [Custom Instructions](#3-custom-instructions)
4. [Chat Organization](#4-chat-organization)
5. [Presets](#5-presets)
6. [Saved Items](#6-saved-items)
7. [Multi-Model Compare](#7-multi-model-compare)
8. [Extended Thinking](#8-extended-thinking)
9. [File Uploads](#9-file-uploads)
10. [Admin Slash Commands](#10-admin-slash-commands)
11. [Prompt Vault](#11-prompt-vault)
12. [Template Variables](#12-template-variables)
13. [Prompt Versioning](#13-prompt-versioning)
14. [Prompt Ratings & Effectiveness](#14-prompt-ratings--effectiveness)
15. [Collections](#15-collections)
16. [Template Packs](#16-template-packs)
17. [Guidelines & Standards](#17-guidelines--standards)
18. [DLP & Guardrails](#18-dlp--guardrails)
19. [Compliance Packs](#19-compliance-packs)
20. [Auto-Redaction](#20-auto-redaction)
21. [Risk Scoring](#21-risk-scoring)
22. [Browser Extension](#22-browser-extension)
23. [Activity & Audit Log](#23-activity--audit-log)
24. [Analytics Dashboard](#24-analytics-dashboard)
25. [Team Management](#25-team-management)
26. [Roles & Permissions](#26-roles--permissions)
27. [Google Workspace Sync](#27-google-workspace-sync)
28. [Domain Auto-Join](#28-domain-auto-join)
29. [Slack Integration](#29-slack-integration)
30. [MCP Server](#30-mcp-server)
31. [Notifications](#31-notifications)
32. [Billing & Plans](#32-billing--plans)
33. [Import & Export](#33-import--export)
34. [Help Center](#34-help-center)
35. [AI Memory — Pros & Cons](#35-ai-memory--pros--cons)

---

## 1. AI Chat

**What it is:** A built-in AI chat interface where your team talks to AI models directly inside TeamPrompt — with full security scanning on every message.

**How it works:**
- User types a message → it gets scanned by your org's DLP rules → if clean, it goes to the AI model → response streams back in real-time
- Supports **OpenAI** (GPT-4o, GPT-4.1, o3), **Anthropic** (Claude Sonnet 4, Opus 4, Haiku), and **Google** (Gemini 2.5 Flash/Pro)
- Each org connects their own API keys — TeamPrompt never sees the keys in plain text (AES encrypted)
- Admins can whitelist which models are allowed

**What users see:**
- Chat interface with model/provider picker
- Markdown rendering, code blocks with syntax highlighting, LaTeX math, Mermaid diagrams
- Thumbs up/down on every response
- Follow-up suggestion chips after each response

---

## 2. AI Memory System

**What it is:** TeamPrompt remembers things about you across conversations — like your role, preferences, and project context — so you don't have to repeat yourself.

**How it works:**
1. After a conversation, a cheap/fast AI model (GPT-4o Mini, Haiku, or Gemini Flash) reads the last 20 messages
2. It extracts up to 5 short facts (max 500 chars each) and assigns categories: `preference`, `context`, `project`, `expertise`, `style`
3. Each fact gets DLP-scanned before saving — if it contains sensitive data, it's blocked or redacted
4. Facts are stored in the database with soft-delete support
5. On the next conversation, the 50 most recent active facts are injected into the system prompt

**What users see:**
- A memory panel where they can view all stored facts
- Edit any fact
- Delete any fact ("forget this")
- Facts shown with their category label

**Privacy:**
- Memory is per-user, per-org (your facts don't leak to other orgs)
- DLP scans every fact — sensitive data never makes it into memory
- Soft-delete means admins can audit what was removed

---

## 3. Custom Instructions

**What it is:** Users set persistent instructions that apply to every conversation — like "I'm a backend engineer" or "respond in bullet points."

**How it works:**
- Stored in `chat_user_instructions` table (one per user per org)
- Fields: role description, preferred tone, expertise level, free-form custom context
- Injected as a system message before every AI call when active
- Users can toggle instructions on/off

**What users see:**
- A settings panel to fill in their role, tone, expertise, and any extra context
- Toggle to enable/disable

---

## 4. Chat Organization

**What it is:** Tools to keep conversations tidy — folders, tags, pins, archive, search.

**Folders:**
- Color-coded folders to group conversations (e.g., "Work", "Research", "Personal")
- Drag conversations into folders
- Sortable order

**Tags:**
- Color-coded tags (e.g., "urgent", "bug-fix", "brainstorm")
- Multiple tags per conversation
- Filter sidebar by tag

**Other:**
- **Pin** — stick important conversations to the top
- **Archive** — hide old conversations without deleting them
- **Search** — full-text search across all messages using PostgreSQL FTS
- **Rename** — change conversation titles
- **Delete** — permanent removal with confirmation
- **Right-click menu** — pin, rename, share, export, archive, delete

---

## 5. Presets

**What it is:** Reusable conversation templates with pre-configured system prompts, models, and starter messages.

**How it works:**
- Admin creates a preset: name, description, system prompt, first message, model, provider, icon, color
- Can be shared org-wide (admins only) or kept personal
- When a user starts a conversation from a preset, it pre-fills the system prompt and optionally sends the first message

**Example:** A "Code Reviewer" preset that uses Claude Opus with a system prompt like "You are an expert code reviewer. Be concise. Focus on bugs and security issues."

---

## 6. Saved Items

**What it is:** A pinboard to save useful AI outputs — code snippets, links, notes, text — organized into boards.

**How it works:**
- While chatting, users can save any message or part of a message
- Auto-detects type: `text`, `code`, `link`, `file`, `product`, `note`
- Organized into named boards (like folders)
- Searchable with full-text search
- Stores metadata (language for code, URL for links)

---

## 7. Multi-Model Compare

**What it is:** Send the same message to two different AI models and see their responses side by side.

**How it works:**
- User enables compare mode and picks two models
- The same prompt goes to both models simultaneously
- Responses stream in side-by-side
- Helps teams evaluate which model works best for different tasks

---

## 8. Extended Thinking

**What it is:** For Anthropic models (Claude), you can enable "thinking mode" where the AI shows its reasoning process before answering.

**How it works:**
- Toggle thinking on in the chat UI
- Anthropic API is called with `thinking: { type: "enabled", budgetTokens: 10000 }`
- The reasoning text streams in a collapsible "thinking" block above the answer
- Only works with Anthropic models

---

## 9. File Uploads

**What it is:** Upload files (PDFs, Word docs, code files, CSVs) to give the AI context about your documents.

**How it works:**
- Files are DLP-scanned before processing
- Content is truncated at 200KB and injected as a system message
- AI can then answer questions about the file content

---

## 10. Admin Slash Commands

**What it is:** Admins and managers can type special commands in chat to query real organization data.

**Commands:**
- `/activity` — past 7 days of AI interactions, top users, models used
- `/violations` — DLP violations, blocked prompts, repeat offenders
- `/usage` — prompt adoption rates, most/least used prompts
- `/audit` — full audit trail of all AI interactions

**How it works:**
- Command hits `/api/chat/admin-data` which queries real database tables
- Results are formatted as markdown and injected into the AI's context
- The AI then summarizes and answers questions about the data

---

## 11. Prompt Vault

**What it is:** A shared library where teams create, review, and manage AI prompts.

**How it works:**
- **Create** — write a prompt with title, content, description, tags, tone, intended outcome
- **Submit** — members submit prompts for review; admins/managers approve or reject
- **Share** — approved prompts are visible to the whole org
- **Use** — one-click insert into any AI tool via the browser extension
- **Track** — every use is logged with usage counts and timestamps

**Status lifecycle:** Draft → Pending → Approved → Archived

**Search & filter:** full-text search, filter by tag/status/author, sort by date/usage/rating, grid or list view

---

## 12. Template Variables

**What it is:** Prompts can have fill-in-the-blank fields using `{{variable}}` syntax.

**How it works:**
- Author writes: "Write a {{tone}} email to {{recipient}} about {{topic}}"
- When inserting, user sees a form to fill in `tone`, `recipient`, `topic`
- Variables can have labels, descriptions, and default values
- Filled prompt gets inserted into the AI tool

---

## 13. Prompt Versioning

**What it is:** Every edit to a prompt is saved as a version — you can compare and restore any previous version.

**How it works:**
- Each save creates a new version in `prompt_versions`
- Timeline view shows all versions with timestamps and authors
- Side-by-side diff view with green (added) and red (removed) highlighting
- One-click restore to any previous version

---

## 14. Prompt Ratings & Effectiveness

**What it is:** Team members rate prompts, and the system tracks effectiveness metrics.

**How it works:**
- Thumbs up/down on prompts (stored as 1-5 internally)
- Average rating and rating count displayed on each prompt
- Analytics show rating distribution across all prompts
- Sort prompts by effectiveness

---

## 15. Collections

**What it is:** Group related prompts into shareable collections.

**How it works:**
- Create a collection with name, description, visibility (personal/team/org/public)
- Add prompts to collections
- Browse collections as curated sets
- Share collection links

---

## 16. Template Packs

**What it is:** Pre-built bundles of prompts, guidelines, and security rules you can install with one click.

**8 built-in packs:**
1. **Engineering & Development** — code review, PR descriptions, debugging
2. **Marketing & Content** — blog posts, social media, SEO briefs
3. **Sales & Outreach** — email sequences, proposals, negotiation
4. **Customer Support** — ticket responses, escalation templates
5. **HR & People** — job postings, feedback, onboarding
6. **Design & Creative** — design briefs, naming, creative direction
7. **Product & Strategy** — PRDs, user stories, roadmap planning
8. **Legal & Compliance** — NDA review, policy templates, checklists

Each pack includes 5-10 prompt templates + matching guidelines + guardrail categories.

---

## 17. Guidelines & Standards

**What it is:** Rules that define how your team should write and structure prompts — like a style guide for AI usage.

**14 categories:** Writing, Coding, Design, Support, Marketing, Sales, HR, Legal, Executive, Data, Product, Research, Training, Internal Comms

**What a guideline includes:**
- Tone rules (suggested tones)
- Best practices (do's)
- Restrictions (don'ts)
- Constraints (length limits, required fields)
- Banned words

**Scoping:** Personal, Team, or Org-wide. Can be advisory or enforced.

---

## 18. DLP & Guardrails

**What it is:** Real-time data loss prevention that scans every message before it reaches an AI model — blocking or redacting sensitive data.

**How it works:**
1. User types a message (in TeamPrompt Chat or on any supported AI tool via extension)
2. Message is scanned against the org's active security rules
3. **Block** — message is stopped, user sees a violation notice
4. **Warn** — user sees a warning but can override (if allowed)
5. **Redact** — sensitive parts are replaced with placeholders, message sends safely
6. Every scan result is logged for audit

**What it detects (30+ built-in patterns):**
- API keys (AWS, GitHub, Stripe, OpenAI, Slack)
- Credentials (passwords, connection strings, private keys, bearer tokens, JWTs)
- PII (SSN, credit cards, emails, phone numbers)
- Health data (medical records, insurance IDs)
- Financial data (bank accounts, routing numbers)
- Internal terms (project names, partner data)

**Custom rules:** Admins create rules with regex, exact match, glob, or keyword patterns. Team members can suggest rules that go through an approval queue.

---

## 19. Compliance Packs

**What it is:** Pre-configured security rule sets for specific regulatory frameworks — install with one click.

**19 packs across 8 industries:**
- **Healthcare:** HIPAA, HITECH
- **Education:** FERPA, COPPA
- **Finance:** PCI-DSS, GLBA, SOX
- **Privacy:** GDPR, CCPA
- **Government:** NIST 800-171, FedRAMP, CJIS, ITAR
- **Insurance:** NAIC
- **Legal:** Attorney-client privilege, litigation holds
- **Technology:** SOC 2

---

## 20. Auto-Redaction

**What it is:** Instead of blocking a message entirely, auto-redaction replaces just the sensitive parts with safe placeholders.

**Example:**
- User types: "My AWS key is AKIAIOSFODNN7EXAMPLE"
- After redaction: "My AWS key is `[API_KEY]`"
- Message sends safely — AI never sees the real key

**Placeholder types:** `[API_KEY]`, `[PII]`, `[SSN]`, `[CREDENTIAL]`, etc. — varies by detection category.

---

## 21. Risk Scoring

**What it is:** Every AI interaction gets a risk score from 0-100, helping admins spot risky behavior at a glance.

**Score ranges:**
| Score | Level | Meaning |
|-------|-------|---------|
| 0-15 | Low | Routine, safe prompts |
| 16-39 | Moderate | Minor flags (emails, internal URLs) |
| 40-69 | High | Internal data, customer info |
| 70-89 | Critical | PII, credentials, regulated data |
| 90-100 | Severe | Multiple critical violations |

**Factors:** Number of violations, violation type, severity level. Color-coded badges in the activity log.

---

## 22. Browser Extension

**What it is:** A Chrome/Firefox/Edge extension that brings TeamPrompt's prompt library and DLP protection to every AI tool your team uses.

**Supported AI tools:** ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity

**What it does:**
- **Prompt Browser** — search and insert prompts from your vault directly into any AI tool
- **Template Fill** — fill in `{{variables}}` before inserting
- **DLP Shield** — scans every outbound message in real-time, blocks/warns before submission
- **Shield Indicator** — green (protected), amber (issues), gray (disabled)
- **Conversation Logging** — records every AI interaction for the audit trail
- **Side Panel** — persistent panel alongside AI tools (Chrome/Edge)
- **Favorites** — quick access to starred prompts
- **Dark/Light mode** — matches system preference
- **Auth Bridge** — seamless login sync from the web app (no separate extension login)

---

## 23. Activity & Audit Log

**What it is:** A complete record of every AI interaction across your organization — who used what, when, and what was flagged.

**What's logged:**
- User, AI tool, timestamp
- Action taken (sent, blocked, warned)
- Risk score
- Model and provider used
- Token count
- Guardrail violations (if any)

**Two logging modes:**
- **Metadata-only** (default) — logs tool, action, timestamp, risk score. Does NOT log prompt text.
- **Full logging** — logs everything including the complete prompt text.

**Features:** Date/tool/action filters, full-text search (in full mode), CSV/JSON export, configurable retention (1-3650 days with auto-delete).

---

## 24. Analytics Dashboard

**What it is:** Visual metrics showing how your team uses AI and how effective your prompts and guardrails are.

**Metrics:**
- Total AI interactions + trend
- Most-used prompts (ranked)
- Active user count
- Interactions by AI tool (pie chart)
- Interactions by guardrail status (sent/blocked/warned)
- Prompt effectiveness (rating distribution)
- Usage trends over time
- Team/department breakdown
- Per-user breakdown
- Guardrail activity (blocks, warnings, flagged users, block rate, most-triggered rules)

**Availability:** Pro plan and above. Guardrail analytics visible to admins/managers only.

---

## 25. Team Management

**What it is:** Tools to organize your people into teams, manage roles, and track extension adoption.

**Features:**
- Create teams (departments/groups) with color-coded icons
- Invite members by email (individual or bulk CSV)
- Assign members to teams
- View extension status per member (installed, active, version, last seen)
- Inactive extension alerts (24+ hours)
- Toggle DLP shield per member
- Remove members
- Org chart view (visual team structure with avatars)
- Table view (sortable member list)

---

## 26. Roles & Permissions

**Three roles:**

| Capability | Admin | Manager | Member |
|---|---|---|---|
| Invite/remove members | Yes | No | No |
| Manage roles & teams | Yes | No | No |
| Edit org settings | Yes | No | No |
| Manage security rules | Yes | Yes | No |
| View activity/analytics | Yes | Yes | No |
| Approve prompts | Yes | Yes | No |
| Suggest security rules | Yes | Yes | Yes |
| Create prompts | Yes | Yes | Yes |
| Use AI Chat | Yes | Yes | Yes |

---

## 27. Google Workspace Sync

**What it is:** Pull your company directory from Google Workspace and auto-create teams from Google Groups.

**How it works:**
- Connect via OAuth (Google Admin account required)
- Fetches up to 2,000 active users
- Maps Google Groups to TeamPrompt teams
- Preview before importing
- Re-sync anytime to catch new users
- Skips already-imported members

---

## 28. Domain Auto-Join

**What it is:** Anyone with a matching email domain (e.g., `@yourcompany.com`) automatically joins your org on signup.

**How it works:**
- Admin sets the org domain and enables auto-join
- Free email providers (Gmail, Yahoo, etc.) are excluded
- New users with matching domains join automatically
- No invite required

---

## 29. Slack Integration

**What it is:** Get real-time notifications in Slack when security rules trigger or prompts need approval.

**Features:**
- DLP violation alerts
- Prompt approval notifications
- Weekly activity digest
- Choose which Slack channels get which notifications
- Connect/disconnect via OAuth

---

## 30. MCP Server

**What it is:** Connect AI coding tools (Claude Desktop, Cursor, Windsurf) to TeamPrompt's prompt library and DLP scanning.

**What it exposes:**
- Prompt library search and retrieval
- DLP scanning capability
- Audit logging
- Guardrail rules

**Management:** Generate API keys with granular scopes, set expiry dates, track usage, revoke anytime.

---

## 31. Notifications

**What it is:** In-app notification center for security alerts, approvals, team changes, and system announcements.

**Types:** Security violations, prompt submitted/approved/rejected, member joined/left, extension inactive, system announcements.

**Features:** Unread count badge, click-to-navigate, mark as read (single or bulk), delete, type filtering.

---

## 32. Billing & Plans

| | Free | Pro | Team | Business |
|---|---|---|---|---|
| **Price** | $0 | $9/mo | $7/user/mo | $12/user/mo |
| **Prompts** | 25 | Unlimited | Unlimited | Unlimited |
| **Members** | 3 | 12 | 50 | 500 |
| **AI Tools** | 3 | Unlimited | Unlimited | Unlimited |
| **Guidelines** | 5 | 14 | 14 | Unlimited |
| **Analytics** | — | Yes | Yes | Yes |
| **Custom Security** | — | — | Yes | Yes |
| **Audit Log** | — | — | Yes | Yes |
| **Compliance Packs** | — | — | Yes | Yes |
| **Auto-Redact** | — | — | Yes | Yes |
| **Google Sync** | — | — | Yes | Yes |
| **Priority Support** | — | — | — | Yes |

All paid plans have a 14-day free trial, no credit card required. Annual billing saves ~20%.

---

## 33. Import & Export

**Import:**
- Bulk import prompts from CSV or JSON
- Column mapper for different formats
- Validation preview before confirming
- Template pack installation

**Export:**
- Prompts as JSON
- Conversations as Markdown, HTML, or PDF
- Activity logs as CSV or JSON
- Custom template packs as shareable files

---

## 34. Help Center

**What it is:** A searchable knowledge base with 50+ articles across 10 categories.

**Categories:** Getting Started, Prompt Library, Guidelines, DLP & Security, Extension, Team Management, Analytics & Audit, Import/Export, Billing, Extensions.

---

## 35. AI Memory — Pros & Cons

### What We Have Today

Our memory system extracts short facts from conversations, DLP-scans them, stores them in PostgreSQL, and injects the 50 most recent into every new conversation.

### Pros

**1. It actually works and ships today**
- Not a roadmap item — it's live, in production, handling real conversations
- Simple architecture (PostgreSQL, no extra infra) = fewer things to break

**2. Enterprise-grade privacy and compliance**
- Every memory fact is DLP-scanned before storage — no other AI tool does this
- Sensitive data is blocked or redacted at the memory level, not just the chat level
- Soft-delete with audit trail — admins can see what was remembered AND what was forgotten
- Per-user, per-org isolation — no cross-org memory leakage

**3. Full user control and transparency**
- Users can see every fact stored about them (memory panel)
- Edit any fact, delete any fact
- This beats ChatGPT/Claude where memory is a black box
- Huge selling point for compliance-conscious enterprises

**4. Cost-efficient**
- Uses cheapest models for extraction (GPT-4o Mini, Haiku, Gemini Flash)
- No vector DB costs, no embedding API calls
- Deduplication prevents memory bloat

**5. DLP on memory is a unique differentiator**
- If a user says "my SSN is 123-45-6789" in a conversation, that SSN will NOT end up in memory
- Competitors store whatever the AI extracts — we scan first

### Cons

**1. No semantic retrieval**
- We grab the 50 most recent facts regardless of relevance to the current conversation
- A conversation about Python gets the same memories as a conversation about marketing
- As users accumulate 100+ facts, the "most recent 50" cutoff means older but relevant facts get lost

**2. No shared/team/org memory**
- Memory is strictly per-user — there's no way for a team to share context
- Example: "Our API uses REST not GraphQL" should be known by everyone, but each person has to establish this independently
- Org system prompt partially fills this gap but isn't structured or manageable

**3. Extraction quality varies**
- A cheap, fast model decides what's worth remembering — it sometimes misses important context or extracts trivial facts
- Max 5 facts per conversation means long, rich conversations may lose nuance
- 500-char limit per fact can truncate complex context

**4. No relevance scoring**
- All 50 facts are weighted equally in the system prompt
- No way to mark a fact as "always include" vs "include if relevant"
- No category-based filtering (e.g., only inject `expertise` facts for coding conversations)

**5. Context window cost**
- 50 facts × ~100 tokens each = ~5,000 tokens of system prompt on every single message
- That's tokens the user is paying for on every API call
- Gets expensive at scale, especially with premium models like Claude Opus or GPT-4

**6. No memory analytics**
- No dashboard showing: how many facts per user, most common categories, DLP block rate on memories
- No way for admins to understand memory usage patterns across the org

### What Would Make It Better (Prioritized)

1. **Org/Team shared memory** — Add a `scope` column (personal/team/org) and `team_id`. Admins inject org-wide context, teams share domain knowledge. Biggest bang for buck.

2. **Smarter retrieval** — Filter facts by category based on conversation topic. Coding conversation? Prioritize `expertise` + `project` facts. No vector DB needed — just better SQL.

3. **Memory toggle per chat** — Let users start a "clean" conversation without any memory. Simple boolean on the conversation.

4. **Relevance ranking** — Let users pin critical facts as "always include." Deprioritize stale facts (not updated in 90+ days).

5. **pgvector (later)** — When facts exceed ~200 per user, add embeddings for semantic retrieval. Supabase supports pgvector natively — no new infra needed.

---

*This document covers TeamPrompt v1.x as of March 2026. For the latest feature updates, see the [Changelog](/changelog).*
