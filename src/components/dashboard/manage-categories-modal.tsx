"use client";

import { useMemo, useState } from "react";
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
  FolderTree,
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
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [creatingParentId, setCreatingParentId] = useState<string | null | "root">(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tree: roots in alpha order, each with its children in alpha order.
  const tree = useMemo(() => {
    const roots = folders
      .filter((f) => !f.parent_id)
      .sort((a, b) => a.name.localeCompare(b.name));
    const childrenByParent = new Map<string, Folder[]>();
    for (const f of folders) {
      if (f.parent_id) {
        const arr = childrenByParent.get(f.parent_id) || [];
        arr.push(f);
        childrenByParent.set(f.parent_id, arr);
      }
    }
    childrenByParent.forEach((arr: Folder[]) => {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    });
    return roots.map((root) => ({
      root,
      children: childrenByParent.get(root.id) || [],
    }));
  }, [folders]);

  function directPromptCount(folderId: string) {
    return prompts.filter((p) => p.folder_id === folderId).length;
  }

  function startEdit(folder: Folder) {
    setEditingId(folder.id);
    setEditName(folder.name);
    setEditColor(folder.color);
    setEditParentId(folder.parent_id);
    setCreatingParentId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditColor(null);
    setEditParentId(null);
  }

  function startCreate(parentId: string | null) {
    setCreatingParentId(parentId === null ? "root" : parentId);
    setNewName("");
    setNewColor(null);
    setEditingId(null);
  }

  function cancelCreate() {
    setCreatingParentId(null);
    setNewName("");
    setNewColor(null);
  }

  // A folder can be demoted (made a child) only if it has no children of its own.
  function hasChildren(folderId: string) {
    return folders.some((f) => f.parent_id === folderId);
  }

  async function handleRename(folderId: string) {
    const trimmed = editName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const updated = await saveFolderApi({
        id: folderId,
        name: trimmed,
        color: editColor,
        parent_id: editParentId,
      });
      if (updated) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === folderId
              ? { ...f, name: trimmed, color: editColor, parent_id: editParentId }
              : f
          )
        );
        toast.success("Category updated");
        cancelEdit();
      } else {
        toast.error("Failed to update category");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update category";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(folder: Folder) {
    const direct = directPromptCount(folder.id);
    const childCount = folders.filter((f) => f.parent_id === folder.id).length;
    const parts: string[] = [];
    if (direct > 0) parts.push(`${direct} prompt(s) will be unassigned`);
    if (childCount > 0) parts.push(`${childCount} sub-categor${childCount === 1 ? "y" : "ies"} will become top-level`);
    const msg = parts.length
      ? `${parts.join(" and ")}. Continue?`
      : "Delete this category?";
    if (!confirm(msg)) return;

    setDeletingId(folder.id);
    try {
      const ok = await deleteFolderApi(folder.id);
      if (ok) {
        setFolders((prev) =>
          prev
            .filter((f) => f.id !== folder.id)
            .map((f) => (f.parent_id === folder.id ? { ...f, parent_id: null } : f))
        );
        toast.success("Category deleted");
      } else {
        toast.error("Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreate(parentId: string | null) {
    const trimmed = newName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const folder = await saveFolderApi({ name: trimmed, color: newColor, parent_id: parentId });
      if (folder) {
        setFolders((prev) => [...prev, folder]);
        toast.success(parentId ? "Sub-category created" : "Category created");
        cancelCreate();
      } else {
        toast.error("Failed to create category");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      toast.error(msg);
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
            Create, edit, and organize your prompt categories. Add sub-categories under any
            top-level category to group related prompts (e.g. Marketing &rsaquo; Email).
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
              title="Tree view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 transition-colors ${
                view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view (top-level only)"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
          {creatingParentId !== "root" && !editingId && (
            <Button size="sm" onClick={() => startCreate(null)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Category
            </Button>
          )}
        </div>

        {/* New top-level Category Input */}
        {creatingParentId === "root" && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate(null);
                  if (e.key === "Escape") cancelCreate();
                }}
                placeholder="Category name..."
                className="h-9 text-sm flex-1"
                autoFocus
                disabled={saving}
              />
              <Button size="sm" onClick={() => handleCreate(null)} disabled={saving || !newName.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelCreate}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ColorPicker value={newColor} onChange={setNewColor} />
          </div>
        )}

        {/* Category List/Grid */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {tree.length === 0 && creatingParentId !== "root" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No categories yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Click &quot;New Category&quot; to create one.
              </p>
            </div>
          ) : view === "list" ? (
            <div className="space-y-1">
              {tree.map(({ root, children }) => (
                <div key={root.id} className="space-y-1">
                  <FolderRow
                    folder={root}
                    promptCount={directPromptCount(root.id)}
                    isEditing={editingId === root.id}
                    editName={editName}
                    editColor={editColor}
                    editParentId={editParentId}
                    onEditNameChange={setEditName}
                    onEditColorChange={setEditColor}
                    onEditParentChange={setEditParentId}
                    parentOptions={
                      hasChildren(root.id)
                        ? []
                        : tree.filter((t) => t.root.id !== root.id).map((t) => ({ id: t.root.id, name: t.root.name }))
                    }
                    onStartEdit={() => startEdit(root)}
                    onCancelEdit={cancelEdit}
                    onSave={() => handleRename(root.id)}
                    onDelete={() => handleDelete(root)}
                    onAddSub={() => startCreate(root.id)}
                    saving={saving}
                    deleting={deletingId === root.id}
                    canHaveSub
                  />

                  {/* Quick-create sub-category input */}
                  {creatingParentId === root.id && (
                    <div className="ml-8 space-y-2 rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate(root.id);
                            if (e.key === "Escape") cancelCreate();
                          }}
                          placeholder={`New sub-category under "${root.name}"...`}
                          className="h-9 text-sm flex-1"
                          autoFocus
                          disabled={saving}
                        />
                        <Button size="sm" onClick={() => handleCreate(root.id)} disabled={saving || !newName.trim()}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelCreate}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <ColorPicker value={newColor} onChange={setNewColor} />
                    </div>
                  )}

                  {/* Children */}
                  {children.map((child) => (
                    <div key={child.id} className="ml-8">
                      <FolderRow
                        folder={child}
                        promptCount={directPromptCount(child.id)}
                        isEditing={editingId === child.id}
                        editName={editName}
                        editColor={editColor}
                        editParentId={editParentId}
                        onEditNameChange={setEditName}
                        onEditColorChange={setEditColor}
                        onEditParentChange={setEditParentId}
                        parentOptions={tree.map((t) => ({ id: t.root.id, name: t.root.name }))}
                        onStartEdit={() => startEdit(child)}
                        onCancelEdit={cancelEdit}
                        onSave={() => handleRename(child.id)}
                        onDelete={() => handleDelete(child)}
                        onAddSub={() => { /* no-op; children can't nest */ }}
                        saving={saving}
                        deleting={deletingId === child.id}
                        canHaveSub={false}
                        isChild
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {tree.map(({ root, children }) => (
                <div
                  key={root.id}
                  className="rounded-xl border border-border p-4 group hover:border-primary/20 transition-colors relative"
                >
                  <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => startEdit(root)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => handleDelete(root)}
                      disabled={deletingId === root.id}
                    >
                      {deletingId === root.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: root.color ? `${root.color}20` : undefined }}
                  >
                    <FolderOpen
                      className="h-5 w-5"
                      style={{ color: root.color || undefined }}
                    />
                  </div>
                  <p className="text-sm font-semibold truncate">{root.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {directPromptCount(root.id)} prompts
                    {children.length > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5">
                        &middot; <FolderTree className="h-3 w-3" /> {children.length}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FolderRowProps {
  folder: Folder;
  promptCount: number;
  isEditing: boolean;
  editName: string;
  editColor: string | null;
  editParentId: string | null;
  onEditNameChange: (v: string) => void;
  onEditColorChange: (v: string | null) => void;
  onEditParentChange: (v: string | null) => void;
  parentOptions: { id: string; name: string }[];
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onAddSub: () => void;
  saving: boolean;
  deleting: boolean;
  canHaveSub: boolean;
  isChild?: boolean;
}

function FolderRow({
  folder,
  promptCount,
  isEditing,
  editName,
  editColor,
  editParentId,
  onEditNameChange,
  onEditColorChange,
  onEditParentChange,
  parentOptions,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onAddSub,
  saving,
  deleting,
  canHaveSub,
  isChild,
}: FolderRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 group hover:bg-muted/50 transition-colors">
      {isEditing ? (
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave();
                if (e.key === "Escape") onCancelEdit();
              }}
              className="h-8 text-sm flex-1"
              autoFocus
              disabled={saving}
            />
            <Button size="sm" onClick={onSave} disabled={saving || !editName.trim()}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEdit}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ColorPicker value={editColor} onChange={onEditColorChange} />
          {/* Parent selector — only available for child rows so users can re-parent */}
          {parentOptions.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Parent:</span>
              <select
                value={editParentId ?? ""}
                onChange={(e) => onEditParentChange(e.target.value || null)}
                className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                disabled={saving}
              >
                <option value="">(top-level)</option>
                {parentOptions
                  .filter((p) => p.id !== folder.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: folder.color ? `${folder.color}20` : undefined }}
          >
            {isChild ? (
              <FolderOpen className="h-3.5 w-3.5" style={{ color: folder.color || undefined }} />
            ) : (
              <FolderOpen className="h-4 w-4" style={{ color: folder.color || undefined }} />
            )}
          </div>
          <span className={`flex-1 truncate ${isChild ? "text-sm" : "text-sm font-medium"}`}>
            {folder.name}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {promptCount} prompts
          </span>
          {canHaveSub && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onAddSub}
              title="Add sub-category"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onStartEdit}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onDelete}
            disabled={deleting}
            title="Delete"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}

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
