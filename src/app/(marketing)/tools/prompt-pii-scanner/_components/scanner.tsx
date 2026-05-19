"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, Copy, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import {
  EXAMPLES,
  type PiiFinding,
  type ScanResult,
  scanPrompt,
} from "@/lib/tools/prompt-pii-scanner";

const RISK_THEME: Record<ScanResult["riskLevel"], { label: string; ring: string; text: string; bg: string; bar: string }> = {
  clean: {
    label: "Clean",
    ring: "ring-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    bar: "bg-emerald-500",
  },
  low: {
    label: "Low risk",
    ring: "ring-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    bar: "bg-blue-500",
  },
  medium: {
    label: "Medium risk",
    ring: "ring-amber-500/40",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    bar: "bg-amber-500",
  },
  high: {
    label: "High risk",
    ring: "ring-orange-500/40",
    text: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    bar: "bg-orange-500",
  },
  critical: {
    label: "Critical risk",
    ring: "ring-red-500/50",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/40",
    bar: "bg-red-500",
  },
};

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

interface Props {
  embedMode?: boolean;
}

export function PromptPiiScanner({ embedMode = false }: Props) {
  const [text, setText] = useState("");
  const [showRedacted, setShowRedacted] = useState(false);
  const result = useMemo<ScanResult | null>(() => (text.length > 0 ? scanPrompt(text) : null), [text]);

  const handleExample = (sample: string) => {
    setText(sample);
    setShowRedacted(false);
  };

  return (
    <div className={embedMode ? "" : "w-full"}>
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-5">
        <InputCard
          text={text}
          onChange={setText}
          onLoadExample={handleExample}
          onClear={() => setText("")}
          result={result}
          showRedacted={showRedacted}
          embedMode={embedMode}
        />
        <ResultCard
          text={text}
          result={result}
          showRedacted={showRedacted}
          onToggleRedacted={() => setShowRedacted((v) => !v)}
          embedMode={embedMode}
        />
      </div>
    </div>
  );
}

