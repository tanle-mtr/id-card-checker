# 身份证号码查询工具

基于 [蓝玉科技](https://id.lanyul.com/) 数据源的身份证号码真伪核验与信息查询工具。纯前端实现，无需后端服务，可直接部署为 GitHub Pages 静态站点。

[![GitHub Pages](https://github.com/tanle-mtr/id-card-checker/actions/workflows/pages.yml/badge.svg)](https://github.com/tanle-mtr/id-card-checker/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 功能特性

- **格式校验** — 支持 15 位旧版与 18 位新版身份证号码
- **校验码验证** — 基于国标 GB 11643-1999 加权求和算法，自动检测最后一位校验码是否正确
- **归属地解析** — 识别省、市、区三级行政区划
- **出生日期 & 性别** — 从号码中解析出生日期和性别信息
- **年龄计算** — 根据当前日期自动计算周岁
- **官方数据库核验** — 输入姓名后跳转至蓝玉科技系统，进行身份证与姓名一致性验证

## 在线使用

👉 https://tanle-mtr.github.io/id-card-checker/

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

## 部署到 GitHub Pages

### 方式一：GitHub Web 界面（推荐）

1. 将仓库克隆到本地
2. 提交代码到 `main` 分支
3. 在 GitHub 仓库页面 → **Settings** → **Pages**
4. Source 选择 **Deploy from a branch**，Branch 选 `main`，目录选 `/ (root)`
5. 点击 Save，等待部署完成

### 方式二：自动部署（CI/CD）

仓库已预配置 GitHub Actions，推送到 `main` 分支后自动部署：

```yaml
# .github/workflows/pages.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/deploy-pages@v4
```

## 项目结构

```
id-card-checker/
├── index.html          # 主页面（所有代码在一个文件中）
├── LICENSE             # MIT 许可证
└── README.md           # 项目说明文档
```

## 免责声明

本工具仅通过国家标准算法校验身份证号码格式与校验码，数据来源于蓝玉科技公开接口。查询结果仅供参考，不构成任何法律证明。如需正式核验身份证真实性，请使用公安机关官方渠道。

## 许可证

[MIT License](./LICENSE)
