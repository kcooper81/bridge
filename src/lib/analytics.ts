/**
 * Google Analytics 4 event helpers.
 *
 * All gtag calls are wrapped with a window check so SSR and
 * environments without the script loaded never throw.
 */

const GA_MEASUREMENT_ID =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GA_MEASUREMENT_ID) ||
  "G-83VRNN79X8";

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

type GTagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  } else if (window.dataLayer) {
    window.dataLayer.push(args);
  }
}

/** Track a custom GA4 event */
export function trackEvent({ action, ...params }: GTagEvent) {
  gtag("event", action, params);
}

/** Send a virtual page‑view (SPA navigation) */
export function trackPageView(url: string) {
  gtag("config", GA_MEASUREMENT_ID, { page_path: url });
}

// ---------------------------------------------------------------------------
// Auth events
// ---------------------------------------------------------------------------

export function trackSignUp(method: "email" | "google" | "github") {
  trackEvent({ action: "sign_up", method });
}

export function trackLogin(method: "email" | "google" | "github") {
  trackEvent({ action: "login", method });
}

// ---------------------------------------------------------------------------
// Ecommerce: GA4 recommended events
// ---------------------------------------------------------------------------

interface CheckoutItem {
  plan: string;
  price: number;
  interval: "monthly" | "annual";
  seats: number;
}

/** Fire when the user clicks "Upgrade" or "Start trial" */
export function trackBeginCheckout(item: CheckoutItem) {
  trackEvent({
    action: "begin_checkout",
    currency: "USD",
    value: item.price * item.seats,
    items: [
      {
        item_id: `plan_${item.plan}_${item.interval}`,
        item_name: `TeamPrompt ${capitalize(item.plan)} (${item.interval})`,
        item_category: "subscription",
        price: item.price,
        quantity: item.seats,
      },
    ],
  });
}

/** Fire on the ?checkout=success redirect after Stripe */
export function trackPurchase(plan: string) {
  trackEvent({
    action: "purchase",
    currency: "USD",
    transaction_id: `tp_${Date.now()}`,
    items: [
      {
        item_id: `plan_${plan}`,
        item_name: `TeamPrompt ${capitalize(plan)}`,
        item_category: "subscription",
        quantity: 1,
      },
    ],
  });
}

/** Fire when a user starts a free trial */
export function trackTrialStart(plan: string) {
  trackEvent({
    action: "trial_start",
    category: "subscription",
    label: plan,
  });
}

// ---------------------------------------------------------------------------
// Product usage events
// ---------------------------------------------------------------------------

export function trackPromptCreated() {
  trackEvent({ action: "prompt_created", category: "engagement" });
}

export function trackPromptUsed(method: "copy" | "insert" | "extension") {
  trackEvent({ action: "prompt_used", category: "engagement", method });
}

export function trackPromptSearched(query: string) {
  trackEvent({ action: "search", search_term: query });
}

export function trackInviteSent() {
  trackEvent({ action: "invite_sent", category: "engagement" });
}

export function trackInviteAccepted() {
  trackEvent({ action: "invite_accepted", category: "engagement" });
}

export function trackGuardrailViolation(severity: "block" | "warn") {
  trackEvent({
    action: "guardrail_violation",
    category: "security",
    label: severity,
  });
}

export function trackGuardrailCreated() {
  trackEvent({ action: "guardrail_created", category: "security" });
}

export function trackExtensionInstallClick() {
  trackEvent({ action: "extension_install_click", category: "engagement" });
}

export function trackCollectionCreated() {
  trackEvent({ action: "collection_created", category: "engagement" });
}

export function trackExport(count: number) {
  trackEvent({ action: "export", category: "engagement", value: count });
}

export function trackImport(count: number) {
  trackEvent({ action: "import", category: "engagement", value: count });
}

// ---------------------------------------------------------------------------
// Util
// ---------------------------------------------------------------------------

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Extend the Window interface so gtag/dataLayer don't error
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
