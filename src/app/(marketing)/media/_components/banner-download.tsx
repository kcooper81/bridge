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

/** Fetch a URL and return a data: URI */
async function toDataUri(url: string): Promise<string> {
  const fullUrl = url.startsWith("http") ? url : new URL(url, window.location.origin).href;
  const res = await fetch(fullUrl);
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
 * Patches the live DOM before capture to inline all resources, then uses
 * html-to-image with cacheBust disabled so it doesn't corrupt our data URIs.
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
    const savedImgs = new Map<HTMLImageElement, { src: string; srcset: string; sizes: string; loading: string | null }>();
    const savedStyles = new Map<HTMLElement, Record<string, string>>();
    const savedSvgs = new Map<HTMLImageElement, { parent: Node; nextSibling: Node | null; svg: SVGSVGElement }>();

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

      // ── 1. Convert ALL <img> to data URIs on the live DOM ──
      // This includes local images (e.g. /ads/pandora-box.jpg) which
      // foreignObject can't resolve on its own.
      const imgs = Array.from(node.querySelectorAll("img"));
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.currentSrc || img.src;
          if (src && !src.startsWith("data:")) {
            try {
              savedImgs.set(img, {
                src: img.src,
                srcset: img.srcset,
                sizes: img.sizes,
                loading: img.getAttribute("loading"),
              });
              img.src = await toDataUri(src);
              img.srcset = "";
              img.sizes = "";
              img.removeAttribute("loading");
            } catch {
              /* leave original */
            }
          }
        })
      );

      // ── 2. Convert inline <svg> to data-URI <img> on the live DOM ──
      // SVG-inside-foreignObject-inside-SVG often fails to serialize.
      const svgs = Array.from(node.querySelectorAll("svg"));
      for (const svg of svgs) {
        try {
          const parent = svg.parentNode;
          if (!parent) continue;
          const rect = svg.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;

          const serialized = new XMLSerializer().serializeToString(svg);
          const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;

          const img = document.createElement("img");
          img.src = dataUri;
          img.style.width = rect.width + "px";
          img.style.height = rect.height + "px";
          img.style.display = window.getComputedStyle(svg).display === "none" ? "none" : "inline-block";
          img.style.flexShrink = "0";
          img.style.verticalAlign = "middle";

          const nextSibling = svg.nextSibling;
          savedSvgs.set(img, { parent, nextSibling, svg: svg as SVGSVGElement });
          parent.replaceChild(img, svg);
        } catch {
          /* leave original */
        }
      }

      // ── 3. Strip rounded corners on banner shell ──
      const shell = node.firstElementChild as HTMLElement | null;
      if (shell) {
        saveStyle(shell, ["borderRadius", "overflow"]);
        shell.style.borderRadius = "0";
        shell.style.overflow = "visible";
      }

      // ── 4. Patch CSS effects unsupported in foreignObject ──
      node.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const cs = window.getComputedStyle(htmlEl);

        if (cs.backdropFilter && cs.backdropFilter !== "none") {
          saveStyle(htmlEl, ["backdropFilter", "WebkitBackdropFilter", "backgroundColor"]);
          htmlEl.style.backdropFilter = "none";
          htmlEl.style.setProperty("-webkit-backdrop-filter", "none");
          htmlEl.style.backgroundColor = "rgba(255,255,255,0.97)";
        }

        if (cs.filter && cs.filter.includes("blur")) {
          saveStyle(htmlEl, ["filter", "opacity"]);
          htmlEl.style.filter = "none";
          htmlEl.style.opacity = "0.25";
        }
      });

      // ── 5. Capture ──
      // cacheBust MUST be false — we already inlined everything as data URIs,
      // and cacheBust appends ?query params that corrupt data: URIs in the clone.
      const ratio = downloadWidth ? downloadWidth / node.offsetWidth : 2;
      const dataUrl = await toPng(node, {
        pixelRatio: ratio,
        cacheBust: false,
        skipAutoScale: true,
        includeQueryParams: true,
      });

      // ── 6. Trigger download ──
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
      a.click();
    } catch (err) {
      console.error("Banner download failed:", err);
    } finally {
      // ── Restore patched styles ──
      savedStyles.forEach((styles, el) => {
        for (const [prop, val] of Object.entries(styles)) {
          (el.style as unknown as Record<string, string>)[prop] = val;
        }
      });
      // Restore images
      savedImgs.forEach(({ src, srcset, sizes, loading: loadingAttr }, img) => {
        img.src = src;
        img.srcset = srcset;
        img.sizes = sizes;
        if (loadingAttr) img.setAttribute("loading", loadingAttr);
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
