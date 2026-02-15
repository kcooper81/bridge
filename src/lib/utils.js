// TeamPrompt Utility Functions

import { DOMAIN_CATEGORIES } from './constants.js';

/**
 * Extract the domain from a URL string.
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Categorize a domain into a work category.
 */
export function categorizeDomain(domain) {
  for (const [category, domains] of Object.entries(DOMAIN_CATEGORIES)) {
    if (domains.some(d => domain.includes(d) || d.includes(domain))) {
      return category;
    }
  }
  return 'other';
}

/**
 * Get an icon class/name for a category.
 */
export function getCategoryIcon(category) {
  const icons = {
    development: 'code',
    design: 'palette',
    communication: 'mail',
    productivity: 'clipboard',
    research: 'book',
    marketing: 'bar-chart',
    other: 'globe',
  };
  return icons[category] || 'globe';
}

/**
 * Extract meaningful keywords from a page title.
 */
export function extractKeywords(title) {
  if (!title) return [];
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'my', 'your', 'his', 'her', 'our',
    'their', 'not', 'no', 'so', 'if', 'then', 'than', 'up', 'out',
    'new', 'old', 'all', 'just', 'about', 'over', 'such', 'how', 'what',
    'which', 'who', 'when', 'where', 'why',
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Compute Jaccard similarity between two sets of keywords.
 */
export function keywordSimilarity(kwA, kwB) {
  if (!kwA.length || !kwB.length) return 0;
  const setA = new Set(kwA);
  const setB = new Set(kwB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Format a timestamp as a relative time string.
 */
export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Format seconds into a human-readable duration.
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 5) return '';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const min = Math.floor(seconds / 60);
  if (min < 60) return `${min}m`;
  const hrs = Math.floor(min / 60);
  const remainMin = min % 60;
  return remainMin > 0 ? `${hrs}h ${remainMin}m` : `${hrs}h`;
}

/**
 * Format a timestamp to a readable date/time string.
 */
export function formatDateTime(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str, maxLen = 60) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '\u2026' : str;
}

/**
 * Generate a readable project name from a set of keywords and domains.
 */
