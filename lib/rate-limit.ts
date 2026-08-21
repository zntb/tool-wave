import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(maxAgeMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => now - t < maxAgeMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

interface RateLimitConfig {
  /** Unique key prefix (e.g., route name) */
  keyPrefix: string;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
): RateLimitResult {
  const { keyPrefix, maxRequests, windowMs } = config;

  // Get client IP from headers or fallback
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  cleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  const remaining = maxRequests - entry.timestamps.length;

  if (remaining <= 0) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: remaining - 1, retryAfterMs: 0 };
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const headers = new Headers();
  headers.set('X-RateLimit-Remaining', String(result.remaining));

  if (!result.allowed) {
    headers.set('X-RateLimit-Remaining', '0');
    headers.set('Retry-After', String(Math.ceil(result.retryAfterMs / 1000)));
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers },
    );
  }

  return NextResponse.next({ headers });
}
