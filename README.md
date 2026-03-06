# 店账通 🏪

> 中小店铺记账与库存管理系统

## 项目简介

店账通是一款专为中小店铺设计的轻量级记账与库存管理 SaaS 系统，帮助店主轻松管理日常收支和商品库存。

## 技术栈

### 前端
- **UniApp** (Vue 3) - 跨平台应用框架，支持 H5、微信小程序、Android/iOS App
- **Pinia** - 状态管理
- **Axios** - HTTP 请求

### 后端
- **Node.js** + **NestJS** - 企业级 Node.js 框架
- **TypeORM** - ORM 数据库框架
- **Passport** - 身份认证

### 数据库
- **PostgreSQL** - 主数据库
- **Redis** - 缓存与会话存储

### 部署
- **Vercel** - 前端部署（可选）
- 支持 Docker 部署

## 项目结构

```
dianzhangtong/
├── frontend/                 # 前端项目 (UniApp)
│   ├── src/                 # 源代码
│   ├── pages/               # 页面
│   ├── components/         # 组件
│   ├── static/             # 静态资源
│   ├── manifest.json       # UniApp 配置
│   └── vite.config.ts      # Vite 配置
│
├── backend/                  # 后端项目 (NestJS)
│   ├── src/
│   │   ├── modules/         # 业务模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── users/       # 用户模块
│   │   │   ├── accounts/    # 账务模块
│   │   │   └── inventory/   # 库存模块
│   │   ├── common/          # 公共模块
│   │   └── config/          # 配置
│   ├── .env.example         # 环境变量示例
│   └── package.json
│
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 启动开发服务器
npm run start:dev
```

后端服务将在 http://localhost:3001 启动

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动 H5 开发
npm run dev:h5
```

前端应用将在 http://localhost:3000 启动

## API 文档

### 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| GET | /api/auth/profile | 获取用户信息 |

### 账务接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/accounts | 获取账务列表 |
| POST | /api/accounts | 创建账务记录 |
| DELETE | /api/accounts/:id | 删除账务记录 |

### 库存接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/inventory | 获取商品列表 |
| POST | /api/inventory | 添加商品 |
| PUT | /api/inventory/:id/stock | 更新库存 |
| DELETE | /api/inventory/:id | 删除商品 |

## 功能规划

- [x] 用户注册/登录
- [x] 记账功能（收入/支出记录）
- [x] 账务分类与统计
- [x] 商品管理
- [x] 库存预警
- [x] 数据报表与可视化
- [x] 多店铺支持
- [x] 通知设置
- [x] 库存预警设置页面

## 开发计划

### Phase 1: 基础架构 ✅
- [x] 项目初始化
- [x] 技术架构搭建
- [x] 基础 API 开发

### Phase 2: 核心功能开发
- [ ] 用户认证完善
- [ ] 记账功能
- [ ] 库存管理

### Phase 3: 高级功能
- [ ] 数据分析
- [ ] 报表导出
- [ ] 多平台适配

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
