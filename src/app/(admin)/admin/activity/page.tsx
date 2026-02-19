"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActivityRow {
  id: string;
  action: string;
  resource_type: string | null;
  user_email: string | null;
  org_name: string | null;
  ip_address: string | null;
  created_at: string;
}

const PAGE_SIZE = 30;

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: rawLogs } = await supabase
      .from("activity_logs")
      .select("id, action, resource_type, user_id, org_id, ip_address, created_at")
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (!rawLogs || rawLogs.length === 0) {
      setLogs([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setHasMore(rawLogs.length > PAGE_SIZE);

    // Resolve user/org names
    const userIds = Array.from(new Set(rawLogs.map((l: { user_id: string | null }) => l.user_id).filter(Boolean) as string[]));
    const orgIds = Array.from(new Set(rawLogs.map((l: { org_id: string | null }) => l.org_id).filter(Boolean) as string[]));

    const [usersRes, orgsRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from("profiles").select("id, email").in("id", userIds)
        : { data: [] },
      orgIds.length > 0
        ? supabase.from("organizations").select("id, name").in("id", orgIds)
        : { data: [] },
    ]);

    const userMap = new Map(
      (usersRes.data || []).map((u: { id: string; email: string }) => [u.id, u.email])
    );
    const orgMap = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );

    setLogs(
      rawLogs.slice(0, PAGE_SIZE).map((l: { id: string; action: string; resource_type: string | null; user_id: string | null; org_id: string | null; ip_address: string | null; created_at: string }) => ({
        id: l.id,
        action: l.action,
        resource_type: l.resource_type,
        user_email: l.user_id ? userMap.get(l.user_id) || null : null,
        org_name: l.org_id ? orgMap.get(l.org_id) || null : null,
        ip_address: l.ip_address,
        created_at: l.created_at,
      }))
    );

    setLoading(false);
  };

  const filtered = search.trim()
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(search.toLowerCase()) ||
          l.user_email?.toLowerCase().includes(search.toLowerCase()) ||
          l.org_name?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Platform-wide audit trail</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by action, user, or org..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ScrollText className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No activity logs yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Action</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Resource</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">User</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Organization</th>
                    <th className="text-left p-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 font-medium">{log.action}</td>
                      <td className="p-3 hidden sm:table-cell">
                        {log.resource_type ? (
                          <Badge variant="outline" className="text-xs">
                            {log.resource_type}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {log.user_email || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell">
                        {log.org_name || "—"}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Page {page + 1}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
