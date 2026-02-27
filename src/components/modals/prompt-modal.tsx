"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectWithQuickAdd } from "@/components/ui/select-with-quick-add";
import { Loader2, CheckCircle2, XCircle, Braces, ShieldAlert, ChevronDown, ChevronUp, Plus, GitCompare } from "lucide-react";
import { TONE_OPTIONS } from "@/lib/constants";
import { useOrg } from "@/components/providers/org-provider";
import {
  createPrompt,
  updatePrompt,
  validatePrompt,
  getPromptVersions,
  getDefaultStatus,
  saveFolderApi,
  saveTeamApi,
} from "@/lib/vault-api";
import { createClient } from "@/lib/supabase/client";
import { scanContent } from "@/lib/security/scanner";
import {
  extractTemplateVariables,
  normalizeVariables,
  mergeVariablesWithMetadata,
  getDisplayLabel,
} from "@/lib/variables";
import type { Prompt, PromptStatus, PromptVersion, SecurityRule, ValidationResult, VariableConfig } from "@/lib/types";
import type { ScanResult } from "@/lib/security/types";
import { toast } from "sonner";
import { trackPromptCreated, trackGuardrailViolation } from "@/lib/analytics";
import { computeLineDiff, type DiffLine } from "@/lib/diff";
import { formatDistanceToNow } from "date-fns";

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt | null;
  onSaved: () => void;
}

