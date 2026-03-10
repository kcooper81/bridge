"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock, Sun, Calendar } from "lucide-react";
import { useState } from "react";

interface SnoozePopoverProps {
  onSnooze: (until: string) => void;
  children: React.ReactNode;
}

function getSnoozeTime(option: string): string {
  const now = new Date();
  switch (option) {
    case "30m":
      return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case "3h":
      return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
    case "tomorrow": {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow.toISOString();
    }
    case "nextweek": {
      const nextMon = new Date(now);
      nextMon.setDate(nextMon.getDate() + ((8 - nextMon.getDay()) % 7 || 7));
      nextMon.setHours(9, 0, 0, 0);
      return nextMon.toISOString();
    }
    default:
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  }
}

export function SnoozePopover({ onSnooze, children }: SnoozePopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSnooze = (option: string) => {
    onSnooze(getSnoozeTime(option));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end" side="bottom">
        <div className="space-y-0.5">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Snooze until
          </p>
          {[
            { key: "30m", label: "30 minutes", icon: Clock },
            { key: "1h", label: "1 hour", icon: Clock },
            { key: "3h", label: "3 hours", icon: Clock },
            { key: "tomorrow", label: "Tomorrow 9 AM", icon: Sun },
            { key: "nextweek", label: "Next Monday 9 AM", icon: Calendar },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-7 text-xs gap-2"
              onClick={() => handleSnooze(key)}
            >
              <Icon className="h-3 w-3 text-muted-foreground" />
              {label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
