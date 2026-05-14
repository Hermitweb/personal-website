const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
require('dotenv').config();

const db = require('./models');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/contents');
const userRoutes = require('./routes/users');
const configRoutes = require('./routes/config');
const uploadRoutes = require('./routes/upload');
const messageRoutes = require('./routes/messages');
const blogRoutes = require('./routes/blogs');
const visitorRoutes = require('./routes/visitors');
const featureRoutes = require('./routes/features');
const exportRoutes = require('./routes/export');
const groupRoutes = require('./routes/groups');
const logRoutes = require('./routes/logs');
const emailConfigRoutes = require('./routes/emailConfig');
const userConfigRoutes = require('./routes/userConfig');
const sectionRoutes = require('./routes/sections');
const domainConfigRoutes = require('./routes/domainConfig');

const app = express();

// 请求限流
const rateLimit = require('express-rate-limit');

// 通用API限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100次请求
  message: { message: '请求过于频繁，请稍后再试' }
});

// 认证接口限流（更严格）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 每个IP最多10次
  message: { message: '操作过于频繁，请15分钟后再试' }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', apiLimiter);

// 域名解析中间件
const { domainResolver } = require('./middleware/domainResolver');
app.use(domainResolver);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
// 根路径静态文件服务（用于 favicon）
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.ico')) {
      res.set('Content-Type', 'image/x-icon');
    }
  }
}));

