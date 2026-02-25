"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Braces, Copy, FileText } from "lucide-react";
import { normalizeVariables, getDisplayLabel, fillTemplate } from "@/lib/variables";
import type { Prompt } from "@/lib/types";
import { toast } from "sonner";
import { trackPromptUsed } from "@/lib/analytics";
import { recordUsage } from "@/lib/vault-api";

interface FillTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt | null;
}

export function FillTemplateModal({
  open,
  onOpenChange,
  prompt,
}: FillTemplateModalProps) {
  const variables = useMemo(
    () => (prompt ? normalizeVariables(prompt.template_variables) : []),
    [prompt]
  );

  // Initialize values from defaults
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!prompt) return;
    const initial: Record<string, string> = {};
    for (const v of normalizeVariables(prompt.template_variables)) {
      initial[v.name] = v.defaultValue || "";
    }
    setValues(initial);
  }, [prompt]);

  const preview = useMemo(() => {
    if (!prompt) return "";
    return fillTemplate(prompt.content, values);
  }, [prompt, values]);

  function updateValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCopyFilled() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(preview);
      toast.success("Copied filled prompt to clipboard");
      trackPromptUsed("copy");
      recordUsage(prompt.id).catch(() => {});
      onOpenChange(false);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  async function handleCopyRaw() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success("Copied raw template to clipboard");
      trackPromptUsed("copy");
      recordUsage(prompt.id).catch(() => {});
      onOpenChange(false);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Braces className="h-5 w-5 text-primary" />
            Fill Template: {prompt.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Variable inputs */}
          <div className="space-y-3">
            {variables.map((v) => (
              <div key={v.name} className="space-y-1">
                <Label className="text-sm font-medium">
                  {getDisplayLabel(v)}
                </Label>
                {v.description && (
                  <p className="text-xs text-muted-foreground">{v.description}</p>
                )}
                <Input
                  value={values[v.name] || ""}
                  onChange={(e) => updateValue(v.name, e.target.value)}
                  placeholder={v.description || `Enter ${getDisplayLabel(v).toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Preview</Label>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {preview}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleCopyRaw}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Copy Raw Template
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyFilled}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Filled Prompt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
