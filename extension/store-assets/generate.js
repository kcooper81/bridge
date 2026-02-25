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
    <div style="width:${size}px;height:${size}px;background:#ffffff;border-radius:${radius}px;box-shadow:inset 0 0 0 ${Math.max(1, Math.round(size * 0.02))}px rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;">
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
    { name: "promo-small.png", width: 440, height: 280, html: promoSmall() },
    { name: "promo-marquee.png", width: 1400, height: 560, html: promoMarquee() },
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
