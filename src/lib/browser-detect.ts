export type BrowserName = "chrome" | "firefox" | "edge" | "safari" | "other";

export function detectBrowser(): BrowserName {
  if (typeof navigator === "undefined") return "chrome"; // SSR fallback

  const ua = navigator.userAgent;

  // Order matters: Edge includes "Chrome" in UA, so check Edge first
  if (/Edg\//i.test(ua)) return "edge";
  if (/Firefox\//i.test(ua)) return "firefox";
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return "chrome";
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "safari";

  return "other";
}

export const EXTENSION_STORES: Record<
  "chrome" | "firefox" | "edge",
  { name: string; url: string; buttonLabel: string }
> = {
  chrome: {
    name: "Chrome Web Store",
    url: "https://chromewebstore.google.com/detail/teamprompt",
    buttonLabel: "Install for Chrome",
  },
  firefox: {
    name: "Firefox Add-ons",
    url: "https://addons.mozilla.org/en-US/firefox/addon/teamprompt/",
    buttonLabel: "Install for Firefox",
  },
  edge: {
    name: "Edge Add-ons",
    url: "https://microsoftedge.microsoft.com/addons/detail/teamprompt",
    buttonLabel: "Install for Edge",
  },
};

export function getStoreForBrowser(browser: BrowserName) {
  if (browser === "chrome" || browser === "firefox" || browser === "edge") {
    return EXTENSION_STORES[browser];
  }
  // Safari and other browsers fall back to Chrome Web Store
  return EXTENSION_STORES.chrome;
}
