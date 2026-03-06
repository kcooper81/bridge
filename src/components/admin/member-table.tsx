"use client";

import { useState, useMemo } from "react";
import { Users } from "lucide-react";
import { ProtectionBadge } from "@/components/admin/protection-badge";
import {
  FilterBar,
  SearchInput,
  FilterGroup,
  DataTable,
  Pagination,
  RoleBadge,
  useSortState,
  usePaginationState,
  type ColumnDef,
} from "@/components/admin/admin-page-layout";

export interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
  org_id: string | null;
  created_at: string;
  extension_status: string;
  last_extension_active: string | null;
}

interface MemberTableProps {
  members: MemberRow[];
  showOrgColumn?: boolean;
  orgMap?: Map<string, string>;
  onSelectOrg?: (orgId: string) => void;
}

const ROLE_FILTERS = ["all", "admin", "manager", "member"] as const;
const PROTECTION_FILTERS = ["all", "protected", "unprotected", "inactive", "no-extension"] as const;

function getProtectionLabel(status: string, lastActive: string | null): string {
  if (status === "session_lost") return "unprotected";
  if (status === "active" && lastActive) {
    const diffMs = Date.now() - new Date(lastActive).getTime();
    if (diffMs < 30 * 60 * 1000) return "protected";
    return "inactive";
  }
  return "no-extension";
}

export function MemberTable({ members, showOrgColumn = false, orgMap, onSelectOrg }: MemberTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [protectionFilter, setProtectionFilter] = useState("all");
  const { sortKey, sortDir, handleSort } = useSortState<string>("name", "asc");
  const { page, setPage, paginate, resetPage } = usePaginationState();

  const filtered = useMemo(() => {
    let result = [...members];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }
    if (roleFilter !== "all") result = result.filter((m) => m.role === roleFilter);
    if (protectionFilter !== "all") {
      result = result.filter((m) => getProtectionLabel(m.extension_status, m.last_extension_active) === protectionFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = (a.name || "").localeCompare(b.name || ""); break;
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "role": cmp = a.role.localeCompare(b.role); break;
        case "org_name": {
          const aOrg = orgMap?.get(a.org_id || "") || "";
          const bOrg = orgMap?.get(b.org_id || "") || "";
          cmp = aOrg.localeCompare(bOrg);
          break;
        }
        case "created_at": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case "protection": {
          cmp = getProtectionLabel(a.extension_status, a.last_extension_active)
            .localeCompare(getProtectionLabel(b.extension_status, b.last_extension_active));
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [members, search, roleFilter, protectionFilter, sortKey, sortDir, orgMap]);

  const { paginated, totalPages } = paginate(filtered);

  const columns: ColumnDef<MemberRow>[] = [
    {
      key: "name", label: "Name", sortable: true,
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "email", label: "Email", sortable: true, hidden: "hidden sm:table-cell",
      render: (row) => <span className="text-muted-foreground">{row.email}</span>,
    },
    ...(showOrgColumn ? [{
      key: "org_name", label: "Organization", sortable: true, hidden: "hidden md:table-cell",
      render: (row: MemberRow) =>
        row.org_id && orgMap?.get(row.org_id) ? (
          <button className="text-blue-600 hover:underline text-left" onClick={() => onSelectOrg?.(row.org_id!)}>
            {orgMap.get(row.org_id!)}
          </button>
        ) : (
          <span className="text-muted-foreground">&mdash;</span>
        ),
    } satisfies ColumnDef<MemberRow>] : []),
    {
      key: "role", label: "Role", sortable: true,
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: "protection", label: "Protection", sortable: true, hidden: "hidden lg:table-cell",
      render: (row) => <ProtectionBadge status={row.extension_status || "unknown"} lastActive={row.last_extension_active} />,
    },
    {
      key: "created_at", label: "Joined", sortable: true, hidden: "hidden xl:table-cell",
      render: (row) => <span className="text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="space-y-3">
      <FilterBar>
        <SearchInput value={search} onChange={(v) => { setSearch(v); resetPage(); }} placeholder="Search by name or email..." />
        <FilterGroup label="Role" options={ROLE_FILTERS} value={roleFilter} onChange={(v) => { setRoleFilter(v); resetPage(); }} />
        <FilterGroup
          label="Protection"
          options={PROTECTION_FILTERS}
          value={protectionFilter}
          onChange={(v) => { setProtectionFilter(v); resetPage(); }}
          formatLabel={(v) => v === "no-extension" ? "No Ext" : v}
        />
        <p className="text-xs text-muted-foreground">{filtered.length} member{filtered.length !== 1 ? "s" : ""}</p>
      </FilterBar>

      <DataTable
        data={paginated}
        columns={columns}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        emptyIcon={Users}
        emptyMessage="No members found"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
