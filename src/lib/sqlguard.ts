import { Detector, DetectionResult, assertSafeSqlQuery, scanSqlQuery } from 'sqlguardjs';
import { NextRequest, NextResponse } from 'next/server';

// Initialize a shared SQLGuardJS detector instance
export const detector = new Detector({
  maxPayloadLength: 50000,
  maxDecodeIterations: 8,
});

export { assertSafeSqlQuery, scanSqlQuery, Detector };

export interface ScanResult {
  safe: boolean;
  threatType?: string;
  confidence?: number;
  matches?: Array<{ id: string; label: string; confidence: number }>;
  flaggedPayload?: string;
}

/**
 * Deeply scans any value (string, object, array) for SQL injection, XSS, and NoSQL injection
 */
export function scanValue(val: unknown, depth = 0, maxDepth = 10): ScanResult {
  if (depth > maxDepth || val === null || val === undefined) {
    return { safe: true };
  }

  if (typeof val === 'string') {
    if (val.trim().length === 0) return { safe: true };

    const result: DetectionResult = detector.detect(val);
    if (result.label !== 'benign' && result.confidence >= 0.5) {
      return {
        safe: false,
        threatType: result.label,
        confidence: result.confidence,
        matches: result.matches,
        flaggedPayload: val.slice(0, 100),
      };
    }
    return { safe: true };
  }

  if (Array.isArray(val)) {
    for (const item of val) {
      const res = scanValue(item, depth + 1, maxDepth);
      if (!res.safe) return res;
    }
    return { safe: true };
  }

  if (typeof val === 'object') {
    for (const [key, propVal] of Object.entries(val as Record<string, unknown>)) {
      // Scan key names as well (prevent NoSQL operators like $where, $gt, or SQL statements in keys)
      const keyRes = scanValue(key, depth + 1, maxDepth);
      if (!keyRes.safe) return keyRes;

      const propRes = scanValue(propVal, depth + 1, maxDepth);
      if (!propRes.safe) return propRes;
    }
    return { safe: true };
  }

  return { safe: true };
}

/**
 * Inspects a URL search params collection or URL query string
 */
export function scanSearchParams(searchParams: URLSearchParams): ScanResult {
  for (const [key, value] of searchParams.entries()) {
    const keyRes = scanValue(key);
    if (!keyRes.safe) return keyRes;

    const valRes = scanValue(value);
    if (!valRes.safe) return valRes;
  }
  return { safe: true };
}

/**
 * Validates any incoming parsed JSON body or payload
 */
export function validateRequestBody(body: unknown): ScanResult {
  return scanValue(body);
}

/**
 * Helper to generate a standardized 403 Forbidden security response
 */
export function createSecurityBlockedResponse(scan: ScanResult): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: `Security violation: Malicious ${scan.threatType?.toUpperCase() || 'injection'} detected by SQLGuardJS.`,
      threat: scan.threatType,
      confidence: scan.confidence,
    },
    {
      status: 403,
      headers: {
        'X-SQLGuard-Action': 'blocked',
        'X-SQLGuard-Threat': scan.threatType || 'unknown',
      },
    }
  );
}

/**
 * Higher-order Route Handler wrapper that guards Next.js API endpoints
 */
export function withSqlGuard(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse
) {
  return async function guardedHandler(req: NextRequest, ...args: any[]) {
    // 1. Scan URL search parameters
    const queryScan = scanSearchParams(req.nextUrl.searchParams);
    if (!queryScan.safe) {
      return createSecurityBlockedResponse(queryScan);
    }

    // 2. For mutating requests, scan the JSON body if present
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const clonedReq = req.clone();
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const body = await clonedReq.json().catch(() => null);
          if (body) {
            const bodyScan = scanValue(body);
            if (!bodyScan.safe) {
              return createSecurityBlockedResponse(bodyScan);
            }
          }
        }
      } catch (err) {
        // If body parsing fails, allow standard route handler to handle standard validation
      }
    }

    // 3. Forward request to actual handler
    return handler(req, ...args);
  };
}
