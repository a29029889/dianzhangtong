# 店账通 - Vercel 部署指南

> 本指南针对店账通项目的 Vercel 部署方案

---

## 📋 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel                               │
│  ┌─────────────────┐                                        │
│  │  Frontend (H5)  │  ← 静态网站 (UniApp 构建产物)           │
│  │   yourapp.vercel.app                                     │
│  └────────┬────────┘                                        │
│           │                                                   │
│           ▼ (API 请求)                                       │
│  ┌─────────────────┐     ┌─────────────────────────────┐    │
│  │  API Gateway    │────▶│  后端服务 (Serverless)      │    │
│  │                 │     │  或外部托管                  │    │
│  └─────────────────┘     └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
           │                                   │
           ▼                                   ▼
    ┌─────────────┐                  ┌──────────────┐
    │  PostgreSQL │                  │    Redis     │
    │  (云数据库)  │                  │   (云缓存)   │
    └─────────────┘                  └──────────────┘
```

---

## 🚀 方案一：前后端分离部署（推荐）

### 1. 前端 → Vercel 静态托管

#### 步骤 1.1：修改 API 配置

编辑 `frontend/src/utils/api.ts` 或 `frontend/api/config.js`：

```typescript
// 生产环境 API 地址
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api'  // 替换为你的后端地址
  : '/api';

export default API_BASE_URL;
```

#### 步骤 1.2：配置 Vercel 部署

`vercel.json` 已配置完成，主要配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/build/h5"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### 步骤 1.3：部署前端

```bash
# 安装 Vercel CLI
npm i -g vercel

# 进入项目目录
cd /root/.openclaw/workspace/dianzhangtong

# 登录 Vercel
vercel login

# 部署
vercel

# 或生产部署
vercel --prod
```

或者连接 GitHub 仓库自动部署：
1. 访问 https://vercel.com
2. Import GitHub 仓库
3. 配置：
   - Framework Preset: Other
   - Build Command: `cd frontend && npm run build:h5`
   - Output Directory: `frontend/dist/build/h5`
4. 点击 Deploy

---

### 2. 后端 → 部署选项

由于 NestJS 是完整的后端框架，在 Vercel Serverless 上部署有大小限制。建议选择以下方案：

#### 选项 A：Railway（推荐 🚀）

Railway 对 NestJS 支持很好，有免费额度。

1. 注册 https://railway.app
2. 连接 GitHub 仓库
3. 创建 PostgreSQL 和 Redis 服务
4. 部署后端：
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
   - 环境变量配置同下

#### 选项 B：Render

类似 Railway，免费的 Web Service 额度。

#### 选项 C：Vercel Serverless（需改造）

如果坚持要用 Vercel，需要将 NestJS 改造为 Serverless 适配版本。

---

## 🗄 数据库与缓存服务

### 推荐云服务

| 服务 | 免费额度 | 类型 |
|------|----------|------|
| **Supabase** | 500MB PostgreSQL | 数据库 |
| **Neon** | 512MB PostgreSQL | 数据库 |
| **Redis Cloud** | 30MB Redis | 缓存 |
| **Upstash** | 10K 命令/天 | 缓存 |

### 环境变量配置

在 Railway/Render 后端配置以下环境变量：

```env
# 服务器
PORT=3001
NODE_ENV=production

# 数据库 (Railway/Supabase 提供)
DB_HOST=your-db-host.aws.neon.tech
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=dianzhangtong

# Redis (Upstash/Redis Cloud 提供)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# CORS (前端地址)
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 📝 完整部署步骤

### 第一步：准备数据库

1. 注册 **Supabase** 或 **Neon**（免费 PostgreSQL）
2. 创建数据库 `dianzhangtong`
3. 记录连接信息

2. 注册 **Upstash** 或 **Redis Cloud**（免费 Redis）
3. 记录连接信息

### 第二步：部署后端

以 Railway 为例：

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
cd backend
railway init

# 4. 添加数据库
railway add -c postgresql
railway add -c redis

# 5. 设置环境变量
railway variables set DB_HOST=...
railway variables set DB_PORT=5432
railway variables set DB_USERNAME=...
railway variables set DB_PASSWORD=...
railway variables set DB_DATABASE=dianzhangtong
railway variables set REDIS_HOST=...
railway variables set REDIS_PORT=6379
railway variables set JWT_SECRET=your-secret-key

# 6. 部署
railway up
```

部署成功后，记录后端 URL（如 `https://dianzhangtong-backend.railway.app`）

### 第三步：配置前端

修改 `frontend/uni.scss` 或创建 `frontend/src/config.ts`：

```typescript
// API 配置
export const API_BASE_URL = 'https://your-backend.railway.app/api';

// 或使用环境变量
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### 第四步：部署前端到 Vercel

```bash
# 方式 1: CLI 部署
cd /root/.openclaw/workspace/dianzhangtong
vercel

# 方式 2: GitHub 自动部署
# 1. 推送代码到 GitHub
# 2. 在 Vercel Dashboard 导入仓库
# 3. 配置 Build Settings
#    - Framework Preset: Other
#    - Build Command: cd frontend && npm run build:h5
#    - Output Directory: frontend/dist/build/h5
# 4. 添加环境变量
#    - VITE_API_URL: https://your-backend.railway.app/api
```

---

## 🔧 UniApp H5 特殊配置

### 1. 设置运行基座

`frontend/manifest.json`:

```json
{
  "h5": {
    "router": {
      "mode": "hash",
      "base": "/"
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  }
}
```

### 2. 生产环境构建

```bash
cd frontend
npm run build:h5
```

构建产物位于：`frontend/dist/build/h5`

---

## ⚠️ 常见问题

### Q1: Vercel 部署后页面空白
A: 检查 `vercel.json` 的路由配置，确保 `distDir` 路径正确。

### Q2: API 请求跨域失败
A: 在后端启用 CORS：
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || '*',
});
```

### Q3: NestJS 太大无法部署到 Vercel
A: 使用 Railway、Render 或自建服务器部署后端。

### Q4: 数据库连接失败
A: 检查环境变量配置，确保数据库地址可公开访问（不是 localhost）。

---

## 📞 快速联系

- **GitHub**: https://github.com/a29029889/dianzhangtong
- **前端 Demo**: 部署后提供
- **后端 Demo**: 部署后提供

---

*最后更新: 2026-03-06*
