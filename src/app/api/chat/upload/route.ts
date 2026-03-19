import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * POST /api/chat/upload — extract text from uploaded files + DLP scan.
 * Accepts multipart form data with files.
 * Returns extracted text (or blocks if DLP triggers).
 */
export async function POST(request: NextRequest) {
  const auth = createClient();
  const db = createServiceClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await db
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ error: "No organization" }, { status: 400 });

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results: Array<{
      name: string;
      type: string;
      size: number;
      text: string;
      truncated: boolean;
    }> = [];

    for (const file of files) {
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: `${file.name} is too large (max 25MB)` }, { status: 400 });
      }

      let text = "";
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const mimeType = file.type;

      try {
        if (mimeType === "application/pdf" || ext === "pdf") {
          // PDF extraction
          const buffer = Buffer.from(await file.arrayBuffer());
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const pdfParse = require("pdf-parse");
            const parseFn = typeof pdfParse === "function" ? pdfParse
              : typeof pdfParse.default === "function" ? pdfParse.default
              : pdfParse.PDFParse ? (async (buf: Buffer) => { const p = new pdfParse.PDFParse(); const r = await p.loadPDF(buf); return { text: r.getAllText?.() || String(r) }; })
              : null;
            if (parseFn) {
              const pdf = await parseFn(buffer);
              text = pdf.text || pdf.getText?.() || "";
            } else {
              text = `[PDF file: ${file.name} — text extraction unavailable]`;
            }
          } catch (pdfErr) {
            text = `[PDF file: ${file.name} — failed to extract: ${pdfErr instanceof Error ? pdfErr.message : "unknown"}]`;
          }
        } else if (
          mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          ext === "docx"
        ) {
          // DOCX extraction
          const buffer = Buffer.from(await file.arrayBuffer());
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } else if (
          mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          ext === "xlsx" || ext === "xls"
        ) {
          // Spreadsheet — extract as CSV-like text
          // Basic: just read as binary and note it's a spreadsheet
          text = `[Spreadsheet file: ${file.name} — ${(file.size / 1024).toFixed(1)}KB. For full spreadsheet analysis, export as CSV first.]`;
        } else if (
          mimeType.startsWith("text/") ||
          mimeType === "application/json" ||
          mimeType === "application/xml" ||
          mimeType === "application/javascript" ||
          mimeType === "application/typescript" ||
          isCodeFile(ext)
        ) {
          // Text-based files — read directly
          text = await file.text();
        } else if (mimeType.startsWith("image/")) {
          // Images — skip text extraction, handled client-side
          text = `[Image file: ${file.name}]`;
        } else {
          // Unknown format — try to read as text
          try {
            text = await file.text();
            // Check if it looks like binary
            if (text.includes("\0")) {
              text = `[Binary file: ${file.name} — ${(file.size / 1024).toFixed(1)}KB. Unable to extract text from this format.]`;
            }
          } catch {
            text = `[Unsupported file: ${file.name}]`;
          }
        }
      } catch (err) {
        text = `[Failed to extract text from ${file.name}: ${err instanceof Error ? err.message : "unknown error"}]`;
      }

      // Truncate very long files to ~100k chars to stay within model context limits
      const MAX_CHARS = 100_000;
      const truncated = text.length > MAX_CHARS;
      if (truncated) {
        text = text.slice(0, MAX_CHARS) + `\n\n[... truncated, showing first ${MAX_CHARS.toLocaleString()} of ${text.length.toLocaleString()} characters]`;
      }

      results.push({
        name: file.name,
        type: mimeType || ext,
        size: file.size,
        text,
        truncated,
      });
    }

    // DLP scan all extracted text
    const allText = results.map((r) => r.text).join("\n\n");

    const { data: orgData } = await db
      .from("organizations")
      .select("settings")
      .eq("id", profile.org_id)
      .single();
    const orgSettings = (orgData?.settings || {}) as Record<string, unknown>;

    if (orgSettings.guardrails_enabled !== false) {
      const [rulesResult, termsResult] = await Promise.all([
        db.from("security_rules")
          .select("name, pattern, pattern_type, category, severity")
          .eq("org_id", profile.org_id)
          .eq("is_active", true)
          .is("team_id", null),
        db.from("sensitive_terms")
          .select("term, term_type, category, severity")
          .eq("org_id", profile.org_id)
          .eq("is_active", true)
          .is("team_id", null),
      ]);

      const violations: Array<{ ruleName: string; category: string; severity: string }> = [];

      // Check security rules
      for (const rule of rulesResult.data || []) {
        try {
          const regex = new RegExp(rule.pattern, "gi");
          if (regex.test(allText)) {
            violations.push({ ruleName: rule.name, category: rule.category, severity: rule.severity });
          }
        } catch { /* invalid regex */ }
      }

      // Check sensitive terms
      for (const term of termsResult.data || []) {
        const content = allText.toLowerCase();
        if (term.term_type === "keyword" || term.term_type === "exact") {
          if (content.includes(term.term.toLowerCase())) {
            violations.push({ ruleName: `Sensitive term: "${term.term}"`, category: term.category, severity: term.severity });
          }
        } else if (term.term_type === "regex") {
          try {
            if (new RegExp(term.term, "gi").test(allText)) {
              violations.push({ ruleName: `Pattern: "${term.term}"`, category: term.category, severity: term.severity });
            }
          } catch { /* skip */ }
        }
      }

      const hasBlock = violations.some((v) => v.severity === "block");
      const overrideDisabled = orgSettings.allow_guardrail_override === false;

      if (hasBlock || (overrideDisabled && violations.length > 0)) {
        // Log the blocked upload
        try {
          await db.from("conversation_logs").insert({
            org_id: profile.org_id,
            user_id: user.id,
            ai_tool: "teamprompt_chat",
            action: "blocked",
            metadata: {
              type: "file_upload",
              files: results.map((r) => r.name),
              violations: violations.map((v) => ({ rule: v.ruleName, category: v.category, severity: v.severity })),
            },
          });
        } catch { /* non-critical */ }

        return NextResponse.json({
          blocked: true,
          violations,
          files: results.map((r) => ({ name: r.name, type: r.type, size: r.size })),
        });
      }
    }

    return NextResponse.json({
      files: results.map((r) => ({
        name: r.name,
        type: r.type,
        size: r.size,
        text: r.text,
        truncated: r.truncated,
      })),
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to process files" }, { status: 500 });
  }
}

function isCodeFile(ext: string): boolean {
  return [
    "js", "jsx", "ts", "tsx", "py", "rb", "go", "rs", "java", "c", "cpp", "h", "hpp",
    "cs", "swift", "kt", "scala", "php", "sh", "bash", "zsh", "ps1",
    "sql", "graphql", "gql",
    "html", "htm", "css", "scss", "sass", "less",
    "json", "yaml", "yml", "toml", "ini", "env", "conf", "cfg",
    "xml", "svg",
    "md", "mdx", "rst", "tex",
    "csv", "tsv",
    "dockerfile", "makefile", "gitignore",
    "r", "m", "jl", "lua", "perl", "pl",
  ].includes(ext);
}
