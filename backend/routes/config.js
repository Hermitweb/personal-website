const express = require('express');
const SiteConfig = require('../models/SiteConfig');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取所有配置
router.get('/', async (req, res) => {
  try {
    const configs = await SiteConfig.findAll();
    const configObj = {};
    configs.forEach(config => {
      configObj[config.key] = config.value;
    });
    res.json(configObj);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个配置
router.get('/:key', async (req, res) => {
  try {
    const config = await SiteConfig.findOne({ where: { key: req.params.key } });
    if (!config) {
      return res.status(404).json({ message: '配置不存在' });
    }
    res.json({ key: config.key, value: config.value });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新或创建配置（管理员）
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    let config = await SiteConfig.findOne({ where: { key } });
    
    if (config) {
      await config.update({ value, description });
    } else {
      config = await SiteConfig.create({ key, value, description });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量更新配置（管理员）
router.put('/batch', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const configs = req.body;
    
    for (const [key, value] of Object.entries(configs)) {
      await SiteConfig.upsert({ key, value });
    }
    
    res.json({ message: '配置更新成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
