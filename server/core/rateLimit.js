// Fixed-window limiter kept in memory. It protects your Gemini key from being
// drained by one visitor. For many server instances, swap in Redis/Upstash.
const buckets = new Map();

export function rateLimit(key, { limit = 12, windowMs = 60_000 } = {}) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start >= windowMs) {
    bucket = { start: now, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now - b.start >= windowMs) buckets.delete(k);
  }
  return { ok: bucket.count <= limit, retryAfterSec: Math.max(1, Math.ceil((bucket.start + windowMs - now) / 1000)) };
}
