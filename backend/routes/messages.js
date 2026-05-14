const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sensitiveWordFilter } = require('../utils/sensitiveWords');

const router = express.Router();

// 提交留言（公开接口）- 支持联系表单和留言板
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, content, isPublic } = req.body;
    
    // 简单验证
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: '请输入姓名' });
    }
    if (name.trim().length > 50) {
      return res.status(400).json({ message: '姓名长度不能超过50个字符' });
    }
    if (message && message.trim().length > 2000) {
      return res.status(400).json({ message: '留言内容不能超过2000个字符' });
    }
    if (content && content.trim().length > 2000) {
      return res.status(400).json({ message: '留言内容不能超过2000个字符' });
    }

    // 敏感词检测
    const textToCheck = `${name} ${email || ''} ${subject || ''} ${message || ''} ${content || ''}`;
    const sensitiveCheck = sensitiveWordFilter.validate(textToCheck);
    if (!sensitiveCheck.valid) {
      return res.status(400).json({ 
        message: '内容包含敏感词，请修改后重新提交',
        sensitiveWords: sensitiveCheck.words 
      });
    }

    const newMessage = await Message.create({
      name: name.trim(),
      email: email?.trim() || '',
      subject: subject?.trim() || '',
      message: message?.trim() || content?.trim() || '',
      content: content?.trim() || message?.trim() || '',
      isPublic: isPublic !== false
    });

    res.status(201).json({
      message: '留言提交成功！',
      id: newMessage.id
    });
  } catch (error) {
    console.error('提交留言错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有留言（管理员）
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 20, unread, public: isPublic } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (unread === 'true') {
      whereClause.isRead = false;
    }
    if (isPublic === 'true') {
      whereClause.isPublic = true;
    }

    const { count, rows } = await Message.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      messages: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('获取留言错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取未读留言数量（管理员）- 必须放在 /:id 之前
router.get('/stats/unread', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const count = await Message.count({ where: { isRead: false } });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个留言（管理员）
router.get('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: '留言不存在' });
    }

    // 标记为已读
    if (!message.isRead) {
      await message.update({ isRead: true });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 回复留言（管理员）
router.put('/:id/reply', [
  authMiddleware,
  adminMiddleware,
  body('reply').trim().isLength({ min: 1, max: 2000 }).withMessage('回复内容长度应在1-2000字符之间')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: '留言不存在' });
    }

    await message.update({
      reply: req.body.reply,
      isReplied: true
    });

    res.json({ message: '回复成功', data: message });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除留言（管理员）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ message: '留言不存在' });
    }

    await message.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
