# TeamPrompt SEO Domination Strategy

## Executive Summary

TeamPrompt currently has **~191 indexable pages**. This strategy scales to **560+ pages** while fixing critical technical gaps and optimizing for both Google and AI agents (ChatGPT, Perplexity, Claude, Copilot, Google AI Overviews).

**Key strategic advantage:** No competitor bridges prompt management + AI DLP. Nightfall does DLP but no prompts. AIPRM does prompts but no security. TeamPrompt owns both — and the content strategy exploits this unique intersection.

---

## Part 1: Critical Technical Fixes (Do First)

### 1A. Sitemap — 72 Pages Missing

**File:** `src/app/sitemap.ts`

Missing from sitemap:
- `/industries/education` and `/industries/insurance` (only 5 of 7 listed)
- `/extensions` page
- All 10 help category pages (`/help/[categoryId]`)
- All 60 help article pages (`/help/[categoryId]/[articleSlug]`)

**Impact:** 38% of indexable pages are invisible to search engines via sitemap.

### 1B. robots.txt — AI Bots Can Crawl Private Routes

**File:** `src/app/robots.ts`

Current AI bot rules specify `allow: "/"` but do NOT include the `disallow` list that the main `*` rule has. AI bots could crawl `/admin`, `/vault`, `/home`, etc.

**Fix:** Mirror the disallow list for AI bot rules, or restructure so AI bots inherit from the default rule.

**Recommended robots.txt structure:**
```
# Block private routes for ALL bots
User-agent: *
Disallow: /home
Disallow: /vault
Disallow: /admin
Disallow: /settings
Disallow: /api/
Disallow: /auth/
Allow: /

# AI Search/Retrieval Bots (explicitly allow public routes)
User-agent: ChatGPT-User
User-agent: OAI-SearchBot
User-agent: Claude-User
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Applebot-Extended
Crawl-delay: 1
Allow: /

# AI Training Bots (allow for maximum brand visibility)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Google-Extended
Crawl-delay: 1
Allow: /

# Block known bad actors
User-agent: CCBot
Disallow: /
User-agent: Bytespider
Disallow: /

Sitemap: https://teamprompt.app/sitemap.xml
```

### 1C. Create llms.txt

**File:** `public/llms.txt` (new)

600+ sites have adopted this standard (Stripe, Zapier, Cloudflare, Perplexity). Low cost, future-proofs for AI.

```markdown
# TeamPrompt

> TeamPrompt is an AI prompt management platform with built-in data loss prevention (DLP) for teams using ChatGPT, Claude, Gemini, Copilot, and Perplexity.

## Documentation
- [Features](https://teamprompt.app/features): Core product features
- [Pricing](https://teamprompt.app/pricing): Plans and pricing
- [Security](https://teamprompt.app/security): Data protection and DLP
- [Enterprise](https://teamprompt.app/enterprise): Enterprise features
- [Integrations](https://teamprompt.app/integrations): Supported AI tools
- [Help Center](https://teamprompt.app/help): Documentation and guides

## Solutions
- [Industries](https://teamprompt.app/industries): Industry-specific solutions
- [Solutions Hub](https://teamprompt.app/solutions): Use cases, guides, and comparisons

## Optional
- [Changelog](https://teamprompt.app/changelog): Release history
- [Media Kit](https://teamprompt.app/media): Brand assets and logos
- [Privacy Policy](https://teamprompt.app/privacy): Privacy policy
- [Terms of Service](https://teamprompt.app/terms): Terms of service
```

### 1D. Submit to Brave Search

Claude's web search is powered by **Brave Search**, not Google. Submit URLs at `search.brave.com/submit-URL`.

### 1E. Implement IndexNow

IndexNow instantly notifies Bing (which powers Copilot) when content changes. Next.js can ping IndexNow in a post-build hook or API route.

### 1F. Organization Schema — Fill sameAs

**File:** `src/lib/seo/schemas.ts`

The `sameAs` array is empty. Add social profiles:
- Twitter/X URL
- LinkedIn company URL
- GitHub URL
- Chrome Web Store listing URL

### 1G. Missing Meta Tags

**File:** `src/app/layout.tsx`

Add:
- `<meta name="theme-color" content="#2563EB">`
- Apple touch icon
- Web app manifest
- `poweredByHeader: false` in next.config.ts

### 1H. Add noindex to Dashboard/Admin Pages

