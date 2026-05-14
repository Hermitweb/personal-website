const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Visitor = require('../models/Visitor');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// HTML转义工具函数
const escapeHtml = (str) => {
  if (!str) return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

// 记录访客
router.post('/track', async (req, res) => {
  try {
    const { path, referrer, sessionId } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await Visitor.create({
      ip: ip?.substring(0, 50), // 限制长度
      userAgent: escapeHtml(userAgent?.substring(0, 500)),
      path: escapeHtml(path?.substring(0, 500)),
      referrer: escapeHtml(referrer?.substring(0, 500)),
      sessionId: sessionId?.substring(0, 100)
    });

    res.json({ success: true });
  } catch (error) {
    console.error('记录访客错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取访客统计（管理员）
router.get('/stats', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // 总访问量
    const totalVisits = await Visitor.count({ where: whereClause });

    // 独立访客数（按 sessionId 或 ip 去重）
    const uniqueVisitors = await Visitor.count({
      where: whereClause,
      distinct: true,
      col: 'sessionId'
    });

    // 今日访问量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = await Visitor.count({
      where: {
        ...whereClause,
        createdAt: { [Op.gte]: today }
      }
    });

    // 页面访问排行
    const pageViews = await Visitor.findAll({
      where: whereClause,
      attributes: [
        'path',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['path'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    // 每日访问趋势（最近7天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await Visitor.findAll({
      where: {
        ...whereClause,
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.literal('date'), 'ASC']]
    });

    res.json({
      totalVisits,
      uniqueVisitors,
      todayVisits,
      pageViews,
      dailyStats
    });
  } catch (error) {
    console.error('获取访客统计错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取最近访客记录（管理员）
router.get('/recent', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const visitors = await Visitor.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      attributes: ['id', 'path', 'referrer', 'country', 'city', 'createdAt']
    });

    res.json(visitors);
  } catch (error) {
    console.error('获取最近访客错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
