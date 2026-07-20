/**
 * First-touch signup attribution.
 *
 * As of 2026-07 we had no way to answer "which page produced this signup?".
 * GSC tells us a page got clicks; the DB tells us a user signed up; nothing
 * connected the two. That made every SEO decision guesswork — we were ranking
 * pages without knowing which ones actually convert.
 *
 * How it works: the marketing layout captures the FIRST landing page + referrer
 * into a cookie and never overwrites it. After auth, `/api/attribution/claim`
 * copies that cookie onto the user's profile (only if not already set, so a
 * later login can't overwrite the original signup source).
 *
 * First-touch (not last-touch) is deliberate. Someone who finds us via
 * /compare/lakera, leaves, and comes back a week later by typing the domain
 * should still be credited to /compare/lakera — that page did the work.
 */

export const ATTRIBUTION_COOKIE = "tp_attr";
const MAX_AGE_DAYS = 90;

export type AttributionChannel =
  | "organic_search"
  | "paid_search"
  | "social"
  | "referral"
  | "direct";

export interface Attribution {
  landing_path: string;
  referrer: string | null;
  referrer_host: string | null;
  channel: AttributionChannel;
  utm: Record<string, string>;
  captured_at: string;
}

const SEARCH_HOSTS = [
  "google.",
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.",
  "ecosia.org",
  "brave.com",
  "startpage.com",
];

const SOCIAL_HOSTS = [
  "linkedin.com",
  "lnkd.in",
  "twitter.com",
  "t.co",
  "x.com",
  "facebook.com",
  "reddit.com",
  "news.ycombinator.com",
  "youtube.com",
];

/**
 * AI assistants that send referral traffic. Broken out from `referral` because
 * GEO/AI-citation traffic is a distinct channel we're actively investing in and
 * need to measure separately — lumping it into `referral` would hide it.
 */
const AI_HOSTS = ["chatgpt.com", "chat.openai.com", "perplexity.ai", "claude.ai", "gemini.google.com"];

function classify(referrerHost: string | null, utm: Record<string, string>): AttributionChannel {
  // Paid wins over everything — a gclid means we paid for the click even if
  // the referrer looks organic.
  if (utm.gclid || utm.utm_medium === "cpc" || utm.utm_medium === "ppc") return "paid_search";
  if (utm.utm_medium === "social" || utm.utm_source === "linkedin") return "social";
  if (!referrerHost) return "direct";
  // AI assistants classify as referral but keep their host, so
  // `referrer_host` still tells us exactly which one.
  if (AI_HOSTS.some((h) => referrerHost.includes(h))) return "referral";
  if (SEARCH_HOSTS.some((h) => referrerHost.includes(h))) return "organic_search";
  if (SOCIAL_HOSTS.some((h) => referrerHost.includes(h))) return "social";
  return "referral";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Capture first-touch attribution if we haven't already. Safe to call on every
 * marketing page view — it no-ops once the cookie exists.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  if (readCookie(ATTRIBUTION_COOKIE)) return; // first-touch: never overwrite

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 120);
  }

  const referrer = document.referrer || null;
  let referrerHost: string | null = null;
  if (referrer) {
    try {
      const host = new URL(referrer).hostname;
      // Same-site referrers mean this is an internal navigation, not an entry
      // point — treat as no referrer so we don't classify ourselves as a
      // "referral" source.
      referrerHost = host.endsWith("teamprompt.app") ? null : host;
    } catch {
      referrerHost = null;
    }
  }

  const attribution: Attribution = {
    landing_path: window.location.pathname.slice(0, 300),
    referrer: referrerHost ? referrer : null,
    referrer_host: referrerHost,
    channel: classify(referrerHost, utm),
    utm,
    captured_at: new Date().toISOString(),
  };

  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie =
    `${ATTRIBUTION_COOKIE}=${encodeURIComponent(JSON.stringify(attribution))};` +
    `path=/;max-age=${maxAge};SameSite=Lax${window.location.protocol === "https:" ? ";Secure" : ""}`;
}

/** Read the captured attribution, if any. Returns null when unparseable. */
export function getAttribution(): Attribution | null {
  const raw = readCookie(ATTRIBUTION_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}
