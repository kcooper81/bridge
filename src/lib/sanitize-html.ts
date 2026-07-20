// isomorphic-dompurify runs real DOMPurify on both server and client (via
// jsdom on the server), so SSR output is sanitized with the same allowlist as
// the browser — not the weak regex fallback this used to ship server-side.
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML content for safe rendering via dangerouslySetInnerHTML.
 * Strips scripts, event handlers, and other dangerous elements. Runs
 * identically on server and client.
 */
export function sanitizeHtml(dirty: string): string {
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
