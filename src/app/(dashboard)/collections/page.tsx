"use client";

import { useState } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderOpen, Pencil, Plus, Trash2, Users } from "lucide-react";
import { SelectWithQuickAdd } from "@/components/ui/select-with-quick-add";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { saveCollectionApi, deleteCollectionApi, saveTeamApi } from "@/lib/vault-api";
import { toast } from "sonner";
import { trackCollectionCreated } from "@/lib/analytics";
import type { Collection, CollectionVisibility } from "@/lib/types";

export default function CollectionsPage() {
  const { collections, prompts, teams, setTeams, loading, refresh, noOrg } = useOrg();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CollectionVisibility>("org");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);

  function openModal(coll: Collection | null) {
    if (coll) {
      setEditCollection(coll);
      setName(coll.name);
      setDescription(coll.description || "");
      setVisibility(coll.visibility);
      setTeamId(coll.team_id || null);
      setSelectedPromptIds(coll.promptIds || []);
    } else {
      setEditCollection(null);
      setName("");
      setDescription("");
      setVisibility("org");
      setTeamId(null);
      setSelectedPromptIds([]);
    }
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveCollectionApi({
        id: editCollection?.id,
        name: name.trim(),
        description: description.trim() || null,
        visibility,
        team_id: teamId,
        promptIds: selectedPromptIds,
      });
      if (!editCollection) trackCollectionCreated();
      toast.success(editCollection ? "Collection updated" : "Collection created");
      setModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save collection");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection?")) return;
    try {
      await deleteCollectionApi(id);
      toast.success("Collection deleted");
      refresh();
    } catch {
      toast.error("Failed to delete collection");
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Collections" description="Group related prompts into collections" />
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
        <PageHeader title="Collections" description="Group related prompts into collections" />
        <NoOrgBanner />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Collections"
        description="Group related prompts into collections"
        actions={
          <Button onClick={() => openModal(null)}>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        }
      />

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No collections yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a collection to group related prompts.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((coll) => (
            <Card key={coll.id} className="group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{coll.name}</CardTitle>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(coll)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(coll.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {coll.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {coll.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{coll.visibility}</Badge>
                  {coll.team_id && (() => {
                    const team = teams.find((t) => t.id === coll.team_id);
                    return team ? (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {team.name}
                      </Badge>
                    ) : null;
                  })()}
                  <span className="text-xs text-muted-foreground">
                    {coll.promptIds?.length || 0} prompts
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editCollection ? "Edit Collection" : "New Collection"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Collection name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as CollectionVisibility)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="org">Organization</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team</Label>
              <SelectWithQuickAdd
                value={teamId || ""}
                onValueChange={(v) => setTeamId(v || null)}
                items={teams.map((t) => ({ id: t.id, name: t.name }))}
                onQuickCreate={async (name) => {
                  const team = await saveTeamApi({ name });
                  if (team) {
                    setTeams((prev) => [team, ...prev]);
                    return { id: team.id, name: team.name };
                  }
                  return null;
                }}
                noneLabel="No team"
                createLabel="team"
              />
            </div>
            <div className="space-y-2">
              <Label>Prompts</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-3">
                {prompts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedPromptIds.includes(p.id)}
                      onCheckedChange={(checked) => {
                        setSelectedPromptIds(
                          checked
                            ? [...selectedPromptIds, p.id]
                            : selectedPromptIds.filter((id) => id !== p.id)
                        );
                      }}
                    />
                    <span className="truncate">{p.title}</span>
                  </label>
                ))}
                {prompts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No prompts available</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editCollection ? "Save" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