Currently relying only on robots.txt blocking. Add per-page `noindex` meta tags as defense-in-depth. The `generatePageMetadata()` function could handle this, or set it in the dashboard layout.

---

## Part 2: Content Structure for AI Citation

Based on the Princeton GEO study (30-40% visibility improvement), every page should follow this structure:

### Page Template Requirements

1. **TL;DR summary** — 50-70 word answer-first paragraph right after the H1
2. **Statistics with sources** — specific, verifiable numbers ("Teams using TeamPrompt reduce data incidents by 94%")
3. **Expert quotes with attribution** — named experts with credentials
4. **HTML tables** — for comparisons, pricing, feature matrices (96% extraction accuracy by AI)
5. **FAQ section** — matching natural query patterns (highly extractable by all AI platforms)
6. **Hierarchical headings** — H1 > H2 > H3, each section independently understandable
7. **Bullet/numbered lists** — discrete, atomic points
8. **"Last updated" timestamp** — AI engines weigh freshness heavily
9. **Author attribution** — named author linked to bio/credentials
10. **BreadcrumbList schema** — on every nested page

### Key Insight: FCP Speed

Pages with FCP under 0.4 seconds get **3x more AI citations** (6.7 citations vs 2.1). Prioritize performance.

---

## Part 3: 560-Page Content Strategy

### Current State: ~191 pages
### Target: ~560 pages (+369 net new)

| # | Category | Current | Target | Net New | Intent | Priority |
|---|----------|---------|--------|---------|--------|----------|
| 1 | Prompt Templates | 10 | 120 | +110 | Mid-funnel | Phase 3 |
| 2 | AI Tool Integrations | 15 | 40 | +25 | Mid-funnel | Phase 4 |
| 3 | Role/Persona Pages | 10 | 35 | +25 | Mid-funnel | Phase 4 |
| 4 | Industry Pages | 7 | 25 | +18 | Mid-funnel | Phase 2 |
| 5 | Comparison Pages | 15 | 50 | +35 | Bottom-funnel (5.45% CVR) | Phase 1 |
| 6 | Alternative Pages | 10 | 40 | +30 | Bottom-funnel (8.43% CVR) | Phase 1 |
| 7 | How-To Guides | 15 | 60 | +45 | Top-funnel | Phase 4 |
| 8 | Glossary / "What Is" | 0 | 50 | +50 | Top-funnel | Phase 4 |
| 9 | Workflow Pages | 10 | 30 | +20 | Mid-funnel | Phase 3 |
| 10 | Use Case Pages | 15 | 40 | +25 | Mid-funnel | Phase 3 |
| 11 | Compliance Frameworks | 0 | 20 | +20 | Bottom-funnel | Phase 2 |
| 12 | Data Leak Prevention | 0 | 25 | +25 | Bottom-funnel | Phase 2 |
| 13 | Feature Deep-Dives | 0 | 15 | +15 | Mid-funnel | Phase 1 |
| 14 | AI Policy Templates | 0 | 10 | +10 | Bottom-funnel | Phase 2 |
| | **TOTAL** | **~107 SEO** | **560** | **+453** | | |

Plus: 7 industry pages, 60 help articles, ~17 core marketing pages = **~644 total indexable pages**

---

### Phase 1: High-Intent Bottom-Funnel (Weeks 1-4) — +80 pages

These convert at the highest rates. Alternative pages convert at **8.43%**, comparison pages at **5.45%**.

**Comparison pages (+35 new):**
Expand from 15 to 50. Target every meaningful competitor:
- Doc tools: vs-notion, vs-google-docs, vs-confluence, vs-slite, vs-coda, vs-obsidian, vs-roam, vs-dropbox-paper, vs-slab, vs-gitbook, vs-craft, vs-bear
- Prompt tools: vs-aiprm, vs-flowgpt, vs-promptbase, vs-prompthero, vs-prompthub, vs-promptpanda, vs-promptlayer
- AI security: vs-nightfall, vs-harmonic-security, vs-cyberhaven, vs-strac, vs-lakera, vs-varonis, vs-code42, vs-digital-guardian, vs-forcepoint, vs-microsoft-purview
- AI governance: vs-credo-ai, vs-holistic-ai, vs-robust-intelligence, vs-arthur-ai
- Collaboration: vs-slack, vs-teams, vs-asana, vs-monday, vs-linear

