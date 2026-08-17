import { Redis } from '@upstash/redis';
import { PaymentChannelConfig, PaymentConfig } from '@/types';
import { getDefaultChannels } from './paymentConfigDefaults';

let redis: Redis | null = null;
let redisChecked = false;

function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

const CONFIG_KEY = 'payment:config';
const SECRETS_KEY = 'payment:secrets';

interface SecretsMap {
  [channel: string]: string;
}

// In-memory fallback for environments without Redis (local dev / first run).
let memoryConfig: PaymentConfig | null = null;
const memorySecrets: SecretsMap = {};

export async function loadPaymentConfig(useSecrets = false): Promise<PaymentConfig> {
  const client = getRedis();
  const defaults: PaymentConfig = {
    updatedAt: '',
    updatedBy: '',
    channels: getDefaultChannels(),
  };
  if (!client) return withMemorySecrets(memoryConfig ?? defaults, useSecrets);

  try {
    const raw = await client.get<PaymentConfig>(CONFIG_KEY);
    const config = raw && Array.isArray(raw.channels) ? raw : defaults;
    if (!useSecrets) return config;

    const secrets = await client.get<SecretsMap>(SECRETS_KEY);
    return {
      ...config,
      channels: config.channels.map((c) => ({
        ...c,
        secretKey: secrets?.[c.channel] ?? c.secretKey ?? '',
      })),
    };
  } catch (err) {
    console.error('Failed to load payment config from Redis:', err);
    return withMemorySecrets(memoryConfig ?? defaults, useSecrets);
  }
}

function withMemorySecrets(config: PaymentConfig, useSecrets: boolean): PaymentConfig {
  if (!useSecrets) return config;
  return {
    ...config,
    channels: config.channels.map((c) => ({
      ...c,
      secretKey: memorySecrets[c.channel] ?? c.secretKey ?? '',
    })),
  };
}

export async function loadPaymentConfigWithSecrets(): Promise<PaymentConfig> {
  return loadPaymentConfig(true);
}

/**
 * Loads the config stripped of secret keys - safe to return to the
 * admin browser.
 */
export async function loadPublicPaymentConfig(): Promise<PaymentConfig> {
  const config = await loadPaymentConfig(false);
  return {
    ...config,
    updatedAt: config.updatedAt || '',
    channels: config.channels.map((c) => ({
      ...c,
      secretKey: c.secretKey ? '***' : '',
    })),
  };
}

export async function savePaymentConfig(config: PaymentConfig): Promise<PaymentConfig> {
  const client = getRedis();
  if (!client) {
    // Keep in-memory fallback for the current process.
    return persistConfig(config);
  }

  try {
    const secrets: SecretsMap = {};
    const publicChannels = config.channels.map((c) => {
      const copy: PaymentChannelConfig = { ...c };
      if (copy.secretKey && copy.secretKey !== '***') {
        secrets[c.channel] = copy.secretKey;
      }
      copy.secretKey = copy.secretKey === '***' ? '' : copy.secretKey;
      return copy;
    });

    const publicConfig: PaymentConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
      channels: publicChannels,
    };

    await client.set(CONFIG_KEY, publicConfig);
    await client.set(SECRETS_KEY, secrets);
    return publicConfig;
  } catch (err) {
    console.error('Failed to save payment config to Redis:', err);
    return persistConfig(config);
  }
}

function persistConfig(config: PaymentConfig): PaymentConfig {
  const secrets: SecretsMap = {};
  const publicChannels = config.channels.map((c) => {
    const copy: PaymentChannelConfig = { ...c };
    if (copy.secretKey && copy.secretKey !== '***') {
      secrets[c.channel] = copy.secretKey;
    }
    copy.secretKey = copy.secretKey === '***' ? '' : copy.secretKey;
    return copy;
  });

  const publicConfig: PaymentConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
    channels: publicChannels,
  };
  memoryConfig = publicConfig;
  Object.assign(memorySecrets, secrets);
  return publicConfig;
}