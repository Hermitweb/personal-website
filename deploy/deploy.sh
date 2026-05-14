#!/bin/bash

# ============================================
# 个人网站项目 - 生产环境部署脚本
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装"
        exit 1
    fi
}

# 检查环境
log_info "检查环境..."
check_command node
check_command npm
check_command mysql

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    log_error "Node.js 版本必须 >= 16，当前版本: $(node -v)"
    exit 1
fi

log_success "环境检查通过"

# 项目根目录
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# ============================================
# 1. 配置环境变量
# ============================================
log_info "配置环境变量..."

if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        log_warning "已创建 .env 文件，请编辑配置后再运行"
        nano "$BACKEND_DIR/.env"
    else
        log_error "未找到 .env 或 .env.example 文件"
        exit 1
    fi
fi

# 加载环境变量
export $(grep -v '^#' "$BACKEND_DIR/.env" | xargs)

# ============================================
# 2. 安装依赖
# ============================================
log_info "安装后端依赖..."
cd "$BACKEND_DIR"
npm ci --production

log_info "安装前端依赖..."
cd "$FRONTEND_DIR"
npm ci

# ============================================
# 3. 构建前端
# ============================================
log_info "构建前端..."
npm run build

# 检查构建结果
if [ ! -d "$FRONTEND_DIR/build" ]; then
    log_error "前端构建失败，build 目录不存在"
    exit 1
fi

log_success "前端构建完成"

# ============================================
# 4. 初始化数据库
# ============================================
log_info "初始化数据库..."
cd "$BACKEND_DIR"

# 检查数据库连接
if ! mysql -h"${DB_HOST:-localhost}" -u"${DB_USER:-root}" -p"${DB_PASSWORD:-}" -e "SELECT 1;" &>/dev/null; then
    log_error "数据库连接失败，请检查配置"
    exit 1
fi

# 创建数据库（如果不存在）
mysql -h"${DB_HOST:-localhost}" -u"${DB_USER:-root}" -p"${DB_PASSWORD:-}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME:-personal_website}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

log_success "数据库初始化完成"

# ============================================
# 5. 同步数据库模型
# ============================================
log_info "同步数据库模型..."
node -e "
const sequelize = require('./config/database');
const models = require('./models');

async function sync() {
    try {
        await sequelize.sync({ alter: true });
        console.log('数据库模型同步完成');
        process.exit(0);
    } catch (error) {
        console.error('同步失败:', error);
        process.exit(1);
    }
}

sync();
"

log_success "数据库模型同步完成"

# ============================================
# 6. 创建必要的目录
# ============================================
log_info "创建必要的目录..."
mkdir -p "$BACKEND_DIR/uploads"
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$BACKEND_DIR/backups"

# ============================================
# 7. 配置 Nginx（如果存在）
# ============================================
if command -v nginx &> /dev/null; then
    log_info "配置 Nginx..."
    
    # 生成 Nginx 配置
    cat > /tmp/personal-website.conf << 'EOF'
