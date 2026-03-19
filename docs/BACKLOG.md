# TeamPrompt Backlog

## AI Chat (Built 2026-03-18/19)
- [x] Admin slash commands with real DB data (/activity, /violations, /usage, /audit)
- [x] Collections (replaced folders + tags — unified concept with color dots)
- [x] Favorites (pin conversations to top with star icon)
- [x] Right-click context menu (pin, rename, collections, share, export, delete)
- [x] File upload with DLP scanning (PDF, DOCX, TXT, code files, images)
- [x] DLP scan indicator on uploaded files (green shield = passed)
- [x] Multi-model compare mode (side-by-side split view)
- [x] Response rating (thumbs up/down on AI messages)
- [x] Conversation presets / starters (admin-configured templates)
- [x] System prompt / custom instructions (org-wide, injected server-side)
- [x] Full-text search API (PostgreSQL FTS + ILIKE fallback)
- [x] Sidebar tabs (Chats / Favorites / Collections)
- [x] Sidebar resize handle (drag to resize, 260-480px)
- [x] ChatGPT-style smart scroll (auto-scroll near bottom, stop if user scrolls up)
- [x] Loading dots fix (show until content streams, not just until message object created)
- [x] Ctrl+N new chat shortcut with keyboard hint on button
- [x] Double-click to rename conversations
- [x] Undo delete with 3-second toast
- [x] Message timestamps (from created_at for server messages, from ID for new)
- [x] Code block copy button (hover to reveal)
- [x] Rotating starter suggestions (4 sets, rotate every 30 min)
- [x] Dark mode message bubbles (zinc-800 with subtle border)
- [x] Message entrance animations (fade + slide up)
- [x] Typing indicator in sidebar (pulsing dot on active conversation)
- [x] Share conversation link (copies to clipboard)
- [x] Export Markdown + Export PDF in context menu
- [x] Chat analytics events (7 GA4 events: message sent, conversation created, file uploaded, compare used, preset used, admin command, collection created)
- [x] Separate preset system prompt from admin context (no conflicts)
- [x] 2 full QA passes (55 bugs found + fixed)

## Google Ads & Marketing (Built 2026-03-18/19)
- [x] GA4 event audit and fixes (broken conversion tag, duplicate OAuth, purchase dedup)
- [x] 4 Google Ads landing pages (/lp/ai-dlp, /lp/shadow-ai, /lp/ai-compliance, /lp/prompt-library)
- [x] 10 SEO blog articles (shadow AI, AI DLP, governance, HIPAA, SOC 2, CISO risks, prompt injection, etc.)
- [x] Sitemap updated with all new pages (18 blog slugs + 4 LP slugs)
- [x] Google Ads campaign optimization (keyword cleanup, bidding strategy, negatives)

## Database Migrations (2026-03-18/19)
- [x] 070_chat_pinned_column.sql — pinned boolean on chat_conversations
- [x] 071_chat_features.sql — folders, tags, presets, ratings, FTS index (made idempotent)
- [x] All API endpoints have column fallbacks for unmigrated DBs

## Infrastructure
- [x] Radix ScrollArea horizontal overflow fix (global CSS !important rule)
- [x] ReDoS protection (safeRegexTest helper with content length limit)
- [x] Docs consolidation (all .md files moved to docs/ folder)

---

