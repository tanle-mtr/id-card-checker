import Sdk from 'casdoor-js-sdk';

export interface AuthConfig {
  serverUrl: string;
  clientId: string;
  appName: string;
  organizationName: string;
  redirectPath?: string;
  scope?: string;
}

const config: AuthConfig = {
  serverUrl: process.env.NEXT_PUBLIC_CASDOOR_SERVER_URL || 'https://casdoor.example.com',
  clientId: process.env.NEXT_PUBLIC_CASDOOR_CLIENT_ID || '',
  appName: process.env.NEXT_PUBLIC_CASDOOR_APP_NAME || 'ds4-platform',
  organizationName: process.env.NEXT_PUBLIC_CASDOOR_ORG_NAME || 'ds4-org',
  redirectPath: '/callback',
  scope: 'openid profile email',
};

function getSdk(): Sdk {
  return new Sdk(config);
}

export class AuthService {
  static getSigninUrl(): string {
    return getSdk().getSigninUrl();
  }

  static getSignupUrl(): string {
    return getSdk().getSignupUrl(true);
  }

  static async exchangeForAccessToken(code: string): Promise<any> {
    const sdk = getSdk();
    const response = await sdk.exchangeForAccessToken({ code });
    return response;
  }

  static async getUserInfo(accessToken: string): Promise<any> {
    const sdk = getSdk();
    const response = await sdk.getUserInfo(accessToken);
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`);
    }
    return response.json();
  }

  static parseAccessToken(accessToken: string): any {
    return getSdk().parseAccessToken(accessToken);
  }

  static async refreshAccessToken(refreshToken: string): Promise<any> {
    const sdk = getSdk();
    return sdk.refreshAccessToken(refreshToken);
  }

  static validateToken(accessToken: string): boolean {
    if (!accessToken) return false;
    try {
      const parsed = this.parseAccessToken(accessToken);
      const exp = parsed?.payload?.exp;
      if (typeof exp === 'number') {
        return exp * 1000 > Date.now();
      }
      return accessToken.length > 0;
    } catch {
      return false;
    }
  }
}
