"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  ExternalLink,
  Loader2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

interface SubRow {
  id: string;
  org_id: string;
  org_name: string;
  plan: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  mrr: number;
}

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  past_due: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  canceled: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

const STATUS_FILTERS = ["all", "active", "trialing", "past_due", "canceled", "paused"] as const;
const PLAN_PRICES: Record<string, number> = { free: 0, pro: 9, team: 7, business: 12 };

type SortKey = "org_name" | "plan" | "status" | "seats" | "current_period_end" | "mrr" | "created_at";

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    const supabase = createClient();

    const [subsRes, orgsRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("id, org_id, plan, status, seats, current_period_end, stripe_customer_id, stripe_subscription_id, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("organizations").select("id, name"),
    ]);

    const orgMap = new Map(
      (orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name])
    );

    const rows: SubRow[] = (subsRes.data || []).map(
      (s: Omit<SubRow, "org_name" | "mrr">) => ({
        ...s,
        org_name: orgMap.get(s.org_id) || "Unknown",
        mrr: (PLAN_PRICES[s.plan] || 0) * (s.seats || 1),
      })
    );

    setSubs(rows);
    setLoading(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getFilteredAndSorted = () => {
    let filtered = [...subs];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((s) => s.org_name.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "org_name":
          cmp = a.org_name.localeCompare(b.org_name);
          break;
        case "plan":
          cmp = a.plan.localeCompare(b.plan);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "seats":
          cmp = a.seats - b.seats;
          break;
        case "current_period_end":
          cmp = new Date(a.current_period_end || 0).getTime() - new Date(b.current_period_end || 0).getTime();
          break;
        case "mrr":
          cmp = a.mrr - b.mrr;
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  };

  const allFiltered = getFilteredAndSorted();
  const totalFiltered = allFiltered.length;
  const paginatedSubs = allFiltered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

  const totalMrr = subs
    .filter((s) => s.status === "active" || s.status === "trialing")
    .reduce((acc, s) => acc + s.mrr, 0);

  const exportCsv = () => {
    const header = "Organization,Plan,Status,Seats,MRR,Renews,Stripe ID,Created";
    const csvRows = paginatedSubs.map(
      (s) =>
        `"${s.org_name}","${s.plan}","${s.status}",${s.seats},${s.mrr.toFixed(2)},"${s.current_period_end || ""}","${s.stripe_subscription_id || ""}","${s.created_at}"`
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscriptions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            {subs.length} subscriptions &middot; ${totalMrr.toFixed(0)} MRR
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by organization..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-sm text-muted-foreground self-center mr-1">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(f);
                setPage(0);
              }}
              className="capitalize"
            >
              {f === "past_due" ? "Past Due" : f}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {paginatedSubs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No subscriptions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("org_name")}>
                        Organization <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("plan")}>
                        Plan <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("status")}>
                        Status <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => handleSort("seats")}>
                        Seats <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => handleSort("mrr")}>
                        MRR <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("current_period_end")}>
                        Renews <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium">Stripe</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubs.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <a
                          href={`/admin/organizations/${sub.org_id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {sub.org_name}
                        </a>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {sub.plan}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[sub.status] || ""}`}
                        >
                          {sub.status === "past_due" ? "past due" : sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        {sub.seats}
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        ${sub.mrr.toFixed(0)}
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {sub.current_period_end
                          ? new Date(sub.current_period_end).toLocaleDateString()
                          : "\u2014"}
                      </td>
                      <td className="p-3 text-right">
                        {sub.stripe_subscription_id ? (
                          <a
                            href={`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">&mdash;</span>
                        )}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
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
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
