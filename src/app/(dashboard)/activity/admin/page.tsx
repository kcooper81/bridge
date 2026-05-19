"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Filter, Loader2, RefreshCw, Search } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface AuditEvent {
  id: string;
  action: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_name: string | null;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  before: unknown;
  after: unknown;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  "member.invite": "Invited member",
  "member.remove": "Removed member",
  "member.role_change": "Changed role",
  "member.shield_toggled": "Toggled DLP shield",
  "org.transfer_admin": "Transferred admin",
  "rule.create": "Created rule",
  "rule.update": "Updated rule",
  "rule.delete": "Deleted rule",
  "rule.toggle": "Toggled rule",
  "rule.export": "Exported rules",
  "rule.import": "Imported rules",
  "compliance_pack.install": "Installed compliance pack",
  "integration.connect": "Connected integration",
  "integration.disconnect": "Disconnected integration",
  "integration.sync": "Synced integration",
  "settings.update": "Updated settings",
  "auto_join_domain.set": "Set auto-join domain",
  "auto_join_domain.verify": "Verified domain",
  "approval.approve": "Approved prompt",
  "approval.reject": "Rejected prompt",
  "ai_provider.add": "Added AI provider",
  "ai_provider.remove": "Removed AI provider",
  "ai_provider.update": "Updated AI provider",
};

const ACTION_GROUPS: { value: string; label: string }[] = [
  { value: "__all__", label: "All actions" },
  ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label })),
];

export default function AdminActionsPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("__all__");
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (opts: { reset?: boolean } = {}) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    if (opts.reset) {
      setLoading(true);
      setNextCursor(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (action !== "__all__") params.set("action", action);
      if (search.trim()) params.set("q", search.trim());
      if (!opts.reset && nextCursor) params.set("cursor", nextCursor);
      const res = await fetch(`/api/audit/events?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      const data = await res.json();
      setEvents((prev) => (opts.reset ? data.events : [...prev, ...data.events]));
      setNextCursor(data.nextCursor);
    } catch {
      toast.error("Failed to load admin actions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [action, search, nextCursor]);

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  const filtered = useMemo(() => events, [events]);

  function exportCsv() {
    const headers = ["timestamp", "action", "actor_email", "target_label", "target_type", "ip", "before", "after"];
    const rows = filtered.map((e) => [
      e.created_at,
      e.action,
      e.actor_email || "",
      e.target_label || "",
      e.target_type || "",
      e.ip || "",
      JSON.stringify(e.before ?? null).replace(/"/g, '""'),
      JSON.stringify(e.after ?? null).replace(/"/g, '""'),
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-actions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/activity"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Activity
        </Link>
        <PageHeader
          title="Admin Actions Log"
          description="Privileged actions taken by admins and managers — role changes, integration connects, rule exports, shield toggles, and more."
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") load({ reset: true }); }}
                placeholder="Search actor, target, action…"
                className="pl-8"
              />
            </div>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-[220px]">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_GROUPS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => load({ reset: true })}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!events.length}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No admin actions match the current filter.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
          {nextCursor && (
            <div className="border-t border-border p-3 flex justify-center">
              <Button variant="outline" size="sm" onClick={() => load()} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                Load more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventRow({ event }: { event: AuditEvent }) {
  const [expanded, setExpanded] = useState(false);
  const label = ACTION_LABELS[event.action] || event.action;
  const hasDetail = event.before || event.after || event.metadata;
  return (
    <div className="p-4">
      <button
        type="button"
        className="w-full text-left grid grid-cols-[1fr_auto] gap-3"
        onClick={() => hasDetail && setExpanded((v) => !v)}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px]">{event.action.split(".")[0]}</Badge>
            <span className="text-sm font-medium">{label}</span>
            {event.target_label && (
              <>
                <span className="text-muted-foreground text-xs">→</span>
                <span className="text-sm">{event.target_label}</span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            By {event.actor_email || event.actor_id || "unknown"}
            {event.ip ? ` · ${event.ip}` : ""}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-muted-foreground" title={event.created_at}>
            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
          </div>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">
            {format(new Date(event.created_at), "MMM d, h:mm a")}
          </div>
        </div>
      </button>
      {expanded && hasDetail && (
        <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs space-y-2 font-mono">
          {event.before != null && (
            <div>
              <div className="text-muted-foreground mb-0.5">before</div>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(event.before, null, 2)}</pre>
            </div>
          )}
          {event.after != null && (
            <div>
              <div className="text-muted-foreground mb-0.5">after</div>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(event.after, null, 2)}</pre>
            </div>
          )}
          {event.metadata && (
            <div>
              <div className="text-muted-foreground mb-0.5">metadata</div>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(event.metadata, null, 2)}</pre>
            </div>
          )}
          {event.user_agent && (
            <div>
              <div className="text-muted-foreground mb-0.5">user_agent</div>
              <pre className="whitespace-pre-wrap break-words">{event.user_agent}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
