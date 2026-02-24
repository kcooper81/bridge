import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

// Extension IDs allowed to call the API.
// Set EXTENSION_ALLOWED_IDS in env as comma-separated list, or leave empty to allow
// any extension origin (for development). In production, pin to your published IDs.
const ALLOWED_EXTENSION_IDS = (process.env.EXTENSION_ALLOWED_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

// AI tool origins where the extension content script runs and makes fetch() calls.
// Content scripts inherit the page's origin, so these need CORS access.
const AI_TOOL_ORIGINS = [
  "https://chat.openai.com",
  "https://chatgpt.com",
  "https://claude.ai",
  "https://gemini.google.com",
  "https://copilot.microsoft.com",
  "https://www.perplexity.ai",
];

function getAllowedOrigin(request?: NextRequest | Request): string {
  const origin = request?.headers.get("origin") || "";

  // Allow browser extension origins — validate ID if configured
  if (origin.startsWith("chrome-extension://") || origin.startsWith("moz-extension://")) {
    if (ALLOWED_EXTENSION_IDS.length === 0) {
      return origin;
    }
    const id = origin.replace(/^(chrome|moz)-extension:\/\//, "").replace(/\/$/, "");
    if (ALLOWED_EXTENSION_IDS.includes(id)) {
      return origin;
    }
    return SITE_URL;
  }

  // Allow AI tool origins (content script fetch runs under page origin)
  if (AI_TOOL_ORIGINS.includes(origin)) {
    return origin;
  }

  // Allow our own site
  if (origin === SITE_URL) {
    return origin;
  }

  // Allow dev origins in non-production
  if (process.env.NODE_ENV !== "production" && DEV_ORIGINS.includes(origin)) {
    return origin;
  }

  return SITE_URL;
}

function buildHeaders(request?: NextRequest | Request) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(request),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Extension-Version",
  };
}

export function handleOptions(request?: NextRequest) {
  return new NextResponse(null, { status: 204, headers: buildHeaders(request) });
}

export function withCors(response: NextResponse, request?: NextRequest) {
  const headers = buildHeaders(request);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
