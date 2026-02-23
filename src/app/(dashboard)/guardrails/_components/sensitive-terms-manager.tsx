"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Upload,
  Pencil,
  Trash2,
  FileText,
  Users,
  Building2,
  Briefcase,
  Code,
  Handshake,
  DollarSign,
  Scale,
} from "lucide-react";
import {
  getSensitiveTerms,
  createSensitiveTerm,
  updateSensitiveTerm,
  deleteSensitiveTerm,
  importSensitiveTerms,
} from "@/lib/sensitive-terms-api";
import { toast } from "sonner";
import type { SensitiveTerm, SensitiveTermCategory } from "@/lib/types";

const CATEGORY_CONFIG: Record<SensitiveTermCategory, { label: string; icon: React.ElementType; color: string }> = {
  customer_data: { label: "Customer Data", icon: Users, color: "text-blue-500 bg-blue-500/10" },
  employee_data: { label: "Employee Data", icon: Building2, color: "text-green-500 bg-green-500/10" },
  project_names: { label: "Project Names", icon: Briefcase, color: "text-purple-500 bg-purple-500/10" },
  product_names: { label: "Product Names", icon: FileText, color: "text-orange-500 bg-orange-500/10" },
  internal_codes: { label: "Internal Codes", icon: Code, color: "text-cyan-500 bg-cyan-500/10" },
  partner_data: { label: "Partner Data", icon: Handshake, color: "text-pink-500 bg-pink-500/10" },
  financial_data: { label: "Financial Data", icon: DollarSign, color: "text-yellow-500 bg-yellow-500/10" },
  legal_data: { label: "Legal Data", icon: Scale, color: "text-red-500 bg-red-500/10" },
  custom: { label: "Custom", icon: FileText, color: "text-muted-foreground bg-muted" },
};

interface SensitiveTermsManagerProps {
  canEdit: boolean;
}

export function SensitiveTermsManager({ canEdit }: SensitiveTermsManagerProps) {
  const [terms, setTerms] = useState<SensitiveTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editTerm, setEditTerm] = useState<SensitiveTerm | null>(null);

  // Form state
  const [term, setTerm] = useState("");
  const [termType, setTermType] = useState<"exact" | "pattern" | "keyword">("exact");
  const [category, setCategory] = useState<SensitiveTermCategory>("custom");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"block" | "warn">("warn");

  // Import state
  const [importText, setImportText] = useState("");

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSensitiveTerms();
      setTerms(data);
    } catch (err) {
      console.error("Failed to load sensitive terms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const openModal = (termData: SensitiveTerm | null) => {
    if (termData) {
      setEditTerm(termData);
      setTerm(termData.term);
      setTermType(termData.term_type);
      setCategory(termData.category);
      setDescription(termData.description || "");
      setSeverity(termData.severity);
    } else {
      setEditTerm(null);
      setTerm("");
      setTermType("exact");
      setCategory("custom");
      setDescription("");
      setSeverity("warn");
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!term.trim()) {
      toast.error("Term is required");
      return;
    }

    try {
      if (editTerm) {
        await updateSensitiveTerm(editTerm.id, {
          term: term.trim(),
          term_type: termType,
          category,
          description: description.trim() || null,
          severity,
        });
        toast.success("Term updated");
      } else {
        await createSensitiveTerm({
          term: term.trim(),
          term_type: termType,
          category,
          description: description.trim() || null,
          severity,
          is_active: true,
          source: "manual",
        });
        toast.success("Term created");
      }
      setModalOpen(false);
      fetchTerms();
    } catch (err) {
      toast.error("Failed to save term");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this term?")) return;
    try {
      await deleteSensitiveTerm(id);
      toast.success("Term deleted");
      fetchTerms();
    } catch (err) {
      toast.error("Failed to delete term");
      console.error(err);
    }
  };

  const handleToggle = async (termData: SensitiveTerm) => {
    try {
      await updateSensitiveTerm(termData.id, { is_active: !termData.is_active });
      fetchTerms();
    } catch (err) {
      toast.error("Failed to toggle term");
      console.error(err);
    }
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      toast.error("Please enter terms to import");
      return;
    }

    try {
      // Parse CSV or line-separated terms
      const lines = importText.split("\n").filter((l) => l.trim());
      const termsToImport = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          term: parts[0],
          term_type: "exact" as const,
          category: (parts[1] as SensitiveTermCategory) || "custom",
          description: parts[2] || undefined,
          severity: (parts[3] as "block" | "warn") || "warn",
        };
      });

      const result = await importSensitiveTerms(termsToImport);
      toast.success(`Imported ${result.imported} terms`);
      setImportModalOpen(false);
      setImportText("");
      fetchTerms();
    } catch (err) {
      toast.error("Failed to import terms");
      console.error(err);
    }
  };

  const activeCount = terms.filter((t) => t.is_active).length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sensitive Terms</CardTitle>
              <CardDescription>
                Define custom terms, names, or patterns specific to your organization
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button size="sm" onClick={() => openModal(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Term
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : terms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-medium">No sensitive terms defined</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Add customer names, project codes, or other organization-specific terms that should be protected.
              </p>
              {canEdit && (
                <Button size="sm" className="mt-4" onClick={() => openModal(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Term
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{activeCount} active</Badge>
                <Badge variant="secondary">{terms.length} total</Badge>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Term</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {terms.map((t) => {
                      const config = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.custom;
                      const Icon = config.icon;
                      return (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{t.term}</p>
                              {t.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-xs">
                                  {t.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`h-6 w-6 rounded flex items-center justify-center ${config.color}`}>
                                <Icon className="h-3 w-3" />
                              </div>
                              <span className="text-xs">{config.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {t.term_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={t.severity === "block" ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {t.severity === "block" ? "Block" : "Warn"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={t.is_active}
                              onCheckedChange={() => handleToggle(t)}
                              disabled={!canEdit}
                            />
                          </TableCell>
                          <TableCell>
                            {canEdit && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openModal(t)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDelete(t.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTerm ? "Edit Term" : "Add Sensitive Term"}</DialogTitle>
            <DialogDescription>
              Define a term, name, or pattern that should be protected from AI exposure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Term or Pattern</Label>
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g., Project Phoenix, ACME Corp"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Match Type</Label>
                <Select value={termType} onValueChange={(v) => setTermType(v as typeof termType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact Match</SelectItem>
                    <SelectItem value="keyword">Keyword (case-insensitive)</SelectItem>
                    <SelectItem value="pattern">Regex Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as SensitiveTermCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why this term is sensitive"
              />
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Block (prevent submission)</SelectItem>
                  <SelectItem value="warn">Warn (allow with alert)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editTerm ? "Save" : "Add Term"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Sensitive Terms</DialogTitle>
            <DialogDescription>
              Paste a list of terms to import. One term per line, or use CSV format: term, category, description, severity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Project Phoenix, project_names, Internal codename
John Smith, customer_data, VIP customer, block
ACME-2024, internal_codes`}
              rows={8}
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">CSV Format:</p>
              <code className="bg-muted px-1.5 py-0.5 rounded">
                term, category, description, severity
              </code>
              <p className="mt-2">
                Categories: customer_data, employee_data, project_names, product_names, internal_codes, partner_data, financial_data, legal_data, custom
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
