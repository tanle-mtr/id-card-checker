'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Model, User, Subscription, PaymentChannelConfig, PaymentConfig } from '@/types';
import { LicenseValidator } from '@/lib/license';
import { getDefaultChannels } from '@/lib/paymentConfig';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'models' | 'users' | 'subscriptions' | 'revenue' | 'payment'>('models');
  const [models, setModels] = useState<Model[]>([]);
  const [newModel, setNewModel] = useState<Partial<Model>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [revenue, setRevenue] = useState({ totalUsers: 0, totalUsage: 0, totalRevenue: 0 });
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    updatedAt: '',
    updatedBy: '',
    channels: getDefaultChannels(),
  });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      // TODO: Load actual data from database
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
      ]);

      setUsers([
        {
          id: 'user-1',
          casdoorId: 'casdoor-user-1',
          email: 'user1@example.com',
          name: '张三',
          plan: 'professional',
          quota: {
            total: 5000000,
            used: 1250000,
            resetDate: new Date(),
          },
          apiKey: 'sk-ds4-user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          casdoorId: 'casdoor-user-2',
          email: 'user2@example.com',
          name: '李四',
          plan: 'team',
          quota: {
            total: 10000000,
            used: 5000000,
            resetDate: new Date(),
          },
          apiKey: 'sk-ds4-user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      setSubscriptions([
        {
          id: 'sub-1',
          userId: 'user-1',
          plan: 'professional',
          amount: 99,
          currency: 'CNY',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          plan: 'team',
          amount: 299,
          currency: 'CNY',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
        },
      ]);

      setRevenue({
        totalUsers: 1250,
        totalUsage: 50000000,
        totalRevenue: 125000,
      });

      // Load admin payment configuration
      const paymentRes = await fetch('/api/admin/payment-config', {
        headers: { 'x-admin-key': getAdminKey() },
      });
      if (paymentRes.ok) {
        const data = await paymentRes.json();
        if (Array.isArray(data.channels) && data.channels.length > 0) {
          setPaymentConfig(data);
        }
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdminKey = (): string => {
    return window.localStorage.getItem('admin_key') || '';
  };

  const handleSavePaymentConfig = async () => {
    setPaymentSaving(true);
    setPaymentStatus('');
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': getAdminKey(),
        },
        body: JSON.stringify(paymentConfig),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message || '保存失败');
      }
      const saved = await res.json();
      setPaymentConfig(saved);
      setPaymentStatus('收款配置已保存成功');
    } catch (error) {
      setPaymentStatus(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleUpdateChannel = (index: number, field: keyof PaymentChannelConfig, value: string | boolean) => {
    setPaymentConfig((prev) => {
      const channels = prev.channels.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      );
      return { ...prev, channels };
    });
  };

  const handleAddModel = () => {
    if (!newModel.name || !newModel.license || !newModel.provider) {
      alert('请填写完整的模型信息');
      return;
    }

    const license = LicenseValidator.validateLicenseString(newModel.license);
    if (!license) {
      alert('无效的许可证类型');
      return;
    }

    if (!LicenseValidator.isCommercialFriendly(license)) {
      alert('该许可证不允许商用');
      return;
    }

    const model: Model = {
      id: newModel.id || `model-${Date.now()}`,
      name: newModel.name,
      provider: newModel.provider,
      license: license,
      description: newModel.description || '',
      maxTokens: newModel.maxTokens || 8192,
      pricing: {
        free: newModel.pricing?.free || 0.01,
        professional: newModel.pricing?.professional || 0.002,
        team: newModel.pricing?.team || 0.001,
      },
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setModels([...models, model]);
    setNewModel({});
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('确定要删除这个模型吗？')) {
      setModels(models.filter(m => m.id !== modelId));
    }
  };

  const handleToggleModelAvailability = (modelId: string) => {
    setModels(models.map(m => 
      m.id === modelId ? { ...m, isAvailable: !m.isAvailable } : m
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleDeleteSubscription = (subscriptionId: string) => {
    if (confirm('确定要删除这个订阅吗？')) {
      setSubscriptions(subscriptions.filter(s => s.id !== subscriptionId));
    }
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
            <span className="text-xl font-bold text-gray-900 dark:text-white">管理后台</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">首页</Button>
            </Link>
            <Link href="/console">
              <Button variant="ghost">控制台</Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost">文档</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>总用户数</CardTitle>
              <CardDescription>活跃用户数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{revenue.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>总使用量</CardTitle>
              <CardDescription>API 调用总次数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{revenue.totalUsage.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>总营收</CardTitle>
              <CardDescription>累计订阅收入</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">¥{revenue.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === 'models' ? 'default' : 'outline'}
            onClick={() => setActiveTab('models')}
          >
            模型管理
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            用户管理
          </Button>
          <Button
            variant={activeTab === 'subscriptions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('subscriptions')}
          >
            订阅管理
          </Button>
          <Button
            variant={activeTab === 'revenue' ? 'default' : 'outline'}
            onClick={() => setActiveTab('revenue')}
          >
            营收统计
          </Button>
          <Button
            variant={activeTab === 'payment' ? 'default' : 'outline'}
            onClick={() => setActiveTab('payment')}
          >
            收款设置
          </Button>
        </div>

        {/* Models Tab */}
        {activeTab === 'models' && (
          <Card>
            <CardHeader>
              <CardTitle>模型管理</CardTitle>
              <CardDescription>
                添加和管理可用的 AI 模型
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Model Form */}
                <div>
                  <h4 className="font-semibold mb-4">添加新模型</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>模型 ID</Label>
                      <Input
                        placeholder="llama-3-70b"
                        value={newModel.id || ''}
                        onChange={(e) => setNewModel({ ...newModel, id: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>模型名称</Label>
                      <Input
                        placeholder="Llama 3 70B"
                        value={newModel.name || ''}
                        onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>提供商</Label>
                      <Input
                        placeholder="Meta"
                        value={newModel.provider || ''}
                        onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>许可证</Label>
                      <Select
                        value={newModel.license || ''}
                        onValueChange={(value) => setNewModel({ ...newModel, license: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择许可证" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MIT">MIT License</SelectItem>
                          <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                          <SelectItem value="LGPL-3.0">LGPL-3.0</SelectItem>
                          <SelectItem value="GPL-3.0">GPL-3.0 (拒绝)</SelectItem>
                          <SelectItem value="AGPL-3.0">AGPL-3.0 (拒绝)</SelectItem>
                          <SelectItem value="CC-BY-NC">CC-BY-NC (拒绝)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>描述</Label>
                      <Textarea
                        placeholder="模型描述..."
                        value={newModel.description || ''}
                        onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>最大 Token 数</Label>
                      <Input
                        type="number"
                        placeholder="8192"
                        value={newModel.maxTokens || ''}
                        onChange={(e) => setNewModel({ ...newModel, maxTokens: parseInt(e.target.value) })}
                      />
                    </div>
                    <Button onClick={handleAddModel} className="w-full">
                      添加模型
                    </Button>
                  </div>
                </div>

                {/* Model List */}
                <div>
                  <h4 className="font-semibold mb-4">已添加的模型</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {models.map(model => (
                      <div key={model.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{model.provider}</div>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            LicenseValidator.isCommercialFriendly(model.license) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {model.license}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{model.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">最大: {model.maxTokens} tokens</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={model.isAvailable ? 'default' : 'outline'}
                              onClick={() => handleToggleModelAvailability(model.id)}
                            >
                              {model.isAvailable ? '启用' : '禁用'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteModel(model.id)}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>
                管理平台用户和配额
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.plan === 'free' ? 'bg-gray-100 text-gray-800' :
                        user.plan === 'professional' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.plan === 'free' ? '免费版' : user.plan === 'professional' ? '专业版' : '团队版'}
                      </span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {user.apiKey}
                      </code>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <Card>
            <CardHeader>
              <CardTitle>订阅管理</CardTitle>
              <CardDescription>
                管理用户订阅和套餐
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">订阅 #{sub.id}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        用户: {users.find(u => u.id === sub.userId)?.name || '未知'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">¥{sub.amount}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {sub.status === 'active' ? '活跃' : '已过期'}
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSubscription(sub.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <Card>
            <CardHeader>
              <CardTitle>营收统计</CardTitle>
              <CardDescription>
                查看平台整体营收数据
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">总订阅收入</div>
                    <div className="text-3xl font-bold text-blue-600">¥{revenue.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">活跃用户数</div>
                    <div className="text-3xl font-bold text-green-600">{revenue.totalUsers}</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">总 API 调用量</div>
                    <div className="text-3xl font-bold text-purple-600">{revenue.totalUsage.toLocaleString()}</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">月均收入</div>
                    <div className="text-3xl font-bold text-orange-600">¥{Math.round(revenue.totalRevenue / 12).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">套餐分布</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">免费版用户</div>
                      <div className="text-2xl font-bold">{users.filter(u => u.plan === 'free').length}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">专业版用户</div>
                      <div className="text-2xl font-bold">{users.filter(u => u.plan === 'professional').length}</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">团队版用户</div>
                      <div className="text-2xl font-bold">{users.filter(u => u.plan === 'team').length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Config Tab */}
        {activeTab === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>收款设置</CardTitle>
              <CardDescription>
                管理员可在此配置各支付渠道的收款账号（打款到您自己的钱包/账户）。
                配置保存到 Upstash Redis，密钥仅在服务端保存。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium mb-1">管理密钥 (ADMIN_API_KEY)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  请先在 Vercel 环境变量中设置 <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">ADMIN_API_KEY</code>，
                  然后在下框输入同一密钥用于解锁保存操作。
                </p>
                <Input
                  type="password"
                  placeholder="输入 ADMIN_API_KEY"
                  defaultValue=""
                  onChange={(e) => window.localStorage.setItem('admin_key', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="space-y-6">
                {paymentConfig.channels.map((channel, index) => (
                  <div key={channel.channel} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={channel.enabled}
                        onChange={(e) => handleUpdateChannel(index, 'enabled', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                      />
                      <h4 className="font-semibold">{channel.label}</h4>
                      {channel.enabled ? (
                        <span className="ml-auto px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">已启用</span>
                      ) : (
                        <span className="ml-auto px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">未启用</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>收款账号 / 商户号 / 钱包地址</Label>
                        <Input
                          placeholder="例如：支付宝账号 / 微信商户号 / USDT 地址"
                          value={channel.accountId}
                          onChange={(e) => handleUpdateChannel(index, 'accountId', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>账户名称</Label>
                        <Input
                          placeholder="例如：张三（个人）或公司名"
                          value={channel.accountName}
                          onChange={(e) => handleUpdateChannel(index, 'accountName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>密钥 / 私钥（仅在服务端保存）</Label>
                        <Input
                          type="password"
                          placeholder={channel.secretKey && channel.secretKey !== '***' ? '已保存' : '填写 API 密钥或私钥'}
                          value={channel.secretKey === '***' ? '' : channel.secretKey || ''}
                          onChange={(e) => handleUpdateChannel(index, 'secretKey', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>收款二维码图片 URL</Label>
                        <Input
                          placeholder="https://.../qr.png（可留空）"
                          value={channel.qrImageUrl || ''}
                          onChange={(e) => handleUpdateChannel(index, 'qrImageUrl', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>币种</Label>
                        <Input
                          placeholder="CNY / USDT"
                          value={channel.currency}
                          onChange={(e) => handleUpdateChannel(index, 'currency', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-4">
                  <Button onClick={handleSavePaymentConfig} disabled={paymentSaving} className="bg-blue-600 hover:bg-blue-700">
                    {paymentSaving ? '保存中...' : '保存收款配置'}
                  </Button>
                  {paymentStatus && (
                    <span className={`text-sm ${paymentStatus.startsWith('失败') || paymentStatus.startsWith('保存失败') ? 'text-red-600' : 'text-green-600'}`}>
                      {paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
