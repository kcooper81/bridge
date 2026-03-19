# TeamPrompt — Architecture & Features

> **One-liner:** TeamPrompt is an AI prompt management and data-loss-prevention platform with a web dashboard and browser extension that governs how teams use ChatGPT, Claude, Gemini, Copilot, and Perplexity.

---

## Quick Overview (for humans)

| What | How |
|------|-----|
| **Prompt Vault** | Store, search, tag, rate, and share AI prompts across your team |
| **Template Variables** | Use `{{variable}}` syntax for reusable fill-in prompts |
| **Quality Guidelines** | 14 built-in guideline templates enforce tone, length, banned words, required fields |
| **Security Guardrails (DLP)** | 46+ regex/glob/exact rules scan content before it reaches AI tools — blocks API keys, passwords, PII, PHI, credit cards, JWTs, and more |
| **Browser Extension** | Chrome/Edge/Firefox extension injects prompts into AI tools, scans outbound text in real-time, logs conversations |
| **Teams & Roles** | Admin / Manager / Member roles, team-scoped prompt libraries and guardrail overrides |
| **Collections** | Group prompts with personal / team / org / public visibility |
| **Analytics** | Usage trends, top prompts, team breakdown, extension adoption |
| **Audit Log** | Every AI interaction logged: who, what, when, which tool, guardrail outcome |
| **Library Packs** | 8 pre-built content packs (Engineering, Marketing, Support, Sales, HR, Legal, Product, Executive) |
| **Notifications** | Real-time alerts for security violations, prompt approvals, team changes |
| **Billing** | Stripe-powered: Free → Pro ($9/mo) → Team ($7/user/mo) → Business ($12/user/mo) |
| **MDM Deployment** | Force-install extension via Google Admin Console, Intune, JAMF, or GPO |
| **Industry Solutions** | Tailored pages for Healthcare, Finance, Legal, Government, and Technology |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14.2 (App Router), React 18, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, CSS variables (hsl theming) |
| **UI Components** | shadcn/ui (Radix primitives), Lucide React icons |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Auth** | Supabase Auth — Email/password, Google OAuth, GitHub OAuth |
| **Payments** | Stripe (checkout sessions, webhooks, customer portal) |
| **Email** | Resend (transactional invites, notifications) |
| **Rate Limiting** | Upstash Redis (sliding window) |
| **Browser Extension** | WXT 0.20 framework, Manifest V3, Chrome/Edge/Firefox |
| **Analytics** | Google Analytics 4 (GA4) |
| **Forms** | React Hook Form + Zod validation |
| **Dates** | date-fns |
| **Toasts** | Sonner |
| **Command Palette** | cmdk |

---

## Project Structure

