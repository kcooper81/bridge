const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const ASSETS_DIR = __dirname;

// ─── Load actual SVG logos ───
const LOGO_DARK_SVG = fs.readFileSync(
  path.join(__dirname, "..", "..", "public", "logo-dark.svg"),
  "utf-8"
);
// Dark logo mark (recolor white fills to dark) on white rounded box
const LOGO_DARK_MARK_SVG = LOGO_DARK_SVG.replace(/fill="white"/g, 'fill="#0f1219"');

// Inline SVG for use in HTML (white logo on dark bg, sized to fit)
function logoInline(size = 44) {
  return `<div style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;">
    ${LOGO_DARK_SVG.replace('<svg ', `<svg width="${size}" height="${size}" `)}
  </div>`;
}

// Icon version: dark logo on white rounded box (matches generate-icons.js style)
function logoIcon(size = 44) {
  const radius = Math.round(size * 0.22);
  const padding = Math.round(size * 0.10);
  const logoSize = size - padding * 2;
  return `<div style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;">
    <div style="width:${size}px;height:${size}px;background:#ffffff;border-radius:${radius}px;box-shadow:0 1px 4px rgba(0,0,0,0.15), inset 0 0 0 ${Math.max(1, Math.round(size * 0.02))}px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;">
      ${LOGO_DARK_MARK_SVG.replace('<svg ', `<svg width="${logoSize}" height="auto" style="width:${logoSize}px;height:auto;" `)}
    </div>
  </div>`;
}

// Small icon for toolbar
function logoIconSmall(size = 24) {
  return logoIcon(size);
}

// ─── Store Icon 128x128 ───
// Just copy the existing icon
function copyStoreIcon() {
  const src = path.join(__dirname, "..", "public", "icons", "icon-128.png");
  const dest = path.join(ASSETS_DIR, "store-icon-128.png");
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("✓ store-icon-128.png (copied from existing icon)");
  } else {
    console.log("✗ icon-128.png not found, skipping store icon copy");
  }
}

// ─── HTML Templates ───

const COLORS = {
  bg: "#080a10",
  card: "#101219",
  surface: "#141722",
  border: "#1e2132",
  borderLight: "#2a2e44",
  inputBg: "#1a1d2e",
  muted: "#1a1d2e",
  blue: "#3B82F6",
  blueLight: "#60a5fa",
  blueDark: "#2563eb",
  text: "#eaedf5",
  textSecondary: "#a0a5bd",
  textMuted: "#7f849c",
  textDim: "#5c6078",
  white: "#ffffff",
  green: "#34d399",
  red: "#f87171",
  purple: "#a855f7",
  amber: "#fbbf24",
  cyan: "#06b6d4",
  primarySurface: "rgba(59, 130, 246, 0.08)",
  primaryGlow: "rgba(59, 130, 246, 0.15)",
};

