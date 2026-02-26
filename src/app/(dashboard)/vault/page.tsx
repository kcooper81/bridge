"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PromptModal } from "@/components/modals/prompt-modal";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle2,
  Copy,
  Files,
  FolderOpen,
  Heart,
  Import,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { VAULT_PAGE_SIZE } from "@/lib/constants";
import {
  deletePrompt,
  duplicatePrompt,
  toggleFavorite,
  recordUsage,
  updatePrompt,
  ratePrompt,
  getUserRatingsForOrg,
} from "@/lib/vault-api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { trackPurchase, trackPromptUsed } from "@/lib/analytics";
import type { Prompt, PromptStatus } from "@/lib/types";
import { PageSkeleton } from "@/components/dashboard/skeleton-loader";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { UpgradePrompt, LimitNudge } from "@/components/upgrade";
import { ImportExportModal } from "@/components/dashboard/import-export-modal";
import { FolderManager } from "@/components/dashboard/folder-manager";
import { ManageCategoriesModal } from "@/components/dashboard/manage-categories-modal";
import { FillTemplateModal } from "@/components/modals/fill-template-modal";

const STATUS_TABS: { label: string; value: PromptStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Archived", value: "archived" },
];

const STATUS_BADGE_VARIANT: Record<PromptStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  pending: "outline",
  approved: "default",
  archived: "destructive",
};

