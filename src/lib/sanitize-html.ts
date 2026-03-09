import DOMPurify from "dompurify";

/**
 * Sanitize HTML content for safe rendering via dangerouslySetInnerHTML.
 * Strips scripts, event handlers, and other dangerous elements.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: strip script tags and event handlers as a basic fallback.
    // Full DOMPurify sanitization happens on client hydration.
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em",
      "br", "blockquote", "code", "pre", "img", "table", "thead",
      "tbody", "tr", "th", "td", "hr", "span", "div", "figure",
      "figcaption", "sup", "sub",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "id", "width", "height"],
    ALLOW_DATA_ATTR: false,
  });
}