function baseHTML(width, height, body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    height: ${height}px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    overflow: hidden;
  }
  .popup {
    width: 380px;
    background: ${COLORS.bg};
    border-radius: 16px;
    border: 1px solid ${COLORS.border};
    box-shadow: 0 25px 60px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .popup-login {
    padding: 40px 24px 32px;
    text-align: center;
  }
  .popup-login .logo {
    width: 44px; height: 44px;
    margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center;
  }
  .popup-login h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
  .popup-login .tagline { color: ${COLORS.textSecondary}; font-size: 14px; margin-bottom: 8px; }
  .popup-login .subtitle { color: ${COLORS.textMuted}; font-size: 12px; line-height: 1.5; margin-bottom: 28px; }
  .btn-create {
    width: 100%; padding: 12px; border: none; border-radius: 16px;
    background: ${COLORS.blue}; color: white; font-weight: 600; font-size: 14px;
    margin-bottom: 4px;
  }
  .divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0 16px;
  }
  .divider::before, .divider::after {
    content: ""; flex: 1; height: 1px; background: ${COLORS.border};
  }
  .divider span {
    color: ${COLORS.textDim}; font-size: 11px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
  }
  .input {
    width: 100%; padding: 10px 12px; border: 1px solid ${COLORS.border};
    border-radius: 12px; background: ${COLORS.inputBg}; color: ${COLORS.textSecondary};
    font-size: 13px; margin-bottom: 10px;
  }
  .btn-signin {
    width: 100%; padding: 10px; border: 1px solid ${COLORS.border};
    border-radius: 12px; background: transparent; color: ${COLORS.text};
    font-weight: 500; font-size: 13px;
  }
  .web-link {
    color: ${COLORS.textDim}; font-size: 12px; margin-top: 16px; text-align: center;
  }
  .web-link a { color: ${COLORS.blue}; text-decoration: none; font-weight: 500; }

  /* Main view */
  .toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border-bottom: 1px solid ${COLORS.border};
    background: ${COLORS.card};
  }
  .toolbar-left { display: flex; align-items: center; gap: 8px; }
  .logo-sm {
    width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center;
  }
  .toolbar-title { font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }
  .search-wrap { padding: 10px 14px 0; }
  .search-input {
    width: 100%; padding: 8px 12px; border: 1px solid ${COLORS.border};
    border-radius: 12px; background: ${COLORS.inputBg}; color: ${COLORS.textSecondary}; font-size: 13px;
  }
  .tabs { display: flex; gap: 2px; padding: 10px 14px; }
  .tab {
    flex: 1; padding: 6px 10px; border: none; border-radius: 8px;
    background: transparent; color: ${COLORS.textMuted}; font-size: 12px; font-weight: 500;
    text-align: center;
  }
  .tab.active { background: ${COLORS.muted}; color: ${COLORS.text}; }
  .prompt-list { padding: 0 14px 14px; }
  .prompt-card {
    padding: 10px 12px; border: 1px solid ${COLORS.border}; border-radius: 12px;
    margin-bottom: 6px; background: ${COLORS.card};
  }
  .prompt-card-title { font-weight: 600; font-size: 13px; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
  .prompt-card-desc { color: ${COLORS.textMuted}; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .badge { font-size: 10px; padding: 1px 6px; border-radius: 6px; background: ${COLORS.primarySurface}; color: ${COLORS.blue}; font-weight: 500; }
  .tag { display: inline-block; font-size: 10px; padding: 1px 6px; border-radius: 6px; background: ${COLORS.muted}; color: ${COLORS.textSecondary}; margin-right: 4px; margin-top: 4px; }
  .status-bar { padding: 8px 14px; border-top: 1px solid ${COLORS.border}; font-size: 11px; color: ${COLORS.textMuted}; background: ${COLORS.card}; }

  /* Detail view */
  .detail-toolbar {
    display: flex; align-items: center; gap: 8px; padding: 10px 14px;
    border-bottom: 1px solid ${COLORS.border}; background: ${COLORS.card};
  }
  .back-icon { color: ${COLORS.textMuted}; font-size: 14px; }
  .detail-title { font-weight: 600; font-size: 14px; letter-spacing: -0.01em; }
  .detail-content {
    padding: 14px; font-size: 13px; line-height: 1.6; white-space: pre-wrap;
    background: ${COLORS.inputBg}; margin: 10px 14px; border-radius: 12px;
    border: 1px solid ${COLORS.border}; color: ${COLORS.textSecondary};
  }
  .template-fields { padding: 0 14px; margin-bottom: 10px; }
  .template-fields label { display: block; font-size: 12px; font-weight: 500; color: ${COLORS.textSecondary}; margin-bottom: 4px; margin-top: 8px; }
  .template-fields input {
    width: 100%; padding: 8px 12px; border: 1px solid ${COLORS.border};
    border-radius: 12px; background: ${COLORS.inputBg}; color: ${COLORS.text}; font-size: 13px;
  }
  .detail-actions { display: flex; gap: 8px; padding: 14px; }
  .detail-actions .btn-primary { flex: 1; padding: 10px; border: none; border-radius: 12px; background: ${COLORS.blue}; color: white; font-weight: 600; font-size: 13px; }
  .detail-actions .btn-secondary { flex: 1; padding: 10px; border: 1px solid ${COLORS.border}; border-radius: 12px; background: transparent; color: ${COLORS.text}; font-weight: 500; font-size: 13px; }

  /* AI tool background mockup */
  .ai-bg {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: #343541; display: flex; flex-direction: column;
  }
  .ai-header {
    padding: 12px 20px; border-bottom: 1px solid #444654;
    display: flex; align-items: center; gap: 10px;
  }
  .ai-header-logo { font-weight: 700; font-size: 16px; color: white; }
  .ai-chat { flex: 1; padding: 40px; display: flex; flex-direction: column; gap: 24px; overflow: hidden; }
  .ai-msg { max-width: 70%; padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
  .ai-msg.user { background: #2563eb; color: white; align-self: flex-end; }
  .ai-msg.assistant { background: #444654; color: #d1d5db; align-self: flex-start; }
  .ai-input-bar {
    padding: 16px 20px; border-top: 1px solid #444654;
    display: flex; align-items: center; gap: 12px;
  }
  .ai-input {
    flex: 1; padding: 12px 16px; border-radius: 12px; background: #40414f;
    border: 1px solid #565869; color: #d1d5db; font-size: 14px;
  }

  /* Sidepanel mockup */
  .sidepanel-container { display: flex; height: 100%; }
  .sidepanel-main { flex: 1; }
  .sidepanel-right {
    width: 380px; border-left: 1px solid ${COLORS.border};
    background: ${COLORS.bg}; display: flex; flex-direction: column;
  }
</style>
</head>
<body>${body}</body>
</html>`;
}

// Popup HTML for the login view
function popupLoginHTML() {
  return `
<div class="popup-login">
  <div class="logo">${logoIcon(44)}</div>
  <h1>TeamPrompt</h1>
  <p class="tagline">Your team's AI prompt library — everywhere.</p>
  <p class="subtitle">Search and insert shared prompts directly into ChatGPT, Claude, Gemini, and more.</p>
  <button class="btn-create">Create Free Account</button>
  <div class="divider"><span>already have an account?</span></div>
  <div class="input">Email</div>
  <div class="input">Password</div>
  <button class="btn-signin">Sign In</button>
  <p class="web-link">Use Google or GitHub? <a href="#">Sign in on teamprompt.app</a></p>
</div>`;
}

// Popup HTML for the main prompt list
function popupMainHTML() {
  return `
<div class="toolbar">
  <div class="toolbar-left">
    <div class="logo-sm">${logoIconSmall(24)}</div>
    <span class="toolbar-title">TeamPrompt</span>
  </div>
  <div style="display:flex;gap:4px;">
    <span style="color:${COLORS.textDim};font-size:14px;">&#9776;</span>
  </div>
</div>
<div class="search-wrap"><div class="search-input">Search prompts...</div></div>
<div class="tabs">
  <div class="tab active">All</div>
  <div class="tab">Templates</div>
  <div class="tab">Recent</div>
</div>
<div class="prompt-list">
  <div class="prompt-card">
    <div class="prompt-card-title">Customer Onboarding Prompt <span class="badge">Template</span></div>
    <div class="prompt-card-desc">Guide new customers through the onboarding process with...</div>
    <div><span class="tag">onboarding</span><span class="tag">customer</span></div>
  </div>
  <div class="prompt-card">
    <div class="prompt-card-title">Weekly Report Summary</div>
    <div class="prompt-card-desc">Summarize the key metrics and highlights from this week...</div>
    <div><span class="tag">reports</span><span class="tag">weekly</span></div>
  </div>
  <div class="prompt-card">
    <div class="prompt-card-title">Compliance Review Template <span class="badge">Template</span></div>
    <div class="prompt-card-desc">Review the following document for compliance with our...</div>
    <div><span class="tag">compliance</span><span class="tag">legal</span></div>
  </div>
  <div class="prompt-card">
    <div class="prompt-card-title">Sales Outreach Drafter</div>
    <div class="prompt-card-desc">Draft a personalized outreach email for a prospect in the...</div>
    <div><span class="tag">sales</span><span class="tag">email</span></div>
  </div>
</div>
<div class="status-bar">4 prompts</div>`;
}

// Popup HTML for template detail
function popupDetailHTML() {
  return `
<div class="detail-toolbar">
  <span class="back-icon">&#8592;</span>
  <span class="detail-title">Customer Onboarding Prompt</span>
</div>
<div class="detail-content">You are a customer success specialist at {{company_name}}.

Guide the new customer through their first week:

1. Welcome them and confirm their account setup
2. Walk through the core features relevant to their {{industry}} use case
3. Set up their first {{product_feature}}
4. Schedule a follow-up check-in for day 7

Tone: {{tone}} and helpful. Keep it concise.</div>
<div class="template-fields">
  <label>company_name</label>
  <input value="Acme Corp" />
  <label>industry</label>
  <input value="SaaS" />
  <label>product_feature</label>
  <input value="dashboard" />
  <label>tone</label>
  <input value="Friendly" />
</div>
<div class="detail-actions">
  <button class="btn-primary">Copy to Clipboard</button>
  <button class="btn-secondary">Insert into AI Tool</button>
</div>`;
}

// ─── Screenshot 1: Login ───
function screenshot1() {
  return baseHTML(1280, 800, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,${COLORS.bg},#1a1a2e);">
  <div style="text-align:center;">
    <div class="popup" style="margin:0 auto;">
      ${popupLoginHTML()}
    </div>
    <p style="color:${COLORS.textDim};font-size:13px;margin-top:24px;">Clean, focused sign-in with one-click account creation</p>
  </div>
</div>`);
}

// ─── Screenshot 2: Prompt List ───
function screenshot2() {
  return baseHTML(1280, 800, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,${COLORS.bg},#1a1a2e);">
  <div style="text-align:center;">
    <div class="popup" style="margin:0 auto;">
      ${popupMainHTML()}
    </div>
    <p style="color:${COLORS.textDim};font-size:13px;margin-top:24px;">Browse and search your team's shared prompt library</p>
  </div>
</div>`);
}

// ─── Screenshot 3: Insert into ChatGPT ───
function screenshot3() {
  return baseHTML(1280, 800, `
<div style="position:relative;height:100%;">
  <div class="ai-bg">
    <div class="ai-header">
      <div class="ai-header-logo">ChatGPT</div>
      <span style="color:#8e8ea0;font-size:13px;">GPT-4</span>
    </div>
    <div class="ai-chat">
      <div class="ai-msg user">Can you help me draft a customer onboarding email?</div>
      <div class="ai-msg assistant">Of course! I'd be happy to help you create a customer onboarding email. Could you tell me a bit about your company and the product or service the customer just signed up for?</div>
      <div class="ai-msg user">We're Acme Corp, a SaaS company. New customer just signed up for our analytics dashboard.</div>
    </div>
    <div class="ai-input-bar">
      <div class="ai-input">Message ChatGPT...</div>
    </div>
  </div>
  <div class="popup" style="position:absolute;top:60px;right:40px;z-index:10;">
    ${popupMainHTML()}
  </div>
</div>`);
}

// ─── Screenshot 4: Template Variables ───
function screenshot4() {
  return baseHTML(1280, 800, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,${COLORS.bg},#1a1a2e);">
  <div style="text-align:center;">
    <div class="popup" style="margin:0 auto;">
      ${popupDetailHTML()}
    </div>
    <p style="color:${COLORS.textDim};font-size:13px;margin-top:24px;">Fill in template variables for customized prompts every time</p>
  </div>
</div>`);
}

// ─── Screenshot 5: Side Panel ───
function screenshot5() {
  return baseHTML(1280, 800, `
<div class="sidepanel-container">
  <div class="sidepanel-main">
    <div class="ai-bg" style="position:relative;">
      <div class="ai-header">
        <div class="ai-header-logo">Claude</div>
        <span style="color:#8e8ea0;font-size:13px;">by Anthropic</span>
      </div>
      <div class="ai-chat">
        <div class="ai-msg user">Review this document for compliance with our data retention policy.</div>
        <div class="ai-msg assistant">I'll review the document against your data retention policy. Here are my findings:

1. Section 3.2 mentions storing customer data for "as long as needed" — this should specify a concrete retention period.

2. The backup policy in Section 5 doesn't mention encrypted backups, which your policy requires.

3. Section 7 on data deletion is compliant — it specifies 30-day deletion from active systems.</div>
      </div>
      <div class="ai-input-bar">
        <div class="ai-input">Reply to Claude...</div>
      </div>
    </div>
  </div>
  <div class="sidepanel-right">
    ${popupMainHTML()}
  </div>
</div>`);
}

// ─── Promo Small (440x280) ───
function promoSmall() {
  return baseHTML(440, 280, `
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 50%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.15),transparent 70%);"></div>
  <div style="position:absolute;bottom:-30px;left:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 70%);"></div>
  <div style="margin-bottom:16px;filter:drop-shadow(0 8px 32px rgba(37,99,235,0.3));">${logoIcon(56)}</div>
  <div style="font-size:22px;font-weight:800;color:white;margin-bottom:6px;">TeamPrompt</div>
  <div style="font-size:13px;color:${COLORS.textMuted};text-align:center;max-width:320px;line-height:1.4;">Your team's AI prompt library — everywhere.</div>
  <div style="display:flex;gap:8px;margin-top:18px;">
    <span style="font-size:10px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">ChatGPT</span>
    <span style="font-size:10px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Claude</span>
    <span style="font-size:10px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Gemini</span>
    <span style="font-size:10px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Copilot</span>
    <span style="font-size:10px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Perplexity</span>
  </div>
</div>`);
}

// ─── Promo Marquee (1400x560) ───
function promoMarquee() {
  return baseHTML(1400, 560, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-100px;right:200px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.12),transparent 60%);"></div>
  <div style="position:absolute;bottom:-80px;left:100px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.08),transparent 60%);"></div>

  <div style="display:flex;align-items:center;gap:80px;padding:0 80px;z-index:1;">
    <!-- Left: text -->
    <div style="flex:1;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
        <div style="filter:drop-shadow(0 8px 32px rgba(37,99,235,0.3));">${logoIcon(48)}</div>
        <span style="font-size:24px;font-weight:800;color:white;">TeamPrompt</span>
      </div>
      <div style="font-size:40px;font-weight:800;color:white;line-height:1.15;margin-bottom:16px;">
        Your team's prompts<br>deserve <span style="color:${COLORS.blueLight};">a system</span>
      </div>
      <div style="font-size:16px;color:${COLORS.textMuted};max-width:440px;line-height:1.5;margin-bottom:28px;">
        A shared library, quality guidelines, and security guardrails — so the best prompts get reused, not reinvented.
      </div>
      <div style="display:flex;gap:10px;">
        <span style="font-size:12px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">ChatGPT</span>
        <span style="font-size:12px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Claude</span>
        <span style="font-size:12px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Gemini</span>
        <span style="font-size:12px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Copilot</span>
        <span style="font-size:12px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">Perplexity</span>
      </div>
    </div>

    <!-- Right: mockup popup -->
    <div style="position:relative;">
      <div class="popup" style="width:360px;">
        ${popupMainHTML()}
      </div>
      <div style="position:absolute;top:-10px;right:-60px;background:rgba(37,99,235,0.1);border:1px solid rgba(37,99,235,0.2);color:${COLORS.blueLight};padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;">Marketing Team</div>
      <div style="position:absolute;top:35%;left:-70px;background:rgba(168,85,247,0.1);border:1px solid rgba(168,85,247,0.2);color:${COLORS.purple};padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;">Engineering</div>
      <div style="position:absolute;bottom:60px;right:-50px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);color:${COLORS.green};padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;">47 prompts shared</div>
      <div style="position:absolute;bottom:20px;left:-60px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:${COLORS.red};padding:6px 12px;border-radius:8px;font-size:12px;font-weight:500;">3 violations blocked</div>
    </div>
  </div>
</div>`);
}

// ─── SVG Icons for DLP overlays ───
const SVG_ICONS = {
  shieldX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
  shieldCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 16 10"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  triangleAlert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
};

// ChatGPT background with message bubbles (reusable for DLP screenshots)
function chatGPTBackground(inputText = "Message ChatGPT...") {
  return `
    <div class="ai-bg">
      <div class="ai-header">
        <div class="ai-header-logo">ChatGPT</div>
        <span style="color:#8e8ea0;font-size:13px;">GPT-4</span>
      </div>
      <div class="ai-chat">
        <div class="ai-msg user">Help me draft a follow-up email for our enterprise client Acme Corp.</div>
        <div class="ai-msg assistant">Of course! I'd be happy to help you draft a follow-up email. Could you provide some context about the recent interaction with Acme Corp?</div>
        <div class="ai-msg user">Sure — their API key is sk-proj-abc123def456 and the account contact is john@acme.com. The deal is worth $450K ARR and they need SSO integration by March.</div>
      </div>
      <div class="ai-input-bar">
        <div class="ai-input">${inputText}</div>
      </div>
    </div>`;
}

// Shield indicator element
function shieldIndicatorHTML(state = "protected", label = "3 rules active") {
  const colors = {
    protected: { border: "rgba(34,197,94,0.3)", dotColor: "#22c55e", iconColor: "#22c55e", dotShadow: "0 0 6px rgba(34,197,94,0.5)" },
    scanning: { border: "rgba(59,130,246,0.4)", dotColor: "#3b82f6", iconColor: "#3b82f6", dotShadow: "0 0 6px rgba(59,130,246,0.5)" },
    unprotected: { border: "rgba(245,158,11,0.3)", dotColor: "#f59e0b", iconColor: "#f59e0b", dotShadow: "0 0 6px rgba(245,158,11,0.5)" },
  };
  const c = colors[state] || colors.protected;
  return `
    <div style="position:fixed;bottom:20px;right:20px;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#18181b;border:1px solid ${c.border};border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#a1a1aa;z-index:999990;box-shadow:0 4px 16px rgba(0,0,0,0.4);">
      <div style="width:16px;height:16px;color:${c.iconColor};filter:drop-shadow(0 0 4px ${c.iconColor}40);">${SVG_ICONS.shield}</div>
      <span style="width:6px;height:6px;border-radius:50%;background:${c.dotColor};box-shadow:${c.dotShadow};flex-shrink:0;"></span>
      <span style="display:flex;flex-direction:column;gap:1px;">
        <span style="font-weight:600;color:#e4e4e7;font-size:11px;white-space:nowrap;">${label}</span>
        <span style="font-size:10px;color:#71717a;white-space:nowrap;">on ChatGPT</span>
      </span>
      <div style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;color:#52525b;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
    </div>`;
}

// ─── Screenshot 6: DLP Block Overlay ───
function screenshot6() {
  return baseHTML(1280, 800, `
<div style="position:relative;height:100%;">
  ${chatGPTBackground()}
  ${shieldIndicatorHTML("protected", "3 rules active")}
  <!-- Block overlay -->
  <div style="position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999999;display:flex;align-items:center;justify-content:center;">
    <div style="background:#18181b;color:#e4e4e7;border:1px solid #ef4444;border-radius:12px;padding:24px;max-width:420px;width:90%;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
      <div style="color:#ef4444;margin-bottom:8px;width:28px;height:28px;">${SVG_ICONS.shieldX}</div>
      <h3 style="font-size:16px;font-weight:600;margin-bottom:8px;color:#fca5a5;">Message Blocked by TeamPrompt</h3>
      <p style="font-size:13px;color:#a1a1aa;margin-bottom:8px;">Sensitive data was detected in your message:</p>
      <ul style="list-style:none;padding:0;margin:8px 0;">
        <li style="padding:6px 10px;background:#27272a;border-radius:6px;font-size:12px;margin-bottom:4px;"><strong style="color:#ef4444;">API Key Detection</strong>: sk-proj-abc123def456</li>
        <li style="padding:6px 10px;background:#27272a;border-radius:6px;font-size:12px;margin-bottom:4px;"><strong style="color:#ef4444;">Email Address (PII)</strong>: john@acme.com</li>
        <li style="padding:6px 10px;background:#27272a;border-radius:6px;font-size:12px;margin-bottom:4px;"><strong style="color:#ef4444;">Financial Data</strong>: $450K ARR</li>
      </ul>
      <p style="font-size:12px;color:#71717a;">Remove the flagged content and try again.</p>
      <button style="margin-top:12px;padding:8px 20px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Got it</button>
    </div>
  </div>
</div>`);
}

// ─── Screenshot 7: Warning Banner ───
function screenshot7() {
  return baseHTML(1280, 800, `
<div style="position:relative;height:100%;">
  ${chatGPTBackground()}
  ${shieldIndicatorHTML("protected", "3 rules active")}
  <!-- Warning banner -->
  <div style="position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#422006;color:#fbbf24;border:1px solid #854d0e;padding:8px 16px;border-radius:8px;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;z-index:999999;display:flex;align-items:center;gap:12px;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
    <span style="display:flex;align-items:center;gap:6px;">
      <span style="width:16px;height:16px;display:inline-flex;flex-shrink:0;">${SVG_ICONS.triangleAlert}</span>
      TeamPrompt: 2 warning(s) — Informal Tone Detected, Client Name Shared
    </span>
    <button style="background:none;border:1px solid #854d0e;color:#fbbf24;padding:4px 10px;border-radius:6px;font-size:12px;cursor:pointer;">Dismiss</button>
  </div>
</div>`);
}

// ─── Screenshot 8: Session Loss Banner (Undismissable) ───
function screenshot8() {
  return baseHTML(1280, 800, `
<div style="position:relative;height:100%;">
  ${chatGPTBackground()}
  <!-- Shield in inactive state -->
  <div style="position:fixed;bottom:20px;right:20px;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#18181b;border:1px solid #27272a;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;color:#a1a1aa;z-index:999990;box-shadow:0 4px 16px rgba(0,0,0,0.4);opacity:0.6;cursor:pointer;">
    <div style="width:16px;height:16px;color:#71717a;">${SVG_ICONS.shield}</div>
    <span style="width:6px;height:6px;border-radius:50%;background:#71717a;flex-shrink:0;"></span>
    <span style="display:flex;flex-direction:column;gap:1px;">
      <span style="font-weight:600;color:#e4e4e7;font-size:11px;white-space:nowrap;">Not signed in</span>
      <span style="font-size:10px;color:#71717a;white-space:nowrap;">on ChatGPT</span>
    </span>
  </div>
  <!-- Session loss banner — no dismiss button -->
  <div style="position:fixed;top:0;left:0;right:0;background:#7f1d1d;color:#fecaca;padding:10px 16px;font-size:13px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;z-index:999998;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
    <span style="font-weight:600;">TeamPrompt protection paused \u2014 Sign in to restore guardrails</span>
    <div style="display:flex;gap:8px;flex-shrink:0;">
      <button style="padding:5px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:#dc2626;color:white;">Sign In</button>
    </div>
  </div>
</div>`);
}

// ─── Screenshot 9: Admin Dashboard (Web App) ───
function screenshot9() {
  const adminBg = "#09090b";
  const cardBg = "#0f0f11";
  const borderClr = "#27272a";
  return baseHTML(1280, 800, `
<div style="display:flex;height:100%;background:${adminBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Sidebar -->
  <div style="width:240px;background:${cardBg};border-right:1px solid ${borderClr};padding:20px 16px;display:flex;flex-direction:column;gap:4px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:0 8px;">
      ${logoIcon(32)}
      <span style="font-size:16px;font-weight:700;color:white;">TeamPrompt</span>
    </div>
    <div style="padding:8px 12px;border-radius:8px;background:rgba(59,130,246,0.1);color:#60a5fa;font-size:13px;font-weight:500;">Dashboard</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Organizations</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Users</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Subscriptions</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Support Tickets</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Error Logs</div>
  </div>

  <!-- Main content -->
  <div style="flex:1;padding:32px;overflow:hidden;">
    <h1 style="font-size:24px;font-weight:700;color:white;margin-bottom:4px;">Admin Dashboard</h1>
    <p style="font-size:14px;color:#71717a;margin-bottom:24px;">Platform overview and key metrics</p>

    <!-- Key Metrics Row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
      <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#a1a1aa;">MRR</span><span style="color:#71717a;font-size:14px;">$</span></div>
        <div style="font-size:24px;font-weight:700;color:white;">$2,847</div>
        <div style="font-size:12px;color:#71717a;margin-top:4px;">$34,164 ARR</div>
      </div>
      <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#a1a1aa;">Organizations</span></div>
        <div style="font-size:24px;font-weight:700;color:white;">42</div>
        <div style="font-size:12px;color:#22c55e;margin-top:4px;">+3 this week (+18%)</div>
      </div>
      <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#a1a1aa;">Total Users</span></div>
        <div style="font-size:24px;font-weight:700;color:white;">189</div>
        <div style="font-size:12px;color:#71717a;margin-top:4px;">4.5 avg per org</div>
      </div>
      <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;padding:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:13px;color:#a1a1aa;">Total Prompts</span></div>
        <div style="font-size:24px;font-weight:700;color:white;">1,247</div>
        <div style="font-size:12px;color:#71717a;margin-top:4px;">29.7 avg per org</div>
      </div>
    </div>

    <!-- Protection Coverage Card -->
    <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <div style="width:20px;height:20px;color:#a1a1aa;">${SVG_ICONS.shield}</div>
        <span style="font-size:16px;font-weight:600;color:white;">Protection Coverage</span>
      </div>
      <p style="font-size:13px;color:#71717a;margin-bottom:16px;">Extension protection status across all users</p>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;">
        <div style="text-align:center;padding:16px;background:rgba(34,197,94,0.1);border-radius:8px;">
          <div style="font-size:24px;font-weight:700;color:white;">127</div>
          <div style="font-size:13px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span> Protected
          </div>
        </div>
        <div style="text-align:center;padding:16px;background:rgba(161,161,170,0.08);border-radius:8px;">
          <div style="font-size:24px;font-weight:700;color:white;">31</div>
          <div style="font-size:13px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#71717a;"></span> Inactive
          </div>
        </div>
        <div style="text-align:center;padding:16px;background:rgba(239,68,68,0.1);border-radius:8px;">
          <div style="font-size:24px;font-weight:700;color:white;">8</div>
          <div style="font-size:13px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;"></span> Unprotected
          </div>
        </div>
        <div style="text-align:center;padding:16px;background:rgba(161,161,170,0.08);border-radius:8px;">
          <div style="font-size:24px;font-weight:700;color:white;">23</div>
          <div style="font-size:13px;color:#a1a1aa;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#71717a;"></span> No Extension
          </div>
        </div>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;">
          <span style="color:#a1a1aa;">Active protection rate</span>
          <span style="color:white;font-weight:500;">67%</span>
        </div>
        <div style="height:8px;border-radius:4px;background:#27272a;overflow:hidden;">
          <div style="height:100%;width:67%;border-radius:4px;background:#22c55e;"></div>
        </div>
      </div>
    </div>
  </div>
</div>`);
}

// ─── Screenshot 10: Admin Users Page with Protection Badges ───
function screenshot10() {
  const adminBg = "#09090b";
  const cardBg = "#0f0f11";
  const borderClr = "#27272a";
  const rows = [
    { name: "Sarah Chen", email: "sarah@acme.com", org: "Acme Corp", role: "admin", status: "protected", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>Protected</span>' },
    { name: "James Wilson", email: "james@acme.com", org: "Acme Corp", role: "member", status: "protected", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>Protected</span>' },
    { name: "Maria Garcia", email: "maria@globex.io", org: "Globex Inc", role: "admin", status: "unprotected", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#fca5a5;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;"></span>Unprotected</span>' },
    { name: "Alex Turner", email: "alex@globex.io", org: "Globex Inc", role: "member", status: "inactive", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#71717a;"></span>Inactive</span>' },
    { name: "Priya Patel", email: "priya@initech.com", org: "Initech", role: "manager", status: "protected", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>Protected</span>' },
    { name: "Tom Baker", email: "tom@initech.com", org: "Initech", role: "member", status: "noext", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#71717a;"></span>No Extension</span>' },
    { name: "Lisa Kim", email: "lisa@stark.dev", org: "Stark Labs", role: "admin", status: "unprotected", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:#fca5a5;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;"></span>Unprotected</span>' },
    { name: "David Brown", email: "david@stark.dev", org: "Stark Labs", role: "member", status: "protected", badge: '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;"></span>Protected</span>' },
  ];
  const tableRows = rows.map((r, i) => `
    <tr style="border-bottom:1px solid ${borderClr};${r.status === 'unprotected' ? 'background:rgba(239,68,68,0.04);' : ''}">
      <td style="padding:10px 14px;font-weight:500;color:white;font-size:13px;">${r.name}</td>
      <td style="padding:10px 14px;color:#71717a;font-size:13px;">${r.email}</td>
      <td style="padding:10px 14px;font-size:13px;"><a style="color:#60a5fa;text-decoration:none;">${r.org}</a></td>
      <td style="padding:10px 14px;"><span style="font-size:11px;padding:2px 8px;border:1px solid ${borderClr};border-radius:6px;color:#a1a1aa;text-transform:capitalize;">${r.role}</span></td>
      <td style="padding:10px 14px;">${r.badge}</td>
      <td style="padding:10px 14px;color:#71717a;font-size:13px;">${['Jan 15', 'Feb 3', 'Jan 22', 'Dec 10', 'Feb 1', 'Jan 28', 'Feb 8', 'Jan 19'][i]}, 2025</td>
    </tr>`).join("");

  return baseHTML(1280, 800, `
<div style="display:flex;height:100%;background:${adminBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Sidebar -->
  <div style="width:240px;background:${cardBg};border-right:1px solid ${borderClr};padding:20px 16px;display:flex;flex-direction:column;gap:4px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:0 8px;">
      ${logoIcon(32)}
      <span style="font-size:16px;font-weight:700;color:white;">TeamPrompt</span>
    </div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Dashboard</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Organizations</div>
    <div style="padding:8px 12px;border-radius:8px;background:rgba(59,130,246,0.1);color:#60a5fa;font-size:13px;font-weight:500;">Users</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Subscriptions</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Support Tickets</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Error Logs</div>
  </div>

  <!-- Main content -->
  <div style="flex:1;padding:32px;overflow:hidden;">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:white;margin-bottom:4px;">Users</h1>
        <p style="font-size:14px;color:#71717a;">189 users across all organizations</p>
      </div>
      <button style="padding:8px 14px;border:1px solid ${borderClr};border-radius:8px;background:transparent;color:#a1a1aa;font-size:13px;cursor:pointer;">Export CSV</button>
    </div>

    <!-- Filters -->
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <div style="flex:1;padding:8px 12px;border:1px solid ${borderClr};border-radius:8px;background:${cardBg};color:#71717a;font-size:13px;">Search by name or email...</div>
      <button style="padding:6px 12px;border:1px solid ${borderClr};border-radius:8px;background:transparent;color:#a1a1aa;font-size:12px;display:flex;align-items:center;gap:6px;">
        <span style="width:14px;height:14px;display:inline-flex;">${SVG_ICONS.shield}</span> Super Admins
      </button>
      <button style="padding:6px 12px;border:none;border-radius:8px;background:#dc2626;color:white;font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px;">
        <span style="width:14px;height:14px;display:inline-flex;">${SVG_ICONS.shieldX}</span> Unprotected
      </button>
    </div>

    <!-- Table -->
    <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="border-bottom:1px solid ${borderClr};background:rgba(255,255,255,0.02);">
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Name</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Email</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Organization</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Role</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Protection</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Joined</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  </div>
</div>`);
}

// ─── Screenshot 11: Multi-AI Tool Support ───
function screenshot11() {
  return baseHTML(1280, 800, `
<div style="display:flex;flex-direction:column;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 50%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-60px;right:100px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 60%);"></div>

  <!-- Header -->
  <div style="padding:40px 60px 20px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:12px;">
      ${logoIcon(36)}
      <span style="font-size:20px;font-weight:700;color:white;">TeamPrompt</span>
    </div>
    <h2 style="font-size:28px;font-weight:800;color:white;margin-bottom:6px;">Works everywhere your team uses AI</h2>
    <p style="font-size:14px;color:${COLORS.textMuted};">One extension, five platforms — prompt library & DLP protection on every tool</p>
  </div>

  <!-- AI tool cards grid -->
  <div style="display:flex;gap:16px;padding:24px 60px;flex:1;align-items:stretch;">
    ${[
      { name: "ChatGPT", color: "#10a37f", msg: "Draft a Q3 board report with revenue projections...", shield: "3 rules active" },
      { name: "Claude", color: "#d4a27f", msg: "Review this contract for GDPR compliance issues...", shield: "3 rules active" },
      { name: "Gemini", color: "#4285f4", msg: "Analyze customer churn data from last quarter...", shield: "3 rules active" },
      { name: "Copilot", color: "#7b83eb", msg: "Summarize the engineering sprint retrospective...", shield: "3 rules active" },
      { name: "Perplexity", color: "#20b2aa", msg: "Research competitor pricing in the B2B SaaS space...", shield: "3 rules active" },
    ].map(tool => `
      <div style="flex:1;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;overflow:hidden;display:flex;flex-direction:column;">
        <div style="padding:10px 14px;border-bottom:1px solid ${COLORS.border};display:flex;align-items:center;gap:8px;">
          <span style="width:8px;height:8px;border-radius:50%;background:${tool.color};"></span>
          <span style="font-size:13px;font-weight:600;color:white;">${tool.name}</span>
        </div>
        <div style="flex:1;padding:12px;display:flex;flex-direction:column;justify-content:space-between;">
          <div style="background:rgba(37,99,235,0.15);border-radius:8px;padding:8px 10px;font-size:11px;color:${COLORS.textSecondary};line-height:1.4;align-self:flex-end;max-width:90%;">${tool.msg}</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:auto;padding-top:8px;">
            <span style="width:5px;height:5px;border-radius:50%;background:#22c55e;box-shadow:0 0 4px rgba(34,197,94,0.5);"></span>
            <span style="font-size:9px;color:#22c55e;font-weight:500;">${tool.shield}</span>
          </div>
        </div>
      </div>
    `).join("")}
  </div>
</div>`);
}

// ─── Screenshot 12: DLP Rules Configuration (Web App) ───
function screenshot12() {
  const adminBg = "#09090b";
  const cardBg = "#0f0f11";
  const borderClr = "#27272a";
  const rules = [
    { name: "API Key Detection", pattern: "sk-[a-zA-Z0-9]{20,}", category: "Secrets", severity: "Block", enabled: true, color: "#ef4444" },
    { name: "Email Address (PII)", pattern: "[a-z]+@[a-z]+\\.[a-z]{2,}", category: "PII", severity: "Block", enabled: true, color: "#ef4444" },
    { name: "Social Security Number", pattern: "\\d{3}-\\d{2}-\\d{4}", category: "PII", severity: "Block", enabled: true, color: "#ef4444" },
    { name: "Credit Card Number", pattern: "\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}", category: "Financial", severity: "Block", enabled: true, color: "#ef4444" },
    { name: "Internal Project Names", pattern: "Project (Phoenix|Titan|Atlas)", category: "Confidential", severity: "Warn", enabled: true, color: "#f59e0b" },
    { name: "Client Revenue Data", pattern: "\\$[0-9,]+[KMB]? (ARR|MRR|revenue)", category: "Financial", severity: "Warn", enabled: true, color: "#f59e0b" },
    { name: "Patient Health Info (PHI)", pattern: "diagnosis|medication|treatment plan", category: "HIPAA", severity: "Block", enabled: true, color: "#ef4444" },
    { name: "Source Code Fragments", pattern: "function |class |import .* from", category: "IP", severity: "Warn", enabled: false, color: "#71717a" },
  ];

  return baseHTML(1280, 800, `
<div style="display:flex;height:100%;background:${adminBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Sidebar -->
  <div style="width:240px;background:${cardBg};border-right:1px solid ${borderClr};padding:20px 16px;display:flex;flex-direction:column;gap:4px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:0 8px;">
      ${logoIcon(32)}
      <span style="font-size:16px;font-weight:700;color:white;">TeamPrompt</span>
    </div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Prompt Library</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Templates</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Team Members</div>
    <div style="padding:8px 12px;border-radius:8px;background:rgba(59,130,246,0.1);color:#60a5fa;font-size:13px;font-weight:500;">Security Rules</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Activity Log</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Settings</div>
  </div>

  <!-- Main content -->
  <div style="flex:1;padding:32px;overflow:hidden;">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:white;margin-bottom:4px;">Security Rules</h1>
        <p style="font-size:14px;color:#71717a;">DLP rules that scan outbound messages for sensitive data before they reach AI tools</p>
      </div>
      <button style="padding:8px 16px;border:none;border-radius:8px;background:#2563eb;color:white;font-size:13px;font-weight:600;cursor:pointer;">+ Add Rule</button>
    </div>

    <!-- Stats bar -->
    <div style="display:flex;gap:16px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);">
        <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;"></span>
        <span style="font-size:12px;color:#22c55e;font-weight:500;">7 active rules</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);">
        <span style="font-size:12px;color:#fca5a5;font-weight:500;">5 block &middot; 2 warn</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;background:rgba(161,161,170,0.08);border:1px solid ${borderClr};">
        <span style="font-size:12px;color:#a1a1aa;">1 disabled</span>
      </div>
    </div>

    <!-- Rules table -->
    <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="border-bottom:1px solid ${borderClr};background:rgba(255,255,255,0.02);">
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;width:30px;"></th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Rule Name</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Pattern</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Category</th>
            <th style="text-align:left;padding:10px 14px;font-weight:500;color:#a1a1aa;font-size:12px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rules.map(r => `
            <tr style="border-bottom:1px solid ${borderClr};${!r.enabled ? 'opacity:0.45;' : ''}">
              <td style="padding:10px 14px;">
                <div style="width:18px;height:10px;border-radius:5px;background:${r.enabled ? '#22c55e' : '#3f3f46'};position:relative;">
                  <div style="width:8px;height:8px;border-radius:50%;background:white;position:absolute;top:1px;${r.enabled ? 'right:1px;' : 'left:1px;'}"></div>
                </div>
              </td>
              <td style="padding:10px 14px;font-weight:500;color:white;">${r.name}</td>
              <td style="padding:10px 14px;font-family:monospace;font-size:11px;color:#71717a;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.pattern}</td>
              <td style="padding:10px 14px;"><span style="font-size:11px;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid ${borderClr};color:#a1a1aa;">${r.category}</span></td>
              <td style="padding:10px 14px;"><span style="font-size:11px;padding:2px 8px;border-radius:6px;background:${r.severity === 'Block' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'};color:${r.color};font-weight:500;">${r.severity}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  </div>
</div>`);
}

// ─── Screenshot 13: Activity / Conversation Audit Log ───
function screenshot13() {
  const adminBg = "#09090b";
  const cardBg = "#0f0f11";
  const borderClr = "#27272a";
  const logs = [
    { time: "2:34 PM", user: "Sarah Chen", tool: "ChatGPT", action: "blocked", rule: "API Key Detection", snippet: "...the key is sk-proj-abc123def...", color: "#ef4444", bg: "rgba(239,68,68,0.06)" },
    { time: "2:31 PM", user: "James Wilson", tool: "Claude", action: "sent", rule: "", snippet: "Draft a marketing email for the Q3 campaign...", color: "#22c55e", bg: "transparent" },
    { time: "2:28 PM", user: "Maria Garcia", tool: "ChatGPT", action: "warned", rule: "Client Name Shared", snippet: "...Globex Inc signed a $2M deal with...", color: "#f59e0b", bg: "rgba(245,158,11,0.04)" },
    { time: "2:25 PM", user: "Priya Patel", tool: "Gemini", action: "sent", rule: "", snippet: "Summarize the key findings from this research paper...", color: "#22c55e", bg: "transparent" },
    { time: "2:22 PM", user: "Alex Turner", tool: "ChatGPT", action: "blocked", rule: "SSN Detection", snippet: "...patient SSN is 456-78-9012 and the...", color: "#ef4444", bg: "rgba(239,68,68,0.06)" },
    { time: "2:18 PM", user: "Lisa Kim", tool: "Claude", action: "sent", rule: "", snippet: "Help me create a Python script for data analysis...", color: "#22c55e", bg: "transparent" },
    { time: "2:15 PM", user: "Tom Baker", tool: "Copilot", action: "warned", rule: "Source Code", snippet: "...import { authService } from '../services/...", color: "#f59e0b", bg: "rgba(245,158,11,0.04)" },
    { time: "2:12 PM", user: "David Brown", tool: "ChatGPT", action: "sent", rule: "", snippet: "Explain the difference between REST and GraphQL...", color: "#22c55e", bg: "transparent" },
  ];

  return baseHTML(1280, 800, `
<div style="display:flex;height:100%;background:${adminBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <!-- Sidebar -->
  <div style="width:240px;background:${cardBg};border-right:1px solid ${borderClr};padding:20px 16px;display:flex;flex-direction:column;gap:4px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:0 8px;">
      ${logoIcon(32)}
      <span style="font-size:16px;font-weight:700;color:white;">TeamPrompt</span>
    </div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Prompt Library</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Templates</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Team Members</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Security Rules</div>
    <div style="padding:8px 12px;border-radius:8px;background:rgba(59,130,246,0.1);color:#60a5fa;font-size:13px;font-weight:500;">Activity Log</div>
    <div style="padding:8px 12px;border-radius:8px;color:#71717a;font-size:13px;">Settings</div>
  </div>

  <!-- Main content -->
  <div style="flex:1;padding:32px;overflow:hidden;">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;color:white;margin-bottom:4px;">Activity Log</h1>
        <p style="font-size:14px;color:#71717a;">Real-time feed of all AI interactions across your organization</p>
      </div>
      <div style="display:flex;gap:8px;">
        <div style="padding:6px 12px;border:1px solid ${borderClr};border-radius:8px;font-size:12px;color:#a1a1aa;">Today</div>
        <div style="padding:6px 12px;border:none;border-radius:8px;background:#dc2626;font-size:12px;color:white;font-weight:500;">2 blocked</div>
      </div>
    </div>

    <!-- Summary stats -->
    <div style="display:flex;gap:12px;margin-bottom:20px;">
      <div style="padding:10px 16px;border-radius:8px;background:${cardBg};border:1px solid ${borderClr};display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;font-weight:700;color:white;">47</span>
        <span style="font-size:12px;color:#71717a;">messages<br>today</span>
      </div>
      <div style="padding:10px 16px;border-radius:8px;background:${cardBg};border:1px solid ${borderClr};display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;font-weight:700;color:#22c55e;">43</span>
        <span style="font-size:12px;color:#71717a;">allowed</span>
      </div>
      <div style="padding:10px 16px;border-radius:8px;background:${cardBg};border:1px solid ${borderClr};display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;font-weight:700;color:#f59e0b;">2</span>
        <span style="font-size:12px;color:#71717a;">warnings</span>
      </div>
      <div style="padding:10px 16px;border-radius:8px;background:${cardBg};border:1px solid ${borderClr};display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;font-weight:700;color:#ef4444;">2</span>
        <span style="font-size:12px;color:#71717a;">blocked</span>
      </div>
    </div>

    <!-- Log entries -->
    <div style="background:${cardBg};border:1px solid ${borderClr};border-radius:12px;overflow:hidden;">
      ${logs.map(l => `
        <div style="padding:12px 16px;border-bottom:1px solid ${borderClr};display:flex;align-items:center;gap:14px;background:${l.bg};">
          <span style="font-size:11px;color:#52525b;font-family:monospace;white-space:nowrap;width:56px;">${l.time}</span>
          <span style="width:6px;height:6px;border-radius:50%;background:${l.color};flex-shrink:0;"></span>
          <span style="font-size:13px;color:white;font-weight:500;width:110px;flex-shrink:0;">${l.user}</span>
          <span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,0.05);border:1px solid ${borderClr};color:#a1a1aa;flex-shrink:0;">${l.tool}</span>
          <span style="font-size:11px;padding:2px 6px;border-radius:4px;color:${l.color};font-weight:500;flex-shrink:0;text-transform:capitalize;">${l.action}</span>
          ${l.rule ? `<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:rgba(239,68,68,0.1);color:#fca5a5;flex-shrink:0;">${l.rule}</span>` : ''}
          <span style="font-size:12px;color:#52525b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${l.snippet}</span>
        </div>
      `).join("")}
    </div>
  </div>
</div>`);
}

// ─── Social/OG Hero Banner (1200x630) ───
function socialHero() {
  return baseHTML(1200, 630, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-80px;right:150px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.12),transparent 60%);"></div>
  <div style="position:absolute;bottom:-60px;left:80px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.08),transparent 60%);"></div>
  <div style="position:absolute;top:30%;right:10%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,0.06),transparent 60%);"></div>

  <div style="text-align:center;z-index:1;padding:0 60px;">
    <div style="display:inline-flex;align-items:center;gap:14px;margin-bottom:28px;">
      <div style="filter:drop-shadow(0 8px 32px rgba(37,99,235,0.3));">${logoIcon(56)}</div>
      <span style="font-size:28px;font-weight:800;color:white;">TeamPrompt</span>
    </div>
    <div style="font-size:44px;font-weight:800;color:white;line-height:1.15;margin-bottom:18px;">
      AI prompt management<br>with <span style="background:linear-gradient(135deg,${COLORS.blueLight},${COLORS.purple});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">enterprise security</span>
    </div>
    <div style="font-size:17px;color:${COLORS.textMuted};max-width:600px;margin:0 auto 30px;line-height:1.5;">
      Shared prompt library, DLP guardrails, and real-time protection — for teams that use ChatGPT, Claude, Gemini, Copilot & Perplexity.
    </div>
    <div style="display:flex;gap:20px;justify-content:center;">
      <div style="display:flex;align-items:center;gap:8px;color:${COLORS.green};">
        <div style="width:18px;height:18px;">${SVG_ICONS.shieldCheck}</div>
        <span style="font-size:13px;font-weight:500;">DLP Protection</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;color:${COLORS.blueLight};">
        <div style="width:18px;height:18px;">${SVG_ICONS.shield}</div>
        <span style="font-size:13px;font-weight:500;">Prompt Library</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;color:${COLORS.amber};">
        <div style="width:18px;height:18px;">${SVG_ICONS.triangleAlert}</div>
        <span style="font-size:13px;font-weight:500;">Real-time Alerts</span>
      </div>
    </div>
  </div>
</div>`);
}

// ─── DLP Feature Hero Banner (1400x560) ───
function promoDlp() {
  return baseHTML(1400, 560, `
<div style="display:flex;align-items:center;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-80px;left:200px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,0.08),transparent 60%);"></div>

  <div style="display:flex;align-items:center;gap:60px;padding:0 80px;z-index:1;width:100%;">
    <!-- Left: text -->
    <div style="flex:1;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
        <div style="width:24px;height:24px;color:#ef4444;">${SVG_ICONS.shieldX}</div>
        <span style="font-size:13px;font-weight:600;color:#fca5a5;text-transform:uppercase;letter-spacing:0.05em;">DLP Shield</span>
      </div>
      <div style="font-size:36px;font-weight:800;color:white;line-height:1.15;margin-bottom:14px;">
        Stop sensitive data<br>before it reaches AI
      </div>
      <div style="font-size:15px;color:${COLORS.textMuted};max-width:420px;line-height:1.5;margin-bottom:24px;">
        Automatically detect and block API keys, SSNs, patient records, financial data, and custom patterns — in real time, before the message is sent.
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${["API Keys", "SSN / PII", "Financial Data", "HIPAA / PHI", "Custom Patterns"].map(t =>
          `<span style="font-size:11px;color:${COLORS.textDim};background:rgba(239,68,68,0.08);padding:4px 10px;border-radius:20px;border:1px solid rgba(239,68,68,0.15);">${t}</span>`
        ).join("")}
      </div>
    </div>

    <!-- Right: mini block overlay -->
    <div style="width:380px;flex-shrink:0;">
      <div style="background:#18181b;border:1px solid #ef4444;border-radius:12px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
        <div style="color:#ef4444;margin-bottom:8px;width:24px;height:24px;">${SVG_ICONS.shieldX}</div>
        <h3 style="font-size:15px;font-weight:600;color:#fca5a5;margin-bottom:6px;">Message Blocked by TeamPrompt</h3>
        <p style="font-size:12px;color:#a1a1aa;margin-bottom:8px;">Sensitive data detected:</p>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="padding:5px 8px;background:#27272a;border-radius:6px;font-size:11px;color:#e4e4e7;"><strong style="color:#ef4444;">API Key</strong>: sk-proj-abc123...</div>
          <div style="padding:5px 8px;background:#27272a;border-radius:6px;font-size:11px;color:#e4e4e7;"><strong style="color:#ef4444;">Email (PII)</strong>: john@acme.com</div>
          <div style="padding:5px 8px;background:#27272a;border-radius:6px;font-size:11px;color:#e4e4e7;"><strong style="color:#ef4444;">Financial</strong>: $450K ARR</div>
        </div>
        <button style="margin-top:10px;padding:6px 16px;background:#2563eb;color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;">Got it</button>
      </div>
    </div>
  </div>
</div>`);
}

// ─── Social Media Profile & Banner Images ───

// Light-mode base HTML helper
function baseLightHTML(width, height, body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px;
    height: ${height}px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #ffffff;
    color: #09090b;
    overflow: hidden;
  }
</style>
</head>
<body>${body}</body>
</html>`;
}

// Profile picture — square, centered logo icon
function socialProfilePic(size) {
  const logoSz = Math.round(size * 0.55);
  return baseHTML(size, size, `
<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,#0f1117 0%,#131726 100%);">
  <div style="filter:drop-shadow(0 4px 24px rgba(37,99,235,0.25));">
    ${logoIcon(logoSz)}
  </div>
</div>`);
}

// YouTube channel art (2560x1440, safe zone 1546x423 center)
function youtubeChannelArt() {
  return baseHTML(2560, 1440, `
<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:200px;right:400px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 60%);"></div>
  <div style="position:absolute;bottom:200px;left:300px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.06),transparent 60%);"></div>
  <div style="position:absolute;top:40%;right:15%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(239,68,68,0.05),transparent 60%);"></div>

  <div style="text-align:center;z-index:1;padding:0 100px;">
    <div style="display:inline-flex;align-items:center;gap:20px;margin-bottom:32px;">
      <div style="filter:drop-shadow(0 8px 32px rgba(37,99,235,0.3));">${logoIcon(72)}</div>
      <span style="font-size:42px;font-weight:800;color:white;letter-spacing:-0.02em;">TeamPrompt</span>
    </div>
    <div style="font-size:26px;color:${COLORS.textMuted};max-width:800px;margin:0 auto 36px;line-height:1.5;">
      AI prompt management with enterprise security
    </div>
    <div style="display:flex;gap:32px;justify-content:center;">
      ${["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map(t =>
        `<span style="font-size:15px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">${t}</span>`
      ).join("")}
    </div>
  </div>
</div>`);
}

// X/Twitter banner (1500x500)
function twitterBanner() {
  return baseHTML(1500, 500, `
<div style="display:flex;align-items:center;width:100%;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-60px;right:200px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 60%);"></div>
  <div style="position:absolute;bottom:-40px;left:100px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.06),transparent 60%);"></div>

  <div style="display:flex;align-items:center;gap:50px;padding:0 80px;z-index:1;width:100%;">
    <div style="flex:1;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
        <div style="filter:drop-shadow(0 8px 32px rgba(37,99,235,0.3));">${logoIcon(48)}</div>
        <span style="font-size:28px;font-weight:800;color:white;">TeamPrompt</span>
      </div>
      <div style="font-size:20px;color:${COLORS.textMuted};max-width:500px;line-height:1.5;">
        AI prompt management with DLP protection for teams that use ChatGPT, Claude, Gemini & more
      </div>
    </div>
    <div style="display:flex;gap:12px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:20px;">
        <div style="width:14px;height:14px;color:#22c55e;">${SVG_ICONS.shieldCheck}</div>
        <span style="font-size:13px;color:#22c55e;font-weight:500;">DLP Shield</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:20px;">
        <div style="width:14px;height:14px;color:#60a5fa;">${SVG_ICONS.shield}</div>
        <span style="font-size:13px;color:#60a5fa;font-weight:500;">Prompt Library</span>
      </div>
    </div>
  </div>
</div>`);
}

// Facebook cover photo (851x315)
function facebookCover() {
  return baseHTML(851, 315, `
<div style="display:flex;align-items:center;width:100%;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-40px;right:100px;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 60%);"></div>

  <div style="display:flex;align-items:center;gap:40px;padding:0 50px;z-index:1;width:100%;">
    <div style="flex:1;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <div style="filter:drop-shadow(0 4px 16px rgba(37,99,235,0.3));">${logoIcon(40)}</div>
        <span style="font-size:22px;font-weight:800;color:white;">TeamPrompt</span>
      </div>
      <div style="font-size:15px;color:${COLORS.textMuted};max-width:400px;line-height:1.5;">
        AI prompt management & DLP protection for teams
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;">
      ${["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map(t =>
        `<span style="font-size:11px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:3px 12px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);white-space:nowrap;">${t}</span>`
      ).join("")}
    </div>
  </div>
</div>`);
}

// LinkedIn banner (1584x396)
function linkedinBanner() {
  return baseHTML(1584, 396, `
<div style="display:flex;align-items:center;width:100%;height:100%;background:linear-gradient(135deg,${COLORS.bg} 0%,#0d1025 40%,#111827 100%);position:relative;overflow:hidden;">
  <div style="position:absolute;top:-60px;right:250px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,0.1),transparent 60%);"></div>
  <div style="position:absolute;bottom:-50px;left:150px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.06),transparent 60%);"></div>

  <div style="display:flex;align-items:center;gap:60px;padding:0 80px;z-index:1;width:100%;">
    <div style="flex:1;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
        <div style="filter:drop-shadow(0 8px 32px rgba(37,99,235,0.3));">${logoIcon(52)}</div>
        <span style="font-size:30px;font-weight:800;color:white;">TeamPrompt</span>
      </div>
      <div style="font-size:18px;color:${COLORS.textMuted};max-width:550px;line-height:1.5;margin-bottom:20px;">
        AI prompt management with enterprise DLP protection for teams using ChatGPT, Claude, Gemini & more
      </div>
      <div style="display:flex;gap:16px;">
        <div style="display:flex;align-items:center;gap:6px;color:#22c55e;">
          <div style="width:16px;height:16px;">${SVG_ICONS.shieldCheck}</div>
          <span style="font-size:13px;font-weight:500;">DLP Guardrails</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;color:#60a5fa;">
          <div style="width:16px;height:16px;">${SVG_ICONS.shield}</div>
          <span style="font-size:13px;font-weight:500;">Shared Prompts</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;color:#fbbf24;">
          <div style="width:16px;height:16px;">${SVG_ICONS.triangleAlert}</div>
          <span style="font-size:13px;font-weight:500;">Real-time Alerts</span>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;flex-shrink:0;">
      ${["ChatGPT", "Claude", "Gemini", "Copilot", "Perplexity"].map(t =>
        `<span style="font-size:12px;color:${COLORS.textDim};background:rgba(255,255,255,0.06);padding:4px 14px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);text-align:center;">${t}</span>`
      ).join("")}
    </div>
  </div>
</div>`);
}

// ─── Light Mode Store Screenshots ───

const LIGHT = {
  bg: "#ffffff",
  card: "#f8f9fa",
  surface: "#f1f3f5",
  border: "#e4e7ec",
  borderLight: "#d1d5db",
  inputBg: "#f4f4f5",
  text: "#09090b",
  textSecondary: "#52525b",
  textMuted: "#71717a",
  textDim: "#a1a1aa",
  blue: "#2563eb",
  blueLight: "#3b82f6",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#d97706",
};

// Light Screenshot 1: Prompt library (web app — matches actual admin layout)
function screenshotLight1() {
  const prompts = [
    { title: "Sales Outreach Email", cat: "Sales", catColor: "#2563eb", desc: "Generate personalized cold outreach emails based on prospect research and value propositions.", vars: 3, uses: 142 },
    { title: "Code Review Assistant", cat: "Engineering", catColor: "#7c3aed", desc: "Analyze code changes for bugs, security issues, and style improvements with actionable feedback.", vars: 2, uses: 98 },
    { title: "Customer Support Reply", cat: "Support", catColor: "#16a34a", desc: "Draft empathetic and solution-oriented replies to customer tickets using context from previous interactions.", vars: 4, uses: 217 },
    { title: "Meeting Summary", cat: "Operations", catColor: "#d97706", desc: "Transform meeting notes into structured summaries with action items, owners, and deadlines.", vars: 2, uses: 76 },
    { title: "Legal Contract Review", cat: "Legal", catColor: "#dc2626", desc: "Identify key clauses, risks, and compliance issues in contract documents.", vars: 1, uses: 54 },
  ];

  return baseLightHTML(1280, 800, `
<div style="display:flex;flex-direction:column;height:100%;">
  <!-- Admin header (matches actual AdminHeader component) -->
  <div style="height:64px;background:#0f172a;border-bottom:1px solid #1e293b;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:13px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to App
      </div>
      <div style="width:1px;height:24px;background:#334155;"></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style="font-weight:600;font-size:15px;color:white;">TeamPrompt Admin</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:13px;color:#94a3b8;">admin@teamprompt.app</span>
      <div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:600;font-size:14px;">A</div>
    </div>
  </div>

  <div style="display:flex;flex:1;">
    <!-- Admin sidebar (matches actual AdminNav — slate-900 bg) -->
    <div style="width:256px;background:#0f172a;padding:16px;display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
      ${[
        { label: "Dashboard", icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>', active: false },
        { label: "Organizations", icon: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>', active: false },
        { label: "Users", icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', active: false },
        { label: "Subscriptions", icon: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>', active: false },
        { label: "Analytics", icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>', active: false },
        { label: "Activity Logs", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>', active: false },
      ].map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:8px;${item.active ? 'background:#1e293b;color:white;' : 'color:#cbd5e1;'}font-size:14px;font-weight:500;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
          ${item.label}
        </div>
      `).join("")}
    </div>

    <!-- Main content (slate-50 light background) -->
    <div style="flex:1;padding:24px;background:#f8fafc;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:4px;">Prompt Library</h1>
          <p style="font-size:14px;color:#64748b;">24 prompts across 6 categories</p>
        </div>
        <div style="display:flex;gap:8px;">
          <div style="padding:8px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#94a3b8;background:white;">Search prompts...</div>
          <button style="padding:8px 16px;border:none;border-radius:8px;background:#2563eb;color:white;font-size:13px;font-weight:600;">+ New Prompt</button>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px;">
        ${prompts.map(p => `
          <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <div style="flex:1;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="font-size:14px;font-weight:600;color:#0f172a;">${p.title}</span>
                <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${p.catColor}12;color:${p.catColor};font-weight:500;border:1px solid ${p.catColor}20;">${p.cat}</span>
              </div>
              <p style="font-size:12px;color:#64748b;line-height:1.4;">${p.desc}</p>
            </div>
            <div style="display:flex;gap:16px;flex-shrink:0;align-items:center;">
              <div style="text-align:center;">
                <div style="font-size:14px;font-weight:600;color:#0f172a;">${p.vars}</div>
                <div style="font-size:10px;color:#94a3b8;">variables</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:14px;font-weight:600;color:#0f172a;">${p.uses}</div>
                <div style="font-size:10px;color:#94a3b8;">uses</div>
              </div>
              <button style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:8px;background:white;color:#2563eb;font-size:12px;font-weight:500;">Use</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </div>
</div>`);
}

// Light Screenshot 2: Admin dashboard (matches actual admin layout — slate-900 sidebar + slate-50 main)
function screenshotLight2() {
  return baseLightHTML(1280, 800, `
<div style="display:flex;flex-direction:column;height:100%;">
  <!-- Admin header -->
  <div style="height:64px;background:#0f172a;border-bottom:1px solid #1e293b;padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:13px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Back to App
      </div>
      <div style="width:1px;height:24px;background:#334155;"></div>
      <div style="display:flex;align-items:center;gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span style="font-weight:600;font-size:15px;color:white;">TeamPrompt Admin</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <span style="font-size:13px;color:#94a3b8;">admin@teamprompt.app</span>
      <div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:600;font-size:14px;">A</div>
    </div>
  </div>

  <div style="display:flex;flex:1;">
    <!-- Admin sidebar (matches actual AdminNav — bg-slate-900) -->
    <div style="width:256px;background:#0f172a;padding:16px;display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
      ${[
        { label: "Dashboard", active: true },
        { label: "Organizations", active: false },
        { label: "Users", active: false },
        { label: "Subscriptions", active: false },
        { label: "Analytics", active: false },
        { label: "Activity Logs", active: false },
        { label: "Tickets", active: false },
        { label: "Error Logs", active: false },
        { label: "Settings", active: false },
      ].map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:8px;${item.active ? 'background:#1e293b;color:white;' : 'color:#cbd5e1;'}font-size:14px;font-weight:500;">
          ${item.label}
        </div>
      `).join("")}
    </div>

    <!-- Main content (bg-slate-50) -->
    <div style="flex:1;padding:24px;background:#f8fafc;overflow:hidden;">
      <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:20px;">Dashboard</h1>

      <!-- Key Metrics -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
        ${[
          { label: "MRR", value: "$2,847", change: "+12%", color: "#16a34a" },
          { label: "Organizations", value: "18", change: "+3 this week", color: "#2563eb" },
          { label: "Total Users", value: "142", change: "+8 this month", color: "#7c3aed" },
          { label: "Total Prompts", value: "1,247", change: "+56 this week", color: "#d97706" },
        ].map(s => `
          <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${s.label}</div>
            <div style="font-size:28px;font-weight:700;color:#0f172a;margin-bottom:2px;">${s.value}</div>
            <div style="font-size:11px;color:${s.color};font-weight:500;">${s.change}</div>
          </div>
        `).join("")}
      </div>

      <!-- Two-column: Protection Coverage + Recent Signups -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <!-- Protection Coverage -->
        <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3 style="font-size:14px;font-weight:600;color:#0f172a;">Protection Coverage</h3>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
            ${[
              { label: "Protected", value: "18", color: "#16a34a", bg: "rgba(22,163,74,0.06)" },
              { label: "Inactive", value: "3", color: "#94a3b8", bg: "#f1f5f9" },
              { label: "Unprotected", value: "2", color: "#dc2626", bg: "rgba(220,38,38,0.06)" },
              { label: "No Extension", value: "1", color: "#64748b", bg: "#f1f5f9" },
            ].map(b => `
              <div style="background:${b.bg};border-radius:8px;padding:10px 12px;">
                <div style="font-size:20px;font-weight:700;color:${b.color};">${b.value}</div>
                <div style="font-size:11px;color:#64748b;">${b.label}</div>
              </div>
            `).join("")}
          </div>
          <div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:75%;background:#16a34a;border-radius:4px;"></div>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:6px;">75% active protection rate</div>
        </div>

        <!-- Plan Distribution -->
        <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <h3 style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:14px;">Plan Distribution</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${[
              { label: "Free", value: "8", color: "#64748b", bg: "#f1f5f9" },
              { label: "Pro", value: "5", color: "#2563eb", bg: "rgba(37,99,235,0.06)" },
              { label: "Team", value: "3", color: "#7c3aed", bg: "rgba(124,58,237,0.06)" },
              { label: "Business", value: "2", color: "#d97706", bg: "rgba(217,119,6,0.06)" },
            ].map(b => `
              <div style="background:${b.bg};border-radius:8px;padding:10px 12px;">
                <div style="font-size:20px;font-weight:700;color:${b.color};">${b.value}</div>
                <div style="font-size:11px;color:#64748b;">${b.label}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`);
}

