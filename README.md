# 在线工具集 | Online Tools

[![GitHub Pages](https://github.com/tanle-mtr/id-card-checker/actions/workflows/pages.yml/badge.svg)](https://github.com/tanle-mtr/id-card-checker/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![License: Senior Player](https://img.shields.io/badge/License-Senior_Player-blue.svg)](./LICENSE-SENIOR.md)

基于 Next.js 15 构建的多功能在线工具平台，集成多个实用查询工具。

## 工具列表

| 工具 | 说明 | 路径 |
|------|------|------|
| 身份证查询 | 格式校验、归属地解析、官方数据库核验 | `/id` |
| WHOIS 查询 | 域名注册信息、到期时间、注册商查询 | `/whois` |
| IP 查询 | IP 地理位置、ISP、组织信息 | `/ip` |
| 域名价格查询 | 多注册商首年与续费价格对比 | `/` |
| 便宜域名 | 发现低价域名推荐 | `/cheap` |

## 功能特性

### 身份证查询
- 支持 15 位旧版与 18 位新版身份证号码
- 基于国标 GB 11643-1999 校验码算法
- 识别省、市、区三级行政区划
- 解析出生日期、性别、年龄
- 连接官方数据库进行姓名一致性核验

### WHOIS 查询
- 支持 com/net/org/xyz/cn 等主流后缀
- 同时查询 RDAP 与 TCP WHOIS
- 自动解析注册商、创建/到期日期、Nameservers
- 显示域名剩余天数与到期提醒

### IP 查询
- 查询任意 IP 地址的地理位置
- 自动检测当前访问者 IP
- 显示 ISP、组织、ASN 信息
- 经纬度坐标展示

### 域名价格查询
- 对比 GoDaddy、Namecheap、阿里云等主流注册商
- 首年与续费价格对比
- 支持 USD/CNY 货币切换

## 技术栈

- **框架**: Next.js 15 (App Router, Static Export)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **部署**: Vercel / GitHub Pages

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 构建与部署

项目已配置静态导出，可直接部署到 GitHub Pages：

```bash
npm run build
```

构建产物输出至 `./out` 目录。

### GitHub Pages

已通过 GitHub Actions 自动部署：
- 推送至 `main` 分支自动触发构建与部署
- 也支持手动触发 (`workflow_dispatch`)

### Vercel

一键部署到 Vercel，支持自动预览和 CI/CD：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tanle-mtr/id-card-checker)

## 项目结构

```
├── app/
│   ├── api/           # API 路由
│   │   ├── ip/        # IP 查询接口
│   │   ├── whois/     # WHOIS 查询接口
│   │   └── idcard/    # 身份证查询接口
│   ├── id/            # 身份证查询页面
│   ├── ip/            # IP 查询页面
│   ├── whois/         # WHOIS 查询页面
│   ├── cheap/         # 便宜域名页面
│   ├── layout.tsx     # 全局布局（含导航）
│   └── page.tsx       # 首页（域名价格查询）
├── components/        # React 组件
├── lib/               # 工具函数
├── public/            # 静态资源
├── .github/workflows/ # GitHub Actions 工作流
├── LICENSE            # MIT License
├── LICENSE-SENIOR.md  # 资深玩家许可证
├── package.json
└── README.md
```

## 免责声明

- 身份证查询数据来源于蓝玉科技公开接口，仅供参考
- WHOIS 数据来源于各注册局公开信息，可能存在延迟
- IP 数据来源于 ip-api.com，仅供学习参考
- 以上工具结果均不构成任何法律证明

## 许可证

本项目采用双重许可证：

- **MIT License** — 允许自由使用、修改和分发（详见 [LICENSE](./LICENSE)）
- **资深玩家许可证** — 允许非商业学习与交流，禁止商业使用（详见 [LICENSE-SENIOR.md](./LICENSE-SENIOR.md)）

商业授权请联系：tanle-mtr
