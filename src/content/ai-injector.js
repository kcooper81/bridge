// ContextIQ AI Injector Content Script
// Detects AI tool pages, captures conversation context, and bridges it across tools

(async () => {
  // --- Shared artifact extraction helpers ---

  function extractCodeBlocksFromEl(el) {
    const blocks = [];
    el.querySelectorAll('pre code, pre').forEach(codeEl => {
      const raw = codeEl.textContent.trim();
      if (raw.length < 10) return;
      // Detect language from class name
      const classes = (codeEl.className || '') + ' ' + (codeEl.parentElement?.className || '');
      const langMatch = classes.match(/language-(\w+)|lang-(\w+)/);
      const language = langMatch ? (langMatch[1] || langMatch[2]) : '';
      blocks.push({ language, code: raw.slice(0, 2000) });
    });
    return blocks;
  }

  function extractImagesFromEl(el) {
    const images = [];
    el.querySelectorAll('img[src]').forEach(img => {
      const src = img.src || '';
      // Skip tiny icons, avatars, UI chrome
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (!src || (w > 0 && w < 50) || (h > 0 && h < 50)) return;
      if (src.startsWith('data:image/svg') || src.includes('/avatar') || src.includes('/icon')) return;
      images.push({ url: src.slice(0, 500), alt: (img.alt || '').slice(0, 200) });
    });
    return images;
  }

  const AI_TOOLS = [
    {
      name: 'ChatGPT',
      patterns: [/chat\.openai\.com/, /chatgpt\.com/],
      inputSelector: '#prompt-textarea, textarea[data-id="root"]',
      getInput: () => document.querySelector('#prompt-textarea, textarea[data-id="root"]'),
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('[data-message-author-role]').forEach(el => {
          const role = el.getAttribute('data-message-author-role');
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            turns.push({ role: role === 'user' ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.slice(-6);
      },
      getArtifacts: () => {
        const codeBlocks = [];
        const images = [];
        document.querySelectorAll('[data-message-author-role="assistant"]').forEach(el => {
          codeBlocks.push(...extractCodeBlocksFromEl(el));
          images.push(...extractImagesFromEl(el));
        });
        // ChatGPT canvas panel
        document.querySelectorAll('[data-testid="canvas-panel"] pre code, .canvas-code-block').forEach(codeEl => {
          const raw = codeEl.textContent.trim();
          if (raw.length >= 10) {
            const langMatch = (codeEl.className || '').match(/language-(\w+)/);
            codeBlocks.push({ language: langMatch?.[1] || '', code: raw.slice(0, 3000), source: 'canvas' });
          }
        });
        return { codeBlocks: codeBlocks.slice(0, 10), images: images.slice(0, 5) };
      },
    },
    {
      name: 'Gemini',
      patterns: [/gemini\.google\.com/],
      inputSelector: '.ql-editor, [contenteditable="true"]',
      getInput: () => document.querySelector('.ql-editor, [contenteditable="true"]'),
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('.conversation-container .query-text, .conversation-container .response-text, .user-query, .model-response').forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            const isUser = el.closest('.query-text, .user-query') !== null;
            turns.push({ role: isUser ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.slice(-6);
      },
      getArtifacts: () => {
        const codeBlocks = [];
        const images = [];
        document.querySelectorAll('.model-response, .response-text').forEach(el => {
          codeBlocks.push(...extractCodeBlocksFromEl(el));
          images.push(...extractImagesFromEl(el));
        });
        return { codeBlocks: codeBlocks.slice(0, 10), images: images.slice(0, 5) };
      },
    },
    {
      name: 'Claude',
      patterns: [/claude\.ai/],
      inputSelector: '[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
      getInput: () => document.querySelector('[contenteditable="true"].ProseMirror, div[contenteditable="true"]'),
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('[data-testid="user-message"], [data-testid="ai-message"], .font-user-message, .font-claude-message').forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            const isUser = el.matches('[data-testid="user-message"], .font-user-message');
            turns.push({ role: isUser ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.slice(-6);
      },
      getArtifacts: () => {
        const codeBlocks = [];
        const images = [];
        document.querySelectorAll('[data-testid="ai-message"], .font-claude-message').forEach(el => {
          codeBlocks.push(...extractCodeBlocksFromEl(el));
          images.push(...extractImagesFromEl(el));
        });
        // Claude artifact viewer
        document.querySelectorAll('[data-testid="artifact-content"], .artifact-renderer').forEach(el => {
          const raw = el.textContent.trim();
          if (raw.length >= 20) {
            const looksLikeCode = /[{};()=]|function |import |const |class |def |return /.test(raw);
            if (looksLikeCode) {
              codeBlocks.push({ language: '', code: raw.slice(0, 3000), source: 'artifact' });
            }
          }
          images.push(...extractImagesFromEl(el));
        });
        return { codeBlocks: codeBlocks.slice(0, 10), images: images.slice(0, 5) };
      },
    },
    {
      name: 'Notion',
      patterns: [/notion\.so/],
      inputSelector: '.notion-page-content [contenteditable="true"]',
      getInput: () => document.querySelector('.notion-page-content [contenteditable="true"]'),
      getConversation: () => [],
      getArtifacts: () => ({ codeBlocks: [], images: [] }),
    },
  ];

  // Detect which AI tool we're on
  const currentUrl = window.location.href;
  const activeTool = AI_TOOLS.find(tool =>
    tool.patterns.some(p => p.test(currentUrl))
  );

  if (!activeTool) return;

  // --- Build the UI ---

  const container = document.createElement('div');
  container.id = 'contextiq-inject-btn';
  container.innerHTML = `
    <!-- Bridge Notification Bar (slides in from top-right when context from other tools exists) -->
    <div class="contextiq-bridge-bar hidden" id="contextiq-bridge-bar">
      <div class="contextiq-bridge-bar-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
      </div>
      <div class="contextiq-bridge-bar-content">
        <span class="contextiq-bridge-bar-label">Continue from <strong id="bridge-bar-tool"></strong></span>
        <span class="contextiq-bridge-bar-topic" id="bridge-bar-topic"></span>
      </div>
      <button class="contextiq-bridge-bar-action" id="bridge-bar-insert">Insert context</button>
      <button class="contextiq-bridge-bar-dismiss" id="bridge-bar-dismiss">&times;</button>
    </div>

    <!-- FAB -->
    <div class="contextiq-fab" title="ContextIQ — bridge your AI conversations">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
        <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
      <span class="contextiq-fab-label">Bridge</span>
      <span class="contextiq-fab-badge hidden" id="contextiq-badge"></span>
    </div>

    <!-- Menu Panel -->
    <div class="contextiq-menu hidden">
      <div class="contextiq-menu-header">
        <span class="contextiq-menu-title">AI Bridge</span>
        <span class="contextiq-menu-tool">${activeTool.name}</span>
      </div>

      <div class="contextiq-menu-project" id="menu-project">Loading...</div>
      <div class="contextiq-menu-stats" id="menu-stats"></div>

      <!-- Cross-tool conversations -->
      <div class="contextiq-threads" id="menu-threads"></div>

      <!-- Actions -->
      <div class="contextiq-menu-section">
        <div class="contextiq-menu-actions">
          <button class="contextiq-btn contextiq-btn-bridge" id="btn-smart-bridge" title="Generate a smart continuation prompt from your other AI conversations" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            Bridge Context
          </button>
          <button class="contextiq-btn contextiq-btn-inject" id="btn-full-context" title="Insert full project context" disabled>
            Full Context
          </button>
          <button class="contextiq-btn contextiq-btn-copy" id="btn-copy" title="Copy to clipboard" disabled>
            Copy
          </button>
        </div>
      </div>

      <div class="contextiq-menu-section">
        <div class="contextiq-menu-actions">
          <button class="contextiq-btn contextiq-btn-save" id="btn-save" title="Save this conversation to your active project">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save This Chat
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // --- References ---
  const fab = container.querySelector('.contextiq-fab');
  const menu = container.querySelector('.contextiq-menu');
  const badge = container.querySelector('#contextiq-badge');
  const bridgeBar = container.querySelector('#contextiq-bridge-bar');
  const bridgeBarTool = container.querySelector('#bridge-bar-tool');
  const bridgeBarTopic = container.querySelector('#bridge-bar-topic');
  const bridgeBarInsert = container.querySelector('#bridge-bar-insert');
  const bridgeBarDismiss = container.querySelector('#bridge-bar-dismiss');
  const menuProject = container.querySelector('#menu-project');
  const menuStats = container.querySelector('#menu-stats');
  const menuThreads = container.querySelector('#menu-threads');
  const btnSmartBridge = container.querySelector('#btn-smart-bridge');
  const btnFullContext = container.querySelector('#btn-full-context');
  const btnCopy = container.querySelector('#btn-copy');
  const btnSave = container.querySelector('#btn-save');

  let contextText = '';
  let bridgePrompt = '';
  let isMenuOpen = false;
  let bridgeBarDismissed = false;
  let bridgeNotification = null;

  // --- Proactive Bridge Notification ---

  async function checkBridgeNotification() {
    if (bridgeBarDismissed) return;

    try {
      const resp = await chrome.runtime.sendMessage({
        type: 'GET_BRIDGE_NOTIFICATION',
        currentTool: activeTool.name,
      });

      if (resp && resp.hasContext) {
        bridgeNotification = resp;
        bridgeBarTool.textContent = resp.latestTool;
        // Show topic + artifact summary
        let topicText = `"${resp.latestTopic}"`;
        const hints = [];
        if (resp.totalCodeBlocks > 0) hints.push(`${resp.totalCodeBlocks} code block${resp.totalCodeBlocks !== 1 ? 's' : ''}`);
        if (resp.totalImages > 0) hints.push(`${resp.totalImages} image${resp.totalImages !== 1 ? 's' : ''}`);
        if (hints.length > 0) topicText += ` + ${hints.join(', ')}`;
        bridgeBarTopic.textContent = topicText;
        bridgeBar.classList.remove('hidden');

        // Update badge on FAB
        badge.textContent = resp.totalConversations;
        badge.classList.remove('hidden');
      }
    } catch {
      // Extension context may be invalidated
    }
  }

  // Check for bridge context after page settles
  setTimeout(checkBridgeNotification, 2000);

  // Dismiss bridge bar
  bridgeBarDismiss.addEventListener('click', (e) => {
    e.stopPropagation();
    bridgeBar.classList.add('hidden');
    bridgeBarDismissed = true;
  });

  // Insert bridge context from notification bar
  bridgeBarInsert.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      const resp = await chrome.runtime.sendMessage({
        type: 'GENERATE_BRIDGE_PROMPT',
        currentTool: activeTool.name,
      });
      if (resp && resp.prompt) {
        injectIntoInput(resp.prompt);
        showFeedback('Bridge context inserted');
        bridgeBar.classList.add('hidden');
        bridgeBarDismissed = true;
      } else {
        showFeedback('No bridge context available');
      }
    } catch {
      showFeedback('Failed to generate bridge prompt');
    }
  });

  // --- Toggle Menu ---

  fab.addEventListener('click', async (e) => {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
    menu.classList.toggle('hidden', !isMenuOpen);
    if (isMenuOpen) {
      await loadMenuData();
    }
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      isMenuOpen = false;
      menu.classList.add('hidden');
    }
  });

  // --- Load Menu Data ---

  async function loadMenuData() {
    try {
      const [ctxResp, projResp, bridgeResp, notifResp] = await Promise.all([
        chrome.runtime.sendMessage({ type: 'GET_CONTEXT_FOR_AI' }),
        chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROJECT' }),
        chrome.runtime.sendMessage({ type: 'GENERATE_BRIDGE_PROMPT', currentTool: activeTool.name }),
        chrome.runtime.sendMessage({ type: 'GET_BRIDGE_NOTIFICATION', currentTool: activeTool.name }),
      ]);

      contextText = ctxResp.context || '';
      bridgePrompt = bridgeResp?.prompt || '';
      const project = projResp.project;

      // Project info
      if (project) {
        menuProject.textContent = project.name;
        const itemCount = project.items?.length || 0;
        const convCount = notifResp?.totalConversations || 0;
        const tools = notifResp?.toolsUsed || [];
        let statsText = `${itemCount} resources`;
        if (convCount > 0) statsText += ` · ${convCount} conversation${convCount !== 1 ? 's' : ''} from ${tools.join(', ')}`;
        menuStats.textContent = statsText;
        menuStats.style.display = 'block';
      } else {
        menuProject.textContent = 'No active project';
        menuStats.style.display = 'none';
      }

      // Conversation threads from other tools
      renderThreads(notifResp);

      // Enable/disable buttons
      btnFullContext.disabled = !contextText;
      btnCopy.disabled = !contextText;
      btnSmartBridge.disabled = !bridgePrompt;
    } catch (err) {
      menuProject.textContent = 'Error loading context';
      menuStats.textContent = err.message;
    }
  }

  function renderThreads(notifResp) {
    if (!notifResp || !notifResp.hasContext) {
      menuThreads.innerHTML = `
        <div class="contextiq-threads-empty">
          <span>No cross-tool conversations yet</span>
          <span class="contextiq-threads-hint">Chat on other AI tools and ContextIQ will bridge the context here</span>
        </div>
      `;
      return;
    }

    // Fetch thread details
    chrome.runtime.sendMessage({ type: 'GET_AI_BRIDGE_SUMMARY' }).then(summary => {
      if (!summary || !summary.threads || summary.threads.length === 0) {
        menuThreads.innerHTML = `<div class="contextiq-threads-empty"><span>No threads found</span></div>`;
        return;
      }

      const threadHtml = summary.threads
        .filter(t => t.toolName !== activeTool.name)
        .slice(0, 4)
        .map(t => {
          const ago = timeAgoShort(t.savedAt);
          const badges = [];
          if (t.codeBlockCount > 0) badges.push(`<span class="contextiq-artifact-badge contextiq-badge-code">${t.codeBlockCount} code</span>`);
          if (t.imageCount > 0) badges.push(`<span class="contextiq-artifact-badge contextiq-badge-img">${t.imageCount} img</span>`);
          return `
            <div class="contextiq-thread" data-tool="${esc(t.toolName)}">
              <div class="contextiq-thread-icon">${getToolIcon(t.toolName)}</div>
              <div class="contextiq-thread-info">
                <span class="contextiq-thread-topic">${esc(t.topic)}</span>
                <span class="contextiq-thread-meta">${esc(t.toolName)} · ${t.turnCount} turns${badges.length ? ' · ' : ''} ${badges.join(' ')} · ${ago}</span>
              </div>
            </div>
          `;
        }).join('');

      if (threadHtml) {
        menuThreads.innerHTML = `
          <div class="contextiq-threads-label">From other tools</div>
          ${threadHtml}
        `;
      } else {
        menuThreads.innerHTML = `<div class="contextiq-threads-empty"><span>All conversations are on ${activeTool.name}</span></div>`;
      }
    }).catch(() => {
      menuThreads.innerHTML = '';
    });
  }

  // --- Button Handlers ---

  // Smart bridge prompt (the hero action)
  btnSmartBridge.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!bridgePrompt) return;
    injectIntoInput(bridgePrompt);
    showFeedback('Bridge context injected — continue your conversation');
    isMenuOpen = false;
    menu.classList.add('hidden');
  });

  // Full context inject
  btnFullContext.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!contextText) return;

    // Combine project context + bridge prompt for maximum context
    const fullText = bridgePrompt ? bridgePrompt : contextText;
    injectIntoInput(fullText);
    showFeedback('Full context injected');
    isMenuOpen = false;
    menu.classList.add('hidden');
  });

  // Copy to clipboard
  btnCopy.addEventListener('click', async (e) => {
    e.stopPropagation();
    const text = bridgePrompt || contextText;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    showFeedback('Copied to clipboard');
  });

  // Save current conversation + artifacts
  btnSave.addEventListener('click', async (e) => {
    e.stopPropagation();
    const conversation = activeTool.getConversation();
    const artifacts = activeTool.getArtifacts();
    if (!conversation.length && !artifacts.codeBlocks.length && !artifacts.images.length) {
      showFeedback('No conversation to save');
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_AI_CONVERSATION',
        toolName: activeTool.name,
        url: window.location.href,
        title: document.title,
        turns: conversation,
        codeBlocks: artifacts.codeBlocks,
        images: artifacts.images,
      });
      const parts = [`${conversation.length} turns`];
      if (artifacts.codeBlocks.length) parts.push(`${artifacts.codeBlocks.length} code blocks`);
      if (artifacts.images.length) parts.push(`${artifacts.images.length} images`);
      showFeedback(`Saved ${parts.join(', ')} from ${activeTool.name}`);
    } catch {
      showFeedback('Failed to save conversation');
    }
  });

  // --- Helpers ---

  function injectIntoInput(text) {
    const input = activeTool.getInput();
    if (!input) {
      showFeedback('Could not find input field');
      return;
    }

    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      const existing = input.value;
      const prefix = text + '\n\n---\n\n';
      input.value = prefix + existing;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      const prefix = text + '\n\n---\n\n';
      const existingHtml = input.innerHTML;
      input.innerHTML = prefix.replace(/\n/g, '<br>') + existingHtml;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'contextiq-feedback';
    feedback.textContent = message;
    container.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2500);
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function timeAgoShort(ts) {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function getToolIcon(toolName) {
    const icons = {
      ChatGPT: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      Claude: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
      Gemini: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
      Notion: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>',
    };
    return icons[toolName] || icons.ChatGPT;
  }

  // --- Auto-save conversation + artifacts periodically ---
  let lastSavedHash = '';
  setInterval(async () => {
    try {
      const conversation = activeTool.getConversation();
      const artifacts = activeTool.getArtifacts();
      const hash = `${conversation.length}:${artifacts.codeBlocks.length}:${artifacts.images.length}`;
      if (hash !== lastSavedHash && (conversation.length >= 2 || artifacts.codeBlocks.length > 0)) {
        await chrome.runtime.sendMessage({
          type: 'SAVE_AI_CONVERSATION',
          toolName: activeTool.name,
          url: window.location.href,
          title: document.title,
          turns: conversation,
          codeBlocks: artifacts.codeBlocks,
          images: artifacts.images,
        });
        lastSavedHash = hash;
      }
    } catch {
      // Extension context may be invalidated
    }
  }, 30000);

  // --- Auto-injection mode ---
  async function checkAutoInject() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response.settings?.aiInjectionMode !== 'auto') return;

      fab.classList.add('contextiq-fab-auto');

      const waitForInput = (retries = 20) => {
        const input = activeTool.getInput();
        if (input) {
          let injected = false;
          const autoInjectOnFocus = async () => {
            if (injected) return;
            injected = true;

            // Try smart bridge prompt first, fall back to full context
            try {
              const bridgeResp = await chrome.runtime.sendMessage({
                type: 'GENERATE_BRIDGE_PROMPT',
                currentTool: activeTool.name,
              });
              if (bridgeResp?.prompt) {
                injectIntoInput(bridgeResp.prompt);
                showFeedback('Bridge context auto-injected');
                return;
              }
            } catch {
              // Fall through to full context
            }

            const ctxResp = await chrome.runtime.sendMessage({ type: 'GET_CONTEXT_FOR_AI' });
            if (!ctxResp?.context) return;

            if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
              if (input.value.trim()) return;
              input.value = ctxResp.context + '\n\n---\n\n';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              if (input.textContent.trim()) return;
              input.innerHTML = ctxResp.context.replace(/\n/g, '<br>') + '<br><br>---<br><br>';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            showFeedback('Context auto-injected');
          };

          input.addEventListener('focus', autoInjectOnFocus, { once: true });
        } else if (retries > 0) {
          setTimeout(() => waitForInput(retries - 1), 500);
        }
      };

      waitForInput();
    } catch {
      // Extension context may be invalidated
    }
  }

  checkAutoInject();
})();
