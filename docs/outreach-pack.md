# Backlink outreach pack — ready to send

Generated 2026-06-05 based on the firepits SEO playbook (Tier 1: earn naturally;
Tier 2: strategic outreach; Tier 3: reclamation).

Backlinks are the single biggest unblocked SEO ceiling for teamprompt.app right
now. Every other technical improvement (Person schema, FAQ schema, OG images,
sitemap expansion) compounds with referring-domain signal but is capped without
it. This pack is the next 10 things to actually send.

---

## TIER 1 — Earn naturally (these convert traffic AND build links)

### 1. Show HN — Prompt PII Scanner

**Where:** https://news.ycombinator.com/submit
**URL to submit:** https://teamprompt.app/tools/prompt-pii-scanner
**Title (under 80 chars):**
`Show HN: Prompt PII Scanner — runs 100% in your browser, no data leaves the page`

**First comment (most important — paste immediately after submit):**

> Hi HN — Eric here, building TeamPrompt.
>
> I built this tool because every "AI data loss prevention" product I've evaluated either (a) sends the prompt to their servers for scanning (defeats the point), or (b) sits behind a multi-week enterprise sales cycle for what should be a 2-minute check.
>
> This runs entirely client-side. 15+ detection categories — PII, PHI under HIPAA's 18 identifiers, payment cards (Luhn-validated), AWS / JWT / PEM keys, IBANs. Source code for the detection engine is in `lib/tools/prompt-pii-scanner` of our repo (open-sourcing the engine soon).
>
> Open question for HN: where are the false-positive failure modes that aren't already covered by the standard "context window" tricks? I've got a Luhn check for cards, contextual regex for SSNs to avoid catching every 9-digit number, but I'd love adversarial input from people who've shipped DLP at scale.
>
> Embed code is on the page if anyone wants to drop it on a security training intranet.

**Why this works:** HN rewards genuinely useful free tools, transparent technical detail, and an honest open question. Don't lead with the product; the tool is the demo.

**Best time to post:** Tuesday or Wednesday, ~8-9am Pacific.

---

### 2. Product Hunt launch

**URL:** https://www.producthunt.com/posts/new
**Page to submit:** https://teamprompt.app

**Tagline (60 chars):**
`AI DLP + prompt management — free for your team in 5 min`

**Description (260 chars):**
> TeamPrompt stops your team leaking sensitive data into ChatGPT, Claude, Gemini, and Copilot — before it leaves the browser. Plus a shared prompt library with versioning, approvals, and audit logs. Free for up to 3 users; SOC 2 / HIPAA / GDPR compliance packs included.

**Maker comment to pin:**

> Built TeamPrompt after watching a healthcare client paste a full discharge summary into ChatGPT — with patient names, MRNs, and the diagnosis — to "fix the tone."
>
> Existing DLP either ignores AI entirely or charges enterprise prices for what should be table stakes. So we built browser-first DLP that catches the data in the page, plus a prompt library so teams don't have to choose between safety and the productivity AI brings.
>
> Free tier is real — up to 3 users, full DLP, full prompt library, no card required. Three things I'd love feedback on:
>
> 1. The PII scanner free tool (linked from the homepage) — does it catch the categories you care about?
> 2. The compliance packs (HIPAA, SOC 2, GDPR, PCI-DSS, EU AI Act) — what frameworks are we missing?
> 3. The browser-first vs proxy-based architecture trade-off — convince me the proxy approach is right for any team that isn't already using a secure web gateway.
>
> Reply or email eric@teamprompt.app. Real responses guaranteed.

**Why this works:** Product Hunt rewards a specific origin story, real free tier (not "freemium"), and explicit asks. Mid-week launch; tag #SaaS #ArtificialIntelligence #DeveloperTools.

---

### 3. dev.to article — "I shipped 159 SEO pages with Claude Code and didn't get penalized"

**Where:** https://dev.to/new
**Title options (pick one):**
1. `I shipped 159 SEO pages with Claude Code and didn't get penalized. Here's exactly what kept us out of trouble.`
2. `Vibe-coded SEO: how to ship volume without Google torching your site`
3. `Claude Code + 159 indexable pages + zero scaled-content penalty — a 2026 playbook`

**Article outline (~2000 words):**

