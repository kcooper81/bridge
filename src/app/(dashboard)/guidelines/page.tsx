"use client";

import { useState } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BookOpen, Download, Pencil, Plus, Trash2 } from "lucide-react";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import {
  saveGuidelineApi,
  deleteGuidelineApi,
  installDefaultGuidelines,
} from "@/lib/vault-api";
import { toast } from "sonner";
import type { Guideline, GuidelineRules } from "@/lib/types";

export default function GuidelinesPage() {
  const { guidelines, loading, refresh, noOrg } = useOrg();
  const { checkLimit } = useSubscription();
  const [modalOpen, setModalOpen] = useState(false);
  const [editGuideline, setEditGuideline] = useState<Guideline | null>(null);
  const [installing, setInstalling] = useState(false);

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

  function openModal(g: Guideline | null) {
    if (!g && !checkLimit("add_guideline", guidelines.length)) {
      toast.error("Guideline limit reached. Upgrade your plan for more.");
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
    try {
      const rules: GuidelineRules = {
        ...(bestPractices.length > 0 && { bestPractices }),
        ...(restrictions.length > 0 && { restrictions }),
        ...(bannedWords.length > 0 && { bannedWords }),
        ...(toneRules.length > 0 && { toneRules }),
        ...(requiredTags.length > 0 && { requiredTags }),
        ...(minLength && { minLength: parseInt(minLength) }),
        ...(maxLength && { maxLength: parseInt(maxLength) }),
      };
      await saveGuidelineApi({
        id: editGuideline?.id,
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || "general",
        rules,
        enforced: editGuideline?.enforced ?? false,
      });
      toast.success(editGuideline ? "Guideline updated" : "Guideline created");
      setModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save guideline");
    }
  }

  async function handleToggleEnforced(g: Guideline) {
    try {
      await saveGuidelineApi({ id: g.id, enforced: !g.enforced, name: g.name, rules: g.rules });
      refresh();
    } catch {
      toast.error("Failed to update guideline");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this guideline?")) return;
    try {
      await deleteGuidelineApi(id);
      toast.success("Guideline deleted");
      refresh();
    } catch {
      toast.error("Failed to delete guideline");
    }
  }

  async function handleInstallDefaults() {
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
    return (
      <>
        <PageHeader title="Guidelines" description="Define quality guidelines for your team's prompts" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  if (noOrg) {
    return (
      <>
        <PageHeader title="Guidelines" description="Define quality guidelines for your team's prompts" />
        <NoOrgBanner />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Guidelines"
        description="Define quality guidelines for your team's prompts"
        actions={
          <div className="flex gap-2">
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
        }
      />

      {guidelines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No guidelines yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Install the 14 built-in defaults or create your own.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guidelines.map((g) => (
            <Card key={g.id} className="group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{g.name}</CardTitle>
                  {g.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {g.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={g.enforced} onCheckedChange={() => handleToggleEnforced(g)} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(g)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(g.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {g.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {g.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <Button onClick={handleSave}>{editGuideline ? "Save" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
