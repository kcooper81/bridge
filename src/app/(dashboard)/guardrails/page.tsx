"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Download,
  Pencil,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SECURITY_RULES } from "@/lib/security/default-rules";
import { testPattern } from "@/lib/security/scanner";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type {
  SecurityCategory,
  SecurityPatternType,
  SecurityRule,
  SecuritySeverity,
  SecurityViolation,
} from "@/lib/types";

export default function GuardrailsPage() {
  const { org, currentUserRole } = useOrg();
  const { canAccess } = useSubscription();
  const canEdit = currentUserRole === "admin" || currentUserRole === "manager";
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<SecurityRule | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pattern, setPattern] = useState("");
  const [patternType, setPatternType] = useState<SecurityPatternType>("regex");
  const [category, setCategory] = useState<SecurityCategory>("custom");
  const [severity, setSeverity] = useState<SecuritySeverity>("block");
  const [testContent, setTestContent] = useState("");
  const [testResult, setTestResult] = useState<{ matched: boolean; matchedText: string | null } | null>(null);

  const fetchData = useCallback(async () => {
    if (!org) return;
    try {
      const supabase = createClient();

      const [rulesRes, violationsRes] = await Promise.all([
        supabase.from("security_rules").select("*").eq("org_id", org.id).order("name"),
        supabase
          .from("security_violations")
          .select("*, rule:security_rules(name, category, severity)")
          .eq("org_id", org.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      setRules(rulesRes.data || []);
      setViolations(violationsRes.data || []);
    } catch (err) {
      console.error("Failed to load guardrails data:", err);
    }
  }, [org]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openModal(rule: SecurityRule | null) {
    if (rule) {
      setEditRule(rule);
      setName(rule.name);
      setDescription(rule.description || "");
      setPattern(rule.pattern);
      setPatternType(rule.pattern_type);
      setCategory(rule.category);
      setSeverity(rule.severity);
    } else {
      setEditRule(null);
      setName("");
      setDescription("");
      setPattern("");
      setPatternType("regex");
      setCategory("custom");
      setSeverity("block");
    }
    setTestContent("");
    setTestResult(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim() || !pattern.trim() || !org) return;
    const supabase = createClient();

    const data = {
      org_id: org.id,
      name: name.trim(),
      description: description.trim() || null,
      pattern: pattern.trim(),
      pattern_type: patternType,
      category,
      severity,
      is_active: editRule?.is_active ?? true,
      is_built_in: editRule?.is_built_in ?? false,
    };

    if (editRule) {
      const { error } = await supabase.from("security_rules").update(data).eq("id", editRule.id);
      if (error) {
        toast.error("Failed to update policy");
        return;
      }
      toast.success("Policy updated");
    } else {
      const { error } = await supabase.from("security_rules").insert(data);
      if (error) {
        toast.error("Failed to create policy");
        return;
      }
      toast.success("Policy created");
    }

    setModalOpen(false);
    fetchData();
  }

  async function handleToggle(rule: SecurityRule) {
    const supabase = createClient();
    const { error } = await supabase.from("security_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    if (error) {
      toast.error("Failed to toggle policy");
      return;
    }
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this policy?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("security_rules").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete policy");
      return;
    }
    toast.success("Policy deleted");
    fetchData();
  }

  async function handleInstallDefaults() {
    if (!org) return;
    if (!canAccess("custom_security")) {
      toast.error("Custom security rules require a paid plan.");
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const inserts = DEFAULT_SECURITY_RULES.map((r) => ({
      org_id: org.id,
      name: r.name,
      description: r.description,
      pattern: r.pattern,
      pattern_type: r.pattern_type,
      category: r.category,
      severity: r.severity,
      is_active: r.is_active,
      is_built_in: true,
      created_by: user?.id,
    }));

    const { error } = await supabase.from("security_rules").insert(inserts);
    if (error) {
      toast.error("Failed to install default policies");
      return;
    }
    toast.success("Default policies installed");
    fetchData();
  }

  function handleTestPattern() {
    if (!testContent || !pattern) return;
    const result = testPattern(testContent, pattern, patternType);
    setTestResult(result);
  }

  const activeRules = rules.filter((r) => r.is_active).length;
  const weekViolations = violations.filter(
    (v) => new Date(v.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const blockRate =
    violations.length > 0
      ? Math.round(
          (violations.filter((v) => v.action_taken === "blocked").length /
            violations.length) *
            100
        )
      : 0;

  return (
    <>
      <PageHeader
        title="AI Guardrails"
        description="Protect sensitive data from leaking into AI prompts"
        actions={
          <div className="flex gap-2">
            {rules.length === 0 && (
              <Button variant="outline" onClick={handleInstallDefaults}>
                <Download className="mr-2 h-4 w-4" />
                Install Defaults
              </Button>
            )}
            {canAccess("custom_security") && (
              <Button onClick={() => openModal(null)}>
                <Plus className="mr-2 h-4 w-4" />
                New Policy
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Active Policies" value={activeRules} icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Violations (7d)" value={weekViolations} icon={<ShieldAlert className="h-5 w-5" />} />
        <StatCard label="Block Rate" value={`${blockRate}%`} icon={<Shield className="h-5 w-5" />} />
      </div>

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">Policies ({rules.length})</TabsTrigger>
          <TabsTrigger value="violations">Violations ({violations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No policies yet. Install defaults to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{rule.name}</p>
                          {rule.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{rule.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{rule.pattern_type}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {rule.category === "pii" ? "Personal Info (PII)" : rule.category.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.severity === "block" ? "destructive" : "default"} className="text-xs">
                          {rule.severity === "block" ? "Blocked" : "Warning"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={rule.is_active} onCheckedChange={() => handleToggle(rule)} disabled={!canEdit} />
                      </TableCell>
                      <TableCell>
                        {canEdit && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(rule)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {!rule.is_built_in && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(rule.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="violations" className="mt-4">
          {!canAccess("audit_log") ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Audit log requires Team or higher</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade to view the security violation audit log.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        No violations recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    violations.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {(v.rule as unknown as SecurityRule)?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {v.matched_text}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={v.action_taken === "blocked" ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {v.action_taken === "blocked" ? "Blocked" : v.action_taken === "overridden" ? "Overridden" : "Auto-redacted"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Policy Editor Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRule ? "Edit Policy" : "New Policy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Policy name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pattern Type</Label>
                <Select value={patternType} onValueChange={(v) => setPatternType(v as SecurityPatternType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact Match</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                    <SelectItem value="glob">Glob</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as SecurityCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_keys">API Keys</SelectItem>
                    <SelectItem value="credentials">Credentials</SelectItem>
                    <SelectItem value="pii">Personal Info (PII)</SelectItem>
                    <SelectItem value="secrets">Secrets</SelectItem>
                    <SelectItem value="internal_terms">Internal Terms</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pattern</Label>
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder={patternType === "regex" ? "sk_[A-Za-z0-9]{20,}" : "Enter pattern"}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as SecuritySeverity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="block">Blocked (prevent save)</SelectItem>
                  <SelectItem value="warn">Warning (allow with alert)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pattern Tester */}
            <div className="rounded-lg border border-border p-3 space-y-2">
              <Label className="text-xs">Test Pattern</Label>
              <div className="flex gap-2">
                <Input
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder="Paste test content..."
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleTestPattern}>
                  Test
                </Button>
              </div>
              {testResult && (
                <p className={`text-xs ${testResult.matched ? "text-destructive" : "text-tp-green"}`}>
                  {testResult.matched
                    ? `Match found: ${testResult.matchedText}`
                    : "No match — content is safe"}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editRule ? "Save" : "Create Policy"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
