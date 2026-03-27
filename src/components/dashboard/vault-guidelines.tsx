"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { CardGridSkeleton } from "@/components/dashboard/skeleton-loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { BookOpen, CheckCircle2, ChevronDown, Download, LayoutGrid, Lightbulb, List, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { UpgradePrompt, LimitNudge } from "@/components/upgrade";
import { UsageIndicator } from "@/components/dashboard/usage-indicator";
import {
  saveGuidelineApi,
  deleteGuidelineApi,
  installDefaultGuidelines,
} from "@/lib/vault-api";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { trackGuidelineCreated, trackGuidelineUpdated, trackGuidelineDeleted } from "@/lib/analytics";
import type { Guideline, GuidelineRules } from "@/lib/types";

export function VaultGuidelines() {
  const { guidelines, loading, refresh, noOrg, currentUserRole } = useOrg();
  const canEdit = currentUserRole === "admin" || currentUserRole === "manager";
  const { checkLimit, planLimits } = useSubscription();
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuideline, setEditGuideline] = useState<Guideline | null>(null);
  const [installing, setInstalling] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [bestPractices, setBestPractices] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [bannedWords, setBannedWords] = useState<string[]>([]);
  const [toneRules, setToneRules] = useState<string[]>([]);
  const [requiredTags, setRequiredTags] = useState<string[]>([]);
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openModal(g: Guideline | null) {
    if (!g && !checkLimit("add_guideline", guidelines.length)) {
      toast.error(`You've reached your plan limit of ${planLimits.max_guidelines} guidelines. Upgrade to add more.`);
      return;
    }
    if (g) {
      setEditGuideline(g);
      setName(g.name);
      setDescription(g.description || "");
      setCategory(g.category || "");
      setBestPractices(g.rules.bestPractices || g.rules.doList || []);
      setRestrictions(g.rules.restrictions || g.rules.dontList || []);
      setBannedWords(g.rules.bannedWords || []);
      setToneRules(g.rules.toneRules || []);
      setRequiredTags(g.rules.requiredTags || []);
      setMinLength(g.rules.minLength?.toString() || "");
      setMaxLength(g.rules.maxLength?.toString() || "");
    } else {
      setEditGuideline(null);
      setName("");
      setDescription("");
      setCategory("");
      setBestPractices([]);
      setRestrictions([]);
      setBannedWords([]);
      setToneRules([]);
      setRequiredTags([]);
      setMinLength("");
      setMaxLength("");
    }
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const parsedMin = minLength ? parseInt(minLength, 10) : 0;
    const parsedMax = maxLength ? parseInt(maxLength, 10) : 0;
    if (isNaN(parsedMin) || isNaN(parsedMax)) {
      toast.error("Length values must be valid numbers");
      return;
    }
    if (parsedMin < 0 || parsedMax < 0) {
      toast.error("Length values cannot be negative");
      return;
    }
    if (parsedMin && parsedMax && parsedMin > parsedMax) {
      toast.error("Min length cannot exceed max length");
      return;
    }
    setSaving(true);
    try {
      const rules: GuidelineRules = {
        ...(bestPractices.length > 0 && { bestPractices }),
        ...(restrictions.length > 0 && { restrictions }),
        ...(bannedWords.length > 0 && { bannedWords }),
        ...(toneRules.length > 0 && { toneRules }),
        ...(requiredTags.length > 0 && { requiredTags }),
        ...(parsedMin > 0 && { minLength: parsedMin }),
        ...(parsedMax > 0 && { maxLength: parsedMax }),
      };
      await saveGuidelineApi({
        id: editGuideline?.id,
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || "general",
        rules,
        enforced: editGuideline?.enforced ?? false,
      });
      if (editGuideline) { trackGuidelineUpdated(); } else { trackGuidelineCreated(); }
      toast.success(editGuideline ? "Guideline updated" : "Guideline created");
      setModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save guideline");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnforced(g: Guideline) {
    if (!canEdit) return;
    try {
      await saveGuidelineApi({ id: g.id, enforced: !g.enforced, name: g.name, rules: g.rules });
      refresh();
    } catch {
      toast.error("Failed to update guideline");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this guideline? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteGuidelineApi(id);
      trackGuidelineDeleted();
      toast.success("Guideline deleted");
      refresh();
    } catch {
      toast.error("Failed to delete guideline");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleInstallDefaults() {
    if (!confirm("Install default guidelines? You can customize or delete them later.")) return;
    setInstalling(true);
    try {
      await installDefaultGuidelines();
      toast.success("Default guidelines installed");
      await refresh();
    } catch {
      toast.error("Failed to install defaults");
    } finally {
      setInstalling(false);
    }
  }

  if (loading) {
    return <CardGridSkeleton />;
  }

  if (noOrg) {
    return <NoOrgBanner />;
  }

  return (
    <>
      {canEdit && (
        <div className="flex justify-end gap-2 mb-4">
          {guidelines.length === 0 && (
            <Button variant="outline" onClick={handleInstallDefaults} disabled={installing}>
              <Download className="mr-2 h-4 w-4" />
              Install Defaults
            </Button>
          )}
          <Button onClick={() => openModal(null)}>
            <Plus className="mr-2 h-4 w-4" />
            New Guideline
          </Button>
        </div>
      )}

      {canEdit && (
        <>
          {!checkLimit("add_guideline", guidelines.length) && (
            <UpgradePrompt feature="add_guideline" current={guidelines.length} max={planLimits.max_guidelines} className="mb-6" />
          )}
          <LimitNudge feature="add_guideline" current={guidelines.length} max={planLimits.max_guidelines} className="mb-4" />
          {checkLimit("add_guideline", guidelines.length) && (
            <UsageIndicator label="Guidelines" current={guidelines.length} max={planLimits.max_guidelines} className="mb-4" />
          )}
        </>
      )}

      {guidelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No guidelines yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {canEdit ? "Install the 14 built-in defaults or create your own." : "Your admin hasn't created any guidelines yet."}
          </p>
        </div>
      ) : (
        <>
          {/* View toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{guidelines.length} guideline{guidelines.length !== 1 ? "s" : ""}</p>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={cn("p-1.5 transition-colors", viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("p-1.5 transition-colors", viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guidelines.map((g) => {
                const isExpanded = expandedId === g.id;
                const rules = g.rules || {};
                return (
                  <Card key={g.id} className="group cursor-pointer transition-shadow hover:shadow-md" onClick={() => setExpandedId(isExpanded ? null : g.id)}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{g.name}</CardTitle>
                        {g.category && (
                          <Badge variant="outline" className="mt-1 text-xs">{g.category}</Badge>
                        )}
                      </div>
                      {canEdit && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Switch checked={g.enforced} onCheckedChange={() => handleToggleEnforced(g)} />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(g.id)} disabled={deletingId === g.id}>
                            {deletingId === g.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    )}
                    {!canEdit && g.enforced && (
                      <Badge variant="default" className="text-[10px]">Active</Badge>
                    )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {g.description && <p className="text-sm text-muted-foreground line-clamp-2">{g.description}</p>}
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground mx-auto transition-transform", isExpanded && "rotate-180")} />
                      {isExpanded && (
                        <div className="space-y-3 pt-2 border-t border-border">
                          {rules.bestPractices && rules.bestPractices.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Best Practices</p>
                              <ul className="space-y-1">{rules.bestPractices.map((r: string) => <li key={r} className="text-xs text-foreground flex gap-2"><span className="text-primary">+</span>{r}</li>)}</ul>
                            </div>
                          )}
                          {rules.toneRules && rules.toneRules.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Tone</p>
                              <ul className="space-y-1">{rules.toneRules.map((r: string) => <li key={r} className="text-xs text-foreground">{r}</li>)}</ul>
                            </div>
                          )}
                          {rules.restrictions && rules.restrictions.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Restrictions</p>
                              <ul className="space-y-1">{rules.restrictions.map((r: string) => <li key={r} className="text-xs text-destructive flex gap-2"><span>-</span>{r}</li>)}</ul>
                            </div>
                          )}
                          {(rules.minLength || rules.maxLength) && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Length</p>
                              <p className="text-xs">{rules.minLength ? `Min: ${rules.minLength} chars` : ""}{rules.minLength && rules.maxLength ? " · " : ""}{rules.maxLength ? `Max: ${rules.maxLength} chars` : ""}</p>
                            </div>
                          )}
                          {rules.bannedWords && rules.bannedWords.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Banned Words</p>
                              <div className="flex flex-wrap gap-1">{rules.bannedWords.map((w: string) => <span key={w} className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">{w}</span>)}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* List view */
            <div className="rounded-lg border border-border divide-y divide-border">
              {guidelines.map((g) => {
                const isExpanded = expandedId === g.id;
                const rules = g.rules || {};
                return (
                  <div key={g.id} className="group">
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : g.id)}>
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{g.name}</p>
                          {g.category && <Badge variant="outline" className="text-[10px]">{g.category}</Badge>}
                        </div>
                        {g.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{g.description}</p>}
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={g.enforced ? "default" : "secondary"} className="text-[10px]">{g.enforced ? "Active" : "Off"}</Badge>
                        {canEdit && (
                          <>
                            <Switch checked={g.enforced} onCheckedChange={() => handleToggleEnforced(g)} />
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(g.id)} disabled={deletingId === g.id}>
                                {deletingId === g.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-180")} />
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 ml-7 space-y-3 border-t border-border">
                        {rules.bestPractices && rules.bestPractices.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Best Practices</p>
                            <ul className="space-y-1">{rules.bestPractices.map((r: string) => <li key={r} className="text-sm flex gap-2"><span className="text-primary">+</span>{r}</li>)}</ul>
                          </div>
                        )}
                        {rules.toneRules && rules.toneRules.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Tone</p>
                            <ul className="space-y-1">{rules.toneRules.map((r: string) => <li key={r} className="text-sm">{r}</li>)}</ul>
                          </div>
                        )}
                        {rules.restrictions && rules.restrictions.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Restrictions</p>
                            <ul className="space-y-1">{rules.restrictions.map((r: string) => <li key={r} className="text-sm text-destructive flex gap-2"><span>-</span>{r}</li>)}</ul>
                          </div>
                        )}
                        {(rules.minLength || rules.maxLength) && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Length Requirements</p>
                            <p className="text-sm">{rules.minLength ? `Min: ${rules.minLength} chars` : ""}{rules.minLength && rules.maxLength ? " · " : ""}{rules.maxLength ? `Max: ${rules.maxLength} chars` : ""}</p>
                          </div>
                        )}
                        {rules.bannedWords && rules.bannedWords.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Banned Words</p>
                            <div className="flex flex-wrap gap-1">{rules.bannedWords.map((w: string) => <span key={w} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">{w}</span>)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!canEdit && <MemberSuggestGuideline />}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editGuideline ? "Edit Guideline" : "New Guideline"}</DialogTitle>
          </DialogHeader>

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Basic Info</h4>
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <CategoryCombobox value={category} onChange={setCategory} />
            </div>
          </div>

          <Separator />

          {/* Section 2: Content Rules */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Content Rules</h4>
            <div className="space-y-2">
              <Label>Tone Rules</Label>
              <TagInput value={toneRules} onChange={setToneRules} placeholder="e.g., Use active voice" />
            </div>
            <div className="space-y-2">
              <Label>Best Practices</Label>
              <TagInput value={bestPractices} onChange={setBestPractices} placeholder="e.g., Include clear objectives" />
            </div>
            <div className="space-y-2">
              <Label>Restrictions</Label>
              <TagInput value={restrictions} onChange={setRestrictions} placeholder="e.g., Avoid jargon without explanation" />
            </div>
            <div className="space-y-2">
              <Label>Banned Words</Label>
              <TagInput value={bannedWords} onChange={setBannedWords} placeholder="e.g., synergy" />
            </div>
          </div>

          <Separator />

          {/* Section 3: Validation Rules */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Validation Rules</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Length</Label>
                <Input type="number" value={minLength} onChange={(e) => setMinLength(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Length</Label>
                <Input type="number" value={maxLength} onChange={(e) => setMaxLength(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Required Tags</Label>
              <TagInput value={requiredTags} onChange={setRequiredTags} placeholder="e.g., support" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{editGuideline ? "Save" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MemberSuggestGuideline() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        return;
      }
      const res = await fetch("/api/guidelines/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: name.trim(), category: category.trim() || undefined, description: description.trim() }),
      });
      if (!res.ok) {
        toast.error("Failed to submit suggestion");
        return;
      }
      toast.success("Guideline suggestion sent to your admin");
      setName("");
      setCategory("");
      setDescription("");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle>Suggest a Guideline</CardTitle>
            <CardDescription>
              Have an idea for a quality guideline? Suggest one for your admin to review and add.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-tp-green mb-3" />
            <h3 className="text-sm font-medium">Suggestion submitted</h3>
            <p className="text-xs text-muted-foreground mt-1">Your admin will review it and create the guideline if appropriate.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setSubmitted(false)}>
              Suggest another
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Accessibility Language" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Tone, Formatting, Compliance" />
            </div>
            <div className="space-y-2">
              <Label>What should this guideline cover? *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Prompts should use inclusive, accessible language and avoid ableist terms"
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} disabled={submitting || !name.trim() || !description.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
