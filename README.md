# 身份证号码查询工具

基于 [蓝玉科技](https://id.lanyul.com/) 数据源的身份证号码真伪核验与信息查询工具。纯前端实现，零依赖，可直接部署为静态站点。

[![GitHub Pages](https://github.com/tanle-mtr/id-card-checker/actions/workflows/pages.yml/badge.svg)](https://github.com/tanle-mtr/id-card-checker/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 在线使用

👉 **Cloudflare Pages**: https://id-card-checker.pages.dev/ （已部署，可访问）
👉 **GitHub Pages**: https://tanle-mtr.github.io/id-card-checker/ （部署中）

> **自定义域名** `id.tanle.cc.cd` 已在 GitHub Pages 配置完成（verified），需在 Cloudflare Dashboard 手动添加 DNS CNAME 记录。

## 功能特性

- **格式校验** — 支持 15 位旧版与 18 位新版身份证号码
- **校验码验证** — 基于国标 GB 11643-1999 加权求和算法，自动检测最后一位校验码是否正确
- **归属地解析** — 识别省、市、区三级行政区划
- **出生日期 & 性别** — 从号码中解析出生日期和性别信息
- **年龄计算** — 根据当前日期自动计算周岁
- **官方数据库核验** — 输入姓名后跳转至蓝玉科技系统，进行身份证与姓名一致性验证

## 数据源说明

| 功能 | 数据源 | 说明 |
|------|--------|------|
| 号码解析（归属地、出生日期、性别） | [蓝玉科技](https://id.lanyul.com/back/idcard/simple) | 免费 API，无需授权 |
| 真实性核验（身份证+姓名一致性） | [蓝玉科技核验系统](https://lanyul.com/idcard) | 连接官方数据库，需姓名辅助验证 |
| 校验码计算 | 本地实现（GB 11643-1999） | 完全离线，不依赖外部服务 |

## 技术栈

- **纯静态 HTML** — 零依赖，单文件即可运行
- **Tailwind CSS (CDN)** — 现代化样式，支持暗色模式
- **原生 JavaScript** — 无框架，加载迅速

## 本地使用

直接双击打开 `index.html` 即可使用，无需安装任何依赖。

```bash
# 或用任意 HTTP 服务器
npx serve .
# 访问 http://localhost:3000
```

## 部署

### Cloudflare Pages（已部署）

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 Pages 项目
wrangler pages project create id-card-checker --production-branch main

# 部署
wrangler pages deploy . --project-name=id-card-checker
```

访问 https://id-card-checker.pages.dev/

### GitHub Pages（自动部署）

仓库已配置 GitHub Actions，推送到 `main` 分支后自动部署到 https://tanle-mtr.github.io/id-card-checker/

### 自定义域名配置

#### 方式一：Cloudflare Pages + 自定义域名

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) 进入 Projects
2. 选择 `id-card-checker` 项目
3. 点击 **Custom Domains** → **Set up a custom domain**
4. 输入 `id.tanle.cc.cd`
5. Cloudflare 会自动创建 DNS 记录

#### 方式二：GitHub Pages + 自定义域名

1. 在仓库设置中添加 CNAME 文件（已添加）：
   ```
   tanle-mtr.github.io
   ```
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com) → DNS → Records 中添加：
   | 类型 | 名称 | 内容 | Proxy |
   |------|------|------|-------|
   | CNAME | id | `tanle-mtr.github.io` | DNS only（灰色云） |

## 免责声明

本工具仅通过国家标准算法校验身份证号码格式与校验码，数据来源于蓝玉科技公开接口。查询结果仅供参考，不构成任何法律证明。如需正式核验身份证真实性，请使用公安机关官方渠道。

## 许可证

[MIT License](./LICENSE)