**Alternative pages (+30 new):**
Expand from 10 to 40. Same competitors with "alternative" framing:
- notion-alternative, google-docs-alternative, confluence-alternative, aiprm-alternative, nightfall-alternative, chatgpt-teams-alternative, etc.

**Feature deep-dives (+15 new):**
- feature-dlp-scanning, feature-prompt-variables, feature-usage-analytics, feature-team-folders, feature-role-permissions, feature-custom-categories, feature-browser-extension, feature-prompt-versioning, feature-audit-log, feature-sso-integration, feature-custom-dlp-rules, feature-prompt-approval-workflow, feature-api-access, feature-bulk-import-export, feature-admin-dashboard

### Phase 2: Security/Compliance Moat (Weeks 5-8) — +73 pages

Content that competitors cannot easily replicate. This is TeamPrompt's unique differentiator.

**Data leak prevention pages (+25 new):**
- By tool: prevent-data-leaks-chatgpt, prevent-data-leaks-claude, prevent-data-leaks-gemini, prevent-data-leaks-copilot, prevent-data-leaks-perplexity
- By data type: prevent-leaks-api-keys, prevent-leaks-source-code, prevent-leaks-pii, prevent-leaks-phi, prevent-leaks-financial-data, prevent-leaks-customer-data, prevent-leaks-trade-secrets, prevent-leaks-credentials, prevent-leaks-ssn-credit-cards, prevent-leaks-intellectual-property
- By context: prevent-leaks-remote-teams, prevent-leaks-enterprise, prevent-leaks-startups, prevent-leaks-regulated-industries, prevent-leaks-contractors, prevent-leaks-onboarding, prevent-leaks-browser-extension, prevent-leaks-slack, prevent-leaks-email, prevent-leaks-code-editors

**Compliance framework pages (+20 new):**
- hipaa-ai-compliance, soc2-ai-compliance, gdpr-ai-compliance, ccpa-ai-compliance, nist-ai-framework, eu-ai-act-compliance, iso-42001-compliance, iso-27001-ai, fedramp-ai-compliance, pci-dss-ai-compliance, cmmc-ai-compliance, ferpa-ai-compliance, glba-ai-compliance, sec-ai-regulations, finra-ai-compliance, itar-ai-compliance, cjis-ai-compliance, stateramp-ai-compliance, hitrust-ai-compliance, pipeda-ai-compliance

**AI policy template pages (+10 new):**
- ai-acceptable-use-policy-template, ai-data-handling-policy-template, ai-vendor-assessment-template, ai-incident-response-policy, ai-employee-training-policy, enterprise-ai-governance-framework, ai-procurement-checklist, ai-risk-assessment-template, ai-model-evaluation-framework, ai-ethics-policy-template

**Industry pages (+18 new):**
Expand from 7 to 25: pharmaceutical, manufacturing, real-estate, retail, telecom, energy, nonprofit, media, advertising, consulting, accounting, logistics, construction, hospitality, automotive, aerospace, life-sciences, professional-services

### Phase 3: Template Library Explosion (Weeks 9-14) — +155 pages

The Canva play — massive long-tail coverage. Each page provides a ready-to-use prompt template.

**Prompt template pages (+110 new):**
- Marketing (25): cold-email, blog-post, social-media, ad-copy, seo-meta, product-description, press-release, newsletter, landing-page, video-script, podcast-outline, case-study, whitepaper, webinar, brand-voice, ab-test-copy, customer-testimonial, event-invitation, competitive-analysis-brief, content-calendar, email-sequence, influencer-outreach, market-research, brand-positioning, customer-survey
- Engineering (20): code-review, debugging, architecture-doc, api-documentation, test-cases, sql-query, regex-pattern, git-commit, pr-description, infrastructure-doc, code-explanation, refactoring-plan, migration-guide, deployment-checklist, security-audit, performance-optimization, technical-spec, error-handling, database-schema, code-comment
- Sales (20): cold-outreach, objection-handling, proposal, competitive-analysis, pricing-justification, discovery-call, follow-up-email, quarterly-review, pipeline-summary, territory-plan, demo-script, rfp-response, account-strategy, win-loss-analysis, partner-outreach, renewal-email, upsell-pitch, customer-reference, roi-calculator, sales-playbook
- HR/Ops (15): job-description, interview-questions, performance-review, onboarding-guide, policy-draft, meeting-agenda, project-plan, status-report, sop, training-material, employee-feedback, exit-interview, compensation-analysis, diversity-report, team-building
- Legal (10): contract-summary, policy-review, compliance-checklist, privacy-notice, terms-of-service, risk-assessment, audit-response, regulatory-summary, nda-review, legal-research
- Healthcare (10): patient-communication, clinical-summary, research-abstract, care-plan, hipaa-note, referral-letter, treatment-explanation, discharge-instruction, medical-record-summary, informed-consent
- Education (10): lesson-plan, rubric, student-feedback, course-outline, assignment-prompt, study-guide, assessment-question, learning-objective, curriculum-map, parent-communication
- Finance (10): financial-analysis, report-summary, risk-assessment-finance, regulatory-filing, client-communication, portfolio-review, audit-preparation, budget-forecast, expense-report, investment-memo

