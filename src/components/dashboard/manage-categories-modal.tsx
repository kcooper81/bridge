"use client";

import { useState } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { saveFolderApi, deleteFolderApi } from "@/lib/vault-api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  Grid3X3,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react";
import type { Folder } from "@/lib/types";

const FOLDER_COLORS = [
  null,       // default (no color)
  "#6366f1",  // indigo
  "#8b5cf6",  // violet
  "#ec4899",  // pink
  "#ef4444",  // red
  "#f97316",  // orange
  "#eab308",  // yellow
  "#22c55e",  // green
  "#14b8a6",  // teal
  "#3b82f6",  // blue
  "#6b7280",  // gray
  "#78716c",  // stone
];

interface ManageCategoriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCategoriesModal({ open, onOpenChange }: ManageCategoriesModalProps) {
  const { folders, setFolders, prompts } = useOrg();
  const [view, setView] = useState<"list" | "grid">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function promptCount(folderId: string) {
    return prompts.filter((p) => p.folder_id === folderId).length;
  }

  function startEdit(folder: Folder) {
    setEditingId(folder.id);
    setEditName(folder.name);
    setEditColor(folder.color);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditColor(null);
  }

  async function handleRename(folderId: string) {
    const trimmed = editName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const updated = await saveFolderApi({ id: folderId, name: trimmed, color: editColor });
      if (updated) {
        setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name: trimmed, color: editColor } : f)));
        toast.success("Category updated");
      }
    } catch {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
      cancelEdit();
    }
  }

  async function handleDelete(folderId: string) {
    const count = promptCount(folderId);
    const msg = count > 0
      ? `This category has ${count} prompt(s). They won't be deleted, just unassigned. Continue?`
      : "Are you sure you want to delete this category?";
    if (!confirm(msg)) return;

    setDeletingId(folderId);
    try {
      const ok = await deleteFolderApi(folderId);
      if (ok) {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        toast.success("Category deleted");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const folder = await saveFolderApi({ name: trimmed, color: newColor });
      if (folder) {
        setFolders((prev) => [...prev, folder]);
        setNewName("");
        setNewColor(null);
        setCreating(false);
        toast.success("Category created");
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Manage Categories
          </DialogTitle>
          <DialogDescription>
            Create, edit, and organize your prompt categories.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 transition-colors ${
                view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Category
            </Button>
          )}
        </div>

        {/* New Category Input */}
        {creating && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setCreating(false);
                    setNewName("");
                    setNewColor(null);
                  }
                }}
                placeholder="Category name..."
                className="h-9 text-sm flex-1"
                autoFocus
                disabled={saving}
              />
              <Button size="sm" onClick={handleCreate} disabled={saving || !newName.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                  setNewColor(null);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
        )}

        {/* Category List/Grid */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {folders.length === 0 && !creating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No categories yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click &quot;New Category&quot; to create one.
              </p>
            </div>
          ) : view === "list" ? (
            <div className="space-y-1">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 group hover:bg-muted/50 transition-colors"
                >
                  {editingId === folder.id ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(folder.id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="h-8 text-sm flex-1"
                          autoFocus
                          disabled={saving}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRename(folder.id)}
                          disabled={saving || !editName.trim()}
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <ColorPicker value={editColor} onChange={setEditColor} />
                    </div>
                  ) : (
                    <>
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: folder.color ? `${folder.color}20` : undefined }}
                      >
                        <FolderOpen
                          className="h-4 w-4"
                          style={{ color: folder.color || undefined }}
                        />
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {promptCount(folder.id)} prompts
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => startEdit(folder)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(folder.id)}
                        disabled={deletingId === folder.id}
                      >
                        {deletingId === folder.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="rounded-xl border border-border p-4 group hover:border-primary/20 transition-colors relative"
                >
                  {editingId === folder.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(folder.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="h-8 text-sm"
                        autoFocus
                        disabled={saving}
                      />
                      <ColorPicker value={editColor} onChange={setEditColor} />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRename(folder.id)}
                          disabled={saving || !editName.trim()}
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => startEdit(folder)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDelete(folder.id)}
                          disabled={deletingId === folder.id}
                        >
                          {deletingId === folder.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                        style={{ backgroundColor: folder.color ? `${folder.color}20` : undefined }}
                      >
                        <FolderOpen
                          className="h-5 w-5"
                          style={{ color: folder.color || undefined }}
                        />
                      </div>
                      <p className="text-sm font-semibold truncate">{folder.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {promptCount(folder.id)} prompts
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Color Picker ───

function ColorPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (color: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground mr-1">Color:</span>
      {FOLDER_COLORS.map((color, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(color)}
          className="h-5 w-5 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: color || undefined }}
          title={color || "Default"}
        >
          {value === color && (
            <Check className={`h-3 w-3 ${color ? "text-white" : "text-foreground"}`} />
          )}
        </button>
      ))}
    </div>
  );
}
