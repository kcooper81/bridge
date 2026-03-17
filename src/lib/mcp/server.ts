import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Create an MCP server instance scoped to an organization.
 */
export function createMcpServer(orgId: string, scopes: string[]): McpServer {
  const server = new McpServer({
    name: "TeamPrompt",
    version: "1.0.0",
  });

  const db = createServiceClient();

  // ── Tool: search_prompts ──
  if (scopes.includes("search_prompts")) {
    server.tool(
      "search_prompts",
      "Search your team's shared prompt library by keyword, tags, or browse all prompts",
      {
        query: z.string().optional().describe("Search query to match against prompt titles and descriptions"),
        tags: z.array(z.string()).optional().describe("Filter by tags (returns prompts matching ANY tag)"),
        limit: z.number().min(1).max(50).optional().describe("Max results to return (default 10)"),
      },
      async ({ query, tags, limit: resultLimit }) => {
        const maxResults = resultLimit || 10;

        let q = db
          .from("prompts")
          .select("id, title, description, tags, tone, is_template, usage_count")
          .eq("org_id", orgId)
          .eq("status", "approved")
          .order("usage_count", { ascending: false })
          .limit(maxResults);

        if (query) {
          const sanitized = query.replace(/[%_,.*()]/g, "\\$&");
          const pattern = `%${sanitized}%`;
          q = q.or(`title.ilike.${pattern},description.ilike.${pattern}`);
        }

        if (tags && tags.length > 0) {
          q = q.overlaps("tags", tags);
        }

        const { data: prompts, error } = await q;
        if (error) {
          return { content: [{ type: "text" as const, text: `Error searching prompts: ${error.message}` }], isError: true };
        }

        if (!prompts || prompts.length === 0) {
          return { content: [{ type: "text" as const, text: "No prompts found matching your search." }] };
        }

        const text = prompts.map((p, i) =>
          `${i + 1}. **${p.title}**${p.is_template ? " [Template]" : ""}\n   ${p.description || "No description"}\n   Tags: ${(p.tags || []).join(", ") || "none"} · Used ${p.usage_count || 0} times`
        ).join("\n\n");

        return { content: [{ type: "text" as const, text }] };
      }
    );
  }

  // ── Tool: get_prompt ──
  if (scopes.includes("get_prompt")) {
    server.tool(
      "get_prompt",
      "Get the full content of a specific prompt by ID or title",
      {
        id: z.string().optional().describe("Prompt ID (UUID)"),
        title: z.string().optional().describe("Exact or partial prompt title"),
      },
      async ({ id, title }) => {
        if (!id && !title) {
          return { content: [{ type: "text" as const, text: "Provide either an id or title to look up a prompt." }], isError: true };
        }

        let q = db
          .from("prompts")
          .select("id, title, content, description, tags, tone, is_template, template_variables, usage_count")
          .eq("org_id", orgId)
          .eq("status", "approved");

        if (id) {
          q = q.eq("id", id);
        } else if (title) {
          const sanitized = title.replace(/[%_,.*()]/g, "\\$&");
          q = q.ilike("title", `%${sanitized}%`);
        }

        const { data: prompts, error } = await q.limit(1);
        if (error) {
          return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
        }

        if (!prompts || prompts.length === 0) {
          return { content: [{ type: "text" as const, text: "Prompt not found." }] };
        }

        const p = prompts[0];
        let text = `# ${p.title}\n\n${p.content}`;
        if (p.description) text += `\n\n---\n**Description:** ${p.description}`;
        if (p.tags?.length) text += `\n**Tags:** ${p.tags.join(", ")}`;
        if (p.is_template && p.template_variables) {
          text += `\n**Template Variables:** ${JSON.stringify(p.template_variables)}`;
        }

        // Increment usage count (fire-and-forget)
        db.from("prompts")
          .update({ usage_count: (p.usage_count || 0) + 1, last_used_at: new Date().toISOString() })
          .eq("id", p.id)
          .then(() => {});

        return { content: [{ type: "text" as const, text }] };
      }
    );
  }

  // ── Tool: list_templates ──
  if (scopes.includes("list_templates")) {
    server.tool(
      "list_templates",
      "List all prompt templates with fill-in-the-blank variables",
      {
        limit: z.number().min(1).max(50).optional().describe("Max results (default 20)"),
      },
      async ({ limit: resultLimit }) => {
        const { data: templates, error } = await db
          .from("prompts")
          .select("id, title, description, tags, template_variables, usage_count")
          .eq("org_id", orgId)
          .eq("status", "approved")
          .eq("is_template", true)
          .order("usage_count", { ascending: false })
          .limit(resultLimit || 20);

        if (error) {
          return { content: [{ type: "text" as const, text: `Error: ${error.message}` }], isError: true };
        }

        if (!templates || templates.length === 0) {
          return { content: [{ type: "text" as const, text: "No templates found." }] };
        }

        const text = templates.map((t, i) => {
          const vars = t.template_variables
            ? Object.keys(t.template_variables).join(", ")
            : "none";
          return `${i + 1}. **${t.title}**\n   ${t.description || "No description"}\n   Variables: ${vars}`;
        }).join("\n\n");

        return { content: [{ type: "text" as const, text }] };
      }
    );
  }

  // ── Tool: check_dlp ──
  if (scopes.includes("check_dlp")) {
    server.tool(
      "check_dlp",
      "Scan text for sensitive data (PII, credentials, patient records, etc.) before sending to AI tools",
      {
        content: z.string().describe("The text content to scan for sensitive data"),
      },
      async ({ content }) => {
        if (content.length > 50000) {
          return { content: [{ type: "text" as const, text: "Content exceeds 50KB limit." }], isError: true };
        }

        // Fetch org's security rules and terms
        const [rulesResult, termsResult] = await Promise.all([
          db.from("security_rules")
            .select("name, pattern, pattern_type, category, severity")
            .eq("org_id", orgId)
            .eq("is_active", true)
            .is("team_id", null),
          db.from("sensitive_terms")
            .select("term, term_type, category, severity")
            .eq("org_id", orgId)
            .eq("is_active", true)
            .is("team_id", null),
        ]);

        const violations: string[] = [];
        let action = "allow";

        // Check security rules
        for (const rule of rulesResult.data || []) {
          try {
            const regex = new RegExp(rule.pattern, "gi");
            if (regex.test(content)) {
              violations.push(`[${rule.severity}] ${rule.name} (${rule.category})`);
              if (rule.severity === "block") action = "block";
              else if (action !== "block") action = "warn";
            }
          } catch { /* invalid regex — skip */ }
        }

        // Check sensitive terms
        for (const term of termsResult.data || []) {
          const termLower = term.term.toLowerCase();
          if (term.term_type === "keyword" || term.term_type === "exact") {
            if (content.toLowerCase().includes(termLower)) {
              violations.push(`[${term.severity}] Sensitive term: "${term.term}" (${term.category})`);
              if (term.severity === "block") action = "block";
              else if (action !== "block") action = "warn";
            }
          } else if (term.term_type === "regex") {
            try {
              if (new RegExp(term.term, "gi").test(content)) {
                violations.push(`[${term.severity}] Pattern match: "${term.term}" (${term.category})`);
                if (term.severity === "block") action = "block";
                else if (action !== "block") action = "warn";
              }
            } catch { /* skip */ }
          }
        }

        if (violations.length === 0) {
          return { content: [{ type: "text" as const, text: "✓ No sensitive data detected. Safe to send." }] };
        }

        const text = `⚠ Found ${violations.length} issue(s) — Action: **${action.toUpperCase()}**\n\n${violations.map((v) => `• ${v}`).join("\n")}`;
        return { content: [{ type: "text" as const, text }] };
      }
    );
  }

  // ── Tool: log_usage ──
  if (scopes.includes("log_usage")) {
    server.tool(
      "log_usage",
      "Log that a prompt was used or an AI interaction occurred (for analytics and audit)",
      {
        prompt_id: z.string().optional().describe("The prompt ID that was used"),
        ai_tool: z.string().describe("The AI tool name (e.g. 'claude', 'chatgpt', 'cursor')"),
        action: z.string().optional().describe("What happened (e.g. 'inserted', 'referenced', 'used')"),
      },
      async ({ prompt_id, ai_tool, action: logAction }) => {
        const { error } = await db.from("conversation_logs").insert({
          org_id: orgId,
          prompt_id: prompt_id || null,
          ai_tool,
          action: logAction || "used",
          source: "mcp",
        });

        if (error) {
          return { content: [{ type: "text" as const, text: `Failed to log: ${error.message}` }], isError: true };
        }

        return { content: [{ type: "text" as const, text: "✓ Usage logged successfully." }] };
      }
    );
  }

  return server;
}
