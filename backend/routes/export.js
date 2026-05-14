const express = require('express');
const { Op } = require('sequelize');
const db = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 导出所有数据
router.get('/all', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const data = {
      users: await db.User.findAll({
        attributes: { exclude: ['password'] }
      }),
      contents: await db.Content.findAll(),
      siteConfigs: await db.SiteConfig.findAll(),
      messages: await db.Message.findAll(),
      blogs: await db.Blog.findAll(),
      features: await db.SiteFeature.findAll(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    res.json(data);
  } catch (error) {
    console.error('导出数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 导出博客数据
router.get('/blogs', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const blogs = await db.Blog.findAll();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=blogs-${Date.now()}.json`);
    res.json({
      blogs,
      exportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('导出博客错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 导出内容数据
router.get('/contents', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const contents = await db.Content.findAll();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=contents-${Date.now()}.json`);
    res.json({
      contents,
      exportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('导出内容错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 导出留言数据
router.get('/messages', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const messages = await db.Message.findAll();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=messages-${Date.now()}.json`);
    res.json({
      messages,
      exportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('导出留言错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 导入数据
router.post('/import', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { data, overwrite } = req.body;
    
    if (!data) {
      return res.status(400).json({ message: '无效的导入数据' });
    }

    const results = {
      users: 0,
      contents: 0,
      blogs: 0,
      messages: 0,
      features: 0
    };

    // 导入用户（跳过已存在的）
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        const exists = await db.User.findOne({ where: { email: user.email } });
        if (!exists || overwrite) {
          if (overwrite && exists) {
            await db.User.update(user, { where: { id: exists.id } });
          } else if (!exists) {
            await db.User.create(user);
          }
          results.users++;
        }
      }
    }

    // 导入内容（按 type + title 去重）
    if (data.contents && Array.isArray(data.contents)) {
      for (const content of data.contents) {
        const exists = await db.Content.findOne({ 
          where: { type: content.type, title: content.title } 
        });
        if (!exists || overwrite) {
          if (overwrite && exists) {
            await db.Content.update(content, { where: { id: exists.id } });
          } else if (!exists) {
            await db.Content.create(content);
          }
          results.contents++;
        }
      }
    }

    // 导入博客
    if (data.blogs && Array.isArray(data.blogs)) {
      for (const blog of data.blogs) {
        const exists = await db.Blog.findOne({ where: { slug: blog.slug } });
        if (!exists || overwrite) {
          if (overwrite && exists) {
            await db.Blog.update(blog, { where: { id: exists.id } });
          } else if (!exists) {
            await db.Blog.create(blog);
          }
          results.blogs++;
        }
      }
    }

    // 导入留言
    if (data.messages && Array.isArray(data.messages)) {
      for (const message of data.messages) {
        if (overwrite) {
          await db.Message.create(message);
          results.messages++;
        }
      }
    }

    // 导入功能配置
    if (data.features && Array.isArray(data.features)) {
      for (const feature of data.features) {
        const exists = await db.SiteFeature.findOne({ where: { feature: feature.feature } });
        if (!exists || overwrite) {
          if (overwrite && exists) {
            await db.SiteFeature.update(feature, { where: { id: exists.id } });
          } else if (!exists) {
            await db.SiteFeature.create(feature);
          }
          results.features++;
        }
      }
    }

    res.json({
      message: '导入完成',
      results
    });
  } catch (error) {
    console.error('导入数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