// Light Screenshot 3: DLP block on ChatGPT (light mode ChatGPT background)
function screenshotLight3() {
  return baseLightHTML(1280, 800, `
<div style="display:flex;flex-direction:column;height:100%;background:#f7f7f8;">
  <!-- ChatGPT-like header (light) -->
  <div style="height:48px;background:white;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;padding:0 20px;">
    <span style="font-size:15px;font-weight:600;color:#202123;">ChatGPT</span>
    <span style="margin-left:auto;font-size:12px;color:#8e8ea0;">GPT-4o</span>
  </div>

  <!-- Chat area -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px;position:relative;">
    <!-- User message with sensitive data -->
    <div style="align-self:flex-end;max-width:70%;background:#f0f0f0;border-radius:16px;padding:14px 18px;margin-bottom:80px;">
      <p style="font-size:14px;color:#202123;line-height:1.5;">Can you help me analyze our Q3 financials? Our API key is <span style="background:#fee2e2;color:#dc2626;padding:1px 4px;border-radius:3px;font-family:monospace;font-size:12px;">sk-proj-abc123def456ghi789</span> and Sarah's email is <span style="background:#fee2e2;color:#dc2626;padding:1px 4px;border-radius:3px;font-size:12px;">sarah@acme.com</span> — we have <span style="background:#fee2e2;color:#dc2626;padding:1px 4px;border-radius:3px;font-size:12px;">$4.2M ARR</span> this quarter.</p>
    </div>

    <!-- Block overlay card -->
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;border:2px solid #dc2626;border-radius:16px;padding:24px;max-width:420px;width:90%;box-shadow:0 16px 48px rgba(0,0,0,0.12);">
      <div style="color:#dc2626;margin-bottom:8px;width:28px;height:28px;">${SVG_ICONS.shieldX}</div>
      <h3 style="font-size:16px;font-weight:700;color:#dc2626;margin-bottom:6px;">Message Blocked</h3>
      <p style="font-size:13px;color:#6b7280;margin-bottom:10px;">TeamPrompt detected sensitive data in your message:</p>
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px;">
        <div style="padding:8px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:12px;color:#374151;"><strong style="color:#dc2626;">API Key</strong>: sk-proj-abc123...</div>
        <div style="padding:8px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:12px;color:#374151;"><strong style="color:#dc2626;">Email (PII)</strong>: sarah@acme.com</div>
        <div style="padding:8px 10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-size:12px;color:#374151;"><strong style="color:#dc2626;">Financial</strong>: $4.2M ARR</div>
      </div>
      <p style="font-size:11px;color:#9ca3af;margin-bottom:12px;">Remove sensitive data and try again. This event has been logged.</p>
      <button style="padding:8px 20px;background:${LIGHT.blue};color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;">Got it</button>
    </div>
  </div>

  <!-- Shield indicator (matches actual content.css .tp-shield — always dark) -->
  <div style="position:absolute;bottom:20px;right:20px;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#18181b;border:1px solid rgba(245,158,11,0.3);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.4);font-size:12px;color:#a1a1aa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    <div>
      <div style="font-weight:600;color:#e4e4e7;font-size:11px;">Blocked</div>
      <div style="font-size:10px;color:#71717a;">ChatGPT</div>
    </div>
    <div style="width:6px;height:6px;border-radius:50%;background:#f59e0b;box-shadow:0 0 6px rgba(245,158,11,0.5);"></div>
  </div>
</div>`);
}

