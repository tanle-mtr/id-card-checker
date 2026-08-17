import axios from 'axios';
import { PaymentChannel } from '@/types';
import { loadPaymentConfigWithSecrets } from './paymentConfigStore';

const DAXPAY_API_URL = process.env.DAXPAY_API_URL || 'http://localhost:8080';

export interface PaymentMethod {
  channel: PaymentChannel;
  label: string;
  accountId: string;
  accountName: string;
  qrImageUrl: string;
  currency: string;
}

/**
 * Resolves the enabled payment channels configured by the admin
 * (their own wallet / receiving account) and forwards them as the
 * DaxPay payment method list.
 */
export async function getEnabledPaymentMethods(): Promise<PaymentMethod[]> {
  const config = await loadPaymentConfigWithSecrets();
  return config.channels
    .filter((c) => c.enabled && c.accountId.trim())
    .map((c) => ({
      channel: c.channel,
      label: c.label,
      accountId: c.accountId,
      accountName: c.accountName,
      qrImageUrl: c.qrImageUrl || '',
      currency: c.currency || 'CNY',
    }));
}

export class DaxPayService {
  static async createPayment(
    orderId: string,
    userId: string,
    amount: number,
    plan: string,
    currency: string = 'CNY'
  ): Promise<any> {
    try {
      const appId = process.env.DAXPAY_APP_ID || '';
      const secretKey = process.env.DAXPAY_SECRET_KEY || '';

      const response = await axios.post(
        `${DAXPAY_API_URL}/api/payment/create`,
        {
          orderId,
          userId,
          amount,
          currency,
          plan,
          notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payment/callback`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-App-Id': appId,
            'X-Secret-Key': secretKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('DaxPay payment creation error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  static async queryPaymentStatus(orderId: string): Promise<any> {
    try {
      const appId = process.env.DAXPAY_APP_ID || '';
      const secretKey = process.env.DAXPAY_SECRET_KEY || '';

      const response = await axios.get(`${DAXPAY_API_URL}/api/payment/query/${orderId}`, {
        headers: {
          'X-App-Id': appId,
          'X-Secret-Key': secretKey,
        },
      });

      return response.data;
    } catch (error) {
      console.error('DaxPay payment query error:', error);
      throw new Error('Failed to query payment status');
    }
  }

  static async refundPayment(orderId: string, amount: number): Promise<any> {
    try {
      const appId = process.env.DAXPAY_APP_ID || '';
      const secretKey = process.env.DAXPAY_SECRET_KEY || '';

      const response = await axios.post(
        `${DAXPAY_API_URL}/api/payment/refund`,
        { orderId, amount },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-App-Id': appId,
            'X-Secret-Key': secretKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('DaxPay refund error:', error);
      throw new Error('Failed to process refund');
    }
  }

  static async createInvoice(userId: string, amount: number, description: string): Promise<any> {
    try {
      const appId = process.env.DAXPAY_APP_ID || '';
      const secretKey = process.env.DAXPAY_SECRET_KEY || '';

      const response = await axios.post(
        `${DAXPAY_API_URL}/api/invoice/create`,
        { userId, amount, description },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-App-Id': appId,
            'X-Secret-Key': secretKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('DaxPay invoice creation error:', error);
      throw new Error('Failed to create invoice');
    }
  }

  static async getPaymentMethods(): Promise<any> {
    try {
      const appId = process.env.DAXPAY_APP_ID || '';
      const secretKey = process.env.DAXPAY_SECRET_KEY || '';

      const response = await axios.get(`${DAXPAY_API_URL}/api/payment/methods`, {
        headers: {
          'X-App-Id': appId,
          'X-Secret-Key': secretKey,
        },
      });

      // Merge the admin-configured receiving accounts into the response
      // so payment pages know where to send funds.
      return {
        ...response.data,
        channels: await getEnabledPaymentMethods(),
      };
    } catch (error) {
      // If DaxPay is unavailable, still report the admin-configured channels.
      console.error('DaxPay payment methods error:', error);
      return { channels: await getEnabledPaymentMethods() };
    }
  }

  static async verifyPaymentSignature(signature: string, data: any): Promise<boolean> {
    // Implement signature verification logic
    // This would typically use HMAC-SHA256 or similar
    return true;
  }
}