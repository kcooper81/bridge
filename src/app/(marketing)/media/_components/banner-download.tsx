"use client";

import { useRef, useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannerDownloadWrapperProps {
  children: React.ReactNode;
  filename: string;
  label?: string;
  /** Target download width in pixels. The rendered banner is scaled so
   *  the output PNG has exactly this width (height follows aspect-ratio). */
  downloadWidth?: number;
}

/** Fetch an image URL and return a data: URI */
async function fetchAsDataUri(url: string): Promise<string> {
  const res = await fetch(url, { mode: "cors" });
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Wraps a CSS-rendered banner and provides a "Download PNG" button.
 *
 * Uses html-to-image (foreignObject SVG) with an off-screen clone so:
 * 1. The live DOM is never modified (no flicker)
 * 2. External images are converted to data URIs in the clone (no CORS)
 * 3. backdrop-filter elements get solid fallback backgrounds
 * 4. Explicit dimensions replace CSS aspect-ratio for reliable sizing
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
      const node = captureRef.current;
      const rect = node.getBoundingClientRect();

      // ── 1. Pre-fetch external images as data URIs ──
      const imageCache = new Map<string, string>();
      const liveImgs = node.querySelectorAll("img");
      await Promise.all(
        Array.from(liveImgs).map(async (img) => {
          const src = img.currentSrc || img.src;
          if (
            src &&
            /^https?:\/\//.test(src) &&
            !src.startsWith(window.location.origin)
          ) {
            try {
              if (!imageCache.has(src)) {
                imageCache.set(src, await fetchAsDataUri(src));
              }
            } catch {
              /* skip if fetch fails */
            }
          }
        })
      );

      // ── 2. Create off-screen clone (no live DOM changes) ──
      const clone = node.cloneNode(true) as HTMLElement;
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;

      // Strip border-radius on banner shell for clean rectangular output
      const shell = clone.firstElementChild as HTMLElement | null;
      if (shell) {
        shell.style.borderRadius = "0";
        shell.style.overflow = "visible";
      }

      document.body.appendChild(clone);

      // ── 3. Replace external images with data URIs in clone ──
      clone.querySelectorAll("img").forEach((img) => {
        const src = img.src;
        // Match against cache (try both raw src and decoded)
        const dataUri = imageCache.get(src) || imageCache.get(decodeURI(src));
        if (dataUri) {
          img.src = dataUri;
          img.srcset = "";
        }
      });

      // ── 4. Fix CSS effects that don't render in foreignObject SVG ──
      clone.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const cs = window.getComputedStyle(htmlEl);

        // backdrop-filter doesn't work inside SVG foreignObject
        if (cs.backdropFilter && cs.backdropFilter !== "none") {
          htmlEl.style.backdropFilter = "none";
          htmlEl.style.setProperty("-webkit-backdrop-filter", "none");
          // Replace translucent bg with near-opaque white
          htmlEl.style.backgroundColor = "rgba(255,255,255,0.97)";
        }

        // CSS filter:blur() on ambient glow divs can clip weirdly —
        // replace with a softer opacity-only effect
        if (cs.filter && cs.filter.includes("blur")) {
          htmlEl.style.filter = "none";
          htmlEl.style.opacity = "0.3";
        }
      });

      // Let layout settle
      await new Promise((r) => setTimeout(r, 150));

      // ── 5. Capture ──
      const ratio = downloadWidth ? downloadWidth / rect.width : 2;
      const dataUrl = await toPng(clone, {
        pixelRatio: ratio,
        cacheBust: true,
      });

      // ── 6. Cleanup ──
      document.body.removeChild(clone);

      // ── 7. Trigger download ──
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
        <div ref={captureRef}>{children}</div>
      </div>
    </div>
  );
}
