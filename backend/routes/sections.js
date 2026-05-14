const express = require('express');
const { body, validationResult } = require('express-validator');
const Section = require('../models/Section');
const Content = require('../models/Content');
const { authMiddleware, adminMiddleware, verifyToken } = require('../middleware/auth');
const { filterSectionsByDomainConfig, filterContentByDomainConfig } = require('../middleware/domainResolver');
const { logOperation } = require('../utils/operationLog');

const router = express.Router();

// 允许更新的字段白名单
const allowedFields = [
  'name', 'slug', 'sectionType', 'contentType', 'displayMode',
  'description', 'icon', 'styleConfig', 'orderNum', 'isVisible', 'requireLogin', 'config'
];

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

// 默认内置板块配置
const DEFAULT_BUILTIN_SECTIONS = [
  {
    name: '技能',
    slug: 'skills',
    sectionType: 'builtin',
    contentType: 'skill',
    displayMode: 'list',
    description: '展示专业技能和特长',
    icon: 'FaCode',
    orderNum: 1,
    isVisible: true,
    requireLogin: false,
    config: { columns: 3, rows: 3, showTitle: true, showDescription: false }
  },
  {
    name: '项目',
    slug: 'projects',
    sectionType: 'builtin',
    contentType: 'project',
    displayMode: 'list',
    description: '展示项目作品和案例',
    icon: 'FaProjectDiagram',
    orderNum: 2,
    isVisible: true,
    requireLogin: false,
    config: { columns: 3, rows: 3, showTitle: true, showDescription: false }
  },
  {
    name: '站点收藏',
    slug: 'bookmarks',
    sectionType: 'builtin',
    contentType: 'bookmark',
    displayMode: 'list',
    description: '收藏的网站和资源链接',
    icon: 'FaBookmark',
    orderNum: 3,
    isVisible: true,
    requireLogin: false,
    config: { columns: 3, rows: 3, showTitle: true, showDescription: false }
  }
];

// 初始化默认板块（如果不存在）
const initDefaultSections = async () => {
  try {
    const count = await Section.count();
    if (count === 0) {
      await Section.bulkCreate(DEFAULT_BUILTIN_SECTIONS);
      console.log('默认板块初始化完成');
    }
  } catch (error) {
    console.error('初始化默认板块失败:', error);
  }
};

// 启动时初始化
initDefaultSections();

