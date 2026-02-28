"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { useOrg } from "@/components/providers/org-provider";
import { ManageCategoriesModal } from "@/components/dashboard/manage-categories-modal";

export function FolderManager() {
  const { folders, currentUserRole } = useOrg();
  const [open, setOpen] = useState(false);

  const canManage = currentUserRole === "admin" || currentUserRole === "manager";
  if (!canManage) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <FolderOpen className="h-4 w-4" />
        Manage Categories ({folders.length})
      </Button>
      <ManageCategoriesModal open={open} onOpenChange={setOpen} />
    </>
  );
}
