import { PaymentConfig } from '@/types';
import {
  loadPaymentConfig as loadFromStore,
  loadPaymentConfigWithSecrets as loadWithSecretsFromStore,
  loadPublicPaymentConfig as loadPublicFromStore,
  savePaymentConfig as persistPaymentConfig,
} from './paymentConfigStore';
import { getDefaultChannels } from './paymentConfigDefaults';

export { getDefaultChannels };

/**
 * Loads payment configuration. Uses Upstash Redis when available,
 * otherwise falls back to in-memory defaults so the app builds and
 * runs even before the admin has saved a configuration.
 */
export async function loadPaymentConfig(): Promise<PaymentConfig> {
  return loadFromStore();
}

export async function loadPaymentConfigWithSecrets(): Promise<PaymentConfig> {
  return loadWithSecretsFromStore();
}

export async function loadPublicPaymentConfig(): Promise<PaymentConfig> {
  return loadPublicFromStore();
}

export async function savePaymentConfig(config: PaymentConfig): Promise<PaymentConfig> {
  return persistPaymentConfig(config);
}

export function validatePaymentConfig(config: PaymentConfig): { ok: boolean; error?: string } {
  if (!config || !Array.isArray(config.channels)) {
    return { ok: false, error: 'channels 必须为数组' };
  }
  for (const channel of config.channels) {
    if (!channel.channel) return { ok: false, error: 'channel 类型缺失' };
    if (channel.enabled && !channel.accountId.trim()) {
      return { ok: false, error: `渠道「${channel.label}」已启用但未填写收款账号` };
    }
  }
  return { ok: true };
}
