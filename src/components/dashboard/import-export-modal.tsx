"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2, Upload } from "lucide-react";
import { exportPack, importPack } from "@/lib/vault-api";
import { toast } from "sonner";
import { trackExport, trackImport } from "@/lib/analytics";
import type { Prompt } from "@/lib/types";

interface ImportExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompts: Prompt[];
  onImported: () => void;
}

export function ImportExportModal({
  open,
  onOpenChange,
  prompts,
  onImported,
}: ImportExportModalProps) {
  const [tab, setTab] = useState<"export" | "import">("export");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [packName, setPackName] = useState("My Prompt Pack");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    if (selectedIds.length === 0) {
      toast.error("Select at least one prompt to export");
      return;
    }
    const pack = await exportPack(selectedIds, packName.trim() || "Prompt Pack");
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${packName.trim().replace(/\s+/g, "-").toLowerCase() || "prompts"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackExport(selectedIds.length);
    toast.success(`Exported ${selectedIds.length} prompts`);
    onOpenChange(false);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await importPack(data);
      if (result.imported > 0) {
        trackImport(result.imported);
        toast.success(`Imported ${result.imported} prompts`);
        onImported();
      }
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors during import`);
      }
      onOpenChange(false);
    } catch {
      toast.error("Invalid file format");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? prompts.map((p) => p.id) : []);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import / Export</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setTab("export")}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              tab === "export" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Download className="inline mr-1.5 h-3.5 w-3.5" />
            Export
            {tab === "export" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setTab("import")}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              tab === "import" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="inline mr-1.5 h-3.5 w-3.5" />
            Import
            {tab === "import" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {tab === "export" ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Pack Name</Label>
              <Input value={packName} onChange={(e) => setPackName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Prompts ({selectedIds.length}/{prompts.length})</Label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox
                    checked={selectedIds.length === prompts.length && prompts.length > 0}
                    onCheckedChange={(c) => toggleAll(!!c)}
                  />
                  All
                </label>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-md border p-3">
                {prompts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No prompts to export</p>
                ) : (
                  prompts.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedIds.includes(p.id)}
                        onCheckedChange={(c) =>
                          setSelectedIds(c ? [...selectedIds, p.id] : selectedIds.filter((id) => id !== p.id))
                        }
                      />
                      <span className="truncate">{p.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <Button onClick={handleExport} disabled={selectedIds.length === 0} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export {selectedIds.length} Prompt{selectedIds.length !== 1 ? "s" : ""}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Upload a TeamPrompt export file (.json) to import prompts into your vault.
            </p>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Drop a file here or click to browse</p>
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
                {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Choose File
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
