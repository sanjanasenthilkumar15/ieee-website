import "server-only";

/**
 * Simple in-memory rate limiter (per server process). Enough for a single
 * college server; resets when the site restarts.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return true;
}

export function resetRateLimit(key: string) {
  hits.delete(key);
}
