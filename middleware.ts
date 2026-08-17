import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if this is an API route
  if (path.startsWith('/api/')) {
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

    // Validate API key format
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

    // TODO: Validate API key against database
    // For now, just check if it has the right format
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
