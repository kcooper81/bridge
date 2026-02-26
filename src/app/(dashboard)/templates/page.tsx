"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { installLibraryPack } from "@/lib/vault-api";
import { LIBRARY_PACKS } from "@/lib/library/packs";
import type { LibraryPack } from "@/lib/library/packs";
import { toast } from "sonner";
import {
  BookOpen,
  Check,
  Code2,
  Crown,
  Download,
  FileText,
  FolderOpen,
  Headphones,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Package,
  Plus,
  Scale,
  Shield,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

// Map icon string names to components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Megaphone,
  Headphones,
  TrendingUp,
  Users,
  Scale,
  LayoutDashboard,
  Crown,
  FolderOpen,
  Package,
};

// ─── Custom pack type ───
interface CustomPack {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  icon: string;
  visibility: string;
  team_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  promptIds: string[];
  prompts: { id: string; title: string; description: string | null; tags: string[]; content: string }[];
}

// ─── Preview item type (union of built-in + custom) ───
type PreviewItem =
  | { type: "builtin"; pack: LibraryPack }
  | { type: "custom"; pack: CustomPack };

export default function TemplatesPage() {
  const { loading, noOrg, prompts, folders, refresh, currentUserRole } = useOrg();
  const [installedPacks, setInstalledPacks] = useState<Set<string>>(new Set());
  const [installingPack, setInstallingPack] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Custom packs
  const [customPacks, setCustomPacks] = useState<CustomPack[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingPackId, setDeletingPackId] = useState<string | null>(null);
  const [installingCustomId, setInstallingCustomId] = useState<string | null>(null);

  // Install dialog for custom pack
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [installTargetPack, setInstallTargetPack] = useState<CustomPack | null>(null);
  const [installFolderId, setInstallFolderId] = useState<string>("__none__");

  const canManage = currentUserRole === "admin" || currentUserRole === "manager";

  // Detect which built-in packs are already installed
  const detectInstalled = useCallback(() => {
    const promptTitles = new Set(prompts.map((p) => p.title));
    const installed = new Set<string>();

    for (const pack of LIBRARY_PACKS) {
      const matchCount = pack.prompts.filter((sp) =>
        promptTitles.has(sp.title)
      ).length;
      if (matchCount >= Math.ceil(pack.prompts.length / 2)) {
        installed.add(pack.id);
      }
    }

    setInstalledPacks(installed);
  }, [prompts]);

  useEffect(() => {
    detectInstalled();
  }, [detectInstalled]);

  // Fetch custom packs
  const fetchCustomPacks = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/template-packs", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomPacks(data);
      }
    } catch {
      // Silently fail — table may not exist yet
    } finally {
      setLoadingCustom(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomPacks();
  }, [fetchCustomPacks]);

  async function handleInstallBuiltin(packId: string) {
    if (!confirm("Install this template pack? Prompts, guidelines, and guardrails will be added to your workspace.")) return;
    setInstallingPack(packId);
    try {
      const result = await installLibraryPack(packId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const parts: string[] = [];
      if (result.promptsCreated > 0) parts.push(`${result.promptsCreated} prompts`);
      if (result.guidelinesCreated > 0) parts.push(`${result.guidelinesCreated} guidelines`);
      if (result.rulesCreated > 0) parts.push(`${result.rulesCreated} guardrails`);

      toast.success(parts.length > 0 ? `Installed: ${parts.join(", ")}` : "Pack installed");
      setInstalledPacks((prev) => {
        const next = new Set(Array.from(prev));
        next.add(packId);
        return next;
      });
      refresh();
    } catch {
      toast.error("Failed to install pack");
    } finally {
      setInstallingPack(null);
    }
  }

  async function handleDeleteCustomPack(packId: string) {
    if (!confirm("Are you sure you want to delete this pack? This cannot be undone.")) return;
    setDeletingPackId(packId);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/template-packs?id=${packId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setCustomPacks((prev) => prev.filter((p) => p.id !== packId));
        toast.success("Pack deleted");
        if (previewItem?.type === "custom" && previewItem.pack.id === packId) {
          setPreviewOpen(false);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete pack");
      }
    } catch {
      toast.error("Failed to delete pack");
    } finally {
      setDeletingPackId(null);
    }
  }

  function openCustomInstallDialog(pack: CustomPack) {
    setInstallTargetPack(pack);
    setInstallFolderId("__none__");
    setInstallDialogOpen(true);
  }

  async function handleInstallCustomPack() {
    if (!installTargetPack) return;
    setInstallingCustomId(installTargetPack.id);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/template-packs/${installTargetPack.id}/install`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: installFolderId === "__none__" ? null : installFolderId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Installed ${data.promptsCreated} prompt(s)`);
        setInstallDialogOpen(false);
        refresh();
      } else {
        toast.error(data.error || "Failed to install pack");
      }
    } catch {
      toast.error("Failed to install pack");
    } finally {
      setInstallingCustomId(null);
    }
  }

  function openPreview(item: PreviewItem) {
    setPreviewItem(item);
    setPreviewOpen(true);
  }

  if (loading) {
    return (
      <>
        <PageHeader
          title="Templates"
          description="Browse and install curated content packs for your team"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-56 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  if (noOrg) {
    return (
      <>
        <PageHeader
          title="Templates"
          description="Browse and install curated content packs for your team"
        />
        <NoOrgBanner />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Templates"
        description="Browse and install curated content packs for your team. Each pack includes prompts, guidelines, and guardrails tailored to a specific role or function."
        actions={
          canManage ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Pack
            </Button>
          ) : undefined
        }
      />

      {/* My Packs Section */}
      {(customPacks.length > 0 || loadingCustom) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            My Packs
          </h2>
          {loadingCustom ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {customPacks.map((pack) => {
                const IconComponent = ICON_MAP[pack.icon] || FolderOpen;
                const pCount = pack.prompts.length;

                return (
                  <Card
                    key={pack.id}
                    className="flex flex-col cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => openPreview({ type: "custom", pack })}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {pack.visibility}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 text-base">{pack.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      {pack.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                          {pack.description}
                        </p>
                      )}
                      {!pack.description && <div className="flex-1" />}

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {pCount} {pCount === 1 ? "prompt" : "prompts"}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCustomInstallDialog(pack);
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Install
                        </Button>
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingPackId === pack.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomPack(pack.id);
                            }}
                          >
                            {deletingPackId === pack.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Built-in Packs Section */}
      <div>
        {customPacks.length > 0 && (
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            Built-in Packs
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LIBRARY_PACKS.map((pack) => {
            const IconComponent = ICON_MAP[pack.icon] || Code2;
            const isInstalled = installedPacks.has(pack.id);
            const isInstalling = installingPack === pack.id;
            const promptCount = pack.prompts.length;
            const guidelineCount = pack.guidelines.length;
            const guardrailCount = pack.guardrailCategories?.length || 0;

            return (
              <Card
                key={pack.id}
                className="flex flex-col cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => openPreview({ type: "builtin", pack })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    {isInstalled && (
                      <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                        <Check className="mr-1 h-3 w-3" />
                        Installed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-base">{pack.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {pack.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
                    </Badge>
                    {guidelineCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {guidelineCount} {guidelineCount === 1 ? "guideline" : "guidelines"}
                      </Badge>
                    )}
                    {guardrailCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {guardrailCount} {guardrailCount === 1 ? "guardrail" : "guardrails"}
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant={isInstalled ? "outline" : "default"}
                    size="sm"
                    className="w-full"
                    disabled={isInstalled || isInstalling}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstallBuiltin(pack.id);
                    }}
                  >
                    {isInstalling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Installing...
                      </>
                    ) : isInstalled ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Installed
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Install Pack
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pack Preview Sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {previewItem?.type === "builtin" && (
            <BuiltinPackPreview
              pack={previewItem.pack}
              isInstalled={installedPacks.has(previewItem.pack.id)}
              isInstalling={installingPack === previewItem.pack.id}
              onInstall={() => handleInstallBuiltin(previewItem.pack.id)}
            />
          )}
          {previewItem?.type === "custom" && (
            <CustomPackPreview
              pack={previewItem.pack}
              onInstall={() => openCustomInstallDialog(previewItem.pack)}
              isInstalling={installingCustomId === previewItem.pack.id}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* New Pack Dialog */}
      <CreatePackDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          fetchCustomPacks();
          setCreateOpen(false);
        }}
      />

      {/* Install Custom Pack Dialog (category chooser) */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Install Pack</DialogTitle>
            <DialogDescription>
              {installTargetPack?.prompts.length || 0} prompt(s) will be duplicated into your workspace.
              Optionally assign them to a category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Assign to category</Label>
              <Select value={installFolderId} onValueChange={setInstallFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No category</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInstallCustomPack}
              disabled={!!installingCustomId}
            >
              {installingCustomId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Built-in Pack Preview ───

function BuiltinPackPreview({
  pack,
  isInstalled,
  isInstalling,
  onInstall,
}: {
  pack: LibraryPack;
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
}) {
  const IconComponent = ICON_MAP[pack.icon] || Code2;
  const promptCount = pack.prompts.length;
  const guidelineCount = pack.guidelines.length;
  const guardrailCount = pack.guardrailCategories?.length || 0;

  return (
    <div className="flex flex-col gap-6">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <SheetTitle className="text-lg">{pack.name}</SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <FileText className="h-3 w-3" />
          {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
        </Badge>
        {guidelineCount > 0 && (
          <Badge variant="secondary" className="gap-1.5">
            <BookOpen className="h-3 w-3" />
            {guidelineCount} {guidelineCount === 1 ? "guideline" : "guidelines"}
          </Badge>
        )}
        {guardrailCount > 0 && (
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3 w-3" />
            {guardrailCount} {guardrailCount === 1 ? "guardrail" : "guardrails"}
          </Badge>
        )}
      </div>

      <Button
        variant={isInstalled ? "outline" : "default"}
        className="w-full"
        disabled={isInstalled || isInstalling}
        onClick={onInstall}
      >
        {isInstalling ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Installing...</>
        ) : isInstalled ? (
          <><Check className="mr-2 h-4 w-4" />Installed</>
        ) : (
          <><Download className="mr-2 h-4 w-4" />Install Pack</>
        )}
      </Button>

      {pack.prompts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Prompts
          </h3>
          <div className="space-y-3">
            {pack.prompts.map((prompt, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{prompt.title}</p>
                {prompt.description && (
                  <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
                )}
                {prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 font-mono">
                  {prompt.content.slice(0, 150)}{prompt.content.length > 150 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pack.guidelines.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Guidelines
          </h3>
          <div className="space-y-2">
            {pack.guidelines.map((g, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{g.name}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{g.category}</Badge>
                </div>
                {g.description && (
                  <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {pack.guardrailCategories && pack.guardrailCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Guardrail Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {pack.guardrailCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="capitalize">
                {cat.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Custom Pack Preview ───

function CustomPackPreview({
  pack,
  onInstall,
  isInstalling,
}: {
  pack: CustomPack;
  onInstall: () => void;
  isInstalling: boolean;
}) {
  const IconComponent = ICON_MAP[pack.icon] || FolderOpen;

  return (
    <div className="flex flex-col gap-6">
      <SheetHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <SheetTitle className="text-lg">{pack.name}</SheetTitle>
            {pack.description && (
              <p className="text-sm text-muted-foreground mt-1">{pack.description}</p>
            )}
          </div>
        </div>
      </SheetHeader>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <FileText className="h-3 w-3" />
          {pack.prompts.length} {pack.prompts.length === 1 ? "prompt" : "prompts"}
        </Badge>
        <Badge variant="outline" className="capitalize">{pack.visibility}</Badge>
      </div>

      <Button className="w-full" onClick={onInstall} disabled={isInstalling}>
        {isInstalling ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Installing...</>
        ) : (
          <><Download className="mr-2 h-4 w-4" />Install Pack</>
        )}
      </Button>

      {pack.prompts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Prompts
          </h3>
          <div className="space-y-3">
            {pack.prompts.map((prompt) => (
              <div key={prompt.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{prompt.title}</p>
                {prompt.description && (
                  <p className="text-xs text-muted-foreground mt-1">{prompt.description}</p>
                )}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 font-mono">
                  {prompt.content.slice(0, 150)}{prompt.content.length > 150 ? "..." : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Pack Dialog ───

function CreatePackDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const { prompts, teams } = useOrg();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("org");
  const [teamId, setTeamId] = useState<string>("__none__");
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  function resetForm() {
    setName("");
    setDescription("");
    setVisibility("org");
    setTeamId("__none__");
    setSelectedPromptIds(new Set());
    setSearch("");
  }

  const filteredPrompts = search
    ? prompts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : prompts;

  function togglePrompt(id: string) {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (selectedPromptIds.size === 0) {
      toast.error("Select at least one prompt");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/template-packs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          visibility,
          team_id: visibility === "team" ? (teamId === "__none__" ? null : teamId) : null,
          promptIds: Array.from(selectedPromptIds),
        }),
      });

      if (res.ok) {
        toast.success("Pack created");
        resetForm();
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create pack");
      }
    } catch {
      toast.error("Failed to create pack");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Template Pack</DialogTitle>
          <DialogDescription>
            Bundle existing prompts into a reusable pack that can be installed by team members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto -mx-6 px-6">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sales Playbook"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's in this pack?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org">Organization</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visibility === "team" && (
              <div className="space-y-2">
                <Label>Team</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No team</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Select Prompts ({selectedPromptIds.size} selected)
            </Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts..."
              className="mb-2"
            />
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              {filteredPrompts.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground text-center">No prompts found</p>
              ) : (
                filteredPrompts.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0"
                  >
                    <Checkbox
                      checked={selectedPromptIds.has(p.id)}
                      onCheckedChange={() => togglePrompt(p.id)}
                    />
                    <span className="text-sm truncate">{p.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
            ) : (
              "Create Pack"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
