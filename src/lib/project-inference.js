// ContextIQ Project Inference Engine
// Groups tab activity into projects using keyword clustering and domain similarity

import { extractDomain, categorizeDomain, extractKeywords, keywordSimilarity, generateProjectName } from './utils.js';
import { getProjects, saveProject, createProject, addItemToProject, deleteProject, getSettings } from './storage.js';

const SIMILARITY_THRESHOLD = 0.15;
const DOMAIN_BOOST = 0.2;

/**
 * Score how well an activity item matches an existing project.
 */
function scoreMatch(item, project) {
  if (!project.items.length) return 0;

  const itemKeywords = extractKeywords(item.title);
  const itemDomain = extractDomain(item.url);
  const itemCategory = categorizeDomain(itemDomain);

  let totalScore = 0;
  let comparisons = 0;

  for (const pItem of project.items.slice(0, 15)) {
    const pKeywords = extractKeywords(pItem.title);
    const pDomain = extractDomain(pItem.url);
    const pCategory = categorizeDomain(pDomain);

    let score = keywordSimilarity(itemKeywords, pKeywords);

    // Boost score for same domain
    if (itemDomain === pDomain) {
      score += DOMAIN_BOOST;
    }

    // Boost for same category
    if (itemCategory === pCategory && itemCategory !== 'other') {
      score += DOMAIN_BOOST * 0.5;
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
  let bestProject = null;
  let bestScore = 0;

  for (const project of projects) {
    const score = scoreMatch(activityItem, project);
    if (score > bestScore) {
      bestScore = score;
      bestProject = project;
    }
  }

  if (bestProject && bestScore >= SIMILARITY_THRESHOLD) {
    await addItemToProject(bestProject.id, activityItem);
    return bestProject.id;
  }

  // No good match — create a new project
  const keywords = extractKeywords(activityItem.title);
  const domain = extractDomain(activityItem.url);
  const name = generateProjectName(keywords, [domain]);

  const newProject = createProject(name, [{
    id: crypto.randomUUID(),
    url: activityItem.url,
    title: activityItem.title,
    domain,
    category: categorizeDomain(domain),
    addedAt: Date.now(),
    lastSeen: Date.now(),
  }]);

  await saveProject(newProject);
  return newProject.id;
}

/**
 * Re-cluster all recent activity items into projects.
 * Called periodically to improve groupings.
 */
export async function reclusterProjects() {
  const projects = await getProjects();
  if (projects.length < 2) return;

  // Check pairs of projects for merge candidates
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const pA = projects[i];
      const pB = projects[j];

      if (pA.isManual || pB.isManual) continue;
      if (!pA.items.length || !pB.items.length) continue;

      // Calculate cross-project similarity
      let totalSim = 0;
      let count = 0;

      for (const itemA of pA.items.slice(0, 5)) {
        for (const itemB of pB.items.slice(0, 5)) {
          const kwA = extractKeywords(itemA.title);
          const kwB = extractKeywords(itemB.title);
          totalSim += keywordSimilarity(kwA, kwB);
          count++;
        }
      }

      const avgSim = count > 0 ? totalSim / count : 0;

      if (avgSim >= SIMILARITY_THRESHOLD * 2) {
        // Merge pB into pA
        for (const item of pB.items) {
          await addItemToProject(pA.id, item);
        }

        // Regenerate name from merged items
        const allKeywords = pA.items.flatMap(i => extractKeywords(i.title));
        const allDomains = pA.items.map(i => extractDomain(i.url));
        pA.name = generateProjectName(allKeywords, allDomains);
        pA.tags = [...new Set([...pA.tags, ...pB.tags])];
        await saveProject(pA);

        // Remove merged project from storage and local array
        await deleteProject(pB.id);
        projects.splice(j, 1);
        j--;
      }
    }
  }
}
