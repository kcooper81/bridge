"use client";

import { useState, useRef } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Upload } from "lucide-react";
import { UpgradeGate } from "@/components/upgrade";
import { exportPack, importPack } from "@/lib/vault-api";
import { toast } from "sonner";
import { trackExport, trackImport } from "@/lib/analytics";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";

export default function ImportExportPage() {
  const { prompts, refresh, noOrg } = useOrg();
  const { canAccess } = useSubscription();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [packName, setPackName] = useState("My Prompt Pack");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (noOrg) {
    return (
      <>
        <PageHeader title="Import / Export" />
        <NoOrgBanner />
      </>
    );
  }

  if (!canAccess("import_export")) {
    return (
      <>
        <PageHeader title="Import / Export" />
        <UpgradeGate feature="import_export" title="Import / Export" />
      </>
    );
  }

  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (selectedIds.length === 0) {
      toast.error("Select at least one prompt to export");
      return;
    }
    setExporting(true);
    try {
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
    } catch {
      toast.error("Failed to export prompts");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== "object" || !Array.isArray(data.prompts)) {
        toast.error("Invalid pack format: expected { prompts: [...] }");
        setImporting(false);
        if (fileRef.current) fileRef.current.value = "";
        return;
      }
      const result = await importPack(data);
      if (result.imported > 0) {
        trackImport(result.imported);
        toast.success(`Imported ${result.imported} prompts`);
        refresh();
      }
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors during import`);
      }
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
    <>
      <PageHeader title="Import / Export" description="Move prompts between organizations" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {prompts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={(c) =>
                        setSelectedIds(c ? [...selectedIds, p.id] : selectedIds.filter((id) => id !== p.id))
                      }
                    />
                    <span className="truncate">{p.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleExport} disabled={selectedIds.length === 0 || exporting} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export {selectedIds.length} Prompt{selectedIds.length !== 1 ? "s" : ""}
            </Button>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
