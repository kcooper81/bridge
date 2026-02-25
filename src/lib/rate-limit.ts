import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// No-op when Redis env vars are not set (dev environments)
function createRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function createLimiter(
  requests: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
  prefix: string
): Ratelimit | null {
  const redis = createRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
  });
}

// Pre-configured limiters
export const limiters = {
  scan: createLimiter(60, "1 m", "scan"),
  log: createLimiter(120, "1 m", "log"),
  prompts: createLimiter(30, "1 m", "prompts"),
  invite: createLimiter(10, "1 m", "invite"),
  inviteAccept: createLimiter(10, "1 m", "invite-accept"),
  support: createLimiter(5, "10 m", "support"),
  securityStatus: createLimiter(20, "1 m", "security-status"),
  enableShield: createLimiter(5, "1 m", "enable-shield"),
  orgEnsure: createLimiter(5, "1 m", "org-ensure"),
  accountDelete: createLimiter(3, "10 m", "account-delete"),
  stripeCheckout: createLimiter(10, "1 m", "stripe-checkout"),
  stripePortal: createLimiter(10, "1 m", "stripe-portal"),
  stripeWebhook: createLimiter(200, "1 m", "stripe-webhook"),
  sessionEvent: createLimiter(5, "1 m", "session-event"),
};

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  // No-op when limiter is not configured
  if (!limiter) return { success: true };

  try {
    const result = await limiter.limit(identifier);

    if (!result.success) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
      response.headers.set("X-RateLimit-Limit", String(result.limit));
      response.headers.set("X-RateLimit-Remaining", String(result.remaining));
      response.headers.set("X-RateLimit-Reset", String(result.reset));
      response.headers.set("Retry-After", String(Math.ceil((result.reset - Date.now()) / 1000)));
      return { success: false, response };
    }

    return { success: true };
  } catch (error) {
    // Fail open on Redis errors
    console.error("Rate limit check failed:", error);
    return { success: true };
  }
}
