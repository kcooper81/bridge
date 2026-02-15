// TeamPrompt Project Inference Engine
// Groups tab activity into projects using multi-signal scoring:
//   URL paths, domains, keywords, temporal proximity, referrer chains, page content

import { extractDomain, categorizeDomain, extractKeywords, keywordSimilarity, generateProjectName } from './utils.js';
import { getProjects, saveProject, createProject, addItemToProject, deleteProject, getSettings, getActivityLog } from './storage.js';

// --- Thresholds ---
const MATCH_THRESHOLD = 0.25; // Minimum score to assign to an existing project
const MERGE_THRESHOLD = 0.40; // Minimum average score to merge two projects
const TEMPORAL_WINDOW_MS = 20 * 60 * 1000; // 20 minutes — items this close are "in the same session"
const MIN_ITEMS_FOR_NEW_PROJECT = 1; // Create immediately (we merge later)

// --- Signal Weights ---
const W = {
  URL_PATH:     0.35, // Same repo, same docs section, same app route
  DOMAIN:       0.25, // Same exact domain
  KEYWORD:      0.15, // Title keyword overlap
  CATEGORY:     0.05, // Same work category
  TEMPORAL:     0.10, // Visited close in time
  REFERRER:     0.10, // Direct navigation chain
};

/**
 * Extract a meaningful "path key" from a URL.
 * For github.com/user/repo/... → "user/repo"
 * For docs.something.com/section/... → "section"
 * For most sites → first 2 path segments
 */
function extractPathKey(url) {
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/').filter(Boolean);
    const domain = u.hostname.replace(/^www\./, '');

    // GitHub/GitLab: org/repo is the project
    if (domain.includes('github.com') || domain.includes('gitlab.com') || domain.includes('bitbucket.org')) {
      return segments.slice(0, 2).join('/');
    }

    // Stack Overflow: questions are individual, but tags link them
    if (domain.includes('stackoverflow.com')) {
      // Extract tags from URL if present
      if (segments[0] === 'questions' && segments.length > 2) {
        return 'so/' + segments[2].split('-').slice(0, 3).join('-'); // question slug hint
      }
      return '';
    }

    // Docs sites: first meaningful segment is usually the product/section
    if (domain.includes('docs.') || domain.includes('developer.') || domain.includes('learn.')) {
      return segments.slice(0, 2).join('/');
    }

    // Jira/Linear/Asana: project keys in path
    if (domain.includes('jira') || domain.includes('linear.app') || domain.includes('asana.com')) {
      return segments.slice(0, 2).join('/');
    }

    // Google apps: doc IDs
    if (domain.includes('docs.google.com') || domain.includes('sheets.google.com')) {
      if (segments.length >= 3) return segments[1]; // The doc ID
      return '';
    }

    // Generic: first 2 path segments
    return segments.slice(0, 2).join('/');
  } catch {
    return '';
  }
}

/**
 * Compute how well a new item matches an existing project, using multiple signals.
 */
function scoreMatch(item, project, recentActivity = []) {
  if (!project.items.length) return 0;

  const itemDomain = item.domain || extractDomain(item.url);
  const itemPathKey = extractPathKey(item.url);
  const itemKeywords = extractKeywords(item.title);
  const itemCategory = item.category || categorizeDomain(itemDomain);
  const itemTime = Date.now();

  let totalScore = 0;
  let comparisons = 0;

  // Compare against project items (check more items for better accuracy)
  const projectItems = project.items.slice(0, 20);

  for (const pItem of projectItems) {
    const pDomain = pItem.domain || extractDomain(pItem.url);
    const pPathKey = extractPathKey(pItem.url);
    const pKeywords = extractKeywords(pItem.title);
    const pCategory = pItem.category || categorizeDomain(pDomain);
    const pTime = pItem.lastSeen || pItem.addedAt || 0;

    let score = 0;

    // 1. URL Path Match — strongest signal
    if (itemPathKey && pPathKey && itemPathKey === pPathKey && itemDomain === pDomain) {
      score += W.URL_PATH;
    } else if (itemPathKey && pPathKey) {
      // Partial path match (shared first segment)
      const itemParts = itemPathKey.split('/');
      const pParts = pPathKey.split('/');
      if (itemParts[0] && pParts[0] && itemParts[0] === pParts[0] && itemDomain === pDomain) {
        score += W.URL_PATH * 0.6;
      }
    }

    // 2. Domain Match
    if (itemDomain === pDomain) {
      score += W.DOMAIN;
    } else {
      // Subdomain match (e.g. api.example.com and docs.example.com)
      const itemBase = itemDomain.split('.').slice(-2).join('.');
      const pBase = pDomain.split('.').slice(-2).join('.');
      if (itemBase === pBase && itemBase !== 'google.com' && itemBase !== 'github.com') {
        score += W.DOMAIN * 0.4;
      }
    }

    // 3. Keyword Similarity
    const kwSim = keywordSimilarity(itemKeywords, pKeywords);
    score += kwSim * W.KEYWORD;

    // 4. Category Match
    if (itemCategory === pCategory && itemCategory !== 'other') {
      score += W.CATEGORY;
    }

    // 5. Temporal Proximity
    if (pTime && Math.abs(itemTime - pTime) < TEMPORAL_WINDOW_MS) {
      const timeFactor = 1 - (Math.abs(itemTime - pTime) / TEMPORAL_WINDOW_MS);
      score += timeFactor * W.TEMPORAL;
    }

    // 6. Referrer Chain
    if (item.referrerUrl) {
      const referrerDomain = extractDomain(item.referrerUrl);
      if (referrerDomain === pDomain) {
        score += W.REFERRER;
      }
      // Direct referrer match
      if (item.referrerUrl === pItem.url) {
        score += W.REFERRER; // Double weight for exact referrer
      }
    }

    totalScore += score;
    comparisons++;
  }

  return comparisons > 0 ? totalScore / comparisons : 0;
}