```
teamprompt-next/
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Public pages (landing, pricing, features, enterprise, industries, security, etc.)
│   │   ├── (dashboard)/        # Protected app (vault, guardrails, guidelines, collections, analytics, team, etc.)
│   │   ├── (auth)/             # Login, signup, forgot/reset password, invite accept
│   │   ├── (admin)/admin/      # Super admin dashboard (users, orgs, subscriptions, errors, tickets)
│   │   └── api/                # Backend API routes
│   │       ├── extension/      # Extension endpoints (scan, prompts, log, security-status, enable-shield)
│   │       ├── stripe/         # Checkout, portal, webhook
│   │       ├── invite/         # Send & accept invites
│   │       ├── org/            # Org provisioning
│   │       ├── account/        # Account deletion
│   │       └── support/        # Support form
│   ├── components/
│   │   ├── dashboard/          # Sidebar, header, widgets, setup wizard, stat cards, folder manager
│   │   ├── marketing/          # Section labels, dark sections, CTAs, FAQs, feature cards, app mockup, mega menu
│   │   ├── modals/             # Prompt editor, import/export
│   │   ├── providers/          # Org, Auth, Subscription context providers
│   │   ├── upgrade/            # UpgradePrompt, UpgradeGate, LimitNudge
│   │   ├── admin/              # Admin panels
│   │   ├── security/           # Scanner UI
│   │   └── ui/                 # 25+ shadcn/Radix base components
│   ├── lib/
│   │   ├── supabase/           # Browser client, server client, middleware client
│   │   ├── security/           # Scanner, default rules (46+), entropy detection, compliance templates, classification
│   │   ├── library/            # 8 content packs with ~35 template prompts
│   │   ├── seo/                # Metadata generator, structured data schemas
│   │   ├── constants.ts        # Plan limits, tones, guideline categories, defaults
│   │   ├── types.ts            # Full TypeScript data model
│   │   ├── vault-api.ts        # Prompt CRUD, analytics, guidelines, import/export, ratings
│   │   ├── rate-limit.ts       # Upstash sliding window
│   │   ├── seed-defaults.ts    # Onboarding data (sample prompt, 5 guidelines, security rules)
│   │   └── analytics.ts        # GA4 event tracking
│   └── middleware.ts           # Route protection + security headers (CSP, HSTS, etc.)
├── supabase/
│   ├── migrations/             # 19 migration files (schema → admin → notifications → AI detection)
│   └── email-templates/        # Confirmation, reset, magic link
├── extension/
│   ├── src/
│   │   ├── entrypoints/
│   │   │   ├── background.ts       # Service worker (token refresh, API proxy, side panel)
│   │   │   ├── content.ts          # AI tool injection (DLP scan, prompt insert, shield UI)
│   │   │   ├── auth-bridge.content.ts  # Web app → extension session sync
│   │   │   ├── popup/              # Popup UI (prompt browser, shield status)
│   │   │   └── sidepanel/          # Side panel UI (same features, taller layout)
│   │   └── lib/
│   │       ├── auth.ts         # Supabase PKCE auth, token refresh alarm
│   │       ├── prompts.ts      # Fetch prompts, fill templates
│   │       ├── ai-tools.ts     # AI tool detection + DOM insertion (10+ selectors)
│   │       ├── scanner.ts      # Outbound DLP scanning
│   │       ├── config.ts       # Extension environment config
│   │       ├── api.ts          # Background-proxied fetch (avoids CORS)
│   │       └── security-status.ts  # Shield status API
│   └── wxt.config.ts           # WXT build config (MV3, permissions, host patterns)
└── public/                     # Static assets, OG images, icons
```

---

## Database Schema (19 migrations)

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|------------|
| **organizations** | Org account | name, domain, logo, plan (free/pro/team/business), settings (JSONB) |
| **profiles** | User accounts (extends auth.users) | org_id, name, email, role (admin/manager/member), is_super_admin, extension_version |
| **prompts** | Prompt vault | title, content, tone (12 options), tags[], status (draft/pending/approved/archived), is_template, template_variables (JSONB), rating_total/count, usage_count |
| **prompt_versions** | Version history | prompt_id, version, title, content |
| **prompt_ratings** | Per-user ratings | prompt_id, user_id, rating (1-5) |
| **folders** | Prompt organization | name, icon, color |
| **teams** | Team groupings | name, description, icon, color |
| **team_members** | Team membership | team_id, user_id, role |
| **collections** | Prompt groups | name, visibility (personal/team/org/public), team_id |
| **collection_prompts** | M2M junction | collection_id, prompt_id |
| **standards** (guidelines) | Quality rules | category (14 types), rules (JSONB), enforced, scope (personal/team/org) |

### Security & Compliance

| Table | Purpose | Key Columns |
|-------|---------|------------|
| **security_rules** | DLP patterns | pattern, pattern_type (exact/regex/glob), category (9 types), severity (block/warn), is_built_in |
| **security_violations** | Audit trail | rule_id, matched_text (redacted), user_id, action_taken (blocked/overridden/auto_redacted) |
| **sensitive_terms** | Keyword matching | term, term_type, category, severity, source (manual/import/sync/ai_suggested) |
| **suggested_rules** | AI-suggested rules | pattern, confidence, detection_count, status |
| **security_settings** | Org config | entropy_detection_enabled, ai_detection_enabled, smart_patterns_enabled |

### Billing & Activity

| Table | Purpose | Key Columns |
|-------|---------|------------|
| **subscriptions** | Stripe billing | stripe_customer_id, plan, status, seats, trial_ends_at, cancel_at_period_end |
| **invites** | Team invitations | email, role, token, status, team_id, expires_at |
| **usage_events** | Prompt usage tracking | user_id, prompt_id, action (use/copy/insert/rate/share/export) |
| **conversation_logs** | Extension audit trail | ai_tool, prompt_text, action (sent/blocked/warned), metadata |
| **notifications** | In-app alerts | type, title, message, read |

### Row-Level Security (RLS)