export default function VaultPage() {
  const { prompts, folders, teams, guidelines, loading, refresh, currentUserRole, noOrg } = useOrg();
  const { checkLimit, planLimits, canAccess } = useSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PromptStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [bulkLoading, setBulkLoading] = useState(false);

  const canApprove = currentUserRole === "admin" || currentUserRole === "manager";

  // Show checkout success toast
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const plan = searchParams.get("plan") || "your new plan";
      trackPurchase(plan);
      toast.success(`Welcome to ${plan}! Your upgrade is active.`);
      router.replace("/vault");
    }
  }, [searchParams, router]);

  // Load user ratings
  useEffect(() => {
    getUserRatingsForOrg().then(setUserRatings).catch(() => {});
  }, []);

  const [filterFolder, setFilterFolder] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [fillPrompt, setFillPrompt] = useState<Prompt | null>(null);

  const pendingCount = useMemo(
    () => prompts.filter((p) => p.status === "pending").length,
    [prompts]
  );

  const filtered = useMemo(() => {
    let result = [...prompts];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.content.toLowerCase().includes(lower) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(lower))
      );
    }

    if (filterFolder) result = result.filter((p) => p.folder_id === filterFolder);
    if (filterTeam) result = result.filter((p) => p.department_id === filterTeam);

    switch (sort) {
      case "popular":
        result.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
        break;
      case "alpha":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "rating":
        result.sort((a, b) => {
          const aAvg = a.rating_count ? a.rating_total / a.rating_count : 0;
          const bAvg = b.rating_count ? b.rating_total / b.rating_count : 0;
          return bAvg - aAvg;
        });
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }

    return result;
  }, [prompts, search, filterFolder, filterTeam, sort, statusFilter]);

  const pageCount = Math.ceil(filtered.length / VAULT_PAGE_SIZE);
  const pageItems = filtered.slice(
    page * VAULT_PAGE_SIZE,
    (page + 1) * VAULT_PAGE_SIZE
  );

  const totalUses = prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0);
  const sharedCount = prompts.filter((p) => p.status === "approved").length;
  const enforcedGuidelines = guidelines.filter((s) => s.enforced).length;

  function openNewPrompt() {
    if (!checkLimit("create_prompt", prompts.length)) return;
    setEditPrompt(null);
    setModalOpen(true);
  }

  function openEditPrompt(p: Prompt) {
    setEditPrompt(p);
    setModalOpen(true);
  }

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this prompt?")) return;
      try {
        await deletePrompt(id);
        toast.success("Prompt deleted");
        refresh();
      } catch {
        toast.error("Failed to delete prompt");
      }
    },
    [refresh]
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        await duplicatePrompt(id);
        toast.success("Prompt duplicated");
        refresh();
      } catch {
        toast.error("Failed to duplicate prompt");
      }
    },
    [refresh]
  );

  const handleToggleFavorite = useCallback(
    async (id: string, current: boolean) => {
      try {
        await toggleFavorite(id, current);
        refresh();
      } catch {
        toast.error("Failed to update favorite");
      }
    },
    [refresh]
  );

  async function handleCopy(prompt: Prompt) {
    // If it's a template with variables, open the fill modal instead
    if (prompt.is_template && prompt.template_variables?.length > 0) {
      setFillPrompt(prompt);
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success("Copied to clipboard");
      trackPromptUsed("copy");
      recordUsage(prompt.id).catch(() => {});
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  async function handleRate(promptId: string, rating: number) {
    const ok = await ratePrompt(promptId, rating);
    if (ok) {
      setUserRatings((prev) => ({ ...prev, [promptId]: rating }));
      refresh();
    } else {
      toast.error("Failed to rate prompt");
    }
  }

  // ─── Bulk Actions ───
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === pageItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageItems.map((p) => p.id)));
    }
  }

  async function bulkUpdateStatus(newStatus: PromptStatus) {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      for (const id of Array.from(selectedIds)) {
        await updatePrompt(id, { status: newStatus });
      }
      toast.success(`${selectedIds.size} prompt(s) updated to ${newStatus}`);
      setSelectedIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to update prompts");
    } finally {
      setBulkLoading(false);
    }
  }

  if (loading) return <PageSkeleton />;

  if (noOrg) {
    return (
      <>
        <PageHeader title="Prompts" description="Manage and organize your team's AI prompts" />
        <NoOrgBanner />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Manage and organize your team's AI prompts"
        actions={
          <div className="flex items-center gap-2">
            {canAccess("import_export") && (
              <Button variant="outline" size="sm" onClick={() => setImportExportOpen(true)}>
                <Import className="mr-2 h-4 w-4" />
                Import / Export
              </Button>
            )}
            <Button onClick={openNewPrompt}>
              <Plus className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </div>
        }
      />

      {!checkLimit("create_prompt", prompts.length) && (
        <UpgradePrompt feature="create_prompt" current={prompts.length} max={planLimits.max_prompts} className="mb-6" />
      )}
      <LimitNudge feature="create_prompt" current={prompts.length} max={planLimits.max_prompts} className="mb-4" />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Prompts"
          value={prompts.length}
          icon={<Archive className="h-5 w-5" />}
        />
        <StatCard
          label="Total Uses"
          value={totalUses}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          label="Shared"
          value={sharedCount}
          icon={<Share2 className="h-5 w-5" />}
        />
        <StatCard
          label="Active Guidelines"
          value={enforcedGuidelines}
          icon={<BookOpen className="h-5 w-5" />}
        />
      </div>

      {/* Onboarding card — shows until the user creates their own prompt */}
      {prompts.length <= 1 && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Welcome to your Prompt Vault</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {prompts.length === 1
                  ? "We added a sample template to get you started. Click it to see how prompts work, then create your own."
                  : "Your vault is where you store, organize, and share AI prompts with your team."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Click <strong className="text-foreground">New Prompt</strong> to create one</span>
                <span className="hidden sm:inline text-border">|</span>
                <span className="inline-flex items-center gap-1"><Braces className="h-3.5 w-3.5" /> Use <code className="rounded bg-muted px-1 text-xs">{"{{variables}}"}</code> to make templates</span>
                <span className="hidden sm:inline text-border">|</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Add guidelines to enforce quality</span>
              </div>
            </div>
            <Button size="sm" onClick={openNewPrompt} className="shrink-0">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Prompt
            </Button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="mb-4 flex gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
              setSelectedIds(new Set());
            }}
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1.5 h-5 min-w-5 px-1.5 text-[10px]">
                {pendingCount}
              </Badge>
            )}
            {statusFilter === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterFolder || "__all__"}
          onValueChange={(v) => {
            setFilterFolder(v === "__all__" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canApprove && (
          <Button variant="outline" size="icon" className="shrink-0" onClick={() => setCategoriesOpen(true)} title="Manage Categories">
            <FolderOpen className="h-4 w-4" />
          </Button>
        )}
        <Select
          value={filterTeam || "__all__"}
          onValueChange={(v) => {
            setFilterTeam(v === "__all__" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Teams</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(0); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="alpha">A-Z</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Folder Management */}
      <div className="mb-4">
        <FolderManager />
      </div>

      {/* Bulk Action Bar */}
      {canApprove && selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => bulkUpdateStatus("approved")}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={bulkLoading}
            onClick={() => bulkUpdateStatus("archived")}
          >
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            Archive
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {canApprove && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={pageItems.length > 0 && selectedIds.size === pageItems.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="w-[40%]">Prompt</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="text-right">Uses</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Rating</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canApprove ? 7 : 6} className="h-32 text-center text-muted-foreground">
                  {prompts.length === 0
                    ? "No prompts yet. Create your first one!"
                    : "No prompts match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((p) => {
                const avgRating = p.rating_count
                  ? p.rating_total / p.rating_count
                  : 0;
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openEditPrompt(p)}
                  >
                    {canApprove && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(p.id)}
                          onCheckedChange={() => toggleSelect(p.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(p.id, p.is_favorite);
                          }}
                          className="shrink-0"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              p.is_favorite
                                ? "fill-destructive text-destructive"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium truncate">{p.title}</p>
                            {p.is_template && (
                              <Badge variant="outline" className="text-[10px] gap-0.5 px-1.5 py-0 shrink-0">
                                <Braces className="h-2.5 w-2.5" />
                                Template
                              </Badge>
                            )}
                            {p.status !== "approved" && (
                              <Badge
                                variant={STATUS_BADGE_VARIANT[p.status]}
                                className="text-[10px] px-1.5 py-0 shrink-0 capitalize"
                              >
                                {p.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {p.content.slice(0, 80)}
                            {p.content.length > 80 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(p.tags || []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.usage_count || 0}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      <StarRating
                        value={avgRating}
                        userRating={userRatings[p.id]}
                        onChange={(rating) => handleRate(p.id, rating)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                      {formatDistanceToNow(new Date(p.updated_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(p);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditPrompt(p);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(p.id);
                            }}
                          >
                            <Files className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {page * VAULT_PAGE_SIZE + 1}–
            {Math.min((page + 1) * VAULT_PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <PromptModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        prompt={editPrompt}
        onSaved={refresh}
      />

      <ImportExportModal
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        prompts={prompts}
        onImported={refresh}
      />

      <FillTemplateModal
        open={!!fillPrompt}
        onOpenChange={(open) => { if (!open) setFillPrompt(null); }}
        prompt={fillPrompt}
      />

      <ManageCategoriesModal
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />
    </>
  );
}
