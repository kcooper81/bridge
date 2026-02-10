// ContextIQ AI Injector Content Script
// Detects AI tool pages, captures conversation context, and bridges it across tools

(async () => {
  const AI_TOOLS = [
    {
      name: 'ChatGPT',
      patterns: [/chat\.openai\.com/, /chatgpt\.com/],
      inputSelector: '#prompt-textarea, textarea[data-id="root"]',
      getInput: () => document.querySelector('#prompt-textarea, textarea[data-id="root"]'),
      // Selectors for capturing conversation turns
      getConversation: () => {
        const turns = [];
        document.querySelectorAll('[data-message-author-role]').forEach(el => {
          const role = el.getAttribute('data-message-author-role');
          const text = el.textContent.trim();
          if (text && text.length > 10) {
            turns.push({ role: role === 'user' ? 'user' : 'assistant', text: text.slice(0, 500) });
          }
        });
        return turns.slice(-6); // Last 6 turns
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
    },
    {
      name: 'Notion',
      patterns: [/notion\.so/],
      inputSelector: '.notion-page-content [contenteditable="true"]',
      getInput: () => document.querySelector('.notion-page-content [contenteditable="true"]'),
      getConversation: () => [], // Notion doesn't have conversations
    },
  ];

  // Detect which AI tool we're on
  const currentUrl = window.location.href;
  const activeTool = AI_TOOLS.find(tool =>
    tool.patterns.some(p => p.test(currentUrl))
  );

  if (!activeTool) return;

  // Create the floating inject button
  const btn = document.createElement('div');
  btn.id = 'contextiq-inject-btn';
  btn.innerHTML = `
    <div class="contextiq-fab" title="ContextIQ — bridge your AI conversations">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span class="contextiq-fab-label">ContextIQ</span>
    </div>
    <div class="contextiq-menu hidden">
      <div class="contextiq-menu-header">
        <span class="contextiq-menu-title">Context Bridge</span>
        <span class="contextiq-menu-tool">${activeTool.name}</span>
      </div>
      <div class="contextiq-menu-project">Loading...</div>
      <div class="contextiq-menu-stats"></div>

      <div class="contextiq-menu-section">
        <div class="contextiq-section-label">Inject</div>
        <div class="contextiq-menu-actions">
          <button class="contextiq-btn contextiq-btn-inject" title="Insert project context + recent AI conversations into this chat">
            Full Context
          </button>
          <button class="contextiq-btn contextiq-btn-bridge" title="Insert just the cross-tool conversation summary">
            AI Bridge
          </button>
          <button class="contextiq-btn contextiq-btn-copy" title="Copy to clipboard">
            Copy
          </button>
        </div>
      </div>

      <div class="contextiq-menu-section">
        <div class="contextiq-section-label">Capture</div>
        <div class="contextiq-menu-actions">
          <button class="contextiq-btn contextiq-btn-save" title="Save this conversation's context to your active project">
            Save Chat
          </button>
        </div>
      </div>

      <div class="contextiq-menu-preview"></div>
    </div>
  `;
  document.body.appendChild(btn);

  const fab = btn.querySelector('.contextiq-fab');
  const menu = btn.querySelector('.contextiq-menu');
  const menuProject = btn.querySelector('.contextiq-menu-project');
  const menuStats = btn.querySelector('.contextiq-menu-stats');
  const menuPreview = btn.querySelector('.contextiq-menu-preview');
  const btnInject = btn.querySelector('.contextiq-btn-inject');
  const btnBridge = btn.querySelector('.contextiq-btn-bridge');
  const btnCopy = btn.querySelector('.contextiq-btn-copy');
  const btnSave = btn.querySelector('.contextiq-btn-save');

  let contextText = '';
  let bridgeText = '';
  let isMenuOpen = false;

  // Toggle menu
  fab.addEventListener('click', async (e) => {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
    menu.classList.toggle('hidden', !isMenuOpen);

    if (isMenuOpen) {
      await loadContext();
    }
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target)) {
      isMenuOpen = false;
      menu.classList.add('hidden');
    }
  });

  async function loadContext() {
    try {
      const [ctxResp, projResp, bridgeResp] = await Promise.all([
        chrome.runtime.sendMessage({ type: 'GET_CONTEXT_FOR_AI' }),
        chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROJECT' }),
        chrome.runtime.sendMessage({ type: 'GET_AI_BRIDGE_CONTEXT', currentTool: activeTool.name }),
      ]);

      contextText = ctxResp.context || '';
      bridgeText = bridgeResp?.bridgeContext || '';
      const project = projResp.project;

      // Build the full context = project context + bridge context
      if (bridgeText) {
        contextText = contextText
          ? contextText + '\n\n' + bridgeText
          : bridgeText;
      }

      if (contextText) {
        const projectName = project?.name || 'Unknown Project';
        menuProject.textContent = projectName;

        // Stats
        if (project) {
          const itemCount = project.items?.length || 0;
          const convCount = bridgeResp?.conversationCount || 0;
          const toolNames = bridgeResp?.toolsUsed || [];
          let statsText = `${itemCount} resources`;
          if (convCount > 0) statsText += ` | ${convCount} AI chats`;
          if (toolNames.length > 0) statsText += ` | ${toolNames.join(', ')}`;
          menuStats.textContent = statsText;
          menuStats.style.display = 'block';
        } else {
          menuStats.style.display = 'none';
        }

        menuPreview.textContent = contextText.length > 300
          ? contextText.slice(0, 300) + '...'
          : contextText;
        btnInject.disabled = false;
        btnCopy.disabled = false;
        btnBridge.disabled = !bridgeText;
      } else {
        menuProject.textContent = 'No active project';
        menuStats.style.display = 'none';
        menuPreview.textContent = 'Start browsing to capture context.';
        btnInject.disabled = true;
        btnCopy.disabled = true;
        btnBridge.disabled = true;
      }
    } catch (err) {
      menuProject.textContent = 'Error loading context';
      menuPreview.textContent = err.message;
    }
  }

  // --- Inject Handlers ---

  // Full context inject (project + bridge)
  btnInject.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!contextText) return;
    injectIntoInput(contextText);
    showFeedback('Full context injected');
    isMenuOpen = false;
    menu.classList.add('hidden');
  });

  // Bridge-only inject (just cross-tool conversation context)
  btnBridge.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!bridgeText) return;
    injectIntoInput(bridgeText);
    showFeedback('AI bridge context injected');
    isMenuOpen = false;
    menu.classList.add('hidden');
  });

  // Copy to clipboard
  btnCopy.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!contextText) return;
    await navigator.clipboard.writeText(contextText);
    showFeedback('Copied to clipboard');
  });

  // Save current conversation context
  btnSave.addEventListener('click', async (e) => {
    e.stopPropagation();
    const conversation = activeTool.getConversation();
    if (!conversation.length) {
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
      });
      showFeedback(`Saved ${conversation.length} turns from ${activeTool.name}`);
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
    btn.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  // --- Auto-save conversation periodically ---
  let lastSavedTurns = 0;
  setInterval(async () => {
    try {
      const conversation = activeTool.getConversation();
      if (conversation.length > lastSavedTurns && conversation.length >= 2) {
        await chrome.runtime.sendMessage({
          type: 'SAVE_AI_CONVERSATION',
          toolName: activeTool.name,
          url: window.location.href,
          title: document.title,
          turns: conversation,
        });
        lastSavedTurns = conversation.length;
      }
    } catch {
      // Extension context may be invalidated
    }
  }, 30000); // Every 30 seconds

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

            await loadContext();
            if (!contextText) return;

            if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
              if (input.value.trim()) return;
              input.value = contextText + '\n\n---\n\n';
              input.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              if (input.textContent.trim()) return;
              input.innerHTML = contextText.replace(/\n/g, '<br>') + '<br><br>---<br><br>';
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
