# TeamPrompt Backlog

## AI Chat (Built 2026-03-18/19/20)
- [x] Admin slash commands with real DB data (/activity, /violations, /usage, /audit)
- [x] Collections (unified concept with color dots)
- [x] Favorites (star conversations to top)
- [x] Right-click context menu (pin, rename, collections, share, export, delete)
- [x] File upload with DLP scanning (PDF, DOCX, TXT, code files, images)
- [x] File cards like ChatGPT (thumbnails, not raw text in message)
- [x] DLP scan indicator on uploaded files (green shield = passed)
- [x] Multi-model compare mode (side-by-side split view)
- [x] Response rating (thumbs up/down on AI messages)
- [x] Conversation presets / starters (admin-configured templates)
- [x] System prompt / custom instructions (org-wide, injected server-side)
- [x] Full-text search API (PostgreSQL FTS + ILIKE fallback)
- [x] Sidebar tabs (Chats / Favorites / Collections)
- [x] Sidebar resize handle (drag to resize, 260-480px)
- [x] ChatGPT-style smart scroll (auto-scroll near bottom, stop if user scrolls up)
- [x] Loading dots fix (show until content streams)
- [x] Ctrl+N new chat shortcut
- [x] Double-click to rename conversations
- [x] Undo delete with 3-second toast
- [x] Message timestamps
- [x] Code block copy button with language header bar
- [x] Rotating starter suggestions
- [x] Dark mode message bubbles
- [x] Message entrance animations
- [x] Typing indicator in sidebar
- [x] Share conversation link
- [x] Export Markdown + Export PDF in context menu
- [x] Chat analytics events (7 GA4 events)
- [x] Smart Redaction v2 (auto-replace sensitive data, 3 severity levels)
- [x] Conversation Outline panel (auto-detected timeline with 12 content types)
- [x] Saved Items (bookmark AI responses, search, boards, copy)
- [x] Minimap scrollbar (Sublime/VS Code style, color-coded blocks)
- [x] Drag-and-drop file upload
- [x] Clean message UI (no bubbles on assistant, document-style rendering)
- [x] Integrated composer input bar (attach + text + send in one container)
- [x] Minimal header (model selector + DLP moved below input)
- [x] Brand logo avatar (TeamPrompt icon, light/dark variants)
- [x] Dismissible admin notice (persists in localStorage)
- [x] 5 full QA passes (107 bugs found, 77 fixed)

## Smart Redaction (Built 2026-03-19)
- [x] "Redact" as third severity level (Block / Warn / Redact)
- [x] Auto-replace matched text with [CATEGORY] placeholders
- [x] Amber banner showing what was redacted
- [x] User message updates to show redacted content
- [x] Works in chat API, extension scan API, MCP server, file uploads
- [x] Redact option in guardrails UI, sensitive terms, approvals
- [x] Migration 072 — CHECK constraint updated
- [x] AI rule generator and suggestion API updated

## Google Ads & Marketing (Built 2026-03-18/19/20)
- [x] GA4 event audit and fixes
- [x] 4 Google Ads landing pages (conversion-optimized, dark hero, mockups)
- [x] 10 SEO blog articles
- [x] Sitemap updated
- [x] Google Ads campaign optimization (keyword cleanup, bidding)
- [x] Homepage updated (AI Chat section, "Two Ways to Deploy", Smart Redaction)
- [x] Features page updated (AI Chat block, Smart Redaction, "Learn more" links)
- [x] AI Chat showcase page (/features/ai-chat) with mockups
- [x] Solutions page redesigned (category nav, previews, featured)
- [x] Header mega menu — AI Chat added under use cases
- [x] "Works with your favorite tools" — TeamPrompt Chat added
- [x] "Works where your team works" — Built-In AI Chat card added

## Sidebar & Navigation (Built 2026-03-19)
- [x] Nav restructured — Security section (Guardrails, Activity Log, Analytics)
- [x] Labels updated (Prompt Library, Template Packs, Activity Log)
- [x] Sublime-style scrollbar (thin, appears on hover, dark mode variant)

## Theme & Dark Mode (Built 2026-03-20)
- [x] Force light theme on marketing, LP, and admin pages
- [x] ThemeProvider re-evaluates on SPA navigation (pathname dep)
- [x] Inline script only applies dark on dashboard routes
- [x] Stripped all dark: classes from admin panel (12 files)

