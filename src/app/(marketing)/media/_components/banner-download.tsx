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

/**
 * Wraps a CSS-rendered banner and provides a "Download PNG" button.
 *
 * Captures the banner by building a standalone SVG foreignObject document
 * with all resources (images, SVGs, fonts, computed styles) fully inlined.
 * This avoids html-to-image's known issues with image cloning and cacheBust.
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
      const node = captureRef.current;
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const scale = downloadWidth ? downloadWidth / width : 2;

      // Deep-clone the node so we can mutate freely without affecting the page
      const clone = node.cloneNode(true) as HTMLElement;

      // Inline all computed styles onto every element in the clone
      await inlineComputedStyles(node, clone);

      // Inline all <img> sources as data URIs
      await inlineImages(clone);

      // Inline all <svg> elements as data-URI <img> tags
      inlineSvgs(node, clone);

      // Patch unsupported CSS for SVG foreignObject rendering
      patchUnsupportedCss(clone);

      // Strip rounded corners on the banner shell for clean export
      const shell = clone.firstElementChild as HTMLElement | null;
      if (shell) {
        shell.style.borderRadius = "0";
        shell.style.overflow = "visible";
      }

      // Build SVG foreignObject document
      const svgNs = "http://www.w3.org/2000/svg";
      const xhtmlNs = "http://www.w3.org/1999/xhtml";
      const svg = document.createElementNS(svgNs, "svg");
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      const fo = document.createElementNS(svgNs, "foreignObject");
      fo.setAttribute("width", "100%");
      fo.setAttribute("height", "100%");

      // Wrap clone in an xhtml body
      const body = document.createElementNS(xhtmlNs, "body");
      body.setAttribute("xmlns", xhtmlNs);
      body.style.margin = "0";
      body.style.padding = "0";
      body.style.width = width + "px";
      body.style.height = height + "px";
      body.appendChild(clone);
      fo.appendChild(body);
      svg.appendChild(fo);

      // Serialize SVG → blob → canvas → PNG
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);

      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(svgUrl);
          reject(e);
        };
        img.src = svgUrl;
      });

      const dataUrl = canvas.toDataURL("image/png");
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
      <div className="rounded-xl border border-border overflow-hidden">
        <div ref={captureRef}>{children}</div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

/** Fetch a URL and return as data: URI */
async function toDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Copy computed styles from the live DOM onto the clone so they survive serialization */
async function inlineComputedStyles(original: HTMLElement, clone: HTMLElement) {
  const origEls = original.querySelectorAll("*");
  const cloneEls = clone.querySelectorAll("*");

  // Also style the root
  copyStyles(original, clone);

  for (let i = 0; i < origEls.length && i < cloneEls.length; i++) {
    copyStyles(origEls[i] as HTMLElement, cloneEls[i] as HTMLElement);
  }
}

function copyStyles(from: HTMLElement, to: HTMLElement) {
  const cs = window.getComputedStyle(from);
  // Copy key layout/visual properties that Tailwind classes won't carry into foreignObject
  const props = [
    "display", "position", "top", "right", "bottom", "left", "z-index",
    "width", "height", "min-width", "min-height", "max-width", "max-height",
    "margin", "padding", "box-sizing", "overflow",
    "flex-direction", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
    "align-items", "justify-content", "gap",
    "font-family", "font-size", "font-weight", "font-style", "line-height",
    "letter-spacing", "text-align", "text-decoration", "text-transform",
    "color", "background-color", "background-image", "background-size",
    "background-position", "background-repeat",
    "border", "border-radius", "border-color", "border-width", "border-style",
    "box-shadow", "opacity", "white-space", "word-break", "overflow-wrap",
    "object-fit", "object-position", "aspect-ratio",
  ];
  for (const p of props) {
    try {
      const val = cs.getPropertyValue(p);
      if (val) to.style.setProperty(p, val);
    } catch { /* skip */ }
  }
}

/** Convert every <img> in the clone to a data URI */
async function inlineImages(clone: HTMLElement) {
  const imgs = Array.from(clone.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute("src") || img.src;
      if (!src || src.startsWith("data:")) return;
      try {
        // Resolve relative URLs against the page origin
        const fullUrl = src.startsWith("http") ? src : new URL(src, window.location.origin).href;
        img.src = await toDataUri(fullUrl);
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.removeAttribute("loading");
      } catch { /* leave original */ }
    })
  );
}

/** Replace inline <svg> elements with data-URI <img> tags in the clone */
function inlineSvgs(original: HTMLElement, clone: HTMLElement) {
  const origSvgs = Array.from(original.querySelectorAll("svg"));
  const cloneSvgs = Array.from(clone.querySelectorAll("svg"));

  for (let i = 0; i < cloneSvgs.length && i < origSvgs.length; i++) {
    const svg = cloneSvgs[i];
    const origSvg = origSvgs[i];
    const parent = svg.parentNode;
    if (!parent) continue;

    try {
      // Get dimensions from the live DOM element
      const rect = origSvg.getBoundingClientRect();
      const serialized = new XMLSerializer().serializeToString(svg);
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
      const img = document.createElement("img");
      img.src = dataUri;
      img.style.width = rect.width + "px";
      img.style.height = rect.height + "px";
      img.style.display = "inline-block";
      img.style.flexShrink = "0";
      img.style.verticalAlign = "middle";
      parent.replaceChild(img, svg);
    } catch { /* leave original */ }
  }
}

/** Patch CSS effects that don't render in SVG foreignObject */
function patchUnsupportedCss(clone: HTMLElement) {
  clone.querySelectorAll("*").forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.style;

    // backdrop-filter: not supported in foreignObject
    if (style.backdropFilter && style.backdropFilter !== "none") {
      style.backdropFilter = "none";
      style.setProperty("-webkit-backdrop-filter", "none");
      // Ensure the background is opaque to compensate
      if (!style.backgroundColor || style.backgroundColor === "transparent") {
        style.backgroundColor = "rgba(255,255,255,0.97)";
      } else {
        // Make existing semi-transparent bg more opaque
        style.backgroundColor = style.backgroundColor.replace(/[\d.]+\)$/, "0.97)");
      }
    }

    // filter:blur() can clip or produce hard edges
    if (style.filter && style.filter.includes("blur")) {
      style.filter = "none";
      style.opacity = "0.25";
    }
  });
}
