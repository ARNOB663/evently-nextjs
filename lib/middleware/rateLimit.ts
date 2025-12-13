import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyPrefix?: string;   // Prefix for rate limit key
}

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Strict limits for auth endpoints
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'login' },           // 5 attempts per 15 min
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: 'register' },     // 3 registrations per hour
  forgotPassword: { windowMs: 60 * 60 * 1000, maxRequests: 3, keyPrefix: 'forgot' }, // 3 requests per hour
  resetPassword: { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: 'reset' },   // 5 attempts per 15 min
  verifyEmail: { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: 'verify' },   // 10 per hour
  
  // More lenient for general API
  api: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'api' },                  // 100 requests per minute
} as const;

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header (for proxies) or falls back to a generic key
 */
function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from various headers (common in production behind proxies)
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback - in development or direct access
  // Note: req.ip might not be available in all environments
  return 'unknown-client';
}

/**
 * Check rate limit for a request
 * Returns null if within limits, or a NextResponse if rate limited
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  cleanupExpiredEntries();
  
  const clientId = getClientIdentifier(req);
  const key = `${config.keyPrefix || 'default'}:${clientId}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
        },
      }
    );
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return null;
}

/**
 * Higher-order function to wrap an API handler with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  config: RateLimitConfig
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    const rateLimitResponse = checkRateLimit(req, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(req, ...args);
  }) as T;
}
