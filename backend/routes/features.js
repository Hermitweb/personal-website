const express = require('express');
const { body, validationResult } = require('express-validator');
const SiteFeature = require('../models/SiteFeature');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 默认功能配置
const DEFAULT_FEATURES = [
  { feature: 'blog', enabled: true, config: { postsPerPage: 10, allowComments: true } },
  { feature: 'messageBoard', enabled: true, config: { requireLogin: false, moderation: true } },
  { feature: 'visitorStats', enabled: true, config: {} },
  { feature: 'search', enabled: true, config: {} },
  { feature: 'multiLanguage', enabled: false, config: { languages: ['zh', 'en'] } },
  { feature: 'pwa', enabled: false, config: {} },
  { feature: 'themeToggle', enabled: true, config: { defaultTheme: 'dark' } },
  { feature: 'projectDetail', enabled: true, config: {} }
];

// 初始化默认功能配置
const initFeatures = async () => {
  for (const feature of DEFAULT_FEATURES) {
    const exists = await SiteFeature.findOne({ where: { feature: feature.feature } });
    if (!exists) {
      await SiteFeature.create(feature);
    }
  }
};

// 获取所有功能状态（公开）
router.get('/', async (req, res) => {
  try {
    let features = await SiteFeature.findAll();
    
    // 如果没有功能配置，初始化默认配置
    if (features.length === 0) {
      await initFeatures();
      features = await SiteFeature.findAll();
    }

    res.json(features);
  } catch (error) {
    console.error('获取功能状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个功能状态（公开）
router.get('/:feature', async (req, res) => {
  try {
    const feature = await SiteFeature.findOne({
      where: { feature: req.params.feature }
    });

    if (!feature) {
      return res.status(404).json({ message: '功能不存在' });
    }

    res.json(feature);
  } catch (error) {
    console.error('获取功能状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新功能状态（管理员）
router.put('/:feature', [
  authMiddleware,
  adminMiddleware,
  body('enabled').optional().isBoolean(),
  body('config').optional().isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const feature = await SiteFeature.findOne({
      where: { feature: req.params.feature }
    });

    if (!feature) {
      return res.status(404).json({ message: '功能不存在' });
    }

    const { enabled, config } = req.body;
    const updateData = {};
    
    if (enabled !== undefined) updateData.enabled = enabled;
    if (config) updateData.config = { ...feature.config, ...config };

    await feature.update(updateData);
    res.json(feature);
  } catch (error) {
    console.error('更新功能状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量更新功能状态（管理员）
router.put('/batch/update', [
  authMiddleware,
  adminMiddleware,
  body('features').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { features } = req.body;
    
    for (const item of features) {
      await SiteFeature.update(
        { enabled: item.enabled, config: item.config },
        { where: { feature: item.feature } }
      );
    }

    const updatedFeatures = await SiteFeature.findAll();
    res.json(updatedFeatures);
  } catch (error) {
    console.error('批量更新功能状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
