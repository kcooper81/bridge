"use client";

import { useState } from "react";
import { useOrg } from "@/components/providers/org-provider";
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
import { BookOpen, Download, Pencil, Plus, Trash2 } from "lucide-react";
import {
  saveStandardApi,
  deleteStandardApi,
  installDefaultStandards,
} from "@/lib/vault-api";
import { toast } from "sonner";
import type { Standard, StandardRules } from "@/lib/types";

export default function StandardsPage() {
  const { standards, refresh } = useOrg();
  const [modalOpen, setModalOpen] = useState(false);
  const [editStandard, setEditStandard] = useState<Standard | null>(null);
  const [installing, setInstalling] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [doList, setDoList] = useState("");
  const [dontList, setDontList] = useState("");
  const [bannedWords, setBannedWords] = useState("");
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");

  function openModal(std: Standard | null) {
    if (std) {
      setEditStandard(std);
      setName(std.name);
      setDescription(std.description || "");
      setCategory(std.category || "");
      setDoList((std.rules.doList || []).join("\n"));
      setDontList((std.rules.dontList || []).join("\n"));
      setBannedWords((std.rules.bannedWords || []).join(", "));
      setMinLength(std.rules.minLength?.toString() || "");
      setMaxLength(std.rules.maxLength?.toString() || "");
    } else {
      setEditStandard(null);
      setName("");
      setDescription("");
      setCategory("");
      setDoList("");
      setDontList("");
      setBannedWords("");
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
      const rules: StandardRules = {
        doList: doList.split("\n").map((s) => s.trim()).filter(Boolean),
        dontList: dontList.split("\n").map((s) => s.trim()).filter(Boolean),
        bannedWords: bannedWords.split(",").map((s) => s.trim()).filter(Boolean),
        ...(minLength && { minLength: parseInt(minLength) }),
        ...(maxLength && { maxLength: parseInt(maxLength) }),
      };
      await saveStandardApi({
        id: editStandard?.id,
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || "general",
        rules,
        enforced: editStandard?.enforced ?? false,
      });
      toast.success(editStandard ? "Standard updated" : "Standard created");
      setModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save standard");
    }
  }

  async function handleToggleEnforced(std: Standard) {
    try {
      await saveStandardApi({ id: std.id, enforced: !std.enforced, name: std.name, rules: std.rules });
      refresh();
    } catch {
      toast.error("Failed to update standard");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this standard?")) return;
    try {
      await deleteStandardApi(id);
      toast.success("Standard deleted");
      refresh();
    } catch {
      toast.error("Failed to delete standard");
    }
  }

  async function handleInstallDefaults() {
    setInstalling(true);
    try {
      await installDefaultStandards();
      toast.success("Default standards installed");
      await refresh();
    } catch {
      toast.error("Failed to install defaults");
    } finally {
      setInstalling(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Standards"
        description="Define quality standards for your team's prompts"
        actions={
          <div className="flex gap-2">
            {standards.length === 0 && (
              <Button variant="outline" onClick={handleInstallDefaults} disabled={installing}>
                <Download className="mr-2 h-4 w-4" />
                Install Defaults
              </Button>
            )}
            <Button onClick={() => openModal(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Standard
            </Button>
          </div>
        }
      />

      {standards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No standards yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Install the 14 built-in defaults or create your own.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {standards.map((std) => (
            <Card key={std.id} className="group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{std.name}</CardTitle>
                  {std.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {std.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={std.enforced} onCheckedChange={() => handleToggleEnforced(std)} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(std)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(std.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {std.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {std.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editStandard ? "Edit Standard" : "New Standard"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., writing, development" />
            </div>
            <div className="space-y-2">
              <Label>Do&apos;s (one per line)</Label>
              <Textarea value={doList} onChange={(e) => setDoList(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Don&apos;ts (one per line)</Label>
              <Textarea value={dontList} onChange={(e) => setDontList(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Banned Words (comma-separated)</Label>
              <Input value={bannedWords} onChange={(e) => setBannedWords(e.target.value)} />
            </div>
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
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editStandard ? "Save" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
