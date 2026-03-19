# Chrome Web Store Submission Guide

## Store Listing Details

**Extension Name:** TeamPrompt - AI Prompt Manager for Teams

**Short Description** (132 chars max):
> Search, insert, and manage your team's AI prompts across ChatGPT, Claude, Gemini, Copilot, and Perplexity.

**Detailed Description:**
> TeamPrompt gives your team a shared prompt library that works inside every major AI tool.
>
> WHAT IT DOES:
> - Search your team's prompt library from inside ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity
> - Insert prompts with one click — no copy-pasting between tabs
> - Fill in template variables before insertion for customized prompts every time
> - DLP scanning catches sensitive data (credit cards, SSNs, API keys) before it reaches the AI tool
> - Usage logging shows which prompts get used, where, and by whom
>
> HOW IT WORKS:
> 1. Sign up at teamprompt.app and create your organization
> 2. Add prompts to your shared vault
> 3. Install this extension and sign in
> 4. Open any supported AI tool — your prompts are right there
>
> SUPPORTED AI TOOLS:
> - ChatGPT (chat.openai.com, chatgpt.com)
> - Claude (claude.ai)
> - Google Gemini (gemini.google.com)
> - Microsoft Copilot (copilot.microsoft.com)
> - Perplexity (perplexity.ai)
>
> FEATURES:
> - Shared prompt vault with search and filtering
> - Prompt templates with fill-in variables
> - DLP/guardrail scanning for sensitive data
> - Teams and role-based access (Admin, Manager, Member)
> - Usage analytics and audit logging
> - Side panel mode for persistent access
>
> PRIVACY:
> This extension only accesses page content on supported AI tool websites to insert prompts and scan for sensitive data. It does NOT collect browsing history, track you across sites, or sell any data. Full privacy policy at teamprompt.app/privacy
>
> Free to use. Paid plans available for larger teams at teamprompt.app/pricing

**Category:** Productivity

**Language:** English

**Privacy Policy URL:** https://teamprompt.app/privacy

---

## Required Images

### Extension Icons (already created)
Located at `extension/public/icons/`:
- [x] `icon-16.png` — 16x16px (toolbar, favicon)
- [x] `icon-32.png` — 32x32px (Windows computers)
- [x] `icon-48.png` — 48x48px (extensions page)
- [x] `icon-128.png` — 128x128px (Chrome Web Store, install dialog)

### Store Listing Images (NEED TO CREATE)

All images should be saved to `extension/store-assets/`.

#### Store Icon
- [ ] `store-icon-128.png` — **128x128px**, PNG
  - The main icon displayed in the Chrome Web Store
  - Should be the TeamPrompt logo on a solid or transparent background
  - No rounded corners (Chrome adds them automatically)

#### Screenshots (minimum 1, maximum 5, recommend all 5)
- **Size: 1280x800px** or **640x400px**, PNG or JPEG
- No borders, no device frames — just raw UI captures

- [ ] `screenshot-1-login.png` — **1280x800px**
  - The extension popup login screen (clean, shows the "Create Free Account" CTA)
  - Caption: "Clean sign-in with one-click account creation"

- [ ] `screenshot-2-prompt-list.png` — **1280x800px**
  - The extension popup showing a list of prompts (main view with search, tabs, cards)
  - Caption: "Browse and search your team's shared prompt library"

- [ ] `screenshot-3-insert.png` — **1280x800px**
  - The extension popup open next to ChatGPT or Claude, showing a prompt being inserted
  - Caption: "Insert prompts into ChatGPT, Claude, and more with one click"

- [ ] `screenshot-4-template.png` — **1280x800px**
  - The prompt detail view with template variable fields filled in
  - Caption: "Fill in template variables for customized prompts every time"

- [ ] `screenshot-5-sidepanel.png` — **1280x800px**
  - The side panel view open alongside an AI tool
  - Caption: "Use the side panel for persistent access while you work"

#### Promotional Images (optional but recommended)

- [ ] `promo-small.png` — **440x280px**, PNG
  - Small promotional tile (shown in search results and category pages)
  - TeamPrompt logo + tagline "Your team's AI prompt library — everywhere"
  - Dark background (#0f1117) with blue accent, clean and bold

- [ ] `promo-marquee.png` — **1400x560px**, PNG
  - Large marquee banner (shown at top of store listing if featured)
  - Show the app mockup with floating labels, tagline, and supported AI tool logos
  - Dark background with gradient mesh (match the website hero)

---

## How to Create Screenshots

Since the extension popup is 380px wide, screenshots need context. Best approach:

1. **Open a supported AI tool** (e.g., ChatGPT) in Chrome
2. **Open the extension popup** or side panel
3. **Take a full browser screenshot** at 1280x800 using Chrome DevTools:
   - Open DevTools → Cmd+Shift+P → "Capture screenshot" (at 1280x800 viewport)
   - Or use a screenshot tool that captures at exact dimensions
4. **Crop/compose** to show the extension popup overlaid on the AI tool

Alternatively, use a tool like Figma or Canva to compose mockup screenshots with the extension popup UI placed on top of AI tool backgrounds.

---

## Permissions Justification

Chrome Web Store requires justification for each permission:

| Permission | Justification |
|---|---|
| `storage` | Store authentication tokens and user preferences locally |
| `activeTab` | Detect which AI tool the user is on to enable prompt insertion |
| `alarms` | Refresh authentication tokens every 30 minutes to maintain session |
| `sidePanel` | Provide a persistent side panel view for browsing prompts |
| Host: `chat.openai.com/*`, `chatgpt.com/*` | Insert prompts into ChatGPT and scan messages for sensitive data |
| Host: `claude.ai/*` | Insert prompts into Claude and scan messages for sensitive data |
| Host: `gemini.google.com/*` | Insert prompts into Gemini and scan messages for sensitive data |
| Host: `copilot.microsoft.com/*` | Insert prompts into Microsoft Copilot and scan messages for sensitive data |
| Host: `www.perplexity.ai/*` | Insert prompts into Perplexity and scan messages for sensitive data |
| Host: `teamprompt.app/*` | Sync authentication session between the web app and extension |

---

## Submission Checklist

- [ ] All store listing images created and saved to `extension/store-assets/`
- [ ] Extension built and zipped: `cd extension && npm run build && cd dist/chrome-mv3 && zip -r ../../teamprompt-extension.zip .`
- [ ] Privacy policy published at https://teamprompt.app/privacy
- [ ] Terms of use published at https://teamprompt.app/terms
- [ ] Tested on all 5 supported AI tools
- [ ] Tested sign-up flow (extension → web → auth-bridge sync back)
- [ ] Tested email/password login in popup
- [ ] Tested DLP scanning
- [ ] Tested prompt insertion on each AI tool
- [ ] Tested side panel mode
- [ ] No console errors in background script
- [ ] Extension version in wxt.config.ts matches intended release version
- [ ] Chrome Developer Dashboard account set up ($5 one-time fee)
- [ ] Submit for review (typically 1-3 business days)

---

## Image Size Quick Reference

| Asset | Size | Format | Required |
|---|---|---|---|
| Extension icon | 16x16, 32x32, 48x48, 128x128 | PNG | Yes (all 4) |
| Store icon | 128x128 | PNG | Yes |
| Screenshots | 1280x800 or 640x400 | PNG/JPEG | Yes (min 1, max 5) |
| Small promo tile | 440x280 | PNG | No (recommended) |
| Marquee banner | 1400x560 | PNG | No (optional) |
