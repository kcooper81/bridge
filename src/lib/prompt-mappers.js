// ContextIQ — Shared DB row <-> App shape mappers
// Used by vault-api.js (web mode) and supabase-rest.js (extension mode)

export function dbPromptToApp(row) {
  return {
    id: row.id, title: row.title, content: row.content, description: row.description || '',
    intendedOutcome: row.intended_outcome || '', tone: row.tone || 'professional',
    modelRecommendation: row.model_recommendation || '', exampleInput: row.example_input || '',
    exampleOutput: row.example_output || '', tags: row.tags || [], folderId: row.folder_id,
    departmentId: row.department_id, owner: row.owner_id, status: row.status || 'approved',
    version: row.version || 1, versionHistory: [], rating: { total: row.rating_total || 0, count: row.rating_count || 0 },
    usageCount: row.usage_count || 0, lastUsedAt: row.last_used_at, isFavorite: row.is_favorite || false,
    createdAt: new Date(row.created_at).getTime(), updatedAt: new Date(row.updated_at).getTime(),
  };
}

export function appPromptToDb(fields, orgId, userId) {
  const row = {};
  if (orgId) row.org_id = orgId;
  if (userId) row.owner_id = userId;
  if (fields.title !== undefined) row.title = fields.title;
  if (fields.content !== undefined) row.content = fields.content;
  if (fields.description !== undefined) row.description = fields.description;
  if (fields.intendedOutcome !== undefined) row.intended_outcome = fields.intendedOutcome;
  if (fields.tone !== undefined) row.tone = fields.tone;
  if (fields.modelRecommendation !== undefined) row.model_recommendation = fields.modelRecommendation;
  if (fields.exampleInput !== undefined) row.example_input = fields.exampleInput;
  if (fields.exampleOutput !== undefined) row.example_output = fields.exampleOutput;
  if (fields.tags !== undefined) row.tags = fields.tags;
  if (fields.folderId !== undefined) row.folder_id = fields.folderId;
  if (fields.departmentId !== undefined) row.department_id = fields.departmentId;
  if (fields.status !== undefined) row.status = fields.status;
  if (fields.isFavorite !== undefined) row.is_favorite = fields.isFavorite;
  return row;
}