// 获取所有板块（管理员接口）
router.get('/admin/all', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const sections = await Section.findAll({
      order: [['orderNum', 'ASC'], ['createdAt', 'ASC']]
    });

    // 批量查询所有板块的内容数量（避免N+1查询）
    const contentTypes = sections.map(s => s.contentType).filter(Boolean);
    const contentCounts = await Content.findAll({
      attributes: ['type', [require('../config/database').fn('COUNT', '*'), 'count']],
      where: { type: contentTypes },
      group: ['type'],
      raw: true
    });
    const countMap = {};
    for (const item of contentCounts) {
      countMap[item.type] = parseInt(item.count);
    }

    const sectionsWithCount = sections.map(section => {
      const sectionJson = section.toJSON();
      sectionJson.contentCount = countMap[section.contentType] || 0;
      return sectionJson;
    });

    res.json(sectionsWithCount);
  } catch (error) {
    console.error('获取板块列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有可见板块（公开接口，包含板块内容）
router.get('/', async (req, res) => {
  try {
    const isLoggedIn = verifyToken(req);
    const isDomainUser = !!req.domainUser;
    const domainConfig = req.domainUser?.domainConfig;

    let whereClause = { isVisible: true };

    // 如果未登录且非域名用户，只显示不需要登录的板块
    if (!isLoggedIn && !isDomainUser) {
      whereClause.requireLogin = false;
    }

    const sections = await Section.findAll({
      where: whereClause,
      order: [['orderNum', 'ASC'], ['createdAt', 'ASC']]
    });

    // 域名用户：根据配置过滤板块
    let filteredSections = sections;
    if (isDomainUser) {
      filteredSections = filterSectionsByDomainConfig(sections.map(s => s.toJSON()), domainConfig);
    }

    // 为每个板块获取对应的内容
    const sectionsWithContent = await Promise.all(
      filteredSections.map(async (section, index) => {
        const contentWhere = { type: section.contentType, isVisible: true };
        
        // 未登录且非域名用户：只显示公开内容
        if (!isLoggedIn && !isDomainUser) {
          contentWhere.requireLogin = false;
        }

        // 获取该板块的所有内容
        let allContents = await Content.findAll({
          where: contentWhere,
          order: [['orderNum', 'ASC'], ['createdAt', 'DESC']]
        });

        let contents = allContents.map(c => c.toJSON());

        // 域名用户：只显示公开内容
        if (isDomainUser) {
          contents = filterContentByDomainConfig(contents, domainConfig);
        }

        // 未登录用户：中间板块（非第一和最后一个）随机显示内容
        if (!isLoggedIn && !isDomainUser && filteredSections.length > 2) {
          const isFirst = index === 0;
          const isLast = index === filteredSections.length - 1;

          if (!isFirst && !isLast && contents.length > 0) {
            // 随机打乱并取前几条
            const shuffled = [...contents].sort(() => Math.random() - 0.5);
            contents = shuffled.slice(0, Math.min(6, shuffled.length));
          }
        }

        return {
          ...section,
          contents: contents
        };
      })
    );

    res.json(sectionsWithContent);
  } catch (error) {
    console.error('获取板块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个板块（公开接口）
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({ message: '板块不存在' });
    }

    // 检查是否需要登录
    if (section.requireLogin && !verifyToken(req)) {
      return res.status(401).json({ message: '需要登录才能查看此板块' });
    }

    // 获取板块内容
    const isLoggedIn = verifyToken(req);
    const contentWhere = { type: section.contentType, isVisible: true };
    if (!isLoggedIn) {
      contentWhere.requireLogin = false;
    }

    const contents = await Content.findAll({
      where: contentWhere,
      order: [['orderNum', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      ...section.toJSON(),
      contents: contents
    });
  } catch (error) {
    console.error('获取板块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 通过 slug 获取板块
router.get('/slug/:slug', async (req, res) => {
  try {
    const section = await Section.findOne({ where: { slug: req.params.slug } });
    if (!section) {
      return res.status(404).json({ message: '板块不存在' });
    }

    // 检查是否需要登录
    if (section.requireLogin && !verifyToken(req)) {
      return res.status(401).json({ message: '需要登录才能查看此板块' });
    }

    // 获取板块内容
    const isLoggedIn = verifyToken(req);
    const contentWhere = { type: section.contentType, isVisible: true };
    if (!isLoggedIn) {
      contentWhere.requireLogin = false;
    }

    const contents = await Content.findAll({
      where: contentWhere,
      order: [['orderNum', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      ...section.toJSON(),
      contents: contents
    });
  } catch (error) {
    console.error('获取板块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建板块（需要管理员权限）
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('name').trim().notEmpty().withMessage('板块名称不能为空'),
  body('slug').trim().notEmpty().withMessage('板块标识不能为空'),
  body('contentType').trim().notEmpty().withMessage('内容类型不能为空'),
  body('displayMode').isIn(['list', 'single']).withMessage('无效的展示模式')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // 检查 slug 是否已存在
    const existing = await Section.findOne({ where: { slug: req.body.slug } });
    if (existing) {
      return res.status(400).json({ message: '板块标识已存在' });
    }

    const filteredData = filterBody(req.body);
    
    // 自定义板块：使用 section_{id} 作为唯一 contentType，确保内容隔离
    if (filteredData.sectionType === 'custom' || filteredData.contentType === 'custom') {
      filteredData.sectionType = 'custom';
      // 先创建板块获取ID，再更新 contentType
      const section = await Section.create({
        ...filteredData,
        contentType: 'custom_temp' // 临时值，创建后更新
      });
      const uniqueContentType = `section_${section.id}`;
      await section.update({ contentType: uniqueContentType });
      
      await logOperation(req.user.id, 'create', 'section', section.id, `创建板块: ${section.name}`);
      return res.status(201).json(section);
    }
    
    const section = await Section.create(filteredData);
    
    await logOperation(req.user.id, 'create', 'section', section.id, `创建板块: ${section.name}`);
    res.status(201).json(section);
  } catch (error) {
    console.error('创建板块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新板块（需要管理员权限）
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({ message: '板块不存在' });
    }

    // 如果修改了 slug，检查是否与其他板块冲突
    if (req.body.slug && req.body.slug !== section.slug) {
      const existing = await Section.findOne({ where: { slug: req.body.slug } });
      if (existing) {
        return res.status(400).json({ message: '板块标识已存在' });
      }
    }

    const filteredData = filterBody(req.body);
    await section.update(filteredData);
    
    await logOperation(req.user.id, 'update', 'section', section.id, `更新板块: ${section.name}`);
    res.json(section);
  } catch (error) {
    console.error('更新板块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除板块（需要管理员权限）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({ message: '板块不存在' });
    }

    // 不允许删除内置板块
    if (section.sectionType === 'builtin') {
      return res.status(400).json({ message: '内置板块不能删除，只能隐藏' });
    }

    // 检查板块下是否有内容
    const contentCount = await Content.count({ where: { type: section.contentType } });
    if (contentCount > 0) {
      return res.status(400).json({ message: `该板块下还有 ${contentCount} 条内容，请先清空内容后再删除` });
    }

    const sectionName = section.name;
    await section.destroy();
    
    await logOperation(req.user.id, 'delete', 'section', req.params.id, `删除板块: ${sectionName}`);
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除板块错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量更新排序（需要管理员权限）
router.post('/reorder', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: 1, orderNum: 1 }, ...]
    
    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: '无效的排序数据' });
    }

    await Promise.all(
      orders.map(item => 
        Section.update({ orderNum: item.orderNum }, { where: { id: item.id } })
      )
    );

    res.json({ message: '排序更新成功' });
  } catch (error) {
    console.error('更新排序错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 切换板块可见性
router.put('/:id/visibility', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({ message: '板块不存在' });
    }

    await section.update({ isVisible: !section.isVisible });
    await logOperation(req.user.id, 'update', 'section', section.id, 
      `${section.isVisible ? '显示' : '隐藏'}板块: ${section.name}`);
    
    res.json(section);
  } catch (error) {
    console.error('切换可见性错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