**Workflow pages (+20 new):**
- customer-support-ai-workflow, content-marketing-ai-workflow, code-review-ai-workflow, sales-outreach-ai-workflow, incident-response-ai-workflow, employee-onboarding-ai-workflow, quarterly-reporting-ai-workflow, contract-review-ai-workflow, seo-content-ai-workflow, data-analysis-ai-workflow, hiring-ai-workflow, product-research-ai-workflow, compliance-audit-ai-workflow, bug-triage-ai-workflow, design-review-ai-workflow, investor-reporting-ai-workflow, vendor-evaluation-ai-workflow, customer-feedback-ai-workflow, documentation-ai-workflow, market-analysis-ai-workflow

**Use case pages (+25 new):**
- enterprise-prompt-management, ai-compliance-monitoring, prompt-version-control, team-prompt-sharing, ai-onboarding, shadow-ai-prevention, ai-quality-guidelines, prompt-analytics, multi-model-management, ai-acceptable-use-enforcement, centralized-ai-library, prompt-approval-workflows, ai-cost-optimization, cross-team-ai-collaboration, ai-training-content, prompt-performance-tracking, ai-vendor-consolidation, regulated-ai-usage, ai-output-quality, department-ai-templates, executive-ai-briefings, customer-facing-ai, internal-ai-knowledge-base, ai-experimentation, prompt-ab-testing

### Phase 4: Authority & Top-Funnel (Weeks 15-20) — +145 pages

Build topical authority. Clustered content gets **3.2x more AI citations**.

**Glossary / "What Is" pages (+50 new):**
- Prompt concepts (15): what-is-prompt-management, what-is-prompt-engineering, what-is-prompt-templates, what-is-prompt-library, what-is-prompt-chaining, what-is-system-prompts, what-is-few-shot-prompting, what-is-zero-shot-prompting, what-is-prompt-injection, what-is-prompt-variables, what-is-prompt-versioning, what-is-prompt-analytics, what-is-prompt-governance, what-is-prompt-optimization, what-is-prompt-testing
- AI security (15): what-is-data-loss-prevention, what-is-ai-governance, what-is-ai-compliance, what-is-llm-security, what-is-ai-acceptable-use-policy, what-is-data-exfiltration, what-is-pii-detection, what-is-sensitive-data-scanning, what-is-ai-audit-trail, what-is-ai-access-controls, what-is-model-poisoning, what-is-ai-risk-management, what-is-ai-data-residency, what-is-token-logging, what-is-shadow-ai
- Compliance (10): what-is-hipaa-ai, what-is-soc2-ai, what-is-gdpr-ai, what-is-nist-ai-rmf, what-is-eu-ai-act, what-is-iso-42001, what-is-ccpa-ai, what-is-fedramp-ai, what-is-pci-dss-ai, what-is-cmmc-ai
- AI concepts (10): what-is-rag, what-is-fine-tuning, what-is-embeddings, what-is-context-window, what-is-temperature-llm, what-is-tokens-ai, what-is-hallucination-ai, what-is-grounding-ai, what-is-multi-modal-ai, what-is-agentic-ai