- Custom functions: `get_my_org_id()`, `get_my_role()`
- Admins/managers see all org data; members see limited views
- Super admin bypass via `is_super_admin` flag
- Service role for seeding and webhooks

---

## Authentication

| Method | Details |
|--------|---------|
| **Email/Password** | Supabase Auth with PKCE flow |
| **Google OAuth** | OAuth2 redirect → `/auth/callback` |
| **GitHub OAuth** | OAuth2 redirect → `/auth/callback` |
| **Extension Auth Bridge** | Web app localStorage → extension storage (one-way sync) |
| **Token Refresh** | Background alarm every 10 minutes in extension |

### Middleware Route Protection

- **Public:** `/`, `/pricing`, `/features`, `/security`, `/enterprise`, `/industries/*`, `/media`
- **Auth pages:** `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Protected:** Everything else → redirects to `/login?redirect={path}`
- **Security headers:** CSP, HSTS (63072000s), X-Frame-Options DENY, Permissions-Policy

---

## Billing & Plans

| | Free | Pro | Team | Business |
|--|------|-----|------|----------|
| **Price** | $0 | $9/mo | $7/user/mo | $12/user/mo |
| **Annual** | — | $86/yr | $67/user/yr | $115/user/yr |
| **Prompts** | 25 | Unlimited | Unlimited | Unlimited |
| **Members** | 3 | 1 | 50 | 500 |
| **Guidelines** | 5 | 14 | 14 | Unlimited |
| **AI Tools** | 3 | Unlimited | Unlimited | Unlimited |
| **Basic Security** | Yes | Yes | Yes | Yes |
| **Custom Security** | — | Yes | Yes | Yes |
| **Analytics** | — | Yes | Yes | Yes |
| **Import/Export** | — | Yes | Yes | Yes |
| **Audit Log** | — | — | Yes | Yes |
| **Trial** | — | 14 days | 14 days | — |

### Stripe Integration

- Checkout sessions with org metadata
- Webhook handles: `checkout.session.completed`, `subscription.created/updated/deleted`, `invoice.paid/failed`, `charge.dispute.*`
- Customer portal for self-service billing management

---

## Security Guardrails (DLP)

### 46+ Built-in Detection Rules

**Active by Default (13 rules):**
- AWS Access Key, GitHub Token, Stripe Secret Key, OpenAI API Key, Slack Token
- Generic API Key Header (warn), Password in Text, Connection Strings (MongoDB/Postgres/MySQL/Redis)
- Private Key Block (PEM), Bearer Token (warn), JWT Token, Webhook URL

**Available / Smart Detection (33 rules, off by default):**
- **PII:** SSN, Credit Card, Email, Phone, Date of Birth, Passport, Driver License, Bank Account, Routing Number, IBAN
- **Infrastructure:** IPv4, Private IP, MAC Address, Internal Domain, File Paths
- **Medical:** Medical Record Number, Health Insurance ID
- **Financial:** Routing Number, IBAN
- **Other:** URLs with credentials, Environment Variables, Base64 secrets

### Compliance Templates (5 frameworks)
- **HIPAA** (6 rules) — Medical records, insurance IDs, diagnosis codes, drug names
- **PCI-DSS** (5 rules) — Visa/Mastercard/Amex numbers, CVV, expiration dates
- **GDPR** (5 rules) — EU national ID, passport, IBAN, VAT, date of birth
- **CCPA** (4 rules) — CA driver license, SSN, phone, physical address
- **General PII** (4 rules) — Email, international phone, IP address, GPS coordinates

### Entropy Detection
- Shannon entropy analysis for high-entropy strings (likely secrets)
- Configurable threshold (default 4.0 bits/char)
- False positive filters: URLs, hashes (MD5/SHA1/SHA256), constants

### Scanning Flow
1. Extension intercepts outbound text on AI tool page
2. Sends to `/api/extension/scan` (50KB max, 500ms regex timeout)
3. Matches against org's active rules
4. **Block** → prevents submission, logs violation, notifies admins
5. **Warn** → allows with override, logs interaction
6. Matched text redacted in audit log (first 2 + asterisks + last 2 chars)

---

## Browser Extension

### Supported AI Tools (6)
| Tool | URLs |
|------|------|
| ChatGPT | chat.openai.com, chatgpt.com |
| Claude | claude.ai |
| Gemini | gemini.google.com |
| GitHub Copilot | github.com/copilot |
| Microsoft Copilot | copilot.microsoft.com |
| Perplexity | perplexity.ai |

### Extension Features
- **Prompt Browser** — Search, filter (all/templates/favorites), browse team prompts
- **Insert into AI Tool** — One-click injection into active AI tool input (10+ DOM selectors)
- **Template Fill** — `{{variable}}` substitution with live preview
- **Real-time DLP Scanning** — Intercepts outbound text, blocks/warns before submission
- **Shield Status** — Visual indicator showing protection state and rule count
- **Conversation Logging** — Records every AI interaction for audit trail
- **Auth Bridge** — Seamless session sync from web app (no separate login needed)
- **Dark/Light Theme** — Matches system preference
- **Side Panel** — Full-height panel alongside AI tools (Chrome)

### Architecture
- **Manifest V3** with service worker (no persistent background)
- **WXT framework** for cross-browser builds (Chrome, Edge, Firefox)
- **Background worker** handles API proxy (CORS), token refresh, side panel management
- **Content script** on AI tool pages for DOM interaction and scanning
- **Auth-bridge content script** on teamprompt.app for session sync

### MDM / Enterprise Deployment
- Force-install via Google Admin Console (Chrome policy)
- Microsoft Intune / JAMF configuration profiles
- Group Policy Objects (GPO) with ADMX templates
- Self-managed CRX hosting for air-gapped environments
- Users cannot disable or remove when force-installed

---

## API Endpoints

### Extension APIs
| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| GET | `/api/extension/prompts` | Fetch prompts (search, templates filter) | 30/min |
| POST | `/api/extension/scan` | DLP scan outbound text | 60/min |
| POST | `/api/extension/log` | Log AI conversation | 120/min |
| GET | `/api/extension/security-status` | Get org guardrail status | 20/min |
| POST | `/api/extension/enable-shield` | Enable default security rules | — |

### Billing APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/stripe/checkout` | Create Stripe checkout session |
| POST | `/api/stripe/portal` | Redirect to customer portal |
| POST | `/api/stripe/webhook` | Handle Stripe webhook events |

