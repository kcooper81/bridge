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

/** Fetch an image URL and return a data: URI (bypasses SVG foreignObject CORS) */
async function toDataUri(url: string): Promise<string> {
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
 * Uses html-to-image (foreignObject SVG) for pixel-perfect CSS fidelity
 * — supports backdrop-filter, aspect-ratio, gradients, inline SVG, etc.
 * External images are pre-converted to data URIs to avoid CORS issues
 * inside the SVG foreignObject context.
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

    const node = captureRef.current;
    const originals = new Map<
      HTMLImageElement,
      { src: string; srcset: string }
    >();
    let shell: HTMLElement | null = null;
    let savedBr = "";
    let savedOf = "";

    try {
      const { toPng } = await import("html-to-image");

      // ── 1. Pre-convert external images to data URIs ──
      // html-to-image serialises the DOM into an SVG foreignObject.
      // Browsers enforce strict CORS inside foreignObject — even images
      // with Access-Control-Allow-Origin:* can taint the canvas.
      // Converting to data URIs BEFORE capture avoids the issue entirely.
      const imgs = node.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(async (img) => {
          const src = img.currentSrc || img.src;
          if (
            src &&
            /^https?:\/\//.test(src) &&
            !src.startsWith(window.location.origin)
          ) {
            try {
              originals.set(img, { src: img.src, srcset: img.srcset });
              img.src = await toDataUri(src);
              img.srcset = "";
            } catch {
              /* leave original if fetch fails */
            }
          }
        })
      );

      // ── 2. Strip rounded corners on the banner shell for clean edges ──
      shell = node.firstElementChild as HTMLElement | null;
      if (shell) {
        savedBr = shell.style.borderRadius;
        savedOf = shell.style.overflow;
        shell.style.borderRadius = "0";
        shell.style.overflow = "visible";
      }

      // ── 3. Capture ──
      const ratio = downloadWidth ? downloadWidth / node.offsetWidth : 2;

      const dataUrl = await toPng(node, {
        pixelRatio: ratio,
        cacheBust: true,
      });

      // ── 4. Trigger download ──
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      a.click();
    } catch (err) {
      console.error("Banner download failed:", err);
    } finally {
      // ── Always restore DOM state ──
      if (shell) {
        shell.style.borderRadius = savedBr;
        shell.style.overflow = savedOf;
      }
      originals.forEach(({ src, srcset }, img) => {
        img.src = src;
        img.srcset = srcset;
      });
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
