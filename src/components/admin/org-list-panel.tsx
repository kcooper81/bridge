"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2, Users, ArrowUpDown } from "lucide-react";

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

export function OrgListPanel({
  orgs,
  selectedOrgId,
  onSelect,
}: OrgListPanelProps) {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...orgs];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.domain && o.domain.toLowerCase().includes(q))
      );
    }

    if (planFilter !== "all") {
      result = result.filter((o) => o.plan === planFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "suspended") {
        result = result.filter((o) => o.is_suspended);
      } else {
        result = result.filter((o) => !o.is_suspended);
      }
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "created_at":
          cmp =
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime();
          break;
        case "memberCount":
          cmp = a.memberCount - b.memberCount;
          break;
        case "plan":
          cmp = a.plan.localeCompare(b.plan);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [orgs, search, planFilter, statusFilter, sortKey, sortDir]);

  const cycleSort = () => {
    const keys: SortKey[] = ["created_at", "name", "memberCount", "plan"];
    const currentIdx = keys.indexOf(sortKey);
    const nextIdx = (currentIdx + 1) % keys.length;
    setSortKey(keys[nextIdx]);
    setSortDir("desc");
  };

  const sortLabel: Record<SortKey, string> = {
    created_at: "Newest",
    name: "Name",
    memberCount: "Members",
    plan: "Plan",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 space-y-2 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-9 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Plan filters */}
        <div className="flex gap-1 flex-wrap">
          {PLAN_FILTERS.map((f) => (
            <Button
              key={f}
              variant={planFilter === f ? "default" : "outline"}
              size="sm"
              className="capitalize h-6 text-xs px-2"
              onClick={() => setPlanFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Status filters + sort */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "outline"}
                size="sm"
                className="capitalize h-6 text-xs px-2"
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={cycleSort}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            {sortLabel[sortKey]}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} team{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Org cards list */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No teams found</p>
          </div>
        ) : (
          <div className="p-1">
            {filtered.map((org) => (
              <button
                key={org.id}
                className={`w-full text-left p-3 rounded-md mb-1 transition-colors border ${
                  selectedOrgId === org.id
                    ? "bg-accent border-l-2 border-l-primary border-t-transparent border-r-transparent border-b-transparent"
                    : "border-transparent hover:bg-muted/50"
                }`}
                onClick={() => onSelect(org.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {org.name}
                  </span>
                  {org.is_suspended && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] h-4 px-1 ml-1 shrink-0"
                    >
                      Suspended
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground truncate">
                    {org.domain || "No domain"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] h-4 px-1.5"
                  >
                    {org.plan}
                  </Badge>
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
