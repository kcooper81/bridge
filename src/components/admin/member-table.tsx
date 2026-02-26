"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { ProtectionBadge } from "@/components/admin/protection-badge";

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

const PAGE_SIZE = 20;
const ROLE_FILTERS = ["all", "admin", "manager", "member"] as const;
const PROTECTION_FILTERS = [
  "all",
  "protected",
  "unprotected",
  "inactive",
  "no-extension",
] as const;

type SortKey = "name" | "email" | "role" | "org_name" | "created_at" | "protection";

function getProtectionLabel(status: string, lastActive: string | null): string {
  if (status === "session_lost") return "unprotected";
  if (status === "active" && lastActive) {
    const diffMs = Date.now() - new Date(lastActive).getTime();
    if (diffMs < 30 * 60 * 1000) return "protected";
    return "inactive";
  }
  return "no-extension";
}

export function MemberTable({
  members,
  showOrgColumn = false,
  orgMap,
  onSelectOrg,
}: MemberTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [protectionFilter, setProtectionFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...members];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }

    if (protectionFilter !== "all") {
      result = result.filter(
        (m) =>
          getProtectionLabel(m.extension_status, m.last_extension_active) ===
          protectionFilter
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
        case "org_name": {
          const aOrg = orgMap?.get(a.org_id || "") || "";
          const bOrg = orgMap?.get(b.org_id || "") || "";
          cmp = aOrg.localeCompare(bOrg);
          break;
        }
        case "created_at":
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
        case "protection": {
          const aLabel = getProtectionLabel(
            a.extension_status,
            a.last_extension_active
          );
          const bLabel = getProtectionLabel(
            b.extension_status,
            b.last_extension_active
          );
          cmp = aLabel.localeCompare(bLabel);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [members, search, roleFilter, protectionFilter, sortKey, sortDir, orgMap]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filters change
  const resetPage = () => setPage(0);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Role:
          </span>
          {ROLE_FILTERS.map((f) => (
            <Button
              key={f}
              variant={roleFilter === f ? "default" : "outline"}
              size="sm"
              className="capitalize h-7 text-xs"
              onClick={() => {
                setRoleFilter(f);
                resetPage();
              }}
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Protection:
          </span>
          {PROTECTION_FILTERS.map((f) => (
            <Button
              key={f}
              variant={protectionFilter === f ? "default" : "outline"}
              size="sm"
              className="capitalize h-7 text-xs"
              onClick={() => {
                setProtectionFilter(f);
                resetPage();
              }}
            >
              {f === "no-extension" ? "No Ext" : f}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} member{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("name")}
                      >
                        Name <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("email")}
                      >
                        Email <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    {showOrgColumn && (
                      <th className="text-left p-3 font-medium hidden md:table-cell">
                        <button
                          className="flex items-center gap-1 hover:text-foreground"
                          onClick={() => handleSort("org_name")}
                        >
                          Organization <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    )}
                    <th className="text-left p-3 font-medium">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("role")}
                      >
                        Role <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("protection")}
                      >
                        Protection <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden xl:table-cell">
                      <button
                        className="flex items-center gap-1 hover:text-foreground"
                        onClick={() => handleSort("created_at")}
                      >
                        Joined <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{m.name}</span>
                          {m.is_super_admin && (
                            <Badge className="bg-amber-500 text-xs">
                              Super Admin
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">
                        {m.email}
                      </td>
                      {showOrgColumn && (
                        <td className="p-3 hidden md:table-cell">
                          {m.org_id && orgMap?.get(m.org_id) ? (
                            <button
                              className="text-blue-600 hover:underline text-left"
                              onClick={() => onSelectOrg?.(m.org_id!)}
                            >
                              {orgMap.get(m.org_id!)}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">
                              &mdash;
                            </span>
                          )}
                        </td>
                      )}
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {m.role}
                        </Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <ProtectionBadge
                          status={m.extension_status || "unknown"}
                          lastActive={m.last_extension_active}
                        />
                      </td>
                      <td className="p-3 text-muted-foreground hidden xl:table-cell">
                        {new Date(m.created_at).toLocaleDateString()}
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
          <p className="text-xs text-muted-foreground">
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
