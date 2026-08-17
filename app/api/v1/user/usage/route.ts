import { NextRequest, NextResponse } from 'next/server';
import { QuotaManager } from '@/lib/quota';

export async function GET(request: NextRequest) {
  try {
    // Get API key from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    const apiKey = authHeader.substring(7);

    // Validate API key
    if (!apiKey.startsWith('sk-ds4-')) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid API key format',
            type: 'invalid_request_error',
            param: 'apiKey',
            code: 'invalid_api_key',
          },
        },
        { status: 401 }
      );
    }

    // Extract user ID from API key
    const userId = 'user-' + apiKey.slice(-8);

    // Get usage stats
    const usage = await QuotaManager.getUsageStats(userId);

    const response = {
      used: usage.used,
      total: usage.total,
      percentage: Math.round((usage.used / usage.total) * 100),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get usage error:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to retrieve usage',
          type: 'api_error',
          param: null,
          code: 'internal_error',
        },
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