function InputCard({
  text,
  onChange,
  onLoadExample,
  onClear,
  result,
  showRedacted,
  embedMode,
}: {
  text: string;
  onChange: (v: string) => void;
  onLoadExample: (sample: string) => void;
  onClear: () => void;
  result: ScanResult | null;
  showRedacted: boolean;
  embedMode: boolean;
}) {
  return (
    <div className="lg:col-span-3 flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" aria-hidden />
          Paste your prompt
        </div>
        <div className="flex items-center gap-1.5">
          {text.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {showRedacted && result && text.length > 0 ? (
          <RedactedPreview text={text} result={result} />
        ) : (
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type or paste a prompt here. Detection runs locally in your browser — no text is sent to any server."
            spellCheck={false}
            className="block w-full resize-y bg-transparent px-4 py-4 text-sm leading-relaxed font-mono outline-none min-h-[260px] sm:min-h-[320px]"
          />
        )}
        {text.length === 0 && (
          <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => onLoadExample(ex.text)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground transition"
              >
                Try: {ex.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{text.length.toLocaleString()} characters</span>
        {!embedMode && (
          <span className="flex items-center gap-1.5">
            <Check className="h-3 w-3 text-emerald-600" /> No data leaves your browser
          </span>
        )}
      </div>
    </div>
  );
}

function RedactedPreview({ text, result }: { text: string; result: ScanResult }) {
  const chunks = useMemo(() => buildRedactedChunks(text, result.findings), [text, result.findings]);
  return (
    <div className="block w-full bg-muted/30 px-4 py-4 text-sm leading-relaxed font-mono min-h-[260px] sm:min-h-[320px] whitespace-pre-wrap break-words">
      {chunks.map((c, i) =>
        c.kind === "text" ? (
          <span key={i}>{c.value}</span>
        ) : (
          <span
            key={i}
            className="inline-flex items-center rounded bg-foreground/85 text-background px-1.5 py-0.5 mx-0.5 align-baseline text-[11px] font-medium"
            title={c.category.label}
          >
            [{c.category.label.toUpperCase().replace(/\s+/g, "_")}]
          </span>
        ),
      )}
    </div>
  );
}

function buildRedactedChunks(
  text: string,
  findings: PiiFinding[],
): Array<{ kind: "text"; value: string } | { kind: "redact"; category: PiiFinding["category"] }> {
  const sorted = [...findings].sort((a, b) => a.start - b.start);
  const out: Array<{ kind: "text"; value: string } | { kind: "redact"; category: PiiFinding["category"] }> = [];
  let cursor = 0;
  for (const f of sorted) {
    if (f.start < cursor) continue;
    if (f.start > cursor) out.push({ kind: "text", value: text.slice(cursor, f.start) });
    out.push({ kind: "redact", category: f.category });
    cursor = f.end;
  }
  if (cursor < text.length) out.push({ kind: "text", value: text.slice(cursor) });
  return out;
}

function ResultCard({
  text,
  result,
  showRedacted,
  onToggleRedacted,
  embedMode,
}: {
  text: string;
  result: ScanResult | null;
  showRedacted: boolean;
  onToggleRedacted: () => void;
  embedMode: boolean;
}) {
  const theme = result ? RISK_THEME[result.riskLevel] : RISK_THEME.clean;
  const groups = result ? Object.values(result.byCategory) : [];

  const handleCopyRedacted = useCallback(async () => {
    if (!result) return;
    const chunks = buildRedactedChunks(text, result.findings);
    const out = chunks
      .map((c) => (c.kind === "text" ? c.value : `[${c.category.label.toUpperCase().replace(/\s+/g, "_")}]`))
      .join("");
    try {
      await navigator.clipboard.writeText(out);
    } catch {
      // clipboard may be unavailable in iframes without permissions; non-fatal
    }
  }, [text, result]);

  return (
    <div className={`lg:col-span-2 flex flex-col rounded-2xl border border-border bg-card overflow-hidden ${theme.ring} ring-1`}>
      <div className={`px-4 py-3 ${theme.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result && result.score > 0 ? (
              <ShieldAlert className={`h-4 w-4 ${theme.text}`} />
            ) : (
              <ShieldCheck className={`h-4 w-4 ${theme.text}`} />
            )}
            <span className={`text-sm font-semibold ${theme.text}`}>{theme.label}</span>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${theme.text}`}>{result?.score ?? 0}</div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
          <div className={`h-full ${theme.bar} transition-all`} style={{ width: `${result?.score ?? 0}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[420px]">
        {!result || result.findings.length === 0 ? (
          <EmptyState hasText={text.length > 0} />
        ) : (
          <ul className="divide-y divide-border">
            {groups.map((group) => (
              <li key={group[0].category.id} className="px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${SEVERITY_DOT[group[0].category.severity]}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{group[0].category.label}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {group.length}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{group[0].category.explanation}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {group.slice(0, 4).map((f, i) => (
                        <code key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80 font-mono">
                          {truncate(f.match, 32)}
                        </code>
                      ))}
                      {group.length > 4 && (
                        <span className="text-[11px] text-muted-foreground">+{group.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {result && result.findings.length > 0 && (
        <div className="border-t border-border px-3 py-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onToggleRedacted}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {showRedacted ? "Show original" : "Show redacted"}
          </button>
          <button
            type="button"
            onClick={handleCopyRedacted}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background hover:bg-foreground/85 transition"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy redacted
          </button>
        </div>
      )}

      {embedMode && (
        <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground text-center">
          Powered by{" "}
          <a
            href="https://teamprompt.app/tools/prompt-pii-scanner?ref=embed"
            target="_blank"
            rel="noopener"
            className="font-medium text-foreground hover:text-primary underline-offset-2 hover:underline"
          >
            TeamPrompt
          </a>{" "}
          · Prompt PII Scanner
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasText }: { hasText: boolean }) {
  return (
    <div className="p-6 text-center">
      <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      {hasText ? (
        <>
          <p className="text-sm font-medium">No sensitive data detected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This prompt looks safe to send. Note: detection is heuristic — review before sharing externally.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">Waiting for input</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste a prompt or pick a sample. Detection runs as you type — nothing is sent to any server.
          </p>
        </>
      )}
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, Math.floor(n * 0.6)) + "…" + s.slice(s.length - Math.floor(n * 0.3));
}

// ─── Embed snippet helper ───

export function EmbedSnippet() {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLPreElement>(null);

  const snippet = `<iframe
  src="https://teamprompt.app/embed/prompt-pii-scanner"
  width="100%"
  height="640"
  style="border:1px solid #e5e7eb;border-radius:12px"
  title="Prompt PII Scanner by TeamPrompt"
  loading="lazy"
></iframe>`;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
    } catch {
      const sel = window.getSelection();
      const range = document.createRange();
      if (ref.current) {
        range.selectNodeContents(ref.current);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-medium">Embed code</span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background hover:bg-foreground/85 transition"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        ref={ref}
        className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-foreground/80 font-mono"
      >
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
