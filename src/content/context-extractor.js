// ContextIQ Context Extractor Content Script
// Runs on all pages to extract deep page context: metadata, headings, code blocks, selections

(() => {
  // Don't run on extension pages or internal chrome pages
  if (location.protocol === 'chrome-extension:' || location.protocol === 'chrome:') return;

  let lastSelectedText = '';

  // Track text selections
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
      lastSelectedText = selection.toString().trim().slice(0, 500);
    }
  });

  /**
   * Extract page metadata, headings, code blocks, and selected text.
   */
  function extractPageContent() {
    const content = {
      description: '',
      headings: [],
      codeBlocks: [],
      selectedText: lastSelectedText,
      readableSnippet: '',
    };

    // Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      content.description = (metaDesc.getAttribute('content') || '').slice(0, 300);
    }

    // OG description fallback
    if (!content.description) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        content.description = (ogDesc.getAttribute('content') || '').slice(0, 300);
      }
    }

    // Main headings (h1, h2)
    const headings = document.querySelectorAll('h1, h2');
    headings.forEach(h => {
      const text = h.textContent.trim();
      if (text && text.length < 200) {
        content.headings.push({
          level: parseInt(h.tagName[1]),
          text,
        });
      }
    });
    content.headings = content.headings.slice(0, 10);

    // Code blocks — GitHub, StackOverflow, generic <pre><code>
    const codeElements = document.querySelectorAll(
      'pre code, .highlight pre, .code-block, .CodeMirror-code, [class*="prism-"], .hljs'
    );
    codeElements.forEach(el => {
      const text = el.textContent.trim();
      if (text && text.length > 20 && text.length < 2000) {
        // Try to detect language from class
        const classes = el.className + ' ' + (el.parentElement?.className || '');
        const langMatch = classes.match(/language-(\w+)|lang-(\w+)|(\w+)-code/);
        content.codeBlocks.push({
          language: langMatch ? (langMatch[1] || langMatch[2] || langMatch[3]) : 'unknown',
          snippet: text.slice(0, 500),
        });
      }
    });
    content.codeBlocks = content.codeBlocks.slice(0, 5);

    // Readable content snippet — first meaningful paragraph
    const paragraphs = document.querySelectorAll('article p, main p, .content p, .post-body p, p');
    for (const p of paragraphs) {
      const text = p.textContent.trim();
      if (text.length > 50) {
        content.readableSnippet = text.slice(0, 300);
        break;
      }
    }

    return content;
  }

  // Listen for extraction requests from the service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACT_PAGE_CONTENT') {
      try {
        const content = extractPageContent();
        sendResponse({ content });
      } catch (err) {
        sendResponse({ content: null, error: err.message });
      }
      return true;
    }

    if (message.type === 'GET_SELECTED_TEXT') {
      sendResponse({ selectedText: lastSelectedText });
      return true;
    }
  });

  // Also send page content after page load settles (for the service worker to store)
  let contentSent = false;
  function sendContentOnLoad() {
    if (contentSent) return;
    contentSent = true;
    try {
      const content = extractPageContent();
      chrome.runtime.sendMessage({
        type: 'PAGE_CONTENT_EXTRACTED',
        content,
        url: location.href,
        title: document.title,
      }).catch(() => {
        // Extension context may be invalidated
      });
    } catch {
      // Silently fail
    }
  }

  // Wait for page to settle before extracting
  if (document.readyState === 'complete') {
    setTimeout(sendContentOnLoad, 1500);
  } else {
    window.addEventListener('load', () => {
      setTimeout(sendContentOnLoad, 1500);
    });
  }
})();
