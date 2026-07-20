// Server-only guard against SSRF for user/admin-configured outbound URLs
// (webhook destinations). Callers store an arbitrary https URL that the server
// later fetches; without this an attacker can point it at internal services
// (169.254.169.254 cloud metadata, 10.x/192.168.x, loopback) and use the
// server as a proxy / port scanner.

import "server-only";
import { lookup } from "node:dns/promises";
import net from "node:net";

/** True for IPv4/IPv6 addresses that must never be reachable from a webhook. */
function isPrivateAddress(ip: string): boolean {
  const type = net.isIP(ip);
  if (type === 4) {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return true;
    const [a, b] = p;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // loopback
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // link-local incl. cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64.0.0/10
    if (a >= 224) return true; // multicast/reserved
    return false;
  }
  if (type === 6) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true; // loopback / unspecified
    if (v.startsWith("fe80")) return true; // link-local
    if (v.startsWith("fc") || v.startsWith("fd")) return true; // unique-local
    // IPv4-mapped (::ffff:a.b.c.d) — re-check the embedded v4.
    const mapped = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }
  return true; // not a valid IP literal → reject
}

export interface UrlCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Validate a destination URL for outbound delivery: https only, and its
 * hostname must resolve exclusively to public addresses. Resolving here (not
 * just parsing) is what blocks a public hostname whose DNS points at an
 * internal IP.
 *
 * Note: this does not fully close DNS-rebinding (the IP could change between
 * this check and the fetch). Callers should additionally use redirect:"manual".
 */
export async function assertPublicHttpsUrl(rawUrl: string): Promise<UrlCheck> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }
  if (url.protocol !== "https:") {
    return { ok: false, reason: "URL must use https" };
  }
  const host = url.hostname;

  // A literal IP host is checked directly; a name is resolved.
  if (net.isIP(host)) {
    return isPrivateAddress(host)
      ? { ok: false, reason: "URL resolves to a private address" }
      : { ok: true };
  }

  try {
    const results = await lookup(host, { all: true });
    if (results.length === 0) return { ok: false, reason: "Host does not resolve" };
    for (const { address } of results) {
      if (isPrivateAddress(address)) {
        return { ok: false, reason: "URL resolves to a private address" };
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Host does not resolve" };
  }
}

export { isPrivateAddress };
