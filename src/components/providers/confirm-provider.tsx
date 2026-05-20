"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Variant = "default" | "destructive";

interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}

type Confirm = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<Confirm | null>(null);

interface QueueItem extends ConfirmOptions {
  resolve: (v: boolean) => void;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = React.useState<QueueItem | null>(null);

  const confirm = React.useCallback<Confirm>((opts) => {
    return new Promise<boolean>((resolve) => {
      setItem({ ...opts, resolve });
    });
  }, []);

  const handleResolve = (value: boolean) => {
    if (!item) return;
    item.resolve(value);
    setItem(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={item !== null}
        onOpenChange={(o) => {
          if (!o) handleResolve(false);
        }}
        title={item?.title || ""}
        description={item?.description}
        confirmLabel={item?.confirmLabel}
        cancelLabel={item?.cancelLabel}
        variant={item?.variant}
        onConfirm={() => handleResolve(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return ctx;
}
