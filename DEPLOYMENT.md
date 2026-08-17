# DS4 API Platform 部署指南

## 目录
1. [前置要求](#前置要求)
2. [环境配置](#环境配置)
3. [本地开发](#本地开发)
4. [Vercel 部署](#vercel-部署)
5. [生产环境配置](#生产环境配置)
6. [许可证说明](#许可证说明)

## 前置要求

### 必需服务
- Node.js 18+
- npm 或 pnpm
- Vercel 账户
- Casdoor 实例
- Upstash Redis
- DaxPay 实例

### 可选服务
- PostgreSQL (用于生产环境数据库)
- S3 (用于模型文件存储)

## 环境配置

### 1. 复制环境变量文件
```bash
cp .env.example .env.local
```

### 2. 配置 Casdoor

#### 创建 Casdoor 实例
1. 访问 [Casdoor 官网](https://casdoor.org/) 并创建实例
2. 创建组织 (Organization)
3. 创建应用 (Application)
4. 配置回调 URL: `https://your-domain.com/callback`

#### 获取配置信息
在 Casdoor 后台获取：
- Organization name
- Application name
- Client ID
- Client Secret

### 3. 配置 Upstash Redis

1. 访问 [Upstash](https://upstash.com/) 创建 Redis 实例
2. 获取 REST API URL 和 Token
3. 在 `.env.local` 中配置：
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 4. 配置 DaxPay

1. 访问 [DaxPay](https://daxpay.org/) 创建应用
2. 获取 API URL、App ID 和 Secret Key
3. 在 `.env.local` 中配置：
```env
DAXPAY_API_URL=https://your-daxpay-domain.com
DAXPAY_APP_ID=your-app-id
DAXPAY_SECRET_KEY=your-secret-key
```

## 本地开发

### 1. 安装依赖
```bash
npm install
```

### 2. 运行开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用

### 3. 测试 API
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ds4-test-key" \
  -d '{
    "model": "llama-3-70b",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

## Vercel 部署

### 方式一：通过 Vercel CLI

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录 Vercel
```bash
vercel login
```

#### 3. 部署项目
```bash
vercel
```

#### 4. 配置环境变量
在部署过程中，Vercel 会提示配置环境变量。输入从 `.env.local` 复制的所有变量。

#### 5. 设置自定义域名（可选）
```bash
vercel domains add your-domain.com
```

### 方式二：通过 Vercel 网页界面

#### 1. 导入项目
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New" -> "Project"
3. 导入您的 Git 仓库

#### 2. 配置项目设置
- **Framework Preset**: Next.js
- **Root Directory**: . (当前目录)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

#### 3. 配置环境变量
1. 进入 "Settings" -> "Environment Variables"
2. 添加所有必需的环境变量

#### 4. 部署
点击 "Deploy" 按钮

## 生产环境配置

### 1. 数据库配置（推荐）
对于生产环境，建议使用 PostgreSQL：

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ds4_platform
```

安装依赖：
```bash
npm install pg
```

### 2. 模型存储配置
使用 S3 存储模型文件：

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=ds4-models
```

### 3. 安全配置
- 启用 HTTPS
- 设置 CORS 策略
- 配置速率限制
- 启用日志记录

### 4. 监控和告警
- 集成 Sentry 用于错误追踪
- 配置 Vercel Analytics
- 设置 Upstash 监控

## 许可证说明

### 项目使用的开源组件

#### 核心框架
- **Next.js**: MIT License - 允许商用
- **React**: MIT License - 允许商用
- **TypeScript**: Apache-2.0 - 允许商用

#### UI 组件
- **Radix UI**: MIT License - 允许商用
- **Lucide Icons**: MIT License - 允许商用
- **Tailwind CSS**: MIT License - 允许商用

#### 功能库
- **casdoor-js-sdk**: Apache-2.0 - 允许商用
- **@upstash/redis**: MIT License - 允许商用
- **openai**: MIT License - 允许商用
- **zod**: MIT License - 允许商用
- **nanoid**: MIT License - 允许商用

#### 支付集成
- **DaxPay (dromara/dax-pay)**: LGPL-3.0 - 允许商用（动态链接，通过 REST API 调用，不打包为 npm 依赖）
- **axios**: MIT License - 允许商用

### 商用友好性

所有使用的开源组件都允许商业使用：
- ✅ MIT License
- ✅ Apache-2.0
- ✅ LGPL-3.0
- ❌ GPL-3.0 (未使用)
- ❌ AGPL-3.0 (未使用)
- ❌ CC-BY-NC (未使用)

## 常见问题

### 1. Casdoor 登录失败
- 检查回调 URL 是否正确
- 确认应用配置已启用
- 查看浏览器控制台错误信息

### 2. Redis 连接失败
- 验证 Upstash URL 和 Token
- 检查网络连接
- 确认 Redis 实例状态

### 3. API Key 鉴权失败
- 确认 API Key 格式正确
- 检查 Authorization header 格式
- 验证用户是否已登录

### 4. 模型调用失败
- 确认模型已启用
- 检查许可证是否允许商用
- 验证配额是否充足

## 维护建议

### 定期更新
- 定期更新依赖包
- 关注安全公告
- 及时修复已知漏洞

### 监控指标
- API 调用量
- 错误率
- 响应时间
- 用户活跃度

### 备份策略
- 定期备份数据库
- 保存配置文件
- 版本控制代码

## 技术支持

- **GitHub Issues**: [提交问题](https://github.com/your-repo/issues)
- **文档**: [API 文档](https://your-domain.com/docs)
- **Email**: support@your-domain.com

## 许可证

本项目采用 MIT License，允许商业使用。详见 [LICENSE](LICENSE) 文件。