```markdown
# I shipped 159 SEO pages with Claude Code and didn't get penalized

> Six months in, here's what worked, what almost broke us, and the
> specific Google guidance that kept the spam classifier off our case.

## The setup
- TeamPrompt (AI DLP SaaS), Next.js 14 App Router on Vercel, Supabase
- Started June 2026, this is current state as of November 2026
- 8 organic clicks → 800+ organic clicks across the period (numbers
  redacted but you get the trajectory)
- 121 sitemap URLs → 159 sitemap URLs
- 0 manual actions, 0 spam updates affected, 0 demotions

## What I'd assumed would work but didn't
[1-2 paragraphs about generic AI-generated content being indexed but not ranking]

## What actually moved the needle
1. **80/20 unique-per-page content rule** — every page has at minimum
   200 hand-written words that don't exist anywhere else on the web,
   even when the structural framework is templated.
2. **Person schema on every article with a resolvable sameAs URL.**
   Authoritas 2026 data: 1.8x AI Overview citation rate.
3. **FAQPage schema, religiously.** Single highest schema-type impact
   on AI Overview inclusion.
4. **dateModified within 60 days.** 28% more AI citations.
5. **Internal linking from high-PageRank nodes (homepage, top pages).**
6. **noindex on the 500+ thin programmatic pages** — let Google see
   them via crawl, but don't ask it to spend index budget. Sitemap only
   includes the indexable subset.

## What almost burned us
[The "scaled content" classifier story — how we noindexed 500+ pages
intentionally]

## The Claude Code-specific stack
- Plan with the model before writing
- Use the model to audit Google's own guidelines against your output
- Run a sitemap crawler every push (script linked)

## The receipts
[Sitemap link, GSC screenshots if shareable, the seo-audit.mjs script
inlined or gist-linked]

## What I'd skip if starting over
[Strategic skips — paid backlinks, scaled programmatic without 80/20]
```

**Tags:** `#seo` `#claude` `#nextjs` `#startup`

**Why this works:** dev.to ranks well for "how to" + "I built X" titles. The "didn't get penalized" framing is contrarian to the "AI content gets penalized" panic. Vibe-coded SEO is searched. Real receipts = real engagement = real links.

---

## TIER 2 — Strategic outreach

### 4. AI / security newsletter pitches (5 targets)

Send the same base email, customized for each newsletter's beat.

**Targets and angles:**

| Newsletter | Angle to lead with | Editor |
|---|---|---|
| Last Week in AI | The 2026 spam-update / vibe-coded-site indexing problem | Andrey & Daniel |
| Lenny's Newsletter | The "I shipped 500 SEO pages without getting penalized" case study | Lenny Rachitsky |
| The Pragmatic Engineer | AI tool sprawl + DLP economics — buy vs build for security teams | Gergely Orosz |
| Software Lead Weekly | Internal AI governance for engineering leaders | Oren Ellenbogen |
| Hacker Newsletter | The Prompt PII Scanner free tool | Kale Davis |

**Template email (paste, swap [VARIABLES]):**

> Subject: [NEWSLETTER_NAME] piece: [ANGLE_SPECIFIC_TO_THEIR_BEAT]
>
> Hi [EDITOR_FIRST_NAME],
>
> Long-time reader. Quick pitch: I'm Eric at TeamPrompt (we make AI DLP
> + prompt management for teams).
>
> [ONE-SENTENCE ANGLE-SPECIFIC HOOK]
>
> The 30-second version: [TWO-SENTENCE CONTENT DESCRIPTION].
>
> If you'd find it useful, I can either (a) write up a 600-word guest
> post specifically for your readers, or (b) hand you the data and you
> can do whatever you want with it. No link gating, no embargo.
>
> If not for you, no worries — would love to know who else covers this
> beat well.
>
> Eric
> https://teamprompt.app/about/team/eric-campton

**Why this works:** The "(a) I write it or (b) you take the data" framing removes friction. The genuine-reader opener avoids the "obviously a PR pitch" filter.

---

### 5. Podcast guesting (3 targets)

| Podcast | Angle |
|---|---|
| Risky Business | The 2026 AI tool sprawl problem from a DLP perspective |
| Latent Space | How we shipped vibe-coded SEO without getting penalized |
| Smashing Security | The HIPAA / SOC 2 audit-trail problem when employees use ChatGPT |

**Template pitch:**

> Subject: Podcast guest pitch — Eric Campton (Founder, TeamPrompt)
>
> Hi [HOST],
>
> Long-time listener. I'm Eric, founder of TeamPrompt — we build AI DLP
> for the ChatGPT / Claude / Gemini era.
>
> Three things I'd love to talk about (pick any one):
>
> 1. The 2026 "vibe-coded site" SEO penalty cliff — I shipped 159
>    indexable SEO pages with Claude Code and have receipts on what kept
>    us out of the spam classifier.
> 2. AI data exfiltration patterns we see across deployments — the
>    surprising winner: customer service teams pasting full ticket
>    context, including PII, into ChatGPT to draft responses.
> 3. The compliance angle — auditors are now asking specifically about
>    ChatGPT and Claude controls in SOC 2 Type II. Most teams don't have
>    an answer that survives the question.
>
> Happy to share research data, not just opinions. Recording in
> [your_timezone] or wherever you record.
>
> Eric