**How-to guides (+45 new):**
- Prompt fundamentals (15): how-to-write-chatgpt-prompts, how-to-chain-prompts, how-to-use-prompt-variables, how-to-write-system-prompts, how-to-use-few-shot-prompts, how-to-structure-complex-prompts, how-to-write-role-based-prompts, how-to-optimize-prompt-length, how-to-test-prompts, how-to-version-prompts, how-to-write-chain-of-thought-prompts, how-to-use-prompt-templates, how-to-evaluate-prompt-quality, how-to-debug-ai-outputs, how-to-write-multi-step-prompts
- Team/org (15): how-to-build-prompt-library, how-to-share-prompts-across-teams, how-to-onboard-team-to-ai, how-to-manage-prompt-permissions, how-to-measure-prompt-usage, how-to-standardize-ai-workflows, how-to-create-prompt-governance-policy, how-to-train-team-prompt-engineering, how-to-organize-prompts-by-department, how-to-set-up-prompt-approval-workflow, how-to-migrate-prompts-from-docs, how-to-create-ai-style-guide, how-to-measure-ai-roi, how-to-roll-out-ai-tools, how-to-manage-multi-model-strategy
- Security/compliance (15): how-to-prevent-data-leaks-chatgpt, how-to-set-up-dlp-for-ai, how-to-implement-ai-policy, how-to-audit-ai-usage, how-to-comply-hipaa-ai, how-to-gdpr-compliant-ai, how-to-block-sensitive-data-prompts, how-to-monitor-ai-tool-access, how-to-create-ai-acceptable-use-policy, how-to-detect-shadow-ai, how-to-secure-chatgpt-enterprise, how-to-implement-ai-guardrails, how-to-create-ai-incident-response-plan, how-to-conduct-ai-security-assessment, how-to-manage-ai-vendor-risk

**Role/persona pages (+25 new):**
- for-marketing-teams, for-software-engineers, for-sales-teams, for-product-managers, for-customer-support, for-hr-teams, for-legal-teams, for-data-analysts, for-ctos, for-cisos, for-compliance-officers, for-security-teams, for-it-admins, for-consultants, for-researchers, for-educators, for-procurement, for-operations, for-project-managers, for-content-teams, for-growth-teams, for-business-analysts, for-solutions-architects, for-customer-success, for-revenue-operations

**Integration pages (+25 new):**
- chatgpt-prompt-manager, chatgpt-dlp-scanning, chatgpt-team-prompts, chatgpt-data-protection, chatgpt-usage-analytics, claude-prompt-library, claude-data-protection, claude-team-prompts, gemini-prompt-management, gemini-enterprise-security, gemini-team-prompts, copilot-prompt-templates, copilot-dlp-compliance, copilot-team-prompts, perplexity-prompt-library, perplexity-data-protection, perplexity-team-prompts, slack-ai-prompts, teams-ai-prompts, chrome-extension-prompts, multi-model-management, ai-tool-consolidation, ai-browser-extension-guide, enterprise-ai-integration, api-prompt-management

---

## Part 4: Topic Cluster Architecture

### 6 Pillar Clusters (3.2x more AI citations)

**Cluster 1: "AI Prompt Management"** (pillar)
- Pillar page: `/solutions/what-is-prompt-management`
- Spokes: 120 template pages, 40 use cases, 30 workflows, role pages
- Every spoke links back with anchor text "prompt management"

**Cluster 2: "AI Security & DLP"** (pillar)
- Pillar page: `/security` + `/solutions/what-is-data-loss-prevention`
- Spokes: 25 data leak prevention pages, 20 compliance pages, 10 policy templates
- Every spoke links back to `/security`

**Cluster 3: "AI for [Role]"** (pillar)
- Hub: `/solutions` filtered by role
- Spokes: 35 role pages, each linking to relevant templates and workflows
- Cross-link: role pages -> relevant industry pages

**Cluster 4: "AI Compliance"** (pillar)
- Pillar page: `/solutions/what-is-ai-compliance`
- Spokes: 20 compliance framework pages, 10 policy templates, industry pages
- Cross-link: HIPAA -> healthcare, PCI DSS -> finance, FERPA -> education

**Cluster 5: "TeamPrompt vs. Alternatives"** (pillar)
- Hub: `/solutions` comparison section
- Spokes: 50 comparison pages + 40 alternative pages
- Cross-link: each comparison -> relevant feature deep-dives

**Cluster 6: "AI Tool Integrations"** (pillar)
- Pillar: `/integrations`
- Spokes: 40 tool-specific integration pages
- Cross-link: integration pages -> "prevent data leaks in [tool]" pages

---

## Part 5: Schema.org / Structured Data Strategy

### Per-Page Schema Requirements

