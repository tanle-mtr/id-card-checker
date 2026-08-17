import { NextRequest, NextResponse } from 'next/server';
import { QuotaManager } from '@/lib/quota';

// Reserved for authenticated user usage lookup.
// In production, resolve the real user id from the Casdoor JWT session
// stored in an httpOnly cookie. Here a demo user is used since Casdoor
// session plumbing is external.
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const isAdmin = request.headers.get('x-admin') === 'true';

    if (!isAdmin && (!authHeader || !authHeader.startsWith('Bearer '))) {
      return NextResponse.json(
        {
          error: {
            message: 'Authorization header is required',
            type: 'invalid_request_error',
            param: 'Authorization',
            code: 'missing_authorization',
          },
        },
        { status: 401 }
      );
    }

    // Demo: a single shared demo user. Replace with JWT session resolution.
    const userId = 'user-123';
    const usage = await QuotaManager.getUsageStats(userId);

    return NextResponse.json({
      userId,
      ...usage,
      percentage: usage.total > 0 ? Math.round((usage.used / usage.total) * 100) : 0,
    });
  } catch (error) {
    console.error('Get console usage error:', error);
    return NextResponse.json(
      { error: { message: 'Failed to load usage', type: 'api_error', param: null, code: 'internal_error' } },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';