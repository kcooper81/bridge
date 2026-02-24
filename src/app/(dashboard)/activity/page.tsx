"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { UpgradeGate } from "@/components/upgrade";
import { useSubscription } from "@/components/providers/subscription-provider";
import { getConversationLogs } from "@/lib/vault-api";
import { formatDistanceToNow } from "date-fns";
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

export default function ActivityPage() {
  const { currentUserRole, noOrg } = useOrg();
  const { canAccess } = useSubscription();
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [toolFilter, setToolFilter] = useState("__all__");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getConversationLogs({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        aiTool: toolFilter === "__all__" ? undefined : toolFilter,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, toolFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (noOrg) {
    return (
      <>
        <PageHeader title="Activity Log" />
        <NoOrgBanner />
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
        description="AI conversations logged by the browser extension"
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Select value={toolFilter} onValueChange={(v) => { setToolFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]">
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
        <span className="text-sm text-muted-foreground">
          {total} {total === 1 ? "entry" : "entries"}
        </span>
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
            <h3 className="text-sm font-medium">No activity yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Conversations will appear here once team members use the browser extension.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-start gap-3 py-3 px-4">
                <ToolIcon tool={log.ai_tool} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium capitalize">{log.ai_tool}</span>
                    <ActionBadge action={log.action} />
                    {log.prompt_id && (
                      <Badge variant="outline" className="text-[10px]">From Vault</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {log.prompt_text}
                  </p>
                  {log.guardrail_flags && (log.guardrail_flags as unknown[]).length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3 text-destructive" />
                      <span className="text-xs text-destructive">
                        {(log.guardrail_flags as unknown[]).length} guardrail flag(s)
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
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
