// ==============================================================================
// High-Performance Sliding-Window Rate Limiter for Next.js & Vercel Edge/Server
// ==============================================================================

export interface RateLimitConfig {
  limit: number;      // Maximum allowed requests within the time window
  windowMs: number;   // Window duration in milliseconds (e.g., 60,000 for 1 minute)
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;  // Epoch timestamp in seconds when the current window resets
  retryAfter: number; // Seconds to wait before retrying
}

// In-memory sliding log store with automatic garbage collection
interface ClientRecord {
  timestamps: number[];
  lastSeen: number;
}

const rateLimitStore = new Map<string, ClientRecord>();

// Periodic cleanup every 2 minutes to prevent memory leaks under massive visitor volume
const CLEANUP_INTERVAL_MS = 120_000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(maxWindowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    // If no activity in the last 2 window intervals, remove entry
    if (now - record.lastSeen > maxWindowMs * 2) {
      rateLimitStore.delete(key);
    }
  }

  // Safety valve: if store exceeds 20,000 active IPs, clear oldest half
  if (rateLimitStore.size > 20_000) {
    let count = 0;
    for (const key of rateLimitStore.keys()) {
      rateLimitStore.delete(key);
      count++;
      if (count >= 10_000) break;
    }
  }
}

/**
 * Checks and increments rate limit for a given key (IP + endpoint)
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanupExpiredRecords(config.windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [], lastSeen: now };
    rateLimitStore.set(key, record);
  }

  record.lastSeen = now;

  // Filter timestamps within the sliding window
  const windowStart = now - config.windowMs;
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const resetTime = Math.ceil((now + config.windowMs) / 1000);
  const oldestTimestamp = record.timestamps[0] || now;
  const retryAfter = Math.max(1, Math.ceil((oldestTimestamp + config.windowMs - now) / 1000));

  if (record.timestamps.length >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  // Record this hit
  record.timestamps.push(now);

  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - record.timestamps.length,
    resetTime,
    retryAfter: 0,
  };
}

/**
 * Extracts the real client IP address from standard headers across Vercel, Cloudflare, and reverse proxies
 */
export function getClientIp(headers: Headers): string {
  // 1. Cloudflare header
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // 2. Vercel / Standard X-Forwarded-For (first IP is the real client)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // 3. X-Real-IP
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  // 4. Default fallback
  return '127.0.0.1';
}

/**
 * Route-specific rate limiting configurations
 */
export const RATE_LIMIT_RULES: Record<string, RateLimitConfig> = {
  // Strict: Protect 4-digit doorstep verification from brute-force attacks (max 6 attempts/min)
  '/api/delivery/verify-otp': {
    limit: 6,
    windowMs: 60_000,
  },
  // Strict: Protect Admin & Kitchen PIN authentication (max 6 attempts/min)
  '/api/admin/auth': {
    limit: 6,
    windowMs: 60_000,
  },
  // High Protection: Protect Order placement from bot spam (max 15 orders/min per IP)
  '/api/orders:POST': {
    limit: 15,
    windowMs: 60_000,
  },
  // High Protection: Payment Order generation (max 20 requests/min)
  '/api/razorpay/order': {
    limit: 20,
    windowMs: 60_000,
  },
  '/api/cashfree/order': {
    limit: 20,
    windowMs: 60_000,
  },
  // High Protection: WhatsApp & SMS OTP dispatch triggers (max 10 requests/min)
  '/api/notifications/dispatch-otp': {
    limit: 10,
    windowMs: 60_000,
  },
  // High Protection: Rider Emergency SOS alert broadcast (max 10/min)
  '/api/delivery/sos:POST': {
    limit: 10,
    windowMs: 60_000,
  },
  // Normal Polling & Read endpoints (allows 120 requests/min for multi-tab live trackers)
  '/api/orders:GET': {
    limit: 120,
    windowMs: 60_000,
  },
  // General API default rule
  default: {
    limit: 100,
    windowMs: 60_000,
  },
};
