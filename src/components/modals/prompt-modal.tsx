"use client";

import { useState, useEffect } from "react";
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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { TONE_OPTIONS } from "@/lib/constants";
import { useOrg } from "@/components/providers/org-provider";
import {
  createPrompt,
  updatePrompt,
  validatePrompt,
  getPromptVersions,
} from "@/lib/vault-api";
import type { Prompt, PromptVersion, ValidationResult } from "@/lib/types";
import { toast } from "sonner";

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
  const { folders, departments, standards } = useOrg();
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);

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
  const [departmentId, setDepartmentId] = useState<string>("");

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
      setDepartmentId(prompt.department_id || "");
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
      setDepartmentId("");
      setVersions([]);
    }
    setValidation(null);
  }, [prompt, open]);

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
      department_id: departmentId || null,
    };
    const result = validatePrompt(fields, standards);
    setValidation(result);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);
    try {
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
        department_id: departmentId || null,
      };

      if (prompt) {
        await updatePrompt(prompt.id, fields);
        toast.success("Prompt updated");
      } else {
        await createPrompt(fields);
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
              <Label htmlFor="content">Content *</Label>
              <span className="text-xs text-muted-foreground">
                {content.length} chars
              </span>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your prompt content..."
              rows={6}
            />
          </div>

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
              <Select value={folderId || "__none__"} onValueChange={(v) => setFolderId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="No folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No folder</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId || "__none__"} onValueChange={(v) => setDepartmentId(v === "__none__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="No department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No department</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  All standards passed
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <XCircle className="h-4 w-4" />
                    {validation.violations.length} violation(s)
                  </div>
                  {validation.violations.map((v, i) => (
                    <p key={i} className="ml-6">
                      {v.standard}: {v.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <div className="space-y-2">
              <Label>Version History</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between text-sm rounded-md bg-muted px-3 py-2"
                  >
                    <span>
                      v{v.version} — {v.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTitle(v.title);
                        setContent(v.content);
                      }}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
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
