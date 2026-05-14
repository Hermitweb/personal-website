# 个人网站项目 - 技术文档

> 版本：v1.0  
> 更新日期：2026-05-14  
> 技术栈：React 18 + Express 4 + MySQL + Sequelize 6

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 项目结构](#3-项目结构)
- [4. 环境配置](#4-环境配置)
- [5. 数据库模型](#5-数据库模型)
- [6. 后端 API 接口](#6-后端-api-接口)
- [7. 前端路由与页面](#7-前端路由与页面)
- [8. 上下文 Provider](#8-上下文-provider)
- [9. 中间件](#9-中间件)
- [10. 工具服务](#10-工具服务)
- [11. 用户配置体系](#11-用户配置体系)
- [12. 自定义域名系统](#12-自定义域名系统)
- [13. 安全机制](#13-安全机制)
- [14. 部署指南](#14-部署指南)

---

## 1. 项目概述

本项目是一个功能完整的个人网站系统，支持多用户管理、内容管理、博客系统、留言板、自定义域名等功能。采用前后端分离架构，后端提供 RESTful API，前端使用 React 单页应用。

### 核心功能

| 模块 | 说明 |
|------|------|
| 用户认证 | 注册、登录、JWT 认证、找回密码 |
| 内容管理 | 多类型内容（项目/技能/书签/自定义板块） |
| 板块管理 | 可视化板块排序、自定义板块类型 |
| 博客系统 | Markdown 编辑、分类标签、浏览统计 |
| 留言板 | 公开留言、管理回复、邮件通知 |
| 用户管理 | 用户组、权限控制、操作日志 |
| 自定义域名 | 每用户独立域名、内容过滤 |
| 功能开关 | 动态启用/禁用站点功能 |
| 访客统计 | IP 追踪、路径分析、数据可视化 |
| 数据管理 | 数据导出/导入、自动备份 |

---

## 2. 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | - | 运行环境 |
| Express | ^4.18.2 | Web 框架 |
| Sequelize | ^6.32.1 | ORM 框架 |
| MySQL2 | ^3.6.0 | MySQL 驱动 |
| jsonwebtoken | ^9.0.2 | JWT 认证 |
| bcryptjs | ^2.4.3 | 密码加密 |
| cors | ^2.8.5 | 跨域处理 |
| dotenv | ^16.3.1 | 环境变量 |
| express-rate-limit | ^8.5.1 | 请求限流 |
| express-validator | ^7.0.1 | 参数验证 |
| multer | ^1.4.5-lts.1 | 文件上传 |
| nodemailer | ^8.0.7 | 邮件发送 |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.2.0 | UI 框架 |
| React Router | ^6.15.0 | 路由管理 |
| Axios | ^1.5.0 | HTTP 客户端 |
| styled-components | ^6.0.8 | CSS-in-JS |
| Framer Motion | ^10.16.4 | 动画库 |
| react-markdown | ^10.1.0 | Markdown 渲染 |
| react-simplemde-editor | ^5.2.0 | Markdown 编辑器 |
| DOMPurify | ^3.4.2 | XSS 防护 |
| react-icons | ^4.12.0 | 图标库 |
| react-toastify | ^9.1.3 | 通知提示 |
| react-particles | ^2.12.2 | 粒子背景 |
| browser-image-compression | ^2.0.2 | 图片压缩 |

---

## 3. 项目结构

```
personal-website/
├── backend/
│   ├── config/
│   │   └── database.js          # 数据库连接配置
│   ├── middleware/
│   │   ├── auth.js              # 认证中间件
│   │   └── domainResolver.js    # 域名解析中间件
│   ├── models/
│   │   ├── index.js             # 模型聚合导出
│   │   ├── User.js              # 用户模型
│   │   ├── Content.js           # 内容模型
│   │   ├── SiteConfig.js        # 站点配置模型
│   │   ├── Message.js           # 留言模型
│   │   ├── Blog.js              # 博客模型
│   │   ├── Visitor.js           # 访客模型
│   │   ├── SiteFeature.js       # 功能开关模型
│   │   ├── Group.js             # 用户组模型
│   │   ├── Section.js           # 板块模型
│   │   └── OperationLog.js      # 操作日志模型
│   ├── routes/
│   │   ├── auth.js              # 认证路由
│   │   ├── contents.js          # 内容路由
│   │   ├── users.js             # 用户路由
│   │   ├── config.js            # 站点配置路由
│   │   ├── upload.js            # 文件上传路由
│   │   ├── messages.js          # 留言路由
│   │   ├── blogs.js             # 博客路由
│   │   ├── visitors.js          # 访客路由
│   │   ├── features.js          # 功能管理路由
│   │   ├── export.js            # 数据导出路由
│   │   ├── groups.js            # 用户组路由
│   │   ├── logs.js              # 操作日志路由
│   │   ├── emailConfig.js       # 邮件配置路由
│   │   ├── userConfig.js        # 用户配置路由
│   │   ├── sections.js          # 板块路由
│   │   └── domainConfig.js      # 域名配置路由
│   ├── utils/
│   │   ├── emailService.js      # 邮件服务
│   │   ├── verificationCodeStore.js  # 验证码存储
│   │   ├── operationLog.js      # 操作日志工具
│   │   └── imageCompression.js  # 图片压缩工具
│   ├── .env                     # 环境变量
│   ├── server.js                # 服务入口
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/          # 通用组件
    │   │   ├── Navbar.js        # 导航栏
    │   │   ├── Hero.js          # 首页英雄区域
    │   │   ├── Skills.js        # 技能展示
    │   │   ├── Projects.js      # 项目展示
    │   │   ├── Bookmarks.js     # 书签展示
    │   │   ├── Contact.js       # 联系表单
    │   │   ├── Footer.js        # 页脚
    │   │   ├── ParticleBackground.js  # 粒子背景
    │   │   ├── BackToTop.js     # 回到顶部
    │   │   ├── SectionRenderer.js  # 板块渲染器
    │   │   ├── SectionTitle.js  # 板块标题
    │   │   ├── MarkdownEditor.js    # Markdown 编辑器
    │   │   ├── MarkdownRenderer.js  # Markdown 渲染器
    │   │   ├── SEO.js           # SEO 组件
    │   │   ├── PrivateRoute.js  # 路由守卫
    │   │   ├── DynamicAdminRoute.js  # 动态后台路由
    │   │   ├── AdminPagination.js    # 分页组件
    │   │   └── admin/
    │   │       └── AdminStyles.js    # 后台通用样式
    │   ├── contexts/            # React Context
    │   │   ├── ThemeContext.js       # 主题管理
    │   │   ├── LanguageContext.js    # 多语言
    │   │   ├── FeatureContext.js     # 功能开关
    │   │   ├── AuthContext.js        # 认证状态
    │   │   ├── UserPreferencesContext.js  # 用户偏好
    │   │   ├── SiteConfigContext.js  # 站点配置
    │   │   └── DomainContext.js      # 域名上下文
    │   ├── pages/
    │   │   ├── Home.js         # 首页
    │   │   ├── Login.js        # 登录页
    │   │   ├── Register.js     # 注册页
    │   │   ├── Blog.js         # 博客列表
    │   │   ├── BlogDetail.js   # 博客详情
    │   │   ├── MessageBoard.js # 留言板
    │   │   ├── ProjectDetail.js # 项目详情
    │   │   └── admin/
    │   │       ├── Dashboard.js        # 仪表盘
    │   │       ├── ContentManagement.js # 内容管理
    │   │       ├── BlogManagement.js    # 博客管理
    │   │       ├── MessageManagement.js # 留言管理
    │   │       ├── UserManagement.js    # 用户管理
    │   │       ├── GroupManagement.js   # 用户组管理
    │   │       ├── SectionManagement.js # 板块管理
    │   │       ├── FeatureManagement.js # 功能管理
    │   │       ├── Settings.js          # 站点设置
    │   │       ├── ProfileSettings.js   # 个人设置
    │   │       ├── RegisterSettings.js  # 注册设置
    │   │       ├── EmailSettings.js     # 邮件设置
    │   │       ├── VisitorStats.js      # 访客统计
    │   │       └── DataExport.js        # 数据导出
    │   ├── utils/
    │   ├── App.js               # 应用入口
    │   └── index.js
    └── package.json
```

---

## 4. 环境配置

### 必需配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 5000 | 服务端口 |
| `DB_HOST` | localhost | 数据库主机 |
| `DB_USER` | root | 数据库用户 |
| `DB_PASSWORD` | root | 数据库密码 |
| `DB_NAME` | personal_website | 数据库名 |
| `JWT_SECRET` | your_jwt_secret_key_here | JWT 密钥（**生产环境必须修改**） |

### 可选配置

| 变量名 | 说明 |
|--------|------|
| `SMTP_HOST` | SMTP 服务器地址 |
| `SMTP_PORT` | SMTP 端口（默认 587） |
| `SMTP_SECURE` | 是否启用 SSL |
| `SMTP_USER` | SMTP 用户名 |
| `SMTP_PASS` | SMTP 密码 |
| `SMTP_FROM` | 发件人邮箱 |
| `ADMIN_EMAIL` | 管理员邮箱 |
| `REDIS_URL` | Redis 连接地址 |
| `REDIS_HOST` | Redis 主机（默认 localhost） |
| `REDIS_PORT` | Redis 端口（默认 6379） |
| `MAIN_DOMAIN` | 网站主域名 |
| `CREATE_DEFAULT_ADMIN` | 是否创建默认管理员（默认 true） |
| `DEFAULT_ADMIN_PASSWORD` | 默认管理员密码 |
| `DEFAULT_ADMIN_EMAIL` | 默认管理员邮箱 |

### 数据库连接池

```
max: 20, min: 2, acquire: 30000ms, idle: 10000ms
```

---

## 5. 数据库模型

### 5.1 User（用户表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO_INCREMENT | 主键 |
| username | STRING(50) | NOT NULL, UNIQUE | 用户名 |
| email | STRING(100) | NOT NULL, UNIQUE | 邮箱 |
| password | STRING(255) | NOT NULL | 密码（bcrypt 哈希） |
| role | ENUM | 默认 'user' | 角色：admin / user |
| isActive | BOOLEAN | 默认 true | 是否激活 |
| groupId | INTEGER | FK → groups.id | 所属用户组 |
| permissions | JSON | 默认 {} | 自定义权限 |
| preferences | JSON | 默认 {} | 个性化配置 |
| customDomain | STRING(255) | UNIQUE, 可空 | 自定义域名 |
| domainConfig | JSON | 默认 {enabled:false} | 域名访问配置 |
| createdAt | DATE | 自动 | 创建时间 |
| updatedAt | DATE | 自动 | 更新时间 |

**关联**：User belongsTo Group，Group hasMany User

---

### 5.2 Content（内容表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| title | STRING(200) | NOT NULL | 标题 |
| type | STRING(50) | 默认 'custom' | 类型：project/skill/bookmark/section_* |
| content | TEXT | NOT NULL | 内容 |
| imageUrl | STRING(500) | 可空 | 封面图片 |
| linkUrl | STRING(500) | 可空 | 链接 |
| orderNum | INTEGER | 默认 0 | 排序号 |
| isVisible | BOOLEAN | 默认 true | 是否可见 |
| requireLogin | BOOLEAN | 默认 false | 需要登录 |
| metadata | JSON | 可空 | 元数据（githubUrl 等） |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

---

### 5.3 Section（板块表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| name | STRING(100) | NOT NULL | 板块名称 |
| slug | STRING(100) | NOT NULL, UNIQUE | 板块标识 |
| sectionType | ENUM | 默认 'custom' | 类型：builtin / custom |
| contentType | STRING(50) | NOT NULL | 关联内容类型 |
| displayMode | ENUM | 默认 'list' | 展示模式：list / single |
| description | TEXT | 可空 | 描述 |
| icon | STRING(50) | 默认 'FaLayerGroup' | 图标 |
| styleConfig | JSON | 默认 {} | 样式配置 |
| orderNum | INTEGER | 默认 0 | 排序号 |
| isVisible | BOOLEAN | 默认 true | 是否可见 |
| requireLogin | BOOLEAN | 默认 false | 需要登录 |
| config | JSON | 默认 {} | 扩展配置（columns/rows 等） |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

---

### 5.4 Blog（博客表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| title | STRING(200) | NOT NULL | 标题 |
| slug | STRING(250) | NOT NULL, UNIQUE | URL 别名 |
| excerpt | TEXT | 可空 | 摘要 |
| content | TEXT(long) | NOT NULL | 正文（Markdown） |
| coverImage | STRING(500) | 可空 | 封面图 |
| category | STRING(50) | 可空 | 分类 |
| tags | JSON | 默认 [] | 标签数组 |
| author | STRING(100) | 可空 | 作者 |
| viewCount | INTEGER | 默认 0 | 浏览量 |
| likeCount | INTEGER | 默认 0 | 点赞数 |
| isPublished | BOOLEAN | 默认 false | 是否发布 |
| publishedAt | DATE | 可空 | 发布时间 |
| allowComment | BOOLEAN | 默认 true | 允许评论 |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

**索引**：slug（唯一）、category、isPublished+publishedAt

---

### 5.5 Message（留言表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| name | STRING(100) | NOT NULL | 姓名 |
| email | STRING(100) | 可空 | 邮箱 |
| subject | STRING(200) | 可空 | 主题 |
| message | TEXT | NOT NULL | 留言内容 |
| isRead | BOOLEAN | 默认 false | 是否已读 |
| isReplied | BOOLEAN | 默认 false | 是否已回复 |
| isPublic | BOOLEAN | 默认 false | 是否公开 |
| reply | TEXT | 可空 | 回复内容 |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

---

### 5.6 SiteConfig（站点配置表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| key | STRING(100) | NOT NULL, UNIQUE | 配置键 |
| value | TEXT | 可空 | 配置值 |
| description | STRING(255) | 可空 | 描述 |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

---

### 5.7 SiteFeature（功能开关表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| feature | STRING(50) | NOT NULL, UNIQUE | 功能标识 |
| enabled | BOOLEAN | 默认 true | 是否启用 |
| config | JSON | 可空 | 功能配置 |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

---

### 5.8 Group（用户组表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| name | STRING(50) | NOT NULL, UNIQUE | 组名 |
| description | TEXT | 可空 | 描述 |
| permissions | JSON | 默认 [] | 权限列表 |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

---

### 5.9 Visitor（访客表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| ip | STRING(50) | 可空 | IP 地址 |
| userAgent | STRING(500) | 可空 | 浏览器 UA |
| path | STRING(500) | NOT NULL | 访问路径 |
| referrer | STRING(500) | 可空 | 来源页面 |
| country | STRING(100) | 可空 | 国家 |
| city | STRING(100) | 可空 | 城市 |
| sessionId | STRING(100) | 可空 | 会话 ID |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

**索引**：path、createdAt、sessionId

---

### 5.10 OperationLog（操作日志表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK | 主键 |
| userId | INTEGER | 可空 | 操作用户 ID |
| username | STRING(50) | 可空 | 操作用户名 |
| action | STRING(50) | NOT NULL | 操作类型 |
| module | STRING(50) | NOT NULL | 操作模块 |
| targetId | INTEGER | 可空 | 目标 ID |
| targetName | STRING(255) | 可空 | 目标名称 |
| description | TEXT | 可空 | 操作描述 |
| ip | STRING(45) | 可空 | IP 地址 |
| userAgent | STRING(500) | 可空 | 浏览器 UA |
| method | STRING(10) | 可空 | HTTP 方法 |
| path | STRING(255) | 可空 | 请求路径 |
| status | ENUM | 默认 'success' | 操作状态：success / fail |
| errorMessage | TEXT | 可空 | 错误信息 |
| duration | INTEGER | 可空 | 耗时（ms） |
| createdAt / updatedAt | DATE | 自动 | 时间戳 |

**索引**：userId、action、module、createdAt、status

---

## 6. 后端 API 接口

### 6.1 认证 `/api/auth`

> 限流：15 分钟内每 IP 最多 10 次请求

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/auth/register-settings | 无 | 获取注册设置 |
| GET | /api/auth/captcha | 无 | 获取图形验证码 |
| POST | /api/auth/register | 无 | 用户注册 |
| POST | /api/auth/login | 无 | 用户登录 |
| GET | /api/auth/me | 需登录 | 获取当前用户信息 |
| POST | /api/auth/forgot-password | 无 | 发送找回密码验证码 |
| POST | /api/auth/reset-password | 无 | 重置密码 |

---

### 6.2 内容管理 `/api/contents`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/contents/admin/all | 管理员 | 获取所有内容（含隐藏） |
| GET | /api/contents | 无 | 获取公开内容列表 |
| GET | /api/contents/:id | 按需 | 获取单个内容 |
| POST | /api/contents | 管理员 | 创建内容 |
| PUT | /api/contents/:id | 管理员 | 更新内容 |
| DELETE | /api/contents/:id | 管理员 | 删除内容 |

---

### 6.3 用户管理 `/api/users`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/users | 管理员 | 获取所有用户 |
| PUT | /api/users/password | 需登录 | 修改自己的密码 |
| PUT | /api/users/:id/password | 管理员 | 管理员修改用户密码 |
| PUT | /api/users/:id | 管理员 | 更新用户信息 |
| DELETE | /api/users/:id | 管理员 | 删除用户 |

---

### 6.4 站点配置 `/api/config`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/config | 无 | 获取所有配置 |
| GET | /api/config/:key | 无 | 获取单个配置 |
| POST | /api/config | 管理员 | 创建/更新配置 |
| PUT | /api/config/batch | 管理员 | 批量更新配置 |

---

### 6.5 文件上传 `/api/upload`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /api/upload | 管理员 | 上传图片（5MB 限制） |
| POST | /api/upload/favicon | 管理员 | 上传 Favicon（1MB 限制） |
| DELETE | /api/upload | 管理员 | 删除图片 |

---

### 6.6 留言 `/api/messages`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /api/messages | 无 | 提交留言 |
| GET | /api/messages | 管理员 | 获取留言列表（分页） |
| GET | /api/messages/stats/unread | 管理员 | 获取未读数 |
| GET | /api/messages/:id | 管理员 | 获取单个留言 |
| PUT | /api/messages/:id/reply | 管理员 | 回复留言 |
| DELETE | /api/messages/:id | 管理员 | 删除留言 |

---

### 6.7 博客 `/api/blogs`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/blogs | 无 | 获取已发布博客（分页） |
| GET | /api/blogs/slug/:slug | 无 | 通过 slug 获取博客 |
| GET | /api/blogs/categories | 无 | 获取分类列表 |
| GET | /api/blogs/admin/all | 管理员 | 获取所有博客（含草稿） |
| POST | /api/blogs | 管理员 | 创建博客 |
| PUT | /api/blogs/:id | 管理员 | 更新博客 |
| DELETE | /api/blogs/:id | 管理员 | 删除博客 |
| POST | /api/blogs/:id/like | 无 | 点赞博客 |

---

### 6.8 访客统计 `/api/visitors`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | /api/visitors/track | 无 | 记录访客 |
| GET | /api/visitors/stats | 管理员 | 获取统计数据 |
| GET | /api/visitors/recent | 管理员 | 获取最近记录 |

---

### 6.9 功能管理 `/api/features`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/features | 无 | 获取所有功能状态 |
| GET | /api/features/:feature | 无 | 获取单个功能状态 |
| PUT | /api/features/:feature | 管理员 | 更新功能状态 |
| PUT | /api/features/batch/update | 管理员 | 批量更新 |

---

### 6.10 数据导出 `/api/export`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/export/all | 管理员 | 导出所有数据 |
| GET | /api/export/blogs | 管理员 | 导出博客 |
| GET | /api/export/contents | 管理员 | 导出内容 |
| GET | /api/export/messages | 管理员 | 导出留言 |
| POST | /api/export/import | 管理员 | 导入数据 |

---

### 6.11 用户组 `/api/groups`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/groups | 管理员 | 获取所有组 |
| POST | /api/groups | 管理员 | 创建组 |
| PUT | /api/groups/:id | 管理员 | 更新组 |
| DELETE | /api/groups/:id | 管理员 | 删除组 |
| POST | /api/groups/assign-users | 管理员 | 批量分配用户 |

---

### 6.12 操作日志 `/api/logs`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/logs | 管理员 | 获取日志列表（分页/筛选） |
| GET | /api/logs/stats | 管理员 | 获取操作统计 |
| GET | /api/logs/:id | 管理员 | 获取日志详情 |
| DELETE | /api/logs/cleanup | 管理员 | 清理旧日志 |

---

### 6.13 邮件配置 `/api/email-config`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/email-config | 管理员 | 获取邮件配置 |
| PUT | /api/email-config | 管理员 | 更新邮件配置 |
| POST | /api/email-config/test | 管理员 | 测试邮件发送 |
| DELETE | /api/email-config/password | 管理员 | 清除邮件密码 |

---

### 6.14 用户配置 `/api/user-config`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/user-config | 需登录 | 获取用户配置 |
| PUT | /api/user-config | 需登录 | 更新用户配置 |
| POST | /api/user-config/reset | 需登录 | 重置为默认 |
| GET | /api/user-config/defaults | 需登录 | 获取默认配置 |

---

### 6.15 板块管理 `/api/sections`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/sections/admin/all | 管理员 | 获取所有板块 |
| GET | /api/sections | 无 | 获取可见板块（含内容） |
| GET | /api/sections/:id | 按需 | 获取单个板块 |
| GET | /api/sections/slug/:slug | 按需 | 通过 slug 获取 |
| POST | /api/sections | 管理员 | 创建板块 |
| PUT | /api/sections/:id | 管理员 | 更新板块 |
| DELETE | /api/sections/:id | 管理员 | 删除板块 |
| POST | /api/sections/reorder | 管理员 | 批量排序 |
| PUT | /api/sections/:id/visibility | 管理员 | 切换可见性 |

---

### 6.16 域名配置 `/api/domain-config`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | /api/domain-config | 无 | 获取全局域名配置 |
| PUT | /api/domain-config | 管理员 | 更新全局域名配置 |
| GET | /api/domain-config/resolve | 无 | 根据域名解析用户 |
| GET | /api/domain-config/user | 需登录 | 获取用户域名配置 |
| PUT | /api/domain-config/user | 需登录 | 更新用户域名配置 |
| GET | /api/domain-config/check | 需登录 | 检查域名可用性 |

---

## 7. 前端路由与页面

### 前台路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | Home | 首页（板块渲染） |
| `/login` | Login | 登录页（含找回密码） |
| `/register` | Register | 注册页 |
| `/blog` | Blog | 博客列表 |
| `/blog/:slug` | BlogDetail | 博客详情 |
| `/messages` | MessageBoard | 留言板 |
| `/project/:id` | ProjectDetail | 项目详情 |

### 后台路由

| 路径 | 组件 | 说明 |
|------|------|------|
| `/admin` | DynamicAdminRoute | 动态后台入口 |
| `/admin/*` | 各管理页面 | 后台子页面 |

### 后台页面列表

| 文件 | 功能 |
|------|------|
| Dashboard.js | 仪表盘/控制台 |
| ContentManagement.js | 内容管理 |
| BlogManagement.js | 博客管理 |
| MessageManagement.js | 留言管理 |
| UserManagement.js | 用户管理 |
| GroupManagement.js | 用户组管理 |
| SectionManagement.js | 板块管理 |
| FeatureManagement.js | 功能开关管理 |
| Settings.js | 站点设置 |
| ProfileSettings.js | 个人设置 |
| RegisterSettings.js | 注册设置 |
| EmailSettings.js | 邮件设置 |
| VisitorStats.js | 访客统计 |
| DataExport.js | 数据导出/导入 |

---

## 8. 上下文 Provider

| Provider | 文件 | 说明 |
|----------|------|------|
| ThemeProvider | ThemeContext.js | 主题管理（深色/浅色/自动） |
| LanguageProvider | LanguageContext.js | 多语言国际化 |
| FeatureProvider | FeatureContext.js | 站点功能开关 |
| AuthProvider | AuthContext.js | 用户认证状态管理 |
| UserPreferencesProvider | UserPreferencesContext.js | 用户个性化偏好 |
| SiteConfigProvider | SiteConfigContext.js | 站点全局配置 |
| DomainProvider | DomainContext.js | 自定义域名上下文 |

**嵌套顺序**：

```
ThemeProvider
  └─ LanguageProvider
      └─ FeatureProvider
          └─ AuthProvider
              └─ UserPreferencesProvider
                  └─ SiteConfigProvider
                      └─ DomainProvider
                          └─ <App />
```

---

## 9. 中间件

### 9.1 认证中间件 (`middleware/auth.js`)

| 中间件 | 说明 |
|--------|------|
| `authMiddleware` | 从 Authorization Header 提取 Bearer Token，验证 JWT，挂载 `req.user` |
| `adminMiddleware` | 检查 `req.user.role === 'admin'`，非管理员返回 403 |
| `verifyToken` | 轻量级验证，返回 boolean，不修改 req 对象 |

### 9.2 域名解析中间件 (`middleware/domainResolver.js`)

| 中间件 | 说明 |
|--------|------|
| `domainResolver` | 全局中间件，从 Host 头解析域名，查询对应用户，挂载 `req.domainUser` |
| `requireDomainUser` | 检查 `req.domainUser` 是否存在 |
| `filterSectionsByDomainConfig` | 根据域名配置过滤板块 |
| `filterContentByDomainConfig` | 过滤内容（只显示公开） |

### 9.3 请求限流

| 范围 | 限制 |
|------|------|
| 通用 API | 15 分钟内每 IP 100 次 |
| 认证接口 | 15 分钟内每 IP 10 次 |

---

## 10. 工具服务

### 10.1 邮件服务 (`utils/emailService.js`)

基于 Nodemailer 的单例邮件服务：

| 方法 | 说明 |
|------|------|
| `send()` | 通用邮件发送 |
| `sendNewMessageNotification()` | 新留言通知 |
| `sendReplyNotification()` | 留言回复通知 |
| `sendPasswordResetEmail()` | 密码重置链接邮件 |
| `sendVerificationCodeEmail()` | 验证码邮件（6 位数字码） |
| `verifyConnection()` | 验证 SMTP 连接 |
| `isEnabled()` | 检查邮件服务是否可用 |

> 未配置 SMTP 时自动禁用，不会报错。

### 10.2 验证码存储 (`utils/verificationCodeStore.js`)

双存储模式单例服务：

| 特性 | 说明 |
|------|------|
| Redis 模式 | 通过 `REDIS_URL` 配置，key 前缀 `verify_code:`，支持 TTL 自动过期 |
| 内存回退 | 未配置 Redis 时自动使用内存存储 |
| 容错机制 | Redis 连接失败超过 3 次自动回退 |
| API | `set()` / `get()` / `update()` / `delete()` / `has()` |
| `getStorageType()` | 返回当前存储类型（'redis' 或 'memory'） |

---

## 11. 用户配置体系

每个用户拥有独立的 `preferences` JSON 配置，存储在 User 表中。

### 配置结构

```json
{
  "theme": "dark",
  "language": "zh-CN",
  "density": "comfortable",
  "defaultEditor": "rich",
  "pageSize": 20,
  "sidebarCollapsed": false,
  "notifications": {
    "email": true,
    "browser": true,
    "sound": false
  },
  "editor": {
    "autoSave": true,
    "autoSaveInterval": 30,
    "spellCheck": true,
    "wordWrap": true,
    "lineNumbers": true
  },
  "dateFormat": "YYYY-MM-DD",
  "timeFormat": "24h",
  "table": {
    "showPagination": true,
    "stickyHeader": true
  },
  "features": {
    "blog": { "postsPerPage": 10, "allowComments": true, "showAuthor": true, "showDate": true, "showCategory": true },
    "messageBoard": { "requireLogin": false, "showEmail": false, "notification": true },
    "projectDetail": { "showGithub": true, "showDemo": true, "showGallery": true, "showTechStack": true },
    "ui": { "animations": true, "reducedMotion": false, "compactMode": false },
    "seo": { "showReadingTime": true, "showWordCount": true, "showShareButtons": true }
  },
  "shortcuts": {
    "newPost": "Ctrl+N",
    "save": "Ctrl+S",
    "search": "Ctrl+K",
    "toggleSidebar": "Ctrl+B"
  },
  "dataManagement": {
    "autoBackup": false,
    "backupInterval": 24,
    "exportFormat": "json"
  },
  "customDomain": {
    "enabled": false,
    "domain": "",
    "showPublicContent": true,
    "showProjects": true,
    "showSkills": true,
    "showBlog": true,
    "showBookmarks": true
  },
  "contentDisplay": {
    "defaultImagePosition": "center",
    "customImagePosition": 50,
    "listView": "grid",
    "itemsPerRow": 3,
    "cardStyle": "default",
    "showDescription": true,
    "showTags": true,
    "showDate": true
  },
  "security": {
    "twoFactorEnabled": false,
    "loginNotification": true,
    "sessionTimeout": 30,
    "ipWhitelist": []
  },
  "privacy": {
    "profileVisible": true,
    "showEmail": false,
    "showStats": true,
    "allowSearch": true
  }
}
```

---

## 12. 自定义域名系统

### 架构流程

```
用户访问自定义域名
    ↓
domainResolver 中间件解析 Host 头
    ↓
查询 User 表匹配 customDomain
    ↓
将 domainUser 挂载到 req
    ↓
板块路由根据 domainConfig 过滤内容
    ↓
只返回公开内容（requireLogin=false）
```

### 域名配置项

| 配置 | 说明 |
|------|------|
| `enabled` | 是否启用域名访问 |
| `showPublicContent` | 显示自定义板块 |
| `showProjects` | 显示项目 |
| `showSkills` | 显示技能 |
| `showBlog` | 显示博客 |
| `showBookmarks` | 显示书签 |

### 全局配置（管理员）

| 配置 | 说明 |
|------|------|
| `mainDomain` | 网站主域名 |
| `enableCustomDomain` | 是否允许用户自定义域名 |
| `redirectToMain` | 未绑定域名时跳转主域名 |

---

## 13. 安全机制

### 认证与授权

- JWT Token 认证，存储在 Authorization Header
- 角色：admin / user
- 细粒度权限：每个用户可配置独立权限
- 用户组：批量管理用户权限

### 请求安全

- `express-rate-limit` 请求限流
- `express-validator` 参数验证
- `bcryptjs` 密码哈希（salt rounds: 10）
- `DOMPurify` XSS 防护（前端）
- CORS 跨域配置

### 内容安全

- 板块/内容支持 `requireLogin` 控制可见性
- 自定义域名访问只显示公开内容
- 未登录用户中间板块随机显示内容

### 找回密码

- 6 位数字验证码，10 分钟有效
- 最多 5 次验证尝试
- Redis 存储（可选），内存回退
- 邮件发送（可选），控制台回退

---

## 14. 部署指南

### 14.1 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 16 | 运行环境 |
| MySQL | >= 5.7 | 数据库 |
| Redis | >= 6 | 可选，用于缓存 |
| Nginx | >= 1.18 | 可选，反向代理 |
| PM2 | latest | 可选，进程管理 |

---

### 14.2 快速部署（推荐）

#### 方式一：一键部署脚本

```bash
# 1. 克隆项目
git clone <repository-url>
cd personal-website

# 2. 运行部署脚本
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# 3. 启动服务
./start.sh
```

部署脚本会自动完成：
- ✅ 环境检查（Node.js、MySQL）
- ✅ 安装前后端依赖
- ✅ 构建前端
- ✅ 初始化数据库
- ✅ 同步数据模型
- ✅ 生成 Nginx 配置
- ✅ 生成 PM2 配置
- ✅ 创建启动/停止/更新脚本

#### 方式二：Docker Compose（推荐生产环境）

```bash
# 1. 克隆项目
git clone <repository-url>
cd personal-website

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 .env 设置 JWT_SECRET、数据库密码等

# 3. 构建并启动
docker-compose up -d

# 4. 查看日志
docker-compose logs -f

# 5. 停止服务
docker-compose down
```

Docker Compose 包含：
- MySQL 8.0 数据库
- Redis 7 缓存
- Node.js 后端 API
- Nginx 反向代理

---

### 14.3 手动部署

#### 开发环境

```bash
# 后端
cd backend
npm install
npm run dev          # 开发模式（热重载）

# 前端
cd frontend
npm install
npm start            # 开发服务器 http://localhost:3000
```

#### 生产环境

```bash
# 1. 后端部署
cd backend
npm ci --production  # 仅安装生产依赖

# 使用 PM2 启动（推荐）
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 或直接启动
NODE_ENV=production node server.js

# 2. 前端部署
cd frontend
npm ci
npm run build        # 生成 build/ 目录

# 将 build/ 部署到 Nginx 或静态托管
```

---

### 14.4 服务管理脚本

| 脚本 | 用途 | 示例 |
|------|------|------|
| `./start.sh` | 启动所有服务 | `./start.sh` |
| `./stop.sh` | 停止所有服务 | `./stop.sh` |
| `./update.sh` | 更新并重启 | `./update.sh` |

**PM2 常用命令：**

```bash
pm2 start backend/ecosystem.config.js    # 启动
pm2 stop personal-website-api            # 停止
pm2 restart personal-website-api         # 重启
pm2 logs personal-website-api            # 查看日志
pm2 monit                                # 监控面板
```

---

### 14.5 Nginx 配置

#### 自动配置（部署脚本生成）

```bash
# 复制生成的配置
sudo cp /tmp/personal-website.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/personal-website.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

#### 手动配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/personal-website/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件
    location /uploads/ {
        alias /var/www/personal-website/backend/uploads/;
    }
}
```

---

### 14.6 SSL/HTTPS 配置

#### 使用 Certbot（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

#### 手动配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # ... 其他配置
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

### 14.7 可选服务配置

| 服务 | 用途 | 配置方式 |
|------|------|----------|
| Redis | 验证码存储、缓存 | `.env` 中配置 `REDIS_URL=redis://localhost:6379` |
| SMTP | 邮件发送 | `.env` 中配置 `SMTP_HOST/PORT/USER/PASS` |
| Nginx | 反向代理、SSL | 配置 `proxy_pass` 到后端端口 |
| PM2 | 进程管理 | `ecosystem.config.js` |

---

### 14.8 目录结构（生产环境）

```
/var/www/personal-website/
├── backend/
│   ├── server.js
│   ├── uploads/          # 上传文件
│   ├── logs/             # 日志文件
│   ├── backups/          # 数据备份
│   └── ecosystem.config.js
├── frontend/
│   └── build/            # 前端构建产物
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
├── deploy/
│   └── deploy.sh
├── start.sh
├── stop.sh
├── update.sh
└── docker-compose.yml
```

---

### 14.9 备份与恢复

#### 数据库备份

```bash
# 手动备份
mysqldump -u root -p personal_website > backup_$(date +%Y%m%d).sql

# 自动备份（添加到 crontab）
0 2 * * * mysqldump -u root -p personal_website > /var/www/backups/db_$(date +\%Y\%m\%d).sql
```

#### 数据导出（后台功能）

访问后台「数据导出」页面，可导出：
- 所有数据（JSON）
- 博客数据
- 内容数据
- 留言数据

---

### 14.10 故障排查

| 问题 | 排查方法 |
|------|----------|
| 服务无法启动 | 检查 `.env` 配置、端口占用、数据库连接 |
| 前端白屏 | 检查 `npm run build` 是否成功、Nginx 路径配置 |
| API 404 | 检查 Nginx `proxy_pass` 配置、后端是否运行 |
| 数据库连接失败 | 检查 MySQL 服务、用户名密码、数据库是否存在 |
| 邮件发送失败 | 检查 SMTP 配置、查看后端日志 |

**查看日志：**

```bash
# PM2 日志
pm2 logs personal-website-api

# Docker 日志
docker-compose logs -f backend

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
```
