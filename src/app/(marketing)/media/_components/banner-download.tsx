"use client";

import { useRef, useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerDownloadWrapperProps {
  children: React.ReactNode;
  filename: string;
  label?: string;
  /** Target download width in pixels. When set, the banner is temporarily
   *  rendered off-screen at this exact width (height from aspectRatio)
   *  so the downloaded PNG matches the intended store dimensions. */
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
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!ref.current || loading) return;
    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      let target: HTMLElement = ref.current;
      let clone: HTMLElement | null = null;

      // If downloadWidth is specified, clone the element off-screen at exact
      // pixel dimensions so the captured PNG is store-ready.
      if (downloadWidth) {
        clone = ref.current.cloneNode(true) as HTMLElement;
        clone.style.position = "fixed";
        clone.style.left = "-9999px";
        clone.style.top = "0";
        clone.style.width = `${downloadWidth}px`;
        clone.style.minWidth = `${downloadWidth}px`;
        clone.style.maxWidth = `${downloadWidth}px`;
        clone.style.overflow = "visible";
        document.body.appendChild(clone);
        // Let layout settle
        await new Promise((r) => setTimeout(r, 100));
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
      <div ref={ref} className="rounded-xl border border-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}
