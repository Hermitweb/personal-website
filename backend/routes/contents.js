const express = require('express');
const { body, validationResult } = require('express-validator');
const Content = require('../models/Content');
const Section = require('../models/Section');
const { authMiddleware, adminMiddleware, verifyToken } = require('../middleware/auth');

const router = express.Router();

// 允许更新的字段白名单
const allowedFields = ['title', 'type', 'content', 'imageUrl', 'linkUrl', 'orderNum', 'isVisible', 'requireLogin', 'metadata'];

// 过滤请求体，只保留允许的字段
const filterBody = (body) => {
  const filtered = {};
  allowedFields.forEach(field => {
    if (body[field] !== undefined) {
      filtered[field] = body[field];
    }
  });
  return filtered;
};

// 获取所有内容（管理员接口，包含隐藏内容）- 必须放在 /:id 之前
router.get('/admin/all', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const contents = await Content.findAll({
      order: [['orderNum', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有内容（公开接口，根据登录状态过滤）
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const isLoggedIn = verifyToken(req);

    let whereClause = { isVisible: true };
    
    if (type) {
      whereClause.type = type;
    }

    // 如果未登录，只显示不需要登录的内容
    if (!isLoggedIn) {
      whereClause.requireLogin = false;
    }

    const contents = await Content.findAll({
      where: whereClause,
      order: [['orderNum', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json(contents);
  } catch (error) {
    console.error('获取内容错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个内容
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: '内容不存在' });
    }

    // 检查是否需要登录（验证 Token 有效性）
    if (content.requireLogin && !verifyToken(req)) {
      return res.status(401).json({ message: '需要登录才能查看此内容' });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建内容（需要管理员权限）
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('type').custom((value) => {
    const validTypes = ['hero', 'about', 'skill', 'project', 'contact', 'bookmark', 'custom'];
    if (validTypes.includes(value) || value.startsWith('section_')) {
      return true;
    }
    throw new Error('无效的内容类型');
  }).withMessage('无效的内容类型'),
  // 自定义板块：标题、内容、封面图至少填一个；其他类型：标题和内容必填
  body('title').custom((value, { req }) => {
    if (req.body.type?.startsWith('section_')) return true;
    if (!value || value.trim() === '') throw new Error('标题不能为空');
    return true;
  }),
  body('content').custom((value, { req }) => {
    if (req.body.type?.startsWith('section_')) return true;
    if (!value || value.trim() === '') throw new Error('内容不能为空');
    return true;
  }),
  body().custom((value, { req }) => {
    if (req.body.type?.startsWith('section_')) {
      const hasTitle = req.body.title && req.body.title.trim();
      const hasContent = req.body.content && req.body.content.trim();
      const hasImage = req.body.imageUrl;
      if (!hasTitle && !hasContent && !hasImage) {
        throw new Error('标题、内容、封面图至少需要填写一个');
      }
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const filteredData = filterBody(req.body);

    // 检查对应板块是否为单一内容模式且已有内容
    if (filteredData.type?.startsWith('section_')) {
      const section = await Section.findOne({ where: { contentType: filteredData.type } });
      if (section && section.displayMode === 'single') {
        const existCount = await Content.count({ where: { type: filteredData.type } });
        if (existCount > 0) {
          return res.status(400).json({ message: '该板块为单一内容模式，只能有一条内容，请修改已有内容' });
        }
      }
    }

    // Hero 类型只能有一条
    if (filteredData.type === 'hero') {
      const heroCount = await Content.count({ where: { type: 'hero' } });
      if (heroCount > 0) {
        return res.status(400).json({ message: '首页 Hero 配置只能有一条，请通过顶部按钮修改' });
      }
    }

    const content = await Content.create(filteredData);
    res.status(201).json(content);
  } catch (error) {
    console.error('创建内容错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新内容（需要管理员权限）
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: '内容不存在' });
    }

    const filteredData = filterBody(req.body);
    await content.update(filteredData);
    res.json(content);
  } catch (error) {
    console.error('更新内容错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除内容（需要管理员权限）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const content = await Content.findByPk(req.params.id);
    if (!content) {
      return res.status(404).json({ message: '内容不存在' });
    }

    await content.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除内容错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
