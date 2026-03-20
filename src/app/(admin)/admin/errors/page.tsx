"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Mail,
  CreditCard,
  Database,
  Globe,
  Server,
  AppWindow,
  Zap,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const SERVICE_TABS = [
  { value: "all", label: "All", icon: AppWindow },
  { value: "app", label: "App", icon: Globe },
  { value: "resend", label: "Resend", icon: Mail },
  { value: "stripe", label: "Stripe", icon: CreditCard },
  { value: "supabase", label: "Supabase", icon: Database },
  { value: "upstash", label: "Upstash", icon: Zap },
  { value: "vercel", label: "Vercel", icon: Server },
] as const;

type ServiceFilter = (typeof SERVICE_TABS)[number]["value"];

interface ErrorRow {
  id: string;
  message: string;
  stack: string | null;
  url: string | null;
  service: string;
  user_email: string | null;
  org_name: string | null;
  resolved: boolean;
  created_at: string;
}

interface ServiceCount {
  service: string;
  count: number;
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [serviceCounts, setServiceCounts] = useState<ServiceCount[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    loadErrors();
    setSelectedIds(new Set());
  }, [showResolved, page, pageSize, serviceFilter]);

  useEffect(() => {
    loadServiceCounts();
  }, [showResolved]);

  const loadServiceCounts = async () => {
    const supabase = createClient();
    // Get unresolved counts per service
    let query = supabase
      .from("error_logs")
      .select("service");
    if (!showResolved) query = query.eq("resolved", false);
    const { data } = await query;
    if (!data) return;

    const counts = new Map<string, number>();
    for (const row of data) {
      const svc = row.service || "app";
      counts.set(svc, (counts.get(svc) || 0) + 1);
    }
    setServiceCounts(
      Array.from(counts.entries()).map(([service, count]) => ({ service, count }))
    );
  };

  const getServiceCount = (service: string): number => {
    if (service === "all") return serviceCounts.reduce((sum, s) => sum + s.count, 0);
    return serviceCounts.find((s) => s.service === service)?.count || 0;
  };

  const loadErrors = async () => {
    setLoading(true);
    const supabase = createClient();
    const offset = page * pageSize;

    // Get total count for current filters
    let countQuery = supabase
      .from("error_logs")
      .select("*", { count: "exact", head: true });
    if (!showResolved) countQuery = countQuery.eq("resolved", false);
    if (serviceFilter !== "all") countQuery = countQuery.eq("service", serviceFilter);
    const { count } = await countQuery;
    setTotalCount(count || 0);

    let query = supabase
      .from("error_logs")
      .select("id, message, stack, url, service, user_id, org_id, resolved, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (!showResolved) {
      query = query.eq("resolved", false);
    }
    if (serviceFilter !== "all") {
      query = query.eq("service", serviceFilter);
    }

    const { data: rawErrors } = await query;

    if (!rawErrors || rawErrors.length === 0) {
      setErrors([]);
      setLoading(false);
      return;
    }

    const userIds = Array.from(new Set(rawErrors.map((e: { user_id: string | null }) => e.user_id).filter(Boolean) as string[]));
    const orgIds = Array.from(new Set(rawErrors.map((e: { org_id: string | null }) => e.org_id).filter(Boolean) as string[]));

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

    setErrors(
      rawErrors.map((e: { id: string; message: string; stack: string | null; url: string | null; service: string | null; user_id: string | null; org_id: string | null; resolved: boolean; created_at: string }) => ({
        id: e.id,
        message: e.message,
        stack: e.stack,
        url: e.url,
        service: e.service || "app",
        user_email: e.user_id ? userMap.get(e.user_id) || null : null,
        org_name: e.org_id ? orgMap.get(e.org_id) || null : null,
        resolved: e.resolved,
        created_at: e.created_at,
      }))
    );

    setLoading(false);
  };

  const resolveError = async (id: string) => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin, super_admin_role")
      .eq("id", user.id)
      .single();
    if (!profile?.is_super_admin && profile?.super_admin_role !== "support") {
      toast.error("Unauthorized: admin access required");
      return;
    }

    const { error } = await supabase
      .from("error_logs")
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to resolve error");
    } else {
      toast.success("Error resolved");
      if (showResolved) {
        setErrors(errors.map((e) => (e.id === id ? { ...e, resolved: true } : e)));
      } else {
        setErrors(errors.filter((e) => e.id !== id));
        setTotalCount((c) => c - 1);
      }
      loadServiceCounts();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === errors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(errors.map((e) => e.id)));
    }
  };

  const getAdminAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return null;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin, super_admin_role")
      .eq("id", user.id)
      .single();
    if (!profile?.is_super_admin && profile?.super_admin_role !== "support") {
      toast.error("Unauthorized: admin access required");
      return null;
    }
    return supabase;
  };

  const bulkResolve = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkLoading(true);
    const supabase = await getAdminAuth();
    if (!supabase) { setBulkLoading(false); return; }

    const { error } = await supabase
      .from("error_logs")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      toast.error("Failed to resolve errors");
    } else {
      toast.success(`Resolved ${ids.length} error${ids.length !== 1 ? "s" : ""}`);
      if (showResolved) {
        setErrors(errors.map((e) => selectedIds.has(e.id) ? { ...e, resolved: true } : e));
      } else {
        setErrors(errors.filter((e) => !selectedIds.has(e.id)));
        setTotalCount((c) => c - ids.length);
      }
      loadServiceCounts();
    }
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} error log${ids.length !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkLoading(true);
    const supabase = await getAdminAuth();
    if (!supabase) { setBulkLoading(false); return; }

    const { error } = await supabase
      .from("error_logs")
      .delete()
      .in("id", ids);

    if (error) {
      toast.error("Failed to delete errors");
    } else {
      toast.success(`Deleted ${ids.length} error${ids.length !== 1 ? "s" : ""}`);
      setErrors(errors.filter((e) => !selectedIds.has(e.id)));
      setTotalCount((c) => c - ids.length);
      loadServiceCounts();
    }
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const serviceBadgeColor = (service: string) => {
    switch (service) {
      case "resend": return "bg-purple-100 text-purple-700";
      case "stripe": return "bg-indigo-100 text-indigo-700";
      case "supabase": return "bg-emerald-100 text-emerald-700";
      case "upstash": return "bg-red-100 text-red-700";
      case "vercel": return "bg-gray-100 text-gray-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
          <p className="text-muted-foreground">
            {totalCount} {showResolved ? "total" : "unresolved"} error{totalCount !== 1 ? "s" : ""}
            {serviceFilter !== "all" && ` in ${serviceFilter}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowResolved(!showResolved); setPage(0); }}
        >
          {showResolved ? "Hide Resolved" : "Show Resolved"}
        </Button>
      </div>

      {/* Service tabs */}
      <Tabs
        value={serviceFilter}
        onValueChange={(v) => { setServiceFilter(v as ServiceFilter); setPage(0); }}
      >
        <TabsList className="h-auto flex-wrap">
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = getServiceCount(tab.value);
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-1.5 text-xs"
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 shadow-sm">
          <Checkbox
            checked={selectedIds.size === errors.length}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={bulkResolve}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
              Resolve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={bulkDelete}
              disabled={bulkLoading}
            >
              {bulkLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Trash2 className="mr-1 h-3 w-3" />}
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : errors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No {serviceFilter !== "all" ? `${serviceFilter} ` : ""}errors found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all row */}
          <div className="flex items-center gap-3 px-1">
            <Checkbox
              checked={errors.length > 0 && selectedIds.size === errors.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-xs text-muted-foreground">
              Select all on this page
            </span>
          </div>

          {errors.map((err: ErrorRow) => (
            <Card key={err.id} className={selectedIds.has(err.id) ? "ring-2 ring-primary/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={selectedIds.has(err.id)}
                      onCheckedChange={() => toggleSelect(err.id)}
                      className="mt-0.5"
                    />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {err.resolved ? (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600"
                        >
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Unresolved
                        </Badge>
                      )}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${serviceBadgeColor(err.service)}`}>
                        {err.service}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(err.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{err.message}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {err.user_email && <span>{err.user_email}</span>}
                      {err.org_name && <span>&middot; {err.org_name}</span>}
                      {err.url && <span>&middot; {err.url}</span>}
                    </div>
                    {err.stack && (
                      <div className="mt-2">
                        <button
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          onClick={() =>
                            setExpandedId(
                              expandedId === err.id ? null : err.id
                            )
                          }
                        >
                          {expandedId === err.id ? (
                            <>
                              <ChevronUp className="h-3 w-3" /> Hide stack
                              trace
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3" /> Show stack
                              trace
                            </>
                          )}
                        </button>
                        {expandedId === err.id && (
                          <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-48">
                            {err.stack}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                  </div>
                  {!err.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveError(err.id)}
                      className="flex-shrink-0"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {(() => {
            const totalPages = Math.ceil(totalCount / pageSize);
            if (totalPages <= 1 && totalCount <= 20) return null;
            const start = page * pageSize + 1;
            const end = Math.min(start + pageSize - 1, totalCount);
            return (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Show</span>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
                      <SelectTrigger className="h-7 w-[70px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 20, 50, 100].map((size) => (
                          <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {start}–{end} of {totalCount.toLocaleString()}
                  </p>
                </div>
                {totalPages > 1 && (
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
