# Browser Extension Store Submission Guide

---

## Shared Copy

**Extension Name:** TeamPrompt — AI Prompt Manager & DLP Shield
**Version:** 1.0.0
**Author:** TeamPrompt
**Support Email:** support@teamprompt.app
**Homepage:** https://teamprompt.app
**Support:** https://teamprompt.app/help
**Privacy Policy:** https://teamprompt.app/privacy
**Terms of Service:** https://teamprompt.app/terms

**Short Description:**
Access your team's approved AI prompt library, scan for sensitive data, and log conversations — right inside ChatGPT, Claude & more.

**Single Purpose Statement:**
Access a shared team prompt library and scan outbound AI messages for sensitive data.

**Full Description:**
TeamPrompt is the prompt management platform for teams that use AI every day.

Instead of sharing prompts in Slack threads, Google Docs, or spreadsheets, your team gets a centralized library that works everywhere — right inside ChatGPT, Claude, Gemini, Copilot, and Perplexity.

Key features:
- Shared Prompt Library — Browse, search, and insert team prompts in one click
- Template Variables — Fill in dynamic fields like {{client_name}} before inserting
- DLP Guardrails — Automatically scan outbound text for sensitive data (SSNs, API keys, patient records, financial data)
- Quality Guidelines — Set organization-wide standards for prompt quality and consistency
- Usage Analytics — See which prompts get used, by whom, and where
- Side Panel & Popup — Access prompts from a persistent side panel or quick popup overlay
- Works Everywhere — ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity

Built for healthcare, legal, finance, government, and technology teams that need guardrails around AI usage.

Free plan available. No credit card required.

**Reviewer Test Instructions:**
1. Install the extension and click the TeamPrompt icon in the toolbar
2. Click "Create Free Account" and sign up with any email
3. After signing in, you'll see the prompt library with sample prompts
4. Navigate to chatgpt.com — the extension detects the AI tool automatically
5. Click any prompt to preview it, then click "Insert" to paste it into the chat input
6. Try a template prompt — fill in the variable fields, then insert
7. Open the side panel (right-click extension icon → "Open side panel") for persistent access
8. To test DLP: type a fake SSN (e.g., 123-45-6789) into the AI chat — the extension will flag it

**Permission Justifications:**
- `storage` — Store authentication tokens and user preferences locally
- `activeTab` — Read the current tab URL to detect which AI tool is active
- `alarms` — Periodically refresh authentication tokens in the background
- `sidePanel` — Provide a persistent side panel UI for browsing prompts (Chrome/Edge only)
- `chatgpt.com / chat.openai.com` — Inject prompts into ChatGPT and scan outbound text for sensitive data
- `claude.ai` — Inject prompts into Claude and scan outbound text for sensitive data
- `gemini.google.com` — Inject prompts into Gemini and scan outbound text for sensitive data
- `github.com/copilot` — Inject prompts into GitHub Copilot and scan outbound text for sensitive data
- `copilot.microsoft.com` — Inject prompts into Microsoft Copilot and scan outbound text for sensitive data
- `perplexity.ai` — Inject prompts into Perplexity and scan outbound text for sensitive data
- `teamprompt.app` — Sync authentication session from the web app dashboard

**Available Screenshots** (in `public/store-assets/`, all 1280 × 800 PNG):
1. `screenshot-1-login.png` — Sign-in screen
2. `screenshot-2-prompt-list.png` — Prompt library
3. `screenshot-3-insert.png` — Insert into AI tool
4. `screenshot-4-template.png` — Template variables
5. `screenshot-5-sidepanel.png` — Side panel view
6. `screenshot-6-dlp-block.png` — DLP block — sensitive data detected
7. `screenshot-7-warning.png` — Warning banner notification
8. `screenshot-8-session-loss.png` — Session loss protection banner
9. `screenshot-9-admin-dashboard.png` — Admin dashboard
10. `screenshot-10-admin-users.png` — Admin users
11. `screenshot-11-multi-ai.png` — Multi-AI tool support
12. `screenshot-12-dlp-rules.png` — DLP rules configuration
13. `screenshot-13-activity-log.png` — Activity & conversation audit log
14. `screenshot-light-1-prompts.png` — Prompt library (light mode)
15. `screenshot-light-2-dashboard.png` — Admin dashboard (light mode)
16. `screenshot-light-3-dlp-block.png` — DLP block on ChatGPT (light mode)
17. `screenshot-light-4-popup.png` — Extension popup (light mode)
18. `screenshot-light-5-template.png` — Template variables (light mode)
19. `screenshot-light-6-insert.png` — Insert prompt into ChatGPT (light mode)