// Light Screenshot 4: Extension popup — prompt list (matches actual popup UI in light theme)
function screenshotLight4() {
  // Uses the actual extension light theme CSS vars
  const L = { bg: "#f8f9fb", card: "#ffffff", surface: "#f1f3f7", border: "#e2e5eb", borderLight: "#d0d4dc", inputBg: "#f1f3f7", muted: "#eef0f4", text: "#0f1729", textSec: "#4b5563", textMuted: "#6b7280", textDim: "#9ca3af", primary: "#2563eb", primarySurface: "rgba(37,99,235,0.06)" };

  return baseLightHTML(1280, 800, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#f0f4ff,#eef2ff);">
  <div style="text-align:center;">
    <div style="width:380px;background:${L.card};border-radius:16px;border:1px solid ${L.border};box-shadow:0 25px 60px rgba(0,0,0,0.08);margin:0 auto;overflow:hidden;">
      <!-- Toolbar (matches actual .toolbar) -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid ${L.border};background:${L.card};">
        <div style="display:flex;align-items:center;gap:8px;">
          <img width="20" height="20" style="width:20px;height:20px;border-radius:4px;" />
          <span style="font-weight:700;font-size:15px;color:${L.text};letter-spacing:-0.01em;">TeamPrompt</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;">
          <div style="padding:6px;border-radius:8px;color:${L.textMuted};display:flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </div>
          <div style="padding:6px;border-radius:8px;color:${L.textMuted};display:flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </div>
          <div style="padding:6px;border-radius:8px;color:${L.textMuted};display:flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
        </div>
      </div>
      <!-- Search (matches actual .search-wrap) -->
      <div style="padding:10px 14px 0;">
        <div style="padding:11px 14px;border:1px solid ${L.border};border-radius:14px;background:${L.inputBg};color:${L.textDim};font-size:14px;">Search prompts...</div>
      </div>
      <!-- Tabs (matches actual .tabs — active uses primary-surface + primary color) -->
      <div style="display:flex;gap:2px;padding:10px 14px;background:${L.bg};">
        <div style="flex:1;padding:6px 10px;border-radius:8px;background:${L.primarySurface};color:${L.primary};font-size:12px;font-weight:600;text-align:center;">All</div>
        <div style="flex:1;padding:6px 10px;border-radius:8px;color:${L.textMuted};font-size:12px;font-weight:600;text-align:center;">Packages</div>
        <div style="flex:1;padding:6px 10px;border-radius:8px;color:${L.textMuted};font-size:12px;font-weight:600;text-align:center;">Recent</div>
        <div style="flex:1;padding:6px 10px;border-radius:8px;color:${L.textMuted};font-size:12px;font-weight:600;text-align:center;display:flex;align-items:center;justify-content:center;gap:3px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Shield
        </div>
      </div>
      <!-- Prompt cards (matches actual .prompt-card — 20px radius, box-shadow, hover arrow) -->
      <div style="padding:0 14px 14px;">
        ${[
          { title: "Customer Onboarding Prompt", desc: "Guide new customers through the onboarding process with...", tags: ["onboarding", "customer"], template: true },
          { title: "Weekly Report Summary", desc: "Summarize the key metrics and highlights from this week...", tags: ["reports", "weekly"], template: false },
          { title: "Compliance Review Template", desc: "Review the following document for compliance with our...", tags: ["compliance", "legal"], template: true },
          { title: "Sales Outreach Drafter", desc: "Draft a personalized outreach email for a prospect in the...", tags: ["sales", "email"], template: false },
        ].map(p => `
          <div style="padding:12px 14px;border:1px solid ${L.border};border-radius:20px;margin-bottom:6px;background:${L.card};box-shadow:0 1px 4px -1px rgba(0,0,0,0.08);cursor:pointer;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:600;font-size:14px;color:${L.text};">${p.title}</span>
              ${p.template ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:${L.primarySurface};color:${L.primary};font-weight:500;">Template</span>` : ''}
            </div>
            <div style="color:${L.textMuted};font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;">${p.desc}</div>
            <div style="margin-top:4px;">${p.tags.map(t => `<span style="display:inline-block;font-size:10px;padding:1px 6px;border-radius:6px;background:${L.muted};color:${L.textSec};margin-right:4px;">${t}</span>`).join('')}</div>
          </div>
        `).join('')}
      </div>
      <!-- Status bar (matches actual .status-bar with shield indicator) -->
      <div style="padding:10px 14px;border-top:1px solid ${L.border};font-size:11px;color:${L.textMuted};background:${L.card};display:flex;align-items:center;gap:6px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        4 prompts
      </div>
    </div>
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Browse and search your team's shared prompt library</p>
  </div>
</div>`);
}

// Light Screenshot 5: Extension popup — template detail (matches actual detail view in light theme)
function screenshotLight5() {
  const L = { bg: "#f8f9fb", card: "#ffffff", surface: "#f1f3f7", border: "#e2e5eb", inputBg: "#f1f3f7", text: "#0f1729", textSec: "#4b5563", textMuted: "#6b7280", textDim: "#9ca3af", primary: "#2563eb", primaryHover: "#1d4ed8" };

  return baseLightHTML(1280, 800, `
<div style="display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#f0f4ff,#eef2ff);">
  <div style="text-align:center;">
    <div style="width:380px;background:${L.card};border-radius:16px;border:1px solid ${L.border};box-shadow:0 25px 60px rgba(0,0,0,0.08);margin:0 auto;overflow:hidden;">
      <!-- Detail toolbar (matches actual .detail-toolbar) -->
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid ${L.border};background:${L.card};">
        <div style="padding:6px;border-radius:8px;color:${L.textMuted};display:flex;cursor:pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
        <span style="font-weight:700;font-size:15px;color:${L.text};letter-spacing:-0.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Customer Onboarding Prompt</span>
      </div>
      <!-- Content (matches actual .detail-content) -->
      <div style="padding:14px;font-size:13px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;background:${L.inputBg};margin:10px 14px;border-radius:14px;border:1px solid ${L.border};color:${L.textSec};text-align:left;">You are a customer success specialist at <span style="background:rgba(37,99,235,0.1);color:${L.primary};padding:0 3px;border-radius:3px;">{{company_name}}</span>.

Guide the new customer through their first week:

1. Welcome them and confirm their setup
2. Walk through features for their <span style="background:rgba(37,99,235,0.1);color:${L.primary};padding:0 3px;border-radius:3px;">{{industry}}</span> use case
3. Set up their first <span style="background:rgba(37,99,235,0.1);color:${L.primary};padding:0 3px;border-radius:3px;">{{product_feature}}</span>
4. Schedule a follow-up for day 7

Tone: <span style="background:rgba(37,99,235,0.1);color:${L.primary};padding:0 3px;border-radius:3px;">{{tone}}</span> and helpful.</div>
      <!-- Template fields (matches actual .template-fields) -->
      <div style="padding:0 14px;margin-bottom:10px;text-align:left;">
        ${[
          { label: "company_name", value: "Acme Corp" },
          { label: "industry", value: "SaaS" },
          { label: "product_feature", value: "dashboard" },
          { label: "tone", value: "Friendly" },
        ].map(f => `
          <label style="display:block;font-size:12px;font-weight:500;color:${L.textSec};margin-bottom:4px;margin-top:8px;">${f.label}</label>
          <div style="width:100%;padding:11px 14px;border:1px solid ${L.border};border-radius:14px;background:${L.inputBg};color:${L.text};font-size:14px;">${f.value}</div>
        `).join('')}
      </div>
      <!-- Actions (matches actual .detail-actions with gradient primary btn) -->
      <div style="display:flex;gap:8px;padding:14px;">
        <button style="flex:1;padding:10px;border:none;border-radius:14px;background:linear-gradient(to bottom,${L.primary},${L.primaryHover});color:white;font-weight:600;font-size:13px;box-shadow:0 2px 8px -2px rgba(37,99,235,0.3);">Copy to Clipboard</button>
        <button style="flex:1;padding:10px;border:1px solid ${L.border};border-radius:14px;background:transparent;color:${L.text};font-weight:500;font-size:13px;">Insert into AI Tool</button>
      </div>
    </div>
    <p style="color:#6b7280;font-size:13px;margin-top:24px;">Fill in template variables before inserting</p>
  </div>
</div>`);
}

// Light Screenshot 6: Insert prompt into ChatGPT (matches actual popup prompt cards in light theme)
function screenshotLight6() {
  const L = { bg: "#f8f9fb", card: "#ffffff", border: "#e2e5eb", inputBg: "#f1f3f7", muted: "#eef0f4", text: "#0f1729", textSec: "#4b5563", textMuted: "#6b7280", textDim: "#9ca3af", primary: "#2563eb", primarySurface: "rgba(37,99,235,0.06)" };

  return baseLightHTML(1280, 800, `
<div style="position:relative;height:100%;">
  <!-- ChatGPT light background -->
  <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:#f7f7f8;display:flex;flex-direction:column;">
    <div style="padding:12px 20px;border-bottom:1px solid #e5e5e5;display:flex;align-items:center;gap:10px;background:white;">
      <span style="font-weight:700;font-size:16px;color:#202123;">ChatGPT</span>
      <span style="margin-left:auto;font-size:12px;color:#8e8ea0;">GPT-4o</span>
    </div>
    <div style="flex:1;padding:40px;display:flex;flex-direction:column;gap:24px;overflow:hidden;">
      <div style="max-width:70%;padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.5;background:#ececf1;color:#202123;align-self:flex-start;">
        Hello! How can I help you today?
      </div>
      <div style="max-width:70%;padding:12px 16px;border-radius:12px;font-size:14px;line-height:1.5;background:#2563eb;color:white;align-self:flex-end;">
        You are a customer success specialist at Acme Corp. Guide the new customer through their first week...
      </div>
    </div>
    <div style="padding:16px 20px;border-top:1px solid #e5e5e5;display:flex;align-items:center;gap:12px;background:white;">
      <div style="flex:1;padding:12px 16px;border-radius:12px;background:#f4f4f5;border:1px solid #e5e5e5;color:#8e8ea0;font-size:14px;">Message ChatGPT...</div>
    </div>
  </div>

  <!-- Floating popup (matches actual popup card styling in light theme) -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:380px;background:${L.card};border-radius:16px;border:1px solid ${L.border};box-shadow:0 25px 60px rgba(0,0,0,0.1);overflow:hidden;z-index:10;">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid ${L.border};background:${L.card};">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:20px;height:20px;border-radius:4px;"></div>
        <span style="font-weight:700;font-size:15px;color:${L.text};letter-spacing:-0.01em;">TeamPrompt</span>
      </div>
    </div>
    <div style="padding:0 14px 14px;">
      ${[
        { title: "Customer Onboarding", desc: "Guide new customers through onboarding...", highlight: true, template: true },
        { title: "Weekly Report Summary", desc: "Summarize key metrics and highlights...", highlight: false, template: false },
        { title: "Compliance Review", desc: "Review document for compliance...", highlight: false, template: true },
      ].map(p => `
        <div style="padding:12px 14px;border:1px solid ${p.highlight ? L.primary : L.border};border-radius:20px;margin-top:6px;background:${p.highlight ? L.primarySurface : L.card};box-shadow:0 1px 4px -1px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:600;font-size:14px;color:${L.text};">${p.title}</span>
              ${p.template ? `<span style="font-size:10px;padding:1px 6px;border-radius:6px;background:${L.primarySurface};color:${L.primary};font-weight:500;">Template</span>` : ''}
            </div>
            <div style="color:${L.textMuted};font-size:12px;margin-top:2px;">${p.desc}</div>
          </div>
          ${p.highlight ? `<button style="padding:5px 12px;border:none;border-radius:14px;background:linear-gradient(to bottom,${L.primary},#1d4ed8);color:white;font-size:11px;font-weight:600;flex-shrink:0;box-shadow:0 2px 8px -2px rgba(37,99,235,0.3);">Insert</button>` : ''}
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Toast -->
  <div style="position:absolute;bottom:80px;right:24px;background:white;color:#16a34a;padding:10px 16px;border-radius:8px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.08);border:1px solid #bbf7d0;z-index:20;">
    Prompt inserted into ChatGPT
  </div>

  <!-- Shield indicator (matches actual content.css .tp-shield) -->
  <div style="position:absolute;bottom:20px;right:20px;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#18181b;border:1px solid rgba(34,197,94,0.3);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.4);font-size:12px;color:#a1a1aa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="filter:drop-shadow(0 0 4px rgba(34,197,94,0.3));"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    <div>
      <div style="font-weight:600;color:#e4e4e7;font-size:11px;">Protected</div>
      <div style="font-size:10px;color:#71717a;">ChatGPT</div>
    </div>
    <div style="width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px rgba(34,197,94,0.5);"></div>
  </div>
</div>`);
}

// ─── Generate all assets ───
async function main() {
  console.log("Generating Chrome Web Store assets...\n");

  // Copy store icon
  copyStoreIcon();

  const browser = await puppeteer.launch({ headless: "new" });

  const assets = [
    { name: "screenshot-1-login.png", width: 1280, height: 800, html: screenshot1() },
    { name: "screenshot-2-prompt-list.png", width: 1280, height: 800, html: screenshot2() },
    { name: "screenshot-3-insert.png", width: 1280, height: 800, html: screenshot3() },
    { name: "screenshot-4-template.png", width: 1280, height: 800, html: screenshot4() },
    { name: "screenshot-5-sidepanel.png", width: 1280, height: 800, html: screenshot5() },
    { name: "screenshot-6-dlp-block.png", width: 1280, height: 800, html: screenshot6() },
    { name: "screenshot-7-warning.png", width: 1280, height: 800, html: screenshot7() },
    { name: "screenshot-8-session-loss.png", width: 1280, height: 800, html: screenshot8() },
    { name: "screenshot-9-admin-dashboard.png", width: 1280, height: 800, html: screenshot9() },
    { name: "screenshot-10-admin-users.png", width: 1280, height: 800, html: screenshot10() },
    { name: "screenshot-11-multi-ai.png", width: 1280, height: 800, html: screenshot11() },
    { name: "screenshot-12-dlp-rules.png", width: 1280, height: 800, html: screenshot12() },
    { name: "screenshot-13-activity-log.png", width: 1280, height: 800, html: screenshot13() },
    { name: "promo-small.png", width: 440, height: 280, html: promoSmall() },
    { name: "promo-marquee.png", width: 1400, height: 560, html: promoMarquee() },
    { name: "social-hero.png", width: 1200, height: 630, html: socialHero() },
    { name: "promo-dlp.png", width: 1400, height: 560, html: promoDlp() },
    // Social media profile pictures
    { name: "social-profile-800.png", width: 800, height: 800, html: socialProfilePic(800) },
    { name: "social-profile-400.png", width: 400, height: 400, html: socialProfilePic(400) },
    { name: "social-profile-300.png", width: 300, height: 300, html: socialProfilePic(300) },
    // Social media banners
    { name: "youtube-channel-art.png", width: 2560, height: 1440, html: youtubeChannelArt() },
    { name: "twitter-banner.png", width: 1500, height: 500, html: twitterBanner() },
    { name: "facebook-cover.png", width: 851, height: 315, html: facebookCover() },
    { name: "linkedin-banner.png", width: 1584, height: 396, html: linkedinBanner() },
    // Light mode store screenshots
    { name: "screenshot-light-1-prompts.png", width: 1280, height: 800, html: screenshotLight1() },
    { name: "screenshot-light-2-dashboard.png", width: 1280, height: 800, html: screenshotLight2() },
    { name: "screenshot-light-3-dlp-block.png", width: 1280, height: 800, html: screenshotLight3() },
    { name: "screenshot-light-4-popup.png", width: 1280, height: 800, html: screenshotLight4() },
    { name: "screenshot-light-5-template.png", width: 1280, height: 800, html: screenshotLight5() },
    { name: "screenshot-light-6-insert.png", width: 1280, height: 800, html: screenshotLight6() },
  ];

  for (const asset of assets) {
    const page = await browser.newPage();
    await page.setViewport({ width: asset.width, height: asset.height, deviceScaleFactor: 1 });
    await page.setContent(asset.html, { waitUntil: "load" });
    const outputPath = path.join(ASSETS_DIR, asset.name);
    await page.screenshot({ path: outputPath, type: "png" });
    await page.close();
    console.log(`✓ ${asset.name} (${asset.width}x${asset.height})`);
  }

  await browser.close();
  console.log("\nDone! All assets saved to extension/store-assets/");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
