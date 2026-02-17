"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PromptModal } from "@/components/modals/prompt-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Copy,
  Files,
  Heart,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { VAULT_PAGE_SIZE } from "@/lib/constants";
import {
  deletePrompt,
  duplicatePrompt,
  toggleFavorite,
  recordUsage,
} from "@/lib/vault-api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Prompt } from "@/lib/types";
import { PageSkeleton } from "@/components/dashboard/skeleton-loader";

export default function VaultPage() {
  const { prompts, folders, departments, guidelines, loading, refresh } = useOrg();
  const { checkLimit } = useSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Show checkout success toast
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      const plan = searchParams.get("plan") || "your new plan";
      toast.success(`Welcome to ${plan}! Your upgrade is active.`);
      router.replace("/vault");
    }
  }, [searchParams, router]);
  const [filterFolder, setFilterFolder] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);

  const filtered = useMemo(() => {
    let result = [...prompts];

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
    if (filterDept) result = result.filter((p) => p.department_id === filterDept);

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
  }, [prompts, search, filterFolder, filterDept, sort]);

  const pageCount = Math.ceil(filtered.length / VAULT_PAGE_SIZE);
  const pageItems = filtered.slice(
    page * VAULT_PAGE_SIZE,
    (page + 1) * VAULT_PAGE_SIZE
  );

  const totalUses = prompts.reduce((sum, p) => sum + (p.usage_count || 0), 0);
  const sharedCount = prompts.filter((p) => p.status === "approved").length;
  const enforcedGuidelines = guidelines.filter((s) => s.enforced).length;

  function openNewPrompt() {
    if (!checkLimit("create_prompt", prompts.length)) {
      toast.error("Prompt limit reached. Upgrade your plan.");
      return;
    }
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

  async function handleCopy(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
      recordUsage(id).catch(() => {});
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  if (loading) return <PageSkeleton />;

  return (
    <>
      <PageHeader
        title="Prompts"
        description="Manage and organize your team's AI prompts"
        actions={
          <Button onClick={openNewPrompt}>
            <Plus className="mr-2 h-4 w-4" />
            New Prompt
          </Button>
        }
      />

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
            <SelectValue placeholder="All Folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Folders</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterDept || "__all__"}
          onValueChange={(v) => {
            setFilterDept(v === "__all__" ? "" : v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
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

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {prompts.length === 0
                    ? "No prompts yet. Create your first one!"
                    : "No prompts match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((p) => {
                const avgRating = p.rating_count
                  ? (p.rating_total / p.rating_count).toFixed(1)
                  : "—";
                return (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openEditPrompt(p)}
                  >
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
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-tp-yellow" />
                        {avgRating}
                      </span>
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
                              handleCopy(p.id, p.content);
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
    </>
  );
}
