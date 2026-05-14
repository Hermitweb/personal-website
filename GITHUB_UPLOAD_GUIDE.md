# GitHub 上传指南

## 方法一：使用 Git 命令行（推荐）

### 1. 安装 Git
- Windows: https://git-scm.com/download/win
- macOS: `brew install git`
- Linux: `sudo apt install git`

### 2. 配置 Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. 初始化并上传

```bash
# 进入项目目录
cd personal-website

# 初始化 Git 仓库
git init

# 创建 .gitignore 文件（排除不需要上传的文件）
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
backend/node_modules/
frontend/node_modules/

# Environment variables
.env
backend/.env
frontend/.env

# Build files
frontend/build/

# Logs
logs/
*.log
npm-debug.log*

# Uploads (可选，如果不想上传测试图片)
backend/uploads/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

# 添加所有文件到暂存区
git add .

# 提交（使用 Conventional Commits 规范）
git commit -m "feat: initial commit

- Complete personal website with React + Express
- User authentication with JWT
- Content management system
- Blog with Markdown support
- Message board
- Custom domain support
- Docker deployment ready
- Nginx configuration included"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 推送到 GitHub
git push -u origin main
```

---

## 方法二：使用 GitHub Desktop（图形界面）

1. 下载安装：https://desktop.github.com/
2. 登录 GitHub 账号
3. 点击 "Add existing repository"
4. 选择 `personal-website` 文件夹
5. 填写提交信息并点击 "Commit to main"
6. 点击 "Publish repository" 上传到 GitHub

---

## 方法三：直接上传压缩包

1. 在项目文件夹外创建压缩包（排除 node_modules 和 .env）
2. 登录 GitHub 网页
3. 创建新仓库
4. 点击 "uploading an existing file"
5. 拖拽文件上传

---

## 推荐的 Git 提交历史

如果你想分步骤提交，可以按以下顺序：

```bash
# 1. 基础结构
git add backend/package.json frontend/package.json docker-compose.yml
git commit -m "chore: add project configuration and dependencies"

# 2. 后端核心
git add backend/config backend/middleware backend/models backend/utils
git commit -m "feat: add backend core (database, models, middleware)"

# 3. 后端路由
git add backend/routes backend/server.js
git commit -m "feat: add API routes (auth, users, contents, blogs, etc.)"

# 4. 前端核心
git add frontend/src/contexts frontend/src/components frontend/src/utils
git commit -m "feat: add frontend core (contexts, components, utilities)"

# 5. 前端页面
git add frontend/src/pages frontend/src/App.js
git commit -m "feat: add frontend pages and routing"

# 6. 部署配置
git add deploy/ nginx/ Dockerfile docker-compose.yml
git commit -m "feat: add deployment configuration (Docker, Nginx, scripts)"

# 7. 文档
git add README.md TECHNICAL_DOC.md
git commit -m "docs: add project documentation"
```

---

## 创建 GitHub 仓库步骤

1. 登录 https://github.com
2. 点击右上角 "+" → "New repository"
3. 填写仓库名称（如 `personal-website`）
4. 选择公开或私有
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"
7. 复制仓库地址（HTTPS 或 SSH）

---

## 上传后的操作

### 设置 GitHub Secrets（用于 CI/CD）

如果需要 GitHub Actions 自动部署，在仓库设置中添加：

- `SSH_PRIVATE_KEY`: 服务器私钥
- `SERVER_HOST`: 服务器 IP
- `SERVER_USER`: 服务器用户名

### 启用 GitHub Pages（可选）

1. 仓库 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "main"，文件夹选择 "/ (root)"
4. 保存

---

## 常见问题

### 1. 文件太大上传失败
```bash
# 使用 Git LFS 管理大文件
git lfs install
git lfs track "*.psd" "*.zip"
git add .gitattributes
```

### 2. 忘记添加 .gitignore
```bash
# 先清除缓存
git rm -r --cached .
git add .
git commit -m "fix: update .gitignore"
```

### 3. 修改最后一次提交
```bash
git commit --amend -m "新的提交信息"
git push --force-with-lease  # 如果已推送到远程
```

---

## 快速复制命令

```bash
# 完整的一键上传命令（修改 YOUR_USERNAME/YOUR_REPO 后执行）
cd personal-website
git init
echo "node_modules/
.env
backend/.env
frontend/.env
frontend/build/
logs/
backend/uploads/
.vscode/
.DS_Store" > .gitignore
git add .
git commit -m "feat: initial commit - complete personal website"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

**提示**：上传前确保已创建 GitHub 仓库，并将 `YOUR_USERNAME/YOUR_REPO` 替换为你的实际仓库地址。
