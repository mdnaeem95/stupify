import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// =============================================================================
// RATE LIMITERS
// =============================================================================

/**
 * Global rate limiter - prevents abuse from single IP
 * Limit: 100 requests per minute per IP
 * Use: Apply to ALL API routes to prevent DDoS
 */
export const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "stupify:global",
  analytics: true,
});

/**
 * Free user limiter - enforces daily question limit
 * Limit: 10 requests per day per user
 * Use: Apply to /api/chat for free users
 */
export const freeUserLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 d"),
  prefix: "stupify:free",
  analytics: true,
});

/**
 * Premium user limiter - generous but not unlimited
 * Limit: 1000 requests per day per user
 * Use: Apply to /api/chat for premium users
 */
export const premiumUserLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, "1 d"),
  prefix: "stupify:premium",
  analytics: true,
});

/**
 * Voice transcription limiter - expensive API calls
 * Limit: 50 requests per hour per user
 * Use: Apply to /api/transcribe
 */
export const voiceLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"),
  prefix: "stupify:voice",
  analytics: true,
});

/**
 * Stripe webhook limiter - prevent replay attacks
 * Limit: 100 requests per minute
 * Use: Apply to /api/stripe/webhook
 */
export const webhookLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  prefix: "stupify:webhook",
  analytics: true,
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Try common headers used by proxies/CDNs
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const cfConnecting = request.headers.get("cf-connecting-ip");
  
  // x-forwarded-for can be a comma-separated list, take first IP
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  return cfConnecting || real || "unknown";
}

/**
 * Create a rate limit identifier for a user
 * Falls back to IP if user is not authenticated
 */
export function getUserIdentifier(userId: string | null, ip: string): string {
  return userId || `ip:${ip}`;
}

/**
 * Check rate limit and return formatted response
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Create a rate limit error response with headers
 */
export function createRateLimitResponse(
  message: string,
  limit: number,
  remaining: number,
  reset: number
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      limit,
      remaining,
      resetAt: new Date(reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}