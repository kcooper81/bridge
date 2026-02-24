"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Building2,
  Search,
  Loader2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

interface OrgRow {
  id: string;
  name: string;
  domain: string | null;
  is_suspended: boolean;
  created_at: string;
  plan: string;
  status: string;
  seats: number;
  memberCount: number;
  promptCount: number;
  mrr: number;
}

const PAGE_SIZE = 20;
const PLAN_FILTERS = ["all", "free", "pro", "team", "business"] as const;
const STATUS_FILTERS = ["all", "active", "trialing", "past_due", "canceled", "paused"] as const;

const PLAN_PRICES: Record<string, number> = { free: 0, pro: 9, team: 7, business: 12 };

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  past_due: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  canceled: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

type SortKey = "name" | "plan" | "memberCount" | "promptCount" | "created_at" | "mrr";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadOrgs();
  }, [page, planFilter, statusFilter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Re-sort when sort changes (without refetching)
  useEffect(() => {
    if (!loading) loadOrgs();
  }, [sortKey, sortDir]);

  const loadOrgs = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: allOrgs, error } = await supabase
      .from("organizations")
      .select("id, name, domain, is_suspended, created_at")
      .order("created_at", { ascending: false });

    if (error || !allOrgs) {
      setLoading(false);
      return;
    }

    const [subsResult, membersResult, promptsResult] = await Promise.all([
      supabase.from("subscriptions").select("org_id, plan, status, seats"),
      supabase.from("profiles").select("org_id"),
      supabase.from("prompts").select("org_id"),
    ]);

    const subMap = new Map(
      (subsResult.data || []).map((s: { org_id: string; plan: string; status: string; seats: number }) => [
        s.org_id,
        { plan: s.plan, status: s.status, seats: s.seats },
      ])
    );
    const memberCounts = new Map<string, number>();
    (membersResult.data || []).forEach((m: { org_id: string }) => {
      memberCounts.set(m.org_id, (memberCounts.get(m.org_id) || 0) + 1);
    });
    const promptCounts = new Map<string, number>();
    (promptsResult.data || []).forEach((p: { org_id: string }) => {
      promptCounts.set(p.org_id, (promptCounts.get(p.org_id) || 0) + 1);
    });

    let rows: OrgRow[] = allOrgs.map((o) => {
      const sub = subMap.get(o.id);
      const plan = sub?.plan || "free";
      const seats = sub?.seats || 1;
      return {
        ...o,
        is_suspended: o.is_suspended || false,
        plan,
        status: sub?.status || "active",
        seats,
        memberCount: memberCounts.get(o.id) || 0,
        promptCount: promptCounts.get(o.id) || 0,
        mrr: (PLAN_PRICES[plan] || 0) * seats,
      };
    });

    // Apply plan filter
    if (planFilter !== "all") {
      rows = rows.filter((r) => r.plan === planFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.domain && r.domain.toLowerCase().includes(q))
      );
    }

    // Sort
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "plan":
          cmp = a.plan.localeCompare(b.plan);
          break;
        case "memberCount":
          cmp = a.memberCount - b.memberCount;
          break;
        case "promptCount":
          cmp = a.promptCount - b.promptCount;
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

    setTotalCount(rows.length);
    setOrgs(rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(0);
    loadOrgs();
  };

  const exportCsv = () => {
    const header = "Name,Domain,Plan,Status,Members,Prompts,MRR,Created,Suspended";
    const csvRows = orgs.map(
      (o) =>
        `"${o.name}","${o.domain || ""}","${o.plan}","${o.status}",${o.memberCount},${o.promptCount},${o.mrr.toFixed(2)},"${o.created_at}",${o.is_suspended}`
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organizations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            {totalCount} organizations total
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or domain..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {PLAN_FILTERS.map((f) => (
              <Button
                key={f}
                variant={planFilter === f ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPlanFilter(f);
                  setPage(0);
                }}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : orgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No organizations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("name")}>
                        Name <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Domain</th>
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("plan")}>
                        Plan <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => handleSort("memberCount")}>
                        Members <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium hidden sm:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => handleSort("promptCount")}>
                        Prompts <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium hidden md:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground ml-auto" onClick={() => handleSort("mrr")}>
                        MRR <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("created_at")}>
                        Created <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr
                      key={org.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{org.name}</span>
                          {org.is_suspended && (
                            <Badge variant="destructive" className="text-xs">
                              Suspended
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {org.domain || "\u2014"}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {org.plan}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[org.status] || ""}`}
                        >
                          {org.status === "past_due" ? "past due" : org.status}
                        </span>
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        {org.memberCount}
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        {org.promptCount}
                      </td>
                      <td className="p-3 text-right hidden md:table-cell">
                        ${org.mrr.toFixed(0)}
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell">
                        {new Date(org.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/organizations/${org.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
