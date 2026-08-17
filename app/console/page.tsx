'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LicenseValidator } from '@/lib/license';
import { Model } from '@/types';

export default function Console() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [usage, setUsage] = useState<{ used: number; total: number } | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('casdoor_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load user data
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setUser({
        id: '本地演示用户',
        plan: 'free',
        apiKey: 'sk-ds4-（请在控制台生成）',
      });

      const res = await fetch('/api/user/usage', {
        headers: { 'x-admin': 'true' },
      });
      if (res.ok) {
        const data = await res.json();
        setUsage({ used: data.used || 0, total: data.total || 0 });
      } else {
        setUsage({ used: 0, total: 0 });
      }

      // Load available models
      setModels([
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
      ]);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('casdoor_token');
    localStorage.removeItem('casdoor_refresh_token');
    router.push('/login');
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(user?.apiKey || '');
    alert('API Key 已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>正在加载...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DS4</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">控制台</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">首页</Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost">文档</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              退出登录
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
            <CardDescription>
              您的账户信息和 API 密钥
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">用户 ID</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">当前套餐</label>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    user?.plan === 'free' ? 'bg-gray-100 text-gray-800' :
                    user?.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user?.plan === 'free' ? '免费版' : user?.plan === 'professional' ? '专业版' : '团队版'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm break-all">
                    {user?.apiKey}
                  </code>
                  <Button onClick={handleCopyApiKey} size="sm" variant="outline">
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quota Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>配额使用情况</CardTitle>
            <CardDescription>
              当前月份的 API 调用统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usage ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">已使用</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usage.used.toLocaleString()} / {usage.total.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(usage.used / usage.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* Available Models */}
        <Card>
          <CardHeader>
            <CardTitle>可用模型</CardTitle>
            <CardDescription>
              您可以使用的 AI 模型列表
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {models.map(model => (
                <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{model.provider}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      LicenseValidator.isCommercialFriendly(model.license) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {model.license}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
