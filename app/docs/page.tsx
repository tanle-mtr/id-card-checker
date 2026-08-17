import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const streamExample = `data: {"id":"chatcmpl-123456","object":"chat.completion.chunk","created":1677652288,"model":"llama-3-70b","choices":[{"index":0,"delta":{"content":"你好"},"finish_reason":null}]}

data: {"id":"chatcmpl-123456","object":"chat.completion.chunk","created":1677652288,"model":"llama-3-70b","choices":[{"index":0,"delta":{"content":"！"},"finish_reason":null}]}

data: [DONE]`;

export default function Docs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">DS4</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">API 文档</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">首页</Button>
            </Link>
            <Link href="/console">
              <Button variant="ghost">控制台</Button>
            </Link>
            <Link href="/admin">
              <Button>管理后台</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          API 文档
        </h1>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>概述</CardTitle>
            <CardDescription>
              DS4 API Platform 提供完全兼容 OpenAI 的 API 接口
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              本平台提供 OpenAI 兼容的 API 接口，支持流式和非流式响应。所有 API 请求都需要在 HTTP Header 中提供 API Key 进行身份验证。
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">认证方式</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                在请求头中添加： <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Authorization: Bearer sk-ds4-your-api-key</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API 端点</CardTitle>
            <CardDescription>
              支持的 API 接口列表
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">POST</span>
                  <code className="text-sm">/v1/chat/completions</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  创建聊天补全，支持流式和非流式响应
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">GET</span>
                  <code className="text-sm">/v1/models</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  获取可用模型列表
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">GET</span>
                  <code className="text-sm">/v1/user/usage</code>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  获取当前用户的用量统计
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat Completions API */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>创建聊天补全</CardTitle>
            <CardDescription>
              <code className="text-sm">POST /v1/chat/completions</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2">请求参数</h4>
            <div className="overflow-x-auto mb-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
{`{
  "model": "llama-3-70b",
  "messages": [
    {
      "role": "user",
      "content": "你好，请介绍一下自己"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}`}
              </pre>
            </div>

            <h4 className="font-semibold mb-2">请求头</h4>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <code className="text-sm text-gray-600 dark:text-gray-400">
                Authorization: Bearer sk-ds4-your-api-key
              </code>
            </div>

            <h4 className="font-semibold mb-2">响应示例（非流式）</h4>
            <div className="overflow-x-auto mb-4">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
{`{
  "id": "chatcmpl-123456",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "llama-3-70b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "你好！我是 Llama 3 70B，由 Meta 开发的大型语言模型..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 100,
    "total_tokens": 125
  }
}`}
              </pre>
            </div>

            <h4 className="font-semibold mb-2">流式响应</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              设置 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">stream: true</code> 启用流式响应。
            </p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">{streamExample}</pre>
          </CardContent>
        </Card>

        {/* Models API */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>获取模型列表</CardTitle>
            <CardDescription>
              <code className="text-sm">GET /v1/models</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
{`GET /v1/models
Authorization: Bearer sk-ds4-your-api-key

{
  "object": "list",
  "data": [
    {
      "id": "llama-3-70b",
      "object": "model",
      "owned_by": "Meta",
      "license": "Apache-2.0"
    },
    {
      "id": "qwen-72b",
      "object": "model",
      "owned_by": "Alibaba",
      "license": "Apache-2.0"
    }
  ]
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Usage API */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>获取用量统计</CardTitle>
            <CardDescription>
              <code className="text-sm">GET /v1/user/usage</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm">
{`GET /v1/user/usage
Authorization: Bearer sk-ds4-your-api-key

{
  "used": 15000,
  "total": 1000000,
  "percentage": 1.5
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>速率限制</CardTitle>
            <CardDescription>
              不同套餐的请求频率限制
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">套餐</th>
                    <th className="text-left py-2 px-4">每分钟请求数</th>
                    <th className="text-left py-2 px-4">每秒请求数</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">免费版</td>
                    <td className="py-2 px-4">30</td>
                    <td className="py-2 px-4">0.5</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">专业版</td>
                    <td className="py-2 px-4">100</td>
                    <td className="py-2 px-4">1.5</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">团队版</td>
                    <td className="py-2 px-4">500</td>
                    <td className="py-2 px-4">8.3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Model Licenses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>模型许可证</CardTitle>
            <CardDescription>
              支持的许可证类型和商用权限
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">MIT License</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    允许商业使用、修改和分发
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">Apache-2.0</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    允许商业使用，需保留版权声明
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">LGPL-3.0</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    允许动态链接，需开放修改部分
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <h4 className="font-semibold">GPL-3.0 / AGPL-3.0</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Copyleft 许可证，禁止商用
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