## Extension (Built 2026-03-19/20)
- [x] Extension v1.0.12 with smart redaction support
- [x] Firefox URL updated to new slug
- [x] Edge redirected to Chrome Web Store (not yet approved on Edge store)
- [x] Old extension zips archived

## Industry Onboarding (Building 2026-03-20)
- [ ] Industry picker in setup wizard (Healthcare, Finance, Tech, Legal, Education, Marketing)
- [ ] Industry-specific seed prompts (5 per industry)
- [ ] Industry field on organizations table
- [ ] API to save industry + trigger seeding

## Database Migrations
- [x] 070_chat_pinned_column.sql
- [x] 071_chat_features.sql (idempotent)
- [x] 072_add_redact_severity.sql
- [x] 073_saved_items.sql
- [ ] 074_org_industry.sql

---

## Pending — High Priority (Product Roadmap)
- [x] **Smart Redaction** — DONE
- [ ] **Prompt Risk Scoring** — Score every prompt 0-100 instead of binary block/warn
- [ ] **Shadow AI Detection** — Detect 50+ AI tool domains, admin alerts
- [ ] **Per-Team Policy Engine** — Rules scoped to teams/departments
- [ ] **SIEM Webhook** — One endpoint that POSTs violation events as JSON
- [ ] **Industry-Specific Guardrails** — Seed industry-specific sensitive terms on onboarding (warn severity, free plan compatible). Healthcare: patient/diagnosis/MRN/PHI. Finance: account number/routing number. Legal: privileged/attorney-client. Education: student record/FERPA. Show "HIPAA pack ready — upgrade" teaser in guardrails.
- [ ] **Google Ads + GA4 Analytics Dashboard** — Admin panel for ad performance, conversions, keyword data

## Pending — Medium Priority (Differentiators)
- [ ] **Prompt Injection Detection** — Detect "ignore previous instructions" patterns
- [ ] **Team/Department Analytics Dashboard** — Visual comparison by department
- [ ] **User Coaching** — Contextual education when user does something risky
- [ ] **Data Fingerprinting** — Detect internal documents pasted into AI

## Pending — AI Chat UI
- [ ] Wide mode toggle (expand message area)
- [ ] Cmd+K command palette (quick switch conversations, search)
- [ ] Keyboard navigation (arrow keys in sidebar)
- [ ] Edit sent messages / branching
- [ ] Inline annotations (highlight → "Explain this" / "Simplify")
- [ ] Quick action buttons ("Make shorter", "More formal", "Add examples")
- [x] Syntax-highlighted code blocks with language label — DONE
- [ ] Mermaid diagram rendering
- [ ] LaTeX math rendering
- [ ] Markdown preview in input
- [ ] @ mentions (reference conversations or team members)
- [x] Drag-and-drop files anywhere on page — DONE
- [ ] Streaming token counter

## Pending — AI Chat Personalization
- [ ] **User tone/style preferences** — like ChatGPT's "Custom Instructions". User sets: preferred response length, tone (formal/casual), expertise level, industry context. Stored per-user, injected as system prompt.
- [ ] **Response formatting preferences** — bullet points vs paragraphs, code comments style, language preferences
- [ ] **Memory across conversations** — AI remembers context from previous chats (like ChatGPT memory). User can view/delete remembered facts.
- [ ] **Custom instructions per conversation** — override org-wide system prompt for specific conversations

## Pending — Platform & Enterprise
- [ ] Chrome Web Store API for automated extension updates
- [ ] Slack integration — ALREADY BUILT (DLP alerts, notifications, digest)
- [ ] Microsoft Teams integration
- [ ] Microsoft Entra ID (Azure AD) directory sync
- [ ] SCIM 2.0 provisioning (Okta, OneLogin, JumpCloud)
- [ ] SAML 2.0 SSO
- [x] MCP Server for Claude Desktop — ALREADY BUILT
- [ ] Clipboard monitor companion app (Tauri/Electron system tray)
- [ ] API/Backend coverage (monitor direct API calls)
- [ ] Compliance report generator (one-click PDF for auditors)
- [ ] Desktop AI client coverage

## Pending — Product Features
- [x] AI Response Clipper / Saved Items — DONE (bookmark in chat flyout)
- [ ] Universal Prompt Palette (Cmd+Shift+P anywhere)
- [ ] AI Usage Dashboard ("Wrapped for AI")
- [ ] Prompt Chains / Workflows
- [ ] Customizable dashboard (drag-and-drop widgets)
- [ ] Role-differentiated dashboards (member vs admin views)
- [ ] Guardrail pattern encryption (secrets in custom rules)
