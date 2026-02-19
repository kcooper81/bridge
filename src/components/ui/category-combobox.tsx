"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Pen,
  Code2,
  Palette,
  Headphones,
  Megaphone,
  Briefcase,
  Users,
  Scale,
  Crown,
  BarChart3,
  Package,
  FlaskConical,
  GraduationCap,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { GUIDELINE_CATEGORIES } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  writing: Pen,
  development: Code2,
  design: Palette,
  support: Headphones,
  marketing: Megaphone,
  sales: Briefcase,
  hr: Users,
  legal: Scale,
  executive: Crown,
  analytics: BarChart3,
  product: Package,
  research: FlaskConical,
  education: GraduationCap,
  internal: Building2,
};

interface CategoryComboboxProps {
  value: string;
  onChange: (category: string) => void;
}

export function CategoryCombobox({ value, onChange }: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedLabel =
    GUIDELINE_CATEGORIES.find((c) => c.value === value)?.label || value || "";

  const hasExactMatch = GUIDELINE_CATEGORIES.some(
    (c) =>
      c.label.toLowerCase() === search.toLowerCase() ||
      c.value.toLowerCase() === search.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedLabel || (
            <span className="text-muted-foreground">Select category...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search categories..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty className="p-0" />
            <CommandGroup>
              {GUIDELINE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.value];
                return (
                  <CommandItem
                    key={cat.value}
                    value={cat.label}
                    onSelect={() => {
                      onChange(cat.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    {cat.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === cat.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
              {search.trim() && !hasExactMatch && (
                <CommandItem
                  value={`custom-${search}`}
                  onSelect={() => {
                    onChange(search.trim());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  Use &ldquo;{search.trim()}&rdquo; as custom category
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