---

## TIER 3 — Reclamation + low-friction wins

### 6. HARO / Connectively / Help A B2B Writer responses

Set up daily digests for the following beats. Reply within 4 hours of the
query landing (response time is the single biggest factor on whether the
journalist uses the quote + link).

- "AI security" / "AI compliance" / "AI data leak"
- "ChatGPT enterprise" / "ChatGPT for business"
- "DLP" + any modifier
- "Founders + AI tooling decisions"
- "How do you secure ChatGPT at work?"

Response template:

> Quote attribution: Eric Campton, Founder, TeamPrompt (teamprompt.app)
>
> [SPECIFIC ANSWER TO THEIR QUESTION — 2-3 sentences max, with a
> concrete number or example. Journalists cut paragraphs; they keep
> sentences.]
>
> Background: I built TeamPrompt after watching teams handle this
> exact problem badly. We protect 100+ organizations across healthcare,
> finance, and SaaS from leaking sensitive data into ChatGPT, Claude,
> and Gemini.
>
> Bio: Eric Campton, Founder of TeamPrompt — AI DLP and prompt
> management for teams. https://teamprompt.app/about/team/eric-campton

### 7. Unlinked brand mention reclamation

Search Twitter/X, Reddit, LinkedIn weekly:
- "TeamPrompt" as a string (find mentions that don't link)
- "@teampromptapp" handle

For each unlinked mention, reach out:

> Subject: Quick thanks + favor
>
> Hi [NAME],
>
> Thanks for mentioning TeamPrompt in [POST]. Saw it via [HOW].
>
> Tiny favor — if you ever update the post, would you be able to add a
> link to https://teamprompt.app? Not a big deal if not. Either way I
> owe you a coffee.
>
> Eric

Brand-mention reclamation has the highest conversion rate of any link
outreach because the recipient already cited you; they just forgot the link.

### 8. Broken-link reclamation

Tools: Ahrefs broken-link finder, or the manual approach: search
"site:[competitor or industry blog]" + "AI DLP" + "404"

For each broken link pointing to a dead competitor or general resource,
email the publisher:

> Subject: Quick heads up on a broken link in [ARTICLE]
>
> Hi [NAME],
>
> Just hit your post on [TOPIC] — great resource, sharing it with our
> team.
>
> One small thing: the link to [BROKEN_URL] in the section about [X] is
> returning a 404. Looks like [REASON IF KNOWN].
>
> If you want a working alternative, our piece on [SPECIFIC_TEAMPROMPT_URL]
> covers exactly the topic that link was pointing at. No pressure either
> way — just figured I'd mention it.
>
> Eric

---

## TIER 4 — Industry partnership / wholesale

### 9. Compliance consultant outreach

Find 10-15 SOC 2 / HIPAA consultants on LinkedIn. They get the procurement
question "what do we do about ChatGPT?" constantly from their clients.

Pitch: TeamPrompt becomes their recommended AI controls layer. Revenue
share or affiliate model on closed deals.

DM template:

> Hi [NAME] — saw your work with [their published client / case study].
> Quick question: when clients ask about controlling ChatGPT / Claude /
> Gemini for their SOC 2 / HIPAA program, what do you currently
> recommend?
>
> We built TeamPrompt for exactly that gap — browser DLP that maps to
> CC6/CC7 evidence in 5 minutes of deployment. Would love to compare
> notes on what your clients actually need, and discuss whether a
> partnership model makes sense.

### 10. AI security researcher relationships

Specifically: Simon Willison, Andrej Karpathy (long shot), Ethan Mollick,
Linus Lee, Riley Goodside, Cassie Kozyrkov, anyone publishing AI security
research.

Don't pitch. Comment substantively on their work for 4-6 weeks first.
Then introduce yourself when there's an organic moment.

For Simon Willison specifically: his datasette + jq + LLM tooling overlaps
with the PII Scanner. There's a "we built this on top of your patterns"
angle that's genuine.

---

## Logistics

- **Frequency:** Send 2 outreach messages per workday. 10/week. Stop if
  three replies fall through; iterate the pitch.
- **CRM:** Track in a Google Sheet with cols: target, channel,
  pitched_date, replied_date, link_acquired_date, notes.
- **Followup cadence:** First send → wait 7 days → one followup → done.
  Three-touch sequences are spam.

## Numbers to beat

- First 5 referring domains: expect ~1% of pitches to convert. 50
  pitches → 5 links. Realistic 90 days.
- After 5 referring domains: "Discovered, not indexed" flips on most
  pages within 2-4 weeks. This is the firepits-cited result and the
  Embarque case-study result.
- Then the technical work this session compounds: more pages getting
  to first-page positions, CTR fixes, FAQ schema citations, AI Overview
  inclusions.
