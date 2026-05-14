# 个人网站

一个功能完善的个人展示网站，采用深色科技风格设计，包含动态粒子背景效果和流畅的交互动画。

## 功能特性

### 前端功能
- **首页展示**: 个人简介、技能展示、项目作品、联系方式
- **动态背景**: 粒子动画效果，支持鼠标交互
- **流畅动画**: 使用 Framer Motion 实现页面过渡和元素动画
- **响应式设计**: 适配各种屏幕尺寸
- **深色主题**: 科技感十足的深色界面设计

### 后端功能
- **用户认证**: JWT 认证，支持登录/注册
- **权限管理**: 管理员和普通用户角色区分
- **内容管理**: 支持内容的增删改查
- **登录可见**: 可设置内容是否需要登录才能查看
- **数据库**: MySQL 数据持久化存储

### 后台管理
- **概览面板**: 统计数据展示
- **内容管理**: 管理首页展示内容
- **用户管理**: 管理系统用户
- **网站设置**: 配置网站基本信息

## 技术栈

### 前端
- React 18
- React Router 6
- Styled Components
- Framer Motion
- Axios
- React Icons
- React Toastify

### 后端
- Node.js
- Express
- Sequelize ORM
- MySQL2
- JWT
- bcryptjs

## 安装部署

### 1. 数据库配置

1. 安装 MySQL 数据库
2. 创建数据库:
```sql
CREATE DATABASE personal_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 修改后端 `.env` 文件中的数据库配置:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=personal_website
JWT_SECRET=你的JWT密钥
```

### 2. 后端部署

```bash
cd backend
npm install
npm start
```

后端服务将在 `http://localhost:5000` 启动

### 3. 前端部署

```bash
cd frontend
npm install
npm start
```

前端应用将在 `http://localhost:3000` 启动

## 默认账户

系统启动时会自动创建默认管理员账户：
- 邮箱: admin@example.com
- 密码: admin123

**注意**: 部署后请立即修改默认密码！

## 项目结构

```
personal-website/
├── backend/                 # 后端代码
│   ├── config/             # 配置文件
│   ├── middleware/         # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # API路由
│   ├── server.js           # 入口文件
│   └── package.json
├── frontend/               # 前端代码
│   ├── public/             # 静态资源
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── contexts/       # React Context
│   │   ├── pages/          # 页面
│   │   ├── styles/         # 样式
│   │   ├── App.js          # 主应用
│   │   └── index.js        # 入口
│   └── package.json
└── README.md
```

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息

### 内容
- `GET /api/contents` - 获取内容列表（根据登录状态过滤）
- `GET /api/contents/:id` - 获取单个内容
- `POST /api/contents` - 创建内容（管理员）
- `PUT /api/contents/:id` - 更新内容（管理员）
- `DELETE /api/contents/:id` - 删除内容（管理员）
- `GET /api/contents/admin/all` - 获取所有内容（管理员）

### 用户
- `GET /api/users` - 获取用户列表（管理员）
- `PUT /api/users/:id` - 更新用户（管理员）
- `DELETE /api/users/:id` - 删除用户（管理员）
- `PUT /api/users/password` - 修改密码

### 配置
- `GET /api/config` - 获取配置
- `POST /api/config` - 更新配置（管理员）

## 内容类型

- `about` - 关于/个人简介
- `skill` - 技能
- `project` - 项目
- `contact` - 联系方式
- `custom` - 自定义

## 安全特性

- 密码使用 bcrypt 加密存储
- JWT Token 认证
- API 权限控制
- SQL 注入防护（Sequelize ORM）
- 输入验证

## 开发计划

- [x] 基础架构搭建
- [x] 用户认证系统
- [x] 内容管理系统
- [x] 后台管理界面
- [x] 首页展示
- [ ] 内容编辑器（富文本）
- [ ] 文件上传功能
- [ ] 数据统计分析
- [ ] 主题切换

## 许可证

MIT License
