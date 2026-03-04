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
 * Wraps a CSS-rendered banner and provides a "Download PNG" button.
 * Uses html-to-image (foreignObject approach) for pixel-perfect capture
 * that preserves the browser's own CSS rendering — fonts, gradients,
 * aspect-ratio, backdrop-blur, and SVG icons all render correctly.
 */
export function BannerDownloadWrapper({
  children,
  filename,
  label = "PNG",
  downloadWidth,
}: BannerDownloadWrapperProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || loading) return;
    setLoading(true);
    try {
      const { toPng } = await import("html-to-image");

      // Ensure web fonts are fully loaded before capture
      await document.fonts.ready;

      let target: HTMLElement = captureRef.current;
      let clone: HTMLElement | null = null;

      if (downloadWidth) {
        // Clone the banner off-screen at the exact target pixel width.
        // The CSS aspect-ratio on the banner shell determines the height.
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

        // Strip decorative rounding from the banner shell for clean edges
        const bannerShell = clone.firstElementChild as HTMLElement | null;
        if (bannerShell) {
          bannerShell.style.borderRadius = "0";
          bannerShell.style.overflow = "hidden";
        }

        // Wait for all images in the clone to load
        const images = clone.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                })
          )
        );

        // Let layout settle
        await new Promise((r) => setTimeout(r, 300));
        target = clone;
      }

      const dataUrl = await toPng(target, {
        pixelRatio: downloadWidth ? 1 : 2,
        cacheBust: true,
        fetchRequestInit: { mode: "cors" },
      });

      if (clone) {
        document.body.removeChild(clone);
      }

      const a = document.createElement("a");
      a.href = dataUrl;
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