/**
 * Infer which project an activity item belongs to, or create a new one.
 * Returns the project ID.
 */
export async function inferProject(activityItem) {
  const settings = await getSettings();
  if (!settings.autoInferProjects) return null;

  const projects = await getProjects();
  const recentActivity = await getActivityLog();

  let bestProject = null;
  let bestScore = 0;

  for (const project of projects) {
    const score = scoreMatch(activityItem, project, recentActivity);
    if (score > bestScore) {
      bestScore = score;
      bestProject = project;
    }
  }

  if (bestProject && bestScore >= MATCH_THRESHOLD) {
    await addItemToProject(bestProject.id, activityItem);
    return bestProject.id;
  }

  // No good match — create a new project
  const keywords = extractKeywords(activityItem.title);
  const domain = activityItem.domain || extractDomain(activityItem.url);
  const name = generateProjectName(keywords, [domain]);

  const newProject = createProject(name, [{
    id: crypto.randomUUID(),
    url: activityItem.url,
    title: activityItem.title,
    domain,
    category: activityItem.category || categorizeDomain(domain),
    favIconUrl: activityItem.favIconUrl || '',
    addedAt: Date.now(),
    lastSeen: Date.now(),
  }]);

  await saveProject(newProject);
  return newProject.id;
}

/**
 * Re-cluster all projects — merge similar ones.
 * Called periodically to improve groupings over time.
 */
export async function reclusterProjects() {
  const projects = await getProjects();
  if (projects.length < 2) return;

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const pA = projects[i];
      const pB = projects[j];

      if (pA.isManual || pB.isManual) continue;
      if (!pA.items.length || !pB.items.length) continue;

      // Calculate cross-project similarity using the full scoring engine
      let totalSim = 0;
      let count = 0;

      const samplesA = pA.items.slice(0, 8);
      const samplesB = pB.items.slice(0, 8);

      for (const itemA of samplesA) {
        // Score how well itemA would fit in pB
        const fakeItem = {
          ...itemA,
          domain: itemA.domain || extractDomain(itemA.url),
          category: itemA.category || categorizeDomain(extractDomain(itemA.url)),
        };
        totalSim += scoreMatch(fakeItem, pB);
        count++;
      }

      for (const itemB of samplesB) {
        const fakeItem = {
          ...itemB,
          domain: itemB.domain || extractDomain(itemB.url),
          category: itemB.category || categorizeDomain(extractDomain(itemB.url)),
        };
        totalSim += scoreMatch(fakeItem, pA);
        count++;
      }

      const avgSim = count > 0 ? totalSim / count : 0;

      if (avgSim >= MERGE_THRESHOLD) {
        // Merge smaller into larger
        const [target, source] = pA.items.length >= pB.items.length ? [pA, pB] : [pB, pA];

        for (const item of source.items) {
          await addItemToProject(target.id, item);
        }

        // Regenerate name from merged items
        const allKeywords = target.items.flatMap(i => extractKeywords(i.title));
        const allDomains = target.items.map(i => i.domain || extractDomain(i.url));
        target.name = generateProjectName(allKeywords, allDomains);
        target.tags = [...new Set([...(target.tags || []), ...(source.tags || [])])];
        await saveProject(target);

        await deleteProject(source.id);
        projects.splice(projects.indexOf(source), 1);
        j--;
      }
    }
  }
}
