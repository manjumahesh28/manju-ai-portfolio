// Simple per-visitor rate limit: at most MAX_REQUESTS questions per minute per IP.
//
// It's stored in memory, so it resets when Vercel restarts the function, and
// separate function instances don't share counts. That's fine for a portfolio.
// A production system would keep the counts in Redis (e.g. Upstash) instead.

const WINDOW_MS = 60_000;  // 1 minute
const MAX_REQUESTS = 10;
const requests = new Map(); // ip -> list of request timestamps

export function isAllowed(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    requests.set(ip, recent);
    return false;
  }

  recent.push(now);
  requests.set(ip, recent);
  if (requests.size > 5000) requests.clear(); // keep memory bounded
  return true;
}