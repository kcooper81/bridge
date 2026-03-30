"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Brain,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Loader2,
  Package,
  Pencil,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Settings2,
  FileText,
  Lightbulb,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  AlertTriangle,
  ChevronDown,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ToolPolicy } from "@/components/dashboard/tool-policy";
import { DEFAULT_SECURITY_RULES } from "@/lib/security/default-rules";
import { COMPLIANCE_TEMPLATES, PACK_GROUPS, type ComplianceTemplate } from "@/lib/security/compliance-templates";
import { installComplianceTemplate } from "@/lib/vault-api";
import { testPattern } from "@/lib/security/scanner";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { trackGuardrailCreated } from "@/lib/analytics";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { UpgradeGate } from "@/components/upgrade";
import { DetectionSettings } from "./_components/detection-settings";
import { SensitiveTermsManager } from "./_components/sensitive-terms-manager";
import { SuggestedRules } from "./_components/suggested-rules";
import type {
  DetectionType,
  SecurityCategory,
  SecurityPatternType,
  SecurityRule,
  SecuritySeverity,
  SecurityViolation,
  Team,
} from "@/lib/types";

function detectionTypeLabel(dt: DetectionType | string): string {
  switch (dt) {
    case "pattern": return "Pattern Rule";
    case "term": return "Sensitive Term";
    case "smart_pattern": return "Smart Pattern";
    case "entropy": return "Entropy";
    case "ai": return "AI Detection";
    default: return dt;
  }
}

function detectionTypeBadgeClass(dt: DetectionType | string): string {
  switch (dt) {
    case "pattern": return "border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400";
    case "term": return "border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400";
    case "smart_pattern": return "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400";
    case "entropy": return "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400";
    case "ai": return "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-400";
    default: return "";
  }
}

