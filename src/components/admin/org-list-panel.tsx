"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Users, ArrowUpDown } from "lucide-react";
import { PlanBadge, SearchInput, SelectFilter } from "@/components/admin/admin-page-layout";

export interface OrgListItem {
  id: string;
  name: string;
  domain: string | null;
  is_suspended: boolean;
  created_at: string;
  plan: string;
  status: string;
  memberCount: number;
}

interface OrgListPanelProps {
  orgs: OrgListItem[];
  selectedOrgId: string | null;
  onSelect: (orgId: string) => void;
}

const PLAN_FILTERS = ["all", "free", "pro", "team", "business"] as const;
const STATUS_FILTERS = ["all", "active", "suspended"] as const;
type SortKey = "name" | "created_at" | "memberCount" | "plan";

const SORT_LABELS: Record<SortKey, string> = {
  created_at: "Newest",
  name: "Name",
  memberCount: "Members",
  plan: "Plan",
};

export function OrgListPanel({ orgs, selectedOrgId, onSelect }: OrgListPanelProps) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...orgs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.name.toLowerCase().includes(q) || (o.domain && o.domain.toLowerCase().includes(q)));
    }
    if (planFilter !== "all") result = result.filter((o) => o.plan === planFilter);
    if (statusFilter === "suspended") result = result.filter((o) => o.is_suspended);
    else if (statusFilter === "active") result = result.filter((o) => !o.is_suspended);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "created_at": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case "memberCount": cmp = a.memberCount - b.memberCount; break;
        case "plan": cmp = a.plan.localeCompare(b.plan); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [orgs, search, planFilter, statusFilter, sortKey, sortDir]);

  const cycleSort = () => {
    const keys: SortKey[] = ["created_at", "name", "memberCount", "plan"];
    const nextIdx = (keys.indexOf(sortKey) + 1) % keys.length;
    setSortKey(keys[nextIdx]);
    setSortDir("desc");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-2 border-b">
        <SearchInput value={search} onChange={setSearch} placeholder="Search organizations..." />
        <div className="flex items-center gap-1.5">
          <SelectFilter label="Plan" options={PLAN_FILTERS} value={planFilter} onChange={setPlanFilter} className="flex-1 min-w-0" />
          <SelectFilter label="Status" options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} className="flex-1 min-w-0" />
          <Button variant="ghost" size="sm" className="h-9 text-xs px-2 shrink-0" onClick={cycleSort} title={`Sort by ${SORT_LABELS[sortKey]}`}>
            <ArrowUpDown className="h-3 w-3 mr-1" />
            {SORT_LABELS[sortKey]}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {filtered.length} org{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Building2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No organizations found</p>
          </div>
        ) : (
          <div className="p-1">
            {filtered.map((org) => (
              <button
                key={org.id}
                className={`w-full text-left p-3 rounded-lg mb-0.5 transition-all ${
                  selectedOrgId === org.id
                    ? "bg-accent ring-1 ring-primary/20"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onSelect(org.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{org.name}</span>
                  {org.is_suspended && (
                    <span className="text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded shrink-0">
                      Suspended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {org.domain || "No domain"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <PlanBadge plan={org.plan} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {org.memberCount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
