const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, Group } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取所有用户（管理员）
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'groupId', 'permissions', 'createdAt'],
      include: [{
        model: Group,
        as: 'group',
        attributes: ['id', 'name']
      }]
    });
    res.json(users);
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 修改密码 - 必须放在 /:id 之前
router.put('/password', [
  authMiddleware,
  body('currentPassword').notEmpty().withMessage('请输入当前密码'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员修改用户密码
router.put('/:id/password', [
  authMiddleware,
  adminMiddleware,
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { newPassword } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户（管理员）
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  body('username').optional().trim().isLength({ min: 2 }).withMessage('用户名至少2个字符'),
  body('email').optional().isEmail().withMessage('请输入有效的邮箱'),
  body('role').optional().isIn(['admin', 'user']).withMessage('无效的角色')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 只允许更新特定字段
    const allowedFields = ['username', 'email', 'role', 'isActive', 'groupId', 'permissions'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await user.update(updateData);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除用户（管理员）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 防止删除自己
    if (user.id === req.user.userId) {
      return res.status(400).json({ message: '不能删除当前登录用户' });
    }

    await user.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