function CompliancePackCard({
  tpl, rules, installedPacks, installingPack, onInstall, onPreview, requiresUpgrade,
}: {
  tpl: ComplianceTemplate;
  rules: SecurityRule[];
  installedPacks: Set<string>;
  installingPack: string | null;
  onInstall: (id: string) => void;
  onPreview: (tpl: ComplianceTemplate) => void;
  requiresUpgrade?: boolean;
}) {
  const isInstalled = installedPacks.has(tpl.id);
  const isInstalling = installingPack === tpl.id;
  const existingCount = tpl.rules.filter((r) => rules.some((er) => er.name === r.name)).length;
  const allExist = existingCount === tpl.rules.length;

  return (
    <div
      className="rounded-lg border border-border p-4 flex flex-col gap-2 cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-colors"
      onClick={() => onPreview(tpl)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-sm">{tpl.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{tpl.rules.length} rules</Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Click to preview
          </span>
        </div>
        {requiresUpgrade ? (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onInstall(tpl.id); }}>
            <TrendingUp className="h-3 w-3" />
            Upgrade to Install
          </Button>
        ) : isInstalled || allExist ? (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-tp-green gap-1" onClick={(e) => { e.stopPropagation(); onInstall(tpl.id); }} disabled={isInstalling}>
            {isInstalling ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
            {isInstalling ? "Installing..." : "Installed"}
          </Button>
        ) : (
          <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onInstall(tpl.id); }} disabled={isInstalling}>
            {isInstalling ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
            {isInstalling ? "Installing..." : existingCount > 0 ? `Install (${tpl.rules.length - existingCount} new)` : "Install"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function GuardrailsPage() {
  const { org, currentUserRole, noOrg } = useOrg();
  const { canAccess } = useSubscription();
  const canEdit = currentUserRole === "admin" || currentUserRole === "manager";
  const [dataLoading, setDataLoading] = useState(true);
  const [rules, setRules] = useState<SecurityRule[]>([]);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<SecurityRule | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamFilter, setTeamFilter] = useState<string>("all"); // "all" | "global" | team_id
  const [packFilter, setPackFilter] = useState<string>("all"); // "all" | pack_id
  const [detectionFilter, setDetectionFilter] = useState<string>("all"); // "all" | DetectionType
  const [showAllPacks, setShowAllPacks] = useState(false);
  const [violationSort, setViolationSort] = useState<{ col: "date" | "user" | "policy" | "detection" | "action"; dir: "asc" | "desc" }>({ col: "date", dir: "desc" });
  const [violationPage, setViolationPage] = useState(0);
  const VIOLATION_PAGE_SIZE = 25;
  const [policySort, setPolicySort] = useState<{ col: "name" | "source" | "scope" | "category" | "severity" | "active"; dir: "asc" | "desc" }>({ col: "name", dir: "asc" });

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pattern, setPattern] = useState("");
  const [patternType, setPatternType] = useState<SecurityPatternType>("regex");
  const [category, setCategory] = useState<SecurityCategory>("custom");
  const [severity, setSeverity] = useState<SecuritySeverity>("block");
  const [scopeTeamId, setScopeTeamId] = useState<string>("global"); // "global" | team_id
  const [testContent, setTestContent] = useState("");
  const [testResult, setTestResult] = useState<{ matched: boolean; matchedText: string | null } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [installingDefaults, setInstallingDefaults] = useState(false);
  const [installingPack, setInstallingPack] = useState<string | null>(null);
  const [installedPacks, setInstalledPacks] = useState<Set<string>>(new Set());
  const [previewPack, setPreviewPack] = useState<ComplianceTemplate | null>(null);

  // Tab state (controlled so we can switch programmatically)
  const [activeTab, setActiveTab] = useState("policies");

  // AI Generate state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiRules, setAiRules] = useState<Array<{
    name: string; description: string; pattern: string;
    pattern_type: SecurityPatternType; category: SecurityCategory; severity: SecuritySeverity;
    _selected: boolean;
  }>>([]);
  const [aiError, setAiError] = useState("");
  const [aiSaving, setAiSaving] = useState(false);
  const [aiNeedsSetup, setAiNeedsSetup] = useState(false);
  const [aiCheckingSetup, setAiCheckingSetup] = useState(false);

  const fetchData = useCallback(async () => {
    if (!org) return;
    try {
      const supabase = createClient();

      const [rulesRes, violationsRes, teamsRes] = await Promise.all([
        supabase.from("security_rules").select("*").eq("org_id", org.id).order("name"),
        supabase
          .from("security_violations")
          .select("*, rule:security_rules(name, category, severity), user:profiles!security_violations_user_id_fkey(name, email)")
          .eq("org_id", org.id)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("teams").select("*").eq("org_id", org.id).order("name"),
      ]);

      setRules(rulesRes.data || []);
      setViolations(violationsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (err) {
      console.error("Failed to load guardrails data:", err);
    }
    setDataLoading(false);
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
      setScopeTeamId(rule.team_id || "global");
    } else {
      setEditRule(null);
      setName("");
      setDescription("");
      setPattern("");
      setPatternType("keywords");
      setCategory("custom");
      setSeverity("block");
      setScopeTeamId("global");
    }
    setTestContent("");
    setTestResult(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!canEdit || !name.trim() || !pattern.trim() || !org) return;
    setSaving(true);
    try {
      const supabase = createClient();

      const data = {
        org_id: org.id,
        team_id: scopeTeamId === "global" ? null : scopeTeamId,
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
        trackGuardrailCreated();
        toast.success("Policy created");
      }

      setModalOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(rule: SecurityRule) {
    setTogglingId(rule.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("security_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
      if (error) {
        toast.error("Failed to toggle policy");
        return;
      }
      fetchData();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this policy? This action cannot be undone.")) return;
    setDeleting(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("security_rules").delete().eq("id", id);
      if (error) {
        toast.error("Failed to delete policy");
        return;
      }
      toast.success("Policy deleted");
      fetchData();
    } finally {
      setDeleting(null);
    }
  }

  async function handleInstallDefaults() {
    if (!org) return;
    if (!canAccess("custom_security")) return;
    if (!confirm(`Install ${DEFAULT_SECURITY_RULES.length} default security policies? You can customize or disable them later.`)) return;
    setInstallingDefaults(true);
    try {
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
    } finally {
      setInstallingDefaults(false);
    }
  }

  async function handleInstallCompliancePack(templateId: string) {
    if (!canAccess("custom_security")) return;
    setInstallingPack(templateId);
    try {
      const result = await installComplianceTemplate(templateId);
      if (result.error === "All rules already exist") {
        toast.info("All rules from this pack are already installed");
        setInstalledPacks((prev) => new Set(prev).add(templateId));
      } else if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Installed ${result.rulesCreated} compliance rule(s)`);
        setInstalledPacks((prev) => new Set(prev).add(templateId));
        fetchData();
      }
    } finally {
      setInstallingPack(null);
    }
  }

  async function handleAiModalOpen() {
    if (!org) return;
    setAiModalOpen(true);
    setAiRules([]);
    setAiError("");
    setAiPrompt("");
    setAiNeedsSetup(false);
    setAiCheckingSetup(true);
    try {
      const supabase = createClient();
      const { data: orgData } = await supabase
        .from("organizations")
        .select("security_settings")
        .eq("id", org.id)
        .single();
      const s = orgData?.security_settings || {};
      const hasKey = (s.ai_detection_provider === "openai" || s.ai_detection_provider === "anthropic") && !!s.ai_api_key;
      setAiNeedsSetup(!hasKey);
    } catch {
      setAiNeedsSetup(true);
    } finally {
      setAiCheckingSetup(false);
    }
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError("");
    setAiRules([]);
    try {
      const res = await fetch("/api/guardrails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Generation failed");
        return;
      }
      setAiRules((data.rules || []).map((r: Record<string, unknown>) => ({ ...r, _selected: true })));
    } catch {
      setAiError("Failed to connect. Check your network.");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleAiSaveSelected() {
    if (!org) return;
    const selected = aiRules.filter((r) => r._selected);
    if (selected.length === 0) return;
    setAiSaving(true);
    try {
      const supabase = createClient();
      const inserts = selected.map((r) => ({
        org_id: org.id,
        name: r.name,
        description: r.description,
        pattern: r.pattern,
        pattern_type: r.pattern_type,
        category: r.category,
        severity: r.severity,
        is_active: true,
        is_built_in: false,
      }));
      const { error } = await supabase.from("security_rules").insert(inserts);
      if (error) {
        toast.error("Failed to save rules");
        return;
      }
      toast.success(`Created ${selected.length} rule${selected.length !== 1 ? "s" : ""}`);
      setAiModalOpen(false);
      setAiRules([]);
      setAiPrompt("");
      fetchData();
    } finally {
      setAiSaving(false);
    }
  }

  function handleTestPattern() {
    if (!testContent || !pattern) return;
    const result = testPattern(testContent, pattern, patternType);
    setTestResult(result);
  }

  // Filter rules by team scope and pack
  const filteredRules = rules.filter((r) => {
    if (teamFilter !== "all") {
      if (teamFilter === "global" && r.team_id !== null) return false;
      if (teamFilter !== "global" && r.team_id !== teamFilter) return false;
    }
    if (packFilter !== "all") {
      if (packFilter === "none") { if (r.source_pack) return false; }
      else if (r.source_pack !== packFilter) return false;
    }
    return true;
  });

  // Determine which packs have installed rules
  const installedPackIds = new Set(rules.map((r) => r.source_pack).filter(Boolean) as string[]);

  const teamNameMap = new Map(teams.map((t) => [t.id, t.name]));

  const activeRules = rules.filter((r) => r.is_active).length;
  const inactiveRules = rules.length - activeRules;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekViolations = violations.filter((v) => new Date(v.created_at) > weekAgo).length;
  const prevWeekViolations = violations.filter((v) => {
    const d = new Date(v.created_at);
    return d > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && d <= weekAgo;
  }).length;
  const weekTrend = prevWeekViolations > 0
    ? Math.round(((weekViolations - prevWeekViolations) / prevWeekViolations) * 100)
    : weekViolations > 0 ? 100 : 0;
  const blockedCount = violations.filter((v) => v.action_taken === "blocked").length;
  const blockRate =
    violations.length > 0
      ? Math.round((blockedCount / violations.length) * 100)
      : 0;
  // Top triggered rule this week
  const weekViolationsList = violations.filter((v) => new Date(v.created_at) > weekAgo);
  const ruleHitCounts = new Map<string, number>();
  weekViolationsList.forEach((v) => {
    const rName = (v.rule as unknown as SecurityRule)?.name || "Unknown";
    ruleHitCounts.set(rName, (ruleHitCounts.get(rName) || 0) + 1);
  });
  const topTriggeredRule = Array.from(ruleHitCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  // Unique users who triggered violations this week
  const uniqueViolationUsers = new Set(weekViolationsList.map((v) => v.user_id)).size;
  const packsInstalled = installedPackIds.size;

  if (noOrg) {
    return (
      <>
        <PageHeader title="AI Guardrails" description="Protect sensitive data from leaking into AI prompts" />
        <NoOrgBanner />
      </>
    );
  }

  if (dataLoading) {
    return (
      <>
        <PageHeader title="AI Guardrails" description="Protect sensitive data from leaking into AI prompts" />
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </>
    );
  }

  // Members see a simplified view — only the suggest form
  if (!canEdit) {
    return (
      <>
        <PageHeader
          title="AI Guardrails"
          description="Your organization's data protection rules — avoid including this data in AI prompts"
        />
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard label="Active Policies" value={activeRules} icon={<ShieldCheck className="h-5 w-5" />} />
          <StatCard label="Violations (7d)" value={weekViolations} icon={<ShieldAlert className="h-5 w-5" />} />
          <StatCard label="Block Rate" value={`${blockRate}%`} icon={<Shield className="h-5 w-5" />} />
        </div>

        {/* Read-only rules list for members — clickable for details */}
        {rules.filter((r) => r.is_active).length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Active Rules</h3>
            <div className="rounded-lg border border-border divide-y divide-border">
              {rules.filter((r) => r.is_active).map((rule) => (
                <details key={rule.id} className="group">
                  <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{rule.name}</p>
                      {rule.description && <p className="text-xs text-muted-foreground truncate">{rule.description}</p>}
                    </div>
                    <Badge variant={rule.severity === "block" ? "destructive" : rule.severity === "redact" ? "outline" : "secondary"} className="text-[10px] shrink-0">
                      {rule.severity === "block" ? "Blocks" : rule.severity === "redact" ? "Redacts" : "Warns"}
                    </Badge>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-1 ml-7 space-y-2 text-sm">
                    {rule.description && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Description</p>
                        <p className="text-sm">{rule.description}</p>
                      </div>
                    )}
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Category</p>
                        <p className="text-sm capitalize">{rule.category.replace(/_/g, " ")}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Detection</p>
                        <p className="text-sm capitalize">{rule.pattern_type}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Severity</p>
                        <p className="text-sm capitalize">{rule.severity === "block" ? "Blocked — message will not send" : rule.severity === "redact" ? "Redacted — sensitive data replaced before sending" : "Warning — message sends with alert"}</p>
                      </div>
                    </div>
                    {rule.source_pack && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Source</p>
                        <p className="text-sm">{rule.source_pack} compliance pack</p>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        <MemberSuggestRule />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="AI Guardrails"
        description="Protect sensitive data from leaking into AI prompts"
        actions={
          <div className="flex gap-2">
            {rules.length === 0 && (
              <Button variant="outline" onClick={handleInstallDefaults} disabled={installingDefaults}>
                {installingDefaults ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {installingDefaults ? "Installing..." : "Install Defaults"}
              </Button>
            )}
            {rules.length > 0 && (
              <Button variant="outline" size="sm" onClick={async () => {
                try {
                  const supabase = (await import("@/lib/supabase/client")).createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  const res = await fetch("/api/guardrails/export?format=json", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                  });
                  if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "teamprompt-dlp-rules.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  } else {
                    const data = await res.json().catch(() => ({}));
                    toast.error(data.error || "Failed to export rules");
                  }
                } catch {
                  toast.error("Failed to export rules");
                }
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Rules
              </Button>
            )}
            {canAccess("custom_security") && (
              <>
                <Button variant="outline" onClick={handleAiModalOpen}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Generate
                </Button>
                <Button onClick={() => openModal(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Policy
                </Button>
              </>
            )}
            {canEdit && (
              <Button variant="ghost" size="icon" onClick={() => setActiveTab("detection")} title="Detection Settings">
                <Settings2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`Active Policies${inactiveRules > 0 ? ` (${inactiveRules} inactive)` : ""}`}
          value={activeRules}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <div className="rounded-2xl border border-border/50 bg-card p-5 flex items-center gap-5 shadow-elevation-2 backdrop-blur-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold tracking-tight">{weekViolations}</p>
              {weekTrend !== 0 && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${weekTrend > 0 ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                  {weekTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {weekTrend > 0 ? "+" : ""}{weekTrend}%
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Violations (7d)</p>
          </div>
        </div>
        <StatCard label="Block Rate" value={`${blockRate}%`} icon={<Shield className="h-5 w-5" />} />
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-elevation-2 backdrop-blur-sm">
          <div className="space-y-2">
            {topTriggeredRule ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-sm font-semibold truncate">{topTriggeredRule[0]}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Top triggered rule — {topTriggeredRule[1]} hit{topTriggeredRule[1] !== 1 ? "s" : ""} this week
                  {uniqueViolationUsers > 0 && ` by ${uniqueViolationUsers} user${uniqueViolationUsers !== 1 ? "s" : ""}`}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-semibold">No Violations</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Clean week — {packsInstalled > 0 ? `${packsInstalled} pack${packsInstalled !== 1 ? "s" : ""} active` : "no packs installed yet"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="policies" className="gap-1.5">
            <Shield className="h-4 w-4 hidden sm:inline" />
            Policies ({rules.length})
          </TabsTrigger>
          <TabsTrigger value="terms" className="gap-1.5">
            <FileText className="h-4 w-4 hidden sm:inline" />
            Sensitive Terms
          </TabsTrigger>
          <TabsTrigger value="detection" className="gap-1.5">
            <Settings2 className="h-4 w-4 hidden sm:inline" />
            Detection
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-1.5">
            <Lightbulb className="h-4 w-4 hidden sm:inline" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="violations" className="gap-1.5">
            <ShieldAlert className="h-4 w-4 hidden sm:inline" />
            Violations ({violations.length})
          </TabsTrigger>
          <TabsTrigger value="ai-tools" className="gap-1.5">
            <Globe className="h-4 w-4 hidden sm:inline" />
            AI Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4">
          {!canAccess("custom_security") && (
            <UpgradeGate feature="custom_security" title="Custom Security Policies" className="mb-6 py-10" />
          )}

          {/* Compliance Packs — visible to all, but install requires upgrade for free/pro */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Compliance Packs</h3>
                <span className="text-xs text-muted-foreground">One-click install regulatory rule sets</span>
                {!canAccess("custom_security") && (
                  <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">Team+</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setShowAllPacks(true)}
              >
                <Package className="h-3 w-3" />
                Browse All Packs ({COMPLIANCE_TEMPLATES.length})
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMPLIANCE_TEMPLATES.slice(0, 6).map((tpl) => (
                <CompliancePackCard
                  key={tpl.id}
                  tpl={tpl}
                  rules={rules}
                  installedPacks={installedPacks}
                  installingPack={installingPack}
                  onInstall={canAccess("custom_security") ? handleInstallCompliancePack : () => toast.error("Upgrade to Team or Business to install compliance packs")}
                  onPreview={setPreviewPack}
                  requiresUpgrade={!canAccess("custom_security")}
                />
              ))}
            </div>
          </div>

          <div className="mb-4 flex items-center gap-4 flex-wrap">
            {teams.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Scope:</Label>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Policies</SelectItem>
                    <SelectItem value="global">Global Only</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {installedPackIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-sm text-muted-foreground">Pack:</Label>
                <Select value={packFilter} onValueChange={setPackFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="none">No Pack (Custom)</SelectItem>
                    {Array.from(installedPackIds).map((packId) => {
                      const tpl = COMPLIANCE_TEMPLATES.find((t) => t.id === packId);
                      return (
                        <SelectItem key={packId} value={packId}>
                          {tpl?.name || packId}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {([
                    { key: "name", label: "Policy" },
                    { key: "source", label: "Source" },
                    { key: "scope", label: "Scope" },
                    { key: null, label: "Pattern" },
                    { key: "category", label: "Category" },
                    { key: "severity", label: "Severity" },
                    { key: "active", label: "Active" },
                  ] as const).map((col, i) => (
                    <TableHead key={i}>
                      {col.key ? (
                        <button
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={() => setPolicySort((prev) =>
                            prev.col === col.key
                              ? { col: col.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                              : { col: col.key, dir: "asc" }
                          )}
                        >
                          {col.label}
                          <ArrowUpDown className={`h-3 w-3 ${policySort.col === col.key ? "text-primary" : "opacity-40"}`} />
                        </button>
                      ) : col.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      {rules.length === 0
                        ? "No policies yet. Install defaults to get started."
                        : "No policies match the current filter."}
                    </TableCell>
                  </TableRow>
                ) : (
                  [...filteredRules].sort((a, b) => {
                    const dir = policySort.dir === "asc" ? 1 : -1;
                    switch (policySort.col) {
                      case "name": return dir * a.name.localeCompare(b.name);
                      case "source": return dir * (a.source_pack || "").localeCompare(b.source_pack || "");
                      case "scope": return dir * (a.team_id || "").localeCompare(b.team_id || "");
                      case "category": return dir * a.category.localeCompare(b.category);
                      case "severity": return dir * a.severity.localeCompare(b.severity);
                      case "active": return dir * (Number(a.is_active) - Number(b.is_active));
                      default: return 0;
                    }
                  }).map((rule) => (
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
                        {rule.source_pack ? (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Package className="h-2.5 w-2.5" />
                            {COMPLIANCE_TEMPLATES.find((t) => t.id === rule.source_pack)?.name?.replace(" Compliance", "").replace(" Protection", "") || rule.source_pack}
                          </Badge>
                        ) : rule.is_built_in ? (
                          <Badge variant="outline" className="text-[10px]">Default</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Custom</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.team_id ? "secondary" : "outline"} className="text-xs">
                          {rule.team_id ? teamNameMap.get(rule.team_id) || "Team" : "Global"}
                        </Badge>
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
                        <Badge variant={rule.severity === "block" ? "destructive" : rule.severity === "redact" ? "outline" : "default"} className="text-xs">
                          {rule.severity === "block" ? "Blocked" : rule.severity === "redact" ? "Redacts" : "Warning"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={rule.is_active} onCheckedChange={() => handleToggle(rule)} disabled={!canEdit || togglingId === rule.id} />
                      </TableCell>
                      <TableCell>
                        {canEdit && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openModal(rule)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(rule.id)} disabled={deleting === rule.id}>
                              {deleting === rule.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
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
            <UpgradeGate feature="audit_log" title="Security Violation Log" />
          ) : (
            <>
              {/* Detection type filter */}
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <Label className="text-sm text-muted-foreground">Detection:</Label>
                {(["all", "pattern", "term", "smart_pattern", "entropy", "ai"] as const).map((dt) => (
                  <button
                    key={dt}
                    onClick={() => { setDetectionFilter(dt); setViolationPage(0); }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors hover:scale-100 active:scale-100 ${
                      detectionFilter === dt
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {dt === "all" ? "All" : detectionTypeLabel(dt)}
                    {dt !== "all" && (
                      <span className="text-[10px] opacity-70">
                        ({violations.filter((v) => (v.detection_type || "pattern") === dt).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {([
                        { key: "date", label: "Date" },
                        { key: "user", label: "User" },
                        { key: "policy", label: "Policy / Source" },
                        { key: "detection", label: "Detection" },
                        { key: "action", label: "Action" },
                      ] as const).map((col) => (
                        <TableHead key={col.key}>
                          <button
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                            onClick={() => setViolationSort((prev) =>
                              prev.col === col.key
                                ? { col: col.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                                : { col: col.key, dir: "desc" }
                            )}
                          >
                            {col.label}
                            <ArrowUpDown className={`h-3 w-3 ${violationSort.col === col.key ? "text-primary" : "opacity-40"}`} />
                          </button>
                        </TableHead>
                      ))}
                      <TableHead>Match</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = detectionFilter === "all"
                        ? violations
                        : violations.filter((v) => (v.detection_type || "pattern") === detectionFilter);

                      const sorted = [...filtered].sort((a, b) => {
                        const dir = violationSort.dir === "asc" ? 1 : -1;
                        switch (violationSort.col) {
                          case "date":
                            return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                          case "user": {
                            const aUser = (a.user as unknown as { name: string; email: string })?.name || (a.user as unknown as { name: string; email: string })?.email || "";
                            const bUser = (b.user as unknown as { name: string; email: string })?.name || (b.user as unknown as { name: string; email: string })?.email || "";
                            return dir * aUser.localeCompare(bUser);
                          }
                          case "policy": {
                            const aName = (a.rule as unknown as SecurityRule)?.name || "";
                            const bName = (b.rule as unknown as SecurityRule)?.name || "";
                            return dir * aName.localeCompare(bName);
                          }
                          case "detection":
                            return dir * (a.detection_type || "pattern").localeCompare(b.detection_type || "pattern");
                          case "action":
                            return dir * (a.action_taken || "").localeCompare(b.action_taken || "");
                          default:
                            return 0;
                        }
                      });

                      if (sorted.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                              {violations.length === 0
                                ? "No violations recorded yet."
                                : "No violations match the selected detection type."}
                            </TableCell>
                          </TableRow>
                        );
                      }
                      const totalFiltered = sorted.length;
                      const totalPages = Math.ceil(totalFiltered / VIOLATION_PAGE_SIZE);
                      const paged = sorted.slice(violationPage * VIOLATION_PAGE_SIZE, (violationPage + 1) * VIOLATION_PAGE_SIZE);
                      return (<>{paged.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(v.user as unknown as { name: string; email: string })?.name
                              || (v.user as unknown as { name: string; email: string })?.email
                              || "—"}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {(v.rule as unknown as SecurityRule)?.name || v.matched_text?.slice(0, 20) || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] ${detectionTypeBadgeClass(v.detection_type || "pattern")}`}>
                              {detectionTypeLabel(v.detection_type || "pattern")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={v.action_taken === "blocked" ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {v.action_taken === "blocked" ? "Blocked" : v.action_taken === "overridden" ? "Overridden" : "Auto-redacted"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {v.matched_text}
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                      {totalPages > 1 && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="flex items-center justify-between py-1">
                              <p className="text-xs text-muted-foreground">
                                {violationPage * VIOLATION_PAGE_SIZE + 1}–{Math.min((violationPage + 1) * VIOLATION_PAGE_SIZE, totalFiltered)} of {totalFiltered}
                              </p>
                              <div className="flex gap-1">
                                <button
                                  className="h-7 w-7 flex items-center justify-center rounded border text-xs disabled:opacity-30"
                                  disabled={violationPage === 0}
                                  onClick={() => setViolationPage(violationPage - 1)}
                                >&lsaquo;</button>
                                <button
                                  className="h-7 w-7 flex items-center justify-center rounded border text-xs disabled:opacity-30"
                                  disabled={violationPage >= totalPages - 1}
                                  onClick={() => setViolationPage(violationPage + 1)}
                                >&rsaquo;</button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </>);
                    })()}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* Sensitive Terms Tab */}
        <TabsContent value="terms" className="mt-4">
          <SensitiveTermsManager canEdit={canEdit} teams={teams} />
        </TabsContent>

        {/* Detection Settings Tab */}
        <TabsContent value="detection" className="mt-4">
          {org && (
            <DetectionSettings
              orgId={org.id}
              canEdit={canEdit}
              hasPremiumAccess={canAccess("custom_security")}
            />
          )}
        </TabsContent>

        {/* Suggested Rules Tab */}
        <TabsContent value="suggestions" className="mt-4">
          <SuggestedRules canEdit={canEdit} />
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai-tools" className="mt-4">
          <ToolPolicy />
        </TabsContent>
      </Tabs>

      {/* Browse All Packs Modal */}
      <Dialog open={showAllPacks} onOpenChange={setShowAllPacks}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Browse All Compliance Packs
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            {PACK_GROUPS.map((group) => {
              const groupTemplates = group.packIds
                .map((id) => COMPLIANCE_TEMPLATES.find((t) => t.id === id))
                .filter(Boolean) as ComplianceTemplate[];
              if (groupTemplates.length === 0) return null;

              return (
                <div key={group.label}>
                  <div className="mb-2">
                    <p className="text-sm font-semibold">{group.label}</p>
                    <p className="text-xs text-muted-foreground">{group.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupTemplates.map((tpl) => (
                      <CompliancePackCard
                        key={tpl.id}
                        tpl={tpl}
                        rules={rules}
                        installedPacks={installedPacks}
                        installingPack={installingPack}
                        onInstall={canAccess("custom_security") ? handleInstallCompliancePack : () => toast.error("Upgrade to Team or Business to install compliance packs")}
                        onPreview={(t) => { setShowAllPacks(false); setPreviewPack(t); }}
                        requiresUpgrade={!canAccess("custom_security")}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Pack Preview Modal */}
      <Dialog open={!!previewPack} onOpenChange={() => setPreviewPack(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {previewPack?.name}
            </DialogTitle>
          </DialogHeader>
          {previewPack && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground mb-4">{previewPack.description}</p>
              {previewPack.rules.map((rule, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">{rule.description}</p>
                    </div>
                    <Badge
                      variant={rule.severity === "block" ? "destructive" : rule.severity === "redact" ? "outline" : "default"}
                      className="text-[10px] shrink-0"
                    >
                      {rule.severity === "block" ? "Block" : rule.severity === "redact" ? "Redact" : "Warn"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-muted-foreground">Test example — copy &amp; paste into a prompt to test:</p>
                    <div className="relative group">
                      <pre className="text-xs bg-muted rounded-md px-3 py-2 pr-8 whitespace-pre-wrap break-all font-mono">
                        {rule.example}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          navigator.clipboard.writeText(rule.example);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Generate Modal */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Rules with AI
            </DialogTitle>
          </DialogHeader>

          {aiCheckingSetup ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : aiNeedsSetup ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-sm font-semibold">Connect an AI provider</h3>
                <p className="text-sm text-muted-foreground">
                  AI rule generation requires an OpenAI or Anthropic API key. Connect your key in Detection settings to start generating rules with AI.
                </p>
                <Button
                  onClick={() => {
                    setAiModalOpen(false);
                    setActiveTab("detection");
                  }}
                  className="mt-2"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Go to Detection Settings
                </Button>
              </div>
            </div>
          ) : (
          <>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Describe what you want to protect</Label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Block our internal project names: Falcon, Titan, and Aurora. Also catch employee IDs that look like EMP-12345."
                rows={3}
                disabled={aiGenerating}
              />
              <p className="text-[11px] text-muted-foreground">
                Describe in plain English what sensitive data to detect. AI will generate the patterns for you.
              </p>
            </div>

            <Button onClick={handleAiGenerate} disabled={aiGenerating || !aiPrompt.trim()} className="w-full">
              {aiGenerating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><Brain className="mr-2 h-4 w-4" />Generate Rules</>
              )}
            </Button>

            {aiError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
                {aiError}
              </div>
            )}

            {aiRules.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{aiRules.length} rule{aiRules.length !== 1 ? "s" : ""} generated</p>
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      const allSelected = aiRules.every((r) => r._selected);
                      setAiRules((prev) => prev.map((r) => ({ ...r, _selected: !allSelected })));
                    }}
                  >
                    {aiRules.every((r) => r._selected) ? "Deselect all" : "Select all"}
                  </button>
                </div>
                {aiRules.map((rule, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 space-y-1.5 cursor-pointer transition-colors ${
                      rule._selected ? "border-primary/50 bg-primary/5" : "border-border opacity-60"
                    }`}
                    onClick={() => setAiRules((prev) => prev.map((r, j) => j === i ? { ...r, _selected: !r._selected } : r))}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule._selected}
                          onChange={() => {}}
                          className="rounded border-border"
                        />
                        <span className="text-sm font-medium">{rule.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-[10px]">{rule.pattern_type}</Badge>
                        <Badge variant={rule.severity === "block" ? "destructive" : "secondary"} className="text-[10px]">
                          {rule.severity}
                        </Badge>
                      </div>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-muted-foreground pl-6">{rule.description}</p>
                    )}
                    <p className="text-xs font-mono text-muted-foreground pl-6 bg-muted/50 rounded px-2 py-1 break-all">
                      {rule.pattern}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {aiRules.length > 0 && (
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAiModalOpen(false)} disabled={aiSaving}>Cancel</Button>
              <Button
                onClick={handleAiSaveSelected}
                disabled={aiSaving || aiRules.filter((r) => r._selected).length === 0}
              >
                {aiSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <>Create {aiRules.filter((r) => r._selected).length} Rule{aiRules.filter((r) => r._selected).length !== 1 ? "s" : ""}</>
                )}
              </Button>
            </div>
          )}
          </>
          )}
        </DialogContent>
      </Dialog>

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
                    <SelectItem value="keywords">Keywords (simplest)</SelectItem>
                    <SelectItem value="exact">Exact Match</SelectItem>
                    <SelectItem value="regex">Regex (advanced)</SelectItem>
                    <SelectItem value="glob">Glob / Wildcard</SelectItem>
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
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pattern</Label>
              {patternType === "keywords" ? (
                <Textarea
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="password, secret key, api token, internal only"
                  rows={2}
                  className="text-sm"
                />
              ) : (
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder={
                    patternType === "regex"
                      ? "sk_[A-Za-z0-9]{20,}"
                      : patternType === "glob"
                        ? "*.secret.*"
                        : "Enter exact text to match"
                  }
                  className="font-mono text-sm"
                />
              )}
              <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground space-y-1">
                {patternType === "keywords" && (
                  <>
                    <p className="font-medium text-foreground">Type words or phrases separated by commas.</p>
                    <p>Each keyword is matched case-insensitively anywhere in the prompt text. Example: <code className="bg-muted px-1 rounded">project alpha, internal memo, confidential</code></p>
                  </>
                )}
                {patternType === "exact" && (
                  <>
                    <p className="font-medium text-foreground">Matches the exact text you type (case-insensitive).</p>
                    <p>Use for specific strings like company codes or project names.</p>
                  </>
                )}
                {patternType === "regex" && (
                  <>
                    <p className="font-medium text-foreground">Regular expression pattern for advanced matching.</p>
                    <p>Examples: <code className="bg-muted px-1 rounded">sk_[A-Za-z0-9]{"{20,"}</code> (API keys), <code className="bg-muted px-1 rounded">\b\d{"{3}"}-\d{"{2}"}-\d{"{4}"}\b</code> (SSN format), <code className="bg-muted px-1 rounded">[A-Z]{"{2}"}\d{"{6}"}</code> (ID codes)</p>
                  </>
                )}
                {patternType === "glob" && (
                  <>
                    <p className="font-medium text-foreground">Use * as a wildcard to match any text.</p>
                    <p>Examples: <code className="bg-muted px-1 rounded">*password*</code> (contains &ldquo;password&rdquo;), <code className="bg-muted px-1 rounded">PROJ-*</code> (starts with PROJ-)</p>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as SecuritySeverity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Blocked (prevent save)</SelectItem>
                    <SelectItem value="warn">Warning (allow with alert)</SelectItem>
                    <SelectItem value="redact">Redact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={scopeTeamId} onValueChange={setScopeTeamId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (all teams)</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || !pattern.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : editRule ? "Save" : "Create Policy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Lightweight rule suggestion form for non-admin members */
function MemberSuggestRule() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SecurityCategory>("custom");
  const [severity, setSeverity] = useState<SecuritySeverity>("warn");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!name.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please sign in again.");
        return;
      }
      const res = await fetch("/api/guardrails/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), category, severity }),
      });
      if (!res.ok) {
        toast.error("Failed to submit suggestion");
        return;
      }
      toast.success("Rule suggestion submitted for review");
      setName("");
      setDescription("");
      setCategory("custom");
      setSeverity("warn");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle>Suggest a Rule</CardTitle>
            <CardDescription>
              Noticed sensitive data that should be blocked? Suggest a guardrail rule for your admin to review.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-tp-green mb-3" />
            <h3 className="text-sm font-medium">Suggestion submitted</h3>
            <p className="text-xs text-muted-foreground mt-1">Your admin will review it and create the rule if appropriate.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setSubmitted(false)}>
              Suggest another
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label>What should be blocked?</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Internal project codenames" />
            </div>
            <div className="space-y-2">
              <Label>Describe what to look for</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Our project codenames like 'Project Phoenix' and 'Project Atlas' should not be pasted into AI tools"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as SecurityCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_terms">Internal Terms</SelectItem>
                    <SelectItem value="pii">Personal Info (PII)</SelectItem>
                    <SelectItem value="credentials">Credentials</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="custom">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Suggested severity</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as SecuritySeverity)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block (prevent sending)</SelectItem>
                    <SelectItem value="warn">Warn (allow with alert)</SelectItem>
                    <SelectItem value="redact">Redact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={submitting || !name.trim() || !description.trim()}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