### Team APIs
| Method | Endpoint | Purpose | Rate Limit |
|--------|----------|---------|------------|
| POST | `/api/invite/send` | Send email invite | 10/min |
| POST | `/api/invite/accept` | Accept invite token | — |

### Other APIs
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/org/ensure` | Provision org on signup |
| POST | `/api/account/delete` | Delete user account |
| POST | `/api/support` | Submit support request (5/10min) |

---

## Library Packs (8 pre-built)

| Pack | Prompts | Guardrails | Description |
|------|---------|------------|-------------|
| **Engineering & Development** | 5 | api_keys, credentials | Code review, PR description, bug report, ADR, debugging |
| **Marketing & Content** | 4 | — | Blog post, social media, email campaign, SEO brief |
| **Customer Support** | 4 | pii | Ticket response, escalation, FAQ draft, feedback summary |
| **Sales** | 4 | — | Cold outreach, follow-up, proposal, objection handling |
| **HR & People** | 4 | pii | Job description, interview questions, performance review, onboarding |
| **Legal & Compliance** | 3 | pii, credentials | Contract summary, policy draft, compliance checklist |
| **Product Management** | 4 | internal_terms | PRD, user stories, release notes, competitor analysis |
| **Executive & Leadership** | 3 | — | Board update, all-hands talking points, strategic memo |

Each pack auto-installs matching guidelines and optional guardrail categories.

---

## Quality Guidelines (14 categories)

writing, development, design, support, marketing, sales, hr, legal, executive, analytics, product, research, education, internal

### Guideline Rules (per guideline)
- `toneRules` — Required tone guidance
- `bestPractices` — Recommended patterns
- `restrictions` — Things to avoid
- `constraints` — Format/structural requirements
- `requiredFields` — Fields that must be filled
- `requiredTags` — Tags that must be applied
- `bannedWords` — Forbidden terms
- `minLength` / `maxLength` — Content length bounds

5 guidelines auto-installed on org creation: Writing, Coding, Support, Marketing, Executive.

---

## Onboarding Flow

1. User signs up → org auto-provisioned via `/api/org/ensure`
2. Org seeded with defaults:
   - 1 sample template prompt ("Weekly Status Update" with `{{variables}}`)
   - "Getting Started" collection
   - 5 default guidelines
   - 13 built-in security rules
3. Setup wizard on `/home` guides through:
   - Install browser extension
   - Invite team members
   - Create first prompt
   - Enable guardrails
   - Review guidelines

---

## Marketing & SEO

### Marketing Pages
- `/` — Landing page (hero, stats, features, CTA)
- `/pricing` — Plan comparison with FAQ (6 questions)
- `/features` — Feature showcase with app mockups
- `/enterprise` — MDM deployment, governance, SSO (coming soon)
- `/security` — DLP details, compliance info
- `/industries/healthcare` — HIPAA focus
- `/industries/finance` — PCI-DSS / SOX focus
- `/industries/legal` — Privilege protection
- `/industries/government` — PII / classified data
- `/industries/technology` — Secret detection
- `/integrations`, `/media`, `/help`, `/privacy`, `/terms`, `/solutions`

### SEO Features
- `generatePageMetadata()` — Title, description, keywords, OG image, canonical URL
- JSON-LD structured data: SoftwareApplication, Organization, WebSite, FAQ
- Dynamic `sitemap.ts` and `robots.ts`
- Dynamic OG image generation (`opengraph-image.tsx`)

---

## Admin Dashboard (Super Admin)

Accessible only with `is_super_admin` flag. Routes under `/admin/`:

- **Dashboard** — Org count, user count, MRR, plan distribution
- **Users** — User management and lookup
- **Organizations** — Org list with detail pages
- **Subscriptions** — Subscription management
- **Analytics** — Platform-wide analytics
- **Activity** — Global activity log
- **Errors** — Error tracking
- **Tickets** — Support ticket management
- **Settings** — Admin configuration

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_PRO_ANNUAL=
STRIPE_PRICE_TEAM=
STRIPE_PRICE_TEAM_ANNUAL=
STRIPE_PRICE_BUSINESS=
STRIPE_PRICE_BUSINESS_ANNUAL=

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Optional
NEXT_PUBLIC_SITE_URL=https://teamprompt.app
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-83VRNN79X8
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Enterprise Page vs. Actual Implementation

| Claimed Feature | Status | Notes |
|----------------|--------|-------|
| Data Loss Prevention | **Built** | 46+ rules, real-time scanning, entropy detection |
| Audit Logging | **Built** | conversation_logs + security_violations tables |
| Role-Based Access | **Built** | Admin / Manager / Member with RLS |
| MDM Deployment | **Supported** | Extension is MV3, force-install compatible (docs on page) |
| Real-Time Scanning | **Built** | Extension content script + /api/extension/scan |
| 6 AI Tools Monitored | **Built** | ChatGPT, Claude, Gemini, Copilot (GitHub + MS), Perplexity |
| Google Admin Console Deploy | **Supported** | Standard Chrome extension force-install flow |
| Intune / MDM Deploy | **Supported** | ExtensionInstallForcelist policy |
| Self-Managed / Air-Gapped | **Supported** | CRX self-hosting documented |
| Team-Based Guardrail Policies | **Partial** | Teams exist, guardrails are org-level (not yet per-team override) |
| Full Audit Trail | **Built** | conversation_logs, security_violations, usage_events |
| Exportable Compliance Reports | **Partial** | Data in DB; no dedicated export UI yet |
| SIEM Integration | **Not built** | No integration endpoint |
| SSO (SAML/OIDC) | **Not built** | Marked "Coming Soon" on page |
| SCIM Provisioning | **Not built** | Marked "Coming Soon" on page |
| Priority Support | **Partial** | Support form exists; no SLA/priority routing |
| Encrypted at Rest/Transit | **Built** | Supabase (Postgres) encryption + HTTPS + HSTS |
| Activity & Violation Reports | **Built** | Analytics dashboard + guardrails page |
| Unlimited Users/Teams | **Built** | Business plan: 500 members (not truly unlimited) |
| Custom Guidelines | **Built** | Full CRUD, 14 categories |
| Import/Export Packs | **Built** | JSON import/export + 8 library packs |
| Shadow AI Detection (via gaps) | **Implicit** | Audit log shows absence of activity |

---

## Stats

- **66** React components
- **19** database migrations
- **15+** API endpoints
- **46+** security detection rules
- **5** compliance framework templates
- **8** library content packs (~35 template prompts)
- **14** guideline categories
- **5** industry solution pages
- **12** prompt tone options
- **4** billing plan tiers
