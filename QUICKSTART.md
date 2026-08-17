# 快速部署指南

## 5分钟快速部署到 Vercel

### 1. 准备工作

1. **注册 Casdoor**
   - 访问 https://casdoor.org/
   - 创建实例、组织和应用
   - 记录 Client ID 和 Client Secret

2. **创建 Upstash Redis**
   - 访问 https://upstash.com/
   - 创建免费 Redis 实例
   - 记录 REST API URL 和 Token

3. **注册 DaxPay**
   - 访问 https://daxpay.org/
   - 创建应用
   - 记录 API URL、App ID 和 Secret Key

### 2. 本地测试

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 编辑 .env.local，填入上述获取的配置

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 3. Vercel 部署

#### 方式一：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 配置环境变量（按提示操作）
```

#### 方式二：使用 Vercel 网页界面

1. 访问 https://vercel.com/dashboard
2. 点击 "Add New" -> "Project"
3. 导入 GitHub 仓库
4. 点击 "Deploy"
5. 在 "Environment Variables" 中添加：
   ```
   CASDOOR_ORG_NAME=ds4-org
   CASDOOR_APP_NAME=ds4-platform
   CASDOOR_CLIENT_ID=your-client-id
   CASDOOR_CLIENT_SECRET=your-client-secret
   CASDOOR_REDIRECT_URI=https://your-domain.com/callback
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   DAXPAY_API_URL=https://your-daxpay-domain.com
   DAXPAY_APP_ID=your-app-id
   DAXPAY_SECRET_KEY=your-secret-key
   ```

### 4. 配置域名（可选）

1. 在 Vercel 中添加自定义域名
2. 配置 DNS 记录指向 Vercel
3. 在 Casdoor 中更新回调 URL

### 5. 测试部署

```bash
# 获取您的 API Key（在控制台页面）
# 然后测试 API
curl -X POST https://your-domain.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-ds4-your-api-key" \
  -d '{
    "model": "llama-3-70b",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

## 常见问题

### Q: Casdoor 登录失败？
A: 检查回调 URL 是否与 Casdoor 配置一致

### Q: Redis 连接失败？
A: 确认 Upstash URL 和 Token 正确

### Q: API 调用失败？
A: 检查 API Key 格式和用户配额

## 下一步

- 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 获取详细部署文档
- 查看 [API 文档](/docs) 了解接口详情
- 配置监控和告警

## 支持

如有问题，请提交 GitHub Issue 或联系 support@your-domain.com