export function PromptModal({
  open,
  onOpenChange,
  prompt,
  onSaved,
}: PromptModalProps) {
  const { folders, teams, guidelines, org, currentUserRole, setFolders, setTeams } = useOrg();
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [diffVersion, setDiffVersion] = useState<PromptVersion | null>(null);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [intendedOutcome, setIntendedOutcome] = useState("");
  const [tone, setTone] = useState("professional");
  const [modelRecommendation, setModelRecommendation] = useState("");
  const [exampleInput, setExampleInput] = useState("");
  const [exampleOutput, setExampleOutput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");
  const [status, setStatus] = useState<PromptStatus>(() =>
    getDefaultStatus(currentUserRole)
  );

  // Variable config state
  const [variableConfigs, setVariableConfigs] = useState<VariableConfig[]>([]);
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());
  const [insertVarName, setInsertVarName] = useState("");
  const [insertPopoverOpen, setInsertPopoverOpen] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const canApprove = currentUserRole === "admin" || currentUserRole === "manager";

  // Auto-detect variables whenever content changes
  const detectedNames = useMemo(() => extractTemplateVariables(content), [content]);

  useEffect(() => {
    setVariableConfigs((prev) => mergeVariablesWithMetadata(detectedNames, prev));
  }, [detectedNames]);

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setDescription(prompt.description || "");
      setIntendedOutcome(prompt.intended_outcome || "");
      setTone(prompt.tone || "professional");
      setModelRecommendation(prompt.model_recommendation || "");
      setExampleInput(prompt.example_input || "");
      setExampleOutput(prompt.example_output || "");
      setTagsInput((prompt.tags || []).join(", "));
      setFolderId(prompt.folder_id || "");
      setTeamId(prompt.department_id || "");
      setStatus(prompt.status || "approved");
      setVariableConfigs(normalizeVariables(prompt.template_variables));
      getPromptVersions(prompt.id).then(setVersions);
    } else {
      setTitle("");
      setContent("");
      setDescription("");
      setIntendedOutcome("");
      setTone("professional");
      setModelRecommendation("");
      setExampleInput("");
      setExampleOutput("");
      setTagsInput("");
      setFolderId("");
      setTeamId("");
      setStatus(getDefaultStatus(currentUserRole));
      setVersions([]);
      setVariableConfigs([]);
    }
    setValidation(null);
    setScanResult(null);
    setExpandedVars(new Set());
    setDiffVersion(null);
    setDiffLines([]);
  }, [prompt, open]);

  function insertVariable(name: string) {
    const textarea = contentRef.current;
    if (!textarea) return;
    const token = `{{${name}}}`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + token + content.slice(end);
    setContent(newContent);
    setInsertVarName("");
    setInsertPopoverOpen(false);
    // Restore focus and cursor position after the inserted token
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + token.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  function handleInsertSubmit() {
    const name = insertVarName.trim().replace(/\s+/g, "_").toLowerCase();
    if (!name) return;
    insertVariable(name);
  }

  function updateVariableConfig(name: string, patch: Partial<VariableConfig>) {
    setVariableConfigs((prev) =>
      prev.map((v) => (v.name === name ? { ...v, ...patch } : v))
    );
  }

  function toggleExpanded(name: string) {
    setExpandedVars((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleCompare(version: PromptVersion) {
    if (diffVersion?.id === version.id) {
      // Toggle off
      setDiffVersion(null);
      setDiffLines([]);
      return;
    }
    const lines = computeLineDiff(version.content, content);
    setDiffVersion(version);
    setDiffLines(lines);
  }

  function handleValidate() {
    const fields = {
      title,
      content,
      description,
      intended_outcome: intendedOutcome,
      tone: tone as Prompt["tone"],
      model_recommendation: modelRecommendation,
      example_input: exampleInput,
      example_output: exampleOutput,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      folder_id: folderId || null,
      department_id: teamId || null,
    };
    const result = validatePrompt(fields, guidelines);
    setValidation(result);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      // Run DLP scan on content before saving
      if (org) {
        const db = createClient();
        const { data: rules } = await db
          .from("security_rules")
          .select("*")
          .eq("org_id", org.id)
          .eq("is_active", true);

        if (rules && rules.length > 0) {
          const scan = scanContent(content, rules as SecurityRule[]);
          setScanResult(scan);
          if (!scan.passed) {
            trackGuardrailViolation("block");
            toast.error("Content blocked by security guardrails. Remove sensitive data before saving.");
            setSaving(false);
            return;
          }
        }
      }

      const hasVariables = detectedNames.length > 0;
      const fields = {
        title: title.trim(),
        content: content.trim(),
        description: description.trim() || null,
        intended_outcome: intendedOutcome.trim() || null,
        tone: tone as Prompt["tone"],
        model_recommendation: modelRecommendation.trim() || null,
        example_input: exampleInput.trim() || null,
        example_output: exampleOutput.trim() || null,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        folder_id: folderId || null,
        department_id: teamId || null,
        is_template: hasVariables,
        template_variables: variableConfigs,
        status: getDefaultStatus(currentUserRole, status),
      };

      if (prompt) {
        await updatePrompt(prompt.id, fields as Partial<Prompt>);
        toast.success("Prompt updated");
      } else {
        await createPrompt(fields);
        trackPromptCreated();
        toast.success("Prompt created");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save prompt");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prompt ? "Edit Prompt" : "New Prompt"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your prompt a clear title"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="content">Content *</Label>
                <Popover open={insertPopoverOpen} onOpenChange={setInsertPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-primary"
                    >
                      <Braces className="h-3.5 w-3.5" />
                      Insert Variable
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">New variable</Label>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleInsertSubmit();
                          }}
                          className="flex gap-1.5"
                        >
                          <Input
                            value={insertVarName}
                            onChange={(e) => setInsertVarName(e.target.value)}
                            placeholder="variable_name"
                            className="h-8 text-xs font-mono"
                          />
                          <Button type="submit" size="sm" className="h-8 px-2.5 shrink-0">
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </form>
                      </div>
                      {detectedNames.length > 0 && (
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Existing variables</Label>
                          <div className="flex flex-wrap gap-1">
                            {detectedNames.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => insertVariable(name)}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-mono hover:bg-primary/20 transition-colors"
                              >
                                <Braces className="h-3 w-3" />
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <span className="text-xs text-muted-foreground">
                {content.length} chars
              </span>
            </div>
            <Textarea
              ref={contentRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your prompt content... Use {{variable_name}} for fill-in fields"
              rows={6}
            />
          </div>

          {/* Variable Config Editor */}
          {variableConfigs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Braces className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">
                  Template Variables ({variableConfigs.length})
                </Label>
              </div>
              <div className="space-y-2">
                {variableConfigs.map((v) => {
                  const isExpanded = expandedVars.has(v.name);
                  return (
                    <div
                      key={v.name}
                      className="rounded-lg border border-border bg-muted/30 overflow-hidden"
                    >
                      {/* Compact header */}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(v.name)}
                        className="flex items-center justify-between w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <code className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                            {`{{${v.name}}}`}
                          </code>
                          <span className="text-sm text-muted-foreground truncate">
                            {getDisplayLabel(v)}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </button>

                      {/* Expanded editor */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2 border-t border-border">
                          <div className="pt-2 space-y-1">
                            <Label className="text-xs text-muted-foreground">Display Label</Label>
                            <Input
                              value={v.label || ""}
                              onChange={(e) => updateVariableConfig(v.name, { label: e.target.value || null })}
                              placeholder={getDisplayLabel({ name: v.name })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <Input
                              value={v.description || ""}
                              onChange={(e) => updateVariableConfig(v.name, { description: e.target.value || null })}
                              placeholder="Shown as hint text when filling in"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Default Value</Label>
                            <Input
                              value={v.defaultValue || ""}
                              onChange={(e) => updateVariableConfig(v.name, { defaultValue: e.target.value || null })}
                              placeholder="Pre-filled when users fill this template"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this prompt do?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Folder</Label>
              <SelectWithQuickAdd
                value={folderId}
                onValueChange={setFolderId}
                items={folders.map((f) => ({ id: f.id, name: f.name }))}
                onQuickCreate={async (name) => {
                  const folder = await saveFolderApi({ name });
                  if (folder) {
                    setFolders((prev) => [folder, ...prev]);
                    return { id: folder.id, name: folder.name };
                  }
                  return null;
                }}
                noneLabel="No folder"
                createLabel="folder"
              />
            </div>

            <div className="space-y-2">
              <Label>Team</Label>
              <SelectWithQuickAdd
                value={teamId}
                onValueChange={setTeamId}
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as PromptStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  {canApprove && (
                    <SelectItem value="approved">Approved</SelectItem>
                  )}
                  {canApprove && (
                    <SelectItem value="archived">Archived</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model Recommendation</Label>
              <Input
                id="model"
                value={modelRecommendation}
                onChange={(e) => setModelRecommendation(e.target.value)}
                placeholder="e.g., GPT-4, Claude"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="marketing, email, outreach"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendedOutcome">Intended Outcome</Label>
            <Textarea
              id="intendedOutcome"
              value={intendedOutcome}
              onChange={(e) => setIntendedOutcome(e.target.value)}
              placeholder="What result should this prompt produce?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exampleInput">Example Input</Label>
              <Textarea
                id="exampleInput"
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exampleOutput">Example Output</Label>
              <Textarea
                id="exampleOutput"
                value={exampleOutput}
                onChange={(e) => setExampleOutput(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Validation */}
          {validation && (
            <div
              className={`rounded-lg p-3 text-sm ${
                validation.passed
                  ? "bg-tp-green/10 text-tp-green"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {validation.passed ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  All guidelines passed
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <XCircle className="h-4 w-4" />
                    {validation.violations.length} violation(s)
                  </div>
                  {validation.violations.map((v, i) => (
                    <p key={i} className="ml-6">
                      {v.guideline}: {v.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Scan Result */}
          {scanResult && !scanResult.passed && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-destructive mb-1">
                <ShieldAlert className="h-4 w-4" />
                Security scan blocked — {scanResult.violations.length} issue(s)
              </div>
              {scanResult.violations.map((v, i) => (
                <p key={i} className="ml-6 text-destructive">
                  {v.rule.name}: matched &quot;{v.matchedText}&quot;
                </p>
              ))}
            </div>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <div className="space-y-2">
              <Label>Version History</Label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {versions.map((v) => (
                  <div key={v.id}>
                    <div
                      className={`flex items-center justify-between text-sm rounded-md px-3 py-2 ${
                        diffVersion?.id === v.id ? "bg-primary/10 border border-primary/30" : "bg-muted"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-medium">v{v.version}</span>
                        <span className="text-muted-foreground"> — {v.title}</span>
                        {(v.changed_by_name || v.created_at) && (
                          <span className="text-xs text-muted-foreground ml-1.5">
                            {v.changed_by_name && `by ${v.changed_by_name}`}
                            {v.created_at && ` · ${formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}`}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleCompare(v)}
                        >
                          <GitCompare className="h-3 w-3" />
                          {diffVersion?.id === v.id ? "Hide" : "Compare"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setTitle(v.title);
                            setContent(v.content);
                            setDiffVersion(null);
                            setDiffLines([]);
                          }}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diff View */}
              {diffVersion && diffLines.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="px-3 py-2 bg-muted text-xs text-muted-foreground border-b border-border">
                    Comparing v{diffVersion.version} → current
                    {diffVersion.changed_by_name && ` · changed by ${diffVersion.changed_by_name}`}
                  </div>
                  <div className="max-h-64 overflow-y-auto font-mono text-xs leading-relaxed">
                    {diffLines.map((line, i) => (
                      <div
                        key={i}
                        className={`px-3 py-0.5 whitespace-pre-wrap break-all ${
                          line.type === "added"
                            ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300"
                            : line.type === "removed"
                              ? "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                              : "text-muted-foreground"
                        }`}
                      >
                        <span className="select-none inline-block w-5 text-right mr-2 opacity-50">
                          {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                        </span>
                        {line.line || "\u00A0"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={handleValidate}>
            Validate
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {prompt ? "Save Changes" : "Create Prompt"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
