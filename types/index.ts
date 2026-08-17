export type ModelLicense = 'MIT' | 'Apache-2.0' | 'LGPL-3.0' | 'GPL-3.0' | 'AGPL-3.0' | 'CC-BY-NC' | 'Other';

export type PaymentChannel = 'alipay' | 'wechat' | 'unionpay' | 'crypto';

export interface PaymentChannelConfig {
  channel: PaymentChannel;
  enabled: boolean;
  label: string;
  // Payment collection identifiers - configured by the admin to receive
  // funds into their own wallet / account.
  accountId: string; // merchant/appId or wallet address
  accountName: string; // owner display name
  secretKey?: string; // api secret / private key (stored server-side only)
  qrImageUrl?: string; // payment QR code image url
  currency: string; // CNY / USDT etc.
}

export interface PaymentConfig {
  updatedAt: string;
  updatedBy?: string;
  channels: PaymentChannelConfig[];
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  license: ModelLicense;
  description: string;
  maxTokens: number;
  pricing: {
    free: number;
    professional: number;
    team: number;
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  casdoorId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: 'free' | 'professional' | 'team';
  quota: {
    total: number;
    used: number;
    resetDate: Date;
  };
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'professional' | 'team';
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  modelId: string;
  tokensUsed: number;
  cost: number;
  timestamp: Date;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    param: string;
    code: string;
  };
}
