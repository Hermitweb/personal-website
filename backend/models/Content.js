const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'custom'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  linkUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  orderNum: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  requireLogin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'contents',
  timestamps: true
});

module.exports = Content;
