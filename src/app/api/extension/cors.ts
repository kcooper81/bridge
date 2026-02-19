import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

function getAllowedOrigin(request?: NextRequest | Request): string {
  const origin = request?.headers.get("origin") || "";
  // Allow browser extension origins
  if (origin.startsWith("chrome-extension://") || origin.startsWith("moz-extension://")) {
    return origin;
  }
  // Allow our own site
  if (origin === SITE_URL || origin === "http://localhost:3000") {
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
