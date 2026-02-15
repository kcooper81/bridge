// ContextIQ AI Injector Content Script v1.0
// Simplified UX: minimal FAB, clean menu, clear actions
// Runs on all URLs — exits fast if not an AI tool

(async () => {
  // Prevent double-init
  if (window.__contextiq_injected) return;
  window.__contextiq_injected = true;

  // --- Shared artifact extraction helpers ---

  function extractCodeBlocksFromEl(el) {
    const blocks = [];
    el.querySelectorAll('pre code, pre').forEach(codeEl => {
      const raw = codeEl.textContent.trim();
      if (raw.length < 10) return;
      const classes = (codeEl.className || '') + ' ' + (codeEl.parentElement?.className || '');
      const langMatch = classes.match(/language-(\w+)|lang-(\w+)|highlight-source-(\w+)/);
      const language = langMatch ? (langMatch[1] || langMatch[2] || langMatch[3]) : '';
      blocks.push({ language, code: raw.slice(0, 2000) });
    });
    return blocks;
  }

  function extractImagesFromEl(el) {
    const images = [];
    el.querySelectorAll('img[src]').forEach(img => {
      const src = img.src || '';
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (!src || (w > 0 && w < 50) || (h > 0 && h < 50)) return;
      if (src.startsWith('data:image/svg') || src.includes('/avatar') || src.includes('/icon')) return;
      images.push({ url: src.slice(0, 500), alt: (img.alt || '').slice(0, 200) });
    });
    return images;
  }

  // Generic conversation extraction that works for most chat UIs
  function genericGetConversation() {
    const turns = [];
    const selectors = [
      '[data-message-author-role]',
      '[data-testid="user-message"], [data-testid="ai-message"]',
      '.message.user, .message.assistant, .message.bot',
      '.chat-message, .conversation-turn',
      '.human-message, .ai-message',
      '.user-msg, .bot-msg, .assistant-msg',
      '[class*="message-row"]',
      '[class*="ChatMessage"]',
      '[role="article"]',
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length >= 2) {
        els.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            const role = el.getAttribute('data-message-author-role');
            const isUser = role === 'user'
              || el.matches('[data-testid="user-message"], .user, .human-message, .user-msg, .message.user')
              || el.classList.contains('user')
              || el.classList.contains('human');
            turns.push({ role: isUser ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        break;
      }
    }

    return turns.slice(-8);
  }

  // Generic artifact extraction
  function genericGetArtifacts() {
    const codeBlocks = extractCodeBlocksFromEl(document.body);
    const images = [];
    document.querySelectorAll('.message, .response, [class*="message"], [class*="response"], [class*="answer"]').forEach(el => {
      images.push(...extractImagesFromEl(el));
    });
    return { codeBlocks: codeBlocks.slice(0, 10), images: images.slice(0, 5) };
  }

  // Generic input finder
  function genericGetInput() {
    const selectors = [
      '#prompt-textarea',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="ask" i]',
      'textarea[placeholder*="chat" i]',
      'textarea[placeholder*="type" i]',
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="send" i]',
      '[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][data-placeholder]',
      '.chat-input textarea',
      '.input-area textarea',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // Last resort: any large textarea near the bottom
    const textareas = [...document.querySelectorAll('textarea')];
    if (textareas.length > 0) {
      return textareas.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];
    }
    return document.querySelector('[contenteditable="true"]');
  }

  // --- Known AI Tools (comprehensive list) ---

  const AI_TOOLS = [
    {
      name: 'ChatGPT',
      patterns: [/chat\.openai\.com/, /chatgpt\.com/],
      getInput: () => document.querySelector('#prompt-textarea, textarea[data-id="root"], textarea[placeholder*="Message" i]'),
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('[data-message-author-role]').forEach(el => {
          const role = el.getAttribute('data-message-author-role');
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            turns.push({ role: role === 'user' ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.slice(-8);
      },
      getArtifacts: () => {
        const codeBlocks = [];
        const images = [];
        document.querySelectorAll('[data-message-author-role="assistant"]').forEach(el => {
          codeBlocks.push(...extractCodeBlocksFromEl(el));
          images.push(...extractImagesFromEl(el));
        });
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
      name: 'Claude',
      patterns: [/claude\.ai/],
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
        return turns.slice(-8);
      },
      getArtifacts: () => {
        const codeBlocks = [];
        const images = [];
        document.querySelectorAll('[data-testid="ai-message"], .font-claude-message').forEach(el => {
          codeBlocks.push(...extractCodeBlocksFromEl(el));
          images.push(...extractImagesFromEl(el));
        });
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
      name: 'Gemini',
      patterns: [/gemini\.google\.com/],
      getInput: () => document.querySelector('.ql-editor, div[contenteditable="true"][aria-label], .text-input-field textarea, [contenteditable="true"]'),
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('.conversation-container .query-text, .conversation-container .response-text, .user-query, .model-response, [data-message-id]').forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            const isUser = el.closest('.query-text, .user-query') !== null || el.classList.contains('query-text');
            turns.push({ role: isUser ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.slice(-8);
      },
      getArtifacts: () => {
        const codeBlocks = [];
        const images = [];
        document.querySelectorAll('.model-response, .response-text, [class*="response"]').forEach(el => {
          codeBlocks.push(...extractCodeBlocksFromEl(el));
          images.push(...extractImagesFromEl(el));
        });
        return { codeBlocks: codeBlocks.slice(0, 10), images: images.slice(0, 5) };
      },
    },
    {
      name: 'Perplexity',
      patterns: [/perplexity\.ai/],
      getInput: () => document.querySelector('textarea[placeholder*="ask" i], textarea[placeholder*="follow" i], textarea'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Copilot',
      patterns: [/copilot\.microsoft\.com/],
      getInput: () => document.querySelector('#searchbox, textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Poe',
      patterns: [/poe\.com/],
      getInput: () => document.querySelector('textarea[class*="GrowingTextArea"], textarea'),
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('[class*="Message_row"]').forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            const isUser = el.querySelector('[class*="Message_humanMessage"]') !== null;
            turns.push({ role: isUser ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.length >= 2 ? turns.slice(-8) : genericGetConversation();
      },
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'DeepSeek',
      patterns: [/chat\.deepseek\.com/],
      getInput: () => document.querySelector('textarea, #chat-input, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Grok',
      patterns: [/grok\.com/, /x\.com\/i\/grok/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Mistral',
      patterns: [/chat\.mistral\.ai/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'HuggingChat',
      patterns: [/huggingface\.co\/chat/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Pi',
      patterns: [/pi\.ai/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Cohere',
      patterns: [/coral\.cohere\.com/, /dashboard\.cohere\.com/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'You.com',
      patterns: [/you\.com/],
      getInput: () => document.querySelector('textarea, input[type="text"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Meta AI',
      patterns: [/meta\.ai/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Phind',
      patterns: [/phind\.com/],
      getInput: () => document.querySelector('textarea, [contenteditable="true"]'),
      getConversation: genericGetConversation,
      getArtifacts: genericGetArtifacts,
    },
    {
      name: 'Notion AI',
      patterns: [/notion\.so/],
      getInput: () => document.querySelector('.notion-page-content [contenteditable="true"]'),
      getConversation: () => [],
      getArtifacts: () => ({ codeBlocks: [], images: [] }),
    },
  ];

  // --- Heuristic AI Tool Detection ---

  function detectAIToolHeuristic() {
    const url = window.location.href.toLowerCase();
    const title = (document.title || '').toLowerCase();
    const hostname = window.location.hostname.toLowerCase();

    const aiKeywords = ['chat', 'ai', 'assistant', 'copilot', 'llm', 'gpt', 'bot', 'prompt'];
    const hasAIKeyword = aiKeywords.some(kw => url.includes(kw) || title.includes(kw) || hostname.includes(kw));

    const hasChatInput = !!document.querySelector(
      'textarea[placeholder*="message" i], textarea[placeholder*="ask" i], textarea[placeholder*="chat" i], textarea[placeholder*="prompt" i], textarea[placeholder*="type" i], textarea[placeholder*="send" i]'
    );

    const messagePatterns = [
      '[class*="message"]', '[class*="Message"]',
      '[class*="chat"]', '[class*="Chat"]',
      '[data-role]', '[data-message]',
      '[class*="turn"]', '[class*="Turn"]',
      '[class*="response"]', '[class*="query"]',
      '[role="article"]',
    ];
    let messageCount = 0;
    for (const pat of messagePatterns) {
      messageCount = Math.max(messageCount, document.querySelectorAll(pat).length);
    }
    const hasChatMessages = messageCount >= 2;

    const hasContentEditable = !!document.querySelector('[contenteditable="true"][role="textbox"], [contenteditable="true"][data-placeholder]');

    let score = 0;
    if (hasAIKeyword) score += 2;
    if (hasChatInput) score += 3;
    if (hasChatMessages) score += 3;
    if (hasContentEditable) score += 1;

    const metaDesc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || '';
    if (aiKeywords.some(kw => metaDesc.includes(kw))) score += 1;

    if (score >= 4) {
      const parts = hostname.replace('www.', '').split('.');
      const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

      return {
        name: name + ' AI',
        detected: 'heuristic',
        getInput: genericGetInput,
        getConversation: genericGetConversation,
        getArtifacts: genericGetArtifacts,
      };
    }

    return null;
  }

  // --- Detect which AI tool we're on ---

  function detectActiveTool() {
    const currentUrl = window.location.href;
    const known = AI_TOOLS.find(tool =>
      tool.patterns.some(p => p.test(currentUrl))
    );
    if (known) return known;
    return detectAIToolHeuristic();
  }

  let activeTool = detectActiveTool();

  // --- Intercept History API for SPA navigation ---

  const _pushState = history.pushState;
  const _replaceState = history.replaceState;

  history.pushState = function (...args) {
    _pushState.apply(this, args);
    window.dispatchEvent(new Event('contextiq:navigation'));
  };

  history.replaceState = function (...args) {
    _replaceState.apply(this, args);
    window.dispatchEvent(new Event('contextiq:navigation'));
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('contextiq:navigation'));
  });

  // --- Unified Navigation Handler ---

  let lastNavUrl = window.location.href;

  function onNavigation() {
    const currentUrl = window.location.href;
    if (currentUrl === lastNavUrl) return;
    lastNavUrl = currentUrl;

    const newTool = detectActiveTool();
    if (newTool) {
      activeTool = newTool;
      if (!window.__contextiq_ui_ready) {
        initUI(activeTool);
      } else {
        updateToolDisplay(activeTool);
        notifyToolDetected(activeTool);
      }
    }
  }

  window.addEventListener('contextiq:navigation', () => {
    setTimeout(onNavigation, 300);
  });

  // --- Notify background of detected tool ---

  function notifyToolDetected(tool) {
    try {
      chrome.runtime.sendMessage({
        type: 'AI_TOOL_DETECTED',
        toolName: tool.name,
        isHeuristic: tool.detected === 'heuristic',
        url: window.location.href,
      }).catch(() => {});
    } catch {
      // Extension context may be invalidated
    }
  }

  // --- Listen for messages from background ---

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING_CONTENT_SCRIPT') {
      sendResponse({
        alive: true,
        toolDetected: activeTool?.name || null,
        url: window.location.href,
      });
      return true;
    }

    if (message.type === 'FORCE_DETECT') {
      activeTool = detectActiveTool();
      if (activeTool && !window.__contextiq_ui_ready) {
        initUI(activeTool);
      }
      sendResponse({ detected: activeTool?.name || null });
      return true;
    }

    if (message.type === 'QUICK_BRIDGE') {
      if (activeTool) {
        const conversation = activeTool.getConversation();
        const artifacts = activeTool.getArtifacts();
        sendResponse({
          toolName: activeTool.name,
          url: window.location.href,
          title: document.title,
          turns: conversation,
          codeBlocks: artifacts.codeBlocks,
          images: artifacts.images,
        });
      } else {
        sendResponse({ error: 'No AI tool detected' });
      }
      return true;
    }

    if (message.type === 'GET_SELECTED_TEXT') {
      const sel = window.getSelection();
      sendResponse({ text: sel ? sel.toString() : '' });
      return true;
    }

    if (message.type === 'INSERT_PROMPT') {
      const text = message.text || '';
      let inserted = false;

      if (activeTool && activeTool.getInput) {
        const selectors = [
          'textarea[data-id="root"]',
          'div.ProseMirror[contenteditable="true"]',
          'div[contenteditable="true"]',
          'textarea',
          'div[role="textbox"]',
        ];

        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
              )?.set || Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype, 'value'
              )?.set;
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(el, text);
              } else {
                el.value = text;
              }
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.focus();
              inserted = true;
            } else {
              el.focus();
              el.textContent = text;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              inserted = true;
            }
            break;
          }
        }
      }

      sendResponse({ success: inserted });
      return true;
    }

    if (message.type === 'COPY_TO_CLIPBOARD') {
      navigator.clipboard.writeText(message.text || '').then(() => {
        sendResponse({ success: true });
      }).catch(() => {
        sendResponse({ success: false });
      });
      return true;
    }

    return false;
  });

  // Fast exit if not an AI tool — but keep watching
  if (!activeTool) {
    watchForAITool();
    return;
  }

  // Notify background we're on an AI tool
  notifyToolDetected(activeTool);
  initUI(activeTool);

  // --- SPA Navigation Watcher ---

  function watchForAITool() {
    let detected = false;
    let recheckCount = 0;

    const observer = new MutationObserver(() => {
      if (detected) return;
      recheckCount++;
      if (recheckCount % 5 !== 0) return;

      const tool = detectActiveTool();
      if (tool) {
        detected = true;
        observer.disconnect();
        activeTool = tool;
        notifyToolDetected(tool);
        if (!window.__contextiq_ui_ready) {
          initUI(tool);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const poll = setInterval(() => {
      if (detected) {
        clearInterval(poll);
        return;
      }
      const tool = detectActiveTool();
      if (tool) {
        detected = true;
        clearInterval(poll);
        observer.disconnect();
        activeTool = tool;
        notifyToolDetected(tool);
        if (!window.__contextiq_ui_ready) {
          initUI(tool);
        }
      }
    }, 2000);

    setTimeout(() => {
      if (!detected) {
        observer.disconnect();
        clearInterval(poll);
      }
    }, 60000);

    window.addEventListener('contextiq:navigation', () => {
      if (detected) return;
      setTimeout(() => {
        const tool = detectActiveTool();
        if (tool) {
          detected = true;
          observer.disconnect();
          clearInterval(poll);
          activeTool = tool;
          notifyToolDetected(tool);
          if (!window.__contextiq_ui_ready) {
            initUI(tool);
          }
        }
      }, 500);
    });
  }

  // Watch for URL changes within detected AI tools
  let lastKnownUrl = window.location.href;
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastKnownUrl) {
      lastKnownUrl = currentUrl;
      const newTool = detectActiveTool();
      if (newTool) {
        activeTool = newTool;
        notifyToolDetected(newTool);
      }
    }
  }, 2000);

  // --- Update tool display without rebuilding entire UI ---

  function updateToolDisplay(tool) {
    const toolNameEl = document.querySelector('#menu-tool-name');
    if (toolNameEl) toolNameEl.textContent = tool.name;
    const fabTool = document.querySelector('#contextiq-fab-tool');
    if (fabTool) fabTool.textContent = tool.name;
  }

  // --- Build and Init the UI ---

  function initUI(tool) {
    if (window.__contextiq_ui_ready) return;
    window.__contextiq_ui_ready = true;

    const container = document.createElement('div');
    container.id = 'contextiq-inject-btn';
    container.innerHTML = `
      <!-- Bridge Notification Bar (appears when context is ready to inject) -->
      <div class="contextiq-bridge-bar hidden" id="contextiq-bridge-bar">
        <div class="contextiq-bridge-bar-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </div>
        <div class="contextiq-bridge-bar-content">
          <span class="contextiq-bridge-bar-label">Pick up where you left off in <strong id="bridge-bar-tool"></strong></span>
          <span class="contextiq-bridge-bar-topic" id="bridge-bar-topic"></span>
        </div>
        <button class="contextiq-bridge-bar-action" id="bridge-bar-insert">Paste into chat</button>
        <button class="contextiq-bridge-bar-dismiss" id="bridge-bar-dismiss">&times;</button>
      </div>

      <!-- FAB — compact, icon-first -->
      <div class="contextiq-fab" title="ContextIQ — save & bridge your AI conversations">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
        <span class="contextiq-fab-badge hidden" id="contextiq-badge"></span>
      </div>

      <!-- Menu Panel — simplified -->
      <div class="contextiq-menu hidden">
        <div class="contextiq-menu-header">
          <div class="contextiq-menu-header-left">
            <span class="contextiq-menu-title">ContextIQ</span>
            <span class="contextiq-menu-tool" id="menu-tool-name">${esc(tool.name)}</span>
          </div>
          ${tool.detected === 'heuristic' ? '<span class="contextiq-menu-detected">auto-detected</span>' : ''}
        </div>

        <!-- Live capture indicator (compact) -->
        <div class="contextiq-live-status" id="live-status">
          <span class="contextiq-live-dot"></span>
          <span class="contextiq-live-text" id="live-text">Listening for conversation...</span>
        </div>

        <!-- Recent conversations from other tools -->
        <div class="contextiq-threads" id="menu-threads"></div>

        <!-- Actions — 2 clear buttons -->
        <div class="contextiq-menu-actions">
          <button class="contextiq-btn contextiq-btn-save" id="btn-save" title="Save this conversation to your library">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Save conversation
          </button>
          <button class="contextiq-btn contextiq-btn-copy" id="btn-copy" title="Copy conversation to clipboard" disabled>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>

        <!-- Keyboard shortcut hint -->
        <div class="contextiq-menu-hint">
          Press <kbd>Alt+B</kbd> to quick-bridge this conversation
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
    const menuThreads = container.querySelector('#menu-threads');
    const liveStatus = container.querySelector('#live-status');
    const liveText = container.querySelector('#live-text');
    const btnCopy = container.querySelector('#btn-copy');
    const btnSave = container.querySelector('#btn-save');

    let contextText = '';
    let bridgePrompt = '';
    let isMenuOpen = false;
    let bridgeBarDismissed = false;

    // --- Real-time Conversation Capture ---

    let liveConversationCount = 0;
    let liveCodeBlockCount = 0;

    function setupLiveCapture() {
      let debounceTimer = null;

      const liveObserver = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const conversation = activeTool.getConversation();
          const artifacts = activeTool.getArtifacts();

          const newTurnCount = conversation.length;
          const newCodeCount = artifacts.codeBlocks.length;

          if (newTurnCount !== liveConversationCount || newCodeCount !== liveCodeBlockCount) {
            liveConversationCount = newTurnCount;
            liveCodeBlockCount = newCodeCount;

            const parts = [];
            if (newTurnCount > 0) parts.push(`${newTurnCount} turns`);
            if (newCodeCount > 0) parts.push(`${newCodeCount} code blocks`);
            if (artifacts.images.length > 0) parts.push(`${artifacts.images.length} images`);

            if (parts.length > 0) {
              liveText.textContent = `Captured: ${parts.join(', ')}`;
              liveStatus.classList.add('active');
              btnCopy.disabled = false;
            } else {
              liveText.textContent = 'Listening for conversation...';
              liveStatus.classList.remove('active');
            }
          }
        }, 1000);
      });

      liveObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    setupLiveCapture();

    // --- Bridge Notification ---

    async function checkBridgeNotification() {
      if (bridgeBarDismissed) return;
      try {
        const resp = await chrome.runtime.sendMessage({
          type: 'GET_BRIDGE_NOTIFICATION',
          currentTool: activeTool.name,
        });
        if (resp && resp.hasContext) {
          bridgeBarTool.textContent = resp.latestTool;
          let topicText = `"${resp.latestTopic}"`;
          const hints = [];
          if (resp.totalCodeBlocks > 0) hints.push(`${resp.totalCodeBlocks} code block${resp.totalCodeBlocks !== 1 ? 's' : ''}`);
          if (resp.totalImages > 0) hints.push(`${resp.totalImages} image${resp.totalImages !== 1 ? 's' : ''}`);
          if (hints.length > 0) topicText += ` + ${hints.join(', ')}`;
          bridgeBarTopic.textContent = topicText;
          bridgeBar.classList.remove('hidden');
          badge.textContent = resp.totalConversations;
          badge.classList.remove('hidden');
        }
      } catch {
        // Extension context may be invalidated
      }
    }

    // --- Pending Bridge Check ---

    async function checkPendingBridge() {
      try {
        const resp = await chrome.runtime.sendMessage({ type: 'GET_PENDING_BRIDGE' });
        if (resp && resp.bridge) {
          const bridge = resp.bridge;
          bridgeBarTool.textContent = bridge.sourceToolName || 'another tool';
          bridgeBarTopic.textContent = bridge.topic ? `"${bridge.topic}"` : 'Context ready to paste';
          bridgeBar.classList.remove('hidden');
          bridgePrompt = bridge.text;
          badge.textContent = '!';
          badge.classList.remove('hidden');

          // Wait for input to be available and auto-inject
          const waitAndInject = (retries = 40) => {
            const input = activeTool.getInput();
            if (input) {
              const isEmpty = input.tagName === 'TEXTAREA' || input.tagName === 'INPUT'
                ? !input.value.trim()
                : !input.textContent.trim();
              if (isEmpty) {
                injectIntoInput(input, bridge.text);
                showFeedback(`Context from ${bridge.sourceToolName} pasted`);
                bridgeBar.classList.add('hidden');
                bridgeBarDismissed = true;
              }
            } else if (retries > 0) {
              setTimeout(() => waitAndInject(retries - 1), 500);
            }
          };
          setTimeout(() => waitAndInject(), 1000);
          return true;
        }
      } catch {
        // Extension context may be invalidated
      }
      return false;
    }

    setTimeout(async () => {
      const hadPending = await checkPendingBridge();
      if (!hadPending) {
        checkBridgeNotification();
      }
    }, 1500);

    // --- Event Handlers ---

    bridgeBarDismiss.addEventListener('click', (e) => {
      e.stopPropagation();
      bridgeBar.classList.add('hidden');
      bridgeBarDismissed = true;
    });

    bridgeBarInsert.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (bridgePrompt) {
        const input = activeTool.getInput();
        if (input) {
          injectIntoInput(input, bridgePrompt);
          showFeedback('Context pasted into chat');
          bridgeBar.classList.add('hidden');
          bridgeBarDismissed = true;
          return;
        }
      }
      try {
        const resp = await chrome.runtime.sendMessage({
          type: 'GENERATE_BRIDGE_PROMPT',
          currentTool: activeTool.name,
        });
        if (resp && resp.prompt) {
          const input = activeTool.getInput();
          if (input) {
            injectIntoInput(input, resp.prompt);
            showFeedback('Context pasted into chat');
          } else {
            showFeedback('Could not find the chat input');
          }
          bridgeBar.classList.add('hidden');
          bridgeBarDismissed = true;
        } else {
          showFeedback('No context available yet');
        }
      } catch {
        showFeedback('Could not load context');
      }
    });

    // Toggle menu
    fab.addEventListener('click', async (e) => {
      e.stopPropagation();
      isMenuOpen = !isMenuOpen;
      menu.classList.toggle('hidden', !isMenuOpen);
      if (isMenuOpen) await loadMenuData();
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        isMenuOpen = false;
        menu.classList.add('hidden');
      }
    });

    // Copy
    btnCopy.addEventListener('click', async (e) => {
      e.stopPropagation();
      const conversation = activeTool.getConversation();
      const artifacts = activeTool.getArtifacts();
      const text = buildCopyText(activeTool.name, conversation, artifacts);
      if (!text) return;
      await navigator.clipboard.writeText(text);
      showFeedback('Conversation copied');
    });

    // Save
    btnSave.addEventListener('click', async (e) => {
      e.stopPropagation();
      const conversation = activeTool.getConversation();
      const artifacts = activeTool.getArtifacts();
      if (!conversation.length && !artifacts.codeBlocks.length && !artifacts.images.length) {
        showFeedback('No conversation to save yet');
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
        showFeedback(`Saved: ${parts.join(', ')}`);
      } catch {
        showFeedback('Could not save — try again');
      }
    });

    // --- Load Menu Data ---

    async function loadMenuData() {
      try {
        const [ctxResp, bridgeResp, notifResp] = await Promise.all([
          chrome.runtime.sendMessage({ type: 'GET_CONTEXT_FOR_AI' }),
          chrome.runtime.sendMessage({ type: 'GENERATE_BRIDGE_PROMPT', currentTool: activeTool.name }),
          chrome.runtime.sendMessage({ type: 'GET_BRIDGE_NOTIFICATION', currentTool: activeTool.name }),
        ]);

        contextText = ctxResp.context || '';
        bridgePrompt = bridgeResp?.prompt || '';

        const toolNameEl = container.querySelector('#menu-tool-name');
        if (toolNameEl) toolNameEl.textContent = activeTool.name;

        renderThreads(notifResp);
        btnCopy.disabled = !contextText && !bridgePrompt && liveConversationCount === 0;
      } catch (err) {
        // Silently handle errors
      }
    }

    function renderThreads(notifResp) {
      if (!notifResp || !notifResp.hasContext) {
        menuThreads.innerHTML = `
          <div class="contextiq-threads-empty">
            <span>No conversations from other AI tools yet</span>
            <span class="contextiq-threads-hint">Chat in another AI tool and it will show up here for easy bridging</span>
          </div>
        `;
        return;
      }
      chrome.runtime.sendMessage({ type: 'GET_AI_BRIDGE_SUMMARY' }).then(summary => {
        if (!summary || !summary.threads || summary.threads.length === 0) {
          menuThreads.innerHTML = `<div class="contextiq-threads-empty"><span>No conversations found</span></div>`;
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
              <div class="contextiq-thread">
                <div class="contextiq-thread-icon">${getToolIcon(t.toolName)}</div>
                <div class="contextiq-thread-info">
                  <span class="contextiq-thread-topic">${esc(t.topic)}</span>
                  <span class="contextiq-thread-meta">${esc(t.toolName)} · ${t.turnCount} turns${badges.length ? ' · ' : ''}${badges.join(' ')} · ${ago}</span>
                </div>
              </div>
            `;
          }).join('');
        if (threadHtml) {
          menuThreads.innerHTML = `<div class="contextiq-threads-label">From other AI tools</div>${threadHtml}`;
        } else {
          menuThreads.innerHTML = `<div class="contextiq-threads-empty"><span>All recent conversations are on ${activeTool.name}</span></div>`;
        }
      }).catch(() => {
        menuThreads.innerHTML = '';
      });
    }

    // --- Auto-save conversation periodically ---
    let lastSavedHash = '';
    setInterval(async () => {
      try {
        const conversation = activeTool.getConversation();
        const artifacts = activeTool.getArtifacts();
        const hash = `${conversation.length}:${artifacts.codeBlocks.length}:${artifacts.images.length}:${window.location.href}`;
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

              try {
                const bridgeResp = await chrome.runtime.sendMessage({
                  type: 'GENERATE_BRIDGE_PROMPT',
                  currentTool: activeTool.name,
                });
                if (bridgeResp?.prompt) {
                  injectIntoInput(input, bridgeResp.prompt);
                  showFeedback('Context auto-pasted');
                  return;
                }
              } catch {
                // Fall through
              }

              const ctxResp = await chrome.runtime.sendMessage({ type: 'GET_CONTEXT_FOR_AI' });
              if (!ctxResp?.context) return;
              injectIntoInput(input, ctxResp.context);
              showFeedback('Context auto-pasted');
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
  }

  // --- Shared Helpers ---

  function injectIntoInput(input, text) {
    if (!input) return;
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      const existing = input.value;
      const prefix = text + '\n\n---\n\n';
      input.value = prefix + existing;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.setSelectionRange(input.value.length, input.value.length);
      input.focus();
    } else {
      const prefix = text + '\n\n---\n\n';
      const existingText = input.textContent;
      input.textContent = '';
      prefix.split('\n').forEach((line, i, arr) => {
        input.appendChild(document.createTextNode(line));
        if (i < arr.length - 1) input.appendChild(document.createElement('br'));
      });
      if (existingText) input.appendChild(document.createTextNode(existingText));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
      const range = document.createRange();
      range.selectNodeContents(input);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function buildCopyText(toolName, conversation, artifacts) {
    const lines = [`[From ${toolName} via ContextIQ]`, ''];
    if (artifacts.codeBlocks?.length > 0) {
      for (const block of artifacts.codeBlocks.slice(0, 5)) {
        lines.push('```' + (block.language || ''), block.code.slice(0, 2000), '```', '');
      }
    }
    if (conversation.length > 0) {
      for (const turn of conversation.slice(-6)) {
        const role = turn.role === 'user' ? 'You' : toolName;
        lines.push(`${role}: ${turn.text.length > 300 ? turn.text.slice(0, 300) + '...' : turn.text}`);
      }
    }
    return lines.join('\n');
  }

  function showFeedback(message) {
    const container = document.getElementById('contextiq-inject-btn');
    if (!container) return;
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
      Perplexity: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      Copilot: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
      Notion: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>',
    };
    const defaultIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    return icons[toolName] || defaultIcon;
  }
})();