| Page Type | Required Schemas |
|-----------|-----------------|
| Homepage | Organization, WebSite, SoftwareApplication |
| Features, Security, Enterprise | SoftwareApplication, BreadcrumbList |
| Pricing | SoftwareApplication (with Offers), BreadcrumbList |
| Industry pages | BreadcrumbList, FAQPage (keep for AI entity resolution) |
| Solution/SEO pages | Article, BreadcrumbList, FAQPage (conditional) |
| Help articles | Article, BreadcrumbList |
| Glossary pages | Article (with definedTerm), BreadcrumbList |
| Comparison pages | Article, BreadcrumbList |

### Schema Enhancements

1. **Article schema** on all SEO pages — with `author`, `datePublished`, `dateModified`
2. **Person schema** — create author profiles with `sameAs` (LinkedIn, Twitter)
3. **BreadcrumbList** — on every nested page (currently only help section has breadcrumbs)
4. **Remove HowTo schema** if present — fully retired by Google as of 2025

**Note on FAQPage:** Google no longer shows FAQ rich results for most sites (only government/health), but the schema still helps AI systems understand content structure. Keep it.

---

## Part 6: Structured Data Improvements for AI (GPT-4 goes from 16% to 54% accuracy with structured data)

1. Add `datePublished` and `dateModified` to all content pages
2. Add `author` with `Person` schema linked to bio pages
3. Fill Organization `sameAs` with social profiles
4. Add `SoftwareApplication` schema to feature pages
5. Add `Article` schema to all SEO/solution pages

---

## Part 7: Competitor Content Gaps to Exploit

### What Competitors Do Well
| Competitor | Strategy | Est. Pages |
|-----------|----------|-----------|
| Nightfall AI | Comparison pages, integration pages, blog, glossary | 300-500+ |
| AIPRM | Prompt directory (4,500+ individual prompt pages) | 5,000+ |
| Harmonic Security | Glossary-heavy SEO (dozens of defined terms) | 50-150 |
| Strac | Aggressive comparison + integration content | 100-200+ |
| Juma/Team-GPT | Comparison listicles, "best tools" posts | 50-100 |

### What NO Competitor Does
- **Prompt templates + DLP in one product** — no one bridges both keyword clusters
- **Compliance framework pages** tied to AI prompt management (HIPAA + prompts, SOC2 + prompts)
- **"Prevent data leaks in [specific tool]"** pages with prompt management solution
- **AI policy templates** as lead magnets tied to a SaaS product
- **Role-specific prompt libraries** with security built in

### Keywords With Low Competition, High Intent
- "prevent data leaks ChatGPT" — very few dedicated pages exist
- "AI acceptable use policy template" — most results are blog posts, not tools
- "HIPAA AI compliance" — massive search interest, few SaaS-focused pages
- "ChatGPT prompt manager for teams" — low competition, exact product match
- "shadow AI prevention tool" — emerging term, few dedicated pages
- "[compliance framework] AI" — barely any SaaS competition for most frameworks

---

## Part 8: AI Agent Optimization Checklist

### Technical (One-Time)
- [ ] Create `/llms.txt` following llmstxt.org spec
- [ ] Submit sitemap to Google Search Console, Bing Webmaster Tools, **Brave Search**
- [ ] Implement IndexNow for Bing/Copilot real-time indexing
- [ ] Fix robots.txt AI bot disallow rules
- [ ] Optimize FCP to under 0.4 seconds (3x citation likelihood)
- [ ] Allow all AI search bots: ChatGPT-User, OAI-SearchBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Applebot-Extended

### Content Structure (Every Page)
- [ ] 50-70 word TL;DR summary after H1
- [ ] Answer-first / inverted pyramid structure
- [ ] Clear H1 > H2 > H3 hierarchy
- [ ] HTML tables for comparisons/features (96% AI extraction rate)
- [ ] Bullet/numbered lists
- [ ] FAQ section
- [ ] Specific statistics with cited sources (30-40% visibility boost)
- [ ] Expert quotes with named attribution
- [ ] "Last updated" timestamp
- [ ] Author attribution with bio link

### Authority Building (Ongoing)
- [ ] Publish original research/data (AI must cite you if unique)
- [ ] Build presence on G2, Capterra review platforms
- [ ] Engage on Reddit (top-5 cited domain across all AI platforms)
- [ ] Earn media coverage and third-party mentions
- [ ] Consistent brand mentions across the web

