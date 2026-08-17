import { ChatCompletionRequest, ChatCompletionResponse, Model } from '@/types';
import { QuotaManager } from './quota';
import { LicenseValidator } from './license';

export class OpenAIService {
  static readonly AVAILABLE_MODELS: Model[] = [
    {
      id: 'llama-3-70b',
      name: 'Llama 3 70B',
      provider: 'Meta',
      license: 'Apache-2.0',
      description: 'Meta\'s Llama 3 70B parameter model',
      maxTokens: 8192,
      pricing: {
        free: 0.01,
        professional: 0.002,
        team: 0.001,
      },
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'qwen-72b',
      name: 'Qwen 72B',
      provider: 'Alibaba',
      license: 'Apache-2.0',
      description: 'Alibaba\'s Qwen 72B parameter model',
      maxTokens: 8192,
      pricing: {
        free: 0.01,
        professional: 0.002,
        team: 0.001,
      },
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'deepseek-coder',
      name: 'DeepSeek Coder',
      provider: 'DeepSeek',
      license: 'MIT',
      description: 'DeepSeek Coder model optimized for coding tasks',
      maxTokens: 8192,
      pricing: {
        free: 0.005,
        professional: 0.001,
        team: 0.0005,
      },
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'Mistral AI',
      license: 'Apache-2.0',
      description: 'Mistral AI\'s 7B parameter model',
      maxTokens: 8192,
      pricing: {
        free: 0.005,
        professional: 0.001,
        team: 0.0005,
      },
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  static getModelById(modelId: string): Model | undefined {
    return this.AVAILABLE_MODELS.find(m => m.id === modelId);
  }

  static async createChatCompletion(request: ChatCompletionRequest, apiKey: string): Promise<ChatCompletionResponse> {
    const model = this.getModelById(request.model);
    if (!model) {
      throw new Error(`Model '${request.model}' not found`);
    }

    if (!LicenseValidator.isCommercialFriendly(model.license)) {
      throw new Error(`Model '${model.name}' is not available for commercial use due to license restrictions`);
    }

    if (!model.isAvailable) {
      throw new Error(`Model '${model.name}' is currently unavailable`);
    }

    // TODO: Implement actual model inference here
    // This would connect to the actual LLM provider
    const response = await this.mockInference(request, model);

    // Record usage
    const userId = 'user-' + apiKey.slice(-8);
    await QuotaManager.incrementUsage(userId, response.usage.total_tokens, response.usage.total_tokens * model.pricing.professional);

    return response;
  }

  private static async mockInference(request: ChatCompletionRequest, model: Model): Promise<ChatCompletionResponse> {
    // Mock response for demonstration
    const messages = request.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    return {
      id: `chatcmpl-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'This is a mock response. In production, this would call the actual LLM provider.',
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: messages.reduce((acc, m) => acc + m.content.length / 4, 0),
        completion_tokens: 100,
        total_tokens: 200,
      },
    };
  }

  static listModels(): Model[] {
    return this.AVAILABLE_MODELS.filter(m => m.isAvailable);
  }

  static async streamChatCompletion(request: ChatCompletionRequest, apiKey: string): Promise<AsyncIterable<string>> {
    const model = this.getModelById(request.model);
    if (!model) {
      throw new Error(`Model '${request.model}' not found`);
    }

    if (!LicenseValidator.isCommercialFriendly(model.license)) {
      throw new Error(`Model '${model.name}' is not available for commercial use due to license restrictions`);
    }

    if (!model.isAvailable) {
      throw new Error(`Model '${model.name}' is currently unavailable`);
    }

    // TODO: Implement actual streaming inference here
    const stream = this.mockStream(request, model);

    // Record usage
    const userId = 'user-' + apiKey.slice(-8);
    await QuotaManager.incrementUsage(userId, 200, 200 * model.pricing.professional);

    return stream;
  }

  private static async *mockStream(request: ChatCompletionRequest, model: Model): AsyncIterable<string> {
    const response = await this.mockInference(request, model);

    // Simulate streaming by yielding chunks
    const content = response.choices[0].message.content;
    const chunks = content.split('');

    for (const chunk of chunks) {
      yield `data: ${JSON.stringify({
        id: response.id,
        object: 'chat.completion.chunk',
        created: response.created,
        model: request.model,
        choices: [{
          index: 0,
          delta: {
            content: chunk,
          },
          finish_reason: null,
        }],
      })}\n\n`;

      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    yield `data: ${JSON.stringify({
      id: response.id,
      object: 'chat.completion.chunk',
      created: response.created,
      model: request.model,
      choices: [{
        index: 0,
        delta: {},
        finish_reason: 'stop',
      }],
    })}\n\n`;
  }
}
