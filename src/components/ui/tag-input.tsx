"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Deduplicate (case-insensitive)
    if (value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setInput("");
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  function handleBlur() {
    if (input.trim()) {
      addTag(input);
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors",
        "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring"
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <Badge key={i} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            className="ml-0.5 rounded-sm hover:bg-muted-foreground/20"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
