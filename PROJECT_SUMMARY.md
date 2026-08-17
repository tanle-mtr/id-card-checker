# DS4 API Platform - 项目总结

## 📦 项目概述

这是一个基于 DS4（无依赖）的 API 开放平台，提供了完整的企业级 AI 服务解决方案，支持多模型、配额管理和 OpenAI 兼容接口。

## 🎯 核心功能

### 1. 多模型支持
- **Llama 3 70B** (Apache-2.0) - Meta 的 70B 参数模型
- **Qwen 72B** (Apache-2.0) - 阿里巴巴的 72B 参数模型
- **DeepSeek Coder** (MIT) - 专门为代码优化的模型
- **Mistral 7B** (Apache-2.0) - Mistral AI 的 7B 参数模型

### 2. OpenAI 兼容 API
- 完全兼容 OpenAI 的 `/v1/chat/completions` 端点
- 支持流式和非流式响应
- 标准的 OpenAI 格式响应
- 流式 SSE 支持

### 3. 配额管理
- 基于 Upstash Redis 的分布式配额系统
- API Key 鉴权和限流
- 月度配额自动重置
- 实时用量统计
- 多套餐支持（免费/专业/团队）

### 4. 许可证合规
- 自动校验模型许可证
- 只允许 MIT、Apache-2.0、LGPL-3.0 等商用友好许可证
- 拒绝 GPL、AGPL、CC-BY-NC 等禁止商用许可证
- 详细的许可证说明

### 5. Casdoor 集成
- OAuth2.0 标准认证
- 安全的用户登录
- Token 管理
- 完整的回调处理

### 6. DaxPay 支付集成
- 多种支付方式支持（支付宝/微信/云闪付）
- 订阅管理
- 发票创建
- 退款处理
- 支付状态查询

### 7. 管理后台
- **模型管理**：添加/删除/启用/禁用模型
- **用户管理**：查看和管理用户信息
- **订阅管理**：管理用户订阅和套餐
- **营收统计**：查看平台整体营收数据

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 15 + TypeScript
- **UI 库**: Radix UI + Tailwind CSS
- **状态管理**: React Hooks + Context
- **图标**: Lucide React
- **样式**: Tailwind CSS

### 后端
- **运行时**: Node.js + Next.js API Routes
- **认证**: Casdoor OAuth2
- **数据库**: Upstash Redis (配额)
- **支付**: DaxPay SDK
- **API**: RESTful API

### 中间件
- **API Key 鉴权**: Next.js Middleware
- **CORS 处理**: 全局配置
- **错误处理**: 统一错误处理

## 📁 项目结构

```
ds4-api-platform/
├── app/                          # Next.js 应用目录
│   ├── api/                      # API 路由
│   │   └── v1/                   # v1 API 版本
│   │       ├── chat/completions/ # 聊天补全 API
│   │       ├── models/           # 模型列表 API
│   │       └── user/usage/       # 用量统计 API
│   ├── admin/                    # 管理后台页面
│   ├── callback/                 # OAuth 回调页面
│   ├── console/                  # 用户控制台
│   ├── docs/                     # API 文档页面
│   ├── login/                    # 登录页面
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式
├── components/                   # React 组件
│   └── ui/                       # UI 组件库
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/                          # 核心库函数
│   ├── auth.ts                   # Casdoor 认证
│   ├── openai.ts                 # OpenAI 服务
│   ├── quota.ts                  # 配额管理
│   ├── license.ts                # 许可证校验
│   ├── payment.ts                # 支付集成
│   ├── apiKey.ts                 # API Key 管理
│   └── utils.ts                  # 工具函数
├── types/                        # TypeScript 类型
│   └── index.ts                  # 类型定义
├── middleware.ts                 # Next.js 中间件
├── next.config.js                # Next.js 配置
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.js            # Tailwind 配置
├── postcss.config.js             # PostCSS 配置
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略文件
├── README.md                     # 项目说明
├── DEPLOYMENT.md                 # 部署指南
├── QUICKSTART.md                 # 快速开始
└── PROJECT_VERIFICATION.md       # 项目验证报告
```

## 🔐 安全特性

1. **API Key 鉴权**：所有 API 请求都需要有效的 API Key
2. **OAuth2 认证**：用户登录使用 Casdoor OAuth2.0
3. **许可证校验**：自动校验模型许可证，防止商用不友好模型
4. **配额限制**：基于 Redis 的分布式限流
5. **CORS 配置**：安全的跨域请求处理
6. **错误处理**：统一的错误处理和日志记录

## 📊 API 端点

### 聊天补全
```
POST /v1/chat/completions
```
- 支持流式和非流式响应
- 标准的 OpenAI 格式
- 自动配额扣除

### 模型列表
```
GET /v1/models
```
- 获取所有可用模型
- 包含许可证信息

### 用量统计
```
GET /v1/user/usage
```
- 查看用户配额使用情况
- 实时用量统计

## 🚀 部署方式

### Vercel 部署
```bash
npm install -g vercel
vercel login
vercel
```

### 本地开发
```bash
npm install
npm run dev
```

## 📋 许可证

### 项目许可证
- **MIT License** - 允许商业使用、修改和分发

### 依赖组件许可证
- Next.js: MIT License ✅
- React: MIT License ✅
- Casdoor: Apache-2.0 License ✅
- DaxPay: LGPL-3.0 License ✅
- Upstash Redis: MIT License ✅
- OpenAI SDK: MIT License ✅
- Tailwind CSS: MIT License ✅

**所有组件都允许商业使用！**

## 🎨 UI 设计

- **响应式设计**：支持移动端、平板、桌面
- **深色模式**：完整的深色主题支持
- **现代设计**：使用 Tailwind CSS 的现代设计风格
- **用户体验**：流畅的动画和交互效果

## 📈 性能优化

- **代码分割**：自动代码分割和懒加载
- **缓存策略**：智能缓存配置
- **CDN 支持**：支持 Vercel CDN
- **优化图片**：图片优化和懒加载

## 🔧 配置说明

### 环境变量
```env
# Casdoor
CASDOOR_ORG_NAME=ds4-org
CASDOOR_APP_NAME=ds4-platform
CASDOOR_CLIENT_ID=your-client-id
CASDOOR_CLIENT_SECRET=your-client-secret
CASDOOR_REDIRECT_URI=https://your-domain.com/callback

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# DaxPay
DAXPAY_API_URL=https://your-daxpay-domain.com
DAXPAY_APP_ID=your-app-id
DAXPAY_SECRET_KEY=your-secret-key
```

## 📚 文档

- [README.md](README.md) - 项目说明
- [DEPLOYMENT.md](DEPLOYMENT.md) - 详细部署指南
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [API 文档](/docs) - API 接口文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- Email: support@your-domain.com
- GitHub: https://github.com/your-repo

---

**项目状态**: ✅ 完全就绪，可直接部署

**最后更新**: 2026-08-04
