"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PLAN_PRICES } from "@/lib/constants";
import { CreditCard, ExternalLink, TrendingUp, AlertTriangle, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComposeEmailModal } from "@/components/admin/compose-email-modal";
import {
  AdminPageHeader,
  AdminLoadingState,
  StatCardRow,
  StatCard,
  FilterBar,
  SearchInput,
  SelectFilter,
  DataTable,
  Pagination,
  ExportButton,
  PlanBadge,
  StatusBadge,
  useSortState,
  usePaginationState,
  exportCsv,
  type ColumnDef,
} from "@/components/admin/admin-page-layout";

interface SubRow {
  id: string;
  org_id: string;
  org_name: string;
  admin_email: string | null;
  admin_name: string | null;
  plan: string;
  status: string;
  seats: number;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  mrr: number;
}

const STATUS_FILTERS = ["all", "active", "trialing", "past_due", "canceled", "paused", "no_subscription"] as const;
const PLAN_FILTERS = ["all", "free", "pro", "team", "business"] as const;
export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const { sortKey, sortDir, handleSort } = useSortState<string>("created_at");
  const { page, setPage, pageSize, setPageSize, paginate, resetPage } = usePaginationState();
  const [composeTarget, setComposeTarget] = useState<SubRow | null>(null);

  const loadSubs = useCallback(async () => {
    const supabase = createClient();
    const [orgsRes, subsRes, profilesRes] = await Promise.all([
      supabase.from("organizations").select("id, name, plan, created_at").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("id, org_id, plan, status, seats, current_period_end, stripe_customer_id, stripe_subscription_id, created_at"),
      supabase.from("profiles").select("org_id, email, name, role").eq("role", "admin"),
    ]);

    if (orgsRes.error) {
      setError(`Organizations query failed: ${orgsRes.error.message}`);
      setLoading(false);
      return;
    }

    const subMap = new Map((subsRes.data || []).map((s) => [s.org_id, s]));

    // Build map of org_id → first admin contact
    const adminMap = new Map<string, { email: string; name: string }>();
    for (const p of (profilesRes.data || []) as { org_id: string; email: string; name: string; role: string }[]) {
      if (p.org_id && !adminMap.has(p.org_id)) {
        adminMap.set(p.org_id, { email: p.email, name: p.name });
      }
    }

    const rows: SubRow[] = (orgsRes.data || []).map(
      (org: { id: string; name: string; plan: string; created_at: string }) => {
        const sub = subMap.get(org.id);
        const admin = adminMap.get(org.id);
        const plan = sub?.plan || org.plan || "free";
        const status = sub ? sub.status : "no_subscription";
        const seats = sub?.seats || 1;
        return {
          id: sub?.id || org.id,
          org_id: org.id,
          org_name: org.name || "Unknown",
          admin_email: admin?.email || null,
          admin_name: admin?.name || null,
          plan,
          status,
          seats,
          current_period_end: sub?.current_period_end || null,
          stripe_customer_id: sub?.stripe_customer_id || null,
          stripe_subscription_id: sub?.stripe_subscription_id || null,
          created_at: sub?.created_at || org.created_at,
          mrr: (PLAN_PRICES[plan] || 0) * seats,
        };
      }
    );

    setSubs(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSubs();

    // Realtime: refresh on subscription changes
    const supabase = createClient();
    const channel = supabase
      .channel("admin-subs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "subscriptions" }, () => loadSubs())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "subscriptions" }, () => loadSubs())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadSubs]);

  const filtered = useMemo(() => {
    let result = [...subs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.org_name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (planFilter !== "all") result = result.filter((s) => s.plan === planFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "org_name": cmp = a.org_name.localeCompare(b.org_name); break;
        case "plan": cmp = a.plan.localeCompare(b.plan); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "seats": cmp = a.seats - b.seats; break;
        case "mrr": cmp = a.mrr - b.mrr; break;
        case "current_period_end": cmp = new Date(a.current_period_end || 0).getTime() - new Date(b.current_period_end || 0).getTime(); break;
        case "created_at": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [subs, search, statusFilter, planFilter, sortKey, sortDir]);

  const { paginated, totalPages } = paginate(filtered);

  const stats = useMemo(() => {
    const active = subs.filter((s) => s.status === "active" || s.status === "trialing");
    return {
      mrr: active.reduce((acc, s) => acc + s.mrr, 0),
      active: subs.filter((s) => s.status === "active").length,
      pastDue: subs.filter((s) => s.status === "past_due").length,
      trialing: subs.filter((s) => s.status === "trialing").length,
    };
  }, [subs]);

  const columns: ColumnDef<SubRow>[] = [
    {
      key: "org_name", label: "Organization", sortable: true,
      render: (row) => (
        <span className="font-medium">{row.org_name}</span>
      ),
    },
    {
      key: "plan", label: "Plan", sortable: true,
      render: (row) => <PlanBadge plan={row.plan} />,
    },
    {
      key: "status", label: "Status", sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "seats", label: "Seats", sortable: true, align: "right", hidden: "hidden sm:table-cell",
      render: (row) => <span className="tabular-nums">{row.seats}</span>,
    },
    {
      key: "mrr", label: "MRR", sortable: true, align: "right", hidden: "hidden sm:table-cell",
      render: (row) => <span className="tabular-nums">${row.mrr.toFixed(0)}</span>,
    },
    {
      key: "current_period_end", label: "Renews", sortable: true, hidden: "hidden md:table-cell",
      render: (row) => (
        <span className="text-muted-foreground">
          {row.current_period_end ? new Date(row.current_period_end).toLocaleDateString() : "\u2014"}
        </span>
      ),
    },
    {
      key: "created_at", label: "Created", sortable: true, hidden: "hidden lg:table-cell",
      render: (row) => <span className="text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions", label: "", align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          {row.admin_email && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={`Email ${row.admin_email}`} onClick={(e) => { e.stopPropagation(); setComposeTarget(row); }}>
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}
          {row.stripe_subscription_id && (
            <a
              href={`https://dashboard.stripe.com/subscriptions/${row.stripe_subscription_id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      ),
    },
  ];

  const handleExport = () => {
    exportCsv("subscriptions.csv",
      ["Organization", "Plan", "Status", "Seats", "MRR", "Renews", "Stripe ID", "Created"],
      filtered.map((s) => [
        s.org_name, s.plan, s.status, String(s.seats), s.mrr.toFixed(2),
        s.current_period_end || "", s.stripe_subscription_id || "", s.created_at,
      ])
    );
  };

  if (loading) return <AdminLoadingState />;

  if (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Subscriptions" />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setError(null); setLoading(true); loadSubs(); }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Subscriptions"
        subtitle={`${subs.length} orgs \u00B7 ${subs.filter((s) => s.status !== "no_subscription").length} with subs \u00B7 $${stats.mrr.toFixed(0)} MRR`}
        actions={<ExportButton onClick={handleExport} />}
      />

      <StatCardRow>
        <StatCard label="Monthly Revenue" value={`$${stats.mrr.toFixed(0)}`} icon={TrendingUp} color="green" />
        <StatCard label="Active Subs" value={stats.active} icon={CreditCard} color="blue" />
        <StatCard
          label="Past Due"
          value={stats.pastDue}
          icon={AlertTriangle}
          color="red"
          onClick={stats.pastDue > 0 ? () => { setStatusFilter("past_due"); resetPage(); } : undefined}
        />
        <StatCard
          label="Trialing"
          value={stats.trialing}
          icon={Users}
          color="amber"
          onClick={stats.trialing > 0 ? () => { setStatusFilter("trialing"); resetPage(); } : undefined}
        />
      </StatCardRow>

      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Search by organization..." />
        <SelectFilter
          label="Status"
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); resetPage(); }}
          formatLabel={(v) => v === "past_due" ? "Past Due" : v === "no_subscription" ? "No Sub" : v === "all" ? "All Status" : v}
        />
        <SelectFilter
          label="Plan"
          options={PLAN_FILTERS}
          value={planFilter}
          onChange={(v) => { setPlanFilter(v); resetPage(); }}
        />
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
      </FilterBar>

      <DataTable
        data={paginated}
        columns={columns}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        emptyIcon={CreditCard}
        emptyMessage="No subscriptions found"
      />

      <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />

      <ComposeEmailModal
        open={!!composeTarget}
        onOpenChange={(open) => !open && setComposeTarget(null)}
        toEmail={composeTarget?.admin_email || ""}
        toName={composeTarget?.admin_name || ""}
        orgId={composeTarget?.org_id}
      />
    </div>
  );
}
