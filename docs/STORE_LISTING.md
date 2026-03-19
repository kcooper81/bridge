# TeamPrompt — Store Listing Copy

## Short Description (132 characters max)
Access your team's approved AI prompt library, scan for sensitive data, and log conversations — right inside ChatGPT, Claude & more.

## Detailed Description

TeamPrompt brings your organization's AI prompt library directly into the tools your team uses every day — ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity.

**Why TeamPrompt?**

Your team uses AI daily, but without structure you get inconsistent outputs, leaked sensitive data, and zero visibility into what's being sent to AI tools. TeamPrompt fixes all three.

**Key Features:**

- **Prompt Library at Your Fingertips** — Search and insert your team's approved prompts with one click. No more copy-pasting from docs or Slack. Templates with fill-in variables make prompts reusable across contexts.

- **DLP (Data Loss Prevention) Scanning** — Before any message reaches an AI tool, TeamPrompt checks it against your organization's security rules. Sensitive content like API keys, customer data, or internal code names can be blocked or flagged automatically.

- **Conversation Logging** — Every interaction with AI tools is logged to your TeamPrompt dashboard, giving managers full visibility into how AI is being used across the team.

- **Works Everywhere** — Supports ChatGPT, Claude, Google Gemini, Microsoft Copilot, Perplexity, and more. Available as a popup or side panel for quick access.

- **Seamless Authentication** — Sign in once on teamprompt.app and the extension syncs your session automatically. No extra login needed.

- **Lightweight & Fast** — Under 55KB total. No bloat, no tracking, no ads.

**How It Works:**

1. Sign in with your TeamPrompt account
2. Click the extension icon or open the side panel
3. Search your team's prompt library
4. Click "Insert" to paste directly into any supported AI tool
5. DLP rules run automatically in the background

**Who Is It For?**

TeamPrompt is built for teams and organizations that want to standardize AI usage, prevent data leaks, and maintain visibility — without slowing anyone down.

Requires a TeamPrompt account. Visit https://teamprompt.app to get started.

## Category
- Chrome Web Store: **Productivity**
- Edge Add-ons: **Productivity**
- Firefox Add-ons: **Productivity** > **Workflow & Planning**

## Tags / Keywords
AI prompts, prompt management, ChatGPT, Claude, DLP, data loss prevention, AI governance, prompt library, team collaboration, enterprise AI

## Privacy Practices

**Single Purpose Description:**
TeamPrompt provides a centralized prompt library for teams, scans outbound text for sensitive data, and logs AI interactions for compliance — directly within AI chat tools.

**Data Usage Disclosures:**
- **Authentication tokens** — stored locally in browser extension storage to maintain your session. Never transmitted to third parties.
- **Prompt text** — sent to your organization's TeamPrompt server for DLP scanning. Never stored beyond your organization's logs.
- **AI interaction metadata** — tool name, timestamp, and action (sent/blocked/warned) logged to your TeamPrompt dashboard for compliance visibility.
- **No data sold to third parties.**
- **No data used for advertising.**
- **No analytics or telemetry collected by the extension itself.**

**Host Permissions Justification:**
- `chat.openai.com`, `chatgpt.com`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`, `perplexity.ai` — Required to inject prompts into AI tool input fields and monitor outbound text for DLP scanning.
- `teamprompt.app` — Required to sync authentication session from the web app to the extension.

**Permissions Justification:**
- `storage` — Store authentication tokens and user preferences locally
- `activeTab` — Read the current tab URL to detect which AI tool is active
- `alarms` — Periodically refresh authentication tokens in the background
- `sidePanel` (Chrome/Edge only) — Provide a persistent side panel UI for browsing prompts
