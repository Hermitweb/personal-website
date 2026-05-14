const express = require('express');
const { Op, Sequelize } = require('sequelize');
const OperationLog = require('../models/OperationLog');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取操作日志列表（管理员）
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      action,
      module,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // 筛选条件
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { targetName: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      logs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取操作统计（管理员）
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 按日期统计
    const dailyStats = await OperationLog.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', '*'), 'total'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'success' THEN 1 ELSE 0 END")), 'success'],
        [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN status = 'fail' THEN 1 ELSE 0 END")), 'fail']
      ],
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // 按模块统计
    const moduleStats = await OperationLog.findAll({
      attributes: [
        'module',
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      group: ['module'],
      order: [[Sequelize.fn('COUNT', '*'), 'DESC']],
      raw: true
    });

    // 按操作类型统计
    const actionStats = await OperationLog.findAll({
      attributes: [
        'action',
        [Sequelize.fn('COUNT', '*'), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      group: ['action'],
      order: [[Sequelize.fn('COUNT', '*'), 'DESC']],
      raw: true
    });

    res.json({
      dailyStats,
      moduleStats,
      actionStats
    });
  } catch (error) {
    console.error('获取操作统计失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单条日志详情
router.get('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const log = await OperationLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ message: '日志不存在' });
    }
    res.json(log);
  } catch (error) {
    console.error('获取日志详情失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 清理旧日志（管理员）
router.delete('/cleanup', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await OperationLog.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate }
      }
    });

    res.json({
      message: `已清理 ${result} 条 ${days} 天前的日志`
    });
  } catch (error) {
    console.error('清理日志失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
