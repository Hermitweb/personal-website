const express = require('express');
const User = require('../models/User');
const SiteConfig = require('../models/SiteConfig');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 默认域名配置
const DEFAULT_DOMAIN_CONFIG = {
  mainDomain: '',
  enableCustomDomain: true,
  domainAliases: [],
  redirectToMain: true,
  sslEnabled: true
};

/**
 * 获取全局域名配置（公开）
 * GET /api/domain-config
 */
router.get('/', async (req, res) => {
  try {
    const configs = await SiteConfig.findAll({
      where: {
        key: ['mainDomain', 'enableCustomDomain', 'domainAliases', 'redirectToMain', 'sslEnabled']
      }
    });

    const configObj = { ...DEFAULT_DOMAIN_CONFIG };
    configs.forEach(config => {
      try {
        configObj[config.key] = JSON.parse(config.value);
      } catch {
        configObj[config.key] = config.value;
      }
    });

    res.json(configObj);
  } catch (error) {
    console.error('获取域名配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 更新全局域名配置（管理员）
 * PUT /api/domain-config
 */
router.put('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { mainDomain, enableCustomDomain, domainAliases, redirectToMain, sslEnabled } = req.body;

    const updates = [
      { key: 'mainDomain', value: mainDomain || '' },
      { key: 'enableCustomDomain', value: enableCustomDomain !== false },
      { key: 'domainAliases', value: JSON.stringify(domainAliases || []) },
      { key: 'redirectToMain', value: redirectToMain !== false },
      { key: 'sslEnabled', value: sslEnabled !== false }
    ];

    for (const update of updates) {
      const config = await SiteConfig.findOne({ where: { key: update.key } });
      if (config) {
        await config.update({ value: String(update.value) });
      } else {
        await SiteConfig.create({
          key: update.key,
          value: String(update.value),
          description: `域名配置: ${update.key}`
        });
      }
    }

    res.json({ message: '域名配置已更新' });
  } catch (error) {
    console.error('更新域名配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 根据域名获取对应用户（公开）
 * GET /api/domain-config/resolve?domain=xxx.com
 */
router.get('/resolve', async (req, res) => {
  try {
    const domain = req.query.domain || req.headers.host;

    if (!domain) {
      return res.status(400).json({ message: '域名不能为空' });
    }

    // 清理域名（去除端口和www前缀）
    const cleanDomain = domain.replace(/:\d+$/, '').replace(/^www\./, '');

    // 查询对应用户
    const user = await User.findOne({
      where: { customDomain: cleanDomain, isActive: true },
      attributes: ['id', 'username', 'domainConfig', 'preferences']
    });

    if (!user) {
      return res.status(404).json({ message: '该域名未绑定用户', domain: cleanDomain });
    }

    // 检查域名配置是否启用
    const domainConfig = user.domainConfig || {};
    if (!domainConfig.enabled) {
      return res.status(403).json({ message: '该域名功能已禁用' });
    }

    res.json({
      domain: cleanDomain,
      userId: user.id,
      username: user.username,
      domainConfig: user.domainConfig,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('域名解析失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 获取用户自定义域名配置（当前用户）
 * GET /api/domain-config/user
 */
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'customDomain', 'domainConfig']
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      customDomain: user.customDomain,
      domainConfig: user.domainConfig
    });
  } catch (error) {
    console.error('获取用户域名配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 更新用户自定义域名配置
 * PUT /api/domain-config/user
 */
router.put('/user', authMiddleware, async (req, res) => {
  try {
    const { customDomain, domainConfig } = req.body;
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 验证域名格式
    if (customDomain) {
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(customDomain)) {
        return res.status(400).json({ message: '域名格式不正确' });
      }

      // 检查域名是否已被其他用户使用
      const existingUser = await User.findOne({
        where: {
          customDomain: customDomain,
          id: { [require('sequelize').Op.ne]: user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: '该域名已被其他用户使用' });
      }
    }

    // 更新域名配置
    await user.update({
      customDomain: customDomain || null,
      domainConfig: {
        ...user.domainConfig,
        ...domainConfig
      }
    });

    res.json({
      message: '域名配置已更新',
      customDomain: user.customDomain,
      domainConfig: user.domainConfig
    });
  } catch (error) {
    console.error('更新用户域名配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * 检查域名可用性
 * GET /api/domain-config/check?domain=xxx.com
 */
router.get('/check', authMiddleware, async (req, res) => {
  try {
    const domain = req.query.domain;

    if (!domain) {
      return res.status(400).json({ message: '域名不能为空' });
    }

    const user = await User.findOne({
      where: { customDomain: domain }
    });

    if (user && user.id !== req.user.userId) {
      return res.json({ available: false, message: '该域名已被使用' });
    }

    // 检查全局域名配置
    const mainDomain = await SiteConfig.findOne({ where: { key: 'mainDomain' } });
    if (mainDomain && mainDomain.value === domain) {
      return res.json({ available: false, message: '该域名已被设为主域名' });
    }

    res.json({ available: true, message: '域名可用' });
  } catch (error) {
    console.error('检查域名失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