## Previously Completed (Pre 2026-03-18)
- [x] Member role dashboard restrictions + template request/approval system
- [x] Extension install email system
- [x] Extension tab restructure (Faves, Recent, Prompts)
- [x] Categories & tags filtering on all tabs
- [x] Dashboard: hide settings cog from members
- [x] Guardrails: member rule/policy suggestion flow
- [x] Marketing, Help Docs & Release Notes update (5 phases)
- [x] Two-Factor Authentication (TOTP) for admins & managers
- [x] Compliance Policy Template Packs (19 packs, 88 rules)
- [x] Auto-Sanitization with placeholders
- [x] Prompt Effectiveness Analytics
- [x] Approval Queue Dashboard
- [x] Version History Diff View
- [x] Avatar Upload
- [x] Email Address Change
- [x] Manage Categories redesign
- [x] Bulk Employee Import & CSV upload
- [x] Google Workspace Directory Sync
- [x] Domain-Based Auto-Join
- [x] Welcome Email Customization
- [x] Bulk Role Assignment
- [x] SEO Internal Linking (100 solution pages)
- [x] Fix admin panel crash
- [x] Media page mockup redesign
- [x] Fix Extension Install Flow + /extensions page
- [x] Admin Inbox Redesign & ticket assignment
- [x] Admin Pages Enhancement (subscriptions, users, orgs)
- [x] QA Audit Fixes (SQL injection, promise handling, dialog warnings)
- [x] Chrome Web Store listing optimization
- [x] "Rate Us" banner after 7 days
- [x] DLP default rules enabled
- [x] Email verification enforcement
- [x] Auto-deprovisioning (directory sync)
- [x] AI-Powered Guardrail Rule Generation
- [x] Quick Save Prompt from Extension
- [x] Admin Ticket Compose Email
- [x] Mobile responsiveness overhaul
- [x] Expanded Compliance Packs (13 new, 19 total)
- [x] Testing guide improvements

---

## Pending — High Priority (Product Roadmap)
- [ ] **Prompt Risk Scoring** — Score every prompt Low/Medium/High/Critical instead of binary block/warn. Visual risk badge on messages.
- [ ] **Smart Redaction** — Auto-replace sensitive data with [REDACTED] and let message through. Users don't get blocked.
- [ ] **Shadow AI Detection** — Detect 50+ AI tool domains employees visit. Admin alerts for unapproved tools.
- [ ] **Per-Team Policy Engine** — Rules scoped to teams/departments. "Engineering can use Claude but not ChatGPT."

## Pending — Medium Priority (Differentiators)
- [ ] **Prompt Injection Detection** — Detect "ignore previous instructions" patterns
- [ ] **Team/Department Analytics Dashboard** — Visual comparison of AI usage and risk by department
- [ ] **User Coaching** — Contextual education when user does something risky (not just "blocked")
- [ ] **Data Fingerprinting** — Detect internal documents pasted into AI (fuzzy hash matching)

## Pending — AI Chat UI
- [ ] Wide mode toggle (expand message area beyond 768px)
- [ ] Cmd+K command palette (quick switch conversations, search, change models)
- [ ] Keyboard navigation (arrow keys in sidebar)
- [ ] Edit sent messages / branching
- [ ] Inline annotations (highlight → "Explain this" / "Simplify")
- [ ] Quick action buttons ("Make shorter", "More formal", "Add examples")
- [ ] Syntax-highlighted code blocks with language label
- [ ] Mermaid diagram rendering
- [ ] LaTeX math rendering
- [ ] Markdown preview in input
- [ ] @ mentions (reference conversations or team members)
- [ ] Drag-and-drop files anywhere on page
- [ ] Streaming token counter

## Pending — Platform & Enterprise
- [ ] Chrome Web Store API integration for automated extension updates
- [ ] Slack integration (DLP alerts, approval notifications)
- [ ] Microsoft Teams integration
- [ ] Microsoft Entra ID (Azure AD) directory sync
- [ ] SCIM 2.0 provisioning (Okta, OneLogin, JumpCloud)
- [ ] SAML 2.0 SSO
- [ ] MCP Server for Claude Desktop
- [ ] Clipboard monitor companion app (Tauri/Electron system tray)
- [ ] API/Backend coverage (monitor direct API calls, not just browser)
- [ ] Compliance report generator (one-click PDF for auditors)
- [ ] Desktop AI client coverage (Claude Desktop, ChatGPT Desktop)

## Pending — Product Features
- [ ] AI Response Clipper + Team Knowledge Base
- [ ] Universal Prompt Palette (Cmd+Shift+P anywhere)
- [ ] AI Usage Dashboard ("Wrapped for AI")
- [ ] Prompt Chains / Workflows
- [ ] Customizable dashboard (drag-and-drop widgets)
- [ ] Role-differentiated dashboards (member vs admin views)
- [ ] Guardrail pattern encryption (secrets in custom rules)
