"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Activity,
  Search,
  X,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { UpgradeGate } from "@/components/upgrade";
import { useSubscription } from "@/components/providers/subscription-provider";
import { getConversationLogs } from "@/lib/vault-api";
import { formatDistanceToNow, format } from "date-fns";
import type { ConversationLog } from "@/lib/types";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";

const AI_TOOLS = [
  { value: "__all__", label: "All AI Tools" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
  { value: "copilot", label: "Copilot" },
  { value: "perplexity", label: "Perplexity" },
  { value: "other", label: "Other" },
];

const ACTIONS = [
  { value: "__all__", label: "All Actions" },
  { value: "sent", label: "Sent" },
  { value: "blocked", label: "Blocked" },
  { value: "warned", label: "Warned" },
];

const DATE_PRESETS = [
  { value: "__all__", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "custom", label: "Custom Range" },
];

const PAGE_SIZE = 25;

function ActionBadge({ action }: { action: string }) {
  switch (action) {
    case "sent":
      return (
        <Badge variant="secondary" className="text-xs gap-1">
          <MessageSquare className="h-3 w-3" />
          Sent
        </Badge>
      );
    case "blocked":
      return (
        <Badge variant="destructive" className="text-xs gap-1">
          <Shield className="h-3 w-3" />
          Blocked
        </Badge>
      );
    case "warned":
      return (
        <Badge className="text-xs gap-1 bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
          <AlertTriangle className="h-3 w-3" />
          Warned
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-xs">{action}</Badge>;
  }
}

function ToolIcon({ tool }: { tool: string }) {
  const colors: Record<string, string> = {
    chatgpt: "bg-green-500/15 text-green-600",
    claude: "bg-orange-500/15 text-orange-600",
    gemini: "bg-blue-500/15 text-blue-600",
    copilot: "bg-purple-500/15 text-purple-600",
    perplexity: "bg-cyan-500/15 text-cyan-600",
  };
  return (
    <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-xs font-bold ${colors[tool] || "bg-muted text-muted-foreground"}`}>
      {tool.slice(0, 2).toUpperCase()}
    </span>
  );
}

function getDateRange(preset: string): { from?: string; to?: string } {
  if (preset === "__all__" || preset === "custom") return {};
  const now = new Date();
  const to = now.toISOString();
  if (preset === "today") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    return { from, to };
  }
  const days = parseInt(preset);
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  return { from, to };
}

export default function ActivityPage() {
  const { org, currentUserRole, noOrg, loading: orgLoading } = useOrg();
  const { canAccess } = useSubscription();
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  // Filters
  const [toolFilter, setToolFilter] = useState("__all__");
  const [actionFilter, setActionFilter] = useState("__all__");
  const [datePreset, setDatePreset] = useState("__all__");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [exporting, setExporting] = useState(false);

  const logMode = (org?.settings as Record<string, unknown> | null)?.activity_log_mode || "metadata_only";

  const activeFilterCount = [
    toolFilter !== "__all__",
    actionFilter !== "__all__",
    datePreset !== "__all__",
    searchQuery !== "",
  ].filter(Boolean).length;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const dateRange =
        datePreset === "custom"
          ? { from: customDateFrom || undefined, to: customDateTo || undefined }
          : getDateRange(datePreset);

      const result = await getConversationLogs({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        aiTool: toolFilter === "__all__" ? undefined : toolFilter,
        action: actionFilter === "__all__" ? undefined : actionFilter,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        search: searchQuery || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, toolFilter, actionFilter, datePreset, customDateFrom, customDateTo, searchQuery]);

  useEffect(() => {
    if (!orgLoading && ["admin", "manager"].includes(currentUserRole)) fetchLogs();
  }, [fetchLogs, orgLoading, currentUserRole]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function exportLogs(format: "csv" | "json") {
    setExporting(true);
    try {
      const dateRange =
        datePreset === "custom"
          ? { from: customDateFrom || undefined, to: customDateTo || undefined }
          : getDateRange(datePreset);

      // Fetch all matching logs (up to 10,000)
      const result = await getConversationLogs({
        limit: 10000,
        offset: 0,
        aiTool: toolFilter === "__all__" ? undefined : toolFilter,
        action: actionFilter === "__all__" ? undefined : actionFilter,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        search: searchQuery || undefined,
      });

      const exportLogs = result.logs;
      if (exportLogs.length === 0) {
        toast.error("No logs to export");
        return;
      }

      let content: string;
      let mimeType: string;
      let ext: string;

      if (format === "csv") {
        const headers = ["timestamp", "action", "ai_tool", "guardrail_flags", "user_id"];
        if (logMode === "full") headers.push("prompt_text");
        const rows = exportLogs.map((log) => {
          const row = [
            log.created_at,
            log.action,
            log.ai_tool,
            (log.guardrail_flags || []).join("; "),
            log.user_id || "",
          ];
          if (logMode === "full") row.push((log.prompt_text || "").replace(/"/g, '""'));
          return row.map((v) => `"${v}"`).join(",");
        });
        content = [headers.join(","), ...rows].join("\n");
        mimeType = "text/csv";
        ext = "csv";
      } else {
        content = JSON.stringify(exportLogs.map((log) => ({
          timestamp: log.created_at,
          action: log.action,
          ai_tool: log.ai_tool,
          guardrail_flags: log.guardrail_flags || [],
          user_id: log.user_id,
          ...(logMode === "full" ? { prompt_text: log.prompt_text } : {}),
        })), null, 2);
        mimeType = "application/json";
        ext = "json";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${exportLogs.length} log entries as ${ext.toUpperCase()}`);
    } catch (err) {
      toast.error("Export failed");
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  function clearFilters() {
    setToolFilter("__all__");
    setActionFilter("__all__");
    setDatePreset("__all__");
    setCustomDateFrom("");
    setCustomDateTo("");
    setSearchQuery("");
    setSearchInput("");
    setPage(0);
  }

  if (noOrg) {
    return (
      <>
        <PageHeader title="Activity Log" />
        <NoOrgBanner />
      </>
    );
  }

  if (orgLoading) {
    return (
      <>
        <PageHeader title="Activity Log" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  if (!["admin", "manager"].includes(currentUserRole)) {
    return (
      <>
        <PageHeader title="Activity Log" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Activity log requires admin or manager role</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Contact your admin to get access to the activity log.
          </p>
        </div>
      </>
    );
  }

  if (!canAccess("audit_log")) {
    return (
      <>
        <PageHeader title="Activity Log" />
        <UpgradeGate feature="audit_log" title="Activity Log" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="AI interactions logged by the browser extension"
      />

      {/* Logging mode indicator */}
      {logMode === "metadata_only" && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2 mb-4">
          <Shield className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">Metadata-only mode:</span> Prompt text is not recorded. Only action type, AI tool, and timestamps are logged.
            Change this in <span className="font-medium">Settings → Security → Activity &amp; Privacy</span>.
          </p>
        </div>
      )}

      {/* Filter bar */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          {logMode === "full" && (
            <form
              className="flex items-center gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput);
                setPage(0);
              }}
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  className="w-[200px] pl-8 h-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2"
                  onClick={() => { setSearchQuery(""); setSearchInput(""); setPage(0); }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </form>
          )}

          {/* AI Tool filter */}
          <Select value={toolFilter} onValueChange={(v) => { setToolFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_TOOLS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action filter */}
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range */}
          <Select value={datePreset} onValueChange={(v) => { setDatePreset(v); setPage(0); }}>
            <SelectTrigger className="w-[160px] h-9">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* More filters toggle */}
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] ml-0.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {total} {total === 1 ? "entry" : "entries"}
            </span>
            {total > 0 && (
              <Select value="" onValueChange={(v) => exportLogs(v as "csv" | "json")}>
                <SelectTrigger className="w-auto h-8 gap-1.5 text-xs" disabled={exporting}>
                  {exporting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Download className="h-3 w-3" />}
                  Export
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Export as CSV</SelectItem>
                  <SelectItem value="json">Export as JSON</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Custom date range inputs */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">From</span>
              <Input
                type="date"
                className="w-[160px] h-9"
                value={customDateFrom}
                onChange={(e) => { setCustomDateFrom(e.target.value); setPage(0); }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">To</span>
              <Input
                type="date"
                className="w-[160px] h-9"
                value={customDateTo}
                onChange={(e) => { setCustomDateTo(e.target.value); setPage(0); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Log list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium">
              {activeFilterCount > 0 ? "No matching entries" : "No activity yet"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilterCount > 0
                ? "Try adjusting your filters to see more results."
                : "Conversations will appear here once team members use the browser extension."}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-start gap-3 py-3 px-4">
                <ToolIcon tool={log.ai_tool} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium capitalize">{log.ai_tool}</span>
                    <ActionBadge action={log.action} />
                    {log.prompt_id && (
                      <Badge variant="outline" className="text-[10px]">From Vault</Badge>
                    )}
                  </div>
                  {log.prompt_text ? (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {log.prompt_text}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">
                      Prompt text not recorded (metadata-only mode)
                    </p>
                  )}
                  {Array.isArray(log.guardrail_flags) && log.guardrail_flags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive">
                        {log.guardrail_flags.length} guardrail flag(s)
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {format(new Date(log.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
}
