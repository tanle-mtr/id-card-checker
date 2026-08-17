import { PaymentChannelConfig } from '@/types';

export function getDefaultChannels(): PaymentChannelConfig[] {
  return [
    {
      channel: 'alipay',
      enabled: false,
      label: '支付宝收款',
      accountId: '',
      accountName: '',
      secretKey: '',
      qrImageUrl: '',
      currency: 'CNY',
    },
    {
      channel: 'wechat',
      enabled: false,
      label: '微信收款',
      accountId: '',
      accountName: '',
      secretKey: '',
      qrImageUrl: '',
      currency: 'CNY',
    },
    {
      channel: 'unionpay',
      enabled: false,
      label: '云闪付收款',
      accountId: '',
      accountName: '',
      secretKey: '',
      qrImageUrl: '',
      currency: 'CNY',
    },
    {
      channel: 'crypto',
      enabled: false,
      label: '加密货币收款',
      accountId: '',
      accountName: '',
      secretKey: '',
      qrImageUrl: '',
      currency: 'USDT',
    },
  ];
}