// 路由
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/email-config', emailConfigRoutes);
app.use('/api/user-config', userConfigRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/domain-config', domainConfigRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '服务器运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 数据库连接和服务器启动
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 测试数据库连接
    await db.sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步数据库模型（只创建新表，不修改现有表）
    await db.sequelize.sync({ alter: false, force: false });
    console.log('数据库模型同步完成');

    // JWT 密钥安全检查
    if (process.env.JWT_SECRET === 'your_jwt_secret_key_here' || !process.env.JWT_SECRET) {
      console.warn('⚠️  警告：JWT_SECRET 使用默认值，请在 .env 文件中设置强密钥！');
    }

    // 创建默认管理员账户（仅当环境变量允许时）
    const bcrypt = require('bcryptjs');
    const adminExists = await db.User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists && process.env.CREATE_DEFAULT_ADMIN !== 'false') {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2024Secure';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await db.User.create({
        username: 'admin',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('默认管理员账户已创建，请立即修改默认密码！');
    }

    // 初始化默认用户组
    const Group = db.Group;
    const defaultGroups = [
      { name: '管理员', description: '系统管理员组，拥有所有权限' },
      { name: '普通用户', description: '普通用户组，拥有基本权限' }
    ];
    
    for (const group of defaultGroups) {
      const exists = await Group.findOne({ where: { name: group.name } });
      if (!exists) {
        await Group.create(group);
      }
    }
    console.log('默认用户组初始化完成');

    // 初始化注册设置
    const SiteConfig = db.SiteConfig;
    const defaultUserGroup = await Group.findOne({ where: { name: '普通用户' } });
    const registerSettings = [
      { 
        key: 'register_enabled', 
        value: 'true', 
        description: '是否允许注册' 
      },
      { 
        key: 'register_require_email', 
        value: 'true', 
        description: '注册是否要求邮箱验证' 
      },
      { 
        key: 'register_default_group_id', 
        value: defaultUserGroup ? defaultUserGroup.id.toString() : '', 
        description: '新用户默认归属的用户组ID' 
      },
      { 
        key: 'register_require_invite', 
        value: 'false', 
        description: '注册是否需要邀请码' 
      },
      { 
        key: 'register_require_captcha', 
        value: 'true', 
        description: '注册是否需要验证码' 
      },
      { 
        key: 'register_ip_limit_count', 
        value: '5', 
        description: '同一IP每小时允许注册的最大数量' 
      },
      { 
        key: 'register_ip_limit_minutes', 
        value: '60', 
        description: 'IP注册限制的时间窗口（分钟）' 
      },
      { 
        key: 'register_min_username_length', 
        value: '3', 
        description: '用户名最小长度' 
      },
      { 
        key: 'register_min_password_length', 
        value: '8', 
        description: '密码最小长度' 
      }
    ];
    
    for (const setting of registerSettings) {
      const exists = await SiteConfig.findOne({ where: { key: setting.key } });
      if (!exists) {
        await SiteConfig.create(setting);
      }
    }
    console.log('注册设置初始化完成');

    // 初始化功能配置
    const SiteFeature = db.SiteFeature;
    const defaultFeatures = [
      { feature: 'blog', enabled: true, config: { postsPerPage: 10, allowComments: true } },
      { feature: 'messageBoard', enabled: true, config: { requireLogin: false, moderation: true } },
      { feature: 'visitorStats', enabled: true, config: {} },
      { feature: 'search', enabled: true, config: {} },
      { feature: 'multiLanguage', enabled: false, config: { languages: ['zh', 'en'] } },
      { feature: 'pwa', enabled: false, config: {} },
      { feature: 'themeToggle', enabled: true, config: { defaultTheme: 'dark' } },
      { feature: 'projectDetail', enabled: true, config: {} }
    ];
    
    for (const feature of defaultFeatures) {
      const exists = await SiteFeature.findOne({ where: { feature: feature.feature } });
      if (!exists) {
        await SiteFeature.create(feature);
      }
    }
    console.log('功能配置初始化完成');

    // 读取SSL配置
    const sslEnabled = await SiteConfig.findOne({ where: { key: 'ssl_enabled' } });
    const sslCertPath = await SiteConfig.findOne({ where: { key: 'ssl_cert_path' } });
    const sslKeyPath = await SiteConfig.findOne({ where: { key: 'ssl_key_path' } });
    const sslCertContent = await SiteConfig.findOne({ where: { key: 'ssl_cert_content' } });
    const sslKeyContent = await SiteConfig.findOne({ where: { key: 'ssl_key_content' } });
    const sslCaContent = await SiteConfig.findOne({ where: { key: 'ssl_ca_content' } });
    const sslForceRedirect = await SiteConfig.findOne({ where: { key: 'ssl_force_redirect' } });
    const httpPortConfig = await SiteConfig.findOne({ where: { key: 'http_port' } });
    const httpsPortConfig = await SiteConfig.findOne({ where: { key: 'https_port' } });

    const isSslEnabled = sslEnabled && sslEnabled.value === 'true';
    const httpPort = parseInt(httpPortConfig?.value || '80');
    const httpsPort = parseInt(httpsPortConfig?.value || '443');

    if (isSslEnabled) {
      let sslOptions = null;

      // 优先使用证书内容（直接从数据库读取）
      if (sslCertContent?.value && sslKeyContent?.value) {
        try {
          sslOptions = {
            cert: sslCertContent.value,
            key: sslKeyContent.value
          };

          // CA证书链（可选）
          if (sslCaContent?.value) {
            sslOptions.ca = sslCaContent.value;
          }

          console.log('SSL证书：从数据库配置加载');
        } catch (err) {
          console.error('SSL证书内容解析失败:', err.message);
        }
      }

      // 如果没有证书内容，尝试从文件读取
      if (!sslOptions && sslCertPath?.value && sslKeyPath?.value) {
        if (fs.existsSync(sslCertPath.value) && fs.existsSync(sslKeyPath.value)) {
          try {
            sslOptions = {
              cert: fs.readFileSync(sslCertPath.value),
              key: fs.readFileSync(sslKeyPath.value)
            };
            console.log('SSL证书：从文件路径加载');
          } catch (err) {
            console.error('SSL证书文件读取失败:', err.message);
          }
        } else {
          console.error('SSL证书文件不存在');
        }
      }

      if (sslOptions) {
        // 创建HTTPS服务器
        const httpsServer = https.createServer(sslOptions, app);
        httpsServer.listen(httpsPort, () => {
          console.log(`✓ HTTPS服务器运行在端口 ${httpsPort}`);
        });

        // 如果需要强制跳转或同时支持HTTP
        if (sslForceRedirect && sslForceRedirect.value === 'true') {
          const redirectApp = express();
          redirectApp.use('*', (req, res) => {
            res.redirect(`https://${req.headers.host}${req.originalUrl}`);
          });
          http.createServer(redirectApp).listen(httpPort, () => {
            console.log(`✓ HTTP服务器运行在端口 ${httpPort}（自动跳转到HTTPS）`);
          });
        } else {
          // 同时启动HTTP服务器
          http.createServer(app).listen(httpPort, () => {
            console.log(`✓ HTTP服务器运行在端口 ${httpPort}`);
          });
        }
      } else {
        // 没有有效的SSL配置，回退到HTTP
        console.warn('⚠ 没有有效的SSL证书配置，回退到HTTP模式');
        app.listen(PORT, () => {
          console.log(`服务器运行在端口 ${PORT}（HTTP模式）`);
        });
      }
    } else {
      // HTTPS未启用，HTTP模式
      app.listen(PORT, () => {
        console.log(`服务器运行在端口 ${PORT}`);
      });
    }
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
};

startServer();
