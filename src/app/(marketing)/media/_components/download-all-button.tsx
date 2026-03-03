"use client";

import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadAllButtonProps {
  files: { url: string; filename: string }[];
  zipName: string;
  label?: string;
  dark?: boolean;
}

/**
 * Client-side "Download All" button that fetches every file,
 * bundles them into a ZIP using JSZip, and triggers a download.
 */
export function DownloadAllButton({
  files,
  zipName,
  label = "Download All",
  dark = false,
}: DownloadAllButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownloadAll = useCallback(async () => {
    if (loading || files.length === 0) return;
    setLoading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const results = await Promise.allSettled(
        files.map(async (f) => {
          const res = await fetch(f.url);
          if (!res.ok) throw new Error(`Failed to fetch ${f.url}`);
          const blob = await res.blob();
          zip.file(f.filename, blob);
        })
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        console.warn(`${failed} file(s) failed to fetch for zip`);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download all failed:", err);
    } finally {
      setLoading(false);
    }
  }, [files, zipName, loading]);

  return (
    <Button
      variant="outline"
      size="sm"
      className={
        dark
          ? "gap-1.5 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          : "gap-1.5"
      }
      onClick={handleDownloadAll}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {loading ? "Zipping…" : label}
      <span className={`text-[10px] ${dark ? "text-zinc-500" : "text-muted-foreground"}`}>
        ({files.length} files)
      </span>
    </Button>
  );
}
