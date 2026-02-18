# Chrome Web Store Listing — TeamPrompt

Use the content below when submitting TeamPrompt to the Chrome Web Store.

---

## Extension Name

TeamPrompt — AI Prompt Manager & Security Guardrails

## Short Description (132 chars max)

Shared prompt library, real-time data-loss prevention, and audit logging for teams using ChatGPT, Claude, Gemini, Copilot & more.

## Detailed Description

TeamPrompt gives your team a shared prompt library, quality guidelines, and security guardrails — right inside the AI tools you already use.

**Prompt Library**
Access your team's best prompts without leaving ChatGPT, Claude, Gemini, or any supported AI tool. Browse, search, and insert prompts in one click. Stop reinventing the wheel — reuse what works.

**Security Guardrails**
Real-time scanning catches sensitive data before it's sent. TeamPrompt detects:
• Protected health information (PHI) for HIPAA compliance
• Personally identifiable information (PII) — SSNs, credit cards, addresses
• API keys, passwords, and secrets
• Attorney-client privileged content
• Financial data covered by SOX and PCI DSS

When a violation is detected, the extension warns the user or blocks the message entirely — depending on your organization's policy.

**Audit Logging**
Every AI interaction is logged: who used which tool, when, and whether a guardrail was triggered. Export logs for compliance audits, SIEM integration, or management reporting.

**Works With**
• ChatGPT (chat.openai.com & chatgpt.com)
• Claude (claude.ai)
• Google Gemini (gemini.google.com)
• Microsoft Copilot (copilot.microsoft.com)
• Perplexity (perplexity.ai)

**Enterprise Deployment**
Force-install via Google Admin Console, Microsoft Intune, or any MDM. Every managed browser gets guardrails on day one — zero employee setup required. Learn more at teamprompt.app/enterprise.

**Privacy**
When a guardrail is triggered, the extension sends the prompt text to TeamPrompt's server for scanning against your organization's security policies. Sensitive content is detected and blocked before it reaches any AI tool. TeamPrompt does not share your prompt content with third-party AI providers. Conversation metadata is logged for audit purposes when enabled by your admin.

Get started free at teamprompt.app

---

## Category

Productivity

## Language

English

---

## Store Listing Screenshots (5 required, 1280×800 or 640×400)

Prepare 5 screenshots showing:

1. **Prompt Library Popup** — The extension popup open on ChatGPT showing a list of team prompts with search and an "Insert" button. Caption: "Access your team's prompt library inside any AI tool."

2. **Guardrail Warning** — A blocked-message overlay on ChatGPT where the user tried to paste sensitive data (SSN pattern). The extension shows a red warning with "Sensitive data detected — message blocked." Caption: "Real-time data-loss prevention catches sensitive data before it's sent."

3. **Prompt Detail View** — The popup showing a single prompt expanded with full content, template variables, and tags. Caption: "Browse, search, and insert the best prompts in one click."

4. **Audit Log Dashboard** — The TeamPrompt web app showing the audit log table with columns: user, AI tool, timestamp, status (sent/blocked). Caption: "Full audit trail of every AI interaction across your team."

5. **Multiple AI Tools** — Split view or collage showing the extension active on Claude, Gemini, and Copilot (not just ChatGPT). Caption: "Works with ChatGPT, Claude, Gemini, Copilot, and Perplexity."

---

## Promotional Images

### Small Promo Tile (440×280)
- Dark background (#09090b) with subtle blue gradient
- TeamPrompt logo centered
- Tagline: "AI Prompt Management for Teams"
- Subtitle: "Shared prompts · Guardrails · Audit logs"

### Marquee Promo (1400×560)
- Dark background with the app mockup (sidebar + ChatGPT) on the right
- Left side: TeamPrompt logo, "Secure AI adoption for your team", and feature badges (DLP, Audit Log, Shared Prompts)

---

## Privacy Practices (Chrome Web Store Developer Dashboard)

### Single Purpose Description
TeamPrompt provides prompt management and data-loss prevention for teams using AI tools. The extension provides a popup for accessing shared prompts and scans outbound messages for sensitive data patterns.

### Permission Justifications

| Permission | Justification |
|---|---|
| `storage` | Stores user session tokens and configuration locally for authentication persistence. |
| `activeTab` | Reads the current AI tool page to insert prompts into the message input and scan outbound text for sensitive data. |
| `alarms` | Periodically refreshes the authentication token and syncs guardrail rules from the TeamPrompt server. |
| Host permissions (AI tool domains) | Content scripts insert prompts and scan outbound messages on supported AI tool websites. |
| Host permission (teamprompt.app) | The auth-bridge content script detects when the user is logged into the TeamPrompt web app and syncs the session to the extension, enabling seamless authentication. |

### Data Usage Disclosures

| Data Type | Collected? | Usage |
|---|---|---|
| Personally identifiable information | No | PII is detected via server-side scanning and blocked before reaching AI tools. Detected PII is not stored permanently. |
| Authentication information | Yes | Email and auth tokens are stored locally and sent to TeamPrompt servers for authentication. |
| Web history | No | The extension does not track browsing history. It only activates on supported AI tool domains. |
| User activity | Yes (optional) | If conversation logging is enabled by the admin, metadata (timestamp, AI tool name, blocked/allowed status) is sent to TeamPrompt servers. Prompt content is only sent if explicitly enabled. |

---

## Support & Contact

- Support URL: https://teamprompt.app/security
- Support email: support@teamprompt.app
