"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  ShieldOff,
  ShieldCheck,
  UserPlus,
  Clock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { ProtectionBadge } from "@/components/admin/protection-badge";
import { ComposeEmailModal } from "@/components/admin/compose-email-modal";
import {
  AdminPageHeader,
  AdminLoadingState,
  StatCardRow,
  StatCard,
  FilterBar,
  SearchInput,
  SelectFilter,
  ToggleFilter,
  DataTable,
  Pagination,
  ExportButton,
  RoleBadge,
  useSortState,
  usePaginationState,
  exportCsv,
  type ColumnDef,
} from "@/components/admin/admin-page-layout";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
  org_id: string | null;
  org_name: string | null;
  created_at: string;
  last_extension_active: string | null;
  extension_version: string | null;
  extension_status: string;
}

const ROLE_FILTERS = ["all", "admin", "manager", "member"] as const;

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filterSuperAdmin, setFilterSuperAdmin] = useState(false);
  const [filterUnprotected, setFilterUnprotected] = useState(false);
  const [filterNewThisWeek, setFilterNewThisWeek] = useState(false);
  const [filterNoExtension, setFilterNoExtension] = useState(false);
  const { sortKey, sortDir, handleSort } = useSortState<string>("created_at");
  const { page, setPage, pageSize, setPageSize, paginate, resetPage } = usePaginationState();
  const [composeTarget, setComposeTarget] = useState<UserRow | null>(null);

  const loadUsers = useCallback(async () => {
    const supabase = createClient();
    const [profilesRes, orgsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, email, role, is_super_admin, org_id, created_at, last_extension_active, extension_version, extension_status")
        .order("created_at", { ascending: false }),
      supabase.from("organizations").select("id, name"),
    ]);

    const orgMap = new Map((orgsRes.data || []).map((o: { id: string; name: string }) => [o.id, o.name]));
    const rows: UserRow[] = (profilesRes.data || []).map(
      (p: { id: string; name: string; email: string; role: string; is_super_admin: boolean; org_id: string | null; created_at: string; last_extension_active: string | null; extension_version: string | null; extension_status: string }) => ({
        ...p,
        org_name: p.org_id ? orgMap.get(p.org_id) || null : null,
      })
    );

    setUsers(rows);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (filterSuperAdmin) result = result.filter((u) => u.is_super_admin);
    if (filterUnprotected) result = result.filter((u) => u.extension_status === "session_lost");
    if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
    if (filterNewThisWeek) result = result.filter((u) => u.created_at >= oneWeekAgo);
    if (filterNoExtension) result = result.filter((u) => !u.extension_version);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = (a.name || "").localeCompare(b.name || ""); break;
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "role": cmp = a.role.localeCompare(b.role); break;
        case "org_name": cmp = (a.org_name || "").localeCompare(b.org_name || ""); break;
        case "created_at": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case "last_extension_active": cmp = new Date(a.last_extension_active || 0).getTime() - new Date(b.last_extension_active || 0).getTime(); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [users, search, filterSuperAdmin, filterUnprotected, roleFilter, filterNewThisWeek, filterNoExtension, sortKey, sortDir]);

  const { paginated, totalPages } = paginate(filtered);

  const stats = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    return {
      total: users.length,
      protected: users.filter((u) => u.extension_status === "active" || u.extension_status === "session_valid").length,
      unprotected: users.filter((u) => u.extension_status === "session_lost" || !u.extension_version).length,
      newThisWeek: users.filter((u) => u.created_at >= oneWeekAgo).length,
    };
  }, [users]);

  const toggleSuperAdmin = async (userId: string, current: boolean) => {
    const action = current ? "remove super admin from" : "make super admin";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ is_super_admin: !current }).eq("id", userId);

    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success(`Super admin ${current ? "removed" : "granted"}`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_super_admin: !current } : u)));
    }
  };

  const columns: ColumnDef<UserRow>[] = [
    {
      key: "name", label: "Name", sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.name}</span>
          {row.is_super_admin && (
            <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-0 text-[10px]">SA</Badge>
          )}
        </div>
      ),
    },
    {
      key: "email", label: "Email", sortable: true, hidden: "hidden sm:table-cell",
      render: (row) => <span className="text-muted-foreground">{row.email}</span>,
    },
    {
      key: "org_name", label: "Organization", sortable: true, hidden: "hidden md:table-cell",
      render: (row) =>
        row.org_name ? (
          <span className="text-sm">{row.org_name}</span>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    },
    {
      key: "role", label: "Role", sortable: true,
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: "protection", label: "Protection", hidden: "hidden lg:table-cell",
      render: (row) => <ProtectionBadge status={row.extension_status || "unknown"} lastActive={row.last_extension_active} />,
    },
    {
      key: "created_at", label: "Joined", sortable: true, hidden: "hidden xl:table-cell",
      render: (row) => <span className="text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "last_extension_active", label: "Last Active", sortable: true, hidden: "hidden xl:table-cell",
      render: (row) => <span className="text-muted-foreground">{relativeTime(row.last_extension_active)}</span>,
    },
    {
      key: "actions", label: "", align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); setComposeTarget(row); }}
            title={`Email ${row.email}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); toggleSuperAdmin(row.id, row.is_super_admin); }}
            title={row.is_super_admin ? "Remove super admin" : "Make super admin"}
          >
            {row.is_super_admin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    exportCsv("users.csv",
      ["Name", "Email", "Role", "Organization", "Super Admin", "Last Active", "Extension Version", "Joined"],
      filtered.map((u) => [
        u.name || "", u.email, u.role, u.org_name || "", String(u.is_super_admin),
        relativeTime(u.last_extension_active), u.extension_version || "", u.created_at,
      ])
    );
  };

  if (loading) return <AdminLoadingState />;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Users"
        subtitle={`${users.length} users across all organizations`}
        actions={<ExportButton onClick={handleExport} />}
      />

      <StatCardRow>
        <StatCard label="Total Users" value={stats.total} icon={Users} color="blue" />
        <StatCard label="Protected" value={stats.protected} icon={ShieldCheck} color="green" />
        <StatCard
          label="Unprotected"
          value={stats.unprotected}
          icon={ShieldOff}
          color="red"
          onClick={stats.unprotected > 0 ? () => { setFilterUnprotected(true); resetPage(); } : undefined}
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek}
          icon={UserPlus}
          color="amber"
          onClick={stats.newThisWeek > 0 ? () => { setFilterNewThisWeek(true); resetPage(); } : undefined}
        />
      </StatCardRow>

      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Search by name or email..." />
        <SelectFilter label="Role" options={ROLE_FILTERS} value={roleFilter} onChange={(v) => { setRoleFilter(v); resetPage(); }} />
        <ToggleFilter label="Super Admins" icon={Shield} active={filterSuperAdmin} onClick={() => { setFilterSuperAdmin(!filterSuperAdmin); resetPage(); }} />
        <ToggleFilter label="Unprotected" icon={ShieldOff} active={filterUnprotected} onClick={() => { setFilterUnprotected(!filterUnprotected); resetPage(); }} variant="destructive" />
        <ToggleFilter label="New This Week" icon={UserPlus} active={filterNewThisWeek} onClick={() => { setFilterNewThisWeek(!filterNewThisWeek); resetPage(); }} />
        <ToggleFilter label="No Extension" icon={Clock} active={filterNoExtension} onClick={() => { setFilterNoExtension(!filterNoExtension); resetPage(); }} />
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
      </FilterBar>

      <DataTable
        data={paginated}
        columns={columns}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        emptyIcon={Users}
        emptyMessage="No users found"
      />

      <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />

      <ComposeEmailModal
        open={!!composeTarget}
        onOpenChange={(open) => !open && setComposeTarget(null)}
        toEmail={composeTarget?.email || ""}
        toName={composeTarget?.name || ""}
        orgId={composeTarget?.org_id || undefined}
      />
    </div>
  );
}
