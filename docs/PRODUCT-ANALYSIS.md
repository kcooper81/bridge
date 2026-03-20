# TeamPrompt Product Analysis

## Date: 2026-03-19

## Product Scale
- 99 API endpoints
- 70+ database tables
- 17 dashboard pages
- 16 admin pages
- Browser extension supporting 5 AI tools
- 3 AI model providers (OpenAI, Anthropic, Google)
- 19 compliance framework packs

---

## Product Pillars

### 1. PROTECT (Prevention & DLP)
- Real-time DLP scanning (before message leaves browser)
- 19 compliance packs (HIPAA, SOC 2, PCI-DSS, GDPR, FERPA, GLBA, etc.)
- Sensitive term detection (keywords, regex, patterns)
- File upload scanning (PDF, DOCX, code files)
- Auto-sanitization with placeholders
- Block/warn severity levels
- Custom security rules
- Entropy analysis for secret detection
- Per-member shield toggle

### 2. MONITOR (Visibility & Analytics)
- Cross-AI monitoring (ChatGPT, Claude, Gemini, Copilot, Perplexity)
- Activity dashboard & analytics
- Conversation audit logs (who, what, when, which tool)
- Admin slash commands with real DB queries
- Team/department usage breakdowns
- Extension-based usage tracking
- Violation reporting with timestamps and attribution
- Notification system (violations, approvals, team changes)

### 3. GOVERN (Policies & Compliance)
- AI acceptable use policy enforcement
- Per-team rule scoping (team_id on security rules)
- Approval workflows (prompts, rule suggestions, template packs)
- Role-based access (admin, manager, member)
- Org-wide system prompts / custom instructions
- MFA enforcement for admins
- Member rule suggestion flow
- Guideline system (naming standards, banned words, tone rules, length constraints)
- Auto-deprovision on directory removal

### 4. ENABLE (Productivity & Adoption)
- Shared prompt library (vault) with search, categories, favorites
- Template prompts with fill-in variables
- 5-star prompt ratings with effectiveness metrics
- Built-in DLP-protected AI chat (multi-model)
- Conversation presets / starters
- Quick Save from extension (right-click → save AI response)
- Import/export prompts
- Browser extension with prompt insertion into any AI tool
- Template packs (bundled prompt + guideline + guardrail sets)
- MCP integration for Claude Desktop

### 5. DEPLOY (Infrastructure & Ops)
- 2-minute self-serve setup
- Chrome/Firefox/Edge extension
- Google Workspace directory sync
- Slack integration (DLP alerts, submissions, weekly digest)
- Stripe billing (4 plan tiers)
- Full admin panel (campaigns, tickets, funnels, error logs)
- Email campaign system (20+ templates, segmentation, analytics)
- Cron jobs (extension checks, log retention, Slack digest)

---

## Competitive Positioning

### What We Have That Nobody Else Does
1. **Prompt library + DLP + built-in chat** — combined in one product
2. **19 compliance packs out of the box** — more than most competitors
3. **Self-serve 2-minute deploy** — competitors need sales calls + weeks
4. **Template pack marketplace** — bundled prompt+guideline+guardrail packs
5. **MCP integration** — ahead of the market
6. **Built-in email campaigns + tickets + admin ops** — running on our own stack
7. **Guideline quality governance** — tone rules, banned words, length constraints

### Competitive Comparison

| Capability | TeamPrompt | Nightfall AI | Cyberhaven | MS Purview |
|------------|-----------|-------------|------------|-----------|
| Browser DLP | 5 AI tools | API only | 3 tools | Microsoft only |
| Compliance packs | 19 | ~5 | ~8 | Many |
| Prompt enablement | Full vault | None | None | None |
| Built-in AI chat | Multi-model | None | None | None |
| Self-serve deploy | 2 minutes | Sales-led | Sales-led | Sales-led |
| MCP support | Yes | No | No | No |
| Smart redaction | Partial | Yes | Yes | Yes |
| API/network DLP | No | Yes | Yes | Yes |
| SIEM integration | No | Yes | Yes | Yes |
| SSO/SAML | No | Yes | Yes | Yes |
| Data fingerprinting | No | Yes | Yes | Yes |
| Shadow AI detection | Partial (5 tools) | No | Yes | Yes |
| Risk scoring | No | No | Yes | Partial |

