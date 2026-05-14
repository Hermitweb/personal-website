const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OperationLog = sequelize.define('OperationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '操作用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作用户名'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型：create/update/delete/login/logout等'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作模块：user/blog/content/message/config等'
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '操作目标ID'
  },
  targetName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '操作目标名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '操作描述'
  },
  ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: '操作IP地址'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '浏览器User-Agent'
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'HTTP方法'
  },
  path: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '请求路径'
  },
  status: {
    type: DataTypes.ENUM('success', 'fail'),
    defaultValue: 'success',
    comment: '操作状态'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '错误信息'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '操作耗时（毫秒）'
  }
}, {
  tableName: 'operation_logs',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['action'] },
    { fields: ['module'] },
    { fields: ['createdAt'] },
    { fields: ['status'] }
  ]
});

module.exports = OperationLog;
