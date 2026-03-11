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
 * Uses html-to-image (foreignObject SVG) for pixel-perfect CSS fidelity.
 * Before capture, the live DOM is temporarily patched:
 * - External images → data URIs (avoids CORS in foreignObject)
 * - backdrop-filter → solid white bg (not supported in foreignObject)
 * - filter:blur() → opacity fallback (avoids clipping artifacts)
 * All patches are reverted immediately after capture.
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
    const savedImgs = new Map<
      HTMLImageElement,
      { src: string; srcset: string }
    >();
    const savedStyles = new Map<HTMLElement, Record<string, string>>();
    const savedSvgs = new Map<Element, { parent: Node; nextSibling: Node | null; svg: SVGSVGElement }>();

    /** Save an element's current inline style values before patching */
    function saveStyle(el: HTMLElement, props: string[]) {
      const existing = savedStyles.get(el) || {};
      for (const p of props) {
        if (!(p in existing)) {
          existing[p] = (el.style as unknown as Record<string, string>)[p] || "";
        }
      }
      savedStyles.set(el, existing);
    }

    try {
      const { toPng } = await import("html-to-image");

      // ── 1. Convert ALL images to data URIs ──
      // foreignObject SVG can't resolve local or external URLs reliably,
      // so every <img> with a non-data src is inlined.
      const imgs = node.querySelectorAll("img");
      await Promise.all(
        Array.from(imgs).map(async (img) => {
          const src = img.currentSrc || img.src;
          if (src && !src.startsWith("data:")) {
            try {
              savedImgs.set(img, { src: img.src, srcset: img.srcset });
              img.src = await fetchAsDataUri(src);
              img.srcset = "";
            } catch {
              /* leave original */
            }
          }
        })
      );

      // ── 1b. Convert inline <svg> elements to data-URI <img> ──
      // SVG inside foreignObject inside SVG can fail to serialize.
      const svgs = Array.from(node.querySelectorAll("svg"));
      for (const svg of svgs) {
        try {
          const parent = svg.parentNode;
          if (!parent) continue;
          const serialized = new XMLSerializer().serializeToString(svg);
          const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
          const img = document.createElement("img");
          img.src = dataUri;
          img.style.width = svg.getBoundingClientRect().width + "px";
          img.style.height = svg.getBoundingClientRect().height + "px";
          img.style.display = window.getComputedStyle(svg).display === "none" ? "none" : "inline-block";
          img.style.flexShrink = "0";
          const nextSibling = svg.nextSibling;
          savedSvgs.set(img, { parent, nextSibling, svg: svg as SVGSVGElement });
          parent.replaceChild(img, svg);
        } catch {
          /* leave original */
        }
      }

      // ── 2. Strip rounded corners on banner shell ──
      const shell = node.firstElementChild as HTMLElement | null;
      if (shell) {
        saveStyle(shell, ["borderRadius", "overflow"]);
        shell.style.borderRadius = "0";
        shell.style.overflow = "visible";
      }

      // ── 3. Patch CSS effects that don't render in foreignObject ──
      node.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const cs = window.getComputedStyle(htmlEl);

        // backdrop-filter: not supported in SVG foreignObject
        if (cs.backdropFilter && cs.backdropFilter !== "none") {
          saveStyle(htmlEl, ["backdropFilter", "WebkitBackdropFilter", "backgroundColor"]);
          htmlEl.style.backdropFilter = "none";
          htmlEl.style.setProperty("-webkit-backdrop-filter", "none");
          htmlEl.style.backgroundColor = "rgba(255,255,255,0.97)";
        }

        // filter:blur() on glow divs can clip or produce hard edges
        if (cs.filter && cs.filter.includes("blur")) {
          saveStyle(htmlEl, ["filter", "opacity"]);
          htmlEl.style.filter = "none";
          htmlEl.style.opacity = "0.25";
        }
      });

      // ── 4. Capture ──
      const ratio = downloadWidth ? downloadWidth / node.offsetWidth : 2;
      const dataUrl = await toPng(node, {
        pixelRatio: ratio,
        cacheBust: true,
      });

      // ── 5. Trigger download ──
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      a.click();
    } catch (err) {
      console.error("Banner download failed:", err);
    } finally {
      // ── Restore all patched styles ──
      savedStyles.forEach((styles, el) => {
        for (const [prop, val] of Object.entries(styles)) {
          (el.style as unknown as Record<string, string>)[prop] = val;
        }
      });
      savedImgs.forEach(({ src, srcset }, img) => {
        img.src = src;
        img.srcset = srcset;
      });
      // Restore inline SVGs
      savedSvgs.forEach(({ parent, nextSibling, svg }, imgEl) => {
        if (imgEl.parentNode) {
          imgEl.parentNode.replaceChild(svg, imgEl);
        } else if (nextSibling) {
          parent.insertBefore(svg, nextSibling);
        } else {
          parent.appendChild(svg);
        }
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
      <div className="rounded-xl border border-border overflow-hidden">
        <div ref={captureRef}>{children}</div>
      </div>
    </div>
  );
}
