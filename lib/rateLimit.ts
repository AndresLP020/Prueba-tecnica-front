type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export function rateLimit(key: string, now = Date.now()) {
  const cutoff = now - WINDOW_MS;
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
  if (bucket.timestamps.length >= MAX_HITS) {
    buckets.set(key, bucket);
    const retryAfterMs = bucket.timestamps[0] + WINDOW_MS - now;
    return { ok: false as const, remaining: 0, retryAfterMs };
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    ok: true as const,
    remaining: MAX_HITS - bucket.timestamps.length,
    retryAfterMs: 0,
  };
}

export function resetRateLimitForTests() {
  buckets.clear();
}

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") || "unknown";
}
