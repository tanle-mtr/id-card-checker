import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages, temperature, max_tokens, stream } = body;

    // Validate request
    if (!model) {
      return NextResponse.json(
        {
          error: {
            message: 'model is required',
            type: 'invalid_request_error',
            param: 'model',
            code: 'missing_model',
          },
        },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            message: 'messages is required and must be a non-empty array',
            type: 'invalid_request_error',
            param: 'messages',
            code: 'invalid_messages',
          },
        },
        { status: 400 }
      );
    }

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

    // Call OpenAI service
    if (stream) {
      const stream = await OpenAIService.streamChatCompletion(
        { model, messages, temperature, max_tokens },
        apiKey
      );

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } else {
      // Non-stream response
      const response = await OpenAIService.createChatCompletion(
        { model, messages, temperature, max_tokens },
        apiKey
      );

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Chat completion error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            type: 'api_error',
            param: null,
            code: 'internal_error',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: {
          message: 'An unexpected error occurred',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