### Monitoring
- [ ] Bing Webmaster Tools AI Performance dashboard (tracks Copilot citations)
- [ ] Manually check brand appearance in ChatGPT, Perplexity, Claude for key queries
- [ ] Track Share of Model (SoM) — how often TeamPrompt appears in AI responses vs competitors

---

## Part 9: Google Technical SEO Checklist

### Core Web Vitals Targets
- [ ] LCP <= 2.5 seconds
- [ ] INP <= 200 milliseconds (43% of sites fail this)
- [ ] CLS <= 0.1

### Canonical Tags (Already Good)
- [x] Self-referencing canonicals on all pages (via generatePageMetadata)
- [x] Absolute URLs used
- [x] HTTPS enforced
- [ ] Verify no conflicting canonical signals

### Indexing
- [ ] Fix sitemap to include all 191+ pages
- [ ] Add noindex meta tags to dashboard/admin pages (defense-in-depth)
- [ ] Fix AI bot disallow rules in robots.txt
- [x] robots.txt references sitemap
- [x] CSS/JS not blocked from crawlers

### E-E-A-T
- [x] Privacy policy and terms of service present
- [x] Contact information accessible
- [x] HTTPS across entire site
- [ ] Add detailed "About Us" page with team information
- [ ] Add author bios on content pages
- [ ] Fill Organization schema sameAs with social profiles
- [ ] Add "About the author" sections to solution pages

### Page Experience
- [x] HTTPS everywhere
- [x] Mobile-responsive design
- [x] No intrusive interstitials
- [ ] Verify Core Web Vitals pass at 75th percentile

### URL Structure
- [x] Lowercase, hyphenated URLs
- [x] Human-readable slugs
- [x] Consistent trailing slash behavior (trailingSlash: false)
- [x] 3 levels max depth
- [ ] Add www redirect (pick www or non-www, redirect the other)

### Internal Linking
- [x] Footer links to key pages (23 links)
- [x] Mega-menu navigation
- [x] Related content on SEO pages
- [ ] Add breadcrumb UI to all marketing pages (not just help)
- [ ] Create /industries index page (currently no hub)
- [ ] Add contextual cross-links from help articles to features/solutions
- [ ] Ensure every page reachable within 3 clicks of homepage

---

## Part 10: Implementation Priority

### Immediate (This Week)
1. Fix sitemap — add 72 missing pages
2. Fix robots.txt — AI bot disallow rules
3. Create llms.txt
4. Fill Organization schema sameAs
5. Add theme-color, apple-touch-icon
6. Set poweredByHeader: false

### Short-Term (Weeks 1-4)
7. Phase 1 content: +80 bottom-funnel pages (comparisons, alternatives, features)
8. Add Article + BreadcrumbList schema to all SEO pages
9. Add breadcrumb UI to all marketing pages
10. Submit to Brave Search
11. Implement IndexNow

### Medium-Term (Weeks 5-14)
12. Phase 2 content: +73 security/compliance pages
13. Phase 3 content: +155 template/workflow pages
14. Create /industries index page
15. Add author bios and About page
16. Add noindex to dashboard/admin pages

### Long-Term (Weeks 15-20)
17. Phase 4 content: +145 authority/top-funnel pages
18. Implement topic cluster cross-linking
19. Build review platform presence (G2, Capterra)
20. Original research reports for backlinks/citations

---

## Technical Note: All New Pages Use Existing Infrastructure

The existing `SeoPageData` type and `/solutions/[slug]/page.tsx` data-driven route can handle ALL new solution pages. No new route files needed — only new data objects in TypeScript files.

New data files needed:
- `src/lib/seo-pages/data/glossary.ts`
- `src/lib/seo-pages/data/compliance.ts`
- `src/lib/seo-pages/data/data-protection.ts`
- `src/lib/seo-pages/data/features-deep.ts`
- `src/lib/seo-pages/data/policies.ts`

Expand existing:
- `templates.ts` (10 -> 120)
- `integrations.ts` (15 -> 40)
- `roles.ts` (10 -> 35)
- `comparisons.ts` (15 -> 50)
- `alternatives.ts` (10 -> 40)
- `guides.ts` (15 -> 60)
- `workflows.ts` (10 -> 30)
- `use-cases.ts` (15 -> 40)

Industry pages use separate route but same pattern — just add data files.
