// ContextIQ Utility Functions

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
 * Build the AI context string for a project.
 */
export function buildContextString(project) {
  if (!project) return '';

  const lines = [`Project: ${project.name}`];

  if (project.tags.length > 0) {
    lines.push(`Tags: ${project.tags.join(', ')}`);
  }

  const recentItems = project.items.slice(0, 10);
  if (recentItems.length > 0) {
    lines.push('Active Resources:');
    recentItems.forEach(item => {
      const category = categorizeDomain(extractDomain(item.url));
      lines.push(`  - [${category}] ${item.title} (${item.url})`);
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
