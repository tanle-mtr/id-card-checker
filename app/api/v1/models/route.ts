import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai';

export async function GET(request: NextRequest) {
  try {
    const models = OpenAIService.listModels();

    const response = {
      object: 'list',
      data: models.map(model => ({
        id: model.id,
        object: 'model',
        owned_by: model.provider,
        license: model.license,
        max_tokens: model.maxTokens,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get models error:', error);

    return NextResponse.json(
      {
        error: {
          message: 'Failed to retrieve models',
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
