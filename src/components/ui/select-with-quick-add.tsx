"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectWithQuickAddProps {
  value: string;
  onValueChange: (v: string) => void;
  items: { id: string; name: string; color?: string | null }[];
  onQuickCreate: (name: string) => Promise<{ id: string; name: string } | null>;
  placeholder?: string;
  noneLabel?: string;
  noneValue?: string;
  createLabel?: string;
  triggerClassName?: string;
}

export function SelectWithQuickAdd({
  value,
  onValueChange,
  items,
  onQuickCreate,
  placeholder,
  noneLabel = "None",
  noneValue = "__none__",
  createLabel = "item",
  triggerClassName,
}: SelectWithQuickAddProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const result = await onQuickCreate(trimmed);
      if (result) {
        onValueChange(result.id);
        setNewName("");
        setCreating(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Select value={value || noneValue} onValueChange={(v) => onValueChange(v === noneValue ? "" : v)}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder || noneLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={noneValue}>{noneLabel}</SelectItem>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <span className="flex items-center gap-2">
                {item.color && (
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                {item.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {creating ? (
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setCreating(false);
                setNewName("");
              }
            }}
            placeholder={`New ${createLabel} name...`}
            className="h-8 text-sm"
            autoFocus
            disabled={saving}
          />
          {saving && <Loader2 className="h-4 w-4 animate-spin shrink-0 text-muted-foreground" />}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
          Create {createLabel}
        </button>
      )}
    </div>
  );
}
