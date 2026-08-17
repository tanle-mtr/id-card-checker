'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('casdoor_token');
    if (token) {
      router.push('/console');
    }
  }, [router]);

  const handleLogin = () => {
    setLoading(true);
    const loginUrl = AuthService.getSigninUrl();
    window.location.href = loginUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">DS4</span>
          </div>
          <CardTitle className="text-2xl">登录 DS4 API Platform</CardTitle>
          <CardDescription>
            使用 Casdoor 进行安全的身份认证
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? '正在跳转...' : '使用 Casdoor 登录'}
          </Button>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">许可证说明</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              本平台使用 Apache-2.0、MIT、LGPL-3.0 等许可证的开源组件，允许商业使用。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
