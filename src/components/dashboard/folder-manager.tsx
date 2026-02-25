"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, FolderOpen, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useOrg } from "@/components/providers/org-provider";
import { saveFolderApi, deleteFolderApi } from "@/lib/vault-api";
import { toast } from "sonner";
import type { Folder } from "@/lib/types";

export function FolderManager() {
  const { folders, setFolders, prompts, currentUserRole } = useOrg();
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = currentUserRole === "admin" || currentUserRole === "manager";
  if (!canManage) return null;

  function promptCount(folderId: string) {
    return prompts.filter((p) => p.folder_id === folderId).length;
  }

  function startEdit(folder: Folder) {
    setEditingId(folder.id);
    setEditName(folder.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleRename(folderId: string) {
    const trimmed = editName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const updated = await saveFolderApi({ id: folderId, name: trimmed });
      if (updated) {
        setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name: trimmed } : f)));
        toast.success("Folder renamed");
      }
    } catch {
      toast.error("Failed to rename folder");
    } finally {
      setSaving(false);
      cancelEdit();
    }
  }

  async function handleDelete(folderId: string) {
    const count = promptCount(folderId);
    const msg = count > 0
      ? `This folder has ${count} prompt(s). They won't be deleted, just unassigned. Continue?`
      : "Delete this folder?";
    if (!confirm(msg)) return;

    try {
      const ok = await deleteFolderApi(folderId);
      if (ok) {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        toast.success("Folder deleted");
      }
    } catch {
      toast.error("Failed to delete folder");
    }
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const folder = await saveFolderApi({ name: trimmed });
      if (folder) {
        setFolders((prev) => [...prev, folder]);
        setNewName("");
        setCreating(false);
        toast.success("Folder created");
      }
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          Manage Folders ({folders.length})
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {folders.length === 0 && !creating && (
            <p className="text-sm text-muted-foreground">No folders yet.</p>
          )}

          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-2 group">
              {editingId === folder.id ? (
                <>
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
                  {saving && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm truncate">{folder.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {promptCount(folder.id)}
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
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          ))}

          {creating ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setCreating(false);
                    setNewName("");
                  }
                }}
                placeholder="Folder name..."
                className="h-8 text-sm flex-1"
                autoFocus
                disabled={saving}
              />
              {saving && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setCreating(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Folder
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
