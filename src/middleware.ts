import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, RATE_LIMIT_RULES, RateLimitConfig } from '@/lib/rateLimit';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Health-check / DB check probe exemption (allows monitoring services)
  if (pathname === '/api/db-check') {
    return NextResponse.next();
  }

  const clientIp = getClientIp(req.headers);

  // Match most specific rule: Check path+method first, then path, then fallback to default
  const methodSpecificKey = `${pathname}:${method}`;
  const rule: RateLimitConfig =
    RATE_LIMIT_RULES[methodSpecificKey] ||
    RATE_LIMIT_RULES[pathname] ||
    RATE_LIMIT_RULES.default;

  // Build a unique rate-limit key per IP and route group
  const rateLimitKey = `${clientIp}:${methodSpecificKey}`;
  const result = checkRateLimit(rateLimitKey, rule);

  // Rate limit exceeded: return 429 Too Many Requests
  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: `Rate limit exceeded. Too many requests. Please wait ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
        limit: result.limit,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetTime),
        },
      }
    );
  }

  // Request allowed: inject rate-limiting telemetry headers into response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetTime));

  return response;
}

// Configure middleware matcher to only run on API endpoints
export const config = {
  matcher: ['/api/:path*'],
};
