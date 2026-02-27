"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { APP_VERSION, RELEASE_NOTES, type ReleaseNote } from "@/lib/release-notes";

const LAST_SEEN_KEY = "tp_lastSeenVersion";

export function useHasUnseenRelease() {
  const [unseen, setUnseen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    setUnseen(lastSeen !== APP_VERSION);
  }, []);

  const markSeen = () => {
    localStorage.setItem(LAST_SEEN_KEY, APP_VERSION);
    setUnseen(false);
  };

  return { unseen, markSeen };
}

export function ReleaseNotesList({ onView }: { onView?: () => void }) {
  useEffect(() => {
    onView?.();
  }, [onView]);

  return (
    <div className="space-y-6">
      {RELEASE_NOTES.map((release) => (
        <ReleaseEntry key={release.version} release={release} />
      ))}
    </div>
  );
}

function ReleaseEntry({ release }: { release: ReleaseNote }) {
  return (
    <div className="relative pl-4 border-l-2 border-border">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs font-mono">
          v{release.version}
        </Badge>
        {release.badge && (
          <Badge
            variant={release.badge === "new" ? "default" : "secondary"}
            className="text-[10px] uppercase tracking-wider"
          >
            {release.badge}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{release.date}</span>
      </div>
      <h3 className="text-sm font-semibold mb-2">{release.title}</h3>
      <ul className="space-y-1.5">
        {release.highlights.map((highlight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-1.5 shrink-0 w-1 h-1 rounded-full bg-primary" />
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface WhatsNewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsNewModal({ open, onOpenChange }: WhatsNewModalProps) {
  const { markSeen } = useHasUnseenRelease();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle>What&apos;s New</DialogTitle>
            <Badge variant="outline" className="text-xs font-mono">
              v{APP_VERSION}
            </Badge>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <ReleaseNotesList onView={markSeen} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