**Promotional Images** (in `public/store-assets/`):
- `promo-small.png` — 440 × 280
- `promo-marquee.png` — 1400 × 560
- `social-hero.png` — 1200 × 630
- `promo-dlp.png` — 1400 × 560

---

## Chrome Web Store

**Developer Console:** https://chrome.google.com/webstore/devconsole
**Zip to upload:** `extension/dist/teamprompt-extension-1.0.0-chrome.zip` (run `npm run zip`)
**Store URL:** https://chromewebstore.google.com/detail/teamprompt/________ (fill in after approval)

**Category:** Productivity
**Language:** English (United States)
**Pricing:** Free

**Store Icon:** 128 × 128 PNG — use `extension/src/public/icons/icon-128.png`
**Small Promo Tile:** 440 × 280 PNG (required) — `promo-small.png`
**Marquee Promo:** 1400 × 560 PNG (optional) — `promo-marquee.png`
**Screenshots:** 1280 × 800 PNG, min 1, max 5

**Privacy Practices:**
- Does your extension collect user data? **Yes**
- What data do you collect? **Authentication information (login tokens), Website content (only scanned for sensitive data — never stored)**
- How is data used? **App functionality**
- Is data sold to third parties? **No**
- Is data transferred for purposes unrelated to the item's core functionality? **No**
- Certify data use complies with developer program policies? **Yes**

---

## Firefox Add-ons

**Developer Console:** https://addons.mozilla.org/en-US/developers/
**Zip to upload:** `extension/dist/teamprompt-extension-1.0.0-firefox.zip` (run `npm run zip:firefox`)
**Source code zip:** `extension/dist/teamprompt-extension-1.0.0-sources.zip` (auto-generated, upload if requested)
**Store URL:** https://addons.mozilla.org/en-US/firefox/addon/teamprompt/ (fill in after approval)

**Category 1:** Privacy & Security
**Category 2:** Search Tools
**Category 3:** — (skip, nothing else fits)
**Tags:** `productivity`, `privacy-and-security`, `search-tools`
**License:** All Rights Reserved
**Language:** English (US)

**Extension Icon:** 128 × 128 PNG — use `extension/src/public/icons/icon-128.png`
**Screenshots:** 1280 × 800 recommended, PNG/JPEG, optional, no hard limit

**Data Collection (already in manifest):**
```json
"data_collection_permissions": {
  "required": ["none"]
}
```

**Gecko ID:** `extension@teamprompt.app`
**Min Firefox Version:** 140.0

---

## Edge Add-ons

**Developer Console:** https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview
**Zip to upload:** Use the Chrome zip — `extension/dist/teamprompt-extension-1.0.0-chrome.zip`
**Store URL:** https://microsoftedge.microsoft.com/addons/detail/teamprompt/________ (fill in after approval)

**Category:** Productivity
**Language:** English (United States)

**Store Logo:** 300 × 300 PNG — **TODO: Create** (larger version of icon)
**Small Promo Tile:** 440 × 280 PNG (optional) — `promo-small.png`
**Large Promo:** 1400 × 560 PNG (optional) — `promo-marquee.png`
**Screenshots:** 1280 × 800 or 640 × 480, PNG/JPEG, min 1, max 10

**Privacy Statement:**
- Does the extension collect or use personal data? **The extension stores authentication tokens locally. Outbound text is scanned client-side for sensitive data patterns but is never transmitted to our servers.**
- Privacy policy URL: **https://teamprompt.app/privacy**

---

## TODO

- [ ] Create 300 × 300 store logo for Edge
- [ ] Take final screenshots at 1280 × 800 (or verify existing ones)
- [ ] Submit to Chrome Web Store
- [ ] Submit to Firefox Add-ons
- [ ] Submit to Edge Add-ons
- [ ] Update `src/lib/browser-detect.ts` with actual store URLs after approval
- [ ] Update `/extensions` marketing page with real store links
