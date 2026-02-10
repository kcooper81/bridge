// ContextIQ Lightweight AI Summarizer
// Generates project summaries using either a remote API or local heuristics

import { getSettings, saveProject } from './storage.js';
import { extractKeywords, extractDomain, categorizeDomain } from './utils.js';

/**
 * Generate a summary for a project using local heuristics (no API needed).
 * Falls back to this when no API key is configured.
 */
function generateLocalSummary(project) {
  if (!project.items || project.items.length === 0) {
    return 'No activity tracked yet.';
  }

  const items = project.items;

  // Count categories
  const categoryCounts = {};
  items.forEach(item => {
    const category = item.category || categorizeDomain(extractDomain(item.url));
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Extract top keywords
  const allKeywords = items.flatMap(i => extractKeywords(i.title));
  const keywordFreq = {};
  allKeywords.forEach(kw => {
    keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
  });

  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([kw]) => kw);

  // Count unique domains
  const uniqueDomains = new Set(items.map(i => extractDomain(i.url)));

  // Build summary
  const parts = [];

  parts.push(`Working across ${items.length} resource${items.length !== 1 ? 's' : ''} on ${uniqueDomains.size} site${uniqueDomains.size !== 1 ? 's' : ''}.`);

  if (topCategories.length > 0) {
    const categoryStr = topCategories.join(', ');
    parts.push(`Primary focus areas: ${categoryStr}.`);
  }

  if (topKeywords.length > 0) {
    const keywordStr = topKeywords.join(', ');
    parts.push(`Key topics: ${keywordStr}.`);
  }

  // Recent activity
  const recent = items.slice(0, 3);
  if (recent.length > 0) {
    const recentTitles = recent.map(i => i.title).join('; ');
    parts.push(`Recent: ${recentTitles}.`);
  }

  return parts.join(' ');
}

/**
 * Generate a summary for a project.
 * Uses local heuristics by default; can be extended to call an API.
 */
export async function summarizeProject(project) {
  const settings = await getSettings();

  // For MVP, use local heuristic summarization
  const summary = generateLocalSummary(project);

  // Save summary to project
  project.summary = summary;
  await saveProject(project);

  return summary;
}

/**
 * Summarize all projects that don't have recent summaries.
 */
export async function summarizeAllProjects(projects) {
  const results = [];
  for (const project of projects) {
    // Only re-summarize if items have changed since last summary
    if (!project.summary || project.lastActivity > (project.lastSummarized || 0)) {
      const summary = await summarizeProject(project);
      project.lastSummarized = Date.now();
      results.push({ projectId: project.id, summary });
    }
  }
  return results;
}
