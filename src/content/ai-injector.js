// ContextIQ AI Injector Content Script
// Detects AI tool pages and provides context injection capabilities

(async () => {
  const AI_TOOLS = [
    {
      name: 'ChatGPT',
      patterns: [/chat\.openai\.com/, /chatgpt\.com/],
      inputSelector: '#prompt-textarea, textarea[data-id="root"]',
      getInput: () => document.querySelector('#prompt-textarea, textarea[data-id="root"]'),
    },
    {
      name: 'Gemini',
      patterns: [/gemini\.google\.com/],
      inputSelector: '.ql-editor, [contenteditable="true"]',
      getInput: () => document.querySelector('.ql-editor, [contenteditable="true"]'),
    },
    {
      name: 'Claude',
      patterns: [/claude\.ai/],
      inputSelector: '[contenteditable="true"].ProseMirror, div[contenteditable="true"]',
      getInput: () => document.querySelector('[contenteditable="true"].ProseMirror, div[contenteditable="true"]'),
    },
    {
      name: 'Notion',
      patterns: [/notion\.so/],
      inputSelector: '.notion-page-content [contenteditable="true"]',
      getInput: () => document.querySelector('.notion-page-content [contenteditable="true"]'),
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
    <div class="contextiq-fab" title="Inject ContextIQ context">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span class="contextiq-fab-label">ContextIQ</span>
    </div>
    <div class="contextiq-menu hidden">
      <div class="contextiq-menu-header">
        <span class="contextiq-menu-title">Inject Context</span>
      </div>
      <div class="contextiq-menu-project">Loading...</div>
      <div class="contextiq-menu-actions">
        <button class="contextiq-btn contextiq-btn-inject">Insert into chat</button>
        <button class="contextiq-btn contextiq-btn-copy">Copy to clipboard</button>
      </div>
      <div class="contextiq-menu-preview"></div>
    </div>
  `;
  document.body.appendChild(btn);

  const fab = btn.querySelector('.contextiq-fab');
  const menu = btn.querySelector('.contextiq-menu');
  const menuProject = btn.querySelector('.contextiq-menu-project');
  const menuPreview = btn.querySelector('.contextiq-menu-preview');
  const btnInject = btn.querySelector('.contextiq-btn-inject');
  const btnCopy = btn.querySelector('.contextiq-btn-copy');

  let contextText = '';
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
      const response = await chrome.runtime.sendMessage({ type: 'GET_CONTEXT_FOR_AI' });
      contextText = response.context || '';

      if (contextText) {
        const projectResponse = await chrome.runtime.sendMessage({ type: 'GET_ACTIVE_PROJECT' });
        const projectName = projectResponse.project?.name || 'Unknown Project';
        menuProject.textContent = projectName;
        menuPreview.textContent = contextText.length > 200
          ? contextText.slice(0, 200) + '...'
          : contextText;
        btnInject.disabled = false;
        btnCopy.disabled = false;
      } else {
        menuProject.textContent = 'No active project';
        menuPreview.textContent = 'Start browsing to capture context.';
        btnInject.disabled = true;
        btnCopy.disabled = true;
      }
    } catch (err) {
      menuProject.textContent = 'Error loading context';
      menuPreview.textContent = err.message;
    }
  }

  // Inject into chat input
  btnInject.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!contextText) return;

    const input = activeTool.getInput();
    if (!input) {
      showFeedback('Could not find input field');
      return;
    }

    // Handle both textarea and contenteditable
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      const existing = input.value;
      const prefix = contextText + '\n\n---\n\n';
      input.value = prefix + existing;
      // Trigger input event for React/Vue controlled inputs
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // contenteditable
      const prefix = contextText + '\n\n---\n\n';
      const existingHtml = input.innerHTML;
      input.innerHTML = prefix.replace(/\n/g, '<br>') + existingHtml;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    showFeedback('Context injected');
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

  function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'contextiq-feedback';
    feedback.textContent = message;
    btn.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  // Auto-injection mode: inject context when input field gains focus
  async function checkAutoInject() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (response.settings?.aiInjectionMode !== 'auto') return;

      fab.classList.add('contextiq-fab-auto');

      // Wait for input field to appear, then attach focus listener
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
              if (input.value.trim()) return; // Don't overwrite existing content
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