export function generateProjectName(keywords, domains) {
  // Try to find a dominant keyword pattern
  const freq = {};
  keywords.forEach(kw => {
    freq[kw] = (freq[kw] || 0) + 1;
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const topKeywords = sorted.slice(0, 3).map(([kw]) => kw);

  if (topKeywords.length > 0) {
    return topKeywords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  // Fallback to domain-based name
  if (domains.length > 0) {
    const category = categorizeDomain(domains[0]);
    return category.charAt(0).toUpperCase() + category.slice(1) + ' Project';
  }

  return 'Untitled Project';
}

/**
 * Build the AI context string for a project — enhanced with deeper data.
 */
export function buildContextString(project) {
  if (!project) return '';

  const lines = [`Project: ${project.name}`];

  if (project.tags.length > 0) {
    lines.push(`Tags: ${project.tags.join(', ')}`);
  }

  const recentItems = project.items.slice(0, 15);
  if (recentItems.length > 0) {
    lines.push('');
    lines.push('Active Resources:');
    recentItems.forEach(item => {
      const category = categorizeDomain(extractDomain(item.url));
      const timeInfo = item.timeSpent ? ` [${formatDuration(item.timeSpent)}]` : '';
      lines.push(`  - [${category}] ${item.title}${timeInfo} (${item.url})`);

      // Include page content snippets if available
      if (item.pageContent) {
        if (item.pageContent.description) {
          lines.push(`    Description: ${truncate(item.pageContent.description, 150)}`);
        }
        if (item.pageContent.codeBlocks && item.pageContent.codeBlocks.length > 0) {
          lines.push(`    Code snippets found: ${item.pageContent.codeBlocks.length}`);
        }
      }
    });
  }

  if (project.summary) {
    lines.push('');
    lines.push(`Summary: ${project.summary}`);
  }

  lines.push('');
  lines.push('Please use this context to provide relevant, project-aware responses.');

  return lines.join('\n');
}

/**
 * Extract a topic/title from AI conversation turns.
 */
export function extractConversationTopic(turns) {
  if (!turns || turns.length === 0) return 'Untitled conversation';
  const firstUser = turns.find(t => t.role === 'user');
  if (!firstUser) return 'AI conversation';
  const text = firstUser.text.trim();
  const firstLine = text.split(/[\n.!?]/)[0].trim();
  if (firstLine.length <= 60) return firstLine;
  return firstLine.slice(0, 57) + '...';
}

/**
 * Generate a smart continuation prompt for bridging AI conversations across tools.
 */
export function generateContinuationPrompt(project, conversations, currentTool) {
  const lines = [];

  lines.push(`I'm continuing work on "${project.name}".`);

  const otherTools = [...new Set(conversations.map(c => c.toolName))];
  if (otherTools.length > 0) {
    lines.push(`I've been discussing this across ${otherTools.join(' and ')}.`);
  }

  // Summarize what artifacts are available
  let totalCode = 0;
  let totalImages = 0;
  for (const c of conversations) {
    totalCode += (c.codeBlocks || []).length;
    totalImages += (c.images || []).length;
  }
  const artifactHints = [];
  if (totalCode > 0) artifactHints.push(`${totalCode} code block${totalCode !== 1 ? 's' : ''}`);
  if (totalImages > 0) artifactHints.push(`${totalImages} generated image${totalImages !== 1 ? 's' : ''}`);
  if (artifactHints.length > 0) {
    lines.push(`Artifacts available: ${artifactHints.join(', ')}.`);
  }

  lines.push('');
  lines.push('Here\'s the relevant context:');
  lines.push('');

  // Key resources (brief)
  if (project.items && project.items.length > 0) {
    lines.push('Key resources I\'m working with:');
    project.items.slice(0, 5).forEach(item => {
      lines.push(`  - ${item.title} (${item.domain || extractDomain(item.url)})`);
    });
    lines.push('');
  }

  // Conversation threads from other tools
  const recent = conversations.slice(0, 3);
  for (const conv of recent) {
    const topic = extractConversationTopic(conv.turns);
    lines.push(`Previous discussion on ${conv.toolName}: "${topic}"`);

    const assistantTurns = conv.turns.filter(t => t.role === 'assistant');
    const userTurns = conv.turns.filter(t => t.role === 'user');

    if (assistantTurns.length > 0) {
      const last = assistantTurns[assistantTurns.length - 1];
      lines.push(`  Last response: ${last.text.length > 200 ? last.text.slice(0, 200) + '...' : last.text}`);
    }

    if (userTurns.length > 1) {
      const last = userTurns[userTurns.length - 1];
      lines.push(`  My last question: ${last.text.length > 150 ? last.text.slice(0, 150) + '...' : last.text}`);
    }

    lines.push('');
  }

  // Include code blocks from conversations (the most valuable bridge content)
  const allCodeBlocks = [];
  for (const conv of conversations) {
    for (const block of (conv.codeBlocks || [])) {
      allCodeBlocks.push({ ...block, toolName: conv.toolName });
    }
  }

  if (allCodeBlocks.length > 0) {
    lines.push('Code from previous conversations:');
    lines.push('');
    // Include up to 3 most recent code blocks
    for (const block of allCodeBlocks.slice(0, 3)) {
      const langLabel = block.language ? ` (${block.language})` : '';
      const sourceLabel = block.source ? ` [${block.source}]` : '';
      lines.push(`--- From ${block.toolName}${langLabel}${sourceLabel} ---`);
      lines.push('```' + (block.language || ''));
      lines.push(block.code.slice(0, 1500));
      lines.push('```');
      lines.push('');
    }
  }

  // Reference generated images
  const allImages = [];
  for (const conv of conversations) {
    for (const img of (conv.images || [])) {
      allImages.push({ ...img, toolName: conv.toolName });
    }
  }

  if (allImages.length > 0) {
    lines.push('Generated images from previous conversations:');
    for (const img of allImages.slice(0, 3)) {
      const desc = img.alt ? `: "${img.alt}"` : '';
      lines.push(`  - Image from ${img.toolName}${desc}`);
    }
    lines.push('');
  }

  lines.push('Please continue from where I left off, using the above context.');

  return lines.join('\n');
}

/**
 * Compute an engagement score from time spent and page content.
 */
export function computeEngagementScore(timeSpent, pageContent) {
  let score = 0;
  // Time-based: more time = more engaged
  if (timeSpent > 5) score += 1;
  if (timeSpent > 30) score += 1;
  if (timeSpent > 120) score += 1;
  if (timeSpent > 300) score += 2;

  // Content richness
  if (pageContent) {
    if (pageContent.description) score += 1;
    if (pageContent.headings && pageContent.headings.length > 0) score += 1;
    if (pageContent.codeBlocks && pageContent.codeBlocks.length > 0) score += 2;
    if (pageContent.selectedText) score += 2;
  }

  return Math.min(score, 10); // Cap at 10
}
