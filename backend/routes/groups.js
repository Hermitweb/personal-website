const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Group, User } = require('../models');

const router = express.Router();

// 获取所有组（管理员）
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'email']
      }]
    });
    res.json(groups);
  } catch (error) {
    console.error('获取组列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建组（管理员）
router.post('/', [
  authMiddleware,
  adminMiddleware,
  body('name').trim().isLength({ min: 2 }).withMessage('组名至少2个字符'),
  body('description').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, permissions } = req.body;
    
    const existingGroup = await Group.findOne({ where: { name } });
    if (existingGroup) {
      return res.status(400).json({ message: '组名已存在' });
    }

    const group = await Group.create({
      name,
      description,
      permissions: permissions || []
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('创建组失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新组（管理员）
router.put('/:id', [
  authMiddleware,
  adminMiddleware,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('组名至少2个字符'),
  body('description').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ message: '组不存在' });
    }

    const { name, description, permissions } = req.body;

    // 如果修改了组名，检查是否与其他组重复
    if (name && name !== group.name) {
      const existingGroup = await Group.findOne({ where: { name } });
      if (existingGroup) {
        return res.status(400).json({ message: '组名已存在' });
      }
    }

    await group.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(permissions && { permissions })
    });

    res.json(group);
  } catch (error) {
    console.error('更新组失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除组（管理员）
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json({ message: '组不存在' });
    }

    // 将该组下的用户移到默认组（groupId 设为 null）
    await User.update({ groupId: null }, { where: { groupId: group.id } });

    await group.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除组失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 批量设置用户组（管理员）
router.post('/assign-users', [
  authMiddleware,
  adminMiddleware,
  body('groupId').isInt().withMessage('无效的组ID'),
  body('userIds').isArray().withMessage('用户ID列表必须是数组')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { groupId, userIds } = req.body;

    // 检查组是否存在
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: '组不存在' });
    }

    // 更新用户的组
    await User.update({ groupId }, { where: { id: userIds } });

    res.json({ message: '分配成功' });
  } catch (error) {
    console.error('分配用户到组失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
