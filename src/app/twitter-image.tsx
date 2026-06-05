// Twitter prefers twitter-image.tsx over opengraph-image.tsx when present.
// We re-export the opengraph-image renderer so the X / Twitter card shows
// the same per-route imagery without maintaining two renderers.
export { default, runtime, alt, size, contentType } from "./opengraph-image";
