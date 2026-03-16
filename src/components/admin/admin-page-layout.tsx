"use client";

import { useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Loader2,
  type LucideIcon,
} from "lucide-react";

// ─── Stat Card ───

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "red" | "amber" | "purple" | "slate";
  subtitle?: string;
  onClick?: () => void;
}

const COLOR_MAP = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
} as const;

export function StatCard({ label, value, icon: Icon, color, subtitle, onClick }: StatCardProps) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Card className={onClick ? "cursor-pointer hover:ring-1 hover:ring-primary/30 transition-shadow" : ""}>
      <Wrapper onClick={onClick} className="w-full text-left">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${COLOR_MAP[color].split(" ").slice(0, 2).join(" ")}`}>
              <Icon className={`h-5 w-5 ${COLOR_MAP[color].split(" ").slice(2).join(" ")}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold truncate">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
              {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </CardContent>
      </Wrapper>
    </Card>
  );
}

export function StatCardRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{children}</div>;
}

// ─── Filter Bar ───

export interface FilterGroupProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  formatLabel?: (val: string) => string;
}

export function FilterGroup({ label, options, value, onChange, formatLabel }: FilterGroupProps) {
  return (
    <div className="flex gap-1 flex-wrap items-center">
      <span className="text-xs text-muted-foreground mr-1">{label}:</span>
      {options.map((opt) => (
        <Button
          key={opt}
          variant={value === opt ? "default" : "outline"}
          size="sm"
          className="h-6 text-xs px-2 capitalize"
          onClick={() => onChange(opt)}
        >
          {formatLabel ? formatLabel(opt) : opt}
        </Button>
      ))}
    </div>
  );
}

export interface ToggleFilterProps {
  label: string;
  icon?: LucideIcon;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export function ToggleFilter({ label, icon: Icon, active, onClick, variant = "default" }: ToggleFilterProps) {
  return (
    <Button
      variant={active ? variant : "outline"}
      size="sm"
      className="h-7 text-xs"
      onClick={onClick}
    >
      {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9 h-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

// ─── Select Filter (compact dropdown) ───

export interface SelectFilterProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  formatLabel?: (val: string) => string;
  className?: string;
}

export function SelectFilter({ label, options, value, onChange, formatLabel, className }: SelectFilterProps) {
  const fmt = (v: string) => (formatLabel ? formatLabel(v) : v === "all" ? `All ${label}` : v);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-9 w-auto min-w-[120px] text-xs capitalize ${className || ""}`}>
        <SelectValue>{fmt(value)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-xs capitalize">
            {fmt(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Data Table ───

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  hidden?: string; // responsive hide class e.g. "hidden sm:table-cell"
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyField: keyof T;
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  onRowClick?: (row: T) => void;
  emptyIcon?: LucideIcon;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
  emptyIcon: EmptyIcon,
  emptyMessage = "No results found",
  rowClassName,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {EmptyIcon && <EmptyIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />}
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`p-3 font-medium text-muted-foreground ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    } ${col.hidden || ""}`}
                  >
                    {col.sortable ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => onSort(col.key)}
                      >
                        {col.label}
                        <ArrowUpDown className={`h-3 w-3 ${sortKey === col.key ? "text-foreground" : "text-muted-foreground/40"}`} />
                        {sortKey === col.key && (
                          <span className="text-[10px] text-muted-foreground">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className={`border-b last:border-0 transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-accent/50" : "hover:bg-muted/30"
                  } ${rowClassName?.(row) || ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-3 ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      } ${col.hidden || ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pagination ───

export function Pagination({ page, totalPages, totalItems, onPageChange, pageSize, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100] }: {
  page: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const start = totalItems ? page * (pageSize || 20) + 1 : 0;
  const end = totalItems ? Math.min(start + (pageSize || 20) - 1, totalItems) : 0;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-background/95 backdrop-blur px-3 py-2">
      <div className="flex items-center gap-3">
        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Show</span>
            <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-7 w-[70px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {totalItems
            ? `${start}–${end} of ${totalItems.toLocaleString()}`
            : `Page ${page + 1} of ${totalPages}`}
        </p>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Page Header ───

export function AdminPageHeader({ title, subtitle, actions }: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function ExportButton({ onClick, label = "Export CSV" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="outline" size="sm" className="h-8" onClick={onClick}>
      <Download className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

// ─── Loading State ───

export function AdminLoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// ─── Badge Helpers ───

export function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    business: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    team: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    pro: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
    free: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  };
  return (
    <Badge variant="outline" className={`capitalize text-[11px] ${colors[plan] || colors.free}`}>
      {plan}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    trialing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    past_due: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    canceled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    no_subscription: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };
  const labels: Record<string, string> = {
    past_due: "past due",
    no_subscription: "no sub",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colors[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400",
    manager: "border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400",
    member: "",
  };
  return (
    <Badge variant="outline" className={`capitalize text-[11px] ${colors[role] || ""}`}>
      {role}
    </Badge>
  );
}

// ─── Sorting Hook ───

export function useSortState<T extends string>(defaultKey: T, defaultDir: "asc" | "desc" = "desc") {
  const [sortKey, setSortKey] = useState<T>(defaultKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultDir);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key as T);
      setSortDir("asc");
    }
  };

  return { sortKey, sortDir, handleSort };
}

// ─── Pagination Hook ───

export function usePaginationState(defaultPageSize = 20) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const paginate = <T,>(data: T[]) => {
    const totalPages = Math.ceil(data.length / pageSize);
    const paginated = data.slice(page * pageSize, (page + 1) * pageSize);
    return { paginated, totalPages, totalItems: data.length };
  };

  const resetPage = () => setPage(0);
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(0); // Reset to first page when changing page size
  };

  return { page, setPage, pageSize, setPageSize, paginate, resetPage };
}

// ─── CSV Export ───

export function exportCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
