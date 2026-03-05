# 店账通 - 部署指南

## 📋 项目概述

**店账通** 是一款专为中小店铺设计的轻量级记账与库存管理 SaaS 系统。

- **版本**: 1.0.0
- **状态**: ✅ 开发完成，准备部署
- **最后更新**: 2026-03-06

---

## 🛠 技术栈

### 前端
- **UniApp** (Vue 3) - 跨平台应用框架
- **Pinia** - 状态管理
- **Axios** - HTTP 请求
- **支持平台**: H5、微信小程序、Android/iOS App

### 后端
- **Node.js** + **NestJS** - 企业级 Node.js 框架
- **TypeORM** - ORM 数据库框架
- **Passport** + **JWT** - 身份认证

### 数据库
- **PostgreSQL** - 主数据库
- **Redis** - 缓存与会话存储

---

## 📁 项目结构

```
dianzhangtong/
├── frontend/                 # 前端项目 (UniApp)
│   ├── pages/               # 页面（5个核心页面）
│   │   ├── home/            # 首页
│   │   ├── add/             # 记一笔
│   │   ├── flow/            # 流水
│   │   ├── report/          # 报表
│   │   ├── mine/            # 我的
│   │   └── login/           # 登录
│   ├── components/          # 组件
│   ├── stores/              # Pinia 状态管理
│   ├── api/                 # API 接口封装
│   ├── static/              # 静态资源
│   └── package.json
│
├── backend/                  # 后端项目 (NestJS)
│   ├── src/
│   │   ├── modules/         # 业务模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── users/       # 用户模块
│   │   │   ├── accounts/    # 账务模块
│   │   │   ├── categories/  # 分类模块
│   │   │   └── shops/       # 店铺模块
│   │   ├── common/          # 公共模块
│   │   └── config/          # 配置
│   ├── .env.example         # 环境变量示例
│   └── package.json
│
├── README.md                 # 项目说明
├── DEPLOY.md                 # 部署指南（本文件）
└── .git/
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd dianzhangtong
```

### 2. 后端部署

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息等

# 构建项目
npm run build

# 启动生产服务器
npm run start:prod
```

后端服务将在 http://localhost:3001 启动

### 3. 前端部署

#### H5 版本

```bash
cd frontend

# 安装依赖
npm install

# 构建 H5 版本
npm run build:h5

# 构建产物在 dist/build/h5 目录
# 可以部署到任何静态托管服务（Nginx、Vercel、Netlify 等）
```

#### 微信小程序

```bash
cd frontend

# 安装依赖
npm install

# 构建微信小程序版本
npm run build:mp-weixin

# 使用微信开发者工具打开 dist/build/mp-weixin 目录
# 上传并发布
```

#### App 版本

```bash
cd frontend

# 安装依赖
npm install

# 构建 App 版本
npm run build:app

# 使用 HBuilderX 或其他工具打包
```

---

## ⚙️ 环境变量配置

### 后端环境变量 (.env)

```env
# 服务器配置
PORT=3001
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=dianzhangtong

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS 配置
CORS_ORIGIN=*
```

---

## 🗄 数据库初始化

### PostgreSQL 数据库创建

```sql
CREATE DATABASE dianzhangtong;
CREATE USER dianzhangtong WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dianzhangtong TO dianzhangtong;
```

### 数据库迁移

TypeORM 会自动创建数据表，首次启动时会执行同步。

---

## 🔒 安全建议

1. **修改默认密钥**
   - 修改 JWT_SECRET 为强密码
   - 修改数据库密码

2. **HTTPS 配置**
   - 生产环境必须使用 HTTPS
   - 配置 SSL 证书（Let's Encrypt 免费）

3. **数据库备份**
   - 定期备份 PostgreSQL 数据
   - 保留至少 7 天的备份

4. **日志监控**
   - 配置应用日志收集
   - 设置异常告警

---

## 📊 功能清单

### ✅ 已完成功能

- [x] 用户注册/登录
- [x] JWT 身份认证
- [x] 记账功能（收入/支出记录）
- [x] 账务分类管理
- [x] 店铺管理
- [x] 流水列表与筛选
- [x] 数据统计与报表
- [x] 趋势图可视化
- [x] 分类占比分析
- [x] 今日/本周/本月统计
- [x] 5个核心页面（首页/记一笔/流水/报表/我的）

---

## 🐛 故障排查

### 后端启动失败
- 检查 PostgreSQL 和 Redis 是否正常运行
- 确认 .env 配置正确
- 查看日志：`npm run start:prod`

### 前端页面空白
- 检查 API 地址配置
- 查看浏览器控制台错误
- 确认后端服务正常运行

---

## 📞 技术支持

如有问题，请提交 Issue 或联系开发团队。

---

## 📄 许可证

MIT License