### Gaps (Priority Order)
1. Smart redaction v2 (upgrade auto-sanitize to contextual redaction)
2. Shadow AI detection (expand from 5 to 50+ AI domains)
3. Prompt risk scoring (0-100 score using entropy + PII density + patterns)
4. SIEM webhook (one endpoint, opens enterprise door)
5. Per-team policy engine (DB ready, needs UI)
6. SSO/SAML (build only when enterprise PO in hand)
7. API/network coverage (too much infra for solo founder)
8. Data fingerprinting (needs ML/hashing, build later)

---

## Feature Value Assessment

### Table Stakes (must-have, not a selling point)
- Real-time DLP scanning
- Keyword/regex pattern matching
- Audit logs
- Role-based access control
- Browser extension deployment
- Basic compliance packs
- MFA for admins
- Email invites & team management

### Strong Differentiators
- Prompt library + DLP in one product
- Built-in DLP-protected AI chat (multi-model)
- Self-serve 2-minute onboarding
- 19 compliance packs out of the box
- Cross-AI coverage (5 tools)
- Template pack system
- MCP integration
- Guideline quality governance
- Price (10-50x cheaper than enterprise)

### Weak / Over-Engineered
- Compare mode (side-by-side models) — fun demo, zero buyer value
- Version history diff view — cool engineering, no buyer interest
- Response rating (thumbs up/down in chat) — ChatGPT feature envy
- Chat collections/favorites — over-engineered for a secondary feature
- Auto-sanitize placeholder format ({{CATEGORY_N}}) — clunky, needs upgrade

---

## Positioning Statements

**Full version:**
"We help companies secure and standardize how their teams use AI by combining real-time DLP, a shared prompt library, and built-in secure chat — deployed in 2 minutes with 19 compliance frameworks — unlike enterprise tools that take months, only cover one AI vendor, and don't help employees use AI better."

**One-liner:**
"AI DLP + Prompt Library. Deploy in 2 minutes. Stop data leaks to ChatGPT."

**Sales call:**
"Your employees are pasting API keys, customer data, and source code into ChatGPT right now. We stop that in real time across 5 AI tools — and we give your team a safe way to use AI with a built-in chat and shared prompt library. 2 minutes to deploy. No infrastructure changes."

---

## Product Architecture (How to Present to Customers)

```
TeamPrompt
├── PROTECT — Stop data leaks in real time
│   ├── Real-time DLP scanning
│   ├── Smart redaction (upgrade needed)
│   ├── File scanning
│   ├── 19 compliance frameworks
│   └── Custom security rules
│
├── MONITOR — See everything
│   ├── Cross-AI usage dashboard
│   ├── Shadow AI detection (expand needed)
│   ├── Audit trail & compliance reports
│   ├── Violation alerts (Slack, email)
│   └── Team/department analytics
│
├── GOVERN — Set the rules
│   ├── AI acceptable use policies
│   ├── Per-team policy engine (build needed)
│   ├── Approval workflows
│   ├── Quality guidelines
│   └── Role-based access + MFA
│
├── ENABLE — Make AI productive
│   ├── Shared prompt library
│   ├── DLP-protected AI chat
│   ├── Template packs
│   ├── Browser extension
│   └── MCP integration
│
└── DEPLOY — Up and running in 2 minutes
    ├── Self-serve signup
    ├── Chrome/Firefox/Edge extension
    ├── Google Workspace sync
    └── Slack integration
```

---

## Top 5 Build Priorities

| Rank | Feature | Market Demand | Competitive Edge | Effort | Notes |
|------|---------|--------------|-----------------|--------|-------|
| 1 | Smart Redaction v2 | Very High | Close gap | Medium | Upgrade {{CATEGORY_N}} to contextual: sk-abc → [API_KEY_REMOVED] |
| 2 | Shadow AI Detection | High | Strong differentiator | Low | Expand from 5 to 50+ AI domains in extension URL matching |
| 3 | Prompt Risk Scoring | High | Strong differentiator | Medium | Combine entropy + PII density + pattern count into 0-100 score |
| 4 | SIEM Webhook | Very High (enterprise) | Table stakes | Low | One webhook endpoint that POSTs violation events as JSON |
| 5 | Per-Team Policy Engine | High | Differentiator | Medium | UI for "Engineering uses Claude, Finance cannot" — DB is ready |

---

## Plan Tiers
- **Free**: 25 prompts, 3 members, basic security, 5 guidelines
- **Pro**: Unlimited prompts, 12 members, analytics, import/export
- **Team**: Unlimited prompts, 50 members, team management
- **Business**: Unlimited everything, SSO, API access, priority support, SLA
