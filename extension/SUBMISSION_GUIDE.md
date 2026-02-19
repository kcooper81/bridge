# TeamPrompt Extension — Marketplace Submission Guide

## Build Artifacts (Ready to Upload)

All zip files are in `extension/dist/`:

| File | Store | Size |
|------|-------|------|
| `teamprompt-extension-1.0.0-chrome.zip` | Chrome Web Store | ~24 KB |
| `teamprompt-extension-1.0.0-edge.zip` | Microsoft Edge Add-ons | ~24 KB |
| `teamprompt-extension-1.0.0-firefox.zip` | Firefox Add-ons (AMO) | ~24 KB |
| `teamprompt-extension-1.0.0-sources.zip` | Firefox (source code, required by AMO) | ~75 KB |

---

## Screenshots Needed

Each store requires 1-5 screenshots at **1280x800** pixels (Chrome/Edge) or **up to any size** (Firefox).

### Screenshot List (take these in order):

1. **Login Screen** — Open the extension popup while logged out. Shows the branded sign-in page with Google/GitHub/email options.

2. **Prompt Library** — Log in, then capture the popup showing a list of prompts with the search bar. Have at least 3-5 prompts visible.

3. **Prompt Insertion** — Open ChatGPT or Claude, click a prompt, and capture the detail view with "Insert into AI Tool" button visible.

4. **DLP Block** — Type sensitive content (e.g., an API key) into ChatGPT and capture the red block overlay showing "Message Blocked by TeamPrompt."

5. **Side Panel (Chrome/Edge only)** — Open the side panel next to ChatGPT, showing the prompt library alongside the AI tool.

### How to Capture Screenshots:

1. Load the extension locally:
   - Chrome: `chrome://extensions` → Enable Developer Mode → Load Unpacked → select `extension/dist/chrome-mv3/`
   - Edge: `edge://extensions` → Enable Developer Mode → Load Unpacked → select `extension/dist/edge-mv3/`
   - Firefox: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `extension/dist/firefox-mv3/manifest.json`

2. Use Windows Snipping Tool (Win+Shift+S) or a screenshot extension to capture at 1280x800.

3. For the popup/sidepanel, right-click the popup → Inspect → resize viewport to standard width.

---

## Chrome Web Store Submission

**URL:** https://chrome.google.com/webstore/devconsole

### Requirements:
- [x] **Extension zip** — `teamprompt-extension-1.0.0-chrome.zip`
- [ ] **Store icon** — 128x128 PNG (use `extension/public/icons/icon-128.png`)
- [ ] **Screenshots** — At least 1, up to 5 (1280x800 recommended)
- [ ] **Promotional tile** — 440x280 PNG (optional but recommended for discovery)
- [ ] **Short description** — See STORE_LISTING.md (132 char limit)
- [ ] **Detailed description** — See STORE_LISTING.md
- [ ] **Category** — Productivity
- [ ] **Language** — English
- [ ] **Privacy policy URL** — https://teamprompt.app/privacy
- [ ] **Single purpose description** — See STORE_LISTING.md
- [ ] **Host permission justifications** — See STORE_LISTING.md
- [ ] **Permission justifications** — See STORE_LISTING.md

### Developer Account:
- One-time $5 registration fee at https://chrome.google.com/webstore/devconsole
- Review typically takes 1-3 business days

### Post-Publish:
- Copy the extension ID from the Chrome Web Store URL
- Add to `.env.local`: `NEXT_PUBLIC_CHROME_EXTENSION_ID=<the-id>`

---

## Microsoft Edge Add-ons Submission

**URL:** https://partner.microsoft.com/en-us/dashboard/microsoftedge

### Requirements:
- [x] **Extension zip** — `teamprompt-extension-1.0.0-edge.zip`
- [ ] **Store icon** — 300x300 PNG (resize icon-128.png or create from SVG)
- [ ] **Screenshots** — At least 1 (1280x800 recommended)
- [ ] **Short description** — See STORE_LISTING.md
- [ ] **Description** — See STORE_LISTING.md
- [ ] **Category** — Productivity
- [ ] **Privacy policy URL** — https://teamprompt.app/privacy
- [ ] **Website URL** — https://teamprompt.app
- [ ] **Support URL** — https://teamprompt.app/support or email

### Developer Account:
- Free Microsoft Partner Center account required
- Review typically takes 3-7 business days

### Post-Publish:
- Copy the extension ID from the Edge Add-ons dashboard
- Add to `.env.local`: `NEXT_PUBLIC_EDGE_EXTENSION_ID=<the-id>`

---

## Firefox Add-ons (AMO) Submission

**URL:** https://addons.mozilla.org/developers/

### Requirements:
- [x] **Extension zip** — `teamprompt-extension-1.0.0-firefox.zip`
- [x] **Source code zip** — `teamprompt-extension-1.0.0-sources.zip` (AMO may request this for review)
- [ ] **Icon** — 128x128 PNG (use `extension/public/icons/icon-128.png`)
- [ ] **Screenshots** — Optional but recommended
- [ ] **Summary** — See STORE_LISTING.md short description
- [ ] **Description** — See STORE_LISTING.md
- [ ] **Category** — Productivity > Workflow & Planning
- [ ] **Support email** — Your support email
- [ ] **Homepage** — https://teamprompt.app
- [ ] **Privacy policy URL** — https://teamprompt.app/privacy

### Developer Account:
- Free Firefox account required
- Review is manual and can take 1-4 weeks for first submission

### Notes:
- Firefox doesn't support `externally_connectable`, so the web app detection (PING/PONG) won't work for Firefox users — they'll see the install banner. This is acceptable.
- The sidebar replaces sidePanel functionality in Firefox.

---

## Edge Store Icon (300x300)

Edge requires a 300x300 store icon. Generate it:

```bash
cd extension
npx sharp-cli -i ../public/favicon.svg -o dist/edge-store-icon-300.png resize 300 300
```

---

## Promotional Tile (440x280) — Optional

Chrome Web Store shows a promotional tile in search results. You'll need to create this in a design tool (Figma, Canva, etc.) with:
- TeamPrompt logo and name
- Tagline: "Your team's AI prompt library — everywhere"
- Clean blue/white design matching brand colors (#2563EB)

---

## Post-Submission Checklist

After extensions are published on all stores:

1. [ ] Update `.env.local` with Chrome extension ID
2. [ ] Update `.env.local` with Edge extension ID
3. [ ] Deploy web app so extension detection works
4. [ ] Test extension detection on `/vault` (install banner should disappear)
5. [ ] Test extension status on `/team` page (should show "Active" badges)
6. [ ] Add Chrome Web Store link to website header/footer
7. [ ] Add Edge Add-ons link to website
8. [ ] Add Firefox Add-ons link to website
9. [ ] Update the extension install banner CTA with actual store links
