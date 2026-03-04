"use client";

import { useRef, useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerDownloadWrapperProps {
  children: React.ReactNode;
  filename: string;
  label?: string;
  /** Target download width in pixels. When set, the banner content is
   *  cloned off-screen at this exact width (height derived from aspectRatio)
   *  and captured without borders or rounded corners so the downloaded PNG
   *  is pixel-perfect for store uploads. */
  downloadWidth?: number;
}

/**
 * Wraps a CSS-rendered banner and provides a "Download PNG" button
 * that captures the rendered DOM as a PNG using html2canvas.
 */
export function BannerDownloadWrapper({
  children,
  filename,
  label = "PNG",
  downloadWidth,
}: BannerDownloadWrapperProps) {
  // captureRef wraps ONLY the banner content (no border/rounding)
  const captureRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || loading) return;
    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      let target: HTMLElement = captureRef.current;
      let clone: HTMLElement | null = null;

      if (downloadWidth) {
        // Clone just the banner content off-screen at exact pixel width.
        // aspectRatio on the inner banner component determines the height.
        clone = captureRef.current.cloneNode(true) as HTMLElement;
        clone.style.position = "fixed";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.width = `${downloadWidth}px`;
        clone.style.minWidth = `${downloadWidth}px`;
        clone.style.maxWidth = `${downloadWidth}px`;
        clone.style.border = "none";
        clone.style.borderRadius = "0";
        clone.style.overflow = "visible";
        document.body.appendChild(clone);
        // Only strip rounded corners + overflow from the outermost banner
        // shell (first child) so the PNG has rectangular edges, but keep
        // internal element styling (rounded photos, badges, pills) intact.
        const bannerShell = clone.firstElementChild as HTMLElement | null;
        if (bannerShell) {
          bannerShell.style.borderRadius = "0";
          bannerShell.style.overflow = "visible";
        }
        // Let layout settle
        await new Promise((r) => setTimeout(r, 150));
        target = clone;
      }

      const canvas = await html2canvas(target, {
        scale: downloadWidth ? 1 : 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      if (clone) {
        document.body.removeChild(clone);
      }

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      a.click();
    } catch (err) {
      console.error("Banner download failed:", err);
    } finally {
      setLoading(false);
    }
  }, [filename, loading, downloadWidth]);

  return (
    <div>
      <div className="flex items-center justify-end mb-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          {label}
        </Button>
      </div>
      {/* Outer div: decorative border for preview on /media page */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* Inner div: capture target — no border, no rounding in the download */}
        <div ref={captureRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