server {
    listen 80;
    server_name _;  # 接受所有域名

    # 前端静态文件
    location / {
        root /var/www/personal-website/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件
    location /uploads/ {
        alias /var/www/personal-website/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

    log_info "Nginx 配置已生成: /tmp/personal-website.conf"
    log_info "请手动复制到 /etc/nginx/sites-available/ 并启用"
fi

# ============================================
# 8. 配置 PM2（如果存在）
# ============================================
if command -v pm2 &> /dev/null; then
    log_info "配置 PM2..."
    
    cat > "$BACKEND_DIR/ecosystem.config.js" << EOF
module.exports = {
    apps: [{
        name: 'personal-website-api',
        script: './server.js',
        cwd: '$BACKEND_DIR',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: ${PORT:-5000}
        },
        log_file: './logs/combined.log',
        out_file: './logs/out.log',
        error_file: './logs/error.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        max_memory_restart: '500M',
        restart_delay: 3000,
        max_restarts: 5,
        min_uptime: '10s',
        watch: false,
        kill_timeout: 5000,
        listen_timeout: 10000
    }]
};
EOF

    log_success "PM2 配置已生成: $BACKEND_DIR/ecosystem.config.js"
    log_info "启动命令: pm2 start ecosystem.config.js"
fi

# ============================================
# 9. 生成启动脚本
# ============================================
log_info "生成启动脚本..."

cat > "$PROJECT_ROOT/start.sh" << 'EOF'
#!/bin/bash

# 个人网站项目 - 启动脚本

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "========================================"
echo "  个人网站项目 - 启动"
echo "========================================"

# 检查 PM2
if command -v pm2 &> /dev/null && [ -f "$BACKEND_DIR/ecosystem.config.js" ]; then
    echo "使用 PM2 启动后端..."
    cd "$BACKEND_DIR"
    pm2 start ecosystem.config.js
    pm2 save
    echo "后端已启动 (PM2)"
    echo "查看日志: pm2 logs personal-website-api"
else
    echo "使用 Node 直接启动后端..."
    cd "$BACKEND_DIR"
    nohup node server.js > logs/server.log 2>&1 &
    echo $! > server.pid
    echo "后端已启动 (PID: $(cat server.pid))"
fi

echo ""
echo "后端地址: http://localhost:5000"
echo "前端地址: http://localhost:3000 (开发) 或 http://localhost (生产+Nginx)"
echo ""
echo "========================================"
EOF

chmod +x "$PROJECT_ROOT/start.sh"

cat > "$PROJECT_ROOT/stop.sh" << 'EOF'
#!/bin/bash

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "停止服务..."

# 尝试 PM2
if command -v pm2 &> /dev/null; then
    pm2 stop personal-website-api 2>/dev/null || true
    pm2 delete personal-website-api 2>/dev/null || true
fi

# 尝试 PID 文件
if [ -f "$BACKEND_DIR/server.pid" ]; then
    kill $(cat "$BACKEND_DIR/server.pid") 2>/dev/null || true
    rm "$BACKEND_DIR/server.pid"
fi

echo "服务已停止"
EOF

chmod +x "$PROJECT_ROOT/stop.sh"

cat > "$PROJECT_ROOT/update.sh" << 'EOF'
#!/bin/bash

# 个人网站项目 - 更新脚本

set -e

PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)

echo "========================================"
echo "  个人网站项目 - 更新"
echo "========================================"

# 1. 停止服务
bash "$PROJECT_ROOT/stop.sh"

# 2. 拉取最新代码
echo "拉取最新代码..."
cd "$PROJECT_ROOT"
git pull origin main

# 3. 重新部署
echo "重新部署..."
bash "$PROJECT_ROOT/deploy.sh"

# 4. 启动服务
echo "启动服务..."
bash "$PROJECT_ROOT/start.sh"

echo ""
echo "========================================"
echo "  更新完成"
echo "========================================"
EOF

chmod +x "$PROJECT_ROOT/update.sh"

log_success "启动脚本已生成"

# ============================================
# 10. 部署完成
# ============================================
echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo ""
echo "项目路径: $PROJECT_ROOT"
echo "后端路径: $BACKEND_DIR"
echo "前端路径: $FRONTEND_DIR"
echo ""
echo "启动命令:"
echo "  ./start.sh    - 启动服务"
echo "  ./stop.sh     - 停止服务"
echo "  ./update.sh   - 更新并重启"
echo ""
echo "如果使用 PM2:"
echo "  pm2 start backend/ecosystem.config.js"
echo "  pm2 logs personal-website-api"
echo ""
echo "如果使用 Nginx:"
echo "  sudo cp /tmp/personal-website.conf /etc/nginx/sites-available/"
echo "  sudo ln -s /etc/nginx/sites-available/personal-website.conf /etc/nginx/sites-enabled/"
echo "  sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo "========================================"
