const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 生成 slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// 公开接口：获取已发布的博客列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().trim()
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { category, tag, search } = req.query;

    const whereClause = { isPublished: true };
    if (category) {
      whereClause.category = category;
    }

    const include = [];
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.like]: `%${search}%` } },
        { content: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Blog.findAndCountAll({
      where: whereClause,
      order: [['publishedAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'title', 'slug', 'excerpt', 'coverImage', 'category', 'tags', 'author', 'viewCount', 'likeCount', 'publishedAt', 'createdAt']
    });

    res.json({
      blogs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('获取博客列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 公开接口：获取单个博客（通过 slug）
router.get('/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      where: { slug: req.params.slug, isPublished: true }
    });

    if (!blog) {
      return res.status(404).json({ message: '文章不存在' });
    }

    // 增加浏览量
    await blog.increment('viewCount');

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 公开接口：获取博客分类列表
router.get('/categories', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      where: { isPublished: true },
      attributes: ['category']
    });

    const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员接口：获取所有博客（包含未发布）
router.get('/admin/all', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status === 'published') {
      whereClause.isPublished = true;
    } else if (status === 'draft') {
      whereClause.isPublished = false;
    }

    const { count, rows } = await Blog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      blogs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员接口：创建博客
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('title').trim().notEmpty().withMessage('标题不能为空'),
  body('content').trim().notEmpty().withMessage('内容不能为空')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, excerpt, coverImage, category, tags, author, isPublished, allowComment } = req.body;

    let slug = req.body.slug || generateSlug(title);
    
    // 确保 slug 唯一
    const existingBlog = await Blog.findOne({ where: { slug } });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      coverImage,
      category,
      tags: tags || [],
      author,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
      allowComment: allowComment !== false
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('创建博客错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员接口：更新博客
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: '博客不存在' });
    }

    const allowedFields = ['title', 'slug', 'content', 'excerpt', 'coverImage', 'category', 'tags', 'author', 'isPublished', 'allowComment'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // 处理发布状态变化
    if (updateData.isPublished === true && !blog.isPublished) {
      updateData.publishedAt = new Date();
    }

    await blog.update(updateData);
    res.json(blog);
  } catch (error) {
    console.error('更新博客错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员接口：删除博客
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: '博客不存在' });
    }

    await blog.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 点赞博客
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: '博客不存在' });
    }

    await blog.increment('likeCount');
    res.json({ likeCount: blog.likeCount + 1 });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
